<script setup lang="ts">
/**
 * DEV ONLY — excluded from production builds (see `ignore` in nuxt.config.ts).
 *
 * Preview the live three.js mountain, change its neon colour and export the still image the
 * homepage uses. "Download" saves a file from the browser (put it in app/assets/images/); to write it
 * straight into app/assets/images/mountain.webp run `npm run export:mountain` (see scripts/export-mountain.mjs).
 *
 * Query params: ?color=ffb800  (hex without #)
 */
definePageMeta({ layout: false })
useHead({ title: 'Mountain exporter · dev', meta: [{ name: 'robots', content: 'noindex' }] })

const route = useRoute()
const color = ref(`#${String(route.query.color ?? 'ffb800').replace('#', '')}`)
const animate = ref(true)
const scene = ref<{ capture: (w: number, h: number, type?: string, q?: number) => string }>()
const preview = ref('')
const size = { w: 2400, h: 1200 }

function exportImage() {
  if (!scene.value) return ''
  const url = scene.value.capture(size.w, size.h, 'image/webp', 0.92)
  preview.value = url
  // picked up by scripts/export-mountain.mjs
  ;(window as unknown as { __mountainImage?: string }).__mountainImage = url
  return url
}

function download() {
  const url = exportImage()
  if (!url) return
  const a = document.createElement('a')
  a.href = url
  a.download = 'mountain.webp'
  a.click()
}

onMounted(() => {
  // give the scene a moment to build its environment, then expose a ready flag for the script
  setTimeout(() => {
    exportImage()
    ;(window as unknown as { __mountainReady?: boolean }).__mountainReady = true
  }, 800)
})
</script>

<template>
  <main class="dev">
    <header>
      <h1>Mountain exporter <small>dev only</small></h1>
      <p>
        This is the live three.js scene behind <code>app/assets/images/mountain.webp</code>. Change the colour, then
        download the image (save it over that file) or run <code>npm run export:mountain</code> to write it into the project.
      </p>
      <div class="controls">
        <label>Neon colour <input v-model="color" type="color" /></label>
        <code>{{ color }}</code>
        <label><input v-model="animate" type="checkbox" /> Idle animation</label>
        <button @click="exportImage">Refresh preview</button>
        <button class="primary" @click="download">Download mountain.webp ({{ size.w }}×{{ size.h }})</button>
      </div>
    </header>

    <section class="stage">
      <ClientOnly>
        <MountainScene ref="scene" :color="color" :animate="animate" :progress="1" />
      </ClientOnly>
    </section>

    <section v-if="preview" class="out">
      <h2>Exported frame (what the homepage will show)</h2>
      <img :src="preview" alt="Exported mountain preview" />
    </section>
  </main>
</template>

<style scoped>
.dev {
  min-height: 100vh;
  padding: 32px;
  background: #faf7f0;
  font-family: var(--font-body);
}
h1 {
  font-size: 28px;
}
h1 small {
  font-size: 12px;
  font-family: var(--font-mono);
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--neon);
  vertical-align: middle;
}
p {
  margin-top: 8px;
  color: var(--ink-2);
  max-width: 70ch;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
}
.controls label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
button {
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: #fff;
  font-weight: 600;
}
button.primary {
  background: var(--ink);
  color: #fff;
}
.stage {
  position: relative;
  margin-top: 24px;
  aspect-ratio: 2 / 1;
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--line);
}
.out {
  margin-top: 32px;
}
.out h2 {
  font-size: 18px;
  margin-bottom: 12px;
}
.out img {
  width: 100%;
  border-radius: 20px;
  background:
    repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 0 0 / 24px 24px;
}
</style>
