// Exports the still 3D artwork rendered by tools/render into public/images/*.webp.
// 1) npx vite tools/render --port 5199
// 2) Chrome with --remote-debugging-port=9333 (headless is fine)
// 3) node scripts/render-assets.mjs [asset ...]      (default: all)
// Review copies (on the site background) are written to /tmp/artix-render/*.jpg
import { writeFileSync, mkdirSync } from 'node:fs'

// The homepage mountain now comes from the live scene (npm run export:mountain); 'mountain' here is the
// older alternative rock render and is only exported when asked for explicitly.
const all = ['coins', 'capsule', 'ring', 'cubes', 'planet', 'shield']
const assets = process.argv.slice(2).length ? process.argv.slice(2) : all
mkdirSync('public/images', { recursive: true })
mkdirSync('/tmp/artix-render', { recursive: true })

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

for (const asset of assets) {
  const url = `http://localhost:5199/?asset=${asset}`
  const target = await (await fetch(`http://127.0.0.1:9333/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json()
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((r) => ws.addEventListener('open', r))
  let id = 0
  const pending = new Map()
  const errors = []
  ws.addEventListener('message', (m) => {
    const msg = JSON.parse(m.data)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg)
      pending.delete(msg.id)
    } else if (msg.method === 'Runtime.exceptionThrown') {
      errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text)
    }
  })
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id
      pending.set(i, r)
      ws.send(JSON.stringify({ id: i, method, params }))
    })
  await send('Runtime.enable')
  await send('Page.reload')

  let done = false
  for (let t = 0; t < 240 && !done; t++) {
    await wait(500)
    const r = await send('Runtime.evaluate', { expression: '!!window.__done', returnByValue: true })
    done = r.result?.result?.value === true
  }
  if (!done) {
    console.error(`✖ ${asset}: timed out`, errors.join('\n'))
  } else {
    for (const [key, file, re] of [
      ['__image', `public/images/${asset}.webp`, /^data:image\/webp;base64,/],
      ['__preview', `/tmp/artix-render/${asset}.jpg`, /^data:image\/jpeg;base64,/]
    ]) {
      const r = await send('Runtime.evaluate', { expression: `window.${key}`, returnByValue: true })
      writeFileSync(file, Buffer.from(r.result.result.value.replace(re, ''), 'base64'))
    }
    console.log(`✔ ${asset}`, errors.length ? errors.join('\n') : '')
  }
  ws.close()
  await fetch(`http://127.0.0.1:9333/json/close/${target.id}`)
}
