<script setup lang="ts">
const root = ref<HTMLElement>()
const content = ref<HTMLElement>()
const progress = ref(0)
const { $scrollTo } = useNuxtApp()

const line1 = ['Trade', 'our', 'capital,']
const line2 = ['keep', 'the', 'profit.']

const stats = [
  { v: '$200K', l: 'Max allocation' },
  { v: '90%', l: 'Profit split' },
  { v: '24h', l: 'Payouts' },
  { v: '150+', l: 'Instruments' }
]

// sparkles scattered over the panel (left/top in %, twinkle delay)
const sparkles = [
  [6, 18, 0], [22, 62, 1.4], [38, 12, 2.2], [57, 30, 0.6], [74, 14, 3], [91, 24, 1.1], [88, 70, 2.6], [12, 84, 1.9], [64, 88, 0.3]
]

let stop: (() => void) | undefined
onMounted(() => {
  // as the hero leaves, the coins lift and part, and the copy drifts up and fades
  stop = scrollScene(root.value, 'top top', 'bottom top', (p) => {
    progress.value = p
    if (content.value) {
      content.value.style.transform = `translate3d(0, ${(-60 * p).toFixed(2)}px, 0)`
      content.value.style.opacity = (1 - p * 1.4).toFixed(3)
    }
  })
})
onBeforeUnmount(() => stop?.())
</script>

