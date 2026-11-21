<script setup lang="ts">
import { models, sizes, fmtMoney } from '~/data/challenges'

/**
 * Interactive Challenge Configurator ("Pick a path. Prove your edge.")
 * - Step 1: Pick evaluation model (2-Step / 1-Step / Instant) with scannable rule cues
 * - Step 2: Pick account size ($5K–$200K) + trading platform (MetaTrader 5 / nTrader)
 * - Step 3: Visual Dollar Roadmap ("What you need to do") + responsive rules breakdown
 *           (side-by-side table on desktop, clean phase tabs on mobile)
 * - Sticky Summary: Animated fee, exact dollar limits, interactive payout slider, and CTA
 * - Mobile Bar: Sticky bottom checkout bar with quick jump to full summary
 */
const modelIdx = ref(0)
const size = ref<number>(100_000)
const platform = ref<'mt5' | 'ntrader'>('mt5')
const simPct = ref(10) // interactive profit simulator %
const mobilePhaseIdx = ref(0)

const platforms = [
  { id: 'mt5' as const, name: 'MetaTrader 5', tag: 'Desktop · Web · Mobile' },
  { id: 'ntrader' as const, name: 'nTrader', tag: 'Ultra-fast Web & App' }
]

const model = computed(() => models[modelIdx.value]!)
const price = computed(() => model.value.prices[size.value] ?? 0)
const fromPrice = (m: (typeof models)[number]) => Math.min(...Object.values(m.prices))
const activePlatform = computed(() => platforms.find((p) => p.id === platform.value)!)

// Keep mobile phase tab in bounds when switching models
watch(modelIdx, () => {
  mobilePhaseIdx.value = 0
})

// Smoothly animated fee display
const shown = ref(price.value)
let cancelPrice: (() => void) | undefined
watch(price, (to) => {
  cancelPrice?.()
  const from = shown.value
  cancelPrice = tween(0.55, (t) => (shown.value = Math.round(lerp(from, to, t))))
})

