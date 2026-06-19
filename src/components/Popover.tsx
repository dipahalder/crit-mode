import type { CSSProperties } from 'react'
import type { Dot, Preview } from '../types'
import { clean } from '../utils/clean'

// The critique popover (M7) plus the fan-out and live try-on (M8): header (pin
// chip + region + close), critique, prompt, a "trying it on" banner while a
// preview is active, the option cards, and a footer hint. Tapping a card
// previews it live; the Accept button is M9. Positioned by the caller from the
// target's bounding box, rendered in the canvas so it can float past the frame.

const cardBase: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  background: '#fff',
  border: '1px solid #ececef',
  borderRadius: 10,
  padding: '10px 11px',
  transition: 'border-color .15s ease, background .15s ease',
}

export default function Popover({
  dot,
  left,
  top,
  currentValue,
  preview,
  onClose,
  onPreviewOption,
}: {
  dot: Dot
  left: number
  top: number
  currentValue: string
  preview: Preview | null
  onClose: () => void
  onPreviewOption: (next: Preview) => void
}) {
  const isPalette = dot.kind === 'palette'
  const previewingThisDot = !!(preview && preview.dotId === dot.id)

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

      {previewingThisDot && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#eef0ff', border: '1px solid #e0e2ff', borderRadius: 8, padding: '7px 10px', marginBottom: 9, fontSize: 11, color: '#4338ca', fontWeight: 600 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4f46e5', flex: '0 0 auto' }} />
          {clean('Trying it on live — Accept to keep, or close to revert.')}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {dot.options.map((opt) => {
          const isCurrent = currentValue === opt.value
          const isPreviewing = !!(preview && preview.dotId === dot.id && preview.optId === opt.id)
          const clickable = !isCurrent
          return (
            <div
              key={opt.id}
              onClick={clickable ? () => onPreviewOption({ dotId: dot.id, optId: opt.id, field: dot.field, value: opt.value }) : undefined}
              style={{
                ...cardBase,
                cursor: clickable ? 'pointer' : 'default',
                background: isPreviewing ? '#eef0ff' : isCurrent ? '#f6f5ff' : '#fff',
                borderColor: isPreviewing ? '#9aa0f5' : isCurrent ? '#dcdcff' : '#ececef',
              }}
            >
              {isPalette ? (
                <>
                  <div style={{ display: 'flex', gap: 5, flex: '0 0 auto' }}>
                    {(opt.swatch ?? []).map((sw, i) => (
                      <span key={i} style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid rgba(0,0,0,.08)', background: sw }} />
                    ))}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: '#18181b' }}>{clean(opt.vibe)}</div>
                </>
              ) : (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.35, color: '#18181b' }}>{clean(opt.value)}</div>
                  <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 3 }}>{clean(opt.vibe)}</div>
                </div>
              )}
              {isCurrent && <span style={{ fontSize: 10.5, fontWeight: 700, color: '#a1a1aa', flex: '0 0 auto' }}>Current</span>}
              {isPreviewing && <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.4px', color: '#4338ca', flex: '0 0 auto' }}>PREVIEWING</span>}
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 11, color: '#c4c4cc', marginTop: 11 }}>{clean('Tap an option to try it on live. Accept to keep it.')}</div>
    </div>
  )
}
