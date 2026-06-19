import { brandOrder, brands } from '../data/brands'
import type { BrandKey } from '../types'
import { clean } from '../utils/clean'
import BrandThumbnail from './BrandThumbnail'

// The "React, don't describe." picker (start screen) from Atelier.dc.html:
// eyebrow, H1, subhead, and a three-column grid of brand cards (190px
// thumbnail miniature + name + category). Selecting a card runs chooseBrand.
// The subhead contains an em dash in the prototype, scrubbed via clean()
// (guardrail 4 + M4 done-when).

// Subhead split around the inline <i>reacting</i>, so each text run is scrubbed.
const SUBHEAD_LEAD = clean("Three brands, three completely different landing pages. Pick one to critique — you'll shape it by ")
const SUBHEAD_TAIL = clean(' to what you see, never by writing prompts.')
const FOOTNOTE = clean('No copy to write, no settings to fill in. Design Crit Mode pins its critique to the page, and you accept the takes you like.')

export default function StartScreen({ onChoose }: { onChoose: (key: BrandKey) => void }) {
  return (
    <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 28px 64px' }}>
      <div style={{ maxWidth: 1080, width: '100%' }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '1.6px', color: '#4f46e5', marginBottom: 16 }}>DESIGN CRIT MODE</div>
        <h1 style={{ fontSize: 46, lineHeight: 1.02, fontWeight: 800, letterSpacing: '-1.8px', margin: '0 0 16px', maxWidth: 660 }}>React, don't describe.</h1>
        <p style={{ fontSize: 17, lineHeight: 1.55, color: '#52525b', margin: 0, maxWidth: 600 }}>
          {SUBHEAD_LEAD}
          <i>reacting</i>
          {SUBHEAD_TAIL}
        </p>

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

        <div style={{ marginTop: 30, fontSize: 12.5, color: '#a1a1aa' }}>{FOOTNOTE}</div>
      </div>
    </div>
  )
}
