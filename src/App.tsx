import { useState } from 'react'
import type { CSSProperties } from 'react'
import { brands, palettes } from './data/brands'
import type { Page, PaletteKey } from './types'
import PageFrame from './components/PageFrame'
import EmberLayout from './components/EmberLayout'

// The workspace canvas: a dotted scroll surface that centers the page frame,
// matching the canvas in Atelier.dc.html. The top app bar, pins, and rail come
// in later milestones (M4/M5/M6).
const canvasStyle: CSSProperties = {
  minHeight: '100vh',
  overflow: 'auto',
  backgroundColor: '#f3f3f6',
  backgroundImage: 'radial-gradient(#e1e1e8 1.1px,transparent 1.1px)',
  backgroundSize: '17px 17px',
  padding: '40px 40px 56px',
}

// The three color/mood fan-out options (README line 206). The real way to set
// these arrives with the palette pin (M8 preview / M9 accept); this switcher is
// a temporary M3 verification affordance for watching the frame recolor.
const SWITCHER_KEYS: PaletteKey[] = ['warmEarthy', 'bold', 'cream']

export default function App() {
  const brand = brands.ember
  const [palette, setPalette] = useState<PaletteKey>(brand.palKey)

  // Page-as-data (guardrail 1): build the page from defaults + the chosen
  // palette, render from `view`. No preview yet, so view = page.
  const page: Page = { ...brand.defaults, palette }
  const view = page
  const pal = palettes[view.palette]

  return (
    <div style={canvasStyle}>
      <PageFrame pal={pal} url={brand.url}>
        <EmberLayout brand={brand} view={view} />
      </PageFrame>

      {/* TEMPORARY (M3 check): switch page.palette to watch the recolor. */}
      <div
        style={{
          position: 'fixed',
          left: 16,
          bottom: 16,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#fff',
          border: '1px solid #e4e4e9',
          borderRadius: 10,
          padding: '8px 10px',
          boxShadow: '0 4px 14px -6px rgba(0,0,0,.3)',
          fontFamily: "'Manrope', sans-serif",
        }}
      >
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.5px', color: '#a1a1aa', textTransform: 'uppercase', marginRight: 2 }}>
          Palette (M3)
        </span>
        {SWITCHER_KEYS.map((k) => {
          const active = page.palette === k
          return (
            <button
              key={k}
              type="button"
              onClick={() => setPalette(k)}
              aria-pressed={active}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                color: active ? '#fff' : '#52525b',
                background: active ? '#4f46e5' : '#fff',
                border: `1px solid ${active ? '#4f46e5' : '#e4e4e9'}`,
                borderRadius: 8,
                padding: '6px 10px',
              }}
            >
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: palettes[k].accent, border: '1px solid rgba(0,0,0,.15)' }} />
              {k}
            </button>
          )
        })}
      </div>
    </div>
  )
}
