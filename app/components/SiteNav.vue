<script setup lang="ts">
const links = [
  { label: 'Challenges', href: '#challenges' },
  { label: 'How it works', href: '#how' },
  { label: 'Payouts', href: '#payouts' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Artix Capital', href: 'https://artixcapital.com/', external: true }
]

const scrolled = ref(false)
const open = ref(false)
const { $scrollTo } = useNuxtApp()

const onScroll = () => {
  scrolled.value = window.scrollY > 24
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const go = (e: MouseEvent, l: { href: string; external?: boolean }) => {
  if (l.external) return
  e.preventDefault()
  open.value = false
  $scrollTo?.(l.href)
}
</script>

<template>
  <!-- Fixed header: transparent over the hero panel, a dark bar once the page scrolls. -->
  <header class="nav" :class="{ scrolled, open }">
    <div class="nav__inner">
      <a href="#top" class="brand" aria-label="Artix Prop home" @click.prevent="$scrollTo?.(0)"><AppLogo dark /></a>

      <nav class="nav__links" aria-label="Primary">
        <a
          v-for="l in links"
          :key="l.label"
          :href="l.href"
          :target="l.external ? '_blank' : undefined"
          :rel="l.external ? 'noopener' : undefined"
          @click="go($event, l)"
          >{{ l.label }}<span v-if="l.external" aria-hidden="true"> ↗</span></a
        >
      </nav>

      <div class="nav__cta">
        <a href="#" class="login">Login</a>
        <a href="#challenges" class="btn btn-sm btn-light nav__btn" @click.prevent="$scrollTo?.('#challenges')">Get Funded</a>
        <button class="burger" :aria-expanded="open" aria-label="Menu" @click="open = !open">
          <span /><span />
        </button>
      </div>
    </div>

    <Transition name="drop">
      <div v-if="open" class="mobile">
        <a v-for="l in links" :key="l.label" :href="l.href" @click="go($event, l)">{{ l.label }}</a>
        <a href="#challenges" class="btn btn-primary nav__btn" @click="go($event, { href: '#challenges' })">Get Funded →</a>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.nav {
  position: fixed; /* stays on screen while scrolling (sticky header) */
  inset: 0 0 auto;
  z-index: 50;
  padding: 12px 16px;
}
.nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  max-width: 1320px;
  margin: 0 auto;
  height: 62px;
  padding: 0 10px 0 18px;
  border-radius: 999px;
  color: #fff;
  background: rgba(8, 9, 11, 0);
  border: 1px solid transparent;
  transition: background 0.5s var(--ease-out), border-color 0.5s, box-shadow 0.5s;
}
.scrolled .nav__inner,
.open .nav__inner {
  background: rgba(8, 9, 11, 0.86);
  border-color: var(--line-strong);
  box-shadow: 0 20px 50px -24px rgba(0, 0, 0, 0.9);
}
.nav__links {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 34px;
  font-size: 15px;
  font-weight: 500;
}
.nav__links a {
  position: relative;
  color: rgba(255, 255, 255, 0.78);
  transition: color 0.3s;
}
.nav__links a::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -6px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--neon), var(--green));
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.5s var(--ease-out);
}
.nav__links a:hover {
  color: #fff;
}
.nav__links a:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}
.nav__cta {
  display: flex;
  align-items: center;
  gap: 18px;
}
.login {
  font-size: 15px;
  font-weight: 500;
  color: #fff;
}
.nav__btn {
  font-size: 15px;
  font-weight: 600;
}
.burger {
  display: none;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  position: relative;
}
.burger span {
  position: absolute;
  left: 13px;
  right: 13px;
  height: 2px;
  background: #fff;
  border-radius: 2px;
  transition: transform 0.4s var(--ease-out);
}
.burger span:first-child {
  top: 17px;
}
.burger span:last-child {
  top: 23px;
}
.open .burger span:first-child {
  transform: translateY(3px) rotate(45deg);
}
.open .burger span:last-child {
  transform: translateY(-3px) rotate(-45deg);
}
.mobile {
  display: grid;
  gap: 4px;
  margin: 8px auto 0;
  padding: 14px;
  border-radius: 22px;
  background: rgba(8, 9, 11, 0.96);
  color: #fff;
  border: 1px solid var(--line-strong);
  font-size: 17px;
  font-weight: 500;
}
.mobile a:not(.btn) {
  padding: 12px 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
}
.mobile .btn {
  margin-top: 12px;
}
.drop-enter-active,
.drop-leave-active {
  transition: opacity 0.4s var(--ease-out), transform 0.4s var(--ease-out);
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 960px) {
  .nav__links,
  .login {
    display: none;
  }
  .burger {
    display: block;
  }
}
@media (max-width: 420px) {
  .nav__cta .nav__btn {
    display: none;
  }
}
</style>
