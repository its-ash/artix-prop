<script setup lang="ts">
import { faqs } from '~/data/faq'

const open = ref<number | null>(0)
</script>

<template>
  <section id="faq" class="fq section">
    <div class="container fq__grid">
      <div class="fq__side">
        <span class="eyebrow" v-reveal>FAQ</span>
        <SplitText class="h-xl" text="Questions,|*answered.*" />
        <p class="lead" v-reveal="150">
          Still curious? Talk to a real person 24/5 at
          <a href="mailto:support@artixcapital.com" class="grad-text">support@artixcapital.com</a>
        </p>
      </div>

      <div class="fq__list">
        <div v-for="(f, i) in faqs" :key="f.q" v-reveal="i * 60" class="fq__item" :class="{ open: open === i }">
          <button :aria-expanded="open === i" @click="open = open === i ? null : i">
            <span class="fq__n">0{{ i + 1 }}</span>
            <span class="fq__q">{{ f.q }}</span>
            <span class="fq__icon" />
          </button>
          <div class="fq__a">
            <div><p>{{ f.a }}</p></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fq__grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: clamp(40px, 7vw, 100px);
}
.fq__side {
  position: sticky;
  top: 140px;
  align-self: start;
  display: grid;
  gap: 22px;
}
.fq__item {
  border-bottom: 1px solid var(--line-strong);
}
.fq__item button {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  padding: 26px 0;
  text-align: left;
}
.fq__n {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
}
.fq__q {
  flex: 1;
  font-family: var(--font-display);
  font-size: clamp(19px, 1.8vw, 24px);
  font-weight: 500;
  letter-spacing: -0.02em;
}
.fq__icon {
  position: relative;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  transition: background 0.4s, border-color 0.4s, transform 0.6s var(--ease-out);
}
.fq__icon::before,
.fq__icon::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 12px;
  height: 1.5px;
  background: currentColor;
  transform: translate(-50%, -50%);
}
.fq__icon::after {
  transform: translate(-50%, -50%) rotate(90deg);
  transition: transform 0.5s var(--ease-out);
}
.open .fq__icon {
  color: var(--on-neon);
  background: var(--neon-grad);
  border-color: transparent;
  transform: rotate(180deg);
}
.open .fq__icon::after {
  transform: translate(-50%, -50%) rotate(0deg);
}
/* animate height with grid-template-rows */
.fq__a {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.6s var(--ease-out);
}
.fq__a > div {
  overflow: hidden;
}
.open .fq__a {
  grid-template-rows: 1fr;
}
.fq__a p {
  padding: 0 56px 28px 44px;
  color: var(--ink-2);
  font-size: 16px;
}
@media (max-width: 860px) {
  .fq__grid {
    grid-template-columns: 1fr;
  }
  .fq__side {
    position: relative;
    top: 0;
  }
  .fq__a p {
    padding: 0 0 24px;
  }
}
</style>
