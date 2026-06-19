import { useEffect } from 'react'
import { brandOrder, brands } from './data/brands'

export default function App() {
  // M1 verification: log all three brands with their six dots and options.
  // Open the browser console to confirm the data model loads (see "Done when").
  useEffect(() => {
    brandOrder.forEach((key) => {
      const b = brands[key]
      console.log(
        `${b.name} (${b.category}) — ${b.dots.length} dots`,
        b.dots.map((d) => ({ n: d.n, region: d.region, field: d.field, options: d.options.length })),
      )
    })
    console.log('brands loaded:', brandOrder.map((k) => brands[k].name).join(', '))
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        background: '#f3f3f6',
        color: '#18181b',
        fontFamily: "'Manrope', -apple-system, sans-serif",
        textAlign: 'center',
        padding: 24,
      }}
    >
      <span
        style={{
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: 11,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: '#a1a1aa',
        }}
      >
        Atelier
      </span>
      <h1
        style={{
          fontFamily: "'Newsreader', serif",
          fontWeight: 500,
          fontStyle: 'italic',
          fontSize: 44,
          letterSpacing: '-0.5px',
          margin: 0,
          color: '#27272a',
        }}
      >
        Design Crit Mode
      </h1>
      <p
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: 14.5,
          color: '#52525b',
          margin: 0,
          maxWidth: 360,
        }}
      >
        React, don't describe. Scaffold is live.
      </p>
    </div>
  )
}
