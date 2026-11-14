<script setup lang="ts">
import * as THREE from 'three'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js'

/**
 * The live three.js mountain (source of app/assets/images/mountain.webp).
 *
 * It is NOT used on the homepage — the homepage shows the exported still image so it costs
 * no WebGL. Use the dev page /dev/mountain to preview it, change the neon colour and export
 * a new image (or run `npm run export:mountain`).
 *
 * - Terrain: ridged Perlin noise shaped by gaussian peak envelopes, flat-shaded for crystal facets.
 * - Material: dark metallic physical material; the neon edges are reflections of a PMREM studio
 *   built from emissive panels in the chosen colour.
 */
const props = withDefaults(
  defineProps<{
    /** neon colour used for the reflections and key lights */
    color?: string
    /** 0 → mountain sunk below the frame, 1 → fully risen */
    progress?: number
    /** idle motion (light sweep, slow sway, mouse parallax) */
    animate?: boolean
  }>(),
  { color: '#ffb800', progress: 1, animate: true }
)

const host = ref<HTMLDivElement>()
let api: {
  capture: (w: number, h: number, type?: string, quality?: number) => string
  setColor: (c: string) => void
} | null = null

/** Render one frame at the given size with a transparent background and return a data URL. */
function capture(width = 2400, height = 1200, type = 'image/webp', quality = 0.92) {
  if (!api) throw new Error('MountainScene is not mounted yet')
  return api.capture(width, height, type, quality)
}
defineExpose({ capture })

function buildTerrain() {
  const perlin = new ImprovedNoise()
  const geo = new THREE.PlaneGeometry(22, 12, 150, 90)
  geo.rotateX(-Math.PI / 2)
  const pos = geo.attributes.position as THREE.BufferAttribute

  const peak = (x: number, z: number, cx: number, cz: number, sx: number, sz: number, h: number) =>
    h * Math.exp(-(((x - cx) ** 2) / (2 * sx * sx) + ((z - cz) ** 2) / (2 * sz * sz)))

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)

    // massif made of a main summit + shoulders
    let env =
      peak(x, z, -0.6, 0, 3.0, 2.2, 1.0) +
      peak(x, z, 3.2, 0.6, 2.0, 1.6, 0.62) +
      peak(x, z, -4.2, 0.8, 2.2, 1.6, 0.42) +
      peak(x, z, 1.4, -1.2, 1.6, 1.3, 0.5)
    env = Math.min(env, 1.25)

    // ridged multifractal for rocky, crystalline detail
    let ridged = 0
    let amp = 1
    let freq = 0.3
    let weight = 1
    for (let o = 0; o < 5; o++) {
      let n = 1 - Math.abs(perlin.noise(x * freq, z * freq, 1.7 + o * 3.1))
      n *= n * weight
      weight = Math.min(Math.max(n * 1.6, 0), 1)
      ridged += n * amp
      amp *= 0.5
      freq *= 2.05
    }

    const y = env * 3.0 + ridged * env * 0.75 - (1 - Math.min(env * 3, 1)) * 2.2
    pos.setY(i, y)
  }

  const flat = geo.toNonIndexed()
  geo.dispose()
  flat.computeVertexNormals()
  return flat
}

