import type { CSSProperties } from 'react'
import type { Brand } from '../types'
import { clean } from '../utils/clean'

// The 320px comments rail (M6): a sticky header with a resolved/total pill and
// one row per dot sorted by number (badge, region, status pill, two-line
// critique). The active row mirrors the open pin; clicking a row opens that
// dot. Resolved styling is wired here but only lights up once Accept lands (M9).

const railStyle: CSSProperties = {
  width: 320,
  flex: '0 0 320px',
  borderLeft: '1px solid #ececf0',
  background: '#fff',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
}

const headerStyle: CSSProperties = {
  padding: '18px 18px 14px',
  borderBottom: '1px solid #f1f1f4',
  position: 'sticky',
  top: 0,
  background: '#fff',
  zIndex: 2,
}

const rowBase: CSSProperties = {
  display: 'flex',
  gap: 11,
  alignItems: 'flex-start',
  padding: '13px 16px',
  cursor: 'pointer',
  borderBottom: '1px solid #f4f4f6',
  transition: 'background .12s ease',
}

const badgeBase: CSSProperties = {
  width: 23,
  height: 23,
  flex: '0 0 auto',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  marginTop: 1,
}

const statusBase: CSSProperties = {
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: '.4px',
  padding: '2px 7px',
  borderRadius: 999,
}

const clamp2: CSSProperties = {
  fontSize: 12,
  lineHeight: 1.45,
  color: '#71717a',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  maxHeight: 35,
}

export default function CommentsRail({
  brand,
  openDot,
  resolvedDots = {},
  onRowClick,
}: {
  brand: Brand
  openDot: string | null
  resolvedDots?: Record<string, string>
  onRowClick: (id: string) => void
}) {
  const rows = brand.dots.slice().sort((a, b) => a.n - b.n)
  const total = rows.length
  const resolvedCount = rows.filter((d) => resolvedDots[d.id]).length

  return (
    <div style={railStyle}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px' }}>Comments</div>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#4f46e5', background: '#eef0ff', borderRadius: 999, padding: '3px 9px' }}>
            {resolvedCount} / {total} resolved
          </span>
        </div>
        <p style={{ fontSize: 12, lineHeight: 1.5, color: '#8e8e98', margin: '6px 0 0' }}>
          {clean("Atelier's critique, pinned to the page. Click a note to open it on the design.")}
        </p>
      </div>
      <div>
        {rows.map((d) => {
          const active = openDot === d.id
          const chosen = resolvedDots[d.id]
          const resolved = !!chosen
          return (
            <div
              key={d.id}
              onClick={() => onRowClick(d.id)}
              style={{
                ...rowBase,
                borderLeft: active ? '3px solid #4f46e5' : '3px solid transparent',
                background: active ? '#f6f6ff' : '#fff',
                opacity: resolved && !active ? 0.78 : 1,
              }}
            >
              <div
                style={{
                  ...badgeBase,
                  fontSize: resolved ? 12 : 11.5,
                  background: resolved ? '#e7f3ec' : active ? '#4f46e5' : '#eef0ff',
                  color: resolved ? '#3f8f5f' : active ? '#fff' : '#4f46e5',
                }}
              >
                {resolved ? '✓' : d.n}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#27272a', whiteSpace: 'nowrap' }}>{clean(d.region)}</span>
                  <span style={{ ...statusBase, background: resolved ? '#e7f3ec' : '#f4f4f6', color: resolved ? '#3f8f5f' : '#a1a1aa' }}>
                    {resolved ? 'Resolved' : 'Open'}
                  </span>
                </div>
                <div style={clamp2}>{clean(d.critique)}</div>
                {resolved && (
                  <div style={{ fontSize: 11.5, marginTop: 6, display: 'flex', gap: 5, alignItems: 'baseline' }}>
                    <span style={{ color: '#3f8f5f', fontWeight: 700 }}>→</span>
                    <span style={{ color: '#52525b', fontWeight: 500, lineHeight: 1.4 }}>{clean(chosen)}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
