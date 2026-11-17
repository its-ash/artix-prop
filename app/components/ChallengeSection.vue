<script setup lang="ts">
import { models, sizes, fmtMoney } from '~/data/challenges'

/**
 * The buying section: pick a model → pick a size → read the rules, with a live order summary.
 * Desktop: steps on the left, sticky summary on the right.
 * Mobile: one column, plus a bottom bar (price + CTA) while the summary card is off-screen.
 */
const modelIdx = ref(0)
const size = ref<number>(100_000)
const model = computed(() => models[modelIdx.value]!)
const price = computed(() => model.value.prices[size.value] ?? 0)
const fromPrice = (m: (typeof models)[number]) => Math.min(...Object.values(m.prices))

// animated price
const shown = ref(price.value)
let cancelPrice: (() => void) | undefined
watch(price, (to) => {
  cancelPrice?.()
  const from = shown.value
  cancelPrice = tween(0.6, (t) => (shown.value = Math.round(lerp(from, to, t))))
})

const pct = (label: string) => {
  const v = model.value.rules.find((r) => r.label === label)?.values[0] ?? ''
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : null
}
const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`
const split = computed(() => (model.value.id === 'instant' ? 0.8 : 0.9))
const keyFacts = computed(() => {
  const target = pct('Profit target')
  const daily = pct('Max daily loss')
  const overall = pct('Max overall loss')
  return [
    { l: 'Profit target', v: target === null ? 'None' : usd((size.value * target) / 100) },
    { l: 'Daily loss', v: daily === null ? '—' : usd((size.value * daily) / 100) },
    { l: 'Max loss', v: overall === null ? '—' : usd((size.value * overall) / 100) }
  ]
})
// illustrative: a 10% month at the maximum split
const keep = computed(() => usd(size.value * 0.1 * split.value))

const phaseCount = (m: (typeof models)[number]) => m.phases.length - 1
const phaseLabel = (m: (typeof models)[number]) => {
  const n = phaseCount(m)
  return n === 0 ? 'No evaluation' : `${n} phase${n > 1 ? 's' : ''}`
}

// arrow keys move the selection inside a radio group, like native radios
const onKeys = (e: KeyboardEvent, len: number, get: () => number, set: (i: number) => void) => {
  const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
  if (!d) return
  e.preventDefault()
  const i = (get() + d + len) % len
  set(i)
  nextTick(() => ((e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role=radio]')[i])?.focus())
}
const sizeIdx = computed(() => sizes.indexOf(size.value as (typeof sizes)[number]))

// mobile bottom bar: visible while the picker is on screen but the summary card is not.
// The picker only counts once it reaches the upper 60% of the viewport, so the bar doesn't
// pop up over the previous section while the challenge header is just peeking in.
const layout = ref<HTMLElement>()
const summary = ref<HTMLElement>()
const inPicker = ref(false)
const summaryIn = ref(false)
const barOn = computed(() => inPicker.value && !summaryIn.value)
const observers: IntersectionObserver[] = []
onMounted(() => {
  const watchEl = (el: HTMLElement | undefined, flag: Ref<boolean>, rootMargin: string) => {
    if (!el) return
    const io = new IntersectionObserver(([e]) => (flag.value = !!e?.isIntersecting), { rootMargin })
    io.observe(el)
    observers.push(io)
  }
  watchEl(layout.value, inPicker, '0px 0px -40% 0px')
  watchEl(summary.value, summaryIn, '0px')
})
onBeforeUnmount(() => {
  cancelPrice?.()
  observers.forEach((io) => io.disconnect())
})
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
          Three ways to get funded. Clear rules, no time limits, and your fee comes back with your first payout.
        </p>
      </header>

      <div ref="layout" class="ch__layout">
        <div class="ch__steps">
          <!-- 1. model -->
          <div class="ch__step" v-reveal="80">
            <h3 class="ch__step-title"><span>1</span>Choose your challenge</h3>
            <div
              class="ch__models"
              role="radiogroup"
              aria-label="Challenge type"
              @keydown="onKeys($event, models.length, () => modelIdx, (i) => (modelIdx = i))"
            >
              <button
                v-for="(m, i) in models"
                :key="m.id"
                type="button"
                role="radio"
                :aria-checked="i === modelIdx"
                :tabindex="i === modelIdx ? 0 : -1"
                class="ch__model"
                :class="{ active: i === modelIdx }"
                @click="modelIdx = i"
              >
                <em v-if="m.badge" class="ch__badge">{{ m.badge }}</em>
                <span class="ch__model-top">
                  <strong class="ch__model-name">{{ m.name }}</strong>
                  <i class="ch__radio" aria-hidden="true" />
                </span>
                <span class="ch__model-tag">{{ m.tagline }}</span>
                <span class="ch__model-foot">
                  <span class="ch__model-meta">{{ phaseLabel(m) }} · {{ m.id === 'instant' ? '80%' : '90%' }} split</span>
                  <span class="ch__model-from">from <b>${{ fromPrice(m) }}</b></span>
                </span>
              </button>
            </div>
          </div>

          <!-- 2. size -->
          <div class="ch__step" v-reveal="120">
            <h3 class="ch__step-title"><span>2</span>Choose your account size</h3>
            <div
              class="ch__sizes"
              role="radiogroup"
              aria-label="Account size"
              @keydown="onKeys($event, sizes.length, () => sizeIdx, (i) => (size = sizes[i]!))"
            >
              <button
                v-for="s in sizes"
                :key="s"
                type="button"
                role="radio"
                :aria-checked="s === size"
                :tabindex="s === size ? 0 : -1"
                :class="{ active: s === size }"
                @click="size = s"
              >
                <strong>{{ fmtMoney(s) }}</strong>
                <small>${{ model.prices[s] }}</small>
              </button>
            </div>
          </div>

          <!-- 3. rules -->
          <div class="ch__step" v-reveal="160">
            <h3 class="ch__step-title"><span>3</span>Review the rules</h3>
            <div class="card ch__rules">
              <Transition name="swap" mode="out-in">
                <div :key="model.id" class="ch__table" :style="{ '--cols': model.phases.length }" role="table" :aria-label="`${model.name} rules`">
                  <div class="ch__row ch__row--head" role="row">
                    <span role="columnheader" />
                    <span v-for="p in model.phases" :key="p" role="columnheader">{{ p }}</span>
                  </div>
                  <div v-for="r in model.rules" :key="r.label" class="ch__row" role="row">
                    <span role="rowheader">{{ r.label }}</span>
                    <span v-for="(v, i) in r.values" :key="i" role="cell">
                      <strong>{{ v }}</strong>
                      <small v-if="v.endsWith('%') && r.label !== 'Profit split'">{{ usd((size * parseFloat(v)) / 100) }}</small>
                    </span>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <!-- summary -->
        <aside ref="summary" class="ch__summary glow-panel soft" v-reveal="200" aria-live="polite">
          <div class="ch__sum-head">
            <h3><span class="ch__sum-kicker">Your challenge</span>{{ model.name }}</h3>
            <span class="chip">{{ fmtMoney(size) }} account</span>
          </div>

          <div class="ch__price">
            <div class="ch__amount"><span>$</span>{{ shown.toLocaleString('en-US') }}</div>
            <p>One-time fee · <b>refunded</b> with your first payout</p>
          </div>

          <dl class="ch__facts">
            <div v-for="f in keyFacts" :key="f.l">
              <dt>{{ f.l }}</dt>
              <dd>{{ f.v }}</dd>
            </div>
          </dl>

          <div class="ch__keep">
            <span>Make 10% on {{ fmtMoney(size) }} and you keep up to</span>
            <strong>{{ keep }}</strong>
          </div>

          <a href="#" class="btn btn-primary ch__cta">Start {{ fmtMoney(size) }} Challenge <span class="arrow">→</span></a>

          <ul class="ch__trust">
            <li>Secure checkout</li>
            <li>Account in minutes</li>
            <li>No time limit</li>
          </ul>
        </aside>
      </div>
    </div>

    <!-- mobile: price + CTA always in reach -->
    <div class="ch__bar" :class="{ on: barOn }" :aria-hidden="!barOn">
      <div>
        <small>{{ model.name }} · {{ fmtMoney(size) }}</small>
        <strong>${{ price.toLocaleString('en-US') }}</strong>
      </div>
      <a href="#" class="btn btn-primary btn-sm" :tabindex="barOn ? 0 : -1">Start <span class="arrow">→</span></a>
    </div>
  </section>
</template>

<style scoped>
.ch {
  background: radial-gradient(50% 40% at 80% 60%, rgba(var(--green-rgb), 0.07), transparent 70%);
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

.ch__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(320px, 1fr);
  gap: 24px;
  margin-top: 40px;
  align-items: start;
}
.ch__steps {
  display: grid;
  gap: 24px;
  min-width: 0;
}
.ch__step-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.ch__step-title span {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--green-hi);
  background: var(--green-soft);
  border: 1px solid rgba(var(--green-rgb), 0.35);
}

/* 1. model cards */
.ch__models {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.ch__model {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  padding: 16px 16px 14px;
  border-radius: 18px;
  text-align: left;
  color: var(--ink);
  background: linear-gradient(180deg, var(--panel-2), var(--panel));
  border: 1px solid var(--line-strong);
  transition:
    border-color 0.3s,
    background 0.3s,
    box-shadow 0.3s,
    transform 0.3s var(--ease-out);
}
.ch__model:hover {
  border-color: rgba(255, 255, 255, 0.24);
  transform: translateY(-2px);
}
.ch__model.active {
  border-color: var(--green);
  background: linear-gradient(180deg, rgba(var(--green-rgb), 0.13), var(--panel) 70%);
  box-shadow:
    0 0 0 1px var(--green) inset,
    0 24px 40px -28px rgba(var(--green-rgb), 0.7);
}
.ch__model:focus-visible,
.ch__sizes button:focus-visible {
  outline: 2px solid var(--green-hi);
  outline-offset: 3px;
}
.ch__model-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.ch__radio {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid var(--line-strong);
  transition: all 0.3s;
}
.ch__model.active .ch__radio {
  border-color: var(--green);
  background: radial-gradient(circle, var(--green) 0 42%, transparent 46%);
}
/* sits on the card's top border so it costs no height */
.ch__badge {
  position: absolute;
  top: -9px;
  left: 14px;
  font-style: normal;
  font-size: 10.5px;
  line-height: 1.4;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 99px;
  color: var(--on-neon);
  background: var(--neon-grad);
}
.ch__model-name {
  font-size: 17px;
  letter-spacing: -0.02em;
}
.ch__model-tag {
  font-size: 13px;
  line-height: 1.35;
  color: var(--muted);
}
.ch__model-foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid var(--line);
}
.ch__model-meta {
  font-size: 12px;
  color: var(--ink-2);
  white-space: nowrap;
}
.ch__model-from {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
}
.ch__model-from b {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--ink);
  letter-spacing: -0.02em;
}

/* 2. size buttons (with their price) */
.ch__sizes {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}
.ch__sizes button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 9px 4px;
  border-radius: 14px;
  color: var(--ink);
  background: var(--panel);
  border: 1px solid var(--line-strong);
  transition:
    border-color 0.3s,
    background 0.3s;
}
.ch__sizes button:hover {
  border-color: rgba(255, 255, 255, 0.24);
}
.ch__sizes strong {
  font-family: var(--font-display);
  font-size: 17px;
  letter-spacing: -0.02em;
}
.ch__sizes small {
  font-size: 12px;
  color: var(--muted);
  transition: color 0.3s;
}
.ch__sizes button.active {
  border-color: var(--green);
  background: var(--green-soft);
  box-shadow: 0 0 0 1px var(--green) inset;
}
.ch__sizes button.active small {
  color: var(--green-hi);
}

/* 3. rules */
.ch__rules {
  padding: 14px 20px;
  border-radius: 18px;
}
.ch__row {
  display: grid;
  grid-template-columns: minmax(130px, 1.2fr) repeat(var(--cols), minmax(0, 1fr));
  align-items: baseline;
  gap: 2px 12px;
  padding: 8px 0;
  border-top: 1px solid var(--line);
  font-size: 14px;
}
.ch__row--head {
  padding-top: 0;
  border-top: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.ch__row > :first-child {
  color: var(--ink-2);
}
.ch__row strong {
  font-weight: 600;
}
/* $ amount sits beside the % to keep every row one line tall */
.ch__row small {
  margin-left: 6px;
  font-size: 12px;
  color: var(--muted);
}
.swap-enter-active,
.swap-leave-active {
  transition:
    opacity 0.25s var(--ease-out),
    transform 0.25s var(--ease-out);
}
.swap-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.swap-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* summary */
.ch__summary {
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px 24px;
  background: linear-gradient(180deg, #0d1012, var(--panel));
}
.ch__sum-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.ch__sum-kicker {
  display: block;
  margin-bottom: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.ch__sum-head h3 {
  font-size: 20px;
}
.ch__sum-head .chip {
  flex-shrink: 0;
}
.ch__amount {
  font-family: var(--font-display);
  font-size: clamp(48px, 4.6vw, 68px);
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
.ch__price p {
  margin-top: 6px;
  font-size: 13px;
  color: var(--muted);
}
.ch__price b {
  color: var(--green-hi);
  font-weight: 600;
}
.ch__facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.ch__facts div {
  padding: 10px 0 10px 12px;
  border-left: 1px solid var(--line);
}
.ch__facts div:first-child {
  padding-left: 0;
  border-left: 0;
}
.ch__facts dt {
  font-size: 12px;
  color: var(--muted);
}
.ch__facts dd {
  margin: 2px 0 0;
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.ch__keep {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  color: var(--ink-2);
  background: var(--green-soft);
  border: 1px solid rgba(var(--green-rgb), 0.3);
}
.ch__keep strong {
  font-family: var(--font-display);
  font-size: 20px;
  color: var(--green-hi);
  letter-spacing: -0.02em;
  white-space: nowrap;
}
.ch__cta {
  --h: 52px;
  width: 100%;
  justify-content: center;
  font-size: 15.5px;
}
.ch__trust {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 16px;
  margin: -4px 0 0;
  padding: 0;
  list-style: none;
  font-size: 12px;
  color: var(--muted);
}
.ch__trust li::before {
  content: '✓ ';
  color: var(--green);
}

/* mobile bottom bar */
.ch__bar {
  display: none;
}

/* short laptop screens (1366×768, 1280×720, 125% scaling): squeeze the vertical rhythm further */
@media (min-width: 1081px) and (max-height: 820px) {
  .ch__layout {
    margin-top: 28px;
  }
  .ch__steps {
    gap: 18px;
  }
  .ch__model-tag {
    display: none;
  }
  .ch__summary {
    top: 80px;
    gap: 12px;
    padding: 18px 22px;
  }
  .ch__amount {
    font-size: 52px;
  }
  .ch__cta {
    --h: 48px;
  }
}

@media (max-width: 1080px) {
  .ch__layout {
    grid-template-columns: 1fr;
  }
  .ch__summary {
    position: relative;
    top: 0;
  }
  .ch__bar {
    position: fixed;
    z-index: 60;
    left: 10px;
    right: 10px;
    bottom: calc(10px + env(safe-area-inset-bottom));
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 10px 10px 18px;
    border-radius: 20px;
    background: rgba(12, 14, 16, 0.96);
    border: 1px solid var(--line-strong);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.8);
    transform: translate3d(0, 140%, 0);
    transition: transform 0.45s var(--ease-out);
  }
  .ch__bar.on {
    transform: none;
  }
  .ch__bar small {
    display: block;
    font-size: 12px;
    color: var(--muted);
  }
  .ch__bar strong {
    font-family: var(--font-display);
    font-size: 22px;
    letter-spacing: -0.02em;
  }
}
@media (max-width: 760px) {
  .ch__layout {
    margin-top: 40px;
  }
  .ch__steps {
    gap: 30px;
  }
  /* model cards: compact rows, full width */
  .ch__models {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .ch__model {
    padding: 14px 14px 12px;
  }
  .ch__model:hover {
    transform: none;
  }
  .ch__sizes {
    grid-template-columns: repeat(3, 1fr);
  }
  /* rules: label on its own line, phase values in columns below */
  .ch__rules {
    padding: 12px 16px;
  }
  .ch__row {
    grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
    font-size: 13.5px;
  }
  .ch__row small {
    margin-left: 4px;
    font-size: 11px;
  }
  .ch__row > :first-child {
    grid-column: 1 / -1;
    font-size: 12.5px;
    color: var(--muted);
  }
  .ch__row--head > :first-child {
    display: none;
  }
  .ch__facts dd {
    font-size: 16px;
  }
  .ch__keep {
    font-size: 12.5px;
  }
}
</style>
