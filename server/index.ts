import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
import { brands, paletteOptions } from '../src/data/brands'
import { clean } from '../src/utils/clean'
import type { BrandKey, CritiqueResponse, FieldKey } from '../src/types'

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

// The system prompt from CLAUDE.md, verbatim.
const SYSTEM_PROMPT = `You are a staff-level product designer giving crit on a landing page region.
Write the critique as a taste position, not a correction. Be specific about the
element and what it is doing. Tie it to the brand's positioning or the user's
moment, never to personal taste. End on a genuine question that opens a choice,
never a command. One observation, two short sentences maximum. Bias toward the
composition and concept level, not small cosmetic nits.

Produce 2 to 4 options that are genuinely different aesthetic directions, never
ranked, never "the better version." Each option: a short vibe descriptor and the
concrete value to apply. Keep them diverse and de-dupe against tags the user has
already accepted or dismissed.

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
    // Palette options stay canonical (fixed values + swatches); text options use the model's.
    options: region === 'palette' ? paletteOptions.map((o) => ({ value: o.value, vibe: clean(o.vibe), tag: clean(o.tag), swatch: o.swatch })) : options,
  }
}

async function generate(brand: BrandKey, region: FieldKey, pageModel: Record<string, unknown>, persona?: string): Promise<CritiqueResponse> {
  const b = brands[brand]
  const dot = b.dots.find((d) => d.field === region)!
  const currentValue = pageModel?.[region]
  const paletteNote = region === 'palette' ? `\nThis is the color and mood region. Each option "value" must be exactly one of: ${PALETTE_VALUES.join(', ')}.` : ''

  const user = `Brand: ${b.name} (${b.category}).
Region to critique: ${dot.region} (page field "${region}").
Current value: ${JSON.stringify(currentValue)}.
Full current page model: ${JSON.stringify(pageModel)}.
Persona: ${persona || 'a thoughtful founder shaping this page'}.

Critique this one region for this brand and page, then offer 2 to 4 taste-different options for it.${paletteNote}
Return JSON only, shaped exactly: {"critique": string, "prompt": string, "options": [{"value": string, "vibe": string, "tag": string}]}.`

  const message = await client!.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
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

app.listen(PORT, () => {
  console.log(`[critique] proxy on http://localhost:${PORT}  (model: ${MODEL}, key: ${hasKey ? 'set' : 'MISSING, fallback only'})`)
})
