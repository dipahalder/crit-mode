import Anthropic from '@anthropic-ai/sdk'
import { brands, paletteOptions } from '../src/data/brands.js'
import { PERSONA_MAP } from '../src/data/personas.js'
import { clean } from '../src/utils/clean.js'
import type { BrandKey, CritiqueResponse, FieldKey, Persona } from '../src/types.js'

// Core critique logic for Design Crit Mode (M11/M14), shared by the local Express
// proxy (server/index.ts) and the Vercel serverless function (api/critiques.ts).
// It has no HTTP framework dependency. Reliability first (CLAUDE.md guardrail 3):
// callers fall back to the static dots on any failure, so the demo never depends
// on the API succeeding. The Anthropic key stays server-side in both deployments.

export const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8'

export const BRAND_KEYS: BrandKey[] = ['ember', 'cadence', 'maren']
export const FIELD_KEYS: FieldKey[] = ['headline', 'subhead', 'cta', 'heroImg', 'social', 'palette']
const PALETTE_VALUES = paletteOptions.map((o) => o.value) // warmEarthy | bold | cream

// The Anthropic client is created lazily from the environment at call time, so a
// serverless cold start picks up ANTHROPIC_API_KEY injected by the platform.
let _client: Anthropic | null | undefined
function getClient(): Anthropic | null {
  if (_client === undefined) _client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null
  return _client
}
export function clientAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}

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

// Persona-agnostic format + quality rules for the multi-region pass. The critic's
// identity and lens come from the persona voice, NOT from here, so each
// perspective surfaces its own kind of insight rather than a generic design crit.
const CRITIQUE_RULES = `Write each critique as a taste position in your own voice, not a generic correction: one specific observation tied to THIS brand and THIS page, never personal taste. Be concise: the critique is at most two short sentences, about 25 words. The prompt is a brief call to choose, under eight words, for example "Pick a headline direction:".

Produce 2 to 3 options that are genuinely different directions, never ranked, never "the better version." Each option has a short vibe descriptor and the concrete value to apply.

Never use em dashes or en dashes. Use periods or commas. Do not use growth marketing language such as convert, CTR, or urgency. Return JSON only, no prose, no markdown fences.`

