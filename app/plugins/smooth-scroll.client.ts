import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Smooth (inertia) scrolling with Lenis, wired into GSAP ScrollTrigger so that
 * every scroll-driven timeline stays perfectly in sync with the smoothed scroll.
 */
export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger)

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let lenis: Lenis | null = null

  if (!reduceMotion) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis?.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
  }

  const scrollTo = (target: string | number | HTMLElement) => {
    if (lenis) {
      lenis.scrollTo(target as never, { offset: -80, duration: 1.6 })
    } else if (typeof target === 'string') {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return {
    provide: { lenis, scrollTo }
  }
})
