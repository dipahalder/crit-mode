import type { Brand, Page, RegisterTarget } from '../types'
import { clean } from '../utils/clean'

// Cadence's full layout, lifted from the CADENCE block in Atelier.dc.html:
// a Stripe-like gradient hero with a floating product-UI mock, a proof bar, a
// feature grid, a stats row, and a dark footer. Editable fields render from
// `view`; everything else from brand data. Every rendered string passes
// through clean() (guardrail 4). No pins yet (M5).

// The hero band uses a fixed gradient, not a palette token (README line 204).
const HERO_GRADIENT =
  'radial-gradient(135% 130% at 8% 4%,#7b78ff 0%,#635bff 30%,#3b2f8f 70%,#1b1540 100%)'

export default function CadenceLayout({ brand: b, view, register }: { brand: Brand; view: Page; register: RegisterTarget }) {
  return (
    <>
      {/* Gradient hero band (nav + hero) */}
      <div style={{ background: HERO_GRADIENT, padding: '0 0 60px' }}>
        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 44px' }}>
          <span style={{ fontWeight: 800, fontSize: 21, letterSpacing: '-0.4px', color: '#fff' }}>{clean(b.name)}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 13.5, fontWeight: 500, color: 'rgba(255,255,255,.82)' }}>
            {b.nav.map((link) => (
              <span key={link}>{clean(link)}</span>
            ))}
            <span style={{ color: '#fff' }}>Sign in</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#3b2f8f', background: '#fff', padding: '8px 15px', borderRadius: 8 }}>{clean(b.signup)}</span>
          </div>
        </div>

        {/* Hero grid: copy + product mock */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.02fr .98fr', gap: 30, alignItems: 'center', padding: '46px 44px 14px' }}>
          <div>
            <div ref={register('palette')} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', color: 'rgba(255,255,255,.7)', marginBottom: 18 }}>{clean(b.eyebrow)}</div>
            <h1 ref={register('headline')} key={clean(view.headline)} className="ate-fade" style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 52, lineHeight: 1.02, letterSpacing: '-1.6px', margin: '0 0 18px', color: '#fff' }}>{clean(view.headline)}</h1>
            <p ref={register('subhead')} key={clean(view.subhead)} className="ate-fade" style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,.84)', margin: '0 0 26px', maxWidth: 400 }}>{clean(view.subhead)}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span ref={register('cta')} key={clean(view.cta)} className="ate-fade" style={{ fontSize: 14, fontWeight: 700, color: '#3b2f8f', background: '#fff', padding: '13px 22px', borderRadius: 10 }}>{clean(view.cta)}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 7 }}>
                {clean(b.ctaSecondary)} <span style={{ opacity: 0.7 }}>→</span>
              </span>
            </div>
          </div>

          {/* Floating product UI mock (decorative); heroImg label sits in its header */}
          <div ref={register('heroImg')} key={clean(view.heroImg)} className="ate-fade" style={{ position: 'relative', background: '#fff', borderRadius: 14, boxShadow: '0 30px 70px -20px rgba(10,8,40,.6)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 13px', borderBottom: '1px solid #eef0f6' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e2e4ee' }} />
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e2e4ee' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0a2540', marginLeft: 6 }}>This week</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: '#8a93a8' }}>{clean(view.heroImg)}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: 64, borderRight: '1px solid #eef0f6', padding: '13px 10px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                <div style={{ height: 8, width: 34, borderRadius: 3, background: '#635bff' }} />
                <div style={{ height: 7, width: 40, borderRadius: 3, background: '#e7e9f2' }} />
                <div style={{ height: 7, width: 30, borderRadius: 3, background: '#e7e9f2' }} />
                <div style={{ height: 7, width: 38, borderRadius: 3, background: '#e7e9f2' }} />
              </div>
              <div style={{ flex: 1, padding: '13px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { time: '9:00', flex: 1, bg: '#635bff', color: '#fff', label: 'Deep work · Auth flow' },
                  { time: '11:30', flex: 0.7, bg: '#d9dcfb', color: '#3b2f8f', label: 'Standup' },
                  { time: '14:00', flex: 0.9, bg: '#eef0f6', color: '#56607a', label: 'Review PRs' },
                  { time: '16:00', flex: 0.5, bg: '#c7f7ec', color: '#0d6b57', label: 'Walk' },
                ].map((row) => (
                  <div key={row.time} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ fontSize: 9, color: '#9aa2b6', width: 30 }}>{row.time}</span>
                    <div style={{ flex: row.flex, height: 22, borderRadius: 6, background: row.bg, display: 'flex', alignItems: 'center', padding: '0 9px' }}>
                      <span style={{ fontSize: 9.5, color: row.color, fontWeight: 600 }}>{row.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proof bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 38, padding: '22px 44px', background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
        <span ref={register('social')} key={clean(view.social)} className="ate-fade" style={{ fontSize: 12, fontWeight: 600, color: 'var(--sub)' }}>{clean(view.social)}</span>
        {b.proof.map((p) => (
          <span key={p} style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, letterSpacing: '1px', color: 'var(--sub)', opacity: 0.55 }}>{clean(p)}</span>
        ))}
      </div>

      {/* Features */}
      <div style={{ padding: '54px 44px 40px', background: 'var(--bg)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', color: 'var(--accent)', marginBottom: 8 }}>{clean(b.howLabel)}</div>
        <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 30, letterSpacing: '-1px', color: 'var(--ink)', marginBottom: 30, maxWidth: 520, lineHeight: 1.1 }}>
          {clean('Everything you need to run a calmer week.')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {b.feats.map((f) => (
            <div key={f.name} style={{ border: '1px solid var(--line)', borderRadius: 14, padding: '22px 20px', background: 'var(--surface)' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--accent)', opacity: 0.95, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ width: 13, height: 13, border: '2.4px solid #fff', borderRadius: 4 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>{clean(f.name)}</span>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--accent)', background: 'rgba(99,91,255,.1)', padding: '2px 7px', borderRadius: 999 }}>{clean(f.tag)}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--sub)', margin: 0, lineHeight: 1.55 }}>{clean(f.meta)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '14px 44px 56px', background: 'var(--bg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, borderTop: '1px solid var(--line)', paddingTop: 36 }}>
          {(b.stats ?? []).map((s) => (
            <div key={s.k}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 40, letterSpacing: '-1.5px', color: 'var(--accent)' }}>{clean(s.v)}</div>
              <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 4 }}>{clean(s.k)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer (dark) */}
      <div style={{ padding: '44px 44px', background: 'var(--ink)', display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 260 }}>
          <div style={{ fontWeight: 800, fontSize: 19, marginBottom: 8, color: '#fff' }}>{clean(b.name)}</div>
          {b.footBlurb && <p style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', lineHeight: 1.5, margin: 0 }}>{clean(b.footBlurb)}</p>}
        </div>
        <div style={{ display: 'flex', gap: 48 }}>
          {(b.footCols ?? []).map((col) => (
            <div key={col.h} style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: 'rgba(255,255,255,.6)' }}>
              <span style={{ fontWeight: 700, color: '#fff', fontSize: 11, letterSpacing: '.6px' }}>{clean(col.h)}</span>
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
