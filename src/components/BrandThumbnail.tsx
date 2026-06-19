import type { BrandKey } from '../types'

// Bespoke 190px-tall page miniatures for the start-screen brand cards, lifted
// from the start-screen previews in Atelier.dc.html. These are hand-crafted
// minis (not scaled-down full pages), each evoking its brand's layout and
// palette. Copy here is decorative and contains no em dashes.

function EmberThumb() {
  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden', background: '#f3e9dc', display: 'flex' }}>
      <div style={{ flex: 1.1, padding: '16px 14px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: "'Newsreader', serif", fontWeight: 600, fontSize: 14, color: '#2a1c12' }}>Ember</span>
        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontFamily: "'Newsreader', serif", fontWeight: 500, fontSize: 21, lineHeight: 1.05, color: '#2a1c12', letterSpacing: '-0.4px' }}>
            Coffee,<br />delivered.
          </div>
          <div style={{ display: 'inline-block', marginTop: 10, fontSize: 9, fontWeight: 700, color: '#fbf6ee', background: '#a9521f', padding: '5px 10px', borderRadius: 6 }}>Subscribe</div>
        </div>
      </div>
      <div style={{ flex: 0.9, background: '#e7d2b8', backgroundImage: 'repeating-linear-gradient(135deg,rgba(0,0,0,.05) 0 9px,transparent 9px 18px)' }} />
    </div>
  )
}

function CadenceThumb() {
  return (
    <div
      style={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(130% 130% at 12% 8%,#7b78ff 0%,#635bff 32%,#3b2f8f 72%,#1e1747 100%)',
        padding: '16px 14px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <span style={{ fontWeight: 800, fontSize: 14, color: '#fff', letterSpacing: '-0.3px' }}>Cadence</span>
      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontWeight: 800, fontSize: 20, lineHeight: 1.05, color: '#fff', letterSpacing: '-1px' }}>
          Plan less.<br />Do more.
        </div>
      </div>
      <div style={{ position: 'absolute', right: -26, bottom: 14, width: 118, height: 84, background: '#fff', borderRadius: 9, boxShadow: '0 12px 30px -8px rgba(0,0,0,.45)', padding: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ height: 6, width: 46, background: '#e7e9f2', borderRadius: 3 }} />
        <div style={{ height: 9, width: '80%', background: '#635bff', borderRadius: 3, opacity: 0.85 }} />
        <div style={{ height: 9, width: '60%', background: '#c7c9f7', borderRadius: 3 }} />
        <div style={{ height: 9, width: '72%', background: '#e7e9f2', borderRadius: 3 }} />
      </div>
    </div>
  )
}

function MarenThumb() {
  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden', background: '#f1efe8', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 14px 0' }}>
      <span style={{ fontFamily: "'Newsreader', serif", fontWeight: 600, fontSize: 13, color: '#27261f', letterSpacing: '1px' }}>MAREN</span>
      <div style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: 17, lineHeight: 1.14, color: '#27261f', textAlign: 'center', marginTop: 13, letterSpacing: '-0.3px' }}>
        Skincare,<br />quietly effective.
      </div>
      <div style={{ fontSize: 9, color: '#46503a', borderBottom: '1px solid #46503a', paddingBottom: 2, marginTop: 8, fontWeight: 600 }}>Build your routine</div>
      <div style={{ marginTop: 'auto', width: '100%', height: 34, background: '#e3e6d8', backgroundImage: 'repeating-linear-gradient(135deg,rgba(0,0,0,.045) 0 9px,transparent 9px 18px)' }} />
    </div>
  )
}

export default function BrandThumbnail({ brand }: { brand: BrandKey }) {
  if (brand === 'ember') return <EmberThumb />
  if (brand === 'cadence') return <CadenceThumb />
  return <MarenThumb />
}
