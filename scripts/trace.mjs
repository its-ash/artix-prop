// Dev helper: trace paint / raster / GPU work while scrolling a page range (CDP on :9333).
// Usage: node scripts/trace.mjs <url> <from-to,...>
// Prints, per range, total time spent painting, rasterising, decoding images and on the GPU,
// plus the largest paint areas — the usual suspects when scrolling feels heavy on real screens.
const [url = 'http://localhost:3000/', ranges = '3000-4700'] = process.argv.slice(2)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const target = await (await fetch(`http://127.0.0.1:9333/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json()
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r))
let id = 0
const pending = new Map()
let events = []
let traceDone = null
ws.addEventListener('message', (m) => {
  const msg = JSON.parse(m.data)
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg)
    pending.delete(msg.id)
  } else if (msg.method === 'Tracing.dataCollected') events.push(...msg.params.value)
  else if (msg.method === 'Tracing.tracingComplete') traceDone?.()
})
const send = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id
    pending.set(i, r)
    ws.send(JSON.stringify({ id: i, method, params }))
  })

await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false })
await send('Page.reload')
await wait(6000)

const scroll = (from, to) => `new Promise((resolve) => {
  window.scrollTo(0, ${from});
  setTimeout(() => {
    const start = performance.now(); const dur = 4000;
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      window.scrollTo(0, ${from} + (${to} - ${from}) * t);
      t < 1 ? requestAnimationFrame(step) : resolve(true);
    };
    requestAnimationFrame(step);
  }, 1200);
})`

const KEYS = {
  Paint: 'paint',
  PaintImage: 'paint',
  RasterTask: 'raster',
  'GPUTask': 'gpu',
  'Decode Image': 'decode',
  'ImageDecodeTask': 'decode',
  UpdateLayerTree: 'layers',
  Layout: 'layout'
}

for (const r of ranges.split(',')) {
  const [from, to] = r.split('-').map(Number)
  events = []
  await send('Tracing.start', {
    categories: 'devtools.timeline,disabled-by-default-devtools.timeline,cc,gpu,disabled-by-default-devtools.timeline.frame',
    transferMode: 'ReportEvents'
  })
  await send('Runtime.evaluate', { expression: scroll(from, to), awaitPromise: true })
  const done = new Promise((res) => (traceDone = res))
  await send('Tracing.end')
  await done

  const totals = {}
  const paints = []
  for (const e of events) {
    const k = KEYS[e.name]
    if (!k || e.ph !== 'X' || !e.dur) continue
    totals[k] = (totals[k] ?? 0) + e.dur / 1000
    if (e.name === 'Paint' && e.args?.data?.clip) {
      const c = e.args.data.clip
      const w = Math.abs(c[2] - c[0])
      const h = Math.abs(c[5] - c[1])
      paints.push(w * h)
    }
  }
  if (process.env.WHO) {
    // which DOM nodes get repainted most
    const byNode = new Map()
    for (const e of events) {
      if (e.name !== 'Paint' || !e.args?.data?.nodeId) continue
      byNode.set(e.args.data.nodeId, (byNode.get(e.args.data.nodeId) ?? 0) + 1)
    }
    await send('DOM.getDocument', { depth: 0 })
    for (const [nodeId, n] of [...byNode].sort((a, b) => b[1] - a[1]).slice(0, 6)) {
      const d = await send('DOM.describeNode', { backendNodeId: nodeId })
      const node = d.result?.node
      const attrs = node?.attributes ?? []
      const cls = attrs[attrs.indexOf('class') + 1] ?? ''
      console.log(`     ${n}x  <${node?.localName ?? '?'} class="${attrs.includes('class') ? cls : ''}">`)
    }
  }
  const fmt = (k) => `${k} ${(totals[k] ?? 0).toFixed(0)}ms`
  const bigPaints = paints.filter((a) => a > 1440 * 900 * 0.25).length
  console.log(
    `${String(from).padStart(5)}–${String(to).padEnd(5)}  ` +
      ['paint', 'raster', 'gpu', 'decode', 'layers', 'layout'].map(fmt).join('  ') +
      `  | paints ${paints.length} (${bigPaints} larger than ¼ screen)`
  )
}
ws.close()
await fetch(`http://127.0.0.1:9333/json/close/${target.id}`)
