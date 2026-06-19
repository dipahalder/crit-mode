import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
import { brands, paletteOptions } from '../src/data/brands'
import { PERSONA_MAP } from '../src/data/personas'
import { clean } from '../src/utils/clean'
import type { BrandKey, CritiqueResponse, FieldKey, Persona } from '../src/types'

// M11: the critique proxy. One endpoint, POST /critique, that generates a live
// critique with the Claude Messages API and falls back to the static dots on
// any failure (no key, API error, invalid JSON, validation). Reliability first
// (CLAUDE.md guardrail 3): the demo never depends on the API succeeding.

const PORT = Number(process.env.PORT) || 8787
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8'
const hasKey = !!process.env.ANTHROPIC_API_KEY
const client = hasKey ? new Anthropic() : null

const BRAND_KEYS: BrandKey[] = ['ember', 'cadence', 'maren']
const FIELD_KEYS: FieldKey[] = ['headline', 'subhead', 'cta', 'heroImg', 'social', 'palette']
const PALETTE_VALUES = paletteOptions.map((o) => o.value) // warmEarthy | bold | cream

// System prompt (based on CLAUDE.md, tightened for brevity).
const SYSTEM_PROMPT = `You are a staff-level product designer giving crit on a landing page region.
Write the critique as a taste position, not a correction: one specific
observation, tied to the brand's positioning or the user's moment, never to
personal taste. Bias toward composition and concept, not cosmetic nits.

Be concise. The "critique" is at most two short sentences, about 25 words total.
The "prompt" is a brief call to choose, for example "Pick a headline direction:"
or "Try a different mood:", under eight words.

Produce 2 to 3 options that are genuinely different aesthetic directions, never
ranked, never "the better version." Each option has a short vibe descriptor and
the concrete value to apply.

Never use em dashes or en dashes. Use periods or commas. Do not use growth
marketing language such as convert, CTR, or urgency. Return JSON only, no prose,
no markdown fences.`

// The static dot for a region, mapped to the response contract. This is the
// FALLBACK and must always be valid. clean() scrubs em dashes (guardrail 4).
function fallbackFor(brand: BrandKey, region: FieldKey): CritiqueResponse {
  const dot = brands[brand].dots.find((d) => d.field === region)!
  return {
    critique: clean(dot.critique),
    prompt: clean(dot.prompt),
    options: dot.options.map((o) => ({
      value: o.value,
      vibe: clean(o.vibe),
      tag: clean(o.tag),
      ...(o.swatch ? { swatch: o.swatch } : {}),
    })),
  }
}

// Strip a ```json ... ``` fence if the model added one despite instructions.
function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

// Validate the parsed model output against the region's field type. Throws on
// any mismatch so the caller falls back. Returns the cleaned, contract-shaped
// response. Palette options are forced to the canonical three (with swatches)
// since palette values must map to real themes; the model only shapes the
// critique and prompt there.
function validate(parsed: unknown, region: FieldKey): CritiqueResponse {
  if (!parsed || typeof parsed !== 'object') throw new Error('not an object')
  const p = parsed as Record<string, unknown>
  if (typeof p.critique !== 'string' || !p.critique.trim()) throw new Error('bad critique')
  if (typeof p.prompt !== 'string' || !p.prompt.trim()) throw new Error('bad prompt')
  if (!Array.isArray(p.options) || p.options.length < 2 || p.options.length > 4) throw new Error('bad options')

  const options = p.options.map((raw) => {
    const o = raw as Record<string, unknown>
    if (typeof o.value !== 'string' || !o.value.trim() || o.value.length > 300) throw new Error('bad value')
    if (typeof o.vibe !== 'string' || !o.vibe.trim()) throw new Error('bad vibe')
    if (region === 'palette' && !PALETTE_VALUES.includes(o.value as never)) throw new Error('bad palette value')
    return {
      value: o.value as string,
      vibe: clean(o.vibe as string),
      tag: clean(typeof o.tag === 'string' ? o.tag : (o.vibe as string)),
    }
  })

  return {
    critique: clean(p.critique),
    prompt: clean(p.prompt),
    // Palette options stay canonical (fixed values + swatches); text options use
    // the model's, capped at three.
    options: region === 'palette' ? paletteOptions.map((o) => ({ value: o.value, vibe: clean(o.vibe), tag: clean(o.tag), swatch: o.swatch })) : options.slice(0, 3),
  }
}

