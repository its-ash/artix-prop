/**
 * Offline renderer for Artix Prop's still 3D artwork (single accent: Artix Capital red).
 * Renders one asset at 2x supersampling, downsamples, and exposes a transparent WebP
 * as `window.__image`. See index.html for usage.
 */
import * as THREE from 'three'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const NEON = '#b6f500'
const q = new URLSearchParams(location.search)
const asset = q.get('asset') ?? 'mountain'
if (q.has('preview')) document.body.classList.add('preview')

const SIZES = { mountain: [2400, 1200] }
const [W, H] = SIZES[asset] ?? [900, 900]
const SS = 2

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
renderer.setPixelRatio(SS)
renderer.setSize(W, H)
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setClearColor(0x000000, 0)
renderer.domElement.style.width = '100%'
renderer.domElement.style.height = 'auto'
document.body.appendChild(renderer.domElement)

/* ----------------------------------------------------------------- helpers */

const clamp = (v, a, b) => Math.min(Math.max(v, a), b)
const smoothstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
function mulberry32(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function hash(a, b = 0) {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}
/** 2D Voronoi: nearest cell id, its feature point, and distance to the nearest edge */
function voronoi(x, y) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  let best = 1e9
  let second = 1e9
  let id = 0
  let px = 0
  let py = 0
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const cx = ix + dx
      const cy = iy + dy
      const fx = cx + hash(cx, cy)
      const fy = cy + hash(cy * 7 + 3, cx * 13 + 1)
      const d = (x - fx) ** 2 + (y - fy) ** 2
      if (d < best) {
        second = best
        best = d
        id = cx * 7919 + cy
        px = fx
        py = fy
      } else if (d < second) second = d
    }
  }
  return { id, px, py, edge: Math.sqrt(second) - Math.sqrt(best) }
}

/** Dark studio whose only colour is the brand neon, plus white softboxes. */
function studioEnv({ neon = 5, white = 3, sky = 0.5 } = {}) {
  const env = new THREE.Scene()
  env.background = new THREE.Color('#030304')
  const panel = (color, k, w, h, pos) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide })
    )
    m.position.set(...pos)
    m.lookAt(0, 0, 0)
    env.add(m)
  }
  panel(NEON, neon, 4, 12, [-10, 1, 1])
  panel(NEON, neon * 0.9, 3.5, 11, [10, 0, 2])
  panel(NEON, neon * 0.5, 12, 2, [0, -3, 10])
  panel(NEON, neon * 0.7, 4, 4, [5, 6, -8])
  panel('#ffffff', white, 14, 5, [0, 10, 5])
  panel('#ffffff', white * 1.4, 0.8, 9, [-4, 4, 9])
  panel('#ffffff', white * 0.8, 0.6, 8, [5, 3, 9])
  panel('#8e8e98', sky, 20, 20, [0, 14, -4])
  const pmrem = new THREE.PMREMGenerator(renderer)
  const tex = pmrem.fromScene(env, 0.02).texture
  pmrem.dispose()
  return tex
}

const M = {
  chromeGold: () =>
    new THREE.MeshPhysicalMaterial({ color: '#c8ff3a', metalness: 1, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.04 }),
  chrome: () => new THREE.MeshPhysicalMaterial({ color: '#dcdce2', metalness: 1, roughness: 0.1 }),
  dark: () =>
    new THREE.MeshPhysicalMaterial({ color: '#141418', metalness: 0.75, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.06 }),
  glass: () =>
    new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      metalness: 0,
      roughness: 0.03,
      transmission: 1,
      thickness: 0.9,
      ior: 1.45,
      attenuationColor: new THREE.Color('#eaffb8'),
      attenuationDistance: 2.5,
      clearcoat: 1,
      envMapIntensity: 1.6
    }),
  neon: (k = 2.4) => new THREE.MeshStandardMaterial({ color: NEON, emissive: NEON, emissiveIntensity: k, roughness: 0.35 }),
  white: () => new THREE.MeshPhysicalMaterial({ color: '#f6f3ee', roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.05 }),
  goldGloss: () =>
    new THREE.MeshPhysicalMaterial({ color: '#7fae00', roughness: 0.16, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.04 })
}

