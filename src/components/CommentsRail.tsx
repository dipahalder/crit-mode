import type { CSSProperties } from 'react'
import type { Dot, Persona, PersonaInfo } from '../types'
import { PERSONAS } from '../data/personas'
import { clean } from '../utils/clean'
import Avatar from './Avatar'

// The 320px comments rail (M6/M13): a sticky header with a resolved/total pill,
// the persona switcher (role pills), and one row per dot ordered top-to-bottom.
// Each row reads as a viewpoint: a small colored dot + role, the region, a status
// pill, and the critique. No avatars/initials (personas are perspectives, not
// people). The switcher + counter are hidden until critiques finish loading.

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
  padding: '16px 16px 13px',
  borderBottom: '1px solid #f1f1f4',
  position: 'sticky',
  top: 0,
  background: '#fff',
  zIndex: 2,
}

const rowBase: CSSProperties = {
  padding: '13px 16px',
  cursor: 'pointer',
  borderBottom: '1px solid #f4f4f6',
  transition: 'background .12s ease',
}

const statusBase: CSSProperties = {
  fontSize: 10.5,
  fontWeight: 500,
  padding: '1px 7px',
  borderRadius: 999,
  flex: '0 0 auto',
}

const clamp2: CSSProperties = {
  fontSize: 12,
  lineHeight: 1.5,
  color: '#52525b',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  maxHeight: 36,
}

export default function CommentsRail({
  dots,
  openDot,
  resolvedDots = {},
  showComments,
  critiquing,
  persona,
  onSetPersona,
  onToggleComments,
  onRowClick,
}: {
  dots: Dot[]
  openDot: string | null
  resolvedDots?: Record<string, string>
  showComments: boolean
  critiquing: boolean
  persona: PersonaInfo
  onSetPersona: (p: Persona) => void
  onToggleComments: () => void
  onRowClick: (id: string) => void
}) {
  const rows = dots // already ordered top-to-bottom by the workspace (M14)
  const total = rows.length
  const resolvedCount = rows.filter((d) => resolvedDots[d.id]).length
  const ready = showComments && !critiquing // personas + counter appear once loaded

  return (
    <div style={railStyle}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.2px' }}>Comments</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {ready && (
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#4f46e5', background: '#eef0ff', borderRadius: 999, padding: '3px 9px' }}>
                {resolvedCount} / {total} resolved
              </span>
            )}
            <button
              type="button"
              onClick={onToggleComments}
              style={{ fontFamily: 'inherit', fontSize: 12, fontWeight: 500, color: '#52525b', background: '#fff', border: '1px solid #e4e4e9', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}
            >
              {showComments ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {!showComments ? (
          <p style={{ fontSize: 12, lineHeight: 1.5, color: '#8e8e98', margin: '8px 0 0' }}>{clean('Comments hidden. Showing the clean design.')}</p>
        ) : ready ? (
          <>
            {/* Persona switcher (M13): role pills, shown once critiques load. */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
              {PERSONAS.map((p) => {
                const active = p.id === persona.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSetPersona(p.id)}
                    style={{
                      fontFamily: 'inherit',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      borderRadius: 999,
                      padding: '6px 13px',
                      background: active ? p.color : 'transparent',
                      color: active ? '#fff' : p.color,
                      border: active ? `1px solid ${p.color}` : '1px solid #e4e4e9',
                      transition: 'background .15s ease, color .15s ease',
                    }}
                  >
                    {clean(p.role)}
                  </button>
                )
              })}
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.5, color: '#8e8e98', margin: '11px 0 0' }}>{clean(`Critique from a ${persona.role.toLowerCase()} point of view. Generated perspectives, not real reviewers.`)}</p>
          </>
        ) : null}
      </div>

      {showComments && (
        <div>
          {rows.map((d) => {
            const active = openDot === d.id
            const chosen = resolvedDots[d.id]
            const resolved = !!chosen
            return (
              <div
                key={d.id}
                className="ate-in"
                onClick={() => onRowClick(d.id)}
                style={{
                  ...rowBase,
                  borderLeft: active ? '3px solid #4f46e5' : '3px solid transparent',
                  background: active ? '#f6f6ff' : '#fff',
                  opacity: resolved && !active ? 0.78 : 1,
                }}
              >
                {/* Attribution: a small colored dot + role (a viewpoint, not a person). */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Avatar persona={persona} size={7} />
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: '#27272a' }}>{clean(persona.role)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: '#27272a', whiteSpace: 'nowrap' }}>{clean(d.region)}</span>
                  <span style={{ ...statusBase, color: resolved ? '#3f8f5f' : '#a1a1aa', border: `0.5px solid ${resolved ? '#bfe0cc' : '#e4e4e9'}` }}>{resolved ? 'Resolved' : 'Open'}</span>
                </div>
                <div style={clamp2}>{clean(d.critique)}</div>
                {resolved && (
                  <div style={{ fontSize: 11.5, marginTop: 6, display: 'flex', gap: 5, alignItems: 'baseline' }}>
                    <span style={{ color: '#3f8f5f', fontWeight: 700 }}>→</span>
                    <span style={{ color: '#52525b', fontWeight: 500, lineHeight: 1.4 }}>{clean(chosen)}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