async function generate(brand: BrandKey, region: FieldKey, pageModel: Record<string, unknown>, persona?: Persona): Promise<CritiqueResponse> {
  const b = brands[brand]
  const dot = b.dots.find((d) => d.field === region)!
  const currentValue = pageModel?.[region]
  const paletteNote = region === 'palette' ? `\nThis is the color and mood region. Each option "value" must be exactly one of: ${PALETTE_VALUES.join(', ')}.` : ''

  // Persona voice (M13): layer the point of view onto the structural rules.
  const p = PERSONA_MAP[persona as Persona] ?? PERSONA_MAP.designer
  const system = `You are ${p.voice}.\n\n${SYSTEM_PROMPT}\n\nStay in this point of view and its priorities: change what you notice and how you say it, never the structure.`

  const user = `Brand: ${b.name} (${b.category}).
Region to critique: ${dot.region} (page field "${region}").
Current value: ${JSON.stringify(currentValue)}.
Full current page model: ${JSON.stringify(pageModel)}.
Persona: ${persona || 'a thoughtful founder shaping this page'}.

Critique this one region for this brand and page, then offer 2 to 3 taste-different options for it. Keep the critique to two short sentences and the prompt to a few words.${paletteNote}
Return JSON only, shaped exactly: {"critique": string, "prompt": string, "options": [{"value": string, "vibe": string, "tag": string}]}.`

  const message = await client!.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: user }],
  })

  const text = message.content
    .filter((blk): blk is Anthropic.TextBlock => blk.type === 'text')
    .map((blk) => blk.text)
    .join('')

  return validate(JSON.parse(stripFences(text)), region)
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '256kb' }))

app.post('/critique', async (req, res) => {
  const { brand, region, pageModel, persona } = req.body ?? {}

  // Validate region against the dot enum and brand against the brand enum.
  if (!BRAND_KEYS.includes(brand) || !FIELD_KEYS.includes(region)) {
    return res.status(400).json({ error: 'invalid brand or region' })
  }

  const fallback = fallbackFor(brand, region)

  // No key, or anything goes wrong: return the static dots for that region.
  if (!client) {
    console.log(`[critique] ${brand}/${region} -> fallback (no API key)`)
    return res.json({ ...fallback, source: 'fallback' })
  }
  try {
    const generated = await generate(brand, region, pageModel ?? {}, persona)
    console.log(`[critique] ${brand}/${region} -> live (Claude)`)
    return res.json({ ...generated, source: 'live' })
  } catch (err) {
    console.warn(`[critique] ${brand}/${region} -> fallback (${(err as Error).message})`)
    return res.json({ ...fallback, source: 'fallback' })
  }
})

// --- M14: LLM-chosen critique targets -------------------------------------

// The static six critiques for a brand, shaped for /critiques (the fallback).
function staticCritiques(brand: BrandKey) {
  return brands[brand].dots
    .filter((d) => d.field !== 'concept')
    .map((d) => ({
      targetId: d.field,
      critique: clean(d.critique),
      prompt: clean(d.prompt),
      options: d.options.map((o) => ({ value: o.value, vibe: clean(o.vibe), tag: clean(o.tag), ...(o.swatch ? { swatch: o.swatch } : {}) })),
    }))
}

// Validate + clean an option array against a field's editable type.
function cleanOptions(rawOptions: unknown, field: FieldKey) {
  if (!Array.isArray(rawOptions) || rawOptions.length < 2) throw new Error('bad options')
  const opts = rawOptions.map((raw) => {
    const o = raw as Record<string, unknown>
    if (typeof o.value !== 'string' || !o.value.trim() || o.value.length > 300) throw new Error('bad value')
    if (typeof o.vibe !== 'string' || !o.vibe.trim()) throw new Error('bad vibe')
    if (field === 'palette' && !PALETTE_VALUES.includes(o.value as never)) throw new Error('bad palette value')
    return { value: o.value as string, vibe: clean(o.vibe as string), tag: clean(typeof o.tag === 'string' ? o.tag : (o.vibe as string)) }
  })
  if (field === 'palette') return paletteOptions.map((o) => ({ value: o.value, vibe: clean(o.vibe), tag: clean(o.tag), swatch: o.swatch }))
  return opts.slice(0, 3)
}