function baseLights(scene) {
  const key = new THREE.DirectionalLight('#ffffff', 2.4)
  key.position.set(-4, 7, 6)
  const rim = new THREE.DirectionalLight(NEON, 5)
  rim.position.set(2, 4, -7)
  const fill = new THREE.DirectionalLight(NEON, 1.2)
  fill.position.set(7, 0, 3)
  scene.add(key, rim, fill)
}

/* ---------------------------------------------------------------- mountain */

function mountain(scene) {
  // darker studio than the icons: chrome reads as black glass with neon + thin white edges
  scene.environment = studioEnv({ neon: 7, white: 0.45, sky: 0.08 })
  const perlin = new ImprovedNoise()
  const n = (x, y, z) => perlin.noise(x, y, z)
  const fbm = (x, y, z, oct, seed) => {
    let v = 0
    let a = 0.5
    let f = 1
    for (let i = 0; i < oct; i++) {
      v += a * n(x * f + seed, y * f, z * f - seed)
      f *= 2.03
      a *= 0.5
    }
    return v
  }
  const ridged = (x, y, z, oct) => {
    let v = 0
    let a = 0.6
    let f = 1
    let w = 1
    for (let i = 0; i < oct; i++) {
      let r = 1 - Math.abs(n(x * f + 19.1 + i * 5.7, y * f, z * f))
      r *= r * w
      w = clamp(r * 1.8, 0, 1)
      v += r * a
      a *= 0.5
      f *= 2.1
    }
    return v
  }
  // smooth (low-frequency) rock radius for a unit direction
  const warp = (x, y, z) => [x + 0.22 * n(x * 1.4, y * 1.4, z * 1.4 + 3), y + 0.22 * n(x * 1.4 + 7, y * 1.4, z * 1.4), z + 0.22 * n(x * 1.4, y * 1.4 + 11, z * 1.4)]
  const radiusSmooth = (x, y, z) => {
    const [a, b, c] = warp(x, y, z)
    return 1 + 0.38 * ridged(a * 1.05, b * 1.05, c * 1.05, 2) + Math.max(0, y) * 0.6 * ridged(a * 0.9 + 5, b * 0.9, c * 0.9, 3)
  }
  // 3D voronoi on the sphere for crystal facets
  const vor3 = (x, y, z) => {
    const ix = Math.floor(x)
    const iy = Math.floor(y)
    const iz = Math.floor(z)
    let best = 1e9
    let second = 1e9
    let id = 0
    let f = [0, 0, 0]
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (let dz = -1; dz <= 1; dz++) {
          const cx = ix + dx
          const cy = iy + dy
          const cz = iz + dz
          const cid = cx * 92837111 + cy * 689287499 + cz * 283923481
          const p = [cx + hash(cid, 1), cy + hash(cid, 2), cz + hash(cid, 3)]
          const d = (x - p[0]) ** 2 + (y - p[1]) ** 2 + (z - p[2]) ** 2
          if (d < best) {
            second = best
            best = d
            id = cid
            f = p
          } else if (d < second) second = d
        }
    return { id, f, edge: Math.sqrt(second) - Math.sqrt(best) }
  }

  let geo = new THREE.IcosahedronGeometry(1, 220)
  geo.deleteAttribute('normal')
  geo.deleteAttribute('uv')
  geo = mergeVertices(geo)
  const pos = geo.attributes.position
  const gloss = new Float32Array(pos.count)
  const rnd = mulberry32(7)
  const S = [3.1, 2.0, 1.7] // wide massif
  const d = new THREE.Vector3()
  const CELL = 4.6
  const planeCache = new Map()
  const fd = new THREE.Vector3()
  const crystalRadius = (dir, rs) => {
    const v = vor3(dir.x * CELL, dir.y * CELL, dir.z * CELL)
    let pl = planeCache.get(v.id)
    if (!pl) {
      fd.set(...v.f).normalize()
      const n = new THREE.Vector3(
        fd.x + (hash(v.id, 4) - 0.5) * 0.45,
        fd.y + (hash(v.id, 5) - 0.5) * 0.45,
        fd.z + (hash(v.id, 6) - 0.5) * 0.45
      ).normalize()
      pl = { n, k: radiusSmooth(fd.x, fd.y, fd.z) * 1.02 }
      planeCache.set(v.id, pl)
    }
    return Math.min(pl.k / Math.max(dir.dot(pl.n), 0.75), rs * 1.1) - (1 - smoothstep(0, 0.04, v.edge)) * 0.015
  }

  for (let i = 0; i < pos.count; i++) {
    d.fromBufferAttribute(pos, i).normalize()
    const [a, b, c] = warp(d.x, d.y, d.z)
    const rs = radiusSmooth(d.x, d.y, d.z)
    let r = rs + 0.16 * ridged(a * 2.6 + 9, b * 2.6, c * 2.6, 4) + 0.06 * fbm(a * 5, b * 5, c * 5, 3, 31)

    // crystal regions: replace the rock with flat chrome facets (true planes per voronoi cell)
    const mask = fbm(a * 1.5, b * 1.5, c * 1.5, 3, 77) + 0.3 * fbm(a * 4, b * 4, c * 4, 2, 91)
    const g = smoothstep(0.12, 0.14, mask) * smoothstep(-0.55, -0.4, d.y)
    if (g > 0) {
      // one tilted plane per voronoi cell → flat chrome facets
      const rf = crystalRadius(d, rs)
      r = r + (rf - r) * g
    }
    // fine grain on the matte stone
    r += ((rnd() - 0.5) * 0.004 + n(d.x * 30, d.y * 30, d.z * 30) * 0.008) * (1 - g)

    // taper towards the summit so the blob reads as a mountain, flatten the hidden underside
    const taper = 1 - 0.55 * smoothstep(-0.3, 1, d.y)
    const y = d.y < 0 ? d.y * 0.6 : d.y
    pos.setXYZ(i, d.x * r * S[0] * taper, y * r * S[1], d.z * r * S[2] * taper)
    gloss[i] = g
  }
  geo.setAttribute('gloss', new THREE.BufferAttribute(gloss, 1))
  geo.computeVertexNormals()

  const mat = new THREE.MeshPhysicalMaterial({
    color: '#303035',
    roughness: 0.72,
    metalness: 0.08,
    envMapIntensity: 0.12,
    clearcoat: 0,
    side: THREE.DoubleSide
  })
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float gloss;\nvarying float vGloss;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGloss = gloss;')
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vGloss;')
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.3, 0.29, 0.31), vGloss);')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.035, vGloss);')
      .replace('#include <lights_fragment_maps>', '#include <lights_fragment_maps>\nradiance *= mix(1.0, 7.0, vGloss);')
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 1.0, vGloss);')
  }
  const rock = new THREE.Mesh(geo, mat)
  rock.rotation.y = 0.35
  scene.add(rock)

  // grazing top-left key sculpts the matte stone; neon only from behind / the side
  const key = new THREE.DirectionalLight('#ffffff', 4.2)
  key.position.set(-7, 10, 3)
  const rim = new THREE.DirectionalLight(NEON, 2.2)
  rim.position.set(1, 0.4, -9)
  const fill = new THREE.DirectionalLight('#ffffff', 0.6)
  fill.position.set(8, 2, 6)
  scene.add(key, rim, fill)

  // frame cuts through the lower body so the massif rises out of the page edge
  const cam = new THREE.PerspectiveCamera(20, W / H, 0.1, 100)
  cam.position.set(0, 0.6, 15)
  cam.lookAt(0, 1.75, 0)
  return cam
}

