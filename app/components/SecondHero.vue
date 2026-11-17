<script setup lang="ts">
const root = ref<HTMLElement>()
const statementEl = ref<HTMLElement>()
const blobA = ref<HTMLElement>()
const blobB = ref<HTMLElement>()
const nums = ref<HTMLElement[]>([])
const statement =
  'We fund disciplined traders, not gamblers. Pass one evaluation, trade on institutional pricing and get paid in 24 hours — every single time.'
const words = statement.split(' ')
const highlight = new Set(['disciplined', 'institutional', '24', 'hours'])

const facts = [
  { to: 0.0, dec: 1, pre: '', suf: ' pips', label: 'Raw spreads from' },
  { to: 150, dec: 0, pre: '', suf: '+', label: 'Tradable instruments' },
  { to: 90, dec: 0, pre: '', suf: '%', label: 'Max profit split' },
  { to: 24, dec: 0, pre: '', suf: '/5', label: 'Human support' }
]

const symbols = ['EUR/USD', 'XAU/USD', 'NAS100', 'US500', 'BTC/USD', 'GER40', 'GBP/USD', 'USD/JPY', 'WTI', 'ETH/USD', 'XAG/USD', 'NVDA']

const cleanups: (() => void)[] = []
onMounted(() => {
  const wordEls = [...(statementEl.value?.querySelectorAll<HTMLElement>('.sh__word') ?? [])] // DOM order
  cleanups.push(
    // scroll-scrubbed word highlight
    scrollScene(statementEl.value, 'top 80%', 'bottom 45%', (p) => {
      const n = wordEls.length
      wordEls.forEach((w, i) => (w.style.opacity = lerp(0.12, 1, staggered(p, i, n, 0.08)).toFixed(3)))
    }),
    // parallax neon blobs
    scrollScene(root.value, 'top bottom', 'bottom top', (p) => {
      if (blobA.value) blobA.value.style.transform = `translate3d(${(20 * p).toFixed(2)}%, ${(-60 * p).toFixed(2)}%, 0)`
      if (blobB.value) blobB.value.style.transform = `translate3d(${(-30 * p).toFixed(2)}%, ${(50 * p).toFixed(2)}%, 0)`
    }),
    // counters roll up once they enter the viewport
    ...nums.value.map((el) =>
      onEnter(el, () => {
        const to = Number(el.dataset.to)
        const dec = Number(el.dataset.dec)
        cleanups.push(tween(2, (t) => (el.textContent = (to * t).toFixed(dec))))
      })
    )
  )
})
onBeforeUnmount(() => cleanups.forEach((fn) => fn()))
</script>

<template>
  <section ref="root" v-offscreen-pause class="sh section">
    <div ref="blobA" class="neon-blob sh__blob--a" />
    <div ref="blobB" class="neon-blob sh__blob--b" />

    <div class="container">
      <span class="eyebrow" v-reveal>Why Artix Prop</span>
      <p ref="statementEl" class="sh__statement">
        <template v-for="(w, i) in words" :key="i"
          ><span class="sh__word" :class="{ 'grad-text': highlight.has(w.replace(/[^a-z0-9]/gi, '')) }">{{
            w
          }}</span>{{ ' ' }}</template
        >
      </p>

      <div class="sh__facts">
        <div v-for="(f, i) in facts" :key="f.label" v-reveal="i * 90" class="sh__fact">
          <div class="sh__value">
            {{ f.pre }}<span ref="nums" class="sh__num" :data-to="f.to" :data-dec="f.dec">{{ f.to.toFixed(f.dec) }}</span>{{ f.suf }}
          </div>
          <div class="sh__label">{{ f.label }}</div>
        </div>
      </div>
    </div>

    <div class="sh__marquee marquee" style="--speed: 50s">
      <div v-for="n in 2" :key="n" class="marquee__track" :aria-hidden="n === 2">
        <span v-for="s in symbols" :key="s" class="sh__sym"><i />{{ s }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sh {
  overflow: hidden;
  padding-bottom: 80px;
}
.sh__blob--a {
  width: 520px;
  height: 520px;
  left: -160px;
  top: 10%;
  background: var(--neon);
  opacity: 0.1;
}
.sh__blob--b {
  width: 520px;
  height: 520px;
  right: -200px;
  bottom: 30%;
  background: #ffffff;
  opacity: 0.05;
}
.sh__statement {
  position: relative;
  margin-top: 28px;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(32px, 4.6vw, 68px);
  line-height: 1.12;
  letter-spacing: -0.035em;
  max-width: 22ch;
}
.sh__word {
  /* own compositor layer per word: the scroll-scrubbed opacity never repaints the paragraph */
  display: inline-block;
  opacity: 0.12;
  will-change: opacity;
}
.sh__facts {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-top: clamp(64px, 9vw, 120px);
  border-top: 1px solid var(--line-strong);
}
.sh__fact {
  padding: 28px 24px 0 0;
}
.sh__value {
  font-family: var(--font-display);
  font-size: clamp(36px, 4.4vw, 64px);
  font-weight: 600;
  letter-spacing: -0.04em;
}
.sh__label {
  margin-top: 6px;
  color: var(--muted);
  font-size: 14px;
}
.sh__marquee {
  margin-top: clamp(72px, 9vw, 120px);
  padding-block: 22px;
  border-block: 1px solid var(--line);
}
.sh__sym {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-display);
  font-size: clamp(22px, 2.4vw, 34px);
  font-weight: 500;
  letter-spacing: -0.02em;
  white-space: nowrap;
}
.sh__sym i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--neon-grad);
  box-shadow: 0 0 14px var(--neon);
}
@media (max-width: 760px) {
  .sh__facts {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
