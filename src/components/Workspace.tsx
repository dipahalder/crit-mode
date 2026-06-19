import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Brand, FieldKey, Page, Palette, RegisterTarget } from '../types'
import PageFrame from './PageFrame'
import EmberLayout from './EmberLayout'
import CadenceLayout from './CadenceLayout'
import MarenLayout from './MarenLayout'

// The workspace canvas: a dotted scroll surface that centers the page frame and
// renders the active brand's layout, plus a pin overlay anchored to each
// critiqued region by bounding box (M5).

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

// One pin, centered on its target via translate(-50%,-50%). x/y are in
// frame-local coordinates, so the pin scrolls with the page for free. No
// hardcoded coordinates: x/y are measured, not authored.
function pinStyle(x: number, y: number, pulse: boolean): CSSProperties {
  return {
    position: 'absolute',
    top: y,
    left: x,
    transform: 'translate(-50%,-50%)',
    width: 27,
    height: 27,
    borderRadius: '50%',
    background: '#4f46e5',
    color: '#fff',
    border: '2.5px solid #fff',
    fontFamily: '"Manrope", sans-serif',
    fontWeight: 800,
    fontSize: 12.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
    boxShadow: '0 2px 6px rgba(0,0,0,.32)',
    animation: pulse ? 'ate-ping 1.9s ease-out infinite' : 'none',
  }
}

interface PinPos {
  id: string
  n: number
  x: number
  y: number
  pulse: boolean
}

export default function Workspace({ brand, view, pal }: { brand: Brand; view: Page; pal: Palette }) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  // field -> critiqued element, populated by the layout via register().
  const targets = useRef(new Map<FieldKey, HTMLElement>())
  // Stable ref callback per field so element identity churns only on real
  // mount/unmount (e.g. brand switch), not on every render.
  const refCbs = useRef(new Map<FieldKey, (el: HTMLElement | null) => void>())
  const [pins, setPins] = useState<PinPos[]>([])

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

  // Measure each target's bounding box relative to the frame. Frame-local
  // coordinates are scroll-stable (frame and elements move together), so pins
  // stay glued to their regions as the canvas scrolls.
  const measure = useCallback(() => {
    const frame = frameRef.current
    if (!frame) return
    const f = frame.getBoundingClientRect()
    const next: PinPos[] = []
    for (const d of brand.dots) {
      const el = targets.current.get(d.field)
      if (!el) continue
      const r = el.getBoundingClientRect()
      next.push({
        id: d.id,
        n: d.n,
        x: r.left - f.left - frame.clientLeft + r.width / 2,
        y: r.top - f.top - frame.clientTop + r.height / 2,
        // Headline pin pulses at rest; no note can be open yet (popover is M7).
        pulse: d.id === 'headline',
      })
    }
    setPins(next)
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

    // Layout shifts: palette/font swaps, content reflow, brand height changes.
    const ro = new ResizeObserver(schedule)
    ro.observe(frame)
    ro.observe(canvas)
    window.addEventListener('resize', schedule)
    canvas.addEventListener('scroll', schedule, { passive: true })

    // Web fonts change text metrics after first paint; re-measure when ready.
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

  return (
    <div style={workspaceStyle}>
      <div ref={canvasRef} style={canvasStyle}>
        <PageFrame ref={frameRef} pal={pal} url={brand.url}>
          {brand.key === 'ember' && <EmberLayout brand={brand} view={view} register={register} />}
          {brand.key === 'cadence' && <CadenceLayout brand={brand} view={view} register={register} />}
          {brand.key === 'maren' && <MarenLayout brand={brand} view={view} register={register} />}

          {/* Pin overlay, inside the frame so pins scroll with the page. */}
          {pins.map((p) => (
            <div key={p.id} style={pinStyle(p.x, p.y, p.pulse)}>
              {p.n}
            </div>
          ))}
        </PageFrame>
      </div>
    </div>
  )
}
