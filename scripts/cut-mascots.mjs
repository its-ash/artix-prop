// Cuts the mascot sheets in tools/mascot/ (1536×1024, transparent, a loose 4×2 layout) into
// public/images/mascot/<name>.webp, trimmed to each pose.
// The characters overflow the grid lines, so a plain grid crop picks up slivers of the neighbours.
// Instead the sheet is split into solid blobs (soft glows would bridge neighbouring poses). The biggest
// blob in each grid cell is that pose's body; every other blob (prop, confetti) joins the nearest body.
// Each pose's mask is its blobs grown by GROW px, so its own glow and soft edges come back with it.
// Where two poses physically touch, SEAMS cuts them apart along a stepped vertical line.
// Requires ImageMagick 7 (`magick`). Usage: node scripts/cut-mascots.mjs
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'

const sheets = {
  poses: ['wave', 'thumbs-up', 'point', 'celebrate', 'think', 'desk', 'payout-24h', 'oops'],
  scenes: ['funded-200k', 'trophy', 'surf', 'mobile', 'iceberg', 'academy', 'handshake', 'peek'],
  concepts: ['classic', 'suit', 'geometric', 'climb', 'chibi', 'line-logo', 'astronaut', 'crest']
}
// [y0, y1, x]: between rows y0..y1 the seam runs at x (sheet pixels). Measured by eye on the sheets.
const SEAMS = {
  poses: [{ left: 'desk', right: 'payout-24h', steps: [[512, 790, 804], [790, 1024, 778]] }],
  scenes: [{ left: 'iceberg', right: 'academy', steps: [[512, 870, 369], [870, 1024, 392]] }]
}
const COLS = 4
const CELL_W = 384
const CELL_H = 512
const SHEET_W = COLS * CELL_W
const PAD = 8 // transparent margin around the trimmed pose
const MAX_H = 480 // tallest output, in px
const GROW = 14
const out = 'public/images/mascot'

const magick = (args) => execFileSync('magick', args, { encoding: 'utf8', maxBuffer: 64 << 20 })
const rect = (x0, y0, x1, y1) => ['-draw', `rectangle ${x0},${y0} ${x1},${y1}`]
// black out one side of each seam this pose sits on
const clip = (sheet, name) =>
  (SEAMS[sheet] ?? []).flatMap(({ left, right, steps }) =>
    name === left
      ? steps.flatMap(([y0, y1, x]) => rect(x, y0, SHEET_W, y1))
      : name === right
        ? steps.flatMap(([y0, y1, x]) => rect(0, y0, x - 1, y1))
        : []
  )
// a 2px black line along every seam, so the touching poses become separate blobs
const cuts = (sheet) =>
  (SEAMS[sheet] ?? []).flatMap(({ steps }) =>
    steps.flatMap(([y0, y1, x], i) => {
      const next = steps[i + 1]
      return [...rect(x - 1, y0, x, y1), ...(next ? rect(Math.min(x, next[2]) - 1, y1 - 1, Math.max(x, next[2]), y1) : [])]
    })
  )
// alpha → binary mask of the solid pixels, with the seams cut
const solid = (src, sheet) => [src, '-alpha', 'extract', '-threshold', '55%', '-fill', 'black', ...cuts(sheet), '-alpha', 'off']

mkdirSync(out, { recursive: true })
const sizes = {}
for (const [sheet, names] of Object.entries(sheets)) {
  const src = `tools/mascot/${sheet}.png`
  // verbose lines look like: "  12: 40x38+100+200 120.5,219.0 1520 srgb(255,255,255)"
  const report = magick([
    ...solid(src, sheet),
    '-define', 'connected-components:verbose=true',
    '-define', 'connected-components:exclude-header=true',
    '-connected-components', '8',
    'null:'
  ])
  const blobs = []
  for (const line of report.split('\n')) {
    const m = line.match(/^\s*(\d+):\s+(\d+)x(\d+)\+(\d+)\+(\d+)\s+([\d.]+),([\d.]+)\s+(\d+)\s+(\S+)/)
    if (!m || !/255|white/.test(m[9])) continue // skip the background (black) components
    const [id, w, h, x, y, cx, cy, area] = m.slice(1, 9).map(Number)
    if (w > CELL_W * 1.4) console.warn(`⚠ ${sheet}: blob ${id} is ${w}px wide, probably two poses touching (add a seam)`)
    const cell = Math.floor(cy / CELL_H) * COLS + Math.min(COLS - 1, Math.floor(cx / CELL_W))
    blobs.push({ id, x, y, w, h, cx, cy, area, cell })
  }
  // the biggest blob per cell is that pose's body
  const bodies = names.map((_, cell) =>
    blobs.filter((b) => b.cell === cell).reduce((a, b) => (b.area > (a?.area ?? 0) ? b : a), undefined)
  )
  // distance from a point to a body's bounding box (0 inside)
  const gap = (b, p) => Math.hypot(Math.max(b.x - p.cx, 0, p.cx - (b.x + b.w)), Math.max(b.y - p.cy, 0, p.cy - (b.y + b.h)))
  const cells = names.map(() => [])
  for (const b of blobs) {
    let best = b.cell
    if (!bodies.includes(b)) {
      let d = bodies[b.cell] ? gap(bodies[b.cell], b) : Infinity
      bodies.forEach((body, cell) => {
        if (body && gap(body, b) < d) (d = gap(body, b)), (best = cell)
      })
    }
    cells[best].push(b.id)
  }

  names.forEach((name, i) => {
    const file = `${out}/${name}.webp`
    magick([
      src,
      '(', ...solid(src, sheet),
      '-define', `connected-components:keep-ids=${cells[i].join(',')}`,
      '-define', 'connected-components:mean-color=true', // paint kept blobs white, not with their label id
      '-connected-components', '8',
      // grow, then feather, so a cut-off glow fades out instead of ending in a hard ring
      '-morphology', 'Dilate', `Disk:${GROW}`, '-blur', `0x${GROW / 2}`,
      // -alpha off: drawing adds an opaque alpha channel, which CopyOpacity would copy instead of the grey
      '-fill', 'black', ...clip(sheet, name), '-alpha', 'off', ')',
      '(', src, '-alpha', 'extract', ')',
      '(', '-clone', '1', '-clone', '2', '-compose', 'multiply', '-composite', '-alpha', 'off', ')',
      '-delete', '1,2',
      '-compose', 'CopyOpacity', '-composite',
      '-trim', '+repage',
      '-compose', 'over', '-bordercolor', 'none', '-border', String(PAD),
      '-resize', `x${MAX_H}>`,
      '-strip', '-quality', '82', '-define', 'webp:method=6', '-define', 'webp:alpha-quality=90',
      file
    ])
    const [w, h] = magick(['identify', '-format', '%w %h', file]).split(' ').map(Number)
    sizes[name] = [w, h]
  })
}
// paste into app/data/mascot.ts when poses change
console.log(JSON.stringify(sizes))
