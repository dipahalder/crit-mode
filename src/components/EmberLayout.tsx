import type { CSSProperties } from 'react'
import type { Brand, Page } from '../types'
import { clean } from '../utils/clean'

// Ember's full layout, lifted from the EMBER block in Atelier.dc.html:
// split hero, social-proof bar, how-it-works steps, featured items,
// testimonial, footer. Editable fields (headline, subhead, cta, heroImg,
// social) render from `view`; everything else from brand data. Every rendered
// string passes through clean() (guardrail 4). No pins yet (M5).

const SECTION_X = 44

export default function EmberLayout({ brand: b, view }: { brand: Brand; view: Page }) {
  return (
    <>
      {/* Nav */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `20px ${SECTION_X}px`,
        }}
      >
        <span style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 24, letterSpacing: '.4px' }}>
          {clean(b.name)}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, fontSize: 13.5, fontWeight: 500, color: 'var(--sub)' }}>
          {b.nav.map((link) => (
            <span key={link}>{clean(link)}</span>
          ))}
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--accentInk)',
              background: 'var(--accent)',
              padding: '8px 15px',
              borderRadius: 8,
            }}
          >
            {clean(b.signup)}
          </span>
        </div>
      </div>

      {/* Split hero */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.06fr .94fr', gap: 0, alignItems: 'stretch', borderTop: '1px solid var(--line)' }}>
        <div style={{ padding: '48px 44px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', color: 'var(--accent)', marginBottom: 18 }}>
            {clean(b.eyebrow)}
          </div>
          <h1
            style={{
              fontFamily: 'var(--display)',
              fontWeight: 'var(--dispWeight)' as CSSProperties['fontWeight'],
              fontSize: 54,
              lineHeight: 1.02,
              letterSpacing: 'var(--dispLs)',
              margin: '0 0 20px',
            }}
          >
            {clean(view.headline)}
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--sub)', margin: '0 0 28px', maxWidth: 380 }}>
            {clean(view.subhead)}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accentInk)', background: 'var(--accent)', padding: '14px 24px', borderRadius: 10 }}>
              {clean(view.cta)}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--ink)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                textDecorationColor: 'var(--line)',
              }}
            >
              {clean(b.ctaSecondary)}
            </span>
          </div>
        </div>
        <div
          style={{
            position: 'relative',
            minHeight: 440,
            background: 'var(--hero)',
            backgroundImage: 'repeating-linear-gradient(135deg,rgba(0,0,0,.05) 0 13px,transparent 13px 26px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12, color: 'rgba(0,0,0,.4)', letterSpacing: '.3px' }}>
            IMG · 3:4
          </span>
          <span
            style={{
              position: 'absolute',
              left: 16,
              bottom: 16,
              fontFamily: 'ui-monospace, Menlo, monospace',
              fontSize: 11,
              color: '#3f3f46',
              background: 'rgba(255,255,255,.88)',
              padding: '5px 9px',
              borderRadius: 6,
            }}
          >
            {clean(view.heroImg)}
          </span>
        </div>
      </div>

      {/* Social-proof bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          padding: '16px 44px',
          borderTop: '1px solid var(--line)',
          borderBottom: '1px solid var(--line)',
          background: 'rgba(0,0,0,.018)',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{clean(view.social)}</span>
        <span style={{ flex: 1 }} />
        {b.proof.map((p) => (
          <span key={p} style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: '1px', color: 'var(--sub)', opacity: 0.7 }}>
            {clean(p)}
          </span>
        ))}
      </div>

      {/* How it works */}
      <div style={{ padding: '50px 44px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', color: 'var(--accent)', marginBottom: 28 }}>
          {clean(b.howLabel)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 30 }}>
          {b.how.map((step, i) => (
            <div key={step.t} style={{ borderTop: '2px solid var(--ink)', paddingTop: 16 }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 500, fontSize: 34, color: 'var(--accent)', lineHeight: 1, marginBottom: 12 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 19, marginBottom: 7 }}>{clean(step.t)}</div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--sub)', margin: 0 }}>{clean(step.d)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured items */}
      <div style={{ padding: '46px 44px 50px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', color: 'var(--accent)', marginBottom: 22 }}>
          {clean(b.featLabel)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
          {b.feats.map((f) => (
            <div key={f.name}>
              <div
                style={{
                  height: 150,
                  borderRadius: 12,
                  background: 'var(--hero)',
                  backgroundImage: 'repeating-linear-gradient(135deg,rgba(0,0,0,.05) 0 10px,transparent 10px 20px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 10.5,
                  color: 'rgba(0,0,0,.4)',
                  marginBottom: 14,
                }}
              >
                {clean(b.featImg)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 18 }}>{clean(f.name)}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{clean(f.tag)}</span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--sub)', margin: '6px 0 0', lineHeight: 1.45 }}>{clean(f.meta)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial */}
      <div style={{ padding: '54px 44px', background: 'rgba(0,0,0,.025)', borderTop: '1px solid var(--line)' }}>
        <p
          style={{
            fontFamily: 'var(--display)',
            fontWeight: 500,
            fontStyle: 'italic',
            fontSize: 28,
            lineHeight: 1.34,
            letterSpacing: '-.3px',
            margin: '0 0 18px',
            maxWidth: 720,
          }}
        >
          {clean(b.quote)}
        </p>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sub)' }}>{clean(b.quoteBy)}</div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '32px 44px',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
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
