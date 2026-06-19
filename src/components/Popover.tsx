import type { Dot } from '../types'
import { clean } from '../utils/clean'

// The critique popover (M7): 334px, header (pin chip + region + close),
// critique, prompt, and a footer hint. Option cards and the preview banner are
// M8. Positioned by the caller from the target's bounding box; rendered in the
// canvas so it can float past the frame edge without being clipped.

export default function Popover({
  dot,
  left,
  top,
  onClose,
}: {
  dot: Dot
  left: number
  top: number
  onClose: () => void
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        width: 334,
        zIndex: 9,
        background: '#fff',
        border: '1px solid #e6e6ec',
        borderRadius: 14,
        padding: '15px 15px 14px',
        boxShadow: '0 24px 60px -16px rgba(20,16,30,0.34), 0 2px 8px rgba(0,0,0,0.08)',
        animation: 'ate-pop .2s cubic-bezier(.2,.8,.2,1)',
        fontFamily: '"Manrope", sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '1px', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 17, height: 17, borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>{dot.n}</span>
          {clean(dot.region)}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{ fontFamily: 'inherit', width: 24, height: 24, borderRadius: 6, border: 'none', background: '#f4f4f6', color: '#71717a', fontSize: 15, lineHeight: 1, cursor: 'pointer' }}
        >
          ×
        </button>
      </div>
      <p style={{ fontSize: 14.5, lineHeight: 1.5, color: '#27272a', margin: '0 0 4px', fontWeight: 500 }}>{clean(dot.critique)}</p>
      <div style={{ fontSize: 11.5, color: '#a1a1aa', margin: '12px 0 9px', fontWeight: 600 }}>{clean(dot.prompt)}</div>
      <div style={{ fontSize: 11, color: '#c4c4cc', marginTop: 11 }}>{clean('Tap an option to try it on live. Accept to keep it.')}</div>
    </div>
  )
}