const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`
const parsePct = (v?: string) => {
  if (!v) return null
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : null
}

const ruleVal = (label: string, phaseIdx = 0) =>
  model.value.rules.find((r) => r.label === label)?.values[phaseIdx] ?? '—'

const split = computed(() => (model.value.id === 'instant' ? 0.8 : 0.9))
const splitPct = computed(() => Math.round(split.value * 100))

// Trader-friendly quick cues on each model card
const modelSummary = (m: (typeof models)[number]) => {
  if (m.id === 'two-step') {
    return { target: '8% → 5%', dd: '10% static DD', bestFor: 'Best for disciplined swing & day traders' }
  }
  if (m.id === 'one-step') {
    return { target: '10% once', dd: '6% trailing DD', bestFor: 'Best for confident, faster qualification' }
  }
  return { target: 'No target', dd: '6% trailing DD', bestFor: 'Skip tests — earn from your first trade' }
}

// Visual step-by-step dollar roadmap so traders immediately see what they must do
const roadmap = computed(() =>
  model.value.phases.map((phase, idx) => {
    const isFunded = phase.toLowerCase().includes('funded')
    const targetStr = ruleVal('Profit target', idx)
    const targetPct = parsePct(targetStr)
    const dailyStr = ruleVal('Max daily loss', idx)
    const overallStr = ruleVal('Max overall loss', idx)
    const daysStr = ruleVal('Min. trading days', idx)

    if (isFunded) {
      return {
        phase,
        badge: 'LIVE SPLIT',
        headline: `Keep up to ${splitPct.value}%`,
        sub: `24h payouts · Fee (${usd(price.value)}) refunded`
      }
    }
    return {
      phase,
      badge: `GOAL ${idx + 1}`,
      headline: targetPct !== null ? `Make +${usd((size.value * targetPct) / 100)}` : 'No target',
      sub: `${targetStr} target · Stay within ${dailyStr} daily / ${overallStr} max${daysStr !== '—' ? ` · ${daysStr}d min` : ''}`
    }
  })
)

// Concise rule hints shown beneath key rule labels
const ruleHint = (label: string) => {
  if (label === 'Max daily loss') return 'Resets daily at 00:00 server time'
  if (label === 'Max overall loss') return model.value.id === 'two-step' ? 'Fixed from initial balance' : 'Trails peak equity'
  if (label === 'Time limit') return 'Trade at your own pace'
  return ''
}

const keyFacts = computed(() => {
  const target = parsePct(ruleVal('Profit target', 0))
  const daily = parsePct(ruleVal('Max daily loss', 0))
  const overall = parsePct(ruleVal('Max overall loss', 0))
  return [
    { l: 'Phase 1 target', v: target === null ? 'None' : usd((size.value * target) / 100) },
    { l: 'Daily limit', v: daily === null ? '—' : usd((size.value * daily) / 100) },
    { l: 'Max loss', v: overall === null ? '—' : usd((size.value * overall) / 100) }
  ]
})

const simProfit = computed(() => usd((size.value * simPct.value) / 100))
const simKeep = computed(() => usd(((size.value * simPct.value) / 100) * split.value))

// Keyboard arrow navigation for custom radio groups
const onKeys = (e: KeyboardEvent, len: number, get: () => number, set: (i: number) => void) => {
  const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
  if (!d) return
  e.preventDefault()
  const i = (get() + d + len) % len
  set(i)
  nextTick(() => (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role=radio]')[i]?.focus())
}
const sizeIdx = computed(() => sizes.indexOf(size.value as (typeof sizes)[number]))
const platformIdx = computed(() => platforms.findIndex((p) => p.id === platform.value))

// Mobile floating bottom bar visibility
const layout = ref<HTMLElement>()
const summary = ref<HTMLElement>()
const inPicker = ref(false)
const summaryIn = ref(false)
const barOn = computed(() => inPicker.value && !summaryIn.value)
const { $scrollTo } = useNuxtApp()

const jumpToSummary = () => {
  if (summary.value) $scrollTo?.(summary.value)
}

const observers: IntersectionObserver[] = []
onMounted(() => {
  const watchEl = (el: HTMLElement | undefined, flag: Ref<boolean>, rootMargin: string) => {
    if (!el) return
    const io = new IntersectionObserver(([e]) => (flag.value = !!e?.isIntersecting), { rootMargin })
    io.observe(el)
    observers.push(io)
  }
  watchEl(layout.value, inPicker, '0px 0px -35% 0px')
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
          Select your model, capital size, and platform. Every target and loss limit updates live in exact dollars—no guesswork.
        </p>
      </header>

      <div ref="layout" class="ch__layout">
        <div class="ch__steps">
          <!-- STEP 1: Challenge Model -->
          <div class="ch__step" v-reveal="60">
            <div class="ch__step-head">
              <h3 class="ch__step-title"><span>1</span>Select challenge type</h3>
              <small class="ch__step-note">Unlimited time on all paths</small>
            </div>
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
                <span class="ch__model-tag">{{ modelSummary(m).bestFor }}</span>
                <span class="ch__model-pills">
                  <span>{{ modelSummary(m).target }}</span>
                  <span>{{ modelSummary(m).dd }}</span>
                </span>
                <span class="ch__model-foot">
                  <span class="ch__model-meta">{{ m.id === 'instant' ? '80%' : '90%' }} split</span>
                  <span class="ch__model-from">from <b>${{ fromPrice(m) }}</b></span>
                </span>
              </button>
            </div>
          </div>

          <!-- STEP 2: Account Size & Platform -->
          <div class="ch__step" v-reveal="100">
            <div class="ch__step-head">
              <h3 class="ch__step-title"><span>2</span>Choose capital size &amp; platform</h3>
              <small class="ch__step-note">Scale up to $2M</small>
            </div>

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
                class="ch__size"
                :class="{ active: s === size }"
                @click="size = s"
              >
                <span v-if="s === 100_000" class="ch__size-pop" aria-label="Popular choice">Popular</span>
                <strong>{{ fmtMoney(s) }}</strong>
                <small>${{ model.prices[s] }}</small>
              </button>
            </div>

            <div
              class="ch__platforms"
              role="radiogroup"
              aria-label="Trading platform"
              @keydown="onKeys($event, platforms.length, () => platformIdx, (i) => (platform = platforms[i]!.id))"
            >
              <button
                v-for="p in platforms"
                :key="p.id"
                type="button"
                role="radio"
                :aria-checked="platform === p.id"
                :tabindex="platform === p.id ? 0 : -1"
                class="ch__plat"
                :class="{ active: platform === p.id }"
                @click="platform = p.id"
              >
                <span class="ch__plat-ico">{{ p.id === 'mt5' ? '5' : 'n' }}</span>
                <span class="ch__plat-body">
                  <strong>{{ p.name }}</strong>
                  <small>{{ p.tag }}</small>
                </span>
                <i class="ch__radio" aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- STEP 3: Clear Roadmap + Responsive Rules Breakdown -->
          <div class="ch__step" v-reveal="140">
            <div class="ch__step-head">
              <h3 class="ch__step-title"><span>3</span>What you need to do</h3>
              <small class="ch__step-note">{{ fmtMoney(size) }} · {{ model.name }}</small>
            </div>

            <!-- Visual Dollar Roadmap -->
            <div class="ch__roadmap" :style="{ '--steps': roadmap.length }">
              <div
                v-for="(step, idx) in roadmap"
                :key="step.phase"
                class="ch__road"
                :class="{ funded: idx === roadmap.length - 1 }"
              >
                <div class="ch__road-top">
                  <span class="ch__road-badge">{{ step.badge }}</span>
                  <span class="ch__road-phase">{{ step.phase }}</span>
                </div>
                <strong class="ch__road-goal">{{ step.headline }}</strong>
                <p class="ch__road-sub">{{ step.sub }}</p>
              </div>
            </div>

            <!-- Detailed Rules Card -->
            <div class="card ch__rules">
              <!-- Mobile-only phase switcher so rules never squeeze into 3 tiny columns -->
              <div v-if="model.phases.length > 1" class="ch__phase-tabs" role="tablist" aria-label="Select phase rules">
                <button
                  v-for="(p, idx) in model.phases"
                  :key="p"
                  type="button"
                  role="tab"
                  :aria-selected="mobilePhaseIdx === idx"
                  :class="{ active: mobilePhaseIdx === idx }"
                  @click="mobilePhaseIdx = idx"
                >
                  {{ p }}
                </button>
              </div>

              <Transition name="swap" mode="out-in">
                <div :key="model.id">
                  <!-- Desktop table (all phases side-by-side) -->
                  <div
                    class="ch__table ch__table--desktop"
                    :style="{ '--cols': model.phases.length }"
                    role="table"
                    :aria-label="`${model.name} rules`"
                  >
                    <div class="ch__row ch__row--head" role="row">
                      <span role="columnheader">Trading rule</span>
                      <span v-for="p in model.phases" :key="p" role="columnheader">{{ p }}</span>
                    </div>
                    <div v-for="r in model.rules" :key="r.label" class="ch__row" role="row">
                      <span role="rowheader" class="ch__rule-label">
                        {{ r.label }}
                        <em v-if="ruleHint(r.label)">{{ ruleHint(r.label) }}</em>
                      </span>
                      <span v-for="(v, i) in r.values" :key="i" role="cell" class="ch__cell">
                        <strong>{{ v }}</strong>
                        <small v-if="v.includes('%') && r.label !== 'Profit split' && parsePct(v) !== null">
                          {{ usd((size * parsePct(v)!) / 100) }}
                        </small>
                      </span>
                    </div>
                  </div>

                  <!-- Mobile clean 2-column list for the active phase tab -->
                  <div class="ch__list-mobile" :aria-label="`${model.name} ${model.phases[mobilePhaseIdx]} rules`">
                    <div v-for="r in model.rules" :key="r.label" class="ch__m-row">
                      <span class="ch__rule-label">
                        {{ r.label }}
                        <em v-if="ruleHint(r.label)">{{ ruleHint(r.label) }}</em>
                      </span>
                      <span class="ch__m-val">
                        <strong>{{ r.values[mobilePhaseIdx] }}</strong>
                        <small
                          v-if="
                            r.values[mobilePhaseIdx]?.includes('%') &&
                            r.label !== 'Profit split' &&
                            parsePct(r.values[mobilePhaseIdx]) !== null
                          "
                        >
                          {{ usd((size * parsePct(r.values[mobilePhaseIdx])!) / 100) }}
                        </small>
                      </span>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <!-- STICKY LIVE SUMMARY & PAYOUT SIMULATOR -->
        <aside ref="summary" class="ch__summary glow-panel soft" v-reveal="180" aria-live="polite">
          <div class="ch__sum-head">
            <div>
              <span class="ch__sum-kicker">Your configuration</span>
              <h3>{{ model.name }}</h3>
            </div>
            <span class="chip ch__sum-chip">{{ fmtMoney(size) }} · {{ activePlatform.name }}</span>
          </div>

          <div class="ch__price">
            <div class="ch__amount"><span>$</span>{{ shown.toLocaleString('en-US') }}</div>
            <p>One-time fee · <b>100% refunded</b> with your first payout</p>
          </div>

          <dl class="ch__facts">
            <div v-for="f in keyFacts" :key="f.l">
              <dt>{{ f.l }}</dt>
              <dd>{{ f.v }}</dd>
            </div>
          </dl>

          <!-- Interactive Payout Simulator -->
          <div class="ch__sim">
            <div class="ch__sim-top">
              <span>Simulate monthly gain</span>
              <strong>+{{ simPct }}% ({{ simProfit }})</strong>
            </div>
            <input
              v-model.number="simPct"
              type="range"
              min="2"
              max="20"
              step="1"
              class="ch__slider"
              aria-label="Simulated monthly profit percentage"
            />
            <div class="ch__sim-out">
              <span>Your {{ splitPct }}% take-home payout</span>
              <strong>{{ simKeep }}</strong>
            </div>
          </div>

          <a href="#" class="btn btn-primary ch__cta">
            Start {{ fmtMoney(size) }} {{ model.id === 'instant' ? 'Account' : 'Challenge' }}
            <span class="arrow">→</span>
          </a>

          <ul class="ch__trust">
            <li>Instant credentials</li>
            <li>News &amp; EAs allowed</li>
            <li>24h payouts</li>
          </ul>
        </aside>
      </div>
    </div>

    <!-- Mobile Sticky Bottom Checkout Bar -->
    <div class="ch__bar" :class="{ on: barOn }" :aria-hidden="!barOn">
      <button type="button" class="ch__bar-info" :tabindex="barOn ? 0 : -1" @click="jumpToSummary">
        <small>{{ model.name }} · {{ fmtMoney(size) }} · {{ activePlatform.id.toUpperCase() }}</small>
        <span class="ch__bar-price">
          <strong>${{ price.toLocaleString('en-US') }}</strong>
          <em>View summary ↑</em>
        </span>
      </button>
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
  gap: 36px;
  flex-wrap: wrap;
}
.ch__head :deep(h2) {
  margin-top: 18px;
}

.ch__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(330px, 1fr);
  gap: 28px;
  margin-top: 44px;
  align-items: start;
}
.ch__steps {
  display: grid;
  gap: 28px;
  min-width: 0;
}
.ch__step-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.ch__step-title {
  display: flex;
  align-items: center;
  gap: 10px;
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
.ch__step-note {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

/* 1. Challenge Model Cards */
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
  gap: 8px;
  padding: 18px 16px 14px;
  border-radius: 20px;
  text-align: left;
  color: var(--ink);
  background: linear-gradient(180deg, var(--panel-2), var(--panel));
  border: 1px solid var(--line-strong);
  transition:
    border-color 0.25s,
    background 0.25s,
    box-shadow 0.3s,
    transform 0.3s var(--ease-out);
}
.ch__model:hover {
  border-color: rgba(255, 255, 255, 0.24);
  transform: translateY(-2px);
}
.ch__model.active {
  border-color: var(--green);
  background: linear-gradient(180deg, rgba(var(--green-rgb), 0.14), var(--panel) 72%);
  box-shadow:
    0 0 0 1px var(--green) inset,
    0 24px 42px -28px rgba(var(--green-rgb), 0.72);
}
.ch__model:focus-visible,
.ch__size:focus-visible,
.ch__plat:focus-visible,
.ch__phase-tabs button:focus-visible {
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
  transition: all 0.25s;
}
.active .ch__radio {
  border-color: var(--green);
  background: radial-gradient(circle, var(--green) 0 42%, transparent 46%);
}
.ch__badge {
  position: absolute;
  top: -10px;
  left: 14px;
  font-style: normal;
  font-size: 10.5px;
  line-height: 1.4;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 99px;
  color: var(--on-neon);
  background: var(--neon-grad);
  box-shadow: 0 4px 14px -4px rgba(var(--green-rgb), 0.7);
}
.ch__model-name {
  font-size: 17px;
  letter-spacing: -0.02em;
}
.ch__model-tag {
  font-size: 12.5px;
  line-height: 1.38;
  color: var(--muted);
}
.ch__model-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}
.ch__model-pills span {
  font-family: var(--font-mono);
  font-size: 10.5px;
  padding: 3px 8px;
  border-radius: 8px;
  color: var(--ink-2);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--line);
}
.ch__model.active .ch__model-pills span {
  color: var(--green-hi);
  background: rgba(var(--green-rgb), 0.1);
  border-color: rgba(var(--green-rgb), 0.26);
}
.ch__model-foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 10px;
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
  font-variant-numeric: tabular-nums;
}

/* 2. Account Sizes & Platform Selector */
.ch__sizes {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}
.ch__size {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 13px 6px 11px;
  border-radius: 16px;
  color: var(--ink);
  background: var(--panel);
  border: 1px solid var(--line-strong);
  transition:
    border-color 0.25s,
    background 0.25s,
    transform 0.25s var(--ease-out);
}
.ch__size:hover {
  border-color: rgba(255, 255, 255, 0.24);
  transform: translateY(-2px);
}
.ch__size strong {
  font-family: var(--font-display);
  font-size: 17px;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.ch__size small {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  transition: color 0.25s;
}
.ch__size.active {
  border-color: var(--green);
  background: var(--green-soft);
  box-shadow: 0 0 0 1px var(--green) inset;
}
.ch__size.active small {
  color: var(--green-hi);
}
.ch__size-pop {
  position: absolute;
  top: -8px;
  padding: 1px 7px;
  border-radius: 99px;
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--on-neon);
  background: var(--neon);
}

.ch__platforms {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 12px;
}
.ch__plat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 16px;
  text-align: left;
  background: var(--panel);
  border: 1px solid var(--line-strong);
  transition: border-color 0.25s, background 0.25s;
}
.ch__plat:hover {
  border-color: rgba(255, 255, 255, 0.24);
}
.ch__plat.active {
  border-color: rgba(var(--green-rgb), 0.65);
  background: rgba(var(--green-rgb), 0.08);
}
.ch__plat-ico {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
  color: var(--on-neon);
  background: var(--neon-grad);
  flex-shrink: 0;
}
.ch__plat-body {
  display: flex;
  flex-direction: column;
  margin-right: auto;
}
.ch__plat-body strong {
  font-size: 14px;
  color: var(--ink);
}
.ch__plat-body small {
  font-size: 12px;
  color: var(--muted);
}

/* 3. Visual Dollar Roadmap */
.ch__roadmap {
  display: grid;
  grid-template-columns: repeat(var(--steps), minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}
.ch__road {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, var(--panel-2), var(--panel));
  border: 1px solid var(--line-strong);
}
.ch__road.funded {
  border-color: rgba(var(--green-rgb), 0.42);
  background: linear-gradient(180deg, rgba(var(--green-rgb), 0.1), var(--panel));
}
.ch__road-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.ch__road-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--neon-ink);
}
.ch__road-phase {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted);
}
.ch__road-goal {
  font-family: var(--font-display);
  font-size: 20px;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  color: var(--ink);
}
.ch__road.funded .ch__road-goal {
  color: var(--green-hi);
}
.ch__road-sub {
  font-size: 12px;
  line-height: 1.4;
  color: var(--muted);
}

/* Rules Card */
.ch__rules {
  padding: 14px 20px;
  border-radius: 20px;
}
.ch__phase-tabs {
  display: none;
}
.ch__list-mobile {
  display: none;
}
.ch__row {
  display: grid;
  grid-template-columns: minmax(150px, 1.35fr) repeat(var(--cols), minmax(0, 1fr));
  align-items: center;
  gap: 4px 12px;
  padding: 10px 8px;
  margin-inline: -8px;
  border-radius: 10px;
  border-top: 1px solid var(--line);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  transition: background 0.2s var(--ease-out);
}
.ch__row:not(.ch__row--head):hover {
  background: rgba(var(--green-rgb), 0.045);
}
.ch__row--head {
  padding-top: 2px;
  padding-bottom: 10px;
  border-top: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.ch__rule-label {
  display: flex;
  flex-direction: column;
  gap: 1px;
  color: var(--ink-2);
}
.ch__rule-label em {
  font-style: normal;
  font-size: 11.5px;
  color: var(--muted);
}
.ch__cell {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
}
.ch__cell strong {
  font-weight: 600;
  color: var(--ink);
}
.ch__cell small {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--neon-ink);
  opacity: 0.85;
}

.swap-enter-active,
.swap-leave-active {
  transition:
    opacity 0.22s var(--ease-out),
    transform 0.22s var(--ease-out);
}
.swap-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Sticky Summary & Simulator */
.ch__summary {
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  background: linear-gradient(180deg, #0d1012, var(--panel));
}
.ch__sum-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
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
  font-size: 21px;
}
.ch__sum-chip {
  flex-shrink: 0;
  border-color: rgba(var(--green-rgb), 0.35);
  color: var(--green-hi);
  background: rgba(var(--green-rgb), 0.08);
}
.ch__amount {
  font-family: var(--font-display);
  font-size: clamp(46px, 4.4vw, 66px);
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
  padding: 12px 0 12px 12px;
  border-left: 1px solid var(--line);
}
.ch__facts div:first-child {
  padding-left: 0;
  border-left: 0;
}
.ch__facts dt {
  font-size: 11.5px;
  color: var(--muted);
}
.ch__facts dd {
  margin: 3px 0 0;
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

/* Interactive Profit Simulator */
.ch__sim {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(var(--green-rgb), 0.07);
  border: 1px solid rgba(var(--green-rgb), 0.28);
}
.ch__sim-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12.5px;
  color: var(--ink-2);
}
.ch__sim-top strong {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.ch__slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  outline: none;
  cursor: pointer;
}
.ch__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--neon);
  border: 2px solid #08090b;
  box-shadow: 0 0 14px rgba(var(--green-rgb), 0.85);
  transition: transform 0.2s var(--ease-out);
}
.ch__slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}
.ch__slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--neon);
  border: 2px solid #08090b;
  box-shadow: 0 0 14px rgba(var(--green-rgb), 0.85);
}
.ch__sim-out {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding-top: 6px;
  border-top: 1px solid rgba(var(--green-rgb), 0.2);
  font-size: 13px;
  color: var(--ink-2);
}
.ch__sim-out strong {
  font-family: var(--font-display);
  font-size: 24px;
  letter-spacing: -0.03em;
  color: var(--green-hi);
  font-variant-numeric: tabular-nums;
}

.ch__cta {
  --h: 54px;
  width: 100%;
  justify-content: center;
  font-size: 15.5px;
}
.ch__trust {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 14px;
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

/* Mobile floating bottom bar */
.ch__bar {
  display: none;
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
    left: 12px;
    right: 12px;
    bottom: calc(10px + env(safe-area-inset-bottom));
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 10px 10px 16px;
    border-radius: 22px;
    background: rgba(10, 12, 14, 0.92);
    -webkit-backdrop-filter: blur(14px);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(var(--green-rgb), 0.35);
    box-shadow: 0 20px 44px -10px rgba(0, 0, 0, 0.85);
    transform: translate3d(0, 150%, 0);
    transition: transform 0.45s var(--ease-out);
  }
  .ch__bar.on {
    transform: none;
  }
  .ch__bar-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 1px;
  }
  .ch__bar-info small {
    font-size: 11.5px;
    color: var(--muted);
  }
  .ch__bar-price {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }
  .ch__bar-price strong {
    font-family: var(--font-display);
    font-size: 22px;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }
  .ch__bar-price em {
    font-style: normal;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--neon-ink);
  }
}

@media (max-width: 760px) {
  .ch__layout {
    margin-top: 36px;
  }
  .ch__models {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .ch__model:hover,
  .ch__size:hover {
    transform: none;
  }
  .ch__sizes {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .ch__platforms {
    grid-template-columns: 1fr;
  }
  .ch__roadmap {
    grid-template-columns: 1fr;
  }
  /* Switch to clean phase-tabbed list on mobile */
  .ch__table--desktop {
    display: none;
  }
  .ch__phase-tabs {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: 6px;
    padding: 4px;
    margin-bottom: 12px;
    border-radius: 14px;
    background: var(--bg);
    border: 1px solid var(--line);
  }
  .ch__phase-tabs button {
    padding: 9px 10px;
    border-radius: 10px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 500;
    color: var(--muted);
    transition: background 0.25s, color 0.25s;
  }
  .ch__phase-tabs button.active {
    color: var(--on-neon);
    background: var(--neon);
    font-weight: 600;
  }
  .ch__list-mobile {
    display: grid;
  }
  .ch__m-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 0;
    border-top: 1px solid var(--line);
    font-size: 14px;
  }
  .ch__m-row:first-child {
    border-top: 0;
  }
  .ch__m-val {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .ch__m-val strong {
    font-weight: 600;
    color: var(--ink);
  }
  .ch__m-val small {
    font-family: var(--font-mono);
    font-size: 11.5px;
    color: var(--neon-ink);
  }
  .ch__summary {
    padding: 20px;
  }
}
</style>
