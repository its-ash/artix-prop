<script setup lang="ts">
const links = [
  { label: 'Challenges', href: '#challenges', id: 'challenges' },
  { label: 'How it works', href: '#how', id: 'how' },
  { label: 'Payouts', href: '#payouts', id: 'payouts' },
  { label: 'FAQ', href: '#faq', id: 'faq' }
]

const groupFirms = [
  { name: 'Artix Prop', desc: 'Funded accounts up to $200K', href: '#top', current: true, dot: '#b6f500' },
  { name: 'Artix Capital', desc: 'Multi-asset brokerage & nTrader', href: 'https://artixcapital.com/', dot: '#d6141c' },
  { name: 'Artix Global', desc: 'Global markets & liquidity', href: 'https://artixglobal.com/', dot: '#4fd16a' }
]

const scrolled = ref(false)
const open = ref(false)
const groupOpen = ref(false)
const activeId = ref('')
const navEl = ref<HTMLElement>()
const pillStyle = ref<{ left: string; width: string; opacity: string }>({ left: '0px', width: '0px', opacity: '0' })

const { $scrollTo } = useNuxtApp()

const movePill = (target: HTMLElement | null) => {
  const container = navEl.value
  if (!container || !target) {
    pillStyle.value = { ...pillStyle.value, opacity: '0' }
    return
  }
  const cr = container.getBoundingClientRect()
  const tr = target.getBoundingClientRect()
  pillStyle.value = {
    left: `${tr.left - cr.left}px`,
    width: `${tr.width}px`,
    opacity: '1'
  }
}

const syncActivePill = () => {
  if (!navEl.value || !activeId.value) {
    pillStyle.value = { ...pillStyle.value, opacity: '0' }
    return
  }
  const el = navEl.value.querySelector<HTMLElement>(`a[data-id="${activeId.value}"]`)
  movePill(el)
}

let raf = 0
const updateScroll = () => {
  raf = 0
  scrolled.value = window.scrollY > 24
}
const onScroll = () => {
  if (!raf) raf = requestAnimationFrame(updateScroll)
}
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    open.value = false
    groupOpen.value = false
  }
}
const onDocClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement | null
  if (groupOpen.value && !target?.closest('.switcher')) groupOpen.value = false
}

let io: IntersectionObserver | undefined
onMounted(() => {
  updateScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
  document.addEventListener('click', onDocClick)

  io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
          syncActivePill()
        }
      }
    },
    { rootMargin: '-38% 0px -52% 0px' }
  )
  for (const l of links) {
    const el = document.getElementById(l.id)
    if (el) io.observe(el)
  }
})
onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
  document.removeEventListener('click', onDocClick)
  io?.disconnect()
})

const go = (e: MouseEvent, href: string) => {
  if (href.startsWith('http')) return
  e.preventDefault()
  open.value = false
  groupOpen.value = false
  $scrollTo?.(href)
}
</script>

