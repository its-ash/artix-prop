import * as THREE from 'three'

/** Crypto coin designs shared by the hero arch (CoinsCanvas) and the footer wordmark (FooterWordmark). */
export type Coin = { id: string; body: string; field: string; ink: string; metal: number; draw: (g: CanvasRenderingContext2D, ink: string) => void }

const poly = (g: CanvasRenderingContext2D, pts: number[][]) => {
  g.beginPath()
  pts.forEach(([x, y], i) => (i ? g.lineTo(x!, y!) : g.moveTo(x!, y!)))
  g.closePath()
  g.fill()
}
const glyph = (txt: string, size = 560, rot = 0) => (g: CanvasRenderingContext2D, ink: string) => {
  g.save()
  g.translate(512, 530)
  g.rotate(rot)
  g.fillStyle = ink
  g.font = `800 ${size}px Geist, "SF Pro Display", "Helvetica Neue", Arial, sans-serif`
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(txt, 0, 0)
  g.restore()
}
const ring = (n: number, r: number, dot: number, rx = dot, ry = dot) => (g: CanvasRenderingContext2D, ink: string) => {
  g.fillStyle = ink
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    g.save()
    g.translate(512 + Math.cos(a) * r, 512 + Math.sin(a) * r)
    g.rotate(a + Math.PI / 2)
    g.beginPath()
    g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
    g.fill()
    g.restore()
  }
}

export const COINS: Coin[] = [
  { id: 'BTC', body: '#f5b800', field: '#f2ad00', ink: '#fff8e6', metal: 1, draw: glyph('₿', 600, -0.2) },
  {
    id: 'ETH', body: '#3f6fe0', field: '#4a7af0', ink: '#cfe0ff', metal: 0.9,
    draw: (g) => {
      g.fillStyle = '#e8f0ff'; poly(g, [[512, 170], [700, 520], [512, 620]])
      g.fillStyle = '#b9cdf7'; poly(g, [[512, 170], [324, 520], [512, 620]])
      g.fillStyle = '#dbe6ff'; poly(g, [[512, 860], [700, 560], [512, 665]])
      g.fillStyle = '#a9c0f2'; poly(g, [[512, 860], [324, 560], [512, 665]])
    }
  },
  {
    id: 'USDT', body: '#26a17b', field: '#2bb389', ink: '#f2fffa', metal: 0.85,
    draw: (g, ink) => {
      g.fillStyle = ink
      g.fillRect(290, 260, 444, 120)
      g.fillRect(450, 260, 124, 520)
      g.strokeStyle = ink
      g.lineWidth = 44
      g.beginPath()
      g.ellipse(512, 470, 250, 70, 0, 0, Math.PI * 2)
      g.stroke()
    }
  },
  { id: 'DOGE', body: '#e3b62c', field: '#ecc13a', ink: '#fffaf0', metal: 1, draw: glyph('Ð', 600, -0.1) },
  {
    id: 'SOL', body: '#16161c', field: '#1c1c24', ink: '#14f195', metal: 0.7,
    draw: (g) => {
      const grad = g.createLinearGradient(260, 760, 760, 260)
      grad.addColorStop(0, '#9945ff')
      grad.addColorStop(1, '#14f195')
      g.fillStyle = grad
      for (const [y, flip] of [[300, 1], [470, -1], [640, 1]] as const) {
        const s = 60 * flip
        poly(g, [[290 + s, y], [760 + s, y], [760 - s, y + 110], [290 - s, y + 110]])
      }
    }
  },
  {
    id: 'POL', body: '#8247e5', field: '#8d55f0', ink: '#f6f0ff', metal: 0.85,
    draw: (g, ink) => {
      g.strokeStyle = ink
      g.lineWidth = 64
      g.lineJoin = 'round'
      const hex = (cx: number, cy: number) => {
        g.beginPath()
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + Math.PI / 6
          const x = cx + Math.cos(a) * 150
          const y = cy + Math.sin(a) * 150
          i ? g.lineTo(x, y) : g.moveTo(x, y)
        }
        g.closePath()
        g.stroke()
      }
      hex(400, 580)
      hex(624, 444)
    }
  },
  {
    id: 'DOT', body: '#e6007a', field: '#f0148a', ink: '#fff0f8', metal: 0.85,
    draw: (g, ink) => {
      ring(6, 250, 0, 58, 90)(g, ink)
      g.fillStyle = ink
      g.beginPath()
      g.arc(512, 512, 70, 0, Math.PI * 2)
      g.fill()
    }
  },
  {
    id: 'XRP', body: '#d9dbe0', field: '#e6e8ec', ink: '#23292f', metal: 1,
    draw: (g, ink) => {
      g.strokeStyle = ink
      g.lineWidth = 80
      g.lineCap = 'round'
      g.beginPath()
      g.moveTo(300, 290); g.quadraticCurveTo(512, 520, 724, 290)
      g.moveTo(300, 734); g.quadraticCurveTo(512, 504, 724, 734)
      g.stroke()
    }
  },
  {
    id: 'ADA', body: '#1b4fd8', field: '#2459e8', ink: '#eaf1ff', metal: 0.85,
    draw: (g, ink) => {
      ring(6, 110, 40)(g, ink)
      ring(12, 240, 34)(g, ink)
      ring(6, 360, 22)(g, ink)
    }
  },
  {
    id: 'BNB', body: '#f0b90b', field: '#f5c21c', ink: '#fffbe8', metal: 1,
    draw: (g, ink) => {
      g.fillStyle = ink
      const sq = (cx: number, cy: number, s: number) => poly(g, [[cx, cy - s], [cx + s, cy], [cx, cy + s], [cx - s, cy]])
      sq(512, 512, 90)
      sq(512, 280, 70)
      sq(512, 744, 70)
      sq(280, 512, 70)
      sq(744, 512, 70)
    }
  },
  {
    id: 'AVAX', body: '#e84142', field: '#f04a4b', ink: '#fff2f2', metal: 0.85,
    draw: (g, ink) => {
      g.fillStyle = ink
      poly(g, [[512, 230], [780, 760], [560, 760], [512, 650], [464, 760], [244, 760]])
    }
  },
  { id: 'LTC', body: '#bfc5cf', field: '#cdd2da', ink: '#345d9d', metal: 1, draw: glyph('Ł', 600, 0) },
  {
    id: 'LINK', body: '#2a5ada', field: '#3366ee', ink: '#eef3ff', metal: 0.85,
    draw: (g, ink) => {
      g.strokeStyle = ink
      g.lineWidth = 80
      g.lineJoin = 'round'
      g.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2
        const x = 512 + Math.cos(a) * 260
        const y = 512 + Math.sin(a) * 260
        i ? g.lineTo(x, y) : g.moveTo(x, y)
      }
      g.closePath()
      g.stroke()
    }
  },
  {
    id: 'TRX', body: '#c8102e', field: '#d81b3a', ink: '#fff0f2', metal: 0.85,
    draw: (g, ink) => {
      g.strokeStyle = ink
      g.lineWidth = 56
      g.lineJoin = 'round'
      g.beginPath()
      g.moveTo(260, 290); g.lineTo(780, 400); g.lineTo(500, 780); g.closePath()
      g.moveTo(260, 290); g.lineTo(500, 780)
      g.stroke()
    }
  },
  { id: 'USDC', body: '#2775ca', field: '#2f80d8', ink: '#f0f7ff', metal: 0.85, draw: glyph('$', 560, 0) },
  {
    id: 'TON', body: '#0098ea', field: '#12a6f5', ink: '#f0faff', metal: 0.85,
    draw: (g, ink) => {
      g.strokeStyle = ink
      g.lineWidth = 60
      g.lineJoin = 'round'
      g.beginPath()
      g.moveTo(290, 330); g.lineTo(734, 330); g.lineTo(512, 760); g.closePath()
      g.moveTo(512, 330); g.lineTo(512, 760)
      g.stroke()
    }
  }
]

