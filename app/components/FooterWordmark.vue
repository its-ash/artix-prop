<script setup lang="ts">
import * as THREE from 'three'

const host = ref<HTMLDivElement>()
const ready = ref(false)

/** Builds clean geometric 3D letter shapes for A, R, T, I and the signature faceted Artix X mark. */
function buildArtixGroup(
  metalMat: THREE.MeshPhysicalMaterial,
  limeMat: THREE.MeshPhysicalMaterial,
  edgeMat: THREE.LineBasicMaterial
) {
  const group = new THREE.Group()
  const depth = 0.34
  const extrudeOpts: THREE.ExtrudeGeometryOptions = {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.045,
    bevelSize: 0.032,
    bevelSegments: 4,
    curveSegments: 16
  }

  const addShape = (shape: THREE.Shape, mat: THREE.Material, xOffset: number, zOffset = 0, withEdges = true) => {
    const geo = new THREE.ExtrudeGeometry(shape, extrudeOpts)
    geo.translate(xOffset, -0.9, -depth / 2 + zOffset)
    const mesh = new THREE.Mesh(geo, mat)
    const holder = new THREE.Group()
    holder.add(mesh)
    if (withEdges) {
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 32), edgeMat)
      holder.add(edges)
    }
    return holder
  }

  // Letter A (width ~1.45, height 1.8)
  const aShape = new THREE.Shape()
  aShape.moveTo(0, 0)
  aShape.lineTo(0.32, 0)
  aShape.lineTo(0.45, 0.42)
  aShape.lineTo(1.0, 0.42)
  aShape.lineTo(1.13, 0)
  aShape.lineTo(1.45, 0)
  aShape.lineTo(0.89, 1.8)
  aShape.lineTo(0.56, 1.8)
  aShape.closePath()
  const aHole = new THREE.Path()
  aHole.moveTo(0.53, 0.72)
  aHole.lineTo(0.92, 0.72)
  aHole.lineTo(0.725, 1.42)
  aHole.closePath()
  aShape.holes.push(aHole)

  // Letter R (width ~1.35, height 1.8)
  const rShape = new THREE.Shape()
  rShape.moveTo(0, 0)
  rShape.lineTo(0.32, 0)
  rShape.lineTo(0.32, 0.74)
  rShape.lineTo(0.72, 0.74)
  rShape.lineTo(1.04, 0)
  rShape.lineTo(1.4, 0)
  rShape.lineTo(1.03, 0.8)
  rShape.quadraticCurveTo(1.34, 0.92, 1.34, 1.28)
  rShape.quadraticCurveTo(1.34, 1.8, 0.82, 1.8)
  rShape.lineTo(0, 1.8)
  rShape.closePath()
  const rHole = new THREE.Path()
  rHole.moveTo(0.32, 1.03)
  rHole.lineTo(0.78, 1.03)
  rHole.quadraticCurveTo(1.02, 1.03, 1.02, 1.27)
  rHole.quadraticCurveTo(1.02, 1.51, 0.78, 1.51)
  rHole.lineTo(0.32, 1.51)
  rHole.closePath()
  rShape.holes.push(rHole)

  // Letter T (width ~1.36, height 1.8)
  const tShape = new THREE.Shape()
  tShape.moveTo(0.52, 0)
  tShape.lineTo(0.84, 0)
  tShape.lineTo(0.84, 1.5)
  tShape.lineTo(1.36, 1.5)
  tShape.lineTo(1.36, 1.8)
  tShape.lineTo(0, 1.8)
  tShape.lineTo(0, 1.5)
  tShape.lineTo(0.52, 1.5)
  tShape.closePath()

  // Letter I (width ~0.34, height 1.8)
  const iShape = new THREE.Shape()
  iShape.moveTo(0, 0)
  iShape.lineTo(0.34, 0)
  iShape.lineTo(0.34, 1.8)
  iShape.lineTo(0, 1.8)
  iShape.closePath()

  // Signature Artix X mark (diagonal bar + top-right downward triangle + bottom-left upward triangle)
  const xSlash = new THREE.Shape()
  xSlash.moveTo(0, 1.8)
  xSlash.lineTo(0.34, 1.8)
  xSlash.lineTo(1.48, 0)
  xSlash.lineTo(1.14, 0)
  xSlash.closePath()

  const xTopTri = new THREE.Shape()
  xTopTri.moveTo(0.54, 1.8)
  xTopTri.lineTo(1.48, 1.8)
  xTopTri.lineTo(1.01, 1.06)
  xTopTri.closePath()

  const xBotTri = new THREE.Shape()
  xBotTri.moveTo(0, 0)
  xBotTri.lineTo(0.94, 0)
  xBotTri.lineTo(0.47, 0.74)
  xBotTri.closePath()

  // Position letters symmetrically around X=0 (total span ~7.6 units)
  const letters: THREE.Group[] = []
  const letterA = addShape(aShape, metalMat, -3.72)
  const letterR = addShape(rShape, metalMat, -1.96)
  const letterT = addShape(tShape, metalMat, -0.30)
  const letterI = addShape(iShape, metalMat, 1.32)

  const letterX = new THREE.Group()
  letterX.add(addShape(xSlash, metalMat, 1.98))
  letterX.add(addShape(xTopTri, limeMat, 1.98, 0.04, false))
  letterX.add(addShape(xBotTri, limeMat, 1.98, 0.04, false))

  letters.push(letterA, letterR, letterT, letterI, letterX)
  letters.forEach((l) => group.add(l))

  return { group, letters }
}

