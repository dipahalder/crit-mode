import type { CSSProperties } from 'react'
import type { Brand, Page, RegisterTarget } from '../types'
import { clean } from '../utils/clean'

// Ember's full layout, lifted from the EMBER block in Atelier.dc.html and
// extended for M12: the page-level `concept` reflows the hero treatment and the
// body section order. Editable fields render from `view`; everything else from
// brand data. Every rendered string passes through clean() (guardrail 4).

const SECTION_X = 44

const eyebrowStyle: CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', color: 'var(--accent)', marginBottom: 18 }
const headlineStyle: CSSProperties = { fontFamily: 'var(--display)', fontWeight: 'var(--dispWeight)' as CSSProperties['fontWeight'], fontSize: 54, lineHeight: 1.02, letterSpacing: 'var(--dispLs)', margin: '0 0 20px' }
const subheadStyle: CSSProperties = { fontSize: 16, lineHeight: 1.6, color: 'var(--sub)', margin: '0 0 28px', maxWidth: 380 }
const ctaStyle: CSSProperties = { fontSize: 14, fontWeight: 700, color: 'var(--accentInk)', background: 'var(--accent)', padding: '14px 24px', borderRadius: 10 }
const ctaSecondaryStyle: CSSProperties = { fontSize: 14, fontWeight: 600, color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: '3px', textDecorationColor: 'var(--line)' }
const splitCopyStyle: CSSProperties = { padding: '48px 44px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }
const centeredCopyStyle: CSSProperties = { padding: '52px 44px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }
const imageStyle: CSSProperties = {
  position: 'relative',
  minHeight: 440,
  background: 'var(--hero)',
  backgroundImage: 'repeating-linear-gradient(135deg,rgba(0,0,0,.05) 0 13px,transparent 13px 26px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export default function EmberLayout({ brand: b, view, register }: { brand: Brand; view: Page; register: RegisterTarget }) {
  const concept = view.concept
  const heroLayout = view.heroLayout

  // Hero copy + image as single instances (each registered element appears once,
  // so pins stay anchored regardless of which hero treatment renders).
  const copy = (
    <>
      <div ref={register('palette')} style={eyebrowStyle}>{clean(b.eyebrow)}</div>
      <h1 ref={register('headline')} key={clean(view.headline)} className="ate-fade" style={headlineStyle}>{clean(view.headline)}</h1>
      <p ref={register('subhead')} key={clean(view.subhead)} className="ate-fade" style={subheadStyle}>{clean(view.subhead)}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span ref={register('cta')} key={clean(view.cta)} className="ate-fade" style={ctaStyle}>{clean(view.cta)}</span>
        <span ref={register('heroLayout')} style={ctaSecondaryStyle}>{clean(b.ctaSecondary)}</span>
      </div>
    </>
  )

  const imageBlock = (
    <div ref={register('heroImg')} key={clean(view.heroImg)} className="ate-fade" style={imageStyle}>
      <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12, color: 'rgba(0,0,0,.4)', letterSpacing: '.3px' }}>IMG · 3:4</span>
      <span style={{ position: 'absolute', left: 16, bottom: 16, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 11, color: '#3f3f46', background: 'rgba(255,255,255,.88)', padding: '5px 9px', borderRadius: 6 }}>
        {clean(view.heroImg)}
      </span>
    </div>
  )

  // Hero geometry by heroLayout (M12, independent of concept): centered stacks
  // copy over a full-width image; split is side-by-side; imageFirst mirrors it.
  const hero =
    heroLayout === 'centered' ? (
      <div style={{ borderTop: '1px solid var(--line)' }}>
        <div style={centeredCopyStyle}>{copy}</div>
        {imageBlock}
      </div>
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1.06fr .94fr', gap: 0, alignItems: 'stretch', borderTop: '1px solid var(--line)' }}>
        {heroLayout === 'imageFirst' ? (
          <>
            {imageBlock}
            <div style={splitCopyStyle}>{copy}</div>
          </>
        ) : (
          <>
            <div style={splitCopyStyle}>{copy}</div>
            {imageBlock}
          </>
        )}
      </div>
    )

  const proofBar = (
    <div key="proof" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 44px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'rgba(0,0,0,.018)' }}>
      <span ref={register('social')} key={clean(view.social)} className="ate-fade" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{clean(view.social)}</span>
      <span style={{ flex: 1 }} />
      {b.proof.map((p) => (
        <span key={p} style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '1px', color: 'var(--sub)', opacity: 0.7 }}>{clean(p)}</span>
      ))}
    </div>
  )

  const howSection = (
    <div key="how" style={{ padding: '50px 44px 12px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', color: 'var(--accent)', marginBottom: 28 }}>{clean(b.howLabel)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 30 }}>
        {b.how.map((step, i) => (
          <div key={step.t} style={{ borderTop: '2px solid var(--ink)', paddingTop: 16 }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 500, fontSize: 34, color: 'var(--accent)', lineHeight: 1, marginBottom: 12 }}>{String(i + 1).padStart(2, '0')}</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 19, marginBottom: 7 }}>{clean(step.t)}</div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--sub)', margin: 0 }}>{clean(step.d)}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const featuredSection = (
    <div key="featured" style={{ padding: '46px 44px 50px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', color: 'var(--accent)', marginBottom: 22 }}>{clean(b.featLabel)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
        {b.feats.map((f) => (
          <div key={f.name}>
            <div style={{ height: 150, borderRadius: 12, background: 'var(--hero)', backgroundImage: 'repeating-linear-gradient(135deg,rgba(0,0,0,.05) 0 10px,transparent 10px 20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'ui-monospace, monospace', fontSize: 10.5, color: 'rgba(0,0,0,.4)', marginBottom: 14 }}>{clean(b.featImg)}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 18 }}>{clean(f.name)}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{clean(f.tag)}</span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--sub)', margin: '6px 0 0', lineHeight: 1.45 }}>{clean(f.meta)}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const testimonialSection = (
    <div key="testimonial" style={{ padding: '54px 44px', background: 'rgba(0,0,0,.025)', borderTop: '1px solid var(--line)' }}>
      <p style={{ fontFamily: 'var(--display)', fontWeight: 500, fontStyle: 'italic', fontSize: 28, lineHeight: 1.34, letterSpacing: '-.3px', margin: '0 0 18px', maxWidth: 720 }}>{clean(b.quote)}</p>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sub)' }}>{clean(b.quoteBy)}</div>
    </div>
  )

  // Body section order by concept (M12): the reflow that reads as leverage.
  const body =
    concept === 'ritual-led'
      ? [howSection, featuredSection, testimonialSection]
      : concept === 'origin-led'
        ? [testimonialSection, featuredSection, howSection]
        : [featuredSection, howSection, testimonialSection]

  return (
    <>
      {/* Nav (the wordmark anchors the page-level concept pin) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `20px ${SECTION_X}px` }}>
        <span ref={register('concept')} style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 24, letterSpacing: '.4px' }}>{clean(b.name)}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, fontSize: 13.5, fontWeight: 500, color: 'var(--sub)' }}>
          {b.nav.map((link) => (
            <span key={link}>{clean(link)}</span>
          ))}
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accentInk)', background: 'var(--accent)', padding: '8px 15px', borderRadius: 8 }}>{clean(b.signup)}</span>
        </div>
      </div>

      {hero}
      {proofBar}
      {body}

      {/* Footer */}
      <div style={{ padding: '32px 44px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 250 }}>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 20, marginBottom: 8 }}>{clean(b.name)}</div>
          {b.footBlurb && <p style={{ fontSize: 12, color: 'var(--sub)', lineHeight: 1.5, margin: 0 }}>{clean(b.footBlurb)}</p>}
        </div>
        <div style={{ display: 'flex', gap: 48 }}>
          {(b.footCols ?? []).map((col) => (
            <div key={col.h} style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: 'var(--sub)' }}>
              <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 11, letterSpacing: '.6px' }}>{clean(col.h)}</span>
              {col.links.map((l) => (
                <span key={l}>{clean(l)}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