/** One face die. mode: 'color' | 'bump' | 'pbr' (G = roughness, B = metalness). */
export function drawCoinFace(coin: Coin, size: number, mode: 'color' | 'bump' | 'pbr') {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  g.scale(size / 1024, size / 1024)

  g.fillStyle = mode === 'color' ? coin.field : mode === 'bump' ? '#707070' : `rgb(0, 70, ${Math.round(255 * coin.metal * 0.6)})`
  g.fillRect(0, 0, 1024, 1024)

  // inner bevel ring
  g.strokeStyle = mode === 'color' ? 'rgba(255,255,255,0.18)' : mode === 'bump' ? '#9a9a9a' : 'rgb(0, 40, 255)'
  g.lineWidth = 14
  g.beginPath()
  g.arc(512, 512, 470, 0, Math.PI * 2)
  g.stroke()

  // raised symbol
  if (mode === 'bump') g.filter = 'blur(3px)'
  const ink = mode === 'color' ? coin.ink : mode === 'bump' ? '#ffffff' : 'rgb(0, 120, 30)'
  if (mode === 'color') {
    coin.draw(g, ink)
  } else {
    // flatten multi-colour symbols (ETH, SOL) to a single height/roughness mask
    const m = document.createElement('canvas')
    m.width = m.height = 1024
    const mg = m.getContext('2d')!
    coin.draw(mg, '#000')
    mg.globalCompositeOperation = 'source-in'
    mg.fillStyle = ink
    mg.fillRect(0, 0, 1024, 1024)
    g.drawImage(m, 0, 0)
  }

  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 8
  if (mode === 'color') tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

