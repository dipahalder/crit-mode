import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Brand, Dot, FieldKey, Option, Page, Palette, Persona, PersonaInfo, Preview, RegisterTarget, Version } from '../types'
import { clean } from '../utils/clean'
import PageFrame from './PageFrame'
import EmberLayout from './EmberLayout'
import CadenceLayout from './CadenceLayout'
import MarenLayout from './MarenLayout'
import CommentsRail from './CommentsRail'
import Popover from './Popover'
import LineageStrip from './LineageStrip'
import CritiquingLabel from './CritiquingLabel'

// The workspace: a dotted scroll canvas that centers the page frame and renders
// the active brand's layout, a pin overlay anchored to each critiqued region by
// bounding box (M5), the critique popover (M7), and the comments rail (M6).
// Pins and popover are measured in canvas-content coordinates, so they scroll
// with the page and the popover can float past the frame's clipped edge.

const workspaceStyle: CSSProperties = { flex: 1, minHeight: 0, display: 'flex' }

const canvasStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflow: 'auto',
  position: 'relative',
  backgroundColor: '#f3f3f6',
  backgroundImage: 'radial-gradient(#e1e1e8 1.1px,transparent 1.1px)',
  backgroundSize: '17px 17px',
  padding: '40px 40px 56px',
}

const POP_WIDTH = 334
const POP_GAP = 14

function pinStyle(x: number, y: number, open: boolean): CSSProperties {
  return {
    position: 'absolute',
    top: y,
    left: x,
    transform: 'translate(-50%,-50%)',
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: open ? '#0E6FCB' : '#1684EC',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    zIndex: 8,
    boxShadow: open ? '0 0 0 5px rgba(22,132,236,.22), 0 3px 8px rgba(0,0,0,.3)' : '0 2px 6px rgba(0,0,0,.32)',
    // Pins bounce in, then pulse at rest; the open pin shows the solid ring.
    animation: open ? 'none' : 'ate-pin-in .4s cubic-bezier(.2,.9,.3,1.3) both, ate-ping 1.9s ease-out infinite',
    transition: 'background .15s ease, box-shadow .15s ease',
  }
}

// A target's box in canvas-content coordinates.
interface Measured {
  id: string
  n: number
  left: number
  top: number
  w: number
  h: number
}

// Push apart pins that would overlap, keeping them near their element (M14).
const MIN_GAP = 26
function nudgePins(items: { id: string; x: number; y: number }[]) {
  const placed: { id: string; x: number; y: number }[] = []
  for (const it of [...items].sort((a, b) => a.y - b.y)) {
    let y = it.y
    for (let guard = 0; guard < 30; guard++) {
      let bumped = false
      for (const q of placed) {
        const dx = it.x - q.x
        const dy = y - q.y
        if (Math.hypot(dx, dy) < MIN_GAP) {
          y = q.y + Math.sqrt(Math.max(1, MIN_GAP * MIN_GAP - dx * dx))
          bumped = true
        }
      }
      if (!bumped) break
    }
    placed.push({ id: it.id, x: it.x, y })
  }
  return placed
}