<template>
  <header class="hdr" :class="{ scrolled, open }">
    <div class="hdr__bar">
      <div class="hdr__left">
        <a href="#top" class="brand" aria-label="Artix Prop home" @click.prevent="$scrollTo?.(0)">
          <AppLogo dark />
        </a>

        <div class="switcher">
          <button
            type="button"
            class="switcher__btn"
            :aria-expanded="groupOpen"
            aria-label="Artix Group firms"
            @click="groupOpen = !groupOpen"
          >
            <span class="switcher__dot" aria-hidden="true" />
            <span>Group</span>
            <svg class="switcher__chev" :class="{ flip: groupOpen }" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>

          <Transition name="pop">
            <div v-if="groupOpen" class="switcher__menu" role="menu">
              <a
                v-for="f in groupFirms"
                :key="f.name"
                :href="f.href"
                :target="f.current ? undefined : '_blank'"
                :rel="f.current ? undefined : 'noopener'"
                class="switcher__item"
                :class="{ current: f.current }"
                role="menuitem"
                @click="f.current ? go($event, '#top') : (groupOpen = false)"
              >
                <span class="switcher__swatch" :style="{ background: f.dot }" aria-hidden="true" />
                <span class="switcher__meta">
                  <strong>{{ f.name }}</strong>
                  <small>{{ f.desc }}</small>
                </span>
                <span class="switcher__tag">{{ f.current ? 'Live' : '↗' }}</span>
              </a>
            </div>
          </Transition>
        </div>
      </div>

      <nav ref="navEl" class="hdr__nav" aria-label="Primary" @pointerleave="syncActivePill">
        <span class="hdr__pill" :style="pillStyle" aria-hidden="true" />
        <a
          v-for="l in links"
          :key="l.id"
          :href="l.href"
          :data-id="l.id"
          :class="{ active: activeId === l.id }"
          @pointerenter="(e) => movePill(e.currentTarget as HTMLElement)"
          @click="go($event, l.href)"
        >
          {{ l.label }}
        </a>
      </nav>

      <div class="hdr__right">
        <a href="#" class="hdr__login">Log in</a>
        <a href="#challenges" class="hdr__cta" @click="go($event, '#challenges')">
          <span>Get Funded</span>
          <span class="hdr__arrow" aria-hidden="true">→</span>
        </a>
        <button class="hdr__burger" :aria-expanded="open" aria-label="Toggle menu" @click="open = !open">
          <span /><span />
        </button>
      </div>
    </div>

    <Transition name="drawer">
      <div v-if="open" class="drawer">
        <div class="drawer__inner">
          <div class="drawer__links">
            <a
              v-for="(l, i) in links"
              :key="l.id"
              :href="l.href"
              :class="{ active: activeId === l.id }"
              @click="go($event, l.href)"
            >
              <span class="drawer__num">0{{ i + 1 }}</span>
              <span class="drawer__label">{{ l.label }}</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div class="drawer__firms">
            <a
              v-for="f in groupFirms.filter((x) => !x.current)"
              :key="f.name"
              :href="f.href"
              target="_blank"
              rel="noopener"
              class="drawer__firm"
            >
              <span class="switcher__swatch" :style="{ background: f.dot }" aria-hidden="true" />
              <span>{{ f.name }} ↗</span>
            </a>
          </div>

          <div class="drawer__actions">
            <a href="#" class="drawer__login" @click="open = false">Log in</a>
            <a href="#challenges" class="hdr__cta drawer__cta" @click="go($event, '#challenges')">Get Funded →</a>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.hdr {
  position: fixed;
  inset: 0 0 auto;
  z-index: 60;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(5, 5, 6, 0.42);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  backdrop-filter: blur(18px) saturate(150%);
  transition: background 0.3s var(--ease-out), border-color 0.3s var(--ease-out);
}
.hdr.scrolled,
.hdr.open {
  background: rgba(5, 5, 6, 0.86);
  border-bottom-color: rgba(255, 255, 255, 0.09);
}
.hdr__bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  max-width: 1360px;
  margin: 0 auto;
  height: 68px;
  padding: 0 clamp(16px, 3vw, 36px);
}
.hdr__left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.brand {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
}
.switcher {
  position: relative;
}
.switcher__btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  color: var(--ink-2);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.switcher__btn:hover {
  border-color: rgba(var(--green-rgb), 0.35);
  color: var(--ink);
  background: rgba(255, 255, 255, 0.06);
}
.switcher__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--neon);
}
.switcher__chev {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.2s var(--ease-out);
}
.switcher__chev.flip {
  transform: rotate(180deg);
}
.switcher__menu {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  width: 268px;
  padding: 6px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(10, 11, 13, 0.96);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  box-shadow: 0 24px 50px -16px rgba(0, 0, 0, 0.9);
  display: grid;
  gap: 2px;
}
.switcher__item {
  display: grid;
  grid-template-columns: 8px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  transition: background 0.2s;
}
.switcher__item:hover,
.switcher__item.current {
  background: rgba(255, 255, 255, 0.06);
}
.switcher__swatch {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.switcher__meta {
  display: grid;
  gap: 2px;
}
.switcher__meta strong {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
}
.switcher__meta small {
  font-size: 11.5px;
  color: var(--muted);
}
.switcher__tag {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--neon-ink);
}

