import type { PersonaInfo } from '../types'

// A round persona avatar with initials (M13).
export default function Avatar({ persona, size = 20 }: { persona: PersonaInfo; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: persona.color,
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.round(size * 0.42),
        fontWeight: 700,
        flex: '0 0 auto',
      }}
    >
      {persona.initials}
    </span>
  )
}
