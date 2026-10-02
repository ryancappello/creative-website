import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useScroll, useMotionValueEvent } from 'motion/react'
import { SCROLL_VH, P, G, VIDEO_SEAM, span, ramp, lerp } from './scroll'
import Footer from './Footer'

/*
  Marlin — a scroll-driven hero over aerial jetski footage.

  The choreography came out of a motion prototype rather
  than a recording: 19 interactions carrying real triggers, durations and
  easings, totalling 20,000ms. Every phase below is that timeline divided by
  20,000, so the sections land where the prototype lands them — the clock is
  just the scrollbar now. See scroll.ts.

  The footage is two 10s clips sharing a seam frame, because generation tops out near
  10s. Clip A runs aerial -> golden-hour profile, clip B profile -> underwater,
  and the seam measured 4.2% apart so they cut together invisibly. Both are
  scrubbed, not played; clip A owns the first half of the scroll and clip B the
  second.
*/

const STAGE_W = 1440
const STAGE_H = 810

/*
  The artboard COVERS the viewport, so a slice of its margin is cropped on
  whichever axis overflows. Every group sits behind SAFE_L rather than behind
  the prototype's own 24/26px margins, which were only safe while the artboard was
  letterboxed and nothing was cut.
*/
const SAFE_L = 96
const GROUP_W = STAGE_W - SAFE_L * 2

const VOLT = '#d8f24a'

const px = (n: number) => `${n}px`
const box = (x: number, y: number, w?: number, h?: number): CSSProperties => ({
  position: 'absolute',
  left: px(x),
  top: px(y),
  ...(w != null ? { width: px(w) } : null),
  ...(h != null ? { height: px(h) } : null),
})

const NAV = [
  { t: 'Home', x: 370 },
  { t: 'Design', x: 544 },
  { t: 'Performance', x: 728 },
  { t: 'Technology', x: 971 },
]

/* Four Silent Power cards, at the corners of Group 54's 1388x633 box. */
const CARDS = [
  { x: 0, y: 0, art: 'card-1', label: ['Silent', 'Power'] },
  { x: GROUP_W - 255, y: 0, art: 'card-2', label: ['Open', 'Water'] },
  { x: 116, y: 240, art: 'card-3', label: ['Zero', 'Wake'] },
  { x: GROUP_W - 371, y: 240, art: 'card-4', label: ['Sub', 'Surface'] },
]

/** Reveals behind a clip mask, rising. */
function Mask({ t, children, style }: { t: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ ...style, overflow: 'hidden' }}>
      <div style={{ height: '100%', transform: `translateY(${(1 - t) * 115}%)`, willChange: 'transform' }}>
        {children}
      </div>
    </div>
  )
}

