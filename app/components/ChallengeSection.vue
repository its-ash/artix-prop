<script setup lang="ts">
import { gsap } from 'gsap'
import { models, sizes, fmtMoney } from '~/data/challenges'

const modelIdx = ref(0)
const size = ref<number>(100_000)
const model = computed(() => models[modelIdx.value]!)
const price = computed(() => model.value.prices[size.value] ?? 0)

// animated price
const shown = ref(price.value)
watch(price, (to) => {
  const o = { v: shown.value }
  gsap.to(o, { v: to, duration: 0.8, ease: 'expo.out', onUpdate: () => (shown.value = Math.round(o.v)) })
})

const perks = computed(() => [
  `${fmtMoney(size.value)} simulated capital`,
  model.value.id === 'instant' ? 'Up to 80% profit split' : 'Up to 90% profit split',
  'Bi-weekly payouts, processed in 24h',
  'Fee refunded with your first payout',
  'Trade on nTrader or MetaTrader 5',
  'News & weekend holding allowed'
])

// sliding tab indicator
const tabs = ref<HTMLElement[]>([])
const indicator = reactive({ x: 0, w: 0 })
const sync = () => {
  const el = tabs.value[modelIdx.value]
  if (el) {
    indicator.x = el.offsetLeft
    indicator.w = el.offsetWidth
  }
}
watch(modelIdx, () => nextTick(sync))
onMounted(() => {
  sync()
  window.addEventListener('resize', sync)
  document.fonts?.ready.then(sync)
})
onBeforeUnmount(() => window.removeEventListener('resize', sync))
</script>

