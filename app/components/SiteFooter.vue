<script setup lang="ts">
const AC = 'https://artixcapital.com'
const OFFICE = 'Unit 1, La Place Creole Building, Rodney Village, Rodney Bay, Gros-Islet, Saint Lucia'
const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(OFFICE)}`

const contacts = [
  { label: '+44 7822 018441', href: 'tel:+447822018441' },
  { label: 'support@artixcapital.com', href: 'mailto:support@artixcapital.com' },
  { label: 'Saint Lucia (IBC 2023-00122)', href: MAPS }
]

const cols = [
  {
    n: '01',
    title: 'Program',
    links: [
      { label: '2-Step Evaluation', href: '#challenges' },
      { label: '1-Step Evaluation', href: '#challenges' },
      { label: 'Instant Funding', href: '#challenges' },
      { label: 'Scaling Plan', href: '#payouts' },
      { label: 'Trading Rules & FAQ', href: '#faq' }
    ]
  },
  {
    n: '02',
    title: 'Markets',
    links: [
      { label: 'Forex', href: `${AC}/forex-trading/` },
      { label: 'Commodities', href: `${AC}/commodities-trading/` },
      { label: 'Stocks', href: `${AC}/stocks-trading/` },
      { label: 'Indices', href: `${AC}/indices-trading/` },
      { label: 'Crypto & Futures', href: `${AC}/crypto-trading/` }
    ]
  },
  {
    n: '03',
    title: 'Platforms & Tools',
    links: [
      { label: 'nTrader Desktop', href: `${AC}/ntrader-for-windows/` },
      { label: 'nTrader Mobile', href: `${AC}/ntrader-for-mobile/` },
      { label: 'MetaTrader 5', href: `${AC}/meta-trader-5/` },
      { label: 'Spread Table', href: `${AC}/spread-table/` },
      { label: 'Economic Calendar', href: `${AC}/economic-calendar/` }
    ]
  },
  {
    n: '04',
    title: 'Artix Group',
    links: [
      { label: 'Artix Capital', href: `${AC}/` },
      { label: 'Artix Global', href: 'https://artixglobal.com/' },
      { label: 'Introducing Broker', href: `${AC}/introducing-broker/` },
      { label: 'White Label', href: `${AC}/white-label-solution/` },
      { label: 'Contact Us', href: `${AC}/contact-us/` }
    ]
  }
]

const docs = [
  ['Complaints', 'Complaints-Management-Policy.pdf'],
  ['Conflicts of Interest', 'Conflicts-of-Interest-Policy.pdf'],
  ['Privacy Policy', 'Privacy-Policy.pdf'],
  ['Risk Disclosure', 'Risk-Disclosure-Policy.pdf'],
  ['Risk Management', 'Risk-Management-Policy.pdf'],
  ['Safeguarding Funds', 'Safeguarding-of-Clients-Funds.pdf'],
  ['Fraud Alert', 'Fraud-Alert.pdf']
].map(([label, file]) => ({ label, href: `${AC}/files/${file}` }))

const regions = [
  ['US', 'United States'],
  ['CU', 'Cuba'],
  ['IQ', 'Iraq'],
  ['MM', 'Myanmar'],
  ['KP', 'North Korea'],
  ['SD', 'Sudan'],
  ['AE', 'United Arab Emirates'],
  ['IN', 'India']
]

const ext = (href: string) => href.startsWith('http')
const year = new Date().getFullYear()
const { $scrollTo } = useNuxtApp() as any
const toTop = () => ($scrollTo ? $scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' }))
const go = (e: MouseEvent, href: string) => {
  if (ext(href)) return
  e.preventDefault()
  $scrollTo?.(href)
}
</script>

<template>
  <footer class="ft">
    <div class="container">
      <!-- Top architectural brand + quick-action band -->
      <div class="ft__hero">
        <div class="ft__lead">
          <AppLogo dark />
          <p class="ft__pitch">
            Institutional prop trading backed by Artix Capital. Trade simulated firm capital up to $200K on nTrader &amp; MT5 and keep up to 90%.
          </p>
        </div>

        <div class="ft__actions">
          <a href="#challenges" class="ft__cta" @click="go($event, '#challenges')">
            Start a Challenge <span aria-hidden="true">→</span>
          </a>
          <div class="ft__contact-row">
            <a
              v-for="c in contacts"
              :key="c.label"
              :href="c.href"
              :target="ext(c.href) ? '_blank' : undefined"
              :rel="ext(c.href) ? 'noopener' : undefined"
              class="ft__pill"
            >
              {{ c.label }}
            </a>
          </div>
        </div>
      </div>

      <!-- Clean 4-column bento navigation -->
      <div class="ft__grid">
        <nav v-for="c in cols" :key="c.title" class="ft__col" :aria-label="c.title">
          <div class="ft__col-head">
            <span class="ft__num">{{ c.n }}</span>
            <h4>{{ c.title }}</h4>
          </div>
          <ul>
            <li v-for="l in c.links" :key="l.label">
              <a
                :href="l.href"
                :target="ext(l.href) ? '_blank' : undefined"
                :rel="ext(l.href) ? 'noopener' : undefined"
                @click="go($event, l.href)"
              >
                <span>{{ l.label }}</span>
                <span class="ft__link-ico" aria-hidden="true">{{ ext(l.href) ? '↗' : '→' }}</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Compact legal & disclosures strip (collapsible details keep footer clean & modern) -->
      <div class="ft__legal">
        <div class="ft__docs">
          <a v-for="d in docs" :key="d.label" :href="d.href" target="_blank" rel="noopener" class="ft__doc">
            {{ d.label }} <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div class="ft__disclosures">
          <details class="ft__acc" name="ft-legal">
            <summary>
              <span>Risk Statement &amp; Simulated Accounts Disclosure</span>
              <span class="ft__plus" aria-hidden="true" />
            </summary>
            <div class="ft__acc-body">
              <p>
                All Artix Prop evaluation and funded accounts are simulated accounts. Results on simulated accounts do not represent actual trading, and past performance is not indicative of future results. Artix Prop does not accept deposits; fees paid are for access to the evaluation program.
              </p>
              <p>
                Trading derivatives, forex, commodities, indices, stocks and crypto involves substantial risk of loss and may not be suitable for every investor. Nothing on this site constitutes financial, legal or tax advice from Artix Capital Ltd. Read the full
                <a :href="`${AC}/files/Risk-Disclosure-Policy.pdf`" target="_blank" rel="noopener">Risk Disclosure</a>.
              </p>
            </div>
          </details>

          <details class="ft__acc" name="ft-legal">
            <summary>
              <span>Corporate Registration &amp; Restricted Regions ({{ regions.length }})</span>
              <span class="ft__plus" aria-hidden="true" />
            </summary>
            <div class="ft__acc-body">
              <p>
                <strong>Artix Capital Ltd</strong> — International Business Company (IBC), Reg. No. 2023-00122. Registered office:
                <a :href="MAPS" target="_blank" rel="noopener">{{ OFFICE }}</a>. Operates as an offshore entity and is <strong>not licensed or regulated</strong> as a financial services provider in Saint Lucia.
              </p>
              <div class="ft__regions">
                <span v-for="[code, name] in regions" :key="code" class="ft__region">
                  <b>{{ code }}</b>{{ name }}
                </span>
              </div>
            </div>
          </details>
        </div>
      </div>

      <!-- Bottom copyright + back to top -->
      <div class="ft__bottom">
        <span>© {{ year }} Artix Capital Ltd · Reg. 2023-00122</span>
        <button type="button" class="ft__top" @click="toTop">
          <span>Back to top</span>
          <span class="ft__top-ico" aria-hidden="true">↑</span>
        </button>
      </div>
    </div>

    <!-- Monumental Three.js 3D beveled titanium + glowing neon-lime Artix X wordmark -->
    <ClientOnly>
      <FooterWordmark />
      <template #fallback>
        <div class="ft__word-fb" aria-hidden="true">ARTIX</div>
      </template>
    </ClientOnly>
  </footer>
</template>

<style scoped>
.ft {
  position: relative;
  padding: 88px 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background:
    radial-gradient(55% 260px at 50% 0%, rgba(var(--green-rgb), 0.08), transparent 72%),
    linear-gradient(180deg, #090a0c 0%, #050506 38%);
  overflow: hidden;
}
.ft::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: min(720px, 84vw);
  height: 1px;
  transform: translateX(-50%);
  background: linear-gradient(90deg, transparent, rgba(var(--green-rgb), 0.7), transparent);
  pointer-events: none;
}

/* Top Hero Band */
.ft__hero {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  padding-bottom: 56px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.ft__lead {
  display: grid;
  gap: 18px;
  max-width: 480px;
}
.ft__pitch {
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--ink-2);
}
.ft__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
}
.ft__cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 46px;
  padding: 0 24px;
  border-radius: 999px;
  background: var(--neon);
  color: var(--on-neon);
  font-size: 14.5px;
  font-weight: 600;
  transition: background 0.2s, transform 0.2s var(--ease-out), box-shadow 0.25s;
}
.ft__cta:hover {
  background: var(--neon-hover);
  box-shadow: 0 0 32px -6px rgba(var(--green-rgb), 0.65);
  transform: translateY(-1px);
}
.ft__contact-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}
.ft__pill {
  padding: 6px 13px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--ink-2);
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.ft__pill:hover {
  border-color: rgba(var(--green-rgb), 0.4);
  color: var(--neon-ink);
  background: rgba(var(--green-rgb), 0.07);
}

/* 4-column Bento Grid */
.ft__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  padding: 48px 0;
}
.ft__col {
  padding: 24px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.02);
  display: grid;
  gap: 18px;
  align-content: start;
  transition: border-color 0.25s, background 0.25s;
}
.ft__col:hover {
  border-color: rgba(var(--green-rgb), 0.22);
  background: rgba(255, 255, 255, 0.03);
}
.ft__col-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ft__num {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--neon-ink);
  opacity: 0.85;
}
.ft__col h4 {
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink);
}
.ft__col ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}
.ft__col a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: var(--ink-2);
  transition: color 0.2s;
}
.ft__link-ico {
  font-size: 12px;
  opacity: 0;
  transform: translateX(-4px);
  color: var(--neon-ink);
  transition: opacity 0.2s, transform 0.2s var(--ease-out);
}
.ft__col a:hover {
  color: #fff;
}
.ft__col a:hover .ft__link-ico {
  opacity: 1;
  transform: translateX(0);
}

/* Compact Legal + Accordions */
.ft__legal {
  display: grid;
  gap: 18px;
  padding-top: 8px;
}
.ft__docs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.ft__doc {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  font-size: 12px;
  color: var(--ink-2);
  transition: border-color 0.2s, color 0.2s;
}
.ft__doc:hover {
  border-color: rgba(var(--green-rgb), 0.35);
  color: var(--neon-ink);
}
.ft__disclosures {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.ft__acc {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  overflow: hidden;
}
.ft__acc summary {
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 18px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-2);
  cursor: pointer;
  transition: color 0.2s;
}
.ft__acc summary::-webkit-details-marker {
  display: none;
}
.ft__acc summary:hover,
.ft__acc[open] summary {
  color: var(--ink);
}
.ft__plus {
  position: relative;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.ft__plus::before,
.ft__plus::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1.5px;
  background: var(--neon-ink);
  transition: transform 0.25s var(--ease-out);
}
.ft__plus::after {
  transform: rotate(90deg);
}
.ft__acc[open] .ft__plus::after {
  transform: rotate(0deg);
}
.ft__acc-body {
  padding: 0 18px 18px;
  display: grid;
  gap: 10px;
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--muted);
}
.ft__acc-body strong {
  color: var(--ink);
}
.ft__acc-body a {
  color: var(--ink);
  text-decoration: underline;
  text-decoration-color: rgba(var(--green-rgb), 0.5);
  text-underline-offset: 3px;
}
.ft__regions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}
.ft__region {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 5px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(255, 255, 255, 0.03);
  font-size: 11.5px;
  color: var(--ink-2);
}
.ft__region b {
  padding: 1px 6px;
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  color: var(--neon-ink);
  background: rgba(var(--green-rgb), 0.14);
}

/* Bottom bar */
.ft__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 32px;
  padding: 20px 0 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
}
.ft__top {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 11.5px;
  transition: border-color 0.2s, color 0.2s, transform 0.2s var(--ease-out);
}
.ft__top:hover {
  border-color: rgba(var(--green-rgb), 0.45);
  color: var(--neon-ink);
  transform: translateY(-1px);
}
.ft__word-fb {
  text-align: center;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 20vw;
  line-height: 0.9;
  color: rgba(255, 255, 255, 0.04);
  -webkit-text-stroke: 1.5px rgba(var(--green-rgb), 0.35);
}

@media (max-width: 1024px) {
  .ft__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .ft__actions {
    align-items: flex-start;
  }
  .ft__contact-row {
    justify-content: flex-start;
  }
  .ft__disclosures {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .ft {
    padding-top: 64px;
  }
  .ft__grid {
    grid-template-columns: 1fr;
  }
  .ft__bottom {
    flex-direction: column-reverse;
    align-items: flex-start;
  }
}
</style>
