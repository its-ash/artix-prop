<script setup lang="ts">
import { models, sizes, fmtMoney } from '~/data/challenges'

const root = ref<HTMLElement>()
const panel = ref<HTMLElement>()
const btn = ref<HTMLElement>()
const { $scrollTo } = useNuxtApp()

const maxSize = Math.max(...sizes)
const minFee = Math.min(...models.flatMap((m) => Object.values(m.prices)))
const stats = [
  { v: fmtMoney(maxSize), l: 'Max funded account' },
  { v: '90%', l: 'Profit split' },
  { v: '24h', l: 'Payout processing' },
  { v: `$${minFee}`, l: 'Challenges from' }
]
const trust = ['No time limit', 'News & EAs allowed', 'Fee refunded']

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

        <!-- Floating product widgets (desktop): fill the side space with real-feeling account UI -->
        <div class="cta__float" aria-hidden="true">
          <div class="cta__w cta__w--payout">
            <div class="cta__w-head">
              <span class="cta__w-ico">✓</span>
              <span>Payout sent</span>
              <em>24h</em>
            </div>
            <strong>+$9,000</strong>
            <small>90% of $10,000 profit · Crypto</small>
          </div>

          <div class="cta__w cta__w--acct">
            <div class="cta__w-head">
              <span class="live-dot" />
              <span>Funded account</span>
              <em class="up">+8.4%</em>
            </div>
            <strong>{{ fmtMoney(maxSize) }}</strong>
            <svg viewBox="0 0 200 56" preserveAspectRatio="none" class="cta__spark">
              <defs>
                <linearGradient id="cta-spark" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stop-color="#b6f500" stop-opacity="0.35" />
                  <stop offset="1" stop-color="#b6f500" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 46 L20 42 L40 44 L60 34 L80 37 L100 27 L120 30 L140 19 L160 22 L180 10 L200 6 L200 56 L0 56 Z" fill="url(#cta-spark)" />
              <path d="M0 46 L20 42 L40 44 L60 34 L80 37 L100 27 L120 30 L140 19 L160 22 L180 10 L200 6" fill="none" stroke="#c8ff3a" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
            </svg>
          </div>

          <div class="cta__w cta__w--pass">
            <div class="cta__w-head">
              <span>Phase 1 · 8% target</span>
              <em class="up">Passed</em>
            </div>
            <div class="cta__bar"><i /></div>
            <small>3 trading days · No time limit</small>
          </div>

          <i class="sparkle" style="top: 14%; left: 30%; --tw: 0.4s" />
          <i class="sparkle" style="top: 24%; right: 26%; --tw: 1.6s" />
          <i class="sparkle" style="bottom: 30%; left: 24%; --tw: 2.4s" />
        </div>

        <div class="cta__inner" @pointermove="onMove" @pointerleave="onLeave">
          <span class="eyebrow on-dark">Ready when you are</span>
          <SplitText class="h-display" text="Your capital|is *waiting.*" />
          <p>Start a challenge in under two minutes. Fee refunded with your first payout.</p>
          <div class="cta__actions">
            <a ref="btn" href="#challenges" class="btn btn-primary light cta__btn" @click.prevent="$scrollTo?.('#challenges')">
              Get Funded Now <span class="arrow">→</span>
            </a>
            <a href="#faq" class="btn btn-ghost cta__ghost" @click.prevent="$scrollTo?.('#faq')">Read the rules</a>
          </div>
          <ul class="cta__trust">
            <li v-for="t in trust" :key="t">{{ t }}</li>
          </ul>
          <dl class="cta__stats">
            <div v-for="s in stats" :key="s.l">
              <dt>{{ s.l }}</dt>
              <dd>{{ s.v }}</dd>
            </div>
          </dl>
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
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
  width: min(100%, 980px);
  padding: 96px 24px 88px;
  text-align: center;
}
.eyebrow.on-dark {
  color: rgba(255, 255, 255, 0.78);
}
.cta__inner p {
  color: rgba(255, 255, 255, 0.78);
  font-size: 19px;
}
.cta__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 14px;
  margin-top: 6px;
}
.cta__ghost {
  --h: 64px;
  padding: 0 30px;
  font-size: 16px;
}
.cta__trust {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 22px;
  margin: -6px 0 0;
  padding: 0;
  list-style: none;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.78);
}
.cta__trust li::before {
  content: '✓ ';
  color: var(--green);
  font-weight: 700;
}

/* Stats strip */
.cta__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  width: 100%;
  margin: 18px 0 0;
  border-radius: 20px;
  background: rgba(10, 12, 14, 0.6);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.cta__stats div {
  display: flex;
  flex-direction: column-reverse;
  gap: 4px;
  padding: 18px 12px;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}
.cta__stats div:first-child {
  border-left: 0;
}
.cta__stats dd {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(26px, 2.6vw, 36px);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.cta__stats div:nth-child(2) dd {
  color: var(--green-hi);
}
.cta__stats dt {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.66);
}

/* Floating widgets */
.cta__float {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}
.cta__w {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 236px;
  padding: 14px 16px;
  border-radius: 18px;
  text-align: left;
  background: rgba(14, 16, 19, 0.74);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.08) inset,
    0 30px 60px -24px rgba(0, 0, 0, 0.85);
  rotate: var(--r, 0deg);
  animation: bob 6s ease-in-out infinite alternate;
  animation-delay: var(--d, 0s);
}
@keyframes bob {
  to {
    translate: 0 -12px;
  }
}
.cta__w--payout {
  top: 16%;
  left: 5%;
  --r: -4deg;
}
.cta__w--acct {
  top: 20%;
  right: 5%;
  --r: 3deg;
  --d: -2s;
}
.cta__w--pass {
  bottom: 18%;
  left: 7%;
  --r: 2deg;
  --d: -4s;
}
.cta__w-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.82);
}
.cta__w-head em {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 99px;
  font-style: normal;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--ink);
  background: rgba(255, 255, 255, 0.08);
}
.cta__w-head em.up {
  color: var(--on-neon);
  background: var(--neon);
}
.cta__w-ico {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  color: var(--on-neon);
  background: var(--neon);
}
.cta__w strong {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1.05;
  font-variant-numeric: tabular-nums;
}
.cta__w--payout strong {
  color: var(--green-hi);
}
.cta__w small {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.62);
}
.cta__spark {
  width: 100%;
  height: 48px;
  margin-top: 2px;
}
.cta__bar {
  height: 8px;
  margin: 6px 0 2px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}
.cta__bar i {
  display: block;
  height: 100%;
  width: 100%;
  border-radius: inherit;
  background: var(--neon-grad);
  box-shadow: 0 0 14px rgba(var(--green-rgb), 0.6);
}
@media (max-width: 1240px) {
  .cta__w {
    width: 208px;
  }
  .cta__w--payout {
    left: 3%;
  }
  .cta__w--acct {
    right: 3%;
  }
}
@media (max-width: 1100px) {
  .cta__float {
    display: none;
  }
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
    gap: 22px;
    padding: 72px 18px 190px;
  }
  .cta__inner p {
    font-size: 17px;
  }
  .cta__actions {
    flex-direction: column;
    align-self: stretch;
  }
  .cta__btn,
  .cta__ghost {
    width: 100%;
  }
  .cta__stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .cta__stats div:nth-child(3) {
    border-left: 0;
  }
  .cta__stats div:nth-child(n + 3) {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
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