export default function Workspace({
  brand,
  dots,
  page,
  view,
  pal,
  openDot,
  preview,
  resolvedDots,
  versions,
  critiquing,
  personaSwitching,
  liveState,
  persona,
  onSetPersona,
  onOpenNote,
  onCloseNote,
  onPreviewOption,
  onAcceptOption,
}: {
  brand: Brand
  dots: Dot[]
  page: Page
  view: Page
  pal: Palette
  openDot: string | null
  preview: Preview | null
  resolvedDots: Record<string, string>
  versions: Version[]
  critiquing: boolean
  personaSwitching: boolean
  liveState: 'live' | 'loading' | 'static'
  persona: PersonaInfo
  onSetPersona: (p: Persona) => void
  onOpenNote: (id: string) => void
  onCloseNote: () => void
  onPreviewOption: (next: Preview) => void
  onAcceptOption: (dot: Dot, opt: Option) => void
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const targets = useRef(new Map<FieldKey, HTMLElement>())
  const refCbs = useRef(new Map<FieldKey, (el: HTMLElement | null) => void>())
  const [measured, setMeasured] = useState<Measured[]>([])
  const [frameBounds, setFrameBounds] = useState<{ left: number; width: number } | null>(null)
  // Frozen rail row order (ids top-to-bottom); only updated when not previewing.
  const [railOrder, setRailOrder] = useState<string[]>([])
  // Hide-comments toggle (top of the rail): hides pins, popover, and rows.
  const [showComments, setShowComments] = useState(true)
  const toggleComments = useCallback(() => {
    setShowComments((s) => {
      if (s) onCloseNote() // hiding: close any open note
      return !s
    })
  }, [onCloseNote])

  const register = useCallback<RegisterTarget>((field) => {
    let cb = refCbs.current.get(field)
    if (!cb) {
      cb = (el) => {
        if (el) targets.current.set(field, el)
        else targets.current.delete(field)
      }
      refCbs.current.set(field, cb)
    }
    return cb
  }, [])

  // Measure every target's box in canvas-content coordinates (so positions are
  // scroll-stable). Recomputed on resize/scroll/font-load below.
  const measure = useCallback(() => {
    const canvas = canvasRef.current
    const frame = frameRef.current
    if (!canvas || !frame) return
    const c = canvas.getBoundingClientRect()
    const sx = canvas.scrollLeft
    const sy = canvas.scrollTop
    const fr = frame.getBoundingClientRect()
    const next: Measured[] = []
    for (const d of dots) {
      const el = targets.current.get(d.field)
      if (!el) continue
      const r = el.getBoundingClientRect()
      next.push({ id: d.id, n: d.n, left: r.left - c.left + sx, top: r.top - c.top + sy, w: r.width, h: r.height })
    }
    setMeasured(next)
    setFrameBounds({ left: fr.left - c.left + sx, width: fr.width })
  }, [dots])

  useLayoutEffect(() => {
    measure()
    const frame = frameRef.current
    const canvas = canvasRef.current
    if (!frame || !canvas) return

    let raf = 0
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }

    const ro = new ResizeObserver(schedule)
    ro.observe(frame)
    ro.observe(canvas)
    window.addEventListener('resize', schedule)
    canvas.addEventListener('scroll', schedule, { passive: true })

    let cancelled = false
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) schedule()
      })
    }

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', schedule)
      canvas.removeEventListener('scroll', schedule)
    }
  }, [measure])

  // Scroll the canvas to bring a dot's region into view (~150px from the top,
  // horizontally centered), mirroring the prototype's scrollToDot.
  const scrollToDot = useCallback(
    (id: string) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const d = dots.find((x) => x.id === id)
      if (!d) return
      const el = targets.current.get(d.field)
      if (!el) return
      const c = canvas.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      const top = Math.max(0, r.top - c.top + canvas.scrollTop - 150)
      const left = Math.max(0, r.left - c.left + canvas.scrollLeft + r.width / 2 - canvas.clientWidth / 2)
      canvas.scrollTo({ top, left, behavior: 'smooth' })
    },
    [dots],
  )

  // Open/toggle a note from a pin or a rail row; scroll to it when opening.
  const handleOpen = useCallback(
    (id: string) => {
      const willOpen = openDot !== id
      onOpenNote(id)
      if (willOpen) scrollToDot(id)
    },
    [openDot, onOpenNote, scrollToDot],
  )

  // Popover placement (M7): open opposite the element so it stays visible.
  // Left-ish element opens right, right-ish opens left, centered opens below.
  const openMeasured = openDot ? measured.find((m) => m.id === openDot) : undefined
  const openDotData = openDot ? dots.find((d) => d.id === openDot) : undefined
  let pop: { left: number; top: number } | null = null
  if (openMeasured && frameBounds) {
    const cx = openMeasured.left + openMeasured.w / 2
    const frac = (cx - frameBounds.left) / frameBounds.width
    let left: number
    let top: number
    if (frac < 0.42) {
      left = openMeasured.left + openMeasured.w + POP_GAP
      top = openMeasured.top
    } else if (frac > 0.58) {
      left = openMeasured.left - POP_WIDTH - POP_GAP
      top = openMeasured.top
    } else {
      left = cx - POP_WIDTH / 2
      top = openMeasured.top + openMeasured.h + POP_GAP
    }
    pop = { left: Math.max(8, left), top: Math.max(8, top) }
  }

  // Pin positions with overlaps nudged apart. Pins are anchored to their element
  // so they track the page during a preview.
  const pinPositions = nudgePins(measured.map((m) => ({ id: m.id, x: m.left + m.w / 2, y: m.top + m.h / 2 })))

  // Rail rows are ordered top-to-bottom by where each pin sits (M14), but the
  // order is FROZEN while a preview is active so trying on an option (which can
  // reflow the page) doesn't reshuffle the comment list under the user.
  useLayoutEffect(() => {
    if (preview) return
    const order = [...measured].sort((a, b) => a.top - b.top).map((m) => m.id)
    setRailOrder((prev) => (prev.length === order.length && prev.every((id, i) => id === order[i]) ? prev : order))
  }, [measured, preview])
  const orderIndex = new Map(railOrder.map((id, i) => [id, i]))
  const railDots = [...dots].sort((a, b) => (orderIndex.get(a.id) ?? 1e9) - (orderIndex.get(b.id) ?? 1e9))

  return (
    <div style={workspaceStyle}>
      <LineageStrip versions={versions} />
      <div style={{ flex: 1, minWidth: 0, position: 'relative', display: 'flex' }}>
        <div ref={canvasRef} style={canvasStyle}>
        <PageFrame ref={frameRef} pal={pal} url={brand.url} loading={critiquing || personaSwitching}>
          {brand.key === 'ember' && <EmberLayout brand={brand} view={view} register={register} />}
          {brand.key === 'cadence' && <CadenceLayout brand={brand} view={view} register={register} />}
          {brand.key === 'maren' && <MarenLayout brand={brand} view={view} register={register} />}
        </PageFrame>

        {/* Pin overlay (canvas-content coords; scrolls with the page). Resolved
            dots drop their pin — the design stays clean once a note is done. */}
        {showComments &&
          pinPositions
            .filter((p) => !resolvedDots[p.id])
            .map((p) => (
              <button key={p.id} type="button" aria-label="Open critique" onClick={() => handleOpen(p.id)} style={pinStyle(p.x, p.y, openDot === p.id)} />
            ))}

        {showComments && pop && openDotData && (
          <Popover
            dot={openDotData}
            left={pop.left}
            top={pop.top}
            currentValue={page[openDotData.field]}
            preview={preview}
            persona={persona}
            onClose={onCloseNote}
            onPreviewOption={onPreviewOption}
            onAccept={(opt) => onAcceptOption(openDotData, opt)}
          />
        )}
        </div>

        {/* Loading card floats over the dimmed design on the first round and when
            switching perspective (which reloads the comments from scratch). */}
        {(critiquing || personaSwitching) && (
          <div className="ate-fade" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: '1px solid #e6e6ec', borderRadius: 999, padding: '12px 22px', boxShadow: '0 18px 50px -16px rgba(20,16,30,.3)', fontSize: 14, fontWeight: 600, color: '#4f46e5', animation: 'ate-pop .32s cubic-bezier(.2,.9,.3,1.3) both' }}>
              {personaSwitching ? <span>{clean(`Preparing crit as a ${persona.role.toLowerCase()}`)}</span> : <CritiquingLabel />}
              <span style={{ display: 'inline-flex', gap: 3 }}>
                {[0, 0.16, 0.32].map((d) => (
                  <span key={d} style={{ width: 5, height: 5, borderRadius: '50%', background: '#4f46e5', animation: 'ate-blink 1.2s ease-in-out infinite', animationDelay: `${d}s` }} />
                ))}
              </span>
            </div>
          </div>
        )}
      </div>

      <CommentsRail dots={railDots} openDot={openDot} resolvedDots={resolvedDots} showComments={showComments} critiquing={critiquing} liveState={liveState} persona={persona} onSetPersona={onSetPersona} onToggleComments={toggleComments} onRowClick={handleOpen} />
    </div>
  )
}
