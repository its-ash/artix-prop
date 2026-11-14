<script setup lang="ts">
/**
 * Splits a heading into masked words that slide up when in view.
 * Wrap a word in *asterisks* to render it with the neon gradient.
 * Use "\n" (or a | character) to force a line break.
 */
const props = withDefaults(
  defineProps<{ text: string; tag?: string; stagger?: number; delay?: number }>(),
  { tag: 'h2', stagger: 55, delay: 0 }
)

const lines = computed(() => {
  let i = 0
  return props.text.split(/\n|\|/).map((line) =>
    line
      .trim()
      .split(/\s+/)
      .map((raw) => {
        const grad = raw.startsWith('*') && raw.endsWith('*')
        return { word: grad ? raw.slice(1, -1) : raw, grad, d: props.delay + i++ * props.stagger }
      })
  )
})
</script>

<template>
  <component :is="tag" v-inview :aria-label="text.replace(/[*|]/g, '').replace(/\n/g, ' ')">
    <template v-for="(line, li) in lines" :key="li">
      <span aria-hidden="true" class="line">
        <template v-for="(w, wi) in line" :key="wi"
          ><span class="split-line"
            ><span :class="{ 'grad-text': w.grad }" :style="{ '--d': `${w.d}ms` }">{{ w.word }}</span></span
          >{{ ' ' }}</template
        >
      </span>
      <br v-if="li < lines.length - 1" />
    </template>
  </component>
</template>

<style scoped>
.line {
  white-space: normal;
}
</style>
