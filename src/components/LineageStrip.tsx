import type { CSSProperties } from 'react'
import { palettes } from '../data/brands'
import type { Version } from '../types'
import { clean } from '../utils/clean'

// The read-only version lineage (M9), as a left bar. One 120px thumbnail per
// version stacked vertically (palette background, serif headline, version
// number, the region that changed). v1 is the starting point; the current
// (last) version has the indigo border.

const barStyle: CSSProperties = {
  flex: '0 0 auto',
  width: 150,
  borderRight: '1px solid #ececf0',
  background: '#fff',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
}

const headerStyle: CSSProperties = {
  padding: '14px 14px 12px',
  borderBottom: '1px solid #f1f1f4',
  position: 'sticky',
  top: 0,
  background: '#fff',
  zIndex: 1,
}

export default function LineageStrip({ versions }: { versions: Version[] }) {
  return (
    <div style={barStyle}>
      <div style={headerStyle}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '1px', color: '#52525b' }}>VERSION HISTORY</div>
        <div style={{ fontSize: 11, color: '#b4b4bc', marginTop: 3 }}>{clean('read-only')}</div>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0 16px' }}>
        {versions.map((v, i) => {
          const p = palettes[v.palette]
          const current = i === versions.length - 1
          return (
            <div key={v.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto' }}>
              {i > 0 && <span style={{ color: '#d4d4da', fontSize: 16, margin: '8px 0' }}>↓</span>}
              <div
                style={{
                  width: 120,
                  flex: '0 0 auto',
                  borderRadius: 9,
                  overflow: 'hidden',
                  border: current ? '2px solid #4f46e5' : '1px solid #e7e7ec',
                  boxShadow: current ? '0 4px 14px -4px rgba(79,70,229,.4)' : '0 1px 3px rgba(0,0,0,.05)',
                  background: '#fff',
                }}
              >
                <div style={{ height: 34, background: p.bg, display: 'flex', alignItems: 'center', padding: '0 9px' }}>
                  <span style={{ fontFamily: "'Newsreader', serif", fontSize: 10, fontWeight: 500, color: p.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{clean(v.headline)}</span>
                </div>
                <div style={{ height: 5, background: p.accent }} />
                <div style={{ padding: '5px 9px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#3f3f46' }}>v{v.n}</span>
                  <span style={{ fontSize: 9.5, color: '#a1a1aa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 70 }}>{clean(v.note)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
