import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { brands, palettes } from './data/brands'
import type { BrandKey, CritiqueResponse, Dot, Option, Page, PaletteKey, Preview, Screen, Version } from './types'
import { clean } from './utils/clean'
import TopBar from './components/TopBar'
import StartScreen from './components/StartScreen'
import Workspace from './components/Workspace'

// Merge a live critique over a static dot (M11). Text dots take the generated
// critique/prompt/options; palette dots keep their static options (the fixed
// themes + swatches) and only take the generated critique/prompt.
function mergeDot(d: Dot, live: CritiqueResponse | undefined): Dot {
  if (!live) return d
  if (d.kind === 'palette') return { ...d, critique: live.critique, prompt: live.prompt }
  return {
    ...d,
    critique: live.critique,
    prompt: live.prompt,
    options: live.options.map((o, i) => ({ id: `llm-${i}`, value: o.value, vibe: o.vibe, tag: o.tag })),
  }
}

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
  // Live critiques keyed by dot id, and the dots currently being fetched (M11).
  const [live, setLive] = useState<Record<string, CritiqueResponse>>({})
  const [loadingIds, setLoadingIds] = useState<string[]>([])

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
    setLive({})
    setScreen('workspace')
  }
  function switchBrand() {
    setOpenDot(null)
    setPreview(null)
    setLive({})
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

  // Fetch live critiques on brand-pick and after each Accept (page changes only
  // on those, not on preview). Debounced + abortable; on any failure the dot
  // keeps its static critique (client-side fallback, guardrail 3). The "page"
  // dependency is what makes the next round reflect the changed page.
  useEffect(() => {
    if (screen !== 'workspace') return
    const dots = brands[activeBrand].dots
    const ctrl = new AbortController()
    const timer = setTimeout(() => {
      setLoadingIds(dots.map((d) => d.id))
      dots.forEach(async (d) => {
        try {
          const r = await fetch('/critique', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ brand: activeBrand, region: d.field, pageModel: page }),
            signal: ctrl.signal,
          })
          if (!r.ok) throw new Error(`status ${r.status}`)
          const data: CritiqueResponse = await r.json()
          if (!ctrl.signal.aborted) setLive((prev) => ({ ...prev, [d.id]: data }))
        } catch {
          // server down, network error, or aborted: keep the static critique.
        } finally {
          if (!ctrl.signal.aborted) setLoadingIds((prev) => prev.filter((id) => id !== d.id))
        }
      })
    }, 250)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [page, activeBrand, screen])

  // Effective dots: static dots with any live critique merged over them.
  const dots = brand.dots.map((d) => mergeDot(d, live[d.id]))

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
            dots={dots}
            page={page}
            view={view}
            pal={pal}
            openDot={openDot}
            preview={preview}
            resolvedDots={resolvedDots}
            versions={versions}
            loadingIds={loadingIds}
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
