<script setup lang="ts">
import * as THREE from 'three'

/**
 * A row of minted Artix coins that flip about their vertical axis in a staggered wave.
 *
 * - Body: a lathe-turned profile (raised rim, bevel, recessed field) with a reeded edge displaced
 *   straight into the geometry.
 * - Faces: a canvas-drawn die (Artix X mark in enamel + engraved ring text) used as colour, bump and
 *   metal/roughness maps.
 * - Look: polished gold reflecting a dark studio lit by warm softboxes, with a faint lime kicker
 *   from behind so the edges pick up the site accent.
 */
const props = withDefaults(defineProps<{ progress?: number }>(), { progress: 0 })
const host = ref<HTMLDivElement>()

// Artix Capital X mark (tools/icons/icon-maskable.svg), in SVG user units
const MARK: [string, string][] = [
  ['#f4f5f7', '1074.6,329.8 1037.7,329.8 837.3,15.7 874.3,15.7'],
  ['#3d5200', '1074.6,15.7 985.7,144.5 907.8,15.7'],
  ['#8fc400', '907.8,15.7 966.5,113.4 1011,83.7'],
  ['#6f9900', '1074.6,15.7 994.5,15.7 1011,83.7'],
  ['#b6f500', '926.2,200.9 1004.1,329.8 837.3,329.8'],
  ['#d9ff7a', '1003.8,329.3 944.1,230.5 901.3,259.7'],
  ['#9bd100', '918.6,329.8 901.3,259.7 837.3,329.8'],
  ['#5e7f00', '944.1,230.5 871.6,280.1 911.3,222.5']
]
const MARK_PTS = MARK.map(([c, s]) => [c, s.split(' ').map((p) => p.split(',').map(Number) as [number, number])] as const)

/** Draws one face die. mode: 'color' | 'bump' | 'pbr' (G = roughness, B = metalness). */
function drawFace(size: number, mode: 'color' | 'bump' | 'pbr') {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const S = size / 1024
  g.scale(S, S)

  const field = { color: '#c9ccd3', bump: '#808080', pbr: 'rgb(0, 82, 255)' }[mode]
  const raised = { color: '#e9ebef', bump: '#ffffff', pbr: 'rgb(0, 40, 255)' }[mode]
  g.fillStyle = field
  g.fillRect(0, 0, 1024, 1024)

  // fine concentric lathe lines (polished/brushed rings) on the field
  if (mode !== 'color') {
    for (let r = 30; r < 512; r += 6) {
      g.strokeStyle = mode === 'bump' ? `rgba(${r % 12 ? 120 : 136},${r % 12 ? 120 : 136},${r % 12 ? 120 : 136},0.6)` : `rgba(0,${r % 12 ? 70 : 96},255,0.7)`
      g.lineWidth = 2
      g.beginPath()
      g.arc(512, 512, r, 0, Math.PI * 2)
      g.stroke()
    }
  }

  // two engraved border rings
  g.strokeStyle = raised
  g.lineWidth = 6
  for (const r of [492, 396]) {
    g.beginPath()
    g.arc(512, 512, r, 0, Math.PI * 2)
    g.stroke()
  }

  // ring legend
  g.fillStyle = raised
  g.font = '600 46px Geist, ui-sans-serif, system-ui, sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  const legend = 'ARTIX PROP  •  FUNDED TRADER  •  ARTIX PROP  •  FUNDED TRADER  •  '
  const step = (Math.PI * 2) / legend.length
  for (let i = 0; i < legend.length; i++) {
    const a = i * step - Math.PI / 2
    g.save()
    g.translate(512 + Math.cos(a) * 444, 512 + Math.sin(a) * 444)
    g.rotate(a + Math.PI / 2)
    g.fillText(legend[i]!, 0, 0)
    g.restore()
  }

  // the X mark, centred and scaled into the inner field
  const s = 560 / 314
  g.save()
  g.translate(512, 512)
  g.scale(s, s)
  g.translate(-956, -172.75)
  if (mode === 'bump') g.filter = `blur(${1.2 / s}px)` // soft bevel on the raised enamel
  for (const [col, pts] of MARK_PTS) {
    g.fillStyle = mode === 'color' ? col : mode === 'bump' ? '#ffffff' : 'rgb(0, 110, 50)' // enamel: a bit rougher, not metal
    g.beginPath()
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)))
    g.closePath()
    g.fill()
  }
  g.restore()

  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 8
  if (mode === 'color') tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** Coin body: rim + bevel + reeded edge, turned on a lathe. Axis = Z, faces at z = ±FACE_Z. */
