<script setup lang="ts">
import * as THREE from 'three'
import { COINS, drawCoinFace, type Coin } from '~/utils/cryptoCoins'

/** Brand coin for the X flags: lime enamel with the Artix X. */
const ARTIX_COIN: Coin = {
  id: 'ARTIX',
  body: '#b6f500',
  field: '#c8ff3a',
  ink: '#0b1200',
  metal: 0.6,
  draw: (g, ink) => {
    g.fillStyle = ink
    g.font = '800 640px Geist, "Helvetica Neue", Arial, sans-serif'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText('X', 512, 545)
  }
}

/**
 * Footer wordmark: "ARTIX" built from ~400 minted coins (one InstancedMesh per part).
 * - The letter outlines are rasterised to an offscreen canvas and sampled on a hex grid → coin slots.
 * - On first view the coins fly in from a scattered cloud and land left → right.
 * - Once assembled, a flip wave sweeps across the word every few seconds.
 * - The cursor lifts and tilts the coins under it.
 */
const host = ref<HTMLDivElement>()
const ready = ref(false)

const SPAN = 7.6 // world width of the word
const CELL = 0.15 // grid spacing between coin centres
const COIN_R = 0.068
const COIN_T = 0.022

/** Letter outlines in word units (x: 0..7.2, y: 0..1.8). Holes are drawn with even-odd fill. */
function letterShapes() {
  const s = (pts: number[][], dx: number) => pts.map(([x, y]) => [x! + dx, y!])
  return [
    // A
    { fill: s([[0, 0], [0.32, 0], [0.45, 0.42], [1.0, 0.42], [1.13, 0], [1.45, 0], [0.89, 1.8], [0.56, 1.8]], 0), hole: s([[0.53, 0.72], [0.92, 0.72], [0.725, 1.42]], 0), accent: false },
    // R (outer + bowl hole, curves approximated)
    {
      fill: s([[0, 0], [0.32, 0], [0.32, 0.74], [0.72, 0.74], [1.04, 0], [1.4, 0], [1.03, 0.8], [1.22, 0.9], [1.32, 1.08], [1.34, 1.3], [1.28, 1.56], [1.1, 1.74], [0.82, 1.8], [0, 1.8]], 1.76),
      hole: s([[0.32, 1.03], [0.78, 1.03], [0.95, 1.1], [1.02, 1.27], [0.95, 1.44], [0.78, 1.51], [0.32, 1.51]], 1.76),
      accent: false
    },
    // T
    { fill: s([[0.52, 0], [0.84, 0], [0.84, 1.5], [1.36, 1.5], [1.36, 1.8], [0, 1.8], [0, 1.5], [0.52, 1.5]], 3.42), accent: false },
    // I
    { fill: s([[0, 0], [0.34, 0], [0.34, 1.8], [0, 1.8]], 5.04), accent: false },
    // X: slash + two accent flags
    { fill: s([[0, 1.8], [0.34, 1.8], [1.48, 0], [1.14, 0]], 5.7), accent: false },
    { fill: s([[0.54, 1.8], [1.48, 1.8], [1.01, 1.06]], 5.7), accent: true },
    { fill: s([[0, 0], [0.94, 0], [0.47, 0.74]], 5.7), accent: true }
  ]
}

/** Rasterise the outlines and sample a hex grid. Returns slots in world units centred on (0,0). */
function sampleSlots() {
  const W = 7.18
  const H = 1.8
  const PX = 120
  const c = document.createElement('canvas')
  c.width = Math.ceil(W * PX)
  c.height = Math.ceil(H * PX)
  const g = c.getContext('2d', { willReadFrequently: true })!
  const path = (pts: number[][]) => {
    pts.forEach(([x, y], i) => (i ? g.lineTo(x! * PX, (H - y!) * PX) : g.moveTo(x! * PX, (H - y!) * PX)))
    g.closePath()
  }
  // red = letter body, green = accent flags
  for (const l of letterShapes()) {
    g.fillStyle = l.accent ? '#00ff00' : '#ff0000'
    g.beginPath()
    path(l.fill)
    if (l.hole) path(l.hole)
    g.fill('evenodd')
  }
  const data = g.getImageData(0, 0, c.width, c.height).data
  const slots: { x: number; y: number; accent: boolean }[] = []
  const rowH = CELL * 0.866
  for (let row = 0, y = CELL * 0.4; y < H; row++, y += rowH) {
    for (let x = (row % 2 ? CELL / 2 : 0) + CELL * 0.4; x < W; x += CELL) {
      const px = Math.floor(x * PX)
      const py = Math.floor((H - y) * PX)
      const o = (py * c.width + px) * 4
      if (data[o]! > 128 || data[o + 1]! > 128) {
        slots.push({ x: x - W / 2, y: y - H / 2, accent: data[o + 1]! > 128 })
      }
    }
  }
  return slots
}

