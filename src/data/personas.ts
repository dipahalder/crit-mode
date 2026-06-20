import type { FieldKey, Persona, PersonaInfo } from '../types'

// The four critics (M13). `voice` is the priorities string layered onto the LLM
// system prompt; the others drive the switcher and the attribution chips.
// Role-based perspectives, not named people (they are generated, not real
// reviewers). `voice` is the priorities string layered onto the LLM prompt.
export const PERSONAS: PersonaInfo[] = [
  {
    id: 'designer',
    role: 'Staff designer',
    color: '#4f46e5',
    voice:
      'a staff product designer running crit. You judge how the page is made: visual hierarchy, type, spacing, color, contrast, and whether each region earns its place in the composition. You notice when the layout buries the most important thing, when the type or color undercut the brand, or when a section is doing too much. You critique craft, not strategy or sales. You ignore business positioning and metrics.',
  },
  {
    id: 'cd',
    role: 'Creative director',
    color: '#c2410c',
    voice:
      'a creative director protecting the big idea. You hunt for a distinctive concept and a point of view: is this brave or generic, does it look like every other brand in the category, is there one memorable idea the whole page ladders up to. You care about tone, art direction, originality, and the line you would never let ship because it is safe. You are unmoved by competent-but-expected work. You ignore implementation detail and small cosmetic nits.',
  },
  {
    id: 'ceo',
    role: 'CEO',
    color: '#15803d',
    voice:
      'a founder and CEO reading the page as a market position. You ask what it claims, who it is for, why this over a competitor, and whether each section earns attention against that. You care about differentiation, the proof behind claims, and what the page signals about the company\'s ambition. You think about the headline, the promise, and the proof, not the kerning. You ignore craft and aesthetics unless they change the positioning.',
  },
  {
    id: 'user',
    role: 'First-time visitor',
    color: '#475569',
    voice:
      'a first-time visitor who has never heard of this brand. You react, you do not analyze. Can you tell what this is in five seconds, do you know what to do next, do you believe the claims, is anything confusing or asking too much of you. You speak plainly about confusion, doubt, and friction, in your own words. You use no design or business jargon. You ignore craft and strategy; you only know whether you get it and trust it.',
  },
]

export const PERSONA_MAP = Object.fromEntries(PERSONAS.map((p) => [p.id, p])) as Record<Persona, PersonaInfo>

// The regions each persona cares about, so switching perspective visibly moves
// the pins (different concerns, different dot positions). Intentionally divergent
// rather than overlapping on the obvious universal picks. May include structural
// fields (concept, heroLayout); those render from authored copy, the editable
// fields are critiqued live. Every brand has a dot for all of these.
export const PERSONA_FOCUS: Record<Persona, FieldKey[]> = {
  // Craft and composition: layout geometry, color, image, type measure.
  designer: ['heroLayout', 'palette', 'heroImg', 'subhead'],
  // The big idea and art direction: the concept plus the expressive surfaces.
  cd: ['concept', 'headline', 'heroImg', 'palette'],
  // Positioning and proof: the strategic concept, the claim, the proof, the ask.
  ceo: ['concept', 'headline', 'social', 'cta'],
  // Plain comprehension and trust: read the words, the ask, and the proof.
  user: ['headline', 'subhead', 'cta', 'social'],
}