const FACE_R = 0.8
const FACE_Z = 0.058
function buildBody() {
  const v = (x: number, y: number) => new THREE.Vector2(x, y)
  // bottom → top (keeps lathe normals pointing outwards); repeated points = crisp creases
  const profile = [
    v(FACE_R, -FACE_Z), v(0.83, -0.098), v(0.83, -0.098), v(0.955, -0.098), v(0.955, -0.098),
    v(1, -0.07), v(1, -0.07), v(1, 0.07), v(1, 0.07), v(0.955, 0.098), v(0.955, 0.098),
    v(0.83, 0.098), v(0.83, 0.098), v(FACE_R, FACE_Z)
  ]
  const geo = new THREE.LatheGeometry(profile, 360)
  // reeded edge: radial grooves on the outer band
  const pos = geo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const r = Math.hypot(x, z)
    if (r < 0.999) continue
    const k = 1 - 0.016 * (0.5 + 0.5 * Math.cos(Math.atan2(x, z) * 100))
    pos.setX(i, x * k)
    pos.setZ(i, z * k)
  }
  geo.computeVertexNormals()
  geo.rotateX(Math.PI / 2)
  return geo
}

/** Dark studio: warm softboxes (they make the gold read rich), white strips top/front, a faint lime kicker. */
function buildEnvironment(renderer: THREE.WebGLRenderer) {
  const env = new THREE.Scene()
  env.background = new THREE.Color('#040405')
  const panel = (color: string, k: number, w: number, h: number, p: [number, number, number]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide })
    )
    m.position.set(...p)
    m.lookAt(0, 0, 0)
    env.add(m)
  }
  panel('#ffe2a8', 4.2, 6, 10, [-9, 1, 3]) // warm softbox
  panel('#fff4dc', 3, 6, 10, [9, 0, 3]) // warm-white softbox
  panel('#ffffff', 3.2, 12, 0.7, [0, 6, 7]) // white strip, top-front → crisp face highlight
  panel('#ffffff', 1.4, 0.6, 9, [3, 0, 9]) // vertical white strip → edge glint mid-flip
  panel('#8a8f99', 0.9, 20, 20, [0, -9, 0]) // dim floor bounce
  panel('#d9dce2', 1.1, 7, 4, [0, -1, 10]) // soft frontal fill so faces never go black
  panel('#ffffff', 1.4, 3, 3, [6, 5, -8]) // white kicker behind
  panel('#b6f500', 1.2, 3, 3, [-6, -4, -8]) // faint lime kicker behind (ties the coins to the site accent)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const tex = pmrem.fromScene(env, 0.03).texture
  env.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose()
      ;(o.material as THREE.Material).dispose()
    }
  })
  pmrem.dispose()
  return tex
}