/* ------------------------------------------------------------------- icons */

function iconCamera() {
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  cam.position.set(0, 0, 7.2)
  cam.lookAt(0, 0, 0)
  return cam
}

function aMarkGeometry(depth = 0.05) {
  const s = new THREE.Shape()
  const pts = [
    [-0.46, -0.46],
    [-0.24, -0.46],
    [0, 0.12],
    [0.24, -0.46],
    [0.46, -0.46],
    [0.11, 0.5],
    [-0.11, 0.5]
  ]
  s.moveTo(...pts[0])
  pts.slice(1).forEach((p) => s.lineTo(...p))
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 4 })
  g.center()
  return g
}

function coins(scene) {
  scene.environment = studioEnv()
  baseLights(scene)
  const profile = [
    [0, -0.1],
    [0.94, -0.1],
    [1, -0.06],
    [1, 0.06],
    [0.94, 0.1],
    [0.84, 0.1],
    [0.8, 0.065],
    [0, 0.065]
  ].map(([x, y]) => new THREE.Vector2(x, y))
  const coinGeo = new THREE.LatheGeometry(profile, 160)
  const markGeo = aMarkGeometry(0.03)
  const group = new THREE.Group()
  const make = (pos, rot, mat) => {
    const c = new THREE.Group()
    c.add(new THREE.Mesh(coinGeo, mat))
    const mark = new THREE.Mesh(markGeo, M.neon(1.6))
    mark.rotation.x = -Math.PI / 2
    mark.scale.setScalar(0.95)
    mark.position.y = 0.08
    c.add(mark)
    c.position.set(...pos)
    c.rotation.set(...rot)
    group.add(c)
  }
  make([-0.15, -0.95, 0], [0.35, 0, 0.12], M.dark())
  make([0.25, -0.15, 0.2], [0.75, 0.2, -0.28], M.chromeGold())
  make([-0.2, 0.85, -0.1], [1.15, -0.3, 0.32], M.chromeGold())
  group.rotation.y = -0.3
  scene.add(group)
  return iconCamera()
}

