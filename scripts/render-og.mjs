// Renders the social share card → public/og/artix-prop.jpg (1200×630, used for og:image + twitter:image).
// 1) a running site (npm run dev) — the black hole is captured from the real WebGL hero
// 2) Chrome with --remote-debugging-port=9333 (headless is fine)
// 3) npm run render:og -- [siteUrl=http://localhost:3000/] [host label=prop.artixcapital.com]
// After re-rendering, bump ?v= on ogImage in app/pages/index.vue so platforms refetch it.
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const [site = 'http://localhost:3000/', host = 'prop.artixcapital.com'] = process.argv.slice(2)
const OUT = 'public/og/artix-prop.jpg'
const PLATE_W = 1500 // wider than the card so the black hole sits right of centre
const PLATE_LEFT = 40 // card x where the plate starts → hole centre ≈ 40 + 750
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function openTab(url) {
  const target = await (await fetch(`http://127.0.0.1:9333/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json()
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((r) => ws.addEventListener('open', r))
  let id = 0
  const pending = new Map()
  ws.addEventListener('message', (m) => {
    const msg = JSON.parse(m.data)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg)
      pending.delete(msg.id)
    }
  })
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id
      pending.set(i, r)
      ws.send(JSON.stringify({ id: i, method, params }))
    })
  const close = async () => {
    ws.close()
    await fetch(`http://127.0.0.1:9333/json/close/${target.id}`)
  }
  return { send, close }
}

// 1. Black-hole plate: the live hero with every overlay hidden and the panel full-bleed.
const a = await openTab('about:blank')
await a.send('Page.enable')
await a.send('Emulation.setDeviceMetricsOverride', { width: PLATE_W, height: 630, deviceScaleFactor: 2, mobile: false })
await a.send('Page.navigate', { url: site })
await wait(7000)
await a.send('Runtime.evaluate', {
  expression: `(() => {
    const s = document.createElement('style')
    s.textContent = \`
      html { scrollbar-width: none !important; }
      ::-webkit-scrollbar { display: none !important; }
      .nav, .scroll-progress, .hero__copy, .hero__stats, .hero__grain, .hero__outro { display: none !important; }
      .hero { min-height: 0 !important; height: 630px !important; }
      .hero__panel { inset: 0 !important; border-radius: 0 !important; box-shadow: none !important; transform: none !important; opacity: 1 !important; }
    \`
    document.head.appendChild(s)
    window.scrollTo(0, 0)
  })()`
})
await wait(2500)
const plate = (await a.send('Page.captureScreenshot', { format: 'png' })).result.data
await a.close()

// 2. Compose the card (from a temp file: large data-URL images don't load via setDocumentContent).
const tmp = mkdtempSync(join(tmpdir(), 'artix-og-'))
writeFileSync(join(tmp, 'plate.png'), Buffer.from(plate, 'base64'))
writeFileSync(
  join(tmp, 'card.html'),
  readFileSync('tools/og/card.html', 'utf8')
    .replace('__PLATE__', 'plate.png')
    .replace('__PLATE_LEFT__', String(PLATE_LEFT))
    .replace('__HOST__', host)
)
const b = await openTab('about:blank')
await b.send('Page.enable')
await b.send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false })
await b.send('Page.navigate', { url: pathToFileURL(join(tmp, 'card.html')).href })
await wait(1000)
const ready = await b.send('Runtime.evaluate', {
  expression:
    'Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode())]).then(() => [location.href, ...[...document.images].map((i) => i.naturalWidth)].join(" "), (e) => "ERR " + e)',
  awaitPromise: true,
  returnByValue: true
})
console.log('card:', ready.result?.result?.value)
await wait(500)
const card = (await b.send('Page.captureScreenshot', { format: 'jpeg', quality: 88 })).result.data
await b.close()
rmSync(tmp, { recursive: true, force: true })

mkdirSync('public/og', { recursive: true })
writeFileSync(OUT, Buffer.from(card, 'base64'))
console.log(`✔ ${OUT} (${Math.round(Buffer.byteLength(card, 'base64') / 1024)} KB)`)