<template>
  <section id="top" ref="root" v-offscreen-pause class="hc">
    <div class="hc__clip" aria-hidden="true">
      <div class="hc__halo" />
      <i v-for="(s, i) in sparkles" :key="i" class="sparkle" :style="{ left: `${s[0]}%`, top: `${s[1]}%`, '--tw': `${s[2]}s` }" />
    </div>
    <div class="hc__panel">

      <div class="hc__coins">
        <ClientOnly><CoinsCanvas :progress="progress" /></ClientOnly>
      </div>

      <div ref="content" class="hc__content">
        <div class="hc__kicker" v-reveal>
          <span class="live-dot" aria-hidden="true" />
          <span>LIVE EVALUATIONS</span>
          <i aria-hidden="true" />
          <span>INSTANT CREDENTIALS</span>
        </div>
        <div class="hc__head" v-inview>
          <h1 class="hc__title" aria-label="Trade our capital, keep the profit.">
            <span class="hc__line" aria-hidden="true">
              <template v-for="(w, i) in line1" :key="w"
                ><span class="split-line"><span :style="{ '--d': `${i * 70}ms` }">{{ w }}</span></span>{{ ' ' }}</template
              >
            </span>
            <span class="hc__line" aria-hidden="true">
              <span class="split-line hc__pill-wrap"
                ><span :style="{ '--d': '200ms' }"><span class="pill hc__pill">$200K <i>↗</i></span></span></span
              >{{ ' ' }}<template v-for="(w, i) in line2" :key="w"
                ><span class="split-line"><span :style="{ '--d': `${260 + i * 70}ms` }">{{ w }}</span></span>{{ ' ' }}</template
              >
            </span>
          </h1>
          <p class="hc__caption" v-reveal="450">
            The prop trading program of Artix Capital. Pass one evaluation, trade up to $200K and keep up to 90%.
          </p>
        </div>
      </div>

      <div class="hc__foot">
        <div class="hc__ctas">
          <a href="#challenges" class="btn btn-primary" @click.prevent="$scrollTo?.('#challenges')">
            Start a Challenge <span class="arrow">→</span>
          </a>
          <a href="#how" class="btn btn-ghost" @click.prevent="$scrollTo?.('#how')">How it works</a>
        </div>
        <dl class="hc__stats">
          <div v-for="s in stats" :key="s.l">
            <dt>{{ s.l }}</dt>
            <dd>{{ s.v }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* no card: the hero sits straight on the page background (the body grid shows through) */
.hc {
  position: relative;
  overflow: hidden;
}
.hc__panel {
  position: relative;
  max-width: 1480px;
  margin: 0 auto;
  height: max(700px, 100svh);
  padding-top: 84px; /* clears the fixed nav */
}
.hc__clip {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.hc__halo {
  position: absolute;
  inset: 0;
  /* fade out at the bottom so the hero melts into the next section */
  -webkit-mask-image: linear-gradient(180deg, #000 60%, transparent);
  mask-image: linear-gradient(180deg, #000 60%, transparent);
  background:
    radial-gradient(30% 34% at 22% 70%, rgba(255, 255, 255, 0.05), transparent 70%),
    radial-gradient(30% 34% at 78% 70%, rgba(var(--green-rgb), 0.18), transparent 70%),
    radial-gradient(40% 30% at 50% 78%, rgba(255, 255, 255, 0.05), transparent 70%);
}

.hc__coins {
  position: absolute;
  left: 0;
  right: 0;
  top: 30%;
  bottom: 10px;
}

.hc__content {
  position: relative;
  z-index: 2;
  padding: clamp(24px, 3.8vw, 48px) clamp(22px, 4.5vw, 64px) 0;
  will-change: transform, opacity;
}
.hc__kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  padding: 6px 14px;
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--ink-2);
  background: rgba(14, 16, 19, 0.72);
  border: 1px solid rgba(var(--green-rgb), 0.25);
  box-shadow: 0 0 24px -10px rgba(var(--green-rgb), 0.45);
}
.hc__kicker i {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--muted);
}
.hc__head {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: start;
  gap: 24px 48px;
}
.hc__title {
  grid-row: 1 / span 2;
  font-size: clamp(42px, 6.3vw, 108px);
  font-weight: 600;
  letter-spacing: -0.045em;
  line-height: 0.98;
}
.hc__line {
  display: block;
}
.hc__line:last-child {
  color: rgba(243, 244, 246, 0.62);
}
.hc__pill-wrap {
  vertical-align: middle;
}
/* pill sits in the headline line like a word: ~0.74 of the cap height, its label at 0.42em */
.hc__pill {
  font-size: 0.42em;
  height: 1.76em;
  padding: 0 0.75em;
  letter-spacing: -0.03em;
  transform: translateY(-0.1em);
  /* the word mask (overflow hidden) would cut an outer shadow into a box */
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2) inset;
}
.hc__pill i {
  font-style: normal;
  font-size: 0.8em;
}
.hc__caption {
  grid-column: 2;
  max-width: 27ch;
  margin-top: 0.8em;
  font-size: clamp(14px, 1.1vw, 16px);
  color: var(--ink-2);
  line-height: 1.5;
}

.hc__foot {
  position: absolute;
  z-index: 2;
  left: clamp(22px, 4.5vw, 64px);
  right: clamp(22px, 4.5vw, 64px);
  bottom: clamp(22px, 3vw, 34px);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  animation: hc-in 1.2s 0.7s var(--ease-out) both;
}
@keyframes hc-in {
  from {
    opacity: 0;
    transform: translate3d(0, 24px, 0);
  }
}
.hc__ctas {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.hc__stats {
  display: flex;
  margin: 0;
}
.hc__stats div {
  padding: 0 22px;
  border-left: 1px solid var(--line-strong);
}
.hc__stats dt {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.hc__stats dd {
  margin: 4px 0 0;
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.03em;
}

@media (max-width: 1100px) {
  .hc__stats {
    display: none;
  }
}
@media (max-width: 760px) {
  .hc__panel {
    height: max(660px, 100svh);
    padding-top: 76px;
  }
  .hc__head {
    grid-template-columns: 1fr;
  }
  .hc__title {
    grid-row: auto;
    font-size: 8.4vw;
  }
  .hc__caption {
    grid-column: 1;
    margin-top: 0;
  }
  .hc__coins {
    top: 36%;
    bottom: 130px;
  }
  .hc__ctas .btn {
    flex: 1;
  }
}
</style>