function capsule(scene) {
  scene.environment = studioEnv()
  baseLights(scene)
  const g = new THREE.Group()
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 2.1, 128, 1, true), M.glass()))
  // glowing layered core
  for (let i = 0; i < 7; i++) {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.15, 96), i % 2 ? M.neon(1.4) : M.neon(2.6))
    d.position.y = -0.84 + i * 0.28
    d.scale.setScalar(i % 2 ? 0.92 : 1)
    g.add(d)
  }
  // bolt floating in the core
  const s = new THREE.Shape()
  ;[
    [0.16, 0.95],
    [-0.46, -0.05],
    [-0.06, -0.05],
    [-0.22, -0.95],
    [0.46, 0.14],
    [0.06, 0.14]
  ].forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)))
  s.closePath()
  const bolt = new THREE.Mesh(
    new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 4 }).center(),
    M.white()
  )
  bolt.position.z = 0.72
  bolt.scale.setScalar(0.8)
  g.add(bolt)
  // chrome caps with radial fins
  const capProfile = [
    [0, 0],
    [0.86, 0],
    [0.9, 0.05],
    [0.9, 0.2],
    [0.82, 0.26],
    [0.5, 0.28],
    [0.42, 0.34],
    [0, 0.34]
  ].map(([x, y]) => new THREE.Vector2(x, y))
  const capGeo = new THREE.LatheGeometry(capProfile, 128)
  const finGeo = new THREE.BoxGeometry(0.03, 0.1, 0.34)
  for (const dir of [1, -1]) {
    const cap = new THREE.Group()
    cap.add(new THREE.Mesh(capGeo, M.chrome()))
    for (let i = 0; i < 40; i++) {
      const f = new THREE.Mesh(finGeo, M.chrome())
      const a = (i / 40) * Math.PI * 2
      f.position.set(Math.cos(a) * 0.62, 0.32, Math.sin(a) * 0.62)
      f.rotation.y = -a
      cap.add(f)
    }
    cap.position.y = dir * 1.05
    if (dir < 0) cap.rotation.x = Math.PI
    g.add(cap)
  }
  g.rotation.set(0.32, 0.4, -0.38)
  scene.add(g)
  return iconCamera()
}

function ring(scene) {
  scene.environment = studioEnv()
  baseLights(scene)
  const g = new THREE.Group()
  g.add(new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.42, 96, 220), M.goldGloss()))
  const arc = 0.36
  for (let i = 0; i < 4; i++) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.43, 96, 48, arc), M.white())
    band.rotation.z = (i * Math.PI) / 2 - arc / 2 + 0.4
    g.add(band)
  }
  // rope around the outer edge, dipping between the bands
  const pts = []
  for (let i = 0; i <= 400; i++) {
    const a = (i / 400) * Math.PI * 2
    const r = 1.46 + Math.cos(a * 4 - 1.6) * 0.04
    pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, Math.sin(a * 4 - 1.6) * 0.12))
  }
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 600, 0.035, 12, true), M.chrome()))
  g.rotation.set(0.85, -0.45, 0.25)
  scene.add(g)
  return iconCamera()
}

