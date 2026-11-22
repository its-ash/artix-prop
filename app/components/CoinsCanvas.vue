<script setup lang="ts">
import * as THREE from 'three'
import { COINS, drawCoinFace as drawFace, type Coin } from '~/utils/cryptoCoins'

/**
 * Arch of minted crypto coins that glides left → right in an endless loop.
 * Coins ride a large circle whose centre sits below the canvas, so only the top arc shows.
 * Each coin is yawed three-quarter to the camera (reeded edge visible) and rolled to follow the arc.
 * As a coin crosses the crest it spins one full 360° turn, then glides on to the right.
 * Faces are canvas-drawn dies: coloured enamel field + raised symbol (colour, bump and roughness maps).
 */
const props = withDefaults(defineProps<{ progress?: number }>(), { progress: 0 })
const host = ref<HTMLDivElement>()

/** Coin body: rim + bevel + reeded edge, turned on a lathe. Axis = Z, faces at z = ±FACE_Z. */
const FACE_R = 0.82
const FACE_Z = 0.07
function buildBody() {
  const v = (x: number, y: number) => new THREE.Vector2(x, y)
  const profile = [
    v(FACE_R, -FACE_Z), v(0.86, -0.12), v(0.86, -0.12), v(0.96, -0.12), v(0.96, -0.12),
    v(1, -0.09), v(1, -0.09), v(1, 0.09), v(1, 0.09), v(0.96, 0.12), v(0.96, 0.12),
    v(0.86, 0.12), v(0.86, 0.12), v(FACE_R, FACE_Z)
  ]
  const geo = new THREE.LatheGeometry(profile, 220)
  const pos = geo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const r = Math.hypot(x, z)
    if (r < 0.999) continue
    const k = 1 - 0.018 * (0.5 + 0.5 * Math.cos(Math.atan2(x, z) * 110))
    pos.setX(i, x * k)
    pos.setZ(i, z * k)
  }
  geo.computeVertexNormals()
  geo.rotateX(Math.PI / 2)
  return geo
}

