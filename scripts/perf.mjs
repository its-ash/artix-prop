// Dev helper: measure scroll smoothness per page region in headless Chrome (CDP on :9333).
// Usage: node scripts/perf.mjs <url> <from-to,from-to,...>   e.g. node scripts/perf.mjs http://localhost:3000/ 0-2500,3000-6500
// For each range it scrolls at a steady speed with requestAnimationFrame and reports
// average fps, 95th-percentile frame time and the number of dropped (>34ms) frames.
const [url = 'http://localhost:3000/', ranges = '0-3000'] = process.argv.slice(2)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

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

await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false })
await send('Page.reload')
await wait(6000)

const measure = (from, to) => `new Promise((resolve) => {
  window.scrollTo(0, ${from});
  setTimeout(() => {
    const frames = []; let last = performance.now(); const start = last; const dur = 4000;
    const step = (now) => {
      frames.push(now - last); last = now;
      const t = Math.min((now - start) / dur, 1);
      window.scrollTo(0, ${from} + (${to} - ${from}) * t);
      if (t < 1) requestAnimationFrame(step);
      else {
        frames.shift();
        const sorted = [...frames].sort((a, b) => a - b);
        const avg = frames.reduce((a, b) => a + b, 0) / frames.length;
        resolve({ fps: +(1000 / avg).toFixed(1), p95: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1), dropped: frames.filter((f) => f > 34).length, frames: frames.length });
      }
    };
    requestAnimationFrame(step);
  }, 1500);
})`

await send('Performance.enable')
const metrics = async () => {
  const r = await send('Performance.getMetrics')
  return Object.fromEntries(r.result.metrics.map((m) => [m.name, m.value]))
}
const ms = (a, b, k) => ((b[k] - a[k]) * 1000).toFixed(0)

for (const r of ranges.split(',')) {
  const [from, to] = r.split('-').map(Number)
  const before = await metrics()
  const res = await send('Runtime.evaluate', { expression: measure(from, to), awaitPromise: true, returnByValue: true })
  const after = await metrics()
  const v = res.result?.result?.value
  console.log(
    `${String(from).padStart(5)}–${String(to).padEnd(5)}  fps ${v?.fps}  p95 ${v?.p95}ms  dropped ${v?.dropped}/${v?.frames}` +
      `  | main thread: layout ${ms(before, after, 'LayoutDuration')}ms (${after.LayoutCount - before.LayoutCount}x)` +
      `  style ${ms(before, after, 'RecalcStyleDuration')}ms  script ${ms(before, after, 'ScriptDuration')}ms  total ${ms(before, after, 'TaskDuration')}ms`
  )
}
ws.close()
await fetch(`http://127.0.0.1:9333/json/close/${target.id}`)
