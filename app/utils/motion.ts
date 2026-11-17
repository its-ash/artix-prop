/**
 * Tiny native motion engine (replaces GSAP / ScrollTrigger / Lenis across the whole site).
 *
 * - scrollScene(el, start, end, cb): calls cb(progress 0..1) as the page scrolls between two
 *   positions, using ScrollTrigger-style specs ('top 80%', 'center center', 'bottom top').
 *   All triggers share ONE passive scroll listener + one rAF. Positions are measured once
 *   (and again on resize / page height change), so a frame only reads window.scrollY —
 *   no layout reads on scroll, and callbacks write transforms/opacity only.
 * - tween(duration, cb, ease): rAF time-based 0..1 animation, returns a cancel function.
 */

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const ease = {
  linear: (t: number) => t,
  power3Out: (t: number) => 1 - Math.pow(1 - t, 3),
  expoOut: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))
}

/** Per-item progress for a staggered sequence driven by one 0..1 value (GSAP-style stagger). */
export const staggered = (p: number, i: number, n: number, each: number, dur = 0.5) => {
  const total = dur + each * (n - 1)
  return clamp01((p * total - i * each) / dur)
}

type Trigger = {
  el: HTMLElement
  start: string
  end: string
  cb: (p: number) => void
  s: number
  e: number
  last: number
}

const triggers = new Set<Trigger>()
let frame = 0
let ro: ResizeObserver | undefined
let measureQueued = false

const vpOffset = (spec: string, vh: number) => {
  if (spec === 'top') return 0
  if (spec === 'center') return vh / 2
  if (spec === 'bottom') return vh
  if (spec.endsWith('%')) return (parseFloat(spec) / 100) * vh
  return parseFloat(spec) || 0
}

const measure = (t: Trigger) => {
  const r = t.el.getBoundingClientRect()
  const top = r.top + window.scrollY
  const vh = window.innerHeight
  const at = (spec: string) => {
    const [edge = 'top', vp = 'bottom'] = spec.split(' ')
    const y = edge === 'bottom' ? top + r.height : edge === 'center' ? top + r.height / 2 : top
    return y - vpOffset(vp, vh)
  }
  t.s = at(t.start)
  t.e = at(t.end)
  t.last = -1
}

const update = () => {
  frame = 0
  if (measureQueued) {
    measureQueued = false
    triggers.forEach(measure)
  }
  const y = window.scrollY
  triggers.forEach((t) => {
    const p = t.e === t.s ? (y >= t.s ? 1 : 0) : clamp01((y - t.s) / (t.e - t.s))
    if (p !== t.last) {
      t.last = p
      t.cb(p)
    }
  })
}

const schedule = () => {
  if (!frame) frame = requestAnimationFrame(update)
}
const remeasure = () => {
  measureQueued = true
  schedule()
}

const bind = () => {
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', remeasure, { passive: true })
  window.addEventListener('load', remeasure)
  document.fonts?.ready.then(remeasure)
  // page height changes (images, pinned hero spacer, accordion) shift every trigger position
  ro = new ResizeObserver(remeasure)
  ro.observe(document.body)
}
const unbind = () => {
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', remeasure)
  window.removeEventListener('load', remeasure)
  ro?.disconnect()
  ro = undefined
  if (frame) cancelAnimationFrame(frame)
  frame = 0
}

/** Scroll-linked progress between two positions. Returns a cleanup function. */
export function scrollScene(el: HTMLElement | undefined | null, start: string, end: string, cb: (p: number) => void) {
  if (!el || typeof window === 'undefined') return () => {}
  const t: Trigger = { el, start, end, cb, s: 0, e: 0, last: -1 }
  if (!triggers.size) bind()
  triggers.add(t)
  measure(t)
  schedule()
  return () => {
    triggers.delete(t)
    if (!triggers.size) unbind()
  }
}

/** Time-based animation on rAF. cb receives the eased 0..1 value. Returns a cancel function. */
export function tween(duration: number, cb: (t: number) => void, easing: (t: number) => number = ease.expoOut) {
  let id = 0
  const t0 = performance.now()
  const step = (now: number) => {
    const t = clamp01((now - t0) / (duration * 1000))
    cb(easing(t))
    if (t < 1) id = requestAnimationFrame(step)
  }
  id = requestAnimationFrame(step)
  return () => cancelAnimationFrame(id)
}

/** Run cb once when el enters the viewport (top edge above `bottomPct` of the viewport height). */
export function onEnter(el: HTMLElement | undefined | null, cb: () => void, bottomPct = 90) {
  if (!el || typeof window === 'undefined') return () => {}
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect()
        cb()
      }
    },
    { rootMargin: `0px 0px -${100 - bottomPct}% 0px` }
  )
  io.observe(el)
  return () => io.disconnect()
}
