import { useState } from 'react'
import type { CSSProperties } from 'react'
import { brands, palettes } from './data/brands'
import type { BrandKey, Page, PaletteKey, Screen } from './types'
import { clean } from './utils/clean'
import TopBar from './components/TopBar'
import StartScreen from './components/StartScreen'
import Workspace from './components/Workspace'

// App shell from Atelier.dc.html: a full-height column with the top bar above a
// content area that shows either the start-screen picker or the workspace.
const appShell: CSSProperties = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: '#f3f3f6',
  fontFamily: "'Manrope', -apple-system, sans-serif",
  color: '#18181b',
  overflow: 'hidden',
}

// The three color/mood fan-out options (README line 206). Real palette changing
// arrives with the palette pin (M8/M9); this switcher is a temporary M3
// verification affordance, shown only in the workspace.
const SWITCHER_KEYS: PaletteKey[] = ['warmEarthy', 'bold', 'cream']

export default function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [activeBrand, setActiveBrand] = useState<BrandKey>('ember')
  const [page, setPage] = useState<Page>(() => ({ ...brands.ember.defaults, palette: brands.ember.palKey }))
  const [openDot, setOpenDot] = useState<string | null>(null)

  // chooseBrand: reset the page to the brand's defaults + palette, enter the
  // workspace, clear any open note (versions/lineage reset is wired in M9).
  // switchBrand returns to the picker. (CLAUDE.md state transitions.)
  function chooseBrand(key: BrandKey) {
    setActiveBrand(key)
    setPage({ ...brands[key].defaults, palette: brands[key].palKey })
    setOpenDot(null)
    setScreen('workspace')
  }
  function switchBrand() {
    setOpenDot(null)
    setScreen('start')
  }
  // openNote toggles the open dot (preview clearing is wired in M8).
  function openNote(id: string) {
    setOpenDot((cur) => (cur === id ? null : id))
  }
  function closeNote() {
    setOpenDot(null)
  }

  const brand = brands[activeBrand]
  const view = page // no preview yet (M8); page-as-data render (guardrail 1)
  const pal = palettes[view.palette]

  return (
    <div style={appShell}>
      <TopBar isWorkspace={screen === 'workspace'} brandLabel={clean(`${brand.name} · ${brand.category}`)} onStartOver={switchBrand} />

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {screen === 'start' ? (
          <StartScreen onChoose={chooseBrand} />
        ) : (
          <Workspace brand={brand} view={view} pal={pal} openDot={openDot} onOpenNote={openNote} onCloseNote={closeNote} />
        )}
      </div>

      {/* TEMPORARY (M3 check): switch page.palette to watch the recolor. */}
      {screen === 'workspace' && (
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
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.5px', color: '#a1a1aa', textTransform: 'uppercase', marginRight: 2 }}>Palette (M3)</span>
          {SWITCHER_KEYS.map((k) => {
            const active = page.palette === k
            return (
              <button
                key={k}
                type="button"
                onClick={() => setPage((p) => ({ ...p, palette: k }))}
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
      )}
    </div>
  )
}