onMounted(() => {
  const el = host.value
  if (!el) return

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let raf = 0
  let visible = false
  let disposed = false

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100)

  // studio environment: white softboxes + a lime kicker so the metal reads
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envScene = new THREE.Scene()
  envScene.background = new THREE.Color(0x050608)
  const box = (color: number, w: number, h: number, p: [number, number, number]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }))
    m.position.set(...p)
    m.lookAt(0, 0, 0)
    envScene.add(m)
  }
  box(0xffffff, 14, 4, [0, 6, 5])
  box(0xfff2d6, 6, 8, [-8, 1, 4])
  box(0xb6f500, 8, 4, [7, -3, 3])
  box(0x8a8f99, 20, 20, [0, -9, 0])
  box(0xe8e6e0, 10, 5, [0, 0, 10]) // frontal fill so coin faces read bright
  const envRT = pmrem.fromScene(envScene, 0.04)
  scene.environment = envRT.texture
  envScene.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose()
      ;(o.material as THREE.Material).dispose()
    }
  })

  const key = new THREE.DirectionalLight(0xffffff, 1.6)
  key.position.set(-4, 5, 7)
  const cursorLight = new THREE.PointLight(0xffe7a3, 6, 4, 1.6)
  cursorLight.position.set(0, 0, 1.6)
  scene.add(key, cursorLight)

  // coin geometry: a short cylinder with its faces toward the camera (+Z), plus a thin raised rim
  const bodyGeo = new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 28)
  bodyGeo.rotateX(Math.PI / 2)
  const rimGeo = new THREE.TorusGeometry(COIN_R * 0.82, COIN_R * 0.09, 6, 28)

  const slots = sampleSlots()
  const N = slots.length

  const coinMat = new THREE.MeshPhysicalMaterial({ metalness: 0.85, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.12, envMapIntensity: 1.6 })
  const rimMat = new THREE.MeshPhysicalMaterial({ metalness: 1, roughness: 0.18, envMapIntensity: 1.4 })
  const bodies = new THREE.InstancedMesh(bodyGeo, coinMat, N)
  const rims = new THREE.InstancedMesh(rimGeo, rimMat, N)
  bodies.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  rims.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

  // designs: BTC weighted up, the rest of the crypto set mixed in; X flags use the lime Artix coin
  const designs = [...COINS, ARTIX_COIN]
  const ACCENT = designs.length - 1
  const rand = (i: number) => {
    const s = Math.sin(i * 127.1 + 311.7) * 43758.5453
    return s - Math.floor(s)
  }
  const type = new Uint8Array(N)
  const local = new Uint16Array(N) // index inside that design's face mesh
  const counts = new Array(designs.length).fill(0)
  slots.forEach((s, i) => {
    const r = rand(i + 77)
    type[i] = s.accent ? ACCENT : r < 0.28 ? 0 : Math.floor(rand(i + 5) * COINS.length)
    local[i] = counts[type[i]!]++
  })

  // one instanced face layer per design, each with its own symbol texture
  const faceGeo = new THREE.CircleGeometry(COIN_R * 0.9, 28)
  const faceTex: THREE.Texture[] = []
  const faceMats: THREE.Material[] = []
  const faces = designs.map((d, k) => {
    const tex = drawCoinFace(d, 128, 'color')
    const mat = new THREE.MeshPhysicalMaterial({ map: tex, metalness: d.metal * 0.6, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.1, envMapIntensity: 1.3 })
    faceTex.push(tex)
    faceMats.push(mat)
    const m = new THREE.InstancedMesh(faceGeo, mat, Math.max(1, counts[k]))
    m.count = counts[k]
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    return m
  })

  const col = new THREE.Color()

  // per-coin animation data
  const from = new Float32Array(N * 3)
  const delay = new Float32Array(N)
  const spin = new Float32Array(N)
  slots.forEach((s, i) => {
    const r1 = rand(i)
    const r2 = rand(i + 999)
    const r3 = rand(i + 4242)
    // scattered cloud in front of and around the word
    from[i * 3] = (r1 - 0.5) * 16
    from[i * 3 + 1] = (r2 - 0.5) * 7 + 2
    from[i * 3 + 2] = 2 + r3 * 5
    delay[i] = ((s.x + SPAN / 2) / SPAN) * 0.9 + r2 * 0.25 // lands left → right
    spin[i] = (r3 - 0.5) * 14
    col.set(designs[type[i]!]!.body)
    bodies.setColorAt(i, col)
    rims.setColorAt(i, col.clone().multiplyScalar(1.15))
  })
  if (bodies.instanceColor) bodies.instanceColor.needsUpdate = true
  if (rims.instanceColor) rims.instanceColor.needsUpdate = true

  const word = new THREE.Group()
  word.add(bodies, rims, ...faces)
  scene.add(word)

  const mouse = new THREE.Vector2(0, 0)
  const smooth = new THREE.Vector2(0, 0)
  const cursor = new THREE.Vector2(99, 99) // world-space cursor on the word plane
  let hovering = false
  let halfW = 4
  let halfH = 1

  const resize = () => {
    const w = el.clientWidth || 1200
    const h = el.clientHeight || 320
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    camera.position.set(0, 0, Math.max((SPAN / 2 + 0.35) / (tan * camera.aspect), 1.35 / tan))
    camera.updateProjectionMatrix()
    halfH = camera.position.z * tan
    halfW = halfH * camera.aspect
  }
  resize()

  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect()
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1
    mouse.y = -(((e.clientY - r.top) / r.height) * 2 - 1)
    hovering = true
  }
  const onLeave = () => (hovering = false)
  el.addEventListener('pointermove', onMove, { passive: true })
  el.addEventListener('pointerleave', onLeave, { passive: true })
  const ro = new ResizeObserver(resize)
  ro.observe(el)

  const m4 = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const e3 = new THREE.Euler()
  const pos = new THREE.Vector3()
  const faceOff = new THREE.Vector3()
  const one = new THREE.Vector3(1, 1, 1)
  const ease = (x: number) => 1 - Math.pow(1 - x, 3)

  let elapsed = 0
  let assembleT = reduce ? 99 : -1 // < 0 until first seen
  const ASSEMBLE = 1.6
  const WAVE_EVERY = 5.5
  const WAVE_LEN = 1.1

  const pose = () => {
    for (let i = 0; i < N; i++) {
      const s = slots[i]!
      const k = assembleT < 0 ? 0 : ease(Math.min(1, Math.max(0, (assembleT - delay[i]!) / ASSEMBLE)))
      const fx = from[i * 3]!
      const fy = from[i * 3 + 1]!
      const fz = from[i * 3 + 2]!
      // arc in: lerp plus a small hop
      const x = fx + (s.x - fx) * k
      const y = fy + (s.y - fy) * k + Math.sin(k * Math.PI) * 0.6
      let z = fz + (0 - fz) * k
      let rx = (1 - k) * spin[i]!
      let ry = (1 - k) * spin[i]! * 0.7

      if (k >= 1 && !reduce) {
        // flip wave sweeping left → right
        const ph = ((elapsed % WAVE_EVERY) - (s.x + SPAN / 2) * 0.12) / WAVE_LEN
        if (ph > 0 && ph < 1) {
          const f = ph * ph * (3 - 2 * ph)
          ry += f * Math.PI * 2
          z += Math.sin(ph * Math.PI) * 0.18
        }
        // cursor lift
        const dx = s.x - cursor.x
        const dy = s.y - cursor.y
        const d = Math.hypot(dx, dy)
        if (d < 0.75) {
          const f = (1 - d / 0.75) ** 2
          z += f * 0.45
          rx += -dy * f * 2.2
          ry += dx * f * 2.2
        }
        z += Math.sin(elapsed * 1.4 + s.x * 1.3 + s.y * 2) * 0.012
      }
      // hide coins still parked off-screen before the first view
      const scale = assembleT < 0 ? 0 : 1
      pos.set(x, y, z)
      q.setFromEuler(e3.set(rx, ry, 0))
      m4.compose(pos, q, one.setScalar(scale))
      bodies.setMatrixAt(i, m4)
      // rim + symbol face sit on the front face, in the coin's own frame
      pos.add(faceOff.set(0, 0, COIN_T / 2 + 0.002).applyQuaternion(q))
      m4.compose(pos, q, one)
      rims.setMatrixAt(i, m4)
      faces[type[i]!]!.setMatrixAt(local[i]!, m4)
    }
    bodies.instanceMatrix.needsUpdate = true
    rims.instanceMatrix.needsUpdate = true
    faces.forEach((f) => (f.instanceMatrix.needsUpdate = true))
  }

  const timer = new THREE.Timer()
  const renderFrame = () => {
    if (disposed) return
    timer.update()
    const dt = Math.min(timer.getDelta(), 0.05)
    if (!reduce) elapsed += dt
    if (assembleT >= 0 && !reduce) assembleT += dt

    if (!hovering && !reduce) {
      mouse.x = Math.sin(elapsed * 0.4) * 0.5
      mouse.y = Math.cos(elapsed * 0.3) * 0.2
    }
    smooth.lerp(mouse, 0.07)
    if (hovering) cursor.set(mouse.x * halfW, mouse.y * halfH)
    else cursor.set(99, 99)
    cursorLight.position.set(smooth.x * halfW, smooth.y * halfH, 1.4)

    word.rotation.y = smooth.x * 0.14
    word.rotation.x = -smooth.y * 0.1
    pose()
    renderer.render(scene, camera)

    raf = visible && !reduce && !document.hidden ? requestAnimationFrame(renderFrame) : 0
  }

  const start = () => {
    if (!raf && visible && !reduce && !document.hidden) {
      timer.update()
      raf = requestAnimationFrame(renderFrame)
    }
  }

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? false
      if (visible) {
        if (assembleT < 0) assembleT = 0 // fly in on first view
        if (reduce) renderFrame()
        else start()
      } else if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    },
    { rootMargin: '0px 0px -10% 0px' }
  )
  io.observe(el)

  const onVis = () => {
    if (document.hidden && raf) {
      cancelAnimationFrame(raf)
      raf = 0
    } else if (!document.hidden && visible) start()
  }
  document.addEventListener('visibilitychange', onVis)

  pose()
  renderer.render(scene, camera)
  ready.value = true

  onBeforeUnmount(() => {
    disposed = true
    if (raf) cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
    document.removeEventListener('visibilitychange', onVis)
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerleave', onLeave)
    bodies.dispose()
    rims.dispose()
    faces.forEach((f) => f.dispose())
    faceGeo.dispose()
    faceTex.forEach((t) => t.dispose())
    faceMats.forEach((m) => m.dispose())
    bodyGeo.dispose()
    rimGeo.dispose()
    coinMat.dispose()
    rimMat.dispose()
    envRT.dispose()
    pmrem.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  })
})
</script>

<template>
  <div class="wm" aria-hidden="true">
    <div ref="host" class="wm__stage" />
    <span class="wm__fallback" :class="{ hidden: ready }">ARTIX</span>
  </div>
</template>

<style scoped>
.wm {
  position: relative;
  width: 100%;
  height: clamp(150px, 24vw, 360px);
  overflow: hidden;
  user-select: none;
}
.wm::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(52% 68% at 50% 55%, rgba(var(--green-rgb), 0.12), transparent 70%);
}
.wm__stage {
  position: absolute;
  inset: 0;
}
.wm__stage :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
.wm__fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(88px, 20vw, 280px);
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.05);
  -webkit-text-stroke: 1.5px rgba(var(--green-rgb), 0.35);
  pointer-events: none;
  transition: opacity 0.4s ease;
}
.wm__fallback.hidden {
  opacity: 0;
}
</style>
