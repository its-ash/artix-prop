<script setup lang="ts">
// Mirrors the artixcapital.com footer (brand + contact cards, link grid, corporate/risk panel, bottom bar, wordmark).
const AC = 'https://artixcapital.com'
const OFFICE = 'Unit 1, La Place Creole Building, Rodney Village, Rodney Bay, Gros-Islet, Saint Lucia'
const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(OFFICE)}`

const contacts = [
  { icon: 'phone', label: 'Phone', value: '+44 7822 018441', href: 'tel:+447822018441' },
  { icon: 'mail', label: 'Email', value: 'support@artixcapital.com', href: 'mailto:support@artixcapital.com' },
  { icon: 'pin', label: 'Registered office', value: OFFICE, href: MAPS }
]

const cols = [
  {
    title: 'Program',
    links: [
      { label: '2-Step Evaluation', href: '#challenges' },
      { label: '1-Step Evaluation', href: '#challenges' },
      { label: 'Instant Funding', href: '#challenges' },
      { label: 'Scaling plan', href: '#payouts' },
      { label: 'Trading rules', href: '#faq' }
    ]
  },
  {
    title: 'Markets',
    links: [
      { label: 'Forex', href: `${AC}/forex-trading/` },
      { label: 'Commodities', href: `${AC}/commodities-trading/` },
      { label: 'Stocks', href: `${AC}/stocks-trading/` },
      { label: 'Indices', href: `${AC}/indices-trading/` },
      { label: 'Crypto', href: `${AC}/crypto-trading/` },
      { label: 'Futures', href: `${AC}/futures-trading/` }
    ]
  },
  {
    title: 'Platforms',
    links: [
      { label: 'MetaTrader 5', href: `${AC}/meta-trader-5/` },
      { label: 'MetaTrader 5 for Mobile', href: `${AC}/meta-trader-5-mobile/` },
      { label: 'nTrader for Windows', href: `${AC}/ntrader-for-windows/` },
      { label: 'nTrader for Mobile', href: `${AC}/ntrader-for-mobile/` }
    ]
  },
  {
    title: 'Partners',
    links: [
      { label: 'Introducing Broker', href: `${AC}/introducing-broker/` },
      { label: 'White Label', href: `${AC}/white-label-solution/` }
    ]
  },
  {
    title: 'Trading',
    links: [
      { label: 'Economic Calendar', href: `${AC}/economic-calendar/` },
      { label: 'Spread Table', href: `${AC}/spread-table/` },
      { label: 'Futures Expiry Dates', href: `${AC}/expiry-dates-of-futures-contracts/` }
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: `${AC}/about/` },
      { label: 'Contact Us', href: `${AC}/contact-us/` },
      { label: 'FAQ', href: '#faq' }
    ]
  }
]

const corporate = [
  { k: 'Company', v: 'Artix Capital Ltd' },
  { k: 'Registration no.', v: '2023-00122' },
  { k: 'Type', v: 'International Business Company (IBC)' },
  { k: 'Registered office', v: OFFICE, href: MAPS },
  { k: 'Corporate email', v: 'support@artixcapital.com', href: 'mailto:support@artixcapital.com' }
]

const docs = [
  ['Complaints Management', 'Complaints-Management-Policy.pdf'],
  ['Conflicts of Interest', 'Conflicts-of-Interest-Policy.pdf'],
  ['Privacy Policy', 'Privacy-Policy.pdf'],
  ['Risk Disclosure', 'Risk-Disclosure-Policy.pdf'],
  ['Risk Management', 'Risk-Management-Policy.pdf'],
  ['Safeguarding of Client Funds', 'Safeguarding-of-Clients-Funds.pdf'],
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
</script>

<template>
  <footer class="ft">
    <div class="container">
      <!-- Brand + link grid -->
      <div class="ft__top">
        <div class="ft__brand">
          <AppLogo />
          <p>
            Artix Prop is the prop trading program of Artix Capital Ltd, giving traders access to firm capital on
            nTrader and MetaTrader 5, with up to 90% of the profits.
          </p>
          <div class="ft__contacts">
            <a
              v-for="c in contacts"
              :key="c.label"
              :href="c.href"
              class="ft__contact"
              :target="ext(c.href) ? '_blank' : undefined"
              :rel="ext(c.href) ? 'noopener' : undefined"
            >
              <span class="ft__ico" aria-hidden="true">
                <svg v-if="c.icon === 'phone'" viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>
                <svg v-else-if="c.icon === 'mail'" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                <svg v-else viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
              </span>
              <span class="ft__cbody">
                <small>{{ c.label }}</small>
                <span>{{ c.value }}</span>
              </span>
              <svg class="ft__arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
            </a>
          </div>
        </div>

        <div class="ft__cols">
          <nav v-for="c in cols" :key="c.title" class="ft__col" :aria-label="c.title">
            <h4>{{ c.title }}</h4>
            <a
              v-for="l in c.links"
              :key="l.label"
              :href="l.href"
              :target="ext(l.href) ? '_blank' : undefined"
              :rel="ext(l.href) ? 'noopener' : undefined"
            >{{ l.label }}</a>
          </nav>
        </div>
      </div>

      <!-- Corporate + risk panel -->
      <div class="ft__panel">
        <div class="ft__corp">
          <h3>Corporate information</h3>
          <dl>
            <template v-for="r in corporate" :key="r.k">
              <dt>{{ r.k }}</dt>
              <dd>
                <a v-if="r.href" :href="r.href" :target="ext(r.href) ? '_blank' : undefined" :rel="ext(r.href) ? 'noopener' : undefined">{{ r.v }}</a>
                <template v-else>{{ r.v }}</template>
              </dd>
            </template>
          </dl>
          <p class="ft__note">
            The company operates as an offshore entity that gives international clients access to an online trading
            platform. Artix Capital Ltd is <strong>not licensed or regulated</strong> as a financial services provider in
            Saint Lucia.
          </p>
          <h4>Legal documents</h4>
          <div class="ft__chips">
            <a v-for="d in docs" :key="d.label" :href="d.href" target="_blank" rel="noopener" class="ft__doc">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>
              {{ d.label }}
            </a>
          </div>
        </div>

        <div class="ft__risk">
          <h3>Risk statement</h3>
          <p>
            All Artix Prop evaluation and funded accounts are simulated accounts. Results on simulated accounts do not
            represent actual trading, and past performance is not indicative of future results. Artix Prop does not
            accept deposits; fees paid are for access to the evaluation program.
          </p>
          <p>
            An investment in derivatives may mean investors may lose an amount even greater than their original
            investment. Anyone wishing to invest in any of the products mentioned in
            <a :href="AC" target="_blank" rel="noopener">www.artixcapital.com</a> should seek their own financial or
            professional advice. Trading of securities, forex, stock market, commodities, options and futures may not be
            suitable for everyone and involves the risk of losing part or all of your money. Don't invest and trade with
            money which you can't afford to lose. You are strongly advised to obtain independent financial, legal and tax
            advice. Nothing in this site should be read or construed as constituting advice on the part of Artix Capital
            Ltd or any of its affiliates, directors, officers or employees. Read the full
            <a :href="`${AC}/files/Risk-Disclosure-Policy.pdf`" target="_blank" rel="noopener">Risk Disclosure</a>.
          </p>
          <hr />
          <h3>Restricted regions</h3>
          <div class="ft__chips">
            <span v-for="[code, name] in regions" :key="code" class="ft__region">
              <b>{{ code }}</b>{{ name }}
            </span>
          </div>
          <p>
            Artix Capital Ltd does not provide services for citizens/residents of the United States, Cuba, Iraq, Myanmar,
            North Korea, Sudan, the United Arab Emirates and India. The services of Artix Capital Ltd are not intended for
            distribution to, or use by, any person in any country or jurisdiction where such distribution or use would be
            contrary to local law or regulation.
          </p>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="ft__bottom">
        <span>© {{ year }} Artix Capital Ltd. All rights reserved. Registration no. 2023-00122.</span>
        <button type="button" class="ft__top-btn" @click="toTop">
          Back to top
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
        </button>
      </div>
    </div>

    <div class="ft__word" aria-hidden="true">Artix Prop</div>
  </footer>
</template>

<style scoped>
.ft {
  padding: 96px 0 0;
  border-top: 1px solid var(--line);
  overflow: hidden;
}
svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Brand + links */
.ft__top {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: 64px;
}
.ft__brand {
  display: grid;
  gap: 24px;
  align-content: start;
}
.ft__brand p {
  color: var(--ink-2);
  font-size: 16px;
  line-height: 1.65;
  max-width: 40ch;
}
.ft__contacts {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}
.ft__contact {
  display: grid;
  grid-template-columns: 40px 1fr 14px;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid var(--line-strong);
  border-radius: 14px;
  background: var(--panel);
  transition: border-color 0.2s, background 0.2s;
}
.ft__contact:hover {
  border-color: rgba(var(--green-rgb), 0.45);
  background: var(--panel-2);
}
.ft__ico {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: var(--neon);
  background: rgba(var(--green-rgb), 0.1);
}
.ft__ico svg {
  width: 18px;
  height: 18px;
}
.ft__cbody {
  display: grid;
  gap: 2px;
  font-size: 14px;
  color: var(--ink);
}
.ft__cbody small {
  font-size: 12px;
  color: var(--muted);
}
.ft__arrow {
  width: 14px;
  height: 14px;
  align-self: start;
  color: var(--muted);
  transition: color 0.2s, transform 0.2s;
}
.ft__contact:hover .ft__arrow {
  color: var(--neon);
  transform: translate(2px, -2px);
}
.ft__cols {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 48px 24px;
}
.ft__col {
  position: relative;
  display: grid;
  gap: 14px;
  align-content: start;
  padding-top: 24px;
  border-top: 1px solid var(--line-strong);
  font-size: 14px;
  color: var(--ink-2);
}
.ft__col::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  width: 40px;
  height: 1px;
  background: var(--neon);
}
.ft__col h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 4px;
}
.ft__col a {
  justify-self: start;
  transition: color 0.2s;
}
.ft__col a:hover {
  color: var(--neon);
}

/* Corporate + risk panel */
.ft__panel {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  margin-top: 80px;
  border: 1px solid var(--line-strong);
  border-radius: 18px;
  background: var(--panel);
}
.ft__corp,
.ft__risk {
  padding: 36px 32px;
  font-size: 14px;
  line-height: 1.65;
  color: var(--muted);
}
.ft__risk {
  border-left: 1px solid var(--line-strong);
  display: grid;
  gap: 14px;
  align-content: start;
}
.ft__panel h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 12px;
}
.ft__panel a {
  color: var(--ink);
  text-decoration: underline;
  text-decoration-color: rgba(var(--green-rgb), 0.5);
  text-underline-offset: 3px;
}
.ft__panel a:hover {
  color: var(--neon);
}
.ft__corp dl {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 14px 20px;
}
.ft__corp dd {
  margin: 0;
  color: var(--ink);
}
.ft__note {
  margin-top: 24px;
  padding: 16px;
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  background: var(--bg);
}
.ft__note strong {
  color: var(--ink);
}
.ft__corp h4 {
  margin: 28px 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
}
.ft__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.ft__panel .ft__doc {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  font-size: 12.5px;
  color: var(--ink);
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s;
}
.ft__panel .ft__doc:hover {
  border-color: rgba(var(--green-rgb), 0.5);
}
.ft__doc svg {
  width: 14px;
  height: 14px;
  color: var(--neon);
}
.ft__risk hr {
  border: 0;
  border-top: 1px solid var(--line-strong);
  margin: 18px 0 8px;
}
.ft__risk h3 {
  margin-bottom: 0;
}
.ft__region {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  border: 1px solid rgba(var(--green-rgb), 0.28);
  border-radius: 999px;
  background: rgba(var(--green-rgb), 0.06);
  font-size: 12.5px;
  color: var(--ink);
}
.ft__region b {
  padding: 2px 6px;
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  color: var(--on-neon);
  background: var(--neon);
}

/* Bottom bar */
.ft__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--line-strong);
  font-size: 13px;
  color: var(--muted);
}
.ft__top-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: transparent;
  color: var(--ink);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.ft__top-btn:hover {
  border-color: rgba(var(--green-rgb), 0.5);
  color: var(--neon);
}
.ft__top-btn svg {
  width: 16px;
  height: 16px;
}

/* Giant outlined wordmark */
.ft__word {
  margin: 56px 0 -1.5vw;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 19vw;
  line-height: 0.9;
  letter-spacing: -0.04em;
  white-space: nowrap;
  text-align: center;
  color: rgba(255, 255, 255, 0.04);
  -webkit-text-stroke: 1.5px rgba(var(--green-rgb), 0.35);
  -webkit-mask-image: linear-gradient(180deg, #000 30%, transparent 100%);
  mask-image: linear-gradient(180deg, #000 30%, transparent 100%);
  user-select: none;
}

@media (max-width: 1024px) {
  .ft__top,
  .ft__panel {
    grid-template-columns: 1fr;
  }
  .ft__risk {
    border-left: 0;
    border-top: 1px solid var(--line-strong);
  }
}
@media (max-width: 640px) {
  .ft {
    padding-top: 72px;
  }
  .ft__cols {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 36px 20px;
  }
  .ft__corp,
  .ft__risk {
    padding: 28px 20px;
  }
  .ft__corp dl {
    grid-template-columns: 1fr;
    gap: 2px;
  }
  .ft__corp dd {
    margin-bottom: 12px;
  }
  .ft__bottom {
    flex-direction: column-reverse;
    align-items: flex-start;
  }
}
</style>
