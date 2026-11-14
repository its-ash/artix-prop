<script setup lang="ts">
defineProps<{ dark?: boolean }>()
const id = useId()
</script>

<template>
  <span class="logo" :class="{ dark }">
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
      <defs>
        <linearGradient :id="`g-${id}`" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffb800" />
          <stop offset="1" stop-color="#ffb800" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" :fill="dark ? '#fff' : '#0b0b12'" />
      <path d="M9 24 16 8l7 16" fill="none" :stroke="`url(#g-${id})`" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M12 18.5h8" :stroke="`url(#g-${id})`" stroke-width="3" stroke-linecap="round" />
    </svg>
    <span class="word">ARTIX</span>
    <span class="tag">PROP</span>
  </span>
</template>

<style scoped>
.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--ink);
}
.logo.dark {
  color: #fff;
}
.word {
  font-size: 18px;
}
.tag {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  padding: 3px 7px;
  border-radius: 6px;
  color: var(--ink);
  background: var(--neon-grad);
}
</style>
