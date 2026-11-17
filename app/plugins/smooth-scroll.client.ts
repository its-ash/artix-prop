/**
 * Anchor scrolling with the browser's native scroller (no scroll-jacking library).
 * Native scrolling is composited by the browser, so it stays smooth on every input device,
 * and the scroll-linked effects in app/utils/motion.ts read it directly.
 */
export default defineNuxtPlugin(() => {
  const NAV_OFFSET = 80

  const scrollTo = (target: string | number | HTMLElement) => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let top: number | undefined
    if (typeof target === 'number') top = target
    else {
      const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
      if (el) top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
    }
    if (top === undefined) return
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return {
    provide: { scrollTo }
  }
})
