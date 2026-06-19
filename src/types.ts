// Data model for Design Crit Mode (Atelier).
// Shapes follow the condensed model in CLAUDE.md; literal values come from the
// data block in design-reference/Atelier.dc.html.

export type BrandKey = 'ember' | 'cadence' | 'maren'

// All palette keys present in the prototype. The three offered in palette
// options are warmEarthy | bold | cream; cadence and maren are the brand
// defaults a page can also sit on.
export type PaletteKey = 'warmEarthy' | 'bold' | 'cream' | 'cadence' | 'maren'

// The editable fields of a page. Every dot patches exactly one of these.
// 'concept' and 'heroLayout' are the structural fields (M12): they reflow the
// layout, not just copy.
export type FieldKey = 'headline' | 'subhead' | 'cta' | 'heroImg' | 'social' | 'palette' | 'concept' | 'heroLayout'

// The page-level structural concept (M12). Drives the content framing + which
// body sections lead.
export type Concept = 'product-led' | 'ritual-led' | 'origin-led'

// The hero geometry (M12), a second structural axis independent of `concept`:
// a side-by-side split, a centered stack, or image/mock first.
export type HeroLayout = 'split' | 'centered' | 'imageFirst'

export type DotKind = 'text' | 'palette' | 'concept'

// Critic personas (M13): the same page critiqued from four points of view.
export type Persona = 'designer' | 'cd' | 'ceo' | 'user'

export interface PersonaInfo {
  id: Persona
  role: string
  color: string
  voice: string // priorities, layered onto the LLM system prompt
}

export type Screen = 'start' | 'workspace'

// A layout calls register(field) and spreads the result onto the critiqued
// element so its bounding box can be measured for pin placement (M5).
export type RegisterTarget = (field: FieldKey) => (el: HTMLElement | null) => void

// The /critique endpoint contract (M11). The server returns this for a region,
// generated live or as the static fallback. swatch is included for palette
// options so the client can render their swatches.
export interface CritiqueResponse {
  critique: string
  prompt: string
  options: Array<{ value: string; vibe: string; tag: string; swatch?: string[]; palette?: Palette }>
}

// A palette is a set of design tokens applied as CSS custom properties (M3).
export interface Palette {
  bg: string
  surface: string
  ink: string
  sub: string
  accent: string
  accentInk: string
  line: string
  hero: string
  display: string
  dispWeight: number
  dispLs: string
}

// page : { headline, subhead, cta, heroImg, social, palette, concept }
export interface Page {
  headline: string
  subhead: string
  cta: string
  heroImg: string
  social: string
  palette: PaletteKey
  concept: Concept
  heroLayout: HeroLayout
  // A dynamic, LLM-suggested palette overrides the keyed palette when set (M:
  // dynamic moods). undefined => use palettes[palette].
  paletteTokens?: Palette
}

// option : { id, value, vibe, tag, swatch? }  // swatch only for palette options
// patch (M12) carries a coordinated multi-field change for page-level (concept)
// options; element-level options omit it and patch a single field by value.
export interface Option {
  id: string
  value: string
  vibe: string
  tag: string
  swatch?: string[]
  patch?: Partial<Page>
}

// dot : { id, n, kind, region, field, critique, prompt, options }
// Pixel coordinates (top/left/popTop/popLeft) are intentionally omitted; pins
// and popovers are positioned from bounding boxes later (M5/M7).
export interface Dot {
  id: string
  n: number
  kind: DotKind
  region: string
  field: FieldKey
  critique: string
  prompt: string
  options: Option[]
  // Authored per-persona voices (M13). The base critique/prompt is the
  // designer voice; other personas resolve to it when missing.
  byPersona?: Partial<Record<Persona, { critique: string; prompt: string }>>
}

// version : { n, palette, headline, note }  // note = region that changed
export interface Version {
  n: number
  palette: PaletteKey
  paletteTokens?: Palette
  headline: string
  note: string
}

// preview : { dotId, optId, field, value, patch? } | null
export interface Preview {
  dotId: string
  optId: string
  field: FieldKey
  value: string
  patch?: Partial<Page>
}

// state : { screen, activeBrand, openDot, page, preview, resolvedDots,
//           dismissed, versions }
export interface AppState {
  screen: Screen
  activeBrand: BrandKey
  openDot: string | null
  page: Page
  preview: Preview | null
  resolvedDots: Record<string, string>
  dismissed: { tag: string }[]
  versions: Version[]
}

// --- Brand content (page sections) lifted from the prototype --------------

export interface BrandDefaults {
  headline: string
  subhead: string
  cta: string
  heroImg: string
  social: string
}

export interface HowStep {
  t: string
  d: string
}

export interface Feature {
  name: string
  meta: string
  tag: string
}

export interface Stat {
  v: string
  k: string
}

export interface FootCol {
  h: string
  links: string[]
}

export interface Brand {
  key: BrandKey
  name: string
  nameCaps?: string
  category: string
  url: string
  signup: string
  palKey: PaletteKey
  desc: string
  nav: string[]
  eyebrow: string
  ctaSecondary: string
  defaults: BrandDefaults
  proof: string[]
  howLabel: string
  how: HowStep[]
  featLabel: string
  featImg: string
  feats: Feature[]
  stats?: Stat[]
  quote: string
  quoteBy: string
  footBlurb?: string
  footCols?: FootCol[]
  footFlat?: string[]
  dots: Dot[]
}
