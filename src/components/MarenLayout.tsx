import type { CSSProperties } from 'react'
import type { Brand, Page, RegisterTarget } from '../types'
import { clean } from '../utils/clean'

// Maren's full layout, lifted from the MAREN block in Atelier.dc.html: a
// Versed-like airy centered editorial. Nav with centered wordmark, centered
// hero, a wide hero image, proof bar, routine steps, essentials grid,
// testimonial, flat footer. Editable fields render from `view`; everything
// else from brand data. Every rendered string passes through clean()
// (guardrail 4). No pins yet (M5).

export default function MarenLayout({ brand: b, view, register }: { brand: Brand; view: Page; register: RegisterTarget }) {
  const nameCaps = b.nameCaps ?? b.name
  return (
    <>
      {/* Nav: links left, centered wordmark, signup right */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 48px' }}>
        <div style={{ flex: 1, display: 'flex', gap: 24, fontSize: 12.5, fontWeight: 500, color: 'var(--sub)' }}>
          {b.nav.map((link) => (
            <span key={link}>{clean(link)}</span>
          ))}
        </div>
        <span style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 23, letterSpacing: '3px', color: 'var(--ink)' }}>{clean(nameCaps)}</span>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', border: '1px solid var(--ink)', padding: '8px 18px', borderRadius: 999 }}>{clean(b.signup)}</span>
        </div>
      </div>

      {/* Centered hero */}
      <div style={{ padding: '54px 48px 44px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div ref={register('palette')} style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '2px', color: 'var(--accent)', marginBottom: 22 }}>{clean(b.eyebrow)}</div>
        <h1 ref={register('headline')} key={clean(view.headline)} className="ate-fade" style={{ fontFamily: 'var(--display)', fontWeight: 'var(--dispWeight)' as CSSProperties['fontWeight'], fontSize: 58, lineHeight: 1.04, letterSpacing: 'var(--dispLs)', margin: '0 0 22px', maxWidth: 680 }}>{clean(view.headline)}</h1>
        <p ref={register('subhead')} key={clean(view.subhead)} className="ate-fade" style={{ fontSize: 16.5, lineHeight: 1.62, color: 'var(--sub)', margin: '0 0 30px', maxWidth: 480 }}>{clean(view.subhead)}</p>
        <span ref={register('cta')} key={clean(view.cta)} className="ate-fade" style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--accentInk)', background: 'var(--accent)', padding: '14px 30px', borderRadius: 999 }}>{clean(view.cta)}</span>
      </div>

      {/* Wide hero image */}
      <div
        ref={register('heroImg')} key={clean(view.heroImg)} className="ate-fade"
        style={{
          position: 'relative',
          height: 330,
          margin: '0 48px 8px',
          borderRadius: 16,
          overflow: 'hidden',
          background: 'var(--hero)',
          backgroundImage: 'repeating-linear-gradient(135deg,rgba(0,0,0,.04) 0 14px,transparent 14px 28px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12, color: 'rgba(0,0,0,.35)', letterSpacing: '.3px' }}>IMG · 16:9</span>
        <span style={{ position: 'absolute', left: 18, bottom: 18, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 11, color: '#3f3f46', background: 'rgba(255,255,255,.85)', padding: '5px 9px', borderRadius: 6 }}>{clean(view.heroImg)}</span>
      </div>

      {/* Proof bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 34, padding: '26px 48px' }}>
        <span ref={register('social')} key={clean(view.social)} className="ate-fade" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', fontStyle: 'italic', fontFamily: 'var(--display)' }}>{clean(view.social)}</span>
        {b.proof.map((p) => (
          <span key={p} style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '1.5px', color: 'var(--sub)', opacity: 0.6 }}>{clean(p)}</span>
        ))}
      </div>

      {/* The routine (steps) */}
      <div style={{ padding: '40px 48px 46px', borderTop: '1px solid var(--line)' }}>
        <div style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 700, letterSpacing: '2px', color: 'var(--accent)', marginBottom: 34 }}>{clean(b.howLabel)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 36 }}>
          {b.how.map((step, i) => (
            <div key={step.t} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 400, fontSize: 24, color: 'var(--accent)', marginBottom: 12 }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 20, marginBottom: 9 }}>{clean(step.t)}</div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--sub)', margin: '0 auto', maxWidth: 230 }}>{clean(step.d)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* The essentials (featured) */}
      <div style={{ padding: '44px 48px 52px', borderTop: '1px solid var(--line)' }}>
        <div style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 700, letterSpacing: '2px', color: 'var(--accent)', marginBottom: 30 }}>{clean(b.featLabel)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 26 }}>
          {b.feats.map((f) => (
            <div key={f.name} style={{ textAlign: 'center' }}>
              <div
                style={{
                  height: 200,
                  borderRadius: 14,
                  background: 'var(--hero)',
                  backgroundImage: 'repeating-linear-gradient(135deg,rgba(0,0,0,.04) 0 11px,transparent 11px 22px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 10.5,
                  color: 'rgba(0,0,0,.35)',
                  marginBottom: 16,
                }}
              >
                {clean(b.featImg)}
              </div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 19, marginBottom: 5 }}>{clean(f.name)}</div>
              <p style={{ fontSize: 12.5, color: 'var(--sub)', margin: '0 0 7px', lineHeight: 1.45 }}>{clean(f.meta)}</p>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{clean(f.tag)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial */}
      <div style={{ padding: '56px 48px', background: 'rgba(0,0,0,.022)', borderTop: '1px solid var(--line)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--display)', fontWeight: 400, fontStyle: 'italic', fontSize: 27, lineHeight: 1.4, letterSpacing: '-.2px', margin: '0 auto 18px', maxWidth: 640 }}>{clean(b.quote)}</p>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sub)' }}>{clean(b.quoteBy)}</div>
      </div>

      {/* Flat footer */}
      <div style={{ padding: '34px 48px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 20, letterSpacing: '2px' }}>{clean(nameCaps)}</div>
        <div style={{ display: 'flex', gap: 30, fontSize: 12, color: 'var(--sub)' }}>
          {(b.footFlat ?? []).map((l) => (
            <span key={l}>{clean(l)}</span>
          ))}
        </div>
      </div>
    </>
  )
}
