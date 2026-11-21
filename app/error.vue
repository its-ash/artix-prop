<script setup lang="ts">
import type { NuxtError } from '#app'

// Also prerendered as docs/404.html, which GitHub Pages serves for unknown paths.
const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => (props.error?.statusCode ?? 404) === 404)

useSeoMeta({
  title: () => (is404.value ? 'Page not found — Artix Prop' : 'Something went wrong — Artix Prop'),
  robots: 'noindex'
})
</script>

<template>
  <main class="err">
    <a href="/" class="err__logo" aria-label="Artix Prop home"><AppLogo dark /></a>
    <BearMascot pose="oops" eager class="err__bear" />
    <span class="eyebrow">{{ error?.statusCode ?? 404 }}</span>
    <h1 class="h-xl">{{ is404 ? 'This chart broke.' : 'Something went wrong.' }}</h1>
    <p class="lead">
      {{ is404 ? "The page you're looking for doesn't exist or has moved." : 'Please try again in a moment.' }}
    </p>
    <button type="button" class="btn btn-primary" @click="clearError({ redirect: '/' })">
      Back to Artix Prop <span class="arrow">→</span>
    </button>
  </main>
</template>

<style scoped>
.err {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 100px 24px 60px;
  text-align: center;
}
.err__logo {
  position: absolute;
  top: 28px;
  left: 50%;
  transform: translateX(-50%);
}
.err__bear {
  width: min(280px, 70vw);
}
.err .lead {
  max-width: 44ch;
}
.err .btn {
  margin-top: 10px;
}
</style>
