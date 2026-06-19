import type { Persona, PersonaInfo } from '../types'

// The four critics (M13). `voice` is the priorities string layered onto the LLM
// system prompt; the others drive the switcher and the attribution chips.
export const PERSONAS: PersonaInfo[] = [
  { id: 'designer', name: 'Jacob', role: 'Staff product designer', initials: 'JA', color: '#4f46e5', voice: 'a staff product designer who cares about craft, hierarchy, and whether the page holds together as a brand' },
  { id: 'cd', name: 'Theo', role: 'Creative director', initials: 'TH', color: '#c2410c', voice: 'a creative director who cares about the big idea, originality, and whether the work is brave or generic' },
  { id: 'ceo', name: 'Jennifer', role: 'Founder and CEO', initials: 'JE', color: '#15803d', voice: 'a founder and CEO who cares about positioning, differentiation, and what the page says about the company' },
  { id: 'user', name: 'Sam', role: 'First-time visitor', initials: 'SA', color: '#475569', voice: 'a first-time visitor who cares about clarity and trust, and whether they instantly understand what this is' },
]

export const PERSONA_MAP = Object.fromEntries(PERSONAS.map((p) => [p.id, p])) as Record<Persona, PersonaInfo>
