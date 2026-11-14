<script setup lang="ts">
// href '#' = page not built yet; rendered as plain text so crawlers don't see dozens of empty links.
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
    title: 'Platforms',
    links: [
      { label: 'nTrader Desktop', href: '#payouts' },
      { label: 'nTrader Mobile', href: '#payouts' },
      { label: 'MetaTrader 5', href: '#payouts' },
      { label: 'Economic calendar', href: '#' }
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'About Artix Capital', href: 'https://artixcapital.com/' },
      { label: 'Affiliates', href: '#' },
      { label: 'Contact us', href: 'mailto:support@artixcapital.com' },
      { label: 'Terms & conditions', href: '#' },
      { label: 'Privacy policy', href: '#' }
    ]
  }
]
const year = new Date().getFullYear()
</script>

<template>
  <footer class="ft">
    <div class="container">
      <div class="ft__top">
        <div class="ft__brand">
          <AppLogo />
          <p>The prop trading program of Artix Capital. Trade our capital, keep up to 90% of the profits.</p>
          <a href="https://artixcapital.com/" target="_blank" rel="noopener" class="chip">artixcapital.com ↗</a>
        </div>
        <nav v-for="c in cols" :key="c.title" class="ft__col" :aria-label="c.title">
          <h4>{{ c.title }}</h4>
          <template v-for="l in c.links" :key="l.label">
            <span v-if="l.href === '#'">{{ l.label }}</span>
            <a v-else :href="l.href" :target="l.href.startsWith('http') ? '_blank' : undefined" :rel="l.href.startsWith('http') ? 'noopener' : undefined">{{ l.label }}</a>
          </template>
        </nav>
        <div class="ft__col">
          <h4>Contact</h4>
          <a href="mailto:support@artixcapital.com">support@artixcapital.com</a>
          <a href="tel:+447822018441">+44 7822 018441</a>
          <span>Support 24/5</span>
        </div>
      </div>

      <div class="ft__word" aria-hidden="true">ARTIX PROP</div>

      <div class="ft__legal">
        <p>
          <strong>Risk disclosure.</strong> All Artix Prop evaluation and funded accounts are simulated accounts.
          Trading results on simulated accounts do not represent actual trading and past performance is not indicative
          of future results. Artix Prop does not accept deposits and does not provide investment advice, brokerage or
          custody services. Fees paid are for access to the evaluation program and are not deposits.
        </p>
        <p>
          Artix Capital Ltd is an International Business Company registered in Saint Lucia under number 2023-00122. It
          is not licensed or regulated as a financial services provider in Saint Lucia. Services are not available to
          citizens or residents of the United States, Cuba, Iraq, Myanmar, North Korea, Sudan, the United Arab Emirates
          and India.
        </p>
        <div class="ft__bottom">
          <span>© {{ year }} Artix Capital Ltd. All rights reserved.</span>
          <span>Made for traders who take it seriously.</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.ft {
  padding: 100px 0 40px;
  overflow: hidden;
}
.ft__top {
  display: grid;
  grid-template-columns: 1.6fr repeat(4, 1fr);
  gap: 40px;
}
.ft__brand {
  display: grid;
  gap: 18px;
  align-content: start;
}
.ft__brand p {
  color: var(--muted);
  max-width: 34ch;
}
.ft__brand .chip {
  justify-self: start;
}
.ft__col {
  display: grid;
  gap: 12px;
  align-content: start;
  font-size: 14px;
  color: var(--ink-2);
}
.ft__col h4 {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 6px;
}
.ft__col a:hover {
  color: var(--neon);
}
.ft__word {
  margin: 80px 0 40px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13.5vw;
  line-height: 0.8;
  letter-spacing: -0.06em;
  white-space: nowrap;
  text-align: center;
  background: linear-gradient(180deg, rgba(11, 11, 18, 0.9), rgba(255, 184, 0, 0.12));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.ft__legal {
  display: grid;
  gap: 14px;
  padding-top: 28px;
  border-top: 1px solid var(--line-strong);
  font-size: 12px;
  color: var(--muted);
  line-height: 1.6;
}
.ft__legal strong {
  color: var(--ink-2);
}
.ft__bottom {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
@media (max-width: 960px) {
  .ft__top {
    grid-template-columns: 1fr 1fr;
  }
  .ft__brand {
    grid-column: 1 / -1;
  }
}
</style>
