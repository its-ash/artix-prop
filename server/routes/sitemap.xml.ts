// Single-page site today; add new public routes here as they ship.
const pages = [{ path: '/', priority: '1.0', changefreq: 'weekly' }]

export default defineEventHandler((event) => {
  const { siteUrl } = useRuntimeConfig(event).public
  const lastmod = new Date().toISOString().slice(0, 10) // = build date when prerendered
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${siteUrl}${p.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`
})
