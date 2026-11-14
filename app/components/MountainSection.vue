<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
// Still image exported from the three.js mountain (app/components/MountainScene.vue via /dev/mountain
// or `npm run export:mountain`). Imported from assets so every export gets a new hashed URL → no stale cache.
import mountainSrc from '~/assets/images/mountain.webp'

/**
 * No WebGL runs here: the mountain is that exported still. Motion comes from cheap transforms:
 * scroll rise + scale, a pointer parallax, and a neon sheen masked to the rock's silhouette.
 */
const maskUrl = `url("${mountainSrc}")`
const root = ref<HTMLElement>()
const stage = ref<HTMLElement>()
const rockImg = ref<HTMLImageElement>()
const { $scrollTo } = useNuxtApp()
const letters = 'ARTIX'.split('')

let ctx: gsap.Context | undefined
let onMove: ((e: PointerEvent) => void) | undefined

onMounted(() => {
  // decode the 2400px still ahead of time (off the main thread) so it doesn't hitch when it scrolls in
  rockImg.value?.decode?.().catch(() => {})
  gsap.registerPlugin(ScrollTrigger)
  ctx = gsap.context(() => {
    // the rock rises out of the page edge and settles as you scroll
    gsap.fromTo(
      '.mt__rock',
      { yPercent: 28, scale: 0.92 },
      { yPercent: 0, scale: 1.04, ease: 'none', scrollTrigger: { trigger: root.value, start: 'top 80%', end: 'bottom bottom', scrub: true } }
    )
    // neon light sweeps across the crystals — moved with transform (GPU), never repainted
    gsap.fromTo(
      '.mt__sheen-band',
      { xPercent: -130 },
      { xPercent: 230, ease: 'none', scrollTrigger: { trigger: root.value, start: 'top 60%', end: 'bottom top', scrub: true } }
    )
    // giant backdrop letters rise in, then drift apart
    gsap.fromTo(
      '.mt__letter',
      { yPercent: 40, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        stagger: 0.06,
        ease: 'none',
        scrollTrigger: { trigger: root.value, start: 'top 75%', end: 'center center', scrub: true }
      }
    )
    // letters drift apart with transforms (animating letter-spacing would re-run layout every frame)
    gsap.to('.mt__letter', {
      x: (i: number) => (i - (letters.length - 1) / 2) * 60,
      ease: 'none',
      scrollTrigger: { trigger: root.value, start: 'center center', end: 'bottom top', scrub: true }
    })
    gsap.to('.mt__aura', { scale: 1.2, rotate: 18, ease: 'none', scrollTrigger: { trigger: root.value, scrub: true } })
  }, root.value)

  // pointer parallax (transform only → GPU composited)
  if (window.matchMedia('(pointer: fine)').matches && stage.value) {
    const xTo = gsap.quickTo(stage.value, 'x', { duration: 1.2, ease: 'power3.out' })
    const rTo = gsap.quickTo(stage.value, 'rotationY', { duration: 1.2, ease: 'power3.out' })
    onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5
      xTo(nx * -30)
      rTo(nx * 4)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
  }
})
onBeforeUnmount(() => {
  ctx?.revert()
  if (onMove) window.removeEventListener('pointermove', onMove)
})
</script>

<template>
  <section ref="root" class="mt">
    <div class="mt__aura" />

    <div class="mt__copy container">
      <span class="eyebrow" v-reveal>Built on Artix Capital</span>
      <SplitText tag="h2" class="h-xl" text="Where serious traders|gain their *advantage.*" />
      <p class="lead" v-reveal="200">
        Trusted infrastructure from a live brokerage — transparent pricing, a professional terminal and support
        that scales with your growth.
      </p>
      <a v-reveal="320" href="#challenges" class="btn btn-ghost" @click.prevent="$scrollTo?.('#challenges')">
        Get Funded Today <span class="arrow">→</span>
      </a>
    </div>

    <div class="mt__letters" aria-hidden="true">
      <span v-for="(l, i) in letters" :key="i" class="mt__letter">{{ l }}</span>
    </div>

    <div class="mt__stage" aria-hidden="true">
      <div ref="stage" class="mt__parallax">
        <div class="mt__rock">
          <!-- eager + async decode: decoded off-thread during page load, not mid-scroll -->
          <img ref="rockImg" :src="mountainSrc" alt="" width="2400" height="1200" loading="eager" decoding="async" fetchpriority="low" />
          <div class="mt__sheen"><span class="mt__sheen-band" /></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mt {
  position: relative;
  min-height: 150svh;
  overflow: hidden;
  isolation: isolate;
  background: #fff;
}
.mt__aura {
  position: absolute;
  inset: -10% -10% 10%;
  z-index: -2;
  /* no CSS blur: the radial gradients are already soft, and a blur on a layer this size is costly */
  will-change: transform;
  background:
    radial-gradient(40% 35% at 20% 40%, rgba(255, 184, 0, 0.16), transparent 70%),
    radial-gradient(38% 38% at 50% 30%, rgba(255, 184, 0, 0.3), transparent 70%),
    radial-gradient(40% 40% at 82% 55%, rgba(255, 184, 0, 0.18), transparent 70%);
}
.mt__copy {
  position: sticky;
  top: 18vh;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  padding-top: 18vh;
  text-align: center;
}
.mt__copy :deep(h2) {
  color: #1d1d24;
}
.mt__copy .lead {
  text-align: center;
}
.mt__copy .btn {
  margin-top: 8px;
}
.mt__letters {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 8vh;
  z-index: -1;
  display: flex;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 30vw;
  line-height: 0.8;
  letter-spacing: -0.02em;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 1px rgba(11, 11, 18, 0.05);
  pointer-events: none;
  user-select: none;
}
.mt__letter {
  display: inline-block;
  will-change: transform, opacity;
}
.mt__stage {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  justify-content: center;
  perspective: 1200px;
  pointer-events: none;
}
.mt__parallax {
  width: min(1700px, 118vw);
  will-change: transform;
}
.mt__rock {
  position: relative;
  transform-origin: 50% 100%;
  will-change: transform;
  /* fade the base into the page instead of a hard cut */
  -webkit-mask-image: linear-gradient(to bottom, #000 62%, transparent 96%);
  mask-image: linear-gradient(to bottom, #000 62%, transparent 96%);
}
.mt__rock img {
  display: block;
  width: 100%;
  height: auto;
}
/* neon light sweep, clipped to the rock's silhouette.
   The mask is static; only the inner band moves (transform) → composited, no repaint, no blend mode. */
.mt__sheen {
  position: absolute;
  inset: 0;
  overflow: hidden;
  -webkit-mask: v-bind(maskUrl) center / 100% 100% no-repeat;
  mask: v-bind(maskUrl) center / 100% 100% no-repeat;
  pointer-events: none;
}
.mt__sheen-band {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 45%;
  background: linear-gradient(105deg, transparent 10%, rgba(255, 196, 40, 0.38) 50%, transparent 90%);
  will-change: transform;
}
@media (max-width: 760px) {
  .mt {
    min-height: 120svh;
  }
  .mt__parallax {
    width: 170vw;
  }
}
</style>
