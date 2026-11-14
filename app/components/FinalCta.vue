<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const root = ref<HTMLElement>()
const btn = ref<HTMLElement>()
const { $scrollTo } = useNuxtApp()

// magnetic button
const onMove = (e: PointerEvent) => {
  const el = btn.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const x = e.clientX - (r.left + r.width / 2)
  const y = e.clientY - (r.top + r.height / 2)
  gsap.to(el, { x: x * 0.3, y: y * 0.4, duration: 0.6, ease: 'power3.out' })
}
const onLeave = () => btn.value && gsap.to(btn.value, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' })

let ctx: gsap.Context | undefined
onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  ctx = gsap.context(() => {
    gsap.fromTo(
      '.cta__panel',
      { clipPath: 'inset(12% 8% 12% 8% round 48px)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 32px)',
        ease: 'none',
        scrollTrigger: { trigger: root.value, start: 'top 90%', end: 'top 25%', scrub: true }
      }
    )
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section ref="root" class="cta">
    <div class="cta__panel">
      <div class="cta__aurora" />
      <div class="cta__grid" />
      <div class="cta__inner" @pointermove="onMove" @pointerleave="onLeave">
        <span class="eyebrow on-dark">Ready when you are</span>
        <SplitText class="h-display" text="Your capital|is *waiting.*" />
        <p>Start a challenge in under two minutes. Fee refunded with your first payout.</p>
        <a ref="btn" href="#challenges" class="btn btn-primary light cta__btn" @click.prevent="$scrollTo?.('#challenges')">
          Get Funded Now <span class="arrow">→</span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta {
  padding: 40px 12px;
}
.cta__panel {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  border-radius: 32px;
  background: #07070d;
  color: #fff;
  min-height: 80svh;
  display: grid;
  place-items: center;
}
.cta__aurora {
  position: absolute;
  inset: -30%;
  z-index: -2;
  background:
    radial-gradient(30% 30% at 30% 60%, rgba(255, 184, 0, 0.55), transparent 70%),
    radial-gradient(28% 28% at 72% 40%, rgba(255, 184, 0, 0.35), transparent 70%),
    radial-gradient(30% 35% at 50% 85%, rgba(255, 184, 0, 0.45), transparent 70%);
  filter: blur(60px);
  animation: drift 16s ease-in-out infinite alternate;
}
@keyframes drift {
  to {
    transform: rotate(40deg) scale(1.15);
  }
}
.cta__grid {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(60% 60% at 50% 50%, #000, transparent);
}
.cta__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
  padding: 80px 24px;
  text-align: center;
}
.eyebrow.on-dark {
  color: rgba(255, 255, 255, 0.7);
}
.cta__inner p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
}
.btn-primary.light {
  background: #fff;
  color: var(--ink);
}
.cta__btn {
  --h: 64px;
  padding: 0 36px;
  font-size: 17px;
  margin-top: 10px;
}
</style>
