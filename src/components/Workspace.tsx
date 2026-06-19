import type { CSSProperties } from 'react'
import type { Brand, Page, Palette } from '../types'
import PageFrame from './PageFrame'
import EmberLayout from './EmberLayout'
import CadenceLayout from './CadenceLayout'
import MarenLayout from './MarenLayout'

// The workspace canvas: a dotted scroll surface that centers the page frame and
// renders the active brand's layout. Pins and the comments rail come later
// (M5/M6).

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

export default function Workspace({ brand, view, pal }: { brand: Brand; view: Page; pal: Palette }) {
  return (
    <div style={workspaceStyle}>
      <div style={canvasStyle}>
        <PageFrame pal={pal} url={brand.url}>
          {brand.key === 'ember' && <EmberLayout brand={brand} view={view} />}
          {brand.key === 'cadence' && <CadenceLayout brand={brand} view={view} />}
          {brand.key === 'maren' && <MarenLayout brand={brand} view={view} />}
        </PageFrame>
      </div>
    </div>
  )
}
