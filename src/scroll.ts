/*
  Scroll choreography, taken from the motion prototype rather than invented.

  The motion is genuinely in the prototype: 19 interactions with real
  triggers, durations and easings. The frame sequence reads:

      frame 9001:8610   hold 3000ms  ->  9001:8628   (instant)
      frame 9001:8628   hold 5000ms  ->  9001:8663   SMART_ANIMATE 6000ms
      frame 9001:8663   hold 1500ms  ->  9001:8705   SMART_ANIMATE 4500ms

  Total 20,000ms. Every number below is that timeline divided by 20,000, so
  the sections land at the same relative moments they do in the prototype —
  only the clock is now the scrollbar instead of a timer.

  The hero's words carry their own stagger, also from the file:

      Redefine  t=0ms     SMART_ANIMATE 300ms EASE_OUT
      Ocean     t=75ms    300ms EASE_OUT
      Speed     t=150ms   300ms EASE_OUT
      body l.1  t=200ms   ·  l.2  t=275ms  ·  l.3  t=350ms

  And the three content groups are a vertical filmstrip with parallax — they
  do not travel as one block. Measured off the four frames:

      frame      Group 53      Group 54       Group 55
      8610       186           -              -
      8628       186           1050           -
      8663       -774          105            740
      8705       -             -1115          144

  Group 53 moves -960 through the first transition while Group 54 moves -945;
  through the second, Group 54 moves -1220 while Group 55 moves only -596.
*/

export const TOTAL_MS = 20000
export const SCROLL_VH = 620

const at = (ms: number) => ms / TOTAL_MS

/** Phase windows as scroll progress. */
export const P = {
  /* the hero's words, 0-350ms plus a 300ms animation */
  word: [at(0), at(300)],
  word2: [at(75), at(375)],
  word3: [at(150), at(450)],
  body1: [at(200), at(500)],
  body2: [at(275), at(575)],
  body3: [at(350), at(650)],
  /* Component 4 / 5, the efficiency card: t=200ms, SMART_ANIMATE 2084ms SLOW */
  stat: [at(200), at(2284)],
  /* Group 54 arrives */
  g54In: [at(3000), at(3600)],
  /* the 6000ms transition */
  move1: [at(8000), at(14000)],
  /* the 4500ms transition, compressed to land at 0.90 so the settled
     composition holds for a beat before the footer - the prototype loops
     and never needed that pause */
  move2: [at(15500), 0.9],
} as const

/** Where each group sits, per the four frames. */
export const G = {
  g53: { start: 186, end: -774 },
  g54: { enter: 1050, mid: 105, end: -1115 },
  g55: { enter: 1400, mid: 740, end: 144 },
} as const

/** Clip A owns the first half of the scroll, clip B the second. */
export const VIDEO_SEAM = 0.5

/** 0 before `a`, 1 after `b`, cubic-eased between. */
export function span(p: number, [a, b]: readonly [number, number]) {
  if (p <= a) return 0
  if (p >= b) return 1
  const t = (p - a) / (b - a)
  return 1 - Math.pow(1 - t, 3)
}

/** Linear ramp, for positions that should track the scrollbar exactly. */
export function ramp(p: number, [a, b]: readonly [number, number]) {
  if (p <= a) return 0
  if (p >= b) return 1
  return (p - a) / (b - a)
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
