import { useState } from 'react'
import type { CSSProperties } from 'react'
import { brands, palettes } from './data/brands'
import type { BrandKey, Dot, Option, Page, PaletteKey, Preview, Screen, Version } from './types'
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

export default function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [activeBrand, setActiveBrand] = useState<BrandKey>('ember')
  const [page, setPage] = useState<Page>(() => ({ ...brands.ember.defaults, palette: brands.ember.palKey }))
  const [openDot, setOpenDot] = useState<string | null>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [resolvedDots, setResolvedDots] = useState<Record<string, string>>({})
  const [versions, setVersions] = useState<Version[]>([])

  // chooseBrand: reset the page to the brand's defaults + palette, reset the
  // lineage to v1, clear any open note and preview, enter the workspace.
  // switchBrand returns to the picker. (CLAUDE.md state transitions.)
  function chooseBrand(key: BrandKey) {
    const br = brands[key]
    setActiveBrand(key)
    setPage({ ...br.defaults, palette: br.palKey })
    setResolvedDots({})
    setVersions([{ n: 1, palette: br.palKey, headline: br.defaults.headline, note: 'Starting point' }])
    setOpenDot(null)
    setPreview(null)
    setScreen('workspace')
  }
  function switchBrand() {
    setOpenDot(null)
    setPreview(null)
    setScreen('start')
  }
  // openNote toggles the open dot and clears any preview (so try-ons never
  // carry across notes). closeNote clears both.
  function openNote(id: string) {
    setOpenDot((cur) => (cur === id ? null : id))
    setPreview(null)
  }
  function closeNote() {
    setOpenDot(null)
    setPreview(null)
  }
  // previewOption sets the try-on, or clears it when the same card is tapped
  // again.
  function previewOption(next: Preview) {
    setPreview((cur) => (cur && cur.dotId === next.dotId && cur.optId === next.optId ? null : next))
  }
  // accept commits an option: write page[field], mark the dot resolved, push a
  // version, and clear the open note + preview. (CLAUDE.md accept transition.)
  function accept(dot: Dot, opt: Option) {
    const newPage: Page = { ...page, [dot.field]: opt.value } as Page
    const palKey: PaletteKey = dot.field === 'palette' ? (opt.value as PaletteKey) : page.palette
    const chosen = dot.field === 'palette' ? `${opt.vibe} palette` : opt.value
    setPage(newPage)
    setResolvedDots((r) => ({ ...r, [dot.id]: chosen }))
    setVersions((v) => [...v, { n: v.length + 1, palette: palKey, headline: newPage.headline, note: dot.region }])
    setOpenDot(null)
    setPreview(null)
  }

  const brand = brands[activeBrand]
  // Derived render model (guardrail 1): during a preview, render from view, not
  // the committed page, so the try-on is visible without committing.
  const view: Page = preview ? ({ ...page, [preview.field]: preview.value } as Page) : page
  const pal = palettes[view.palette]

  return (
    <div style={appShell}>
      <TopBar isWorkspace={screen === 'workspace'} brandLabel={clean(`${brand.name} · ${brand.category}`)} onStartOver={switchBrand} />

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {screen === 'start' ? (
          <StartScreen onChoose={chooseBrand} />
        ) : (
          <Workspace
            brand={brand}
            page={page}
            view={view}
            pal={pal}
            openDot={openDot}
            preview={preview}
            resolvedDots={resolvedDots}
            versions={versions}
            onOpenNote={openNote}
            onCloseNote={closeNote}
            onPreviewOption={previewOption}
            onAcceptOption={accept}
          />
        )}
      </div>
    </div>
  )
}
