<script setup lang="ts">
import { mascot, type MascotPose } from '~/data/mascot'

/** One pose of the Artix polar bear. `decorative` empties the alt text when the pose only repeats nearby copy. */
const props = defineProps<{ pose: MascotPose; decorative?: boolean; eager?: boolean }>()
const m = computed(() => mascot[props.pose])
</script>

<template>
  <img
    class="bear"
    :src="`/images/mascot/${pose}.webp`"
    :width="m.w"
    :height="m.h"
    :alt="decorative ? '' : m.alt"
    :loading="eager ? 'eager' : 'lazy'"
    decoding="async"
    draggable="false"
  />
</template>

<style scoped>
.bear {
  display: block;
  max-width: 100%;
  height: auto;
  user-select: none;
  pointer-events: none;
}
</style>