/* Gliding-pill segmented navigation */
.hdr__nav {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
}
.hdr__pill {
  position: absolute;
  top: 4px;
  bottom: 4px;
  border-radius: 999px;
  background: rgba(var(--green-rgb), 0.14);
  box-shadow: 0 0 0 1px rgba(var(--green-rgb), 0.28) inset;
  pointer-events: none;
  transition: left 0.28s var(--ease-out), width 0.28s var(--ease-out), opacity 0.2s ease;
}
.hdr__nav a {
  position: relative;
  z-index: 1;
  padding: 7px 16px;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 500;
  color: rgba(243, 244, 246, 0.74);
  white-space: nowrap;
  transition: color 0.2s;
}
.hdr__nav a:hover,
.hdr__nav a.active {
  color: #fff;
}
.hdr__nav a.active {
  color: var(--neon-ink);
}

.hdr__right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hdr__login {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  padding: 0 15px;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--ink-2);
  transition: color 0.2s, background 0.2s;
}
.hdr__login:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}
.hdr__cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 38px;
  padding: 0 18px;
  border-radius: 999px;
  background: var(--neon);
  color: var(--on-neon);
  font-size: 13.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  transition: background 0.2s, transform 0.2s var(--ease-out), box-shadow 0.25s;
}
.hdr__cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 25%, rgba(255, 255, 255, 0.55) 50%, transparent 75%);
  transform: translateX(-130%);
  transition: transform 0.65s var(--ease-out);
}
.hdr__cta:hover::before {
  transform: translateX(130%);
}
.hdr__cta:hover {
  background: var(--neon-hover);
  box-shadow: 0 0 28px -6px rgba(var(--green-rgb), 0.7);
}
.hdr__cta:active {
  transform: scale(0.97);
}
.hdr__arrow {
  transition: transform 0.25s var(--ease-out);
}
.hdr__cta:hover .hdr__arrow {
  transform: translateX(3px);
}
.hdr__burger {
  display: none;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  position: relative;
}
.hdr__burger span {
  position: absolute;
  left: 12px;
  right: 12px;
  height: 1.5px;
  background: #fff;
  border-radius: 2px;
  transition: transform 0.28s var(--ease-out);
}
.hdr__burger span:first-child {
  top: 16px;
}
.hdr__burger span:last-child {
  top: 23px;
}
.open .hdr__burger span:first-child {
  transform: translateY(3.5px) rotate(45deg);
}
.open .hdr__burger span:last-child {
  transform: translateY(-3.5px) rotate(-45deg);
}

.drawer {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(5, 5, 6, 0.98);
}
.drawer__inner {
  max-width: 1360px;
  margin: 0 auto;
  padding: 18px clamp(16px, 3vw, 36px) 24px;
  display: grid;
  gap: 16px;
}
.drawer__links {
  display: grid;
  gap: 4px;
}
.drawer__links a {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  align-items: center;
  min-height: 48px;
  padding: 0 12px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  color: var(--ink);
}
.drawer__links a.active {
  background: rgba(var(--green-rgb), 0.12);
  color: var(--neon-ink);
}
.drawer__num {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted);
}
.drawer__firms {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.drawer__firm {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  font-size: 12.5px;
  color: var(--ink-2);
}
.drawer__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.drawer__login {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}
.drawer__cta {
  height: 44px;
}

.pop-enter-active,
.pop-leave-active,
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.22s var(--ease-out), transform 0.22s var(--ease-out);
}
.pop-enter-from,
.pop-leave-to,
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 1024px) {
  .hdr__nav,
  .hdr__login,
  .switcher {
    display: none;
  }
  .hdr__burger {
    display: block;
  }
}
@media (max-width: 440px) {
  .hdr__right .hdr__cta {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hdr,
  .hdr__pill,
  .hdr__cta,
  .hdr__cta::before,
  .hdr__arrow,
  .hdr__burger span,
  .pop-enter-active,
  .pop-leave-active,
  .drawer-enter-active,
  .drawer-leave-active {
    transition: none;
  }
}
</style>
