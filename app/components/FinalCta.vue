<script setup lang="ts">
const root = ref<HTMLElement>()
const panel = ref<HTMLElement>()
const btn = ref<HTMLElement>()
const { $scrollTo } = useNuxtApp()

// magnetic button: the CSS transition does the easing (.cta__btn / .cta__btn.is-back)
const onMove = (e: PointerEvent) => {
  const el = btn.value
  if (!el) return
  // offsetLeft/Top ignore transforms, so the pull never feeds back into its own measurement
  const host = (el.offsetParent as HTMLElement | null) ?? document.body
  const r = host.getBoundingClientRect()
  const cx = r.left + el.offsetLeft + el.offsetWidth / 2
  const cy = r.top + el.offsetTop + el.offsetHeight / 2
  const x = (e.clientX - cx) * 0.3
  const y = (e.clientY - cy) * 0.4
  el.classList.remove('is-back')
  el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
}
const onLeave = () => {
  const el = btn.value
  if (!el) return
  el.classList.add('is-back')
  el.style.transform = 'translate3d(0, 0, 0)'
}

let stop: (() => void) | undefined
onMounted(() => {
  // the panel opens up to full bleed as it scrolls in
  stop = scrollScene(root.value, 'top 90%', 'top 25%', (p) => {
    if (!panel.value) return
    const q = 1 - p
    panel.value.style.clipPath = `inset(${(12 * q).toFixed(2)}% ${(8 * q).toFixed(2)}% ${(12 * q).toFixed(2)}% ${(8 * q).toFixed(2)}% round ${(32 + 16 * q).toFixed(1)}px)`
  })
})
onBeforeUnmount(() => stop?.())
</script>

<template>
  <section ref="root" v-offscreen-pause class="cta">
    <div class="cta__stage">
      <div ref="panel" class="cta__panel">
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
      <BearMascot pose="peek" decorative class="cta__peek" />
    </div>
  </section>
</template>

<style scoped>
.cta {
  padding: 40px 12px 64px;
}
.cta__stage {
  position: relative;
}
.cta__panel {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  border-radius: 32px;
  background: var(--panel);
  color: #fff;
  box-shadow:
    0 0 0 1px rgba(var(--green-rgb), 0.26) inset,
    0 1px 0 rgba(var(--green-rgb), 0.45) inset;
  min-height: 80svh;
  display: grid;
  place-items: center;
}
.cta__aurora {
  position: absolute;
  inset: -30%;
  z-index: -2;
  background:
    radial-gradient(30% 30% at 30% 60%, rgba(var(--green-rgb), 0.35), transparent 70%),
    radial-gradient(28% 28% at 72% 40%, rgba(var(--green-rgb), 0.4), transparent 70%),
    radial-gradient(30% 35% at 50% 85%, rgba(255, 255, 255, 0.08), transparent 70%);
  /* no blur filter: the radial gradients are already soft, and a blurred layer this large is costly */
  will-change: transform;
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
/* paws grip over the outside of the card's bottom edge so the bear never floats */
.cta__peek {
  position: absolute;
  right: 7%;
  bottom: 0;
  z-index: 2;
  width: clamp(180px, 20vw, 290px);
  transform-origin: 50% 88%;
  transform: translateY(12%);
  filter: drop-shadow(0 16px 28px rgba(0, 0, 0, 0.72));
  transition: transform 0.6s var(--ease-out);
}
.cta__stage:hover .cta__peek {
  transform: translateY(12%) scale(1.045);
}
@media (max-width: 760px) {
  .cta__inner {
    padding-bottom: 190px;
  }
  .cta__peek {
    right: 50%;
    width: 210px;
    transform: translate(50%, 12%);
  }
  .cta__stage:hover .cta__peek {
    transform: translate(50%, 12%) scale(1.03);
  }
}
.btn-primary.light {
  background: #fff;
  color: #0a0b0d;
  box-shadow: 0 0 40px -6px rgba(var(--green-rgb), 0.55);
}
.cta__btn {
  --h: 64px;
  padding: 0 36px;
  font-size: 17px;
  margin-top: 10px;
  transition:
    transform 0.6s cubic-bezier(0.215, 0.61, 0.355, 1),
    box-shadow 0.5s var(--ease-out),
    background 0.3s;
  will-change: transform;
}
/* spring back with a little overshoot */
.cta__btn.is-back {
  transition:
    transform 0.9s cubic-bezier(0.34, 1.8, 0.5, 1),
    box-shadow 0.5s var(--ease-out),
    background 0.3s;
}
</style>