<template>
  <section id="challenges" class="ch section">
    <div class="container">
      <header class="ch__head">
        <div>
          <span class="eyebrow" v-reveal>Choose your challenge</span>
          <SplitText class="h-xl" text="Pick a path.|Prove your *edge.*" />
        </div>
        <p class="lead" v-reveal="150">
          Three ways to get funded. Clear rules, no time limits on evaluations, and your fee comes back with your
          first payout.
        </p>
      </header>

      <div class="ch__controls" v-reveal="100">
        <div class="tabs" role="tablist">
          <span class="tabs__ind" :style="{ transform: `translateX(${indicator.x}px)`, width: `${indicator.w}px` }" />
          <button
            v-for="(m, i) in models"
            :key="m.id"
            :ref="(el) => (tabs[i] = el as HTMLElement)"
            role="tab"
            :aria-selected="i === modelIdx"
            :class="{ active: i === modelIdx }"
            @click="modelIdx = i"
          >
            {{ m.name }}
            <em v-if="m.badge">{{ m.badge }}</em>
          </button>
        </div>

        <div class="sizes" role="radiogroup" aria-label="Account size">
          <button
            v-for="s in sizes"
            :key="s"
            role="radio"
            :aria-checked="s === size"
            :class="{ active: s === size }"
            @click="size = s"
          >
            {{ fmtMoney(s) }}
          </button>
        </div>
      </div>

      <div class="ch__grid">
        <div class="card ch__rules" v-reveal="150">
          <div class="ch__rules-head">
            <div>
              <h3>{{ model.name }}</h3>
              <p>{{ model.tagline }}</p>
            </div>
            <span class="chip">Account {{ fmtMoney(size) }}</span>
          </div>
          <Transition name="swap" mode="out-in">
            <table :key="model.id">
              <thead>
                <tr>
                  <th />
                  <th v-for="p in model.phases" :key="p">{{ p }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in model.rules" :key="r.label">
                  <td>{{ r.label }}</td>
                  <td v-for="(v, i) in r.values" :key="i">
                    <strong>{{ v }}</strong>
                    <small v-if="v.endsWith('%') && r.label !== 'Profit split' && v !== '—'">
                      {{ fmtMoneyPct(size, v) }}
                    </small>
                  </td>
                </tr>
              </tbody>
            </table>
          </Transition>
        </div>

        <aside class="ch__price" v-reveal="250">
          <div class="ch__price-glow" />
          <div class="ch__price-inner">
            <span class="eyebrow on-dark">One-time fee</span>
            <div class="ch__amount">
              <span>$</span>{{ shown.toLocaleString('en-US') }}
            </div>
            <p class="ch__refund">Refundable with your first payout</p>
            <ul>
              <li v-for="p in perks" :key="p"><i>✓</i>{{ p }}</li>
            </ul>
            <a href="#" class="btn btn-primary light">Start {{ fmtMoney(size) }} Challenge <span class="arrow">→</span></a>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
const fmtMoneyPct = (size: number, v: string) => {
  const pct = parseFloat(v)
  return Number.isFinite(pct) ? `$${((size * pct) / 100).toLocaleString('en-US')}` : ''
}
</script>

<style scoped>
.ch {
  background: linear-gradient(180deg, #fff 0%, var(--bg-soft) 100%);
}
.ch__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 40px;
  flex-wrap: wrap;
}
.ch__head :deep(h2) {
  margin-top: 18px;
}
.ch__controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px;
  margin-top: 56px;
}
.tabs,
.sizes {
  position: relative;
  display: inline-flex;
  padding: 5px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid var(--line);
  box-shadow: 0 10px 30px -20px rgba(11, 11, 18, 0.3);
  overflow-x: auto;
  max-width: 100%;
  scrollbar-width: none;
}
.tabs button,
.sizes button {
  position: relative;
  z-index: 1;
  height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-2);
  white-space: nowrap;
  transition: color 0.4s;
}
.tabs button.active {
  color: #fff;
}
.tabs button em {
  font-style: normal;
  font-size: 10px;
  margin-left: 6px;
  padding: 2px 7px;
  border-radius: 99px;
  background: var(--neon-grad);
  color: var(--ink);
}
.tabs__ind {
  position: absolute;
  top: 5px;
  bottom: 5px;
  left: 0;
  border-radius: 999px;
  background: var(--ink);
  transition: transform 0.6s var(--ease-out), width 0.6s var(--ease-out);
}
.sizes button.active {
  color: var(--ink);
  background:
    linear-gradient(#fff, #fff) padding-box,
    var(--neon-grad) border-box;
  border: 1.5px solid transparent;
  box-shadow: 0 6px 20px -8px rgba(255, 184, 0, 0.6);
}

.ch__grid {
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: 20px;
  margin-top: 24px;
  align-items: stretch;
}
.ch__rules {
  padding: clamp(22px, 3vw, 36px);
  overflow-x: auto;
}
.ch__rules-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}
.ch__rules-head h3 {
  font-size: 26px;
}
.ch__rules-head p {
  color: var(--muted);
  margin-top: 6px;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
}
th {
  text-align: left;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 500;
  padding: 10px 8px;
}
td {
  padding: 15px 8px;
  border-top: 1px solid var(--line);
  vertical-align: top;
}
td:first-child {
  color: var(--ink-2);
}
td strong {
  font-weight: 600;
}
td small {
  display: block;
  color: var(--muted);
  font-size: 12px;
}
.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.35s var(--ease-out), transform 0.35s var(--ease-out);
}
.swap-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.swap-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.ch__price {
  position: relative;
  border-radius: var(--radius);
  background: #0b0b12;
  color: #fff;
  overflow: hidden;
  isolation: isolate;
}
.ch__price-glow {
  position: absolute;
  inset: -40%;
  z-index: -1;
  background: conic-gradient(from 0deg, var(--neon), transparent 35%, var(--neon) 65%, transparent);
  filter: blur(70px);
  opacity: 0.35;
  animation: spin 14s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.ch__price-inner {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: clamp(24px, 3vw, 38px);
  margin: 1px;
  border-radius: calc(var(--radius) - 1px);
  /* solid instead of backdrop blur: the glow behind spins forever, so a blur would re-run every frame */
  background: rgba(11, 11, 18, 0.9);
}
.eyebrow.on-dark {
  color: rgba(255, 255, 255, 0.7);
}
.ch__amount {
  margin-top: 18px;
  font-family: var(--font-display);
  font-size: clamp(64px, 7vw, 96px);
  font-weight: 600;
  letter-spacing: -0.05em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.ch__amount span {
  font-size: 0.45em;
  vertical-align: top;
  margin-right: 4px;
  opacity: 0.6;
}
.ch__refund {
  margin-top: 10px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}
.ch__price ul {
  list-style: none;
  margin: 26px 0 30px;
  padding: 0;
  display: grid;
  gap: 12px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
}
.ch__price li {
  display: flex;
  gap: 10px;
  align-items: center;
}
.ch__price li i {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 11px;
  font-style: normal;
  color: var(--ink);
  background: var(--neon-grad);
}
.ch__price .btn {
  margin-top: auto;
}
.btn-primary.light {
  background: #fff;
  color: var(--ink);
}
@media (max-width: 960px) {
  .ch__grid {
    grid-template-columns: 1fr;
  }
}
/* phones: controls become full-width grids instead of clipped scrolling pills */
@media (max-width: 640px) {
  .ch__controls {
    flex-direction: column;
  }
  .tabs,
  .sizes {
    display: grid;
    width: 100%;
    overflow: visible;
  }
  .tabs {
    grid-template-columns: repeat(3, 1fr);
  }
  .tabs button {
    height: auto;
    min-height: 44px;
    padding: 6px 4px;
    font-size: 12.5px;
    line-height: 1.2;
    white-space: normal;
  }
  .tabs button em {
    display: none;
  }
  .sizes {
    grid-template-columns: repeat(3, 1fr);
    border-radius: 24px;
  }
  .sizes button {
    padding: 0;
  }
}
</style>
