import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Brand, Dot, FieldKey, Option, Page, Palette, Preview, RegisterTarget, Version } from '../types'
import PageFrame from './PageFrame'
import EmberLayout from './EmberLayout'
import CadenceLayout from './CadenceLayout'
import MarenLayout from './MarenLayout'
import CommentsRail from './CommentsRail'
import Popover from './Popover'
import LineageStrip from './LineageStrip'

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

function pinStyle(x: number, y: number, open: boolean, pulse: boolean): CSSProperties {
  return {
    position: 'absolute',
    top: y,
    left: x,
    transform: 'translate(-50%,-50%)',
    width: 27,
    height: 27,
    borderRadius: '50%',
    background: open ? '#0E6FCB' : '#1684EC',
    color: '#fff',
    border: 'none',
    fontFamily: '"Manrope", sans-serif',
    fontWeight: 800,
    fontSize: 12.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    zIndex: 8,
    boxShadow: open ? '0 0 0 5px rgba(22,132,236,.22), 0 3px 8px rgba(0,0,0,.3)' : '0 2px 6px rgba(0,0,0,.32)',
    animation: !open && pulse ? 'ate-ping 1.9s ease-out infinite' : 'none',
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

export default function Workspace({
  brand,
  page,
  view,
  pal,
  openDot,
  preview,
  resolvedDots,
  versions,
  onOpenNote,
  onCloseNote,
  onPreviewOption,
  onAcceptOption,
}: {
  brand: Brand
  page: Page
  view: Page
  pal: Palette
  openDot: string | null
  preview: Preview | null
  resolvedDots: Record<string, string>
  versions: Version[]
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
    for (const d of brand.dots) {
      const el = targets.current.get(d.field)
      if (!el) continue
      const r = el.getBoundingClientRect()
      next.push({ id: d.id, n: d.n, left: r.left - c.left + sx, top: r.top - c.top + sy, w: r.width, h: r.height })
    }
    setMeasured(next)
    setFrameBounds({ left: fr.left - c.left + sx, width: fr.width })
  }, [brand])

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
      const d = brand.dots.find((x) => x.id === id)
      if (!d) return
      const el = targets.current.get(d.field)
      if (!el) return
      const c = canvas.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      const top = Math.max(0, r.top - c.top + canvas.scrollTop - 150)
      const left = Math.max(0, r.left - c.left + canvas.scrollLeft + r.width / 2 - canvas.clientWidth / 2)
      canvas.scrollTo({ top, left, behavior: 'smooth' })
    },
    [brand],
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
  const openDotData = openDot ? brand.dots.find((d) => d.id === openDot) : undefined
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

  return (
    <div style={workspaceStyle}>
      <LineageStrip versions={versions} />
      <div ref={canvasRef} style={canvasStyle}>
        <PageFrame ref={frameRef} pal={pal} url={brand.url}>
          {brand.key === 'ember' && <EmberLayout brand={brand} view={view} register={register} />}
          {brand.key === 'cadence' && <CadenceLayout brand={brand} view={view} register={register} />}
          {brand.key === 'maren' && <MarenLayout brand={brand} view={view} register={register} />}
        </PageFrame>

        {/* Pin overlay (canvas-content coords; scrolls with the page). */}
        {measured.map((m) => {
          const isOpen = openDot === m.id
          const pulse = openDot == null && m.id === 'headline'
          return (
            <button key={m.id} type="button" onClick={() => handleOpen(m.id)} style={pinStyle(m.left + m.w / 2, m.top + m.h / 2, isOpen, pulse)}>
              {m.n}
            </button>
          )
        })}

        {pop && openDotData && (
          <Popover
            dot={openDotData}
            left={pop.left}
            top={pop.top}
            currentValue={page[openDotData.field]}
            preview={preview}
            onClose={onCloseNote}
            onPreviewOption={onPreviewOption}
            onAccept={(opt) => onAcceptOption(openDotData, opt)}
          />
        )}
      </div>

      <CommentsRail brand={brand} openDot={openDot} resolvedDots={resolvedDots} onRowClick={handleOpen} />
    </div>
  )
}