function cubes(scene) {
  scene.environment = studioEnv()
  baseLights(scene)
  const g = new THREE.Group()
  const box = (s, mat, pos, rot) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(s, s, s, 8, s * 0.1), mat)
    m.position.set(...pos)
    m.rotation.set(...rot)
    g.add(m)
  }
  box(0.9, M.dark(), [-1.05, -0.8, 0.2], [0.5, 0.6, 0])
  box(0.95, M.neon(1.3), [0.15, -0.05, -0.6], [0.5, 0.75, 0])
  box(1.35, M.glass(), [0.05, 0.05, 0.4], [0.5, 0.75, 0])
  box(0.8, M.chromeGold(), [1.1, 0.95, -0.2], [0.5, 0.9, 0])
  g.rotation.set(0.05, -0.2, 0)
  g.scale.setScalar(0.82)
  g.position.x = 0.1
  scene.add(g)
  return iconCamera()
}

function planet(scene) {
  scene.environment = studioEnv()
  baseLights(scene)
  const g = new THREE.Group()
  g.add(new THREE.Mesh(new THREE.SphereGeometry(1, 160, 160), M.dark()))
  const rings = new THREE.Group()
  ;[
    [1.42, 0.022, M.white()],
    [1.6, 0.07, M.neon(2.4)],
    [1.82, 0.03, M.chromeGold()],
    [2.0, 0.015, M.neon(1.5)]
  ].forEach(([r, t, mat]) => rings.add(new THREE.Mesh(new THREE.TorusGeometry(r, t, 32, 260), mat)))
  rings.rotation.set(1.25, 0.15, 0)
  g.add(rings)
  const moon = new THREE.Mesh(new THREE.SphereGeometry(0.22, 64, 64), M.chromeGold())
  moon.position.set(1.55, 1.05, 0.4)
  g.add(moon)
  g.rotation.z = -0.35
  g.scale.setScalar(0.78)
  scene.add(g)
  return iconCamera()
}

function shield(scene) {
  scene.environment = studioEnv()
  baseLights(scene)
  const s = new THREE.Shape()
  s.moveTo(0, 1.05)
  s.quadraticCurveTo(0.5, 0.95, 0.92, 0.75)
  s.lineTo(0.92, 0.05)
  s.quadraticCurveTo(0.86, -0.72, 0, -1.12)
  s.quadraticCurveTo(-0.86, -0.72, -0.92, 0.05)
  s.lineTo(-0.92, 0.75)
  s.quadraticCurveTo(-0.5, 0.95, 0, 1.05)
  const opts = { depth: 0.28, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.12, bevelSegments: 10, curveSegments: 64 }
  const g = new THREE.Group()
  g.add(new THREE.Mesh(new THREE.ExtrudeGeometry(s, opts).center(), M.chromeGold()))
  const inner = new THREE.Mesh(
    new THREE.ExtrudeGeometry(s, { ...opts, depth: 0.1, bevelThickness: 0.05, bevelSize: 0.05 }).center(),
    M.dark()
  )
  inner.scale.setScalar(0.74)
  inner.position.z = 0.24
  g.add(inner)
  const check = new THREE.CatmullRomCurve3(
    [new THREE.Vector3(-0.36, 0.02, 0), new THREE.Vector3(-0.08, -0.28, 0), new THREE.Vector3(0.4, 0.3, 0)],
    false,
    'catmullrom',
    0
  )
  const tick = new THREE.Mesh(new THREE.TubeGeometry(check, 64, 0.085, 24), M.neon(2.6))
  tick.position.z = 0.42
  g.add(tick)
  g.rotation.set(0.12, -0.45, 0.08)
  scene.add(g)
  return iconCamera()
}

/* -------------------------------------------------------------------- run */

const builders = { mountain, coins, capsule, ring, cubes, planet, shield }
const scene = new THREE.Scene()
const camera = (builders[asset] ?? mountain)(scene)
renderer.render(scene, camera)

const out = document.createElement('canvas')
out.width = W
out.height = H
const ctx = out.getContext('2d')
ctx.imageSmoothingQuality = 'high'
ctx.drawImage(renderer.domElement, 0, 0, W, H)
window.__image = out.toDataURL('image/webp', 0.9)

// review copy on the site's light background
const pv = document.createElement('canvas')
pv.width = W
pv.height = H
const pctx = pv.getContext('2d')
pctx.fillStyle = '#fbf6ea'
pctx.fillRect(0, 0, W, H)
pctx.drawImage(out, 0, 0)
window.__preview = pv.toDataURL('image/jpeg', 0.85)
window.__done = true
