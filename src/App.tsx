import { useEffect, useRef, useState } from 'react'
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
    // Up to three options per swap.
    options: live.options.slice(0, 3).map((o, i) => ({ id: `llm-${i}`, value: o.value, vibe: o.vibe, tag: o.tag })),
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
  const [page, setPage] = useState<Page>(() => ({ ...brands.ember.defaults, palette: brands.ember.palKey, concept: 'product-led' }))
  const [openDot, setOpenDot] = useState<string | null>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [resolvedDots, setResolvedDots] = useState<Record<string, string>>({})
  const [versions, setVersions] = useState<Version[]>([])
  // Live critiques keyed by dot id, and whether a fetch round is in flight (M11).
  const [live, setLive] = useState<Record<string, CritiqueResponse>>({})
  const [loading, setLoading] = useState(false)
  // Generation counter so only the latest fetch round applies its results (keeps
  // a comment's text stable once shown, and tolerates React StrictMode).
  const genRef = useRef(0)

  // chooseBrand: reset the page to the brand's defaults + palette, reset the
  // lineage to v1, clear any open note and preview, enter the workspace.
  // switchBrand returns to the picker. (CLAUDE.md state transitions.)
  function chooseBrand(key: BrandKey) {
    const br = brands[key]
    setActiveBrand(key)
    setPage({ ...br.defaults, palette: br.palKey, concept: 'product-led' })
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
    // A page-level option carries a coordinated multi-field patch (M12); an
    // element-level option patches its single field by value.
    const newPage: Page = (opt.patch ? { ...page, ...opt.patch } : { ...page, [dot.field]: opt.value }) as Page
    const palKey: PaletteKey = dot.field === 'palette' ? (opt.value as PaletteKey) : newPage.palette
    const chosen = dot.field === 'palette' ? `${opt.vibe} palette` : dot.field === 'concept' ? `${opt.vibe} layout` : opt.value
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
    // The concept dots (M12) are curated, not LLM-generated; skip them.
    const fetchDots = brands[activeBrand].dots.filter((d) => d.field !== 'concept')
    if (fetchDots.length === 0) return
    const gen = ++genRef.current
    setLoading(true)
    const ctrl = new AbortController()
    const timer = setTimeout(async () => {
      // Fetch every region in parallel and apply the whole round at once, so all
      // comments appear together (no piecemeal popping in).
      const results = await Promise.allSettled(
        fetchDots.map(async (d) => {
          const r = await fetch('/critique', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ brand: activeBrand, region: d.field, pageModel: page }),
            signal: ctrl.signal,
          })
          if (!r.ok) throw new Error(`status ${r.status}`)
          return [d.id, (await r.json()) as CritiqueResponse] as const
        }),
      )
      if (gen !== genRef.current) return // a newer round superseded this one
      const next: Record<string, CritiqueResponse> = {}
      for (const res of results) if (res.status === 'fulfilled') next[res.value[0]] = res.value[1]
      setLive((prev) => ({ ...prev, ...next }))
      setLoading(false)
    }, 250)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [page, activeBrand, screen])

  // Full-page loading treatment only on the initial round (nothing loaded yet);
  // an Accept re-critique refreshes in place without blacking the comments out.
  const critiquing = loading && Object.keys(live).length === 0
  // Render all comments together once the round is in (none while critiquing).
  // A comment whose fetch failed simply never appears. Concept dots are curated.
  const dots = critiquing ? [] : brand.dots.filter((d) => d.field === 'concept' || live[d.id]).map((d) => mergeDot(d, live[d.id]))

  // Derived render model (guardrail 1): during a preview, render from view, not
  // the committed page, so the try-on is visible without committing. A page-level
  // preview applies its whole patch (M12).
  const view: Page = preview ? ({ ...page, ...(preview.patch ?? { [preview.field]: preview.value }) } as Page) : page
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
            critiquing={critiquing}
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