onMounted(() => {
  const el = host.value
  if (!el) return

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let raf = 0
  let visible = false
  let disposed = false

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.18
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100)
  camera.position.set(0, 0.08, 10.5)

  // Procedural studio softbox environment so dark titanium bevels catch crisp reflections
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envScene = new THREE.Scene()
  envScene.background = new THREE.Color(0x050608)
  const box1 = new THREE.Mesh(new THREE.PlaneGeometry(14, 4), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }))
  box1.position.set(0, 6, 4)
  box1.rotation.x = Math.PI / 2.6
  const box2 = new THREE.Mesh(new THREE.PlaneGeometry(10, 4), new THREE.MeshBasicMaterial({ color: 0xb6f500, side: THREE.DoubleSide }))
  box2.position.set(6, -3, 3)
  box2.rotation.y = -Math.PI / 3
  const box3 = new THREE.Mesh(new THREE.PlaneGeometry(10, 4), new THREE.MeshBasicMaterial({ color: 0x6b7280, side: THREE.DoubleSide }))
  box3.position.set(-7, 2, 2)
  box3.rotation.y = Math.PI / 3
  envScene.add(box1, box2, box3)
  const envRT = pmrem.fromScene(envScene, 0.04)
  scene.environment = envRT.texture

  const metalMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x14171c),
    metalness: 0.92,
    roughness: 0.22,
    clearcoat: 1.0,
    clearcoatRoughness: 0.14,
    envMapIntensity: 1.4
  })

  const limeMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xb6f500),
    emissive: new THREE.Color(0x6c9600),
    emissiveIntensity: 0.65,
    metalness: 0.35,
    roughness: 0.14,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.6
  })

  const edgeMat = new THREE.LineBasicMaterial({
    color: 0xb6f500,
    transparent: true,
    opacity: 0.24
  })

  const { group: wordGroup, letters } = buildArtixGroup(metalMat, limeMat, edgeMat)
  scene.add(wordGroup)

  // Subtle floating 3D dust motes around the wordmark
  const dustCount = 90
  const dustPos = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 11
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 3.4
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 3.2
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dustMat = new THREE.PointsMaterial({
    color: 0xc8ff3a,
    size: 0.045,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
  const dust = new THREE.Points(dustGeo, dustMat)
  scene.add(dust)

  // Lights: key + cool rim + interactive neon-lime pointer spotlight
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
  keyLight.position.set(-4, 5, 7)
  const rimLight = new THREE.DirectionalLight(0xb6f500, 1.9)
  rimLight.position.set(5, -2, -4)
  const cursorLight = new THREE.PointLight(0xc8ff3a, 10, 9, 1.6)
  cursorLight.position.set(2.4, 0.2, 2.6)
  scene.add(keyLight, rimLight, cursorLight)

  const mouse = new THREE.Vector2(0.32, 0)
  const smoothMouse = new THREE.Vector2(0.32, 0)
  let hovering = false

  const resize = () => {
    const w = el.clientWidth || 1200
    const h = el.clientHeight || 320
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    const vFov = (camera.fov * Math.PI) / 180
    const fitW = 4.35 / (Math.tan(vFov / 2) * camera.aspect)
    const fitH = 1.42 / Math.tan(vFov / 2)
    camera.position.z = Math.max(fitW, fitH)
    camera.updateProjectionMatrix()
  }
  resize()

  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect()
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1
    mouse.y = -(((e.clientY - r.top) / r.height) * 2 - 1)
    hovering = true
  }
  const onLeave = () => {
    hovering = false
  }
  el.addEventListener('pointermove', onMove, { passive: true })
  el.addEventListener('pointerleave', onLeave, { passive: true })

  const ro = new ResizeObserver(resize)
  ro.observe(el)

  const clock = new THREE.Clock()
  let elapsed = 0

  const renderFrame = () => {
    if (disposed) return
    const dt = Math.min(clock.getDelta(), 0.05)
    if (!reduce) elapsed += dt

    if (!hovering && !reduce) {
      mouse.x = Math.sin(elapsed * 0.45) * 0.55
      mouse.y = Math.cos(elapsed * 0.35) * 0.18
    }
    smoothMouse.lerp(mouse, 0.065)

    // Interactive cursor light glides across the sculpted titanium letters
    cursorLight.position.x = smoothMouse.x * 4.4
    cursorLight.position.y = smoothMouse.y * 1.4
    cursorLight.intensity = hovering ? 15 : 10

    // Smooth 3D perspective tilt on the whole wordmark
    wordGroup.rotation.y = smoothMouse.x * 0.16
    wordGroup.rotation.x = -smoothMouse.y * 0.11

    // Subtle staggered wave levitation across A-R-T-I-X
    if (!reduce) {
      letters.forEach((l, i) => {
        l.position.y = Math.sin(elapsed * 1.15 - i * 0.55) * 0.045
        l.position.z = Math.cos(elapsed * 0.9 - i * 0.6) * 0.035
      })
      dust.rotation.y = elapsed * 0.035
      limeMat.emissiveIntensity = 0.55 + Math.sin(elapsed * 2.0) * 0.16
    }

    renderer.render(scene, camera)
    if (visible && !reduce && !document.hidden) {
      raf = requestAnimationFrame(renderFrame)
    } else {
      raf = 0
    }
  }

  const start = () => {
    if (!raf && visible && !reduce && !document.hidden) {
      clock.getDelta()
      raf = requestAnimationFrame(renderFrame)
    }
  }

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? false
      if (visible) {
        if (reduce) renderFrame()
        else start()
      } else if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    },
    { rootMargin: '120px' }
  )
  io.observe(el)

  const onVis = () => {
    if (document.hidden && raf) {
      cancelAnimationFrame(raf)
      raf = 0
    } else if (!document.hidden && visible) {
      start()
    }
  }
  document.addEventListener('visibilitychange', onVis)

  renderFrame()
  ready.value = true

  onBeforeUnmount(() => {
    disposed = true
    if (raf) cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
    document.removeEventListener('visibilitychange', onVis)
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerleave', onLeave)
    wordGroup.traverse((o) => {
      if ((o as THREE.Mesh).geometry) (o as THREE.Mesh).geometry.dispose()
    })
    metalMat.dispose()
    limeMat.dispose()
    edgeMat.dispose()
    dustGeo.dispose()
    dustMat.dispose()
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
  cursor: grab;
}
.wm:active {
  cursor: grabbing;
}
.wm::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(52% 68% at 50% 55%, rgba(var(--green-rgb), 0.14), transparent 70%);
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
