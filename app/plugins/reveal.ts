import type { DirectiveBinding } from 'vue'

/**
 * v-reveal  → fade / rise / un-blur when the element enters the viewport.
 *             Optional value = delay in ms:  v-reveal="120"
 * v-inview  → only toggles the `.is-in` class (used by split text etc.)
 */
export default defineNuxtPlugin((nuxtApp) => {
  let io: IntersectionObserver | null = null

  const observer = () => {
    if (!io) {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in')
              io?.unobserve(entry.target)
            }
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
      )
    }
    return io
  }

  const delayStyle = (binding: DirectiveBinding<number | undefined>) =>
    binding.value ? `--reveal-delay:${binding.value}ms` : undefined

  nuxtApp.vueApp.directive<HTMLElement, number | undefined>('reveal', {
    getSSRProps: (binding) => ({ 'data-reveal': '', style: delayStyle(binding) }),
    mounted(el, binding) {
      el.setAttribute('data-reveal', '')
      if (binding.value) el.style.setProperty('--reveal-delay', `${binding.value}ms`)
      observer().observe(el)
    },
    unmounted(el) {
      io?.unobserve(el)
    }
  })

  nuxtApp.vueApp.directive<HTMLElement>('inview', {
    getSSRProps: () => ({}),
    mounted(el) {
      observer().observe(el)
    },
    unmounted(el) {
      io?.unobserve(el)
    }
  })
})
