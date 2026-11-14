<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const root = ref<HTMLElement>()
const active = ref(0)

const steps = [
  {
    n: '01',
    title: 'Choose your challenge',
    text: 'Pick a model and an account size from $5K to $200K. Pay once — the fee is refunded with your first payout.',
    tags: ['2-Step', '1-Step', 'Instant']
  },
  {
    n: '02',
    title: 'Hit the target, respect the rules',
    text: 'Trade forex, metals, indices, stocks and crypto with no time limit. Reach the target while staying inside your drawdown.',
    tags: ['No time limit', 'News trading', 'EAs allowed']
  },
  {
    n: '03',
    title: 'Get your funded account',
    text: 'Pass KYC and receive your Artix Prop account within hours. Same terminal, same rules — now with real profit share.',
    tags: ['KYC in minutes', 'nTrader', 'MT5']
  },
  {
    n: '04',
    title: 'Withdraw up to 90%',
    text: 'Request a payout every 14 days. We process in 24 hours to bank, card or crypto — and scale your capital as you grow.',
    tags: ['24h payouts', 'USDT', 'Scaling to $2M']
  }
]

let ctx: gsap.Context | undefined
onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  ctx = gsap.context(() => {
    gsap.fromTo(
      '.hw__bar-fill',
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: '.hw__steps', start: 'top 60%', end: 'bottom 60%', scrub: true }
      }
    )
    // one trigger over the whole list → robust to fast scrolling / jumps
    ScrollTrigger.create({
      trigger: '.hw__steps',
      start: 'top 60%',
      end: 'bottom 60%',
      onUpdate: (s) => (active.value = Math.min(steps.length - 1, Math.floor(s.progress * steps.length))),
      onLeave: () => (active.value = steps.length - 1),
      onLeaveBack: () => (active.value = 0)
    })
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section id="how" ref="root" class="hw section">
    <div class="container hw__grid">
      <div class="hw__side">
        <span class="eyebrow" v-reveal>How it works</span>
        <SplitText class="h-xl" text="From sign-up|to *payout*|in four steps." />
        <div class="hw__counter">
          <span class="grad-text">{{ steps[active]!.n }}</span> / 04
        </div>
      </div>

      <div class="hw__steps">
        <div class="hw__bar"><div class="hw__bar-fill" /></div>
        <article v-for="(s, i) in steps" :key="s.n" class="hw__step" :class="{ on: i <= active }">
          <span class="hw__dot" />
          <div class="hw__n">{{ s.n }}</div>
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
          <div class="hw__tags">
            <span v-for="t in s.tags" :key="t" class="chip">{{ t }}</span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hw__grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: clamp(40px, 8vw, 120px);
}
.hw__side {
  position: sticky;
  top: 140px;
  align-self: start;
}
.hw__side :deep(h2) {
  margin-top: 18px;
}
.hw__counter {
  margin-top: 40px;
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--muted);
}
.hw__counter span {
  font-family: var(--font-display);
  font-size: 64px;
  font-weight: 600;
  letter-spacing: -0.04em;
  margin-right: 6px;
}
.hw__steps {
  position: relative;
  padding-left: 48px;
}
.hw__bar {
  position: absolute;
  left: 7px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background: var(--line);
  border-radius: 2px;
}
.hw__bar-fill {
  position: absolute;
  inset: 0;
  background: var(--neon);
  transform-origin: top;
  box-shadow: 0 0 12px var(--neon);
}
.hw__step {
  position: relative;
  padding: 0 0 clamp(72px, 10vw, 140px);
  opacity: 0.32;
  transition: opacity 0.6s var(--ease-out);
}
.hw__step:last-child {
  padding-bottom: 0;
}
.hw__step.on {
  opacity: 1;
}
.hw__dot {
  position: absolute;
  left: -48px;
  top: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--line-strong);
  transition: all 0.5s var(--ease-out);
}
.hw__step.on .hw__dot {
  border-color: transparent;
  background: var(--neon-grad);
  box-shadow: 0 0 0 6px rgba(255, 184, 0, 0.12), 0 0 18px var(--neon);
}
.hw__n {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
}
.hw__step h3 {
  margin-top: 10px;
  font-size: clamp(26px, 2.6vw, 38px);
}
.hw__step p {
  margin-top: 14px;
  color: var(--ink-2);
  max-width: 48ch;
  font-size: 17px;
}
.hw__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}
@media (max-width: 860px) {
  .hw__grid {
    grid-template-columns: 1fr;
  }
  .hw__side {
    position: relative;
    top: 0;
  }
}
</style>
