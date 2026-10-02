/*
  Footer.

  Structured after the reference: a CTA band across the top with the newsletter
  on the right, a rule, then the brand column beside three link columns, a legal
  bar, and the oversized wordmark fading out at the bottom.

  It sits outside the sticky scroll stage — the stage is a fixed artboard and
  this is ordinary flow, which is why it can be a real responsive layout rather
  than absolute coordinates.
*/

const VOLT = '#d8f24a'

const COLUMNS = [
  { head: 'Craft', links: ['The hull', 'Drivetrain', 'Materials', 'Specifications'] },
  { head: 'Ownership', links: ['Reserve', 'Service', 'Warranty', 'Finance'] },
  { head: 'Company', links: ['About', 'Press', 'Careers', 'Contact'] },
]

export default function Footer() {
  return (
    <footer style={{ background: '#080c11', padding: '0 24px 0', position: 'relative', zIndex: 1 }}>
      <div
        style={{
          maxWidth: 1312,
          margin: '0 auto',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 28,
          background:
            'linear-gradient(180deg, rgba(20,28,36,0.9) 0%, rgba(11,16,22,0.9) 100%)',
          padding: '56px 56px 8px',
          overflow: 'hidden',
        }}
      >
        {/* ---- CTA band ---- */}
        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 460px' }}>
            <span
              className="label"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 14px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.16)',
                color: 'rgba(255,255,255,0.8)',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: VOLT }} />
              Open water
            </span>
            <h2
              className="display"
              style={{ margin: '20px 0 0', fontSize: 40, lineHeight: 1.05 }}
            >
              Take the helm,{' '}
              <span style={{ fontStyle: 'italic', fontVariationSettings: '"wdth" 125, "wght" 400', color: 'rgba(255,255,255,0.72)' }}>
                your way
              </span>
            </h2>
            <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: '24px', color: 'rgba(255,255,255,0.6)', maxWidth: 420 }}>
              Reserve a hull, book a sea trial, or just follow the build.
            </p>
          </div>

          <div style={{ flex: '0 1 380px' }}>
            <div className="label" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>
              Get our news and updates
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                aria-label="Email address"
                placeholder="Enter your email"
                style={{
                  flex: 1,
                  height: 44,
                  padding: '0 16px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.16)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <button
                style={{
                  height: 44,
                  padding: '0 22px',
                  borderRadius: 10,
                  border: 0,
                  background: VOLT,
                  color: '#0b1016',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Subscribe
              </button>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              By subscribing you agree to our{' '}
              <span style={{ textDecoration: 'underline', color: 'rgba(255,255,255,0.7)' }}>Privacy Policy</span>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.10)', margin: '44px 0 40px' }} />

        {/* ---- brand + link columns ---- */}
        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 360px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="26" height="26" viewBox="0 0 28 28">
                <path
                  d="M14 2.5c1.6 5.6 5.9 9.9 11.5 11.5-5.6 1.6-9.9 5.9-11.5 11.5C12.4 19.9 8.1 15.6 2.5 14 8.1 12.4 12.4 8.1 14 2.5z"
                  fill={VOLT}
                />
              </svg>
              <span className="display" style={{ fontSize: 17, fontVariationSettings: '"wdth" 125, "wght" 700' }}>
                Marlin&#174;
              </span>
            </div>
            <p style={{ margin: '14px 0 0', fontSize: 13.5, lineHeight: '21px', color: 'rgba(255,255,255,0.55)', maxWidth: 260 }}>
              An electric jetski built for precision, silence and open water.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.head} style={{ flex: '0 1 170px' }}>
              <div className="label" style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 16 }}>
                {col.head}
              </div>
              {col.links.map((l) => (
                <div key={l} style={{ fontSize: 14, lineHeight: '30px', color: 'rgba(255,255,255,0.78)' }}>
                  {l}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ---- legal bar ---- */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
            fontSize: 13,
            color: 'rgba(255,255,255,0.45)',
            borderTop: '1px solid rgba(255,255,255,0.10)',
            marginTop: 40,
            padding: '20px 0 28px',
          }}
        >
          <span>&#169; 2026 Marlin&#174;. All rights reserved.</span>
          <span>Privacy Policy</span>
          <span>Terms of service</span>
        </div>

        {/* ---- the wordmark, fading into the panel ---- */}
        <div
          className="display"
          style={{
            fontSize: 'clamp(84px, 14vw, 196px)',
            lineHeight: 1.04,
            textAlign: 'center',
            letterSpacing: '-0.03em',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.03) 82%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            userSelect: 'none',
            marginBottom: 4,
          }}
        >
          Marlin&#174;
        </div>
      </div>
      <div style={{ height: 24 }} />
    </footer>
  )
}
