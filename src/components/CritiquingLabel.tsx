import { useEffect, useState } from 'react'

// Cycles through phrases while critiques load, fading between them.
const PHRASES = ['Analyzing', 'Searching for insights', 'Gathering thoughts', 'Preparing feedback']

export default function CritiquingLabel() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % PHRASES.length), 1700)
    return () => clearInterval(t)
  }, [])
  return (
    <span key={i} className="ate-fade" style={{ minWidth: 150, textAlign: 'center' }}>
      {PHRASES[i]}
    </span>
  )
}
