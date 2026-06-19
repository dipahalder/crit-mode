import { brandOrder, brands } from '../data/brands'
import type { BrandKey } from '../types'
import { clean } from '../utils/clean'
import BrandThumbnail from './BrandThumbnail'

// The start screen: an intro, three value props, and a grid of brand cards
// (190px thumbnail miniature + name + category). Selecting a card runs
// chooseBrand. All copy passes through clean() (guardrail 4).

const FEATURES = [
  { title: 'Promptless iteration', desc: 'React to the notes, never write a prompt.' },
  { title: 'View from various perspectives', desc: 'Toggle between different perspectives to see your designs from different angles.' },
  { title: 'Keep what works', desc: 'Try alternatives live, accept the takes you like.' },
]

export default function StartScreen({ onChoose }: { onChoose: (key: BrandKey) => void }) {
  return (
    <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 28px 64px' }}>
      <div style={{ maxWidth: 1080, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '1.6px', color: '#4f46e5' }}>DESIGN CRIT MODE</span>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: '#4f46e5', background: '#eef0ff', borderRadius: 999, padding: '3px 10px' }}>Demo</span>
        </div>
        <h1 style={{ fontSize: 46, lineHeight: 1.04, fontWeight: 800, letterSpacing: '-1.8px', margin: '0 0 16px', color: '#18181b', maxWidth: 760 }}>{clean('Sharpen your designs by reacting to them.')}</h1>
        <p style={{ fontSize: 17, lineHeight: 1.55, color: '#52525b', margin: 0, maxWidth: 620 }}>{clean('Pick one of the sample designs below to start. Suggestions are pinned right on top of your designs, in context.')}</p>

        <div style={{ borderTop: '1px solid #e4e4e9', margin: '36px 0 28px' }} />

        {/* Value props */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
          {FEATURES.map((f) => (
            <div key={f.title}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5', flex: '0 0 auto' }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: '#18181b' }}>{clean(f.title)}</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: '#71717a', margin: 0 }}>{clean(f.desc)}</p>
            </div>
          ))}
        </div>

        {/* Brand cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22, marginTop: 40 }}>
          {brandOrder.map((key) => {
            const b = brands[key]
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChoose(key)}
                style={{ textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer', background: 'none', border: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 13 }}
              >
                <div style={{ height: 190, borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e2e8', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                  <BrandThumbnail brand={key} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3px' }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.2px', color: '#27272a' }}>{clean(b.name)}</span>
                  <span style={{ fontSize: 11.5, color: '#a1a1aa', fontWeight: 500 }}>{clean(b.category)}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
