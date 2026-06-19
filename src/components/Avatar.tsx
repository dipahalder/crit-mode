import type { PersonaInfo } from '../types'

// A small colored dot marking a persona (M13). Generated perspectives are not
// named people, so this is a dot, not initials.
export default function Avatar({ persona, size = 9 }: { persona: PersonaInfo; size?: number }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: persona.color, flex: '0 0 auto', display: 'inline-block' }} />
}
