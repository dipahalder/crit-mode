import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { brands, palettes } from './data/brands'
import { PERSONA_MAP } from './data/personas'
import type { BrandKey, CritiqueResponse, Dot, FieldKey, Option, Page, PaletteKey, Persona, Preview, Screen, Version } from './types'
import { clean } from './utils/clean'
import TopBar from './components/TopBar'
import StartScreen from './components/StartScreen'
import Workspace from './components/Workspace'

// Inventory kinds for the editable fields (M14), sent to the LLM as context.
const INV_KIND: Record<FieldKey, string> = { headline: 'heading', subhead: 'body', cta: 'cta', heroImg: 'image', social: 'social', palette: 'section', concept: 'section' }

// One round of LLM-chosen critiques: the chosen target fields + their critiques.
// `persona` is who the round was generated for; a live critique is only used while
// it still matches the current persona, so switching personas rephrases instantly
// from authored copy and the LLM round refines it when it lands.
type Round = { source: 'live' | 'fallback'; persona: Persona; byField: Record<string, CritiqueResponse>; targets: string[] }

// The authored copy for a persona, falling back to the base (designer) voice.
function personaCopy(d: Dot, persona: Persona): { critique: string; prompt: string } {
  return d.byPersona?.[persona] ?? { critique: d.critique, prompt: d.prompt }
}

// Resolve a dot's critique/prompt/options for the current persona (M13). A live
// LLM critique (already in the persona's voice) wins; otherwise use the authored
// per-persona copy. Options never change with persona (the tool owns the
// directions); palette/concept keep their static options.
function mergeDot(d: Dot, live: CritiqueResponse | undefined, persona: Persona): Dot {
  if (live) {
    if (d.kind === 'palette' || d.kind === 'concept') return { ...d, critique: live.critique, prompt: live.prompt }
    return {
      ...d,
      critique: live.critique,
      prompt: live.prompt,
      // Up to three options per swap.
      options: live.options.slice(0, 3).map((o, i) => ({ id: `llm-${i}`, value: o.value, vibe: o.vibe, tag: o.tag })),
    }
  }
  const { critique, prompt } = personaCopy(d, persona)
  return { ...d, critique, prompt }
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
  // The LLM-chosen critique round (M14), and whether a fetch is in flight.
  const [round, setRound] = useState<Round | null>(null)
  const [loading, setLoading] = useState(false)
  const [persona, setPersona] = useState<Persona>('designer')
  // Mirror of `round` read inside the effect (to reuse the chosen targets across
  // persona/Accept refetches) without making `round` a dependency.
  const roundRef = useRef<Round | null>(null)
  // Generation counter so only the latest fetch round applies its results.
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
    roundRef.current = null // new brand: let the LLM choose fresh targets
    setRound(null)
    setScreen('workspace')
  }
  function switchBrand() {
    setOpenDot(null)
    setPreview(null)
    roundRef.current = null
    setRound(null)
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

  // M14: one round where the LLM chooses which regions to critique. On brand
  // pick it chooses fresh (different pins per design); on persona switch / Accept
  // it re-critiques the same chosen targets. On any failure the round falls back
  // to the static six. Debounced + abortable + generation-tagged.
  useEffect(() => {
    if (screen !== 'workspace') return
    const editable = brands[activeBrand].dots.filter((d) => d.field !== 'concept')
    if (editable.length === 0) return
    const inventory = editable.map((d) => ({ id: d.field, kind: INV_KIND[d.field], section: d.region, text: String(page[d.field] ?? '') }))
    const gen = ++genRef.current
    setLoading(true)
    const ctrl = new AbortController()
    const timer = setTimeout(async () => {
      const fallback: Round = { source: 'fallback', persona, byField: {}, targets: editable.map((d) => d.field) }
      let result: Round = fallback
      try {
        const r = await fetch('/critiques', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ brand: activeBrand, pageModel: page, persona, inventory, targets: roundRef.current?.targets }),
          signal: ctrl.signal,
        })
        if (!r.ok) throw new Error(`status ${r.status}`)
        const data = (await r.json()) as { source: string; critiques: Array<{ targetId: string; critique: string; prompt: string; options: CritiqueResponse['options'] }> }
        if (data.source === 'live' && Array.isArray(data.critiques) && data.critiques.length) {
          const valid = new Set<string>(editable.map((d) => d.field))
          const byField: Record<string, CritiqueResponse> = {}
          const targets: string[] = []
          for (const c of data.critiques) {
            if (!valid.has(c.targetId) || byField[c.targetId]) continue // drop unknown/duplicate
            byField[c.targetId] = { critique: c.critique, prompt: c.prompt, options: c.options }
            targets.push(c.targetId)
          }
          if (targets.length) result = { source: 'live', persona, byField, targets }
        }
      } catch {
        // server down / aborted: fall back to the static six.
      }
      if (gen !== genRef.current) return // superseded
      roundRef.current = result
      setRound(result)
      setLoading(false)
    }, 250)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [page, activeBrand, screen, persona])

  // Full-page loading treatment only on the very first round (nothing yet); a
  // persona switch or Accept re-critique refreshes in place.
  const critiquing = loading && round === null
  // Render the chosen targets plus the curated concept dot, resolved to the
  // current persona's voice (live critique wins, else authored copy).
  const dots =
    critiquing || !round
      ? []
      : brand.dots.filter((d) => d.kind === 'concept' || round.targets.includes(d.field)).map((d) => mergeDot(d, round.persona === persona ? round.byField[d.field] : undefined, persona))

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
            persona={PERSONA_MAP[persona]}
            onSetPersona={setPersona}
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
