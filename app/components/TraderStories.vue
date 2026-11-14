<script setup lang="ts">
// PLACEHOLDER — replace with real, verified trader reviews before launch.
const reviews = [
  { name: 'Daniel R.', loc: 'Germany', text: 'Passed the 2-Step in 11 days. First payout landed the next morning — no back-and-forth.', amt: '$100K' },
  { name: 'Priya S.', loc: 'Singapore', text: 'Raw spreads on gold make a real difference for my scalping. Rules are clear and actually fair.', amt: '$50K' },
  { name: 'Tomás V.', loc: 'Spain', text: 'nTrader on mobile is clean. I manage my funded account from anywhere.', amt: '$25K' },
  { name: 'Aisha K.', loc: 'Kenya', text: 'Support replied in minutes at 2am. That alone sold me on Artix.', amt: '$200K' },
  { name: 'Lucas M.', loc: 'Brazil', text: 'No time limit meant I could trade my plan instead of forcing trades.', amt: '$100K' },
  { name: 'Hannah W.', loc: 'UK', text: 'Scaled from $50K to $62.5K after three green months. Exactly as advertised.', amt: '$50K' }
]
const rowA = reviews.slice(0, 3)
const rowB = reviews.slice(3)
</script>

<template>
  <section class="ts section">
    <div class="container ts__head">
      <span class="eyebrow" v-reveal>Trader stories</span>
      <SplitText class="h-xl" text="Funded traders,|*real* results." />
    </div>

    <div v-for="(row, r) in [rowA, rowB]" :key="r" class="marquee ts__row" :class="{ reverse: r === 1 }" style="--speed: 60s">
      <div v-for="n in 2" :key="n" class="marquee__track" :aria-hidden="n === 2">
        <figure v-for="(rv, k) in [...row, ...row]" :key="k" class="ts__card">
          <div class="ts__stars" aria-label="5 stars">★★★★★</div>
          <blockquote>“{{ rv.text }}”</blockquote>
          <figcaption>
            <span class="ts__avatar">{{ rv.name[0] }}</span>
            <span>
              <strong>{{ rv.name }}</strong>
              <small>{{ rv.loc }} · Funded {{ rv.amt }}</small>
            </span>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ts {
  overflow: hidden;
  background: var(--bg-soft);
}
.ts__head {
  margin-bottom: 56px;
}
.ts__head :deep(h2) {
  margin-top: 18px;
}
.ts__row {
  --gap: 18px;
  margin-top: 18px;
}
.ts__card {
  width: 380px;
  margin: 0;
  padding: 26px;
  border-radius: 24px;
  background: #fff;
  border: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ts__stars {
  letter-spacing: 3px;
  background: var(--neon-grad);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
blockquote {
  margin: 0;
  font-size: 17px;
  line-height: 1.5;
}
figcaption {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
}
figcaption small {
  display: block;
  color: var(--muted);
  font-size: 13px;
}
.ts__avatar {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: var(--ink);
  font-weight: 600;
  background: var(--neon-grad);
}
</style>