// The model chooses which regions to critique (or critiques the given targets),
// never coordinates. Returns [{targetId, critique, prompt, options}].
async function generateMany(brand: BrandKey, pageModel: Record<string, unknown>, persona: Persona | undefined, inventory: unknown, targets: unknown) {
  const b = brands[brand]
  const fieldDots = b.dots.filter((d) => d.field !== 'concept')
  const validFields = new Set<string>(fieldDots.map((d) => d.field))
  const p = PERSONA_MAP[persona as Persona] ?? PERSONA_MAP.designer

  const inv = Array.isArray(inventory) && inventory.length
    ? (inventory as Array<Record<string, unknown>>)
    : fieldDots.map((d) => ({ id: d.field, kind: d.kind, section: d.region, text: String(pageModel?.[d.field] ?? '') }))

  const pinned = Array.isArray(targets) ? (targets as string[]).filter((t) => validFields.has(t)) : []
  const selection = pinned.length
    ? `Critique exactly these regions, by id: ${pinned.join(', ')}.`
    : 'Choose the 4 to 6 regions with the most leverage. Spread them across the page rather than clustering, and skip regions that are already strong.'

  const system = `You are ${p.voice}.\n\n${SYSTEM_PROMPT}\n\nYou are reviewing a whole landing page and deciding what is worth commenting on. Stay in this point of view and its priorities.`
  const user = `Brand: ${b.name} (${b.category}).
Regions you may critique (id, kind, section, current text):
${inv.map((it) => `- ${it.id} [${it.kind}] (${it.section}): ${JSON.stringify(it.text)}`).join('\n')}
Full current page model: ${JSON.stringify(pageModel)}.

${selection}
For each chosen region write one critique and 2 to 3 taste-different options. For the "palette" region, each option value must be exactly one of: ${PALETTE_VALUES.join(', ')}.
Return JSON only: {"critiques":[{"targetId":string,"critique":string,"prompt":string,"options":[{"value":string,"vibe":string,"tag":string}]}]}.`

  const message = await client!.messages.create({ model: MODEL, max_tokens: 2048, system, messages: [{ role: 'user', content: user }] })
  const text = message.content.filter((blk): blk is Anthropic.TextBlock => blk.type === 'text').map((blk) => blk.text).join('')
  const parsed = JSON.parse(stripFences(text)) as { critiques?: unknown }
  if (!parsed || !Array.isArray(parsed.critiques)) throw new Error('no critiques array')

  const seen = new Set<string>()
  const out: Array<{ targetId: string; critique: string; prompt: string; options: ReturnType<typeof cleanOptions> }> = []
  for (const raw of parsed.critiques) {
    const c = raw as Record<string, unknown>
    const targetId = c.targetId
    // Drop unknown/duplicate targets and malformed entries.
    if (typeof targetId !== 'string' || !validFields.has(targetId) || seen.has(targetId)) continue
    if (typeof c.critique !== 'string' || !c.critique.trim()) continue
    if (typeof c.prompt !== 'string' || !c.prompt.trim()) continue
    let options
    try {
      options = cleanOptions(c.options, targetId as FieldKey)
    } catch {
      continue
    }
    seen.add(targetId)
    out.push({ targetId, critique: clean(c.critique), prompt: clean(c.prompt), options })
    if (out.length >= 7) break // enforce the cap
  }
  if (out.length === 0) throw new Error('no valid critiques')
  return out
}

app.post('/critiques', async (req, res) => {
  const { brand, pageModel, persona, inventory, targets } = req.body ?? {}
  if (!BRAND_KEYS.includes(brand)) return res.status(400).json({ error: 'invalid brand' })

  if (!client) {
    console.log(`[critiques] ${brand} as ${persona ?? 'designer'} -> fallback (no API key)`)
    return res.json({ critiques: staticCritiques(brand), source: 'fallback' })
  }
  try {
    const critiques = await generateMany(brand, pageModel ?? {}, persona, inventory, targets)
    console.log(`[critiques] ${brand} as ${persona ?? 'designer'} -> live (${critiques.length}: ${critiques.map((c) => c.targetId).join(', ')})`)
    return res.json({ critiques, source: 'live' })
  } catch (err) {
    console.warn(`[critiques] ${brand} as ${persona ?? 'designer'} -> fallback (${(err as Error).message})`)
    return res.json({ critiques: staticCritiques(brand), source: 'fallback' })
  }
})

app.listen(PORT, () => {
  console.log(`[critique] proxy on http://localhost:${PORT}  (model: ${MODEL}, key: ${hasKey ? 'set' : 'MISSING, fallback only'})`)
})
