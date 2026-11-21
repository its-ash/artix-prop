<script setup lang="ts">
/**
 * Tilted wall of dark cards. Each column is an endless vertical marquee (CSS, GPU-only),
 * alternating direction; scrolling adds a parallax offset per column on top of that.
 * Icons are pre-rendered stills from tools/render (public/images/*.webp).
 */
const cards = [
  { n: '01', title: 'Up to 90% Split', text: 'Keep the lion’s share of every profitable trade you make.', img: 'coins' },
  { n: '02', title: 'Payouts in 24h', text: 'Request bi-weekly and get paid within one business day.', img: 'capsule' },
  { n: '03', title: 'Risk, Managed', text: 'Clear drawdown rules that protect you and your account.', img: 'ring' },
  { n: '04', title: 'Scale to $2M', text: '+25% capital every three profitable months.', img: 'cubes' },
  { n: '05', title: '150+ Markets', text: 'Forex, metals, indices, stocks and crypto in one account.', img: 'planet' },
  { n: '06', title: 'No Hidden Fees', text: 'One fee, refunded with your first payout. That’s it.', img: 'shield' }
]
// each column starts at a different card so neighbours never match
const columns = [0, 2, 4, 1, 3].map((offset) => [...cards.slice(offset), ...cards.slice(0, offset)])
const speeds = [46, 38, 52, 42, 48]

const root = ref<HTMLElement>()
const wall = ref<HTMLElement>()
const cleanups: (() => void)[] = []
onMounted(() => {
  const cols = [...(wall.value?.querySelectorAll<HTMLElement>('.cw__col') ?? [])] // DOM order
  // per-column parallax on top of the CSS marquee
  cleanups.push(
    scrollScene(root.value, 'top bottom', 'bottom top', (p) => {
      cols.forEach((col, i) => {
        const from = i % 2 ? -140 : 140
        col.style.transform = `translate3d(0, ${lerp(from, -from, p).toFixed(2)}px, 0)`
      })
    }),
    // the wall straightens as it scrolls in
    scrollScene(root.value, 'top bottom', 'center center', (p) => {
      if (wall.value) wall.value.style.transform = `rotate(${lerp(-22, -14, p).toFixed(3)}deg) scale(${lerp(1.35, 1.2, p).toFixed(4)})`
    })
  )
})
onBeforeUnmount(() => cleanups.forEach((fn) => fn()))
</script>

<template>
  <section ref="root" v-offscreen-pause class="cw">
    <div class="cw__head container">
      <span class="eyebrow" v-reveal>The Artix edge</span>
      <SplitText class="h-xl" text="Built for traders|who play the *long* *game.*" />
    </div>

    <div class="cw__viewport" aria-label="Program highlights">
      <div ref="wall" class="cw__wall">
        <div v-for="(col, ci) in columns" :key="ci" class="cw__col">
          <div class="cw__track" :class="{ down: ci % 2 === 1 }" :style="{ '--dur': `${speeds[ci]}s` }">
            <template v-for="dup in 2" :key="dup">
              <article
                v-for="c in col"
                :key="`${dup}-${c.img}`"
                class="cw__card"
                :aria-hidden="dup === 2 || ci > 0 ? 'true' : undefined"
              >
                <span class="cw__idx">{{ c.n }}</span>
                <h3>{{ c.title }}</h3>
                <p>{{ c.text }}</p>
                <div class="cw__art">
                  <span class="cw__glow" />
                  <img :src="`/images/${c.img}.webp`" alt="" width="900" height="900" loading="lazy" decoding="async" />
                </div>
              </article>
            </template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cw {
  position: relative;
  padding-top: clamp(96px, 12vw, 160px);
  overflow: hidden;
  background:
    radial-gradient(40% 40% at 30% 62%, rgba(255, 255, 255, 0.06), transparent 70%),
    radial-gradient(40% 40% at 72% 52%, rgba(var(--green-rgb), 0.16), transparent 70%);
}
.cw__head :deep(h2) {
  margin-top: 18px;
}
.cw__viewport {
  position: relative;
  height: clamp(760px, 120vh, 1200px);
  margin-top: 40px;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 14%, #000 86%, transparent);
  mask-image: linear-gradient(to bottom, transparent, #000 14%, #000 86%, transparent);
}
.cw__wall {
  position: absolute;
  left: 50%;
  top: 50%;
  display: flex;
  gap: 22px;
  translate: -50% -50%;
  transform: rotate(-14deg) scale(1.2); /* JS takes over the transform on scroll */
  will-change: transform;
}
.cw__col {
  width: clamp(230px, 19vw, 300px);
  will-change: transform;
}
.cw__track {
  display: flex;
  flex-direction: column;
  gap: 22px;
  animation: cw-up var(--dur, 45s) linear infinite;
}
.cw__track.down {
  animation-name: cw-down;
}
.cw__col:hover .cw__track {
  animation-play-state: paused;
}
@keyframes cw-up {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(calc(-50% - 11px));
  }
}
@keyframes cw-down {
  from {
    transform: translateY(calc(-50% - 11px));
  }
  to {
    transform: translateY(0);
  }
}
.cw__card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 24px 24px 18px;
  aspect-ratio: 3 / 4;
  border-radius: 30px;
  background: linear-gradient(180deg, var(--panel-2), var(--panel));
  color: #fff;
  overflow: hidden;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.1) inset,
    0 0 0 1px var(--line-strong) inset,
    0 40px 60px -30px rgba(0, 0, 0, 0.8);
  transition: transform 0.6s var(--ease-out), box-shadow 0.5s var(--ease-out);
}
.cw__card:hover {
  transform: scale(1.03);
  box-shadow:
    0 0 0 1px rgba(var(--green-rgb), 0.55) inset,
    0 30px 60px -25px rgba(var(--green-rgb), 0.35);
}
.cw__idx {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--neon-ink);
  opacity: 0.85;
}
.cw__card h3 {
  font-size: clamp(22px, 1.8vw, 28px);
  letter-spacing: -0.03em;
  line-height: 1.05;
}
.cw__card p {
  font-size: 13px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.6);
  max-width: 24ch;
}
.cw__art {
  position: relative;
  flex: 1;
  width: 100%;
  display: grid;
  place-items: center;
}
.cw__art img {
  position: relative;
  width: 92%;
  height: auto;
  filter: hue-rotate(-32deg) saturate(1.1);
  animation: cw-bob 6s ease-in-out infinite;
}
.cw__card:nth-child(2n) .cw__art img {
  animation-delay: -3s;
}
.cw__glow {
  position: absolute;
  width: 70%;
  aspect-ratio: 1;
  border-radius: 50%;
  /* soft gradient instead of a blur filter: ~60 of these move every frame */
  background: radial-gradient(circle, rgba(var(--green-rgb), 0.3), rgba(var(--green-rgb), 0.08) 40%, transparent 70%);
}
.cw__card:nth-child(2n) .cw__glow {
  background: radial-gradient(circle, rgba(var(--green-rgb), 0.36), rgba(var(--green-rgb), 0.1) 40%, transparent 70%);
}
@keyframes cw-bob {
  0%,
  100% {
    transform: translateY(-4%) rotate(-3deg);
  }
  50% {
    transform: translateY(4%) rotate(3deg);
  }
}
@media (max-width: 760px) {
  .cw__viewport {
    height: 720px;
  }
  .cw__col {
    width: 210px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .cw__track,
  .cw__art img {
    animation: none;
  }
}
</style>
