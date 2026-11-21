<script setup lang="ts">
const root = ref<HTMLElement>()
const chart = ref<HTMLElement>()
const line = ref<SVGPathElement>()
const area = ref<SVGPathElement>()
const toasts = ref<HTMLElement>()
const toastsIn = ref(false)
const bars = ref<HTMLElement>()
const ring = ref<HTMLElement>()
const ringFill = ref<SVGCircleElement>()

// deterministic equity curve
const curve = (() => {
  const pts: [number, number][] = []
  let y = 150
  for (let i = 0; i <= 40; i++) {
    const x = (i / 40) * 600
    y += Math.sin(i * 1.7) * 9 + Math.cos(i * 0.6) * 6 - 3.2
    pts.push([x, Math.max(20, Math.min(190, y))])
  }
  const line = pts.map(([x, yy], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${yy.toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]!
  return { line, area: `${line} L600 220 L0 220 Z`, endX: last[0], endY: last[1] }
})()

const payouts = [
  { name: 'M. Okafor', amt: '$4,820', t: '2m ago' },
  { name: 'L. Fernández', amt: '$12,310', t: '9m ago' },
  { name: 'A. Novak', amt: '$2,045', t: '14m ago' }
]
const scaling = [10, 25, 50, 100, 200]

// spotlight that follows the cursor on each card
const onMove = (e: PointerEvent) => {
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}

const cleanups: (() => void)[] = []
onMounted(() => {
  const barEls = [...(bars.value?.querySelectorAll<HTMLElement>('.bn__bar') ?? [])] // DOM order
  cleanups.push(
    // equity curve draws itself as you scroll
    scrollScene(chart.value, 'top 85%', 'bottom 40%', (p) => {
      line.value?.style.setProperty('stroke-dashoffset', (1 - p).toFixed(4))
    }),
    scrollScene(chart.value, 'top 60%', 'bottom 40%', (p) => {
      if (area.value) area.value.style.opacity = p.toFixed(3)
    }),
    // payout toasts slide in once (CSS transition, staggered with --i)
    onEnter(toasts.value, () => (toastsIn.value = true), 85),
    // scaling bars grow one after another
    scrollScene(bars.value, 'top 90%', 'bottom 60%', (p) => {
      const n = barEls.length
      barEls.forEach((b, i) => (b.style.transform = `scaleY(${staggered(p, i, n, 0.08).toFixed(4)})`))
    }),
    // profit-split ring fills to 90%
    scrollScene(ring.value, 'top 90%', 'bottom 55%', (p) => {
      ringFill.value?.style.setProperty('stroke-dashoffset', lerp(1, 0.1, p).toFixed(4))
    })
  )
})
onBeforeUnmount(() => cleanups.forEach((fn) => fn()))
</script>

<template>
  <section id="payouts" ref="root" class="bn section">
    <div class="container">
      <div class="bn__head">
        <span class="eyebrow" v-reveal>Built for funded traders</span>
        <SplitText class="h-xl" text="Everything you need.|*Nothing* you don't." />
      </div>

      <div class="bn__grid">
        <!-- Payouts -->
        <article class="bn__card bn__card--wide" v-reveal @pointermove="onMove">
          <div class="bn__txt">
            <span class="chip">Payouts</span>
            <h3>Paid in 24 hours. Every time.</h3>
            <p>Request every 14 days. Bank transfer, card or USDT — processed within one business day.</p>
          </div>
          <div ref="chart" class="bn__chart">
            <svg viewBox="0 0 600 220" preserveAspectRatio="none">
              <defs>
                <linearGradient id="bn-stroke" x1="0" x2="1">
                  <stop offset="0" stop-color="#8fc400" />
                  <stop offset="1" stop-color="#d9ff7a" />
                </linearGradient>
                <linearGradient id="bn-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#b6f500" stop-opacity=".2" />
                  <stop offset="1" stop-color="#b6f500" stop-opacity="0" />
                </linearGradient>
              </defs>
              <g stroke="rgba(255,255,255,0.05)" stroke-width="1" stroke-dasharray="4 6">
                <line x1="0" y1="55" x2="600" y2="55" />
                <line x1="0" y1="110" x2="600" y2="110" />
                <line x1="0" y1="165" x2="600" y2="165" />
              </g>
              <path ref="area" class="bn__area" :d="curve.area" fill="url(#bn-fill)" />
              <path
                ref="line"
                class="bn__line"
                :d="curve.line"
                fill="none"
                stroke="url(#bn-stroke)"
                stroke-width="3"
                pathLength="1"
                stroke-dasharray="1"
                vector-effect="non-scaling-stroke"
              />
              <circle class="bn__tip" :cx="curve.endX" :cy="curve.endY" r="5" fill="#d9ff7a" />
            </svg>
            <div ref="toasts" class="bn__toasts" :class="{ 'is-in': toastsIn }">
              <div v-for="(p, i) in payouts" :key="p.name" class="bn__toast" :style="{ '--i': i }">
                <i />
                <div>
                  <strong>{{ p.amt }}</strong> paid to {{ p.name }}
                  <small>{{ p.t }}</small>
                </div>
              </div>
            </div>
          </div>
        </article>

        <!-- Split -->
        <article class="bn__card" v-reveal="100" @pointermove="onMove">
          <span class="chip">Profit split</span>
          <div ref="ring" class="bn__ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="10" />
              <circle
                ref="ringFill"
                class="bn__ring-fill"
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="url(#bn-stroke)"
                stroke-width="10"
                stroke-linecap="round"
                pathLength="1"
                stroke-dasharray="1"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <strong>90%</strong>
          </div>
          <h3>Keep up to 90%</h3>
          <p>Start at 80%, unlock 90% after your third payout.</p>
        </article>

        <!-- Scaling -->
        <article class="bn__card" v-reveal @pointermove="onMove">
          <span class="chip">Scaling plan</span>
          <div ref="bars" class="bn__bars">
            <div v-for="(s, i) in scaling" :key="s" class="bn__bar-wrap">
              <div class="bn__bar" :style="{ height: `${20 + i * 18}%` }" />
              <span>${{ s }}K</span>
            </div>
          </div>
          <h3>Grow to $2M</h3>
          <p>+25% capital every 3 profitable months.</p>
        </article>

        <!-- Platforms -->
        <article class="bn__card" v-reveal="100" @pointermove="onMove">
          <span class="chip">Platforms</span>
          <div class="bn__platforms">
            <div class="bn__pf"><b>n</b>nTrader</div>
            <div class="bn__pf"><b>5</b>MetaTrader 5</div>
          </div>
          <h3>Pro terminals, everywhere</h3>
          <p>Desktop, web and mobile — one login across every screen.</p>
        </article>

        <!-- Rules -->
        <article class="bn__card bn__card--dark" v-reveal="200" @pointermove="onMove">
          <span class="chip dark">Trader-first rules</span>
          <ul class="bn__list">
            <li>No time limits</li>
            <li>News trading allowed</li>
            <li>Weekend holding</li>
            <li>EAs &amp; copy trading</li>
          </ul>
          <h3>Trade your strategy</h3>
          <p>No hidden rules. If it's a real edge, it's welcome here.</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bn__head :deep(h2) {
  margin-top: 18px;
}
.bn__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-top: 64px;
}
.bn__card {
  --mx: 50%;
  --my: 50%;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 28px;
  border-radius: var(--radius);
  background: linear-gradient(180deg, var(--panel-2), var(--panel));
  border: 1px solid var(--line);
  overflow: hidden;
  isolation: isolate;
  transition:
    transform 0.8s var(--ease-out),
    box-shadow 0.6s var(--ease-out),
    opacity 1s var(--ease-out) var(--reveal-delay, 0ms);
}
.bn__card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: radial-gradient(420px circle at var(--mx) var(--my), rgba(var(--green-rgb), 0.1), rgba(var(--green-rgb), 0.04) 40%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s;
}
.bn__card::after {
  /* neon border that follows the cursor */
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.5px;
  background: radial-gradient(260px circle at var(--mx) var(--my), var(--neon), rgba(var(--green-rgb), 0.3) 45%, transparent 70%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}
.bn__card:hover {
  transform: translateY(-4px);
  box-shadow: 0 40px 80px -40px rgba(var(--green-rgb), 0.4);
}
.bn__card:hover::before,
.bn__card:hover::after {
  opacity: 1;
}
.bn__card .chip {
  align-self: flex-start;
}
.bn__card h3 {
  font-size: 26px;
  margin-top: auto;
}
.bn__card p {
  color: var(--muted);
}
.bn__card--wide {
  grid-column: span 2;
  grid-row: span 2;
  display: grid;
  grid-template-rows: auto 1fr;
}
.bn__card--wide h3 {
  font-size: clamp(30px, 3.2vw, 46px);
  margin-top: 14px;
  max-width: 14ch;
}
.bn__card--wide p {
  margin-top: 10px;
  max-width: 44ch;
}
.bn__chart {
  position: relative;
  min-height: 260px;
  margin: 10px -28px -28px;
}
.bn__chart svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.bn__line {
  stroke-dashoffset: 1;
  filter: drop-shadow(0 4px 10px rgba(var(--green-rgb), 0.4));
}
.bn__area {
  opacity: 0;
}
.bn__tip {
  filter: drop-shadow(0 0 8px rgba(var(--green-rgb), 0.9));
}
.bn__ring-fill {
  stroke-dashoffset: 1;
}
.bn__toasts {
  position: absolute;
  right: 24px;
  top: 0;
  display: grid;
  gap: 10px;
}
.bn__toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(20, 22, 26, 0.94);
  border: 1px solid var(--line-strong);
  box-shadow: 0 14px 30px -20px rgba(0, 0, 0, 0.8);
  font-size: 13px;
  opacity: 0;
  transform: translate3d(40px, 0, 0);
  transition:
    opacity 1s var(--ease-out),
    transform 1s var(--ease-out);
  transition-delay: calc(var(--i, 0) * 150ms);
}
.bn__toasts.is-in .bn__toast {
  opacity: 1;
  transform: none;
}
.bn__toast i {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--green-hi), var(--green-2));
  flex-shrink: 0;
}
.bn__toast small {
  display: block;
  color: var(--muted);
  font-size: 11px;
}
.bn__ring {
  position: relative;
  width: 132px;
  margin: 10px 0;
}
.bn__ring strong {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-size: 32px;
  letter-spacing: -0.04em;
}
.bn__bars {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 140px;
}
.bn__bar-wrap {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--muted);
  text-align: center;
}
.bn__bar {
  border-radius: 10px;
  background: linear-gradient(180deg, var(--green), rgba(var(--green-rgb), 0.1));
  transform-origin: bottom;
  transform: scaleY(0);
  will-change: transform;
}
.bn__platforms {
  display: grid;
  gap: 10px;
  margin: 10px 0;
}
.bn__pf {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  background: var(--bg-soft);
  font-weight: 600;
}
.bn__pf b {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: var(--on-green);
  background: linear-gradient(135deg, var(--green-hi), var(--green-2));
  font-family: var(--font-display);
}
.bn__pf:last-child b {
  color: var(--on-neon);
  background: var(--neon-grad);
}
.bn__card--dark {
  grid-column: span 2;
  background:
    radial-gradient(60% 120% at 100% 0%, rgba(var(--green-rgb), 0.18), transparent 70%),
    radial-gradient(50% 120% at 0% 100%, rgba(var(--green-rgb), 0.16), transparent 70%),
    var(--panel);
  color: #fff;
  border-color: var(--line-strong);
}
.bn__card--dark p {
  color: rgba(255, 255, 255, 0.6);
}
.chip.dark {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}
.bn__list {
  list-style: none;
  padding: 0;
  margin: 10px 0;
  display: grid;
  gap: 10px;
}
.bn__list li {
  display: flex;
  align-items: center;
  gap: 10px;
}
.bn__list li::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 10px var(--green);
}
@media (max-width: 960px) {
  .bn__grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 640px) {
  .bn__grid {
    grid-template-columns: 1fr;
  }
  .bn__card--wide,
  .bn__card--dark {
    grid-column: auto;
    grid-row: auto;
  }
  .bn__toasts {
    display: none;
  }
}
</style>
