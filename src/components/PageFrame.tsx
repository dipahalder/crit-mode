import type { CSSProperties, ReactNode } from 'react'
import type { Palette } from '../types'
import { clean } from '../utils/clean'

// React.CSSProperties does not allow custom properties, so widen with a
// template-literal index for the --token vars the page frame exposes.
type StyleWithVars = CSSProperties & Record<`--${string}`, string | number>

// The page frame: 920px, radius 13px, frame shadow, and the palette applied as
// CSS custom properties so the layout below can read var(--bg), var(--ink), etc.
// (matches pageStyle in Atelier.dc.html). Full palette switching is M3.
function frameStyle(pal: Palette): StyleWithVars {
  return {
    '--bg': pal.bg,
    '--surface': pal.surface,
    '--ink': pal.ink,
    '--sub': pal.sub,
    '--accent': pal.accent,
    '--accentInk': pal.accentInk,
    '--line': pal.line,
    '--hero': pal.hero,
    '--display': pal.display,
    '--dispWeight': pal.dispWeight,
    '--dispLs': pal.dispLs,
    position: 'relative',
    width: '920px',
    margin: '0 auto',
    background: pal.bg,
    color: pal.ink,
    borderRadius: '13px',
    border: '1px solid rgba(0,0,0,0.09)',
    boxShadow: '0 22px 60px -20px rgba(20,16,10,0.32)',
    overflow: 'hidden',
    fontFamily: '"Manrope", sans-serif',
    transition: 'background .45s ease, color .45s ease',
  }
}

const chromeDot = (background: string): CSSProperties => ({
  width: 11,
  height: 11,
  borderRadius: '50%',
  background,
})

export default function PageFrame({
  pal,
  url,
  children,
}: {
  pal: Palette
  url: string
  children: ReactNode
}) {
  return (
    <div style={frameStyle(pal)}>
      {/* Browser-chrome bar: three dots + a centered URL pill. */}
      <div
        style={{
          height: 38,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '0 14px',
          background: 'rgba(0,0,0,.04)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <span style={chromeDot('rgba(0,0,0,.13)')} />
        <span style={chromeDot('rgba(0,0,0,.1)')} />
        <span style={chromeDot('rgba(0,0,0,.08)')} />
        <div
          style={{
            margin: '0 auto',
            fontSize: 11.5,
            fontFamily: "'Manrope', sans-serif",
            color: 'var(--sub)',
            background: 'rgba(0,0,0,.05)',
            borderRadius: 6,
            padding: '3px 30px',
          }}
        >
          {clean(url)}
        </div>
      </div>
      {children}
    </div>
  )
}
