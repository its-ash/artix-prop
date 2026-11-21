<script setup lang="ts">
import { faqs } from '~/data/faq'
import { models } from '~/data/challenges'

const { siteUrl } = useRuntimeConfig().public
const url = `${siteUrl}/`

const title = 'Artix Prop — Prop Trading Firm, Get Funded up to $200K'
const description =
  'Artix Prop is the prop trading firm by Artix Capital. Pass a 1- or 2-step challenge or get instant funding up to $200K, keep up to 90% of profits, payouts in 24h.'
const keywords =
  'Artix Prop, prop trading firm, funded trader program, 200K funded account, instant funding prop firm, 1-step trading challenge, 2-step trading challenge, 90% profit split, 24h prop payouts, nTrader, MetaTrader 5, Artix Capital'
// Share card (1200×630). Bump ?v= so social platforms drop their cached copy.
const ogImage = `${siteUrl}/og/artix-prop.jpg?v=5`
const ogAlt = 'Artix Prop — Get funded up to $200K. Keep up to 90% of profits, 24h payouts, no time limit.'

useSeoMeta({
  title,
  description,
  keywords,
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  themeColor: '#050506',
  ogType: 'website',
  ogSiteName: 'Artix Prop',
  ogLocale: 'en_US',
  ogUrl: url,
  ogTitle: title,
  ogDescription: description,
  ogImage,
  ogImageSecureUrl: ogImage,
  ogImageType: 'image/jpeg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: ogAlt,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: ogImage,
  twitterImageAlt: ogAlt
})

const orgId = `${siteUrl}/#organization`
const prices = (m: (typeof models)[number]) => Object.values(m.prices)
const sitelinks = [
  { name: 'Funded Challenges', description: 'Compare 2-Step, 1-Step and Instant Funding accounts from $5K to $200K.', url: `${url}#challenges` },
  { name: 'How It Works', description: 'Four simple steps from sign-up to funded trading and 24-hour payouts.', url: `${url}#how` },
  { name: 'Payouts & Scaling', description: 'Keep up to 90% of profits with 24h payouts and scaling up to $2M.', url: `${url}#payouts` },
  { name: 'Trading Rules & FAQ', description: 'Answers on drawdown limits, news trading, EAs, KYC and profit splits.', url: `${url}#faq` },
  { name: 'Artix Capital', description: 'Multi-asset brokerage and parent group of Artix Prop.', url: 'https://artixcapital.com/' },
  { name: 'Artix Global', description: 'Global trading markets on nTrader starting from $50.', url: 'https://artixglobal.com/' }
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': orgId,
      name: 'Artix Prop',
      alternateName: ['Artix Prop Trading', 'Artix Funded'],
      legalName: 'Artix Capital Ltd',
      url,
      logo: { '@type': 'ImageObject', url: `${siteUrl}/icon-512.png`, width: 512, height: 512 },
      image: ogImage,
      email: 'support@artixcapital.com',
      telephone: '+44 7822 018441',
      sameAs: ['https://artixcapital.com/', 'https://artixglobal.com/'],
      parentOrganization: { '@type': 'Organization', name: 'Artix Capital', url: 'https://artixcapital.com/' },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@artixcapital.com',
        telephone: '+44 7822 018441',
        availableLanguage: ['English']
      }
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url,
      name: 'Artix Prop',
      alternateName: 'Artix Prop Trading',
      description,
      inLanguage: 'en',
      publisher: { '@id': orgId }
    },
    {
      '@type': 'ItemList',
      '@id': `${url}#sitelinks`,
      name: 'Artix Prop Main Sections',
      itemListElement: sitelinks.map((s, i) => ({
        '@type': 'SiteNavigationElement',
        position: i + 1,
        name: s.name,
        description: s.description,
        url: s.url
      }))
    },
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      inLanguage: 'en',
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': orgId },
      primaryImageOfPage: { '@type': 'ImageObject', url: ogImage, width: 1200, height: 630 }
    },
    {
      '@type': 'HowTo',
      '@id': `${url}#howto`,
      name: 'How to get funded with Artix Prop',
      description: 'From choosing a challenge to receiving up to 90% profit payouts in four steps.',
      step: [
        { '@type': 'HowToStep', position: 1, name: 'Choose your challenge', text: 'Pick a 2-Step, 1-Step or Instant Funding model and an account size from $5K to $200K.' },
        { '@type': 'HowToStep', position: 2, name: 'Hit the target, respect the rules', text: 'Trade forex, metals, indices, stocks and crypto with no time limit while staying inside your drawdown.' },
        { '@type': 'HowToStep', position: 3, name: 'Get your funded account', text: 'Pass KYC and receive your Artix Prop funded account on nTrader or MetaTrader 5 within hours.' },
        { '@type': 'HowToStep', position: 4, name: 'Withdraw up to 90%', text: 'Request a payout every 14 days, processed in 24 hours to bank, card or crypto, and scale up to $2M.' }
      ]
    },
    {
      '@type': 'OfferCatalog',
      '@id': `${url}#challenges`,
      name: 'Artix Prop funded trader challenges',
      itemListElement: models.map((m) => ({
        '@type': 'Offer',
        name: m.name,
        description: m.tagline,
        url: `${url}#challenges`,
        seller: { '@id': orgId },
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'USD',
          minPrice: Math.min(...prices(m)),
          maxPrice: Math.max(...prices(m))
        }
      }))
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a }
      }))
    }
  ]
}

useHead({
  link: [{ rel: 'canonical', href: url }],
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(jsonLd) }]
})
</script>

<template>
  <main>
    <HeroCoins />
    <SecondHero />
    <CardWall />
    <ChallengeSection />
    <HowItWorks />
    <FeatureBento />
    <TraderStories />
    <FaqSection />
    <FinalCta />
  </main>
</template>