// The static dot for a region, mapped to the response contract. This is the
// FALLBACK and must always be valid. clean() scrubs em dashes (guardrail 4).
export function fallbackFor(brand: BrandKey, region: FieldKey): CritiqueResponse {
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

// --- Dynamic palette derivation (LLM suggests a few colors; we build a full,
// valid token set so any mood recolors the page correctly). -----------------

function hex(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s.toLowerCase()
  if (/^#[0-9a-fA-F]{3}$/.test(s)) return ('#' + s.slice(1).split('').map((c) => c + c).join('')).toLowerCase()
  return null
}
function toRgb(h: string): [number, number, number] {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
}
function toHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('')
}
function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = toRgb(a)
  const [br, bg, bb] = toRgb(b)
  return toHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t)
}
function luminance(h: string): number {
  const [r, g, b] = toRgb(h).map((x) => x / 255)
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
// Build a full palette token set from the model's 4 colors + display family.
function derivePalette(bg: string, ink: string, accent: string, hero: string, serif: boolean) {
  return {
    bg,
    surface: mix(bg, '#ffffff', 0.5),
    ink,
    sub: mix(ink, bg, 0.42),
    accent,
    accentInk: luminance(accent) > 0.5 ? ink : '#ffffff',
    line: mix(ink, bg, 0.82),
    hero,
    display: serif ? '"Newsreader", Georgia, serif' : '"Manrope", sans-serif',
    dispWeight: serif ? 500 : 800,
    dispLs: serif ? '-0.4px' : '-1.4px',
  }
}
// Parse the model's palette suggestions; fall back to the canonical three.
function cleanPaletteOptions(raw: unknown) {
  const out: Array<{ value: string; vibe: string; tag: string; swatch: string[]; palette: ReturnType<typeof derivePalette> }> = []
  if (Array.isArray(raw)) {
    for (const r of raw) {
      const o = r as Record<string, unknown>
      const name = typeof o.value === 'string' && o.value.trim() ? o.value.trim() : typeof o.vibe === 'string' ? o.vibe.trim() : ''
      const desc = typeof o.vibe === 'string' && o.vibe.trim() ? o.vibe.trim() : name
      const bg = hex(o.bg)
      const ink = hex(o.ink)
      const accent = hex(o.accent)
      const heroC = hex(o.hero)
      if (!name || !bg || !ink || !accent || !heroC) continue
      out.push({ value: clean(name), vibe: clean(desc), tag: clean(desc), swatch: [accent, heroC, ink], palette: derivePalette(bg, ink, accent, heroC, o.display === 'serif') })
      if (out.length >= 3) break
    }
  }
  if (out.length >= 2) return out
  // Not enough valid suggestions: keep the canonical themes (client uses static).
  return paletteOptions.map((o) => ({ value: o.value, vibe: clean(o.vibe), tag: clean(o.tag), swatch: o.swatch ?? [] }))
}

export async function generate(brand: BrandKey, region: FieldKey, pageModel: Record<string, unknown>, persona?: Persona): Promise<CritiqueResponse> {
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

  const message = await getClient()!.messages.create({
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

// --- M14: LLM-chosen critique targets -------------------------------------

// The static critiques for a brand, shaped for /critiques (the fallback).
export function staticCritiques(brand: BrandKey) {
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
export async function generateMany(brand: BrandKey, pageModel: Record<string, unknown>, persona: Persona | undefined, inventory: unknown, targets: unknown) {
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
    : 'Choose the 3 to 5 regions THIS point of view would most want to change, and skip the ones it would not care about. A different critic should land on a different set of regions and raise different concerns, so choose what is distinctive to your lens, not the obvious universal picks.'

  const system = `You are ${p.voice}

You are reviewing a whole landing page and deciding what is worth commenting on, strictly from this point of view. Different critics notice different things: raise the concerns this lens raises, in its vocabulary, and ignore what it would not care about. Do not fall back to a generic, all-purpose design critique.

${CRITIQUE_RULES}`
  const user = `Brand: ${b.name} (${b.category}).
Regions you may critique (id, kind, section, current text):
${inv.map((it) => `- ${it.id} [${it.kind}] (${it.section}): ${JSON.stringify(it.text)}`).join('\n')}
Full current page model: ${JSON.stringify(pageModel)}.

${selection}
For each chosen region write one critique, a short prompt, and 2 to 3 taste-different options.
Options for EVERY region except "palette" are shaped {"value": string, "vibe": string}.
The "palette" region is the exception and is critical: its options are color moods, NOT {value, vibe}. Each palette option MUST be shaped {"value": short mood name, "vibe": short descriptor, "bg": "#rrggbb", "ink": "#rrggbb", "accent": "#rrggbb", "hero": "#rrggbb", "display": "serif" or "sans"} with four REAL hex colors that fit THIS brand and product (botanical skincare leans greens and naturals; coffee leans warm earth tones; a productivity tool leans cooler or bolder tech tones). bg is the page background, ink the body text, accent the buttons and highlights, hero the image tint. Never emit a palette option missing any of bg, ink, accent, or hero. Example palette option: {"value":"Sage & Clay","vibe":"Soft, herbal, natural","bg":"#f7f3ec","ink":"#3a3a32","accent":"#8a9a7b","hero":"#dbcbb6","display":"serif"}.
Return JSON only: {"critiques":[{"targetId":string,"critique":string,"prompt":string,"options":[ ... ]}]}.`

  const message = await getClient()!.messages.create({ model: MODEL, max_tokens: 2048, system, messages: [{ role: 'user', content: user }] })
  const text = message.content.filter((blk): blk is Anthropic.TextBlock => blk.type === 'text').map((blk) => blk.text).join('')
  const parsed = JSON.parse(stripFences(text)) as { critiques?: unknown }
  if (!parsed || !Array.isArray(parsed.critiques)) throw new Error('no critiques array')

  const seen = new Set<string>()
  const out: Array<{ targetId: string; critique: string; prompt: string; options: unknown }> = []
  for (const raw of parsed.critiques) {
    const c = raw as Record<string, unknown>
    const targetId = c.targetId
    // Drop unknown/duplicate targets and malformed entries.
    if (typeof targetId !== 'string' || !validFields.has(targetId) || seen.has(targetId)) continue
    if (typeof c.critique !== 'string' || !c.critique.trim()) continue
    if (typeof c.prompt !== 'string' || !c.prompt.trim()) continue
    let options
    try {
      options = targetId === 'palette' ? cleanPaletteOptions(c.options) : cleanOptions(c.options, targetId as FieldKey)
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
