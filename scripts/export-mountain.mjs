// Exports the live three.js mountain (app/components/MountainScene.vue) to app/assets/images/mountain.webp
// (the homepage imports it from there, so each export gets a fresh hashed URL).
//
//   1) npm run dev                        (serves /dev/mountain)
//   2) node scripts/export-mountain.mjs [hexColor] [devUrl]
//      e.g. node scripts/export-mountain.mjs ffb800
//
// Launches a headless Chrome itself (macOS path; set CHROME=/path/to/chrome to override).
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const color = (process.argv[2] ?? 'ffb800').replace('#', '')
const base = process.argv[3] ?? process.env.DEV_URL ?? 'http://localhost:3000'
const url = `${base.replace(/\/$/, '')}/dev/mountain?color=${color}`
const chromePath = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const port = 9341
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), 'artix-export-'))}`,
    '--enable-gpu',
    '--ignore-gpu-blocklist',
    '--window-size=1600,1000',
    'about:blank'
  ],
  { stdio: 'ignore' }
)

try {
  let version
  for (let i = 0; i < 40 && !version; i++) {
    await wait(250)
    version = await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.json()).catch(() => undefined)
  }
  if (!version) throw new Error('Chrome did not start (set CHROME=/path/to/chrome)')

  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json()
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
  const evaluate = (expression) =>
    new Promise((r) => {
      const i = ++id
      pending.set(i, (msg) => r(msg.result?.result?.value))
      ws.send(JSON.stringify({ id: i, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }))
    })

  let ready = false
  for (let i = 0; i < 120 && !ready; i++) {
    await wait(500)
    ready = (await evaluate('!!window.__mountainReady')) === true
  }
  if (!ready) throw new Error(`Exporter page did not get ready — is the dev server running at ${base}?`)

  const dataUrl = await evaluate('window.__mountainImage')
  if (!dataUrl?.startsWith('data:image/webp')) throw new Error('No image was produced')
  mkdirSync('app/assets/images', { recursive: true })
  writeFileSync('app/assets/images/mountain.webp', Buffer.from(dataUrl.split(',')[1], 'base64'))
  console.log(`✔ app/assets/images/mountain.webp written (colour #${color})`)
  ws.close()
} catch (err) {
  console.error('✖', err.message)
  process.exitCode = 1
} finally {
  chrome.kill()
}
