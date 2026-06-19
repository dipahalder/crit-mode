import type { CSSProperties } from 'react'
import { brands, palettes } from './data/brands'
import type { Page } from './types'
import PageFrame from './components/PageFrame'
import EmberLayout from './components/EmberLayout'

// The workspace canvas: a dotted scroll surface that centers the page frame,
// matching the canvas in Atelier.dc.html. The top app bar, pins, and rail come
// in later milestones (M4/M5/M6).
const canvasStyle: CSSProperties = {
  minHeight: '100vh',
  overflow: 'auto',
  backgroundColor: '#f3f3f6',
  backgroundImage: 'radial-gradient(#e1e1e8 1.1px,transparent 1.1px)',
  backgroundSize: '17px 17px',
  padding: '40px 40px 56px',
}

export default function App() {
  // M2 renders Ember only. The page is built from brand defaults + palette key,
  // and rendered from `view` (guardrail 1). No preview exists yet, so view=page.
  const brand = brands.ember
  const page: Page = { ...brand.defaults, palette: brand.palKey }
  const view = page
  const pal = palettes[view.palette]

  return (
    <div style={canvasStyle}>
      <PageFrame pal={pal} url={brand.url}>
        <EmberLayout brand={brand} view={view} />
      </PageFrame>
    </div>
  )
}