/** Dark studio with white softboxes, so every coin colour reads true and glossy. */
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
  panel('#ffffff', 3.4, 6, 10, [-9, 2, 4])
  panel('#fff6e6', 2.6, 6, 10, [9, 0, 4])
  panel('#ffffff', 3.4, 14, 0.8, [0, 7, 7])
  panel('#ffffff', 1.6, 0.6, 9, [3, 0, 9])
  panel('#8a8f99', 0.8, 20, 20, [0, -9, 0])
  panel('#dfe2e8', 1.3, 8, 4, [0, -1, 10])
  panel('#f5b800', 1.4, 4, 4, [-6, -4, -8])
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
  let dpr = Math.min(window.devicePixelRatio, 1.5)
  renderer.setPixelRatio(dpr)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95
  renderer.setClearColor(0x000000, 0)
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const envTex = buildEnvironment(renderer)
  scene.environment = envTex

  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 200)
  const key = new THREE.DirectionalLight('#ffffff', 1.3)
  key.position.set(-3, 5, 7)
  scene.add(key)

  const texSize = small ? 256 : 512
  const bodyGeo = buildBody()
  const faceGeo = new THREE.CircleGeometry(FACE_R, 80)
  const disposables: { dispose: () => void }[] = [bodyGeo, faceGeo]

  const arch = new THREE.Group()
  scene.add(arch)

  const COUNT = small ? 18 : 24 // the 16 designs cycle around the ring; fewer on mobile so the larger coins don't overlap
  const cache = new Map<string, THREE.Material[]>()
  const coins = Array.from({ length: COUNT }, (_, i) => COINS[i % COINS.length]!).map((def) => {
    const hit = cache.get(def.id)
    const [bodyMat, faceMat] = hit ?? makeMats(def)
    if (!hit) cache.set(def.id, [bodyMat!, faceMat!])
    const coin = new THREE.Group()
    const front = new THREE.Mesh(faceGeo, faceMat)
    front.position.z = FACE_Z
    const back = new THREE.Mesh(faceGeo, faceMat)
    back.position.z = -FACE_Z
    back.rotation.y = Math.PI
    coin.add(new THREE.Mesh(bodyGeo, bodyMat), front, back)
    const slot = new THREE.Group()
    slot.add(coin)
    arch.add(slot)
    return { slot, coin }
  })

  function makeMats(def: Coin): THREE.Material[] {
    const colorMap = drawFace(def, texSize, 'color')
    const bumpMap = drawFace(def, texSize, 'bump')
    const pbrMap = drawFace(def, texSize, 'pbr')
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: def.body,
      metalness: def.metal,
      roughness: 0.26,
      clearcoat: 0.7,
      clearcoatRoughness: 0.12,
      envMapIntensity: 0.95
    })
    const faceMat = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      metalness: 1,
      roughness: 1,
      map: colorMap,
      bumpMap,
      bumpScale: 2.4,
      roughnessMap: pbrMap,
      metalnessMap: pbrMap,
      clearcoat: 0.7,
      clearcoatRoughness: 0.12,
      envMapIntensity: 0.95
    })
    disposables.push(colorMap, bumpMap, pbrMap, bodyMat, faceMat)
    return [bodyMat, faceMat]
  }

  const N = coins.length
  const STEP = (Math.PI * 2) / N
  const R = 7.6
  let cy = -4
  const YAW = -0.62 // three-quarter turn so the reeded edge shows, like the reference
  const SPIN_W = 0.34 // half-width (rad) of the arc window where each coin does its full 360° turn
  const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * x * (x * (x * 6 - 15) + 10))
  const fit = (w: number, h: number) => {
    const aspect = w / h
    camera.aspect = aspect
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const narrow = aspect < 1.3
    const s = narrow ? 1.3 : 0.94
    coins.forEach(({ coin }) => coin.scale.setScalar(s))
    // half-width inside R so the arc runs off the left and right window edges, not the bottom
    const halfW = narrow ? 3.1 : R * 0.86
    camera.position.set(0, 0, halfW / (tan * aspect))
    const halfH = camera.position.z * tan
    cy = halfH - 0.75 - s - R // crest sits a little under the top edge, clear of the headline
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
  const SPEED = 0.32 // rad/s along the arc, left → right

  let p = props.progress
  const pose = (t: number) => {
    const base = reduce ? 0 : t * SPEED
    const r = R * (1 + p * 0.08)
    coins.forEach(({ slot, coin }, i) => {
      // θ = 0 at the crest; increasing θ moves the coin to the right
      let th = ((base + i * STEP + Math.PI) % (Math.PI * 2)) - Math.PI
      if (th < -Math.PI) th += Math.PI * 2
      slot.visible = Math.cos(th) > -0.2
      slot.position.set(Math.sin(th) * r, cy + Math.cos(th) * r, 0)
      slot.rotation.z = -th
      const spin = ease((th + SPIN_W) / (SPIN_W * 2)) * Math.PI * 2
      coin.rotation.set(Math.sin(t * 0.8 + i) * 0.05, YAW + spin + Math.sin(t * 0.6 + i * 1.7) * 0.08, 0)
    })
    arch.rotation.set(-0.1 - mouse.y * 0.06 + p * 0.2, mouse.x * 0.12, 0)
    arch.position.y = p * 1.2
    scene.environmentRotation.y = Math.sin(t * 0.15) * 0.3
  }

  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(el)

  let visible = true
  const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting))
  io.observe(el)

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
  let t = 0
  let raf = 0
  const loop = () => {
    raf = requestAnimationFrame(loop)
    timer.update()
    const dt = Math.min(timer.getDelta(), 0.05)
    if (!visible) return
    if (!reduce) t += dt
    mouse.lerp(target, 1 - Math.pow(0.94, dt * 60))
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
    disposables.forEach((d) => d.dispose())
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