/** Dark studio lit only by narrow strips of the neon colour + a few white highlights. */
function buildEnvironment(renderer: THREE.WebGLRenderer, neon: string) {
  const env = new THREE.Scene()
  env.background = new THREE.Color('#050508')

  const panel = (color: string, intensity: number, w: number, h: number, pos: [number, number, number]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide })
    )
    m.position.set(...pos)
    m.lookAt(0, 0, 0)
    env.add(m)
  }

  // narrow neon strips → only grazing facets catch colour, the rest stays graphite
  panel(neon, 4.5, 2.6, 9, [-10, 1, 1]) // left
  panel(neon, 4.2, 2.2, 8, [10, 0, 2]) // right
  panel(neon, 2.2, 8, 1.4, [0, -3, 10]) // front-low
  panel('#9a9aa8', 0.9, 14, 14, [0, 12, 0]) // dim grey sky → graphite/silver tops
  panel(neon, 2.4, 2, 2, [5, 6, -8]) // kicker from behind
  panel('#ffffff', 3, 0.4, 7, [-3, 5, 8]) // sharp white strip highlight

  const pmrem = new THREE.PMREMGenerator(renderer)
  const tex = pmrem.fromScene(env, 0.035).texture
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
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.setClearColor(0x000000, 0)
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  let envTex = buildEnvironment(renderer, props.color)
  scene.environment = envTex

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)

  const geo = buildTerrain()
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#2a2a30'),
    metalness: 0.85,
    roughness: 0.36,
    flatShading: true,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    iridescence: 0.35,
    iridescenceIOR: 1.6,
    envMapIntensity: 1.1
  })
  const mountain = new THREE.Mesh(geo, mat)
  scene.add(mountain)

  // neon key lights add living highlights on top of the env reflections
  const lightA = new THREE.PointLight(props.color, 22, 30, 1.6)
  const lightB = new THREE.PointLight(props.color, 18, 30, 1.6)
  const key = new THREE.DirectionalLight('#ffffff', 0.6)
  key.position.set(-2, 8, 4)
  scene.add(lightA, lightB, key, new THREE.AmbientLight('#ffffff', 0.08))

  const setColor = (c: string) => {
    envTex.dispose()
    envTex = buildEnvironment(renderer, c)
    scene.environment = envTex
    lightA.color.set(c)
    lightB.color.set(c)
  }
  watch(() => props.color, setColor)

  const fit = (w: number, h: number) => {
    camera.aspect = w / h
    // keep the massif filling the width on narrow frames
    camera.fov = w / h < 1 ? 52 : 30
    camera.updateProjectionMatrix()
  }
  const resize = () => {
    const w = el.clientWidth
    const h = el.clientHeight
    renderer.setSize(w, h, false)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    fit(w, h)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(el)

  const mouse = new THREE.Vector2()
  const target = new THREE.Vector2()
  const onMove = (e: PointerEvent) =>
    target.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
  window.addEventListener('pointermove', onMove, { passive: true })

  const timer = new THREE.Timer()
  let t = 0
  let p = props.progress

  /** Put every moving part where it should be for time t / progress p / pointer m. */
  const pose = (time: number, prog: number, m: THREE.Vector2) => {
    mountain.position.y = THREE.MathUtils.lerp(-4, -1.6, prog)
    mountain.rotation.y = THREE.MathUtils.lerp(-0.25, 0.22, prog) + Math.sin(time * 0.15) * 0.03
    scene.environmentRotation.y = prog * Math.PI * 0.9 + time * 0.05
    lightA.position.set(Math.sin(time * 0.5) * 7, 4 + Math.cos(time * 0.3) * 1.5, 6)
    lightB.position.set(Math.cos(time * 0.4) * -7, 3, 5 + Math.sin(time * 0.5) * 2)
    camera.position.set(m.x * 0.8, 2.2 - m.y * 0.3, 19)
    camera.lookAt(0, 2.2, 0)
  }

  let raf = 0
  const loop = () => {
    raf = requestAnimationFrame(loop)
    timer.update()
    const dt = Math.min(timer.getDelta(), 0.05)
    if (props.animate) {
      t += dt
      mouse.lerp(target, 0.05)
    }
    p += (props.progress - p) * 0.07
    pose(t, p, mouse)
    renderer.render(scene, camera)
  }
  loop()

  api = {
    setColor,
    capture(w, h, type = 'image/webp', quality = 0.92) {
      // deterministic hero pose: fully risen, centred, no pointer offset
      const prevRatio = renderer.getPixelRatio()
      renderer.setPixelRatio(1)
      renderer.setSize(w, h, false)
      fit(w, h)
      pose(t, props.progress, new THREE.Vector2())
      // tighter framing for the still: the massif fills the frame, its base runs off the bottom edge
      camera.fov = 23
      camera.updateProjectionMatrix()
      camera.position.set(0, 1.8, 19)
      camera.lookAt(0, 1.15, 0)
      renderer.render(scene, camera)
      const url = renderer.domElement.toDataURL(type, quality) // same task as render → buffer still valid
      renderer.setPixelRatio(prevRatio)
      resize()
      return url
    }
  }

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    window.removeEventListener('pointermove', onMove)
    geo.dispose()
    mat.dispose()
    envTex.dispose()
    renderer.dispose()
    renderer.domElement.remove()
    api = null
  })
})
</script>

<template>
  <div ref="host" class="mountain-scene" aria-hidden="true" />
</template>

<style scoped>
.mountain-scene {
  position: absolute;
  inset: 0;
}
</style>
