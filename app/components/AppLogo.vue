<script setup lang="ts">
/**
 * Artix Capital wordmark (from artixcapital.com) + a lime PROP tag.
 * Letters use currentColor so the mark works on both the dark nav (`dark`) and light footer;
 * the "down" and "up" flags use dark / bright shades of the site lime (no red).
 */
defineProps<{ dark?: boolean }>()
</script>

<template>
  <span class="logo" :class="{ dark }" role="img" aria-label="Artix Prop">
    <svg class="mark" viewBox="10 8 1072 330" aria-hidden="true">
      <g fill="currentColor" fill-rule="evenodd">
        <path d="M303.9,329.8V136.5c-0.1-2.7-0.5-16.1,9.6-27.6C324.8,96.2,340.4,96,342.7,96h163.5V63.8H336.1c-5.5,0.5-27.4,3.1-44.9,21.6c-15.1,16-18,34.3-18.7,40.4v204H303.9z" />
        <path d="M526.9,15.7h33.2V256c-0.2,2.4-0.4,15.7,7.8,27c8.2,11.4,18.7,13.1,23.1,13h172.6v33.4H590.1c-8.4,0.8-25.4-0.2-43.2-16.9c-16.6-15.7-20.2-32.2-20.1-40.5V15.7z" />
        <rect x="580.7" y="65.1" width="182.8" height="31.8" />
        <rect x="784" y="65.8" width="32.8" height="263.9" />
        <polygon points="1074.6,329.8 1037.7,329.8 837.3,15.7 874.3,15.7" />
        <rect x="784.1" y="15.7" width="32.8" height="32.8" />
        <path d="M175,298.3l0.1,31.5H75.4c-4.5,0-26.3-1.5-43.2-21.6c-11-13.1-14.4-28.1-15.6-34.7V133.1c-0.2-4.8-0.7-28.7,14.8-48.7c13.3-17.1,29.8-20.7,34.6-21.5h128.6c12.3-0.9,31.3,2,46.5,22.3c10.4,13.9,10.7,20.2,10.9,35.3v209.3h-31.5V124.2c-0.9-3.8,1.1-12.7-6.1-20c-10.4-10.6-22.1-9.5-25.4-9.5H84.4c-5.2,0.5-24.9-3.1-32.4,12c-6.4,12.8-3.4,25.4-4.2,28.1c0,39.9-0.4,80.6-0.4,120.5c0.4,4.3-1.8,16.2,6,27.3c8.6,12.4,19.9,16.4,24,15.7C109.9,298,142.4,298.5,175,298.3" />
      </g>
      <!-- down flag (dark lime) -->
      <polygon fill="#3d5200" points="1074.6,15.7 985.7,144.5 907.8,15.7" />
      <polygon fill="#8fc400" points="907.8,15.7 966.5,113.4 1011,83.7" />
      <polygon fill="#6f9900" points="1074.6,15.7 994.5,15.7 1011,83.7" />
      <!-- up flag (bright lime) -->
      <polygon fill="#b6f500" points="926.2,200.9 1004.1,329.8 837.3,329.8" />
      <polygon fill="#d9ff7a" points="1003.8,329.3 944.1,230.5 901.3,259.7" />
      <polygon fill="#9bd100" points="918.6,329.8 901.3,259.7 837.3,329.8" />
      <polygon fill="#5e7f00" points="944.1,230.5 871.6,280.1 911.3,222.5" />
    </svg>
    <span class="tag">PROP</span>
  </span>
</template>

<style scoped>
.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--ink);
}
.logo.dark {
  color: #fff;
}
.mark {
  height: 24px;
  width: auto;
  aspect-ratio: 1072 / 330;
}
.tag {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.16em;
  line-height: 1;
  padding: 4px 7px;
  border-radius: 6px;
  color: var(--on-neon);
  background: var(--neon);
}
</style>
