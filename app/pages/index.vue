<script setup lang="ts">
import { faqs } from '~/data/faq'
import { models } from '~/data/challenges'

const { siteUrl } = useRuntimeConfig().public
const url = `${siteUrl}/`

const title = 'Artix Prop — Prop Trading Firm, Get Funded up to $200K'
const description =
  'Artix Prop is the prop trading firm by Artix Capital. Pass a 1- or 2-step challenge or get instant funding up to $200K, keep up to 90% of profits, payouts in 24h.'
// Share card (1200×630). Regenerate with `npm run render:og`; bump ?v= so platforms drop their cached copy.
const ogImage = `${siteUrl}/og/artix-prop.jpg?v=1`
const ogAlt = 'Artix Prop — Get funded up to $200K. Keep up to 90% of the profits, payouts in 24 hours.'

useSeoMeta({
  title,
  description,
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
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
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': orgId,
      name: 'Artix Prop',
      legalName: 'Artix Capital Ltd',
      url,
      logo: { '@type': 'ImageObject', url: `${siteUrl}/icon-512.png`, width: 512, height: 512 },
      image: ogImage,
      email: 'support@artixcapital.com',
      telephone: '+44 7822 018441',
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
      description,
      inLanguage: 'en',
      publisher: { '@id': orgId }
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
    <HeroBlackHole />
    <SecondHero />
    <MountainSection />
    <CardWall />
    <ChallengeSection />
    <HowItWorks />
    <FeatureBento />
    <TraderStories />
    <FaqSection />
    <FinalCta />
  </main>
</template>