onMounted(() => {
  const el = host.value!
  const small = window.innerWidth < 768
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  // the canvas spans the whole viewport, so pixel count dominates the cost: cap the ratio,
  // and drop it further at runtime if frames run slow (see loop)
  let dpr = Math.min(window.devicePixelRatio, 1.5)
  renderer.setPixelRatio(dpr)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.setClearColor(0x000000, 0)
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const envTex = buildEnvironment(renderer)
  scene.environment = envTex

  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100)
  const key = new THREE.DirectionalLight('#ffffff', 1.2)
  key.position.set(-2, 4, 6)
  scene.add(key)

  const texSize = small ? 512 : 1024
  const colorMap = drawFace(texSize, 'color')
  const bumpMap = drawFace(texSize, 'bump')
  const pbrMap = drawFace(texSize, 'pbr')

  const bodyGeo = buildBody()
  const faceGeo = new THREE.CircleGeometry(FACE_R, 96)

  // per-coin tint of the metal: three shades of gold alternating around the ring
  const tints = ['#ffd36e', '#f0b94d', '#ffe09a', '#ffd36e', '#f0b94d', '#ffe09a']
  const ring = new THREE.Group()
  scene.add(ring)
  // plain metal + clearcoat: iridescence added a costly extra shader pass for little visible gain
  const shared = { metalness: 1, clearcoat: 0.6, clearcoatRoughness: 0.12, envMapIntensity: 1.3 }
  const materials: THREE.Material[] = []
  const coins = tints.map((tint, i) => {
    const bodyMat = new THREE.MeshPhysicalMaterial({ ...shared, color: tint, roughness: 0.2 })
    const faceMat = new THREE.MeshPhysicalMaterial({
      ...shared,
      color: tint,
      roughness: 1,
      map: colorMap,
      bumpMap,
      bumpScale: 2.2,
      roughnessMap: pbrMap,
      metalnessMap: pbrMap
    })
    materials.push(bodyMat, faceMat)
    const coin = new THREE.Group()
    const front = new THREE.Mesh(faceGeo, faceMat)
    front.position.z = FACE_Z
    const back = new THREE.Mesh(faceGeo, faceMat)
    back.position.z = -FACE_Z
    back.rotation.y = Math.PI
    coin.add(new THREE.Mesh(bodyGeo, bodyMat), front, back)
    coin.userData.i = i
    ring.add(coin)
    return coin
  })

  // the coins ride a tilted ring (a carousel) around the vertical axis
  const N = coins.length
  let R = 3.4
  const TILT = 0.26
  const fit = (w: number, h: number) => {
    const aspect = w / h
    R = aspect < 1.3 ? 2.5 : 3.4
    camera.aspect = aspect
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const halfW = R + 1.25
    const halfH = R * Math.sin(TILT) + 1.6
    // keep the camera well back so the front coin isn't blown up by perspective; pad for its nearer depth
    camera.position.z = Math.max(halfW / (tan * aspect), halfH / tan, R * 2.8) + R * 0.35
    camera.updateProjectionMatrix()
  }
  const resize = () => {
    const w = el.clientWidth
    const h = el.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    fit(w, h)
    renderer.render(scene, camera)
  }

  const mouse = new THREE.Vector2()
  const target = new THREE.Vector2()
  const onMove = (e: PointerEvent) => target.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
  window.addEventListener('pointermove', onMove, { passive: true })

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const ORBIT = 0.32 // rad/s around the ring

  let p = props.progress
  const pose = (t: number) => {
    const a = reduce ? 0.3 : t * ORBIT
    const r = R * (1 + p * 0.18)
    coins.forEach((coin, i) => {
      const th = a + (i / N) * Math.PI * 2
      coin.position.set(Math.sin(th) * r, Math.sin(t * 1.1 + i * 0.9) * 0.08, Math.cos(th) * r)
      // face outward from the ring (front coin faces the camera), with a gentle extra turn of its own
      coin.rotation.set(Math.sin(t * 0.7 + i) * 0.06, th + Math.sin(t * 0.5 + i * 1.3) * 0.35, Math.sin(t * 0.6 + i) * 0.04)
    })
    ring.rotation.set(TILT - mouse.y * 0.1 + p * 0.35, mouse.x * 0.25, mouse.x * -0.04)
    ring.position.y = 0.3 + p * 0.9
    scene.environmentRotation.y = Math.sin(t * 0.18) * 0.35
  }

  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(el)

  let visible = true
  const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting))
  io.observe(el)

  // adaptive resolution: if a 90-frame window averages under ~48fps, step the pixel ratio down (min 1)
  let acc = 0
  let n = 0
  const adapt = (dt: number) => {
    acc += dt
    if (++n < 90) return
    const slow = acc / n > 1 / 48
    acc = n = 0
    if (slow && dpr > 1) {
      dpr = Math.max(1, dpr - 0.25)
      renderer.setPixelRatio(dpr)
      resize()
    }
  }

  const timer = new THREE.Timer()
  let t = 1.2 // start mid-wave so the first frame already shows coins at different angles
  let raf = 0
  const loop = () => {
    raf = requestAnimationFrame(loop)
    timer.update()
    const dt = Math.min(timer.getDelta(), 0.05)
    if (!visible) return
    if (!reduce) t += dt
    // frame-rate independent easing toward pointer + scroll targets
    const k = 1 - Math.pow(0.94, dt * 60)
    mouse.lerp(target, k)
    p += (props.progress - p) * (1 - Math.pow(0.9, dt * 60))
    pose(t)
    renderer.render(scene, camera)
    adapt(dt)
  }
  pose(t)
  loop()

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    io.disconnect()
    window.removeEventListener('pointermove', onMove)
    bodyGeo.dispose()
    faceGeo.dispose()
    materials.forEach((m) => m.dispose())
    colorMap.dispose()
    bumpMap.dispose()
    pbrMap.dispose()
    envTex.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  })
})
</script>

<template>
  <div ref="host" class="coins" aria-hidden="true" />
</template>

<style scoped>
.coins {
  position: absolute;
  inset: 0;
}
.coins :deep(canvas) {
  display: block;
}
</style>