export default function App() {
  const wrap = useRef<HTMLDivElement>(null)
  const vidA = useRef<HTMLVideoElement>(null)
  const vidB = useRef<HTMLVideoElement>(null)
  const prog = useRef(0)
  const [scale, setScale] = useState(1)
  const [p, setP] = useState(0)

  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => setP(v))
  prog.current = p

  useLayoutEffect(() => {
    const fit = () =>
      setScale(window.innerWidth / STAGE_W)
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  /*
    Scrub both clips. Writing currentTime straight from the scroll handler
    stutters, so scroll sets a target and a rAF loop eases each playhead toward
    it. A video that has never played paints nothing until it is seeked, hence
    the nudge on loadedmetadata.
  */
  useEffect(() => {
    const els = [vidA.current, vidB.current].filter(Boolean) as HTMLVideoElement[]
    if (els.length < 2) return
    for (const v of els) {
      const nudge = () => {
        try {
          v.currentTime = 0.01
        } catch {
          /* not seekable yet */
        }
      }
      if (v.readyState >= 1) nudge()
      else v.addEventListener('loadedmetadata', nudge, { once: true })
    }
    let raf = 0
    const tick = () => {
      const q = prog.current
      const seek = (v: HTMLVideoElement, want01: number) => {
        const d = v.duration
        if (!d || !Number.isFinite(d)) return
        const want = Math.max(0, Math.min(want01, 1)) * d
        const now = v.currentTime
        if (Math.abs(want - now) > 0.012) v.currentTime = now + (want - now) * 0.26
      }
      seek(els[0], q / VIDEO_SEAM)
      seek(els[1], (q - VIDEO_SEAM) / (1 - VIDEO_SEAM))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  /* group positions, interpolated across the four frames */
  const m1 = ramp(p, P.move1)
  const m2 = ramp(p, P.move2)
  const y53 = lerp(G.g53.start, G.g53.end, m1)
  const y54 = lerp(lerp(G.g54.enter, G.g54.mid, m1), G.g54.end, m2)
  const y55 = lerp(lerp(G.g55.enter, G.g55.mid, m1), G.g55.end, m2)

  /* the seam: cross-dissolve the two clips over a narrow band */
  const bMix = ramp(p, [VIDEO_SEAM - 0.02, VIDEO_SEAM + 0.02])

  const vStyle: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }

  return (
    <>
      <div ref={wrap} style={{ height: `${SCROLL_VH}vh`, background: '#0b1016' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          /* The artboard is width-locked, so the viewport it pins inside is
             exactly as tall as the artboard ends up — never 100vh, which is
             what used to crop it on anything that was not 16:9. */
          height: `max(calc(100vw * ${STAGE_H} / ${STAGE_W}), 100vh)`,
          overflow: 'hidden',
        }}
      >
        <video ref={vidA} muted playsInline preload="auto" style={{ ...vStyle, opacity: 1 - bMix }}>
          <source src={`${import.meta.env.BASE_URL}assets/jetski-a.mp4`} type="video/mp4" />
        </video>
        <video ref={vidB} muted playsInline preload="auto" style={{ ...vStyle, opacity: bMix }}>
          <source src={`${import.meta.env.BASE_URL}assets/jetski-b.mp4`} type="video/mp4" />
        </video>
        {/* ---- viewport-level chrome: these must span the window, not the
             artboard, or they leave strips of bare video at both edges ---- */}
        <div
          style={{
            position: 'absolute',
            inset: '0 0 auto 0',
            height: 132,
            display: 'flex',
            alignItems: 'flex-start',
            paddingTop: 32,
            paddingLeft: 40,
            paddingRight: 40,
            gap: 40,
            /* A gradient rather than a bar — a solid fill with a border draws a
               hard seam across the footage. The same gradient masks the blur,
               so the blur fades out with the tint instead of ending on a line. */
            background:
              'linear-gradient(180deg, rgba(8,12,17,0.78) 0%, rgba(8,12,17,0.42) 46%, rgba(8,12,17,0) 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            maskImage: 'linear-gradient(180deg, #000 0%, #000 42%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 42%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="26" height="26" viewBox="0 0 28 28">
              <path
                d="M14 2.5c1.6 5.6 5.9 9.9 11.5 11.5-5.6 1.6-9.9 5.9-11.5 11.5C12.4 19.9 8.1 15.6 2.5 14 8.1 12.4 12.4 8.1 14 2.5z"
                fill={VOLT}
              />
            </svg>
            <span className="display" style={{ fontSize: 17, fontVariationSettings: '"wdth" 125, "wght" 700' }}>
              Marlin
            </span>
          </div>
          <div className="nav-links" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 56 }}>
            {NAV.map((n) => (
              <span key={n.t} className="label" style={{ color: 'rgba(255,255,255,0.78)', whiteSpace: 'nowrap' }}>
                {n.t}
              </span>
            ))}
          </div>
          <span className="label" style={{ color: '#fff' }}>Login</span>
        </div>

        {/* section scrims, also viewport-wide */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(6,10,14,0.88) 0%, rgba(6,10,14,0.55) 34%, rgba(6,10,14,0) 62%)',
            opacity: 1 - ramp(p, P.move1),
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(64% 56% at 50% 78%, rgba(6,10,14,0.86) 0%, rgba(6,10,14,0.35) 58%, rgba(6,10,14,0) 100%)',
            opacity: ramp(p, P.move1) * (1 - ramp(p, P.move2)),
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(6,10,14,0) 38%, rgba(6,10,14,0.80) 74%, rgba(6,10,14,0.88) 100%)',
            opacity: ramp(p, P.move2),
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: px(STAGE_W),
            height: px(STAGE_H),
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            zIndex: 2,
          }}
        >

          {/* ---- index rail (Component 5, 1363,451) ---- */}
          <div style={box(STAGE_W - SAFE_L - 53, 451, 53, 272)}>
            {['01', '02', '03', '04', '05'].map((n, i) => (
              <div
                key={n}
                className="label"
                style={{
                  position: 'absolute',
                  top: px(i * 64),
                  right: 0,
                  fontSize: px(16),
                  color: i === Math.min(4, Math.floor(p * 5)) ? VOLT : 'rgba(255,255,255,0.4)',
                }}
              >
                {n}
              </div>
            ))}
          </div>

          {/* Copy sits on moving water in all three sections, so each block
              gets a scrim keyed to the page ink rather than relying on the
              footage happening to be dark in the right place. */}
          {/* ================= GROUP 53 — the hero ================= */}
          <div style={{ ...box(SAFE_L, 0, GROUP_W, 642), transform: `translateY(${y53}px)`, willChange: 'transform' }}>
            <Mask t={span(p, P.word)} style={{ position: 'absolute', left: 0, top: -8, width: px(560), height: px(94) }}>
              <div className="display" style={{ fontSize: px(72), lineHeight: px(86) }}>Redefine</div>
            </Mask>
            <Mask t={span(p, P.word2)} style={{ position: 'absolute', left: 0, top: px(54), width: px(560), height: px(94) }}>
              <div className="display" style={{ fontSize: px(72), lineHeight: px(86) }}>Ocean</div>
            </Mask>
            <Mask t={span(p, P.word3)} style={{ position: 'absolute', left: 0, top: px(116), width: px(560), height: px(94) }}>
              <div className="display" style={{ fontSize: px(72), lineHeight: px(86) }}>Speed</div>
            </Mask>

            {[
              'A sculpted electric jetski concept',
              'designed for precision, elegance and',
              'effortless high-performance ocean travel.',
            ].map((line, i) => (
              <Mask
                key={line}
                t={span(p, [P.body1, P.body2, P.body3][i])}
                style={{ position: 'absolute', left: 0, top: px(264 + i * 24), width: px(420), height: px(30) }}
              >
                <div style={{ fontSize: px(16), lineHeight: px(22), color: 'rgba(255,255,255,0.8)' }}>{line}</div>
              </Mask>
            ))}

            {/* Component 2 — the two buttons */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: px(400),
                opacity: span(p, P.body3),
                display: 'flex',
                gap: px(14),
              }}
            >
              <div
                className="label"
                style={{
                  height: px(48),
                  padding: `0 ${px(28)}`,
                  borderRadius: 999,
                  background: '#fff',
                  color: '#0b1016',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                Reserve now
              </div>
              <div
                className="label"
                style={{
                  height: px(48),
                  padding: `0 ${px(22)}`,
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.45)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: px(12),
                }}
              >
                Watch demo
                <span
                  style={{
                    width: px(26),
                    height: px(26),
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.18)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8">
                    <polygon points="2,1 7,4 2,7" fill="#fff" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Component 4 — the efficiency card. The file gives it 459x289
                carrying only a label and a number, which leaves two thirds of
                it empty. Filled out as telemetry: the figure drives a track,
                and three secondary readouts sit under a rule. */}
            <div
              className="glass"
              style={{
                position: 'absolute',
                left: px(GROUP_W - 459),
                top: px(300),
                width: px(459),
                height: px(289),
                borderRadius: px(60),
                opacity: span(p, P.stat),
                transform: `translateY(${(1 - span(p, P.stat)) * 28}px)`,
              }}
            >
              <div style={{ position: 'absolute', inset: `${px(36)} ${px(40)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: px(17), lineHeight: px(23), color: 'rgba(255,255,255,0.88)' }}>
                    Operation
                    <br />
                    Efficiency
                  </div>
                  <div
                    className="display"
                    style={{ fontSize: px(66), lineHeight: px(58), fontVariationSettings: '"wdth" 125, "wght" 250' }}
                  >
                    {Math.round(85 * span(p, P.stat))}
                    <span style={{ fontSize: px(30) }}>%</span>
                  </div>
                </div>

                {/* the figure, as a track */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: px(92),
                    height: px(5),
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.16)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${85 * span(p, P.stat)}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: VOLT,
                      boxShadow: `0 0 14px ${VOLT}`,
                    }}
                  />
                </div>
                <div
                  className="label"
                  style={{ position: 'absolute', left: 0, top: px(108), fontSize: px(10), color: 'rgba(255,255,255,0.45)' }}
                >
                  Measured over 40 hours at sea
                </div>

                <div style={{ position: 'absolute', left: 0, right: 0, top: px(140), height: 1, background: 'rgba(255,255,255,0.14)' }} />

                <div style={{ position: 'absolute', left: 0, right: 0, top: px(164), display: 'flex' }}>
                  {[
                    ['Range', '92', 'km'],
                    ['Top speed', '74', 'km/h'],
                    ['Recharge', '45', 'min'],
                  ].map(([k, v, u], i) => (
                    <div
                      key={k}
                      style={{
                        flex: 1,
                        paddingLeft: i ? px(20) : 0,
                        borderLeft: i ? '1px solid rgba(255,255,255,0.14)' : undefined,
                      }}
                    >
                      <div className="display" style={{ fontSize: px(22), fontVariationSettings: '"wdth" 125, "wght" 600' }}>
                        {Math.round(Number(v) * span(p, P.stat))}
                        <span style={{ fontSize: px(11), opacity: 0.6 }}> {u}</span>
                      </div>
                      <div className="label" style={{ marginTop: px(7), fontSize: px(9.5), color: 'rgba(255,255,255,0.5)' }}>
                        {k}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ================= GROUP 54 — Born To Glide ================= */}
          <div style={{ ...box(SAFE_L, 0, GROUP_W, 640), transform: `translateY(${y54}px)`, willChange: 'transform' }}>
            {CARDS.map((c, i) => {
              const t = span(p, [P.g54In[0] + i * 0.004, P.g54In[1]])
              return (
                <div key={i} style={{ position: 'absolute', left: px(c.x), top: px(c.y), width: px(255), height: px(215), opacity: t }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: px(46), overflow: 'hidden' }}>
                    <img src={`${import.meta.env.BASE_URL}assets/${c.art}.webp`} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    {/* the label sits on moving water, so it gets its own ground */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(150deg, rgba(6,10,14,0.80) 0%, rgba(6,10,14,0.30) 52%, rgba(6,10,14,0.05) 100%)',
                      }}
                    />
                  </div>
                  <div
                    style={{ position: 'absolute', inset: 0, borderRadius: px(46), border: '1px solid rgba(255,255,255,0.28)', pointerEvents: 'none' }}
                  />
                  <div
                    className="display"
                    style={{ position: 'absolute', left: px(22), top: px(30), fontSize: px(19), lineHeight: px(23), fontVariationSettings: '"wdth" 125, "wght" 600' }}
                  >
                    {c.label[0]}
                    <br />
                    {c.label[1]}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      left: px(174),
                      top: px(17),
                      width: px(66),
                      height: px(66),
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.22)',
                      border: '1px solid rgba(255,255,255,0.4)',
                      display: 'grid',
                      placeItems: 'center',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 8 8">
                      <polygon points="2,1 7,4 2,7" fill="#fff" />
                    </svg>
                  </div>
                </div>
              )
            })}

            <div className="display" style={{ position: 'absolute', left: px((GROUP_W - 578) / 2), top: px(470), fontSize: px(72) }}>
              Born To Glide
            </div>
            <div
              style={{
                position: 'absolute',
                left: px((GROUP_W - 650) / 2),
                top: px(556),
                width: px(650),
                fontSize: px(22),
                lineHeight: px(32),
                textAlign: 'center',
                color: 'rgba(255,255,255,0.86)',
              }}
            >
              Built for bold escapes, smooth acceleration, and a cinematic
              connection between rider and sea.
            </div>
          </div>

          {/* ================= GROUP 55 — underwater =================
              The prototype parks this group's paragraph at x=1404 with a 393 width,
              which runs to 1797 on a 1440 frame — the original clips it off
              the right edge. Laid out as two columns inside the margins
              instead, which is what the section was clearly meant to be. */}
          <div style={{ ...box(SAFE_L, 0, GROUP_W, 810), transform: `translateY(${y55}px)`, willChange: 'transform' }}>
            <div className="display" style={{ position: 'absolute', left: 0, top: px(430), width: px(600), fontSize: px(52), lineHeight: px(54) }}>
              Dive into an extraordinary realm of marine
            </div>
            <div style={{ position: 'absolute', left: 0, top: px(404), width: px(56), height: px(2), background: VOLT }} />
            <div
              style={{
                position: 'absolute',
                left: px(GROUP_W - 440),
                top: px(434),
                width: px(440),
                fontSize: px(15),
                lineHeight: px(26),
                color: 'rgba(255,255,255,0.76)',
              }}
            >
              Explore a remarkable world of marine design that combines stunning
              aesthetics with top-notch coastal performance. A craft that not
              only impresses with its sleek lines and innovative structure but
              also excels in tough waters.
            </div>
          </div>

        </div>
      </div>
      </div>
      <Footer />
    </>
  )
}
