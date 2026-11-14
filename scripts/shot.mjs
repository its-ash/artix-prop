// Dev helper: screenshot the running site at several scroll positions through headless Chrome (CDP).
// Usage: node scripts/shot.mjs <url> <outDir> <scrollY,...>   (Chrome must run with --remote-debugging-port=9333)
// Viewport: VIEWPORT=390x844 node scripts/shot.mjs ...   (default 1440x900; widths < 768 emulate a phone)
import { writeFileSync, mkdirSync } from 'node:fs'

const [url = 'http://localhost:3123/', out = '/tmp/artix-shots', ys = '0'] = process.argv.slice(2)
mkdirSync(out, { recursive: true })

const target = await (await fetch(`http://127.0.0.1:9333/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json()
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r))

let id = 0
const pending = new Map()
const logs = []
ws.addEventListener('message', (m) => {
  const msg = JSON.parse(m.data)
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg)
    pending.delete(msg.id)
  } else if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
    logs.push(`[${msg.params.type}] ` + msg.params.args.map((a) => a.value ?? a.description).join(' '))
  } else if (msg.method === 'Runtime.exceptionThrown') {
    logs.push('[exception] ' + (msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text))
  }
})
const send = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id
    pending.set(i, r)
    ws.send(JSON.stringify({ id: i, method, params }))
  })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

await send('Runtime.enable')
await send('Page.enable')
const [vw, vh] = (process.env.VIEWPORT ?? '1440x900').split('x').map(Number)
await send('Emulation.setDeviceMetricsOverride', { width: vw, height: vh, deviceScaleFactor: 1, mobile: vw < 768 })
await send('Page.reload')
await wait(6000)

for (const y of ys.split(',').map(Number)) {
  await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${y}); window.dispatchEvent(new Event('scroll'))` })
  await wait(2500)
  const { result } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70 })
  writeFileSync(`${out}/shot-${y}.jpg`, Buffer.from(result.data, 'base64'))
}
const { result: h } = await send('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight' })
console.log('scrollHeight', h.result.value)
console.log(logs.join('\n') || 'no console errors')
ws.close()
await fetch(`http://127.0.0.1:9333/json/close/${target.id}`)
