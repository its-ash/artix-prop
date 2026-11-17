// https://nuxt.com/docs/api/configuration/nuxt-config

// Public origin of the site, no trailing slash. Used for canonical URLs, og:image, sitemap and JSON-LD.
// Set NUXT_PUBLIC_SITE_URL at BUILD time (the homepage is prerendered, so the value is baked into the HTML).
// Default matches public/CNAME (the deploy domain).
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://prop.itsash.in').replace(/\/+$/, '')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: { siteUrl }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#050506' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap'
        }
      ]
    }
  },
  build: {
    transpile: ['three']
  },
  // Static HTML for the homepage + SEO files: fastest TTFB and fully crawlable without JS.
  routeRules: {
    '/': { prerender: true }
  },
  nitro: {
    prerender: { routes: ['/', '/sitemap.xml', '/robots.txt'] },
    // `nuxt generate` writes the static site to docs/, which GitHub Pages serves from the main branch.
    output: { publicDir: 'docs' }
  },
  // Dev-only tooling pages (anything under app/pages/dev/) never ship to production.
  $production: {
    hooks: {
      'pages:extend'(pages) {
        for (let i = pages.length - 1; i >= 0; i--) {
          if (pages[i]?.path.startsWith('/dev')) pages.splice(i, 1)
        }
      }
    }
  }
})
