<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const section = ref<HTMLElement>()
const panel = ref<HTMLElement>()
const copy = ref<HTMLElement>()
const progress = ref(0)
const { $scrollTo } = useNuxtApp()

const stats = [
  { k: '$200K', v: 'Max allocation' },
  { k: '90%', v: 'Profit split' },
  { k: '24h', v: 'Payout processing' },
  { k: '150+', v: 'Instruments' }
]

let ctx: gsap.Context | undefined
onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  ctx = gsap.context(() => {
    // intro
    gsap.from(panel.value!, { scale: 0.94, opacity: 0, duration: 1.6, ease: 'expo.out' })
    gsap.from('.hero__stat', { y: 30, opacity: 0, duration: 1.2, stagger: 0.08, delay: 0.7, ease: 'expo.out' })

    // pinned scroll-driven dive into the black hole
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section.value,
        start: 'top top',
        end: '+=110%',
        scrub: true,
        pin: true,
        onUpdate: (self) => (progress.value = self.progress)
      }
    })
    tl.to(copy.value!, { yPercent: -30, opacity: 0, ease: 'none' }, 0)
      .to('.hero__stats', { y: 60, opacity: 0, ease: 'none' }, 0)
      .to(panel.value!, { borderRadius: 0, top: 0, left: 0, right: 0, bottom: 0, ease: 'none' }, 0)
      .fromTo('.hero__outro', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, ease: 'none' }, 0.45)
  }, section.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section id="top" ref="section" class="hero">
    <div ref="panel" class="hero__panel">
      <ClientOnly><BlackHoleCanvas :progress="progress" /></ClientOnly>
      <div class="hero__grain" />

      <div ref="copy" class="hero__copy">
        <span class="eyebrow on-dark">Artix Capital · Prop Program</span>
        <SplitText tag="h1" class="h-display" text="Get funded.|Up to *$200K.*" :stagger="70" :delay="250" />
        <p class="hero__lead" v-reveal="600">
          Prove your edge in one or two steps, trade Artix capital on nTrader or MetaTrader 5, and keep up to 90% of
          everything you make.
        </p>
        <div class="hero__ctas" v-reveal="750">
          <a href="#challenges" class="btn btn-primary light" @click.prevent="$scrollTo?.('#challenges')">
            Start a Challenge <span class="arrow">→</span>
          </a>
          <a href="#how" class="btn btn-ghost on-dark" @click.prevent="$scrollTo?.('#how')">How it works</a>
        </div>
      </div>

      <div class="hero__outro">
        <p>Pulled in by <span class="grad-text">real capital.</span></p>
      </div>

      <ul class="hero__stats">
        <li v-for="s in stats" :key="s.k" class="hero__stat">
          <strong>{{ s.k }}</strong><span>{{ s.v }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  height: 100svh;
  min-height: 640px;
}
.hero__panel {
  position: absolute;
  inset: 86px 12px 12px;
  overflow: hidden;
  border-radius: 32px;
  background: #05050a;
  color: #fff;
  isolation: isolate;
  box-shadow: 0 40px 120px -50px rgba(255, 184, 0, 0.55);
}
.hero__grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.12;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}
.hero__copy {
  position: absolute;
  z-index: 2;
  left: clamp(24px, 5vw, 72px);
  right: clamp(24px, 5vw, 72px);
  top: clamp(40px, 9vh, 110px);
  max-width: 760px;
}
.eyebrow.on-dark {
  color: rgba(255, 255, 255, 0.75);
}
.hero__copy :deep(h1) {
  margin-top: 22px;
  text-shadow: 0 0 60px rgba(0, 0, 0, 0.6);
}
.hero__lead {
  margin-top: 26px;
  max-width: 46ch;
  font-size: clamp(16px, 1.3vw, 19px);
  color: rgba(255, 255, 255, 0.72);
}
.hero__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}
.btn-primary.light {
  background: #fff;
  color: var(--ink);
}
.hero__outro {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  place-items: center;
  pointer-events: none;
  opacity: 0;
}
.hero__outro p {
  font-family: var(--font-display);
  font-size: clamp(36px, 6vw, 96px);
  font-weight: 600;
  letter-spacing: -0.04em;
  text-align: center;
  /* sits inside the dark event-horizon shadow so it stays readable */
  margin-top: -14vh;
  text-shadow: 0 4px 40px rgba(0, 0, 0, 0.7);
}
.hero__stats {
  position: absolute;
  z-index: 2;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  /* no backdrop blur: it would re-blur the black hole canvas behind it on every frame */
  background: linear-gradient(to top, rgba(5, 5, 10, 0.88), rgba(5, 5, 10, 0.35));
}
.hero__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 22px clamp(20px, 3vw, 40px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}
.hero__stat:last-child {
  border-right: 0;
}
.hero__stat strong {
  font-family: var(--font-display);
  font-size: clamp(22px, 2.4vw, 34px);
  font-weight: 600;
  letter-spacing: -0.03em;
}
.hero__stat span {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
}
@media (max-width: 760px) {
  .hero__panel {
    inset: 80px 8px 8px;
    border-radius: 24px;
  }
  .hero__stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .hero__stat:nth-child(2) {
    border-right: 0;
  }
  .hero__stat {
    padding: 14px 18px;
  }
}
</style>
