<script setup lang="ts">
import * as THREE from 'three'

/**
 * Real-time ray-traced black hole (Schwarzschild lensing) with a neon accretion disk.
 * Every pixel shoots a photon that bends around the event horizon; when the photon
 * crosses the disk plane we sample a procedural, Keplerian-rotating disk with
 * relativistic Doppler beaming. This is what produces the "Interstellar" style ring
 * that wraps over the top and under the bottom of the hole.
 */
const props = withDefaults(defineProps<{ progress?: number }>(), { progress: 0 })

const host = ref<HTMLDivElement>()

const vertex = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`

const fragment = /* glsl */ `
  precision highp float;
  uniform vec2  uRes;
  uniform float uTime;
  uniform float uProgress;
  uniform vec2  uMouse;
  uniform vec3  uColA;   // neon magenta
  uniform vec3  uColB;   // neon cyan
  uniform vec3  uColC;   // violet blend

  #define R_IN  2.6
  #define R_OUT 11.0

  float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++){ v += a*noise(p); p = p*2.03 + 7.1; a *= 0.5; }
    return v;
  }

  vec3 starfield(vec3 d){
    vec2 uv = vec2(atan(d.z, d.x), asin(clamp(d.y,-1.0,1.0))) * 70.0;
    vec2 id = floor(uv);
    vec2 f  = fract(uv) - 0.5;
    float h = hash(id);
    float tw = 0.6 + 0.4*sin(uTime*1.5 + h*60.0);
    float s = step(0.982, h) * smoothstep(0.18, 0.0, length(f)) * tw;
    // faint neon nebula far behind
    float neb = fbm(d.xy*2.5 + d.z) * 0.06;
    return vec3(s) + mix(uColC, uColB, d.y*0.5+0.5) * neb;
  }

  vec4 disk(vec3 p, vec3 rd){
    float r = length(p.xz);
    if (r < R_IN || r > R_OUT) return vec4(0.0);
    float t = (r - R_IN) / (R_OUT - R_IN);

    // Keplerian rotation: inner rings orbit faster
    float ang = atan(p.z, p.x) + uTime * 1.6 / pow(r, 1.5);
    vec2 q = vec2(cos(ang), sin(ang)) * r;

    // smooth radial profile: hot, bright inner edge with a long soft fall-off
    float prof = smoothstep(0.0, 0.03, t) * (0.85 * exp(-t * 3.4) + 0.15 * (1.0 - t));

    // gentle large-scale variation — never drops to black, so no dark gaps in the disk
    float n = fbm(q * 0.6);
    // fine concentric filaments (like the reference), shallow so they read as texture, not stripes
    float fil = 0.88 + 0.12 * sin(r * 30.0 + n * 9.0) * sin(r * 11.0 - n * 5.0);
    float I = prof * (0.8 + 0.4 * n) * fil;

    // relativistic beaming — the side spinning towards the camera is brighter
    vec3 vel = normalize(vec3(-p.z, 0.0, p.x));
    I *= pow(max(1.0 + 0.55 * dot(vel, -rd), 0.3), 2.6) * 2.3;

    // colour by intensity (blackbody-style): deep amber → neon gold → white-hot core.
    // Dim regions stay warm amber instead of turning grey.
    vec3 col = mix(uColB, uColA, smoothstep(0.0, 1.0, I));
    col = mix(col, vec3(1.0, 0.95, 0.82), smoothstep(2.6, 6.0, I));

    return vec4(col * I, clamp(prof * 2.6, 0.0, 1.0));
  }

  void main(){
    // Normalise by the SHORTER side so portrait phones see the whole hole + disk instead of a
    // narrow, zoomed-in vertical slice. On portrait screens also pull back a little and sit the
    // hole below the headline; it drifts back to centre as the scroll dive progresses.
    float portrait = step(uRes.x, uRes.y);
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
    uv *= mix(1.0, 1.3, portrait);
    uv.y += portrait * 0.45 * (1.0 - uProgress);

    // Camera — scroll pulls us towards the hole and lifts above the disk
    float dist = mix(17.0, 8.5, uProgress);
    float incl = mix(0.07, 0.30, uProgress) + uMouse.y * 0.05;
    float yaw  = uMouse.x * 0.18 + uTime * 0.015;
    vec3 ro = dist * vec3(sin(yaw) * cos(incl), sin(incl), -cos(yaw) * cos(incl));
    vec3 ww = normalize(-ro);
    vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
    vec3 vv = cross(uu, ww);

    float roll = -0.14 + uProgress * 0.1;
    uv = mat2(cos(roll), -sin(roll), sin(roll), cos(roll)) * uv;
    vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.7 * ww);

    vec3 p = ro;
    vec3 v = rd;
    vec3 h = cross(p, v);
    float h2 = dot(h, h);

    vec3 col = vec3(0.0);
    float alpha = 0.0;
    float glow = 0.0;
    bool captured = false;

    for (int i = 0; i < 150; i++){
      float r = length(p);
      float dt = clamp(0.085 * r, 0.03, 0.9);
      vec3 prev = p;

      // photon geodesic in Schwarzschild metric (Rs = 1)
      v += -1.5 * h2 * p / pow(r, 5.0) * dt;
      p += v * dt;

      // soft glow hugging the photon sphere
      glow += dt * exp(-pow(r - 1.55, 2.0) * 4.0) * 0.11;

      if (prev.y * p.y < 0.0){
        vec3 hp = mix(prev, p, prev.y / (prev.y - p.y));
        vec4 d = disk(hp, normalize(v));
        col   += (1.0 - alpha) * d.rgb;
        alpha += (1.0 - alpha) * d.a;
      }
      if (r < 1.0){ captured = true; break; }
      if (alpha > 0.995) break;
      if (r > dist + 6.0 && dot(p, v) > 0.0) break;
    }

    if (!captured) col += (1.0 - alpha) * starfield(normalize(v));
    // keep the event-horizon shadow truly black; glow only outside it
    col += glow * mix(uColA, uColC, 0.5) * (1.0 - alpha) * (captured ? 0.12 : 1.0);

    // filmic tone-map + slight lift so neon stays vivid
    col = 1.0 - exp(-col * 1.15);
    col = pow(col, vec3(0.92));

    // vignette
    vec2 q = gl_FragCoord.xy / uRes;
    col *= 0.55 + 0.45 * pow(16.0 * q.x * q.y * (1.0 - q.x) * (1.0 - q.y), 0.22);

    gl_FragColor = vec4(col, 1.0);
  }
`

onMounted(() => {
  const el = host.value!
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
  // the shader is per-pixel ray-marched: render below native resolution and let the GPU upscale
  const quality = window.innerWidth < 768 ? 0.6 : 0.9
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5) * quality)
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const uniforms = {
    uRes: { value: new THREE.Vector2() },
    uTime: { value: 0 },
    uProgress: { value: props.progress },
    uMouse: { value: new THREE.Vector2() },
    uColA: { value: new THREE.Color('#ffb800') },
    // single neon: gold core fading to a deeper amber-gold at the rim
    uColB: { value: new THREE.Color('#9a5a00') },
    uColC: { value: new THREE.Color('#ffb800') }
  }
  // single full-screen triangle
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3))
  const mat = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms })
  scene.add(new THREE.Mesh(geo, mat))

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = el
    renderer.setSize(w, h, false)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.getDrawingBufferSize(uniforms.uRes.value)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(el)

  const mouse = new THREE.Vector2()
  const onMove = (e: PointerEvent) => {
    mouse.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1))
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  let visible = true
  const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting))
  io.observe(el)

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const timer = new THREE.Timer()
  let raf = 0
  let smooth = props.progress
  const loop = () => {
    raf = requestAnimationFrame(loop)
    if (!visible) return
    timer.update()
    const dt = Math.min(timer.getDelta(), 0.05)
    uniforms.uTime.value += reduce ? 0 : dt
    uniforms.uMouse.value.lerp(mouse, 0.04)
    smooth += (props.progress - smooth) * 0.08
    uniforms.uProgress.value = smooth
    renderer.render(scene, camera)
  }
  loop()

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    io.disconnect()
    window.removeEventListener('pointermove', onMove)
    geo.dispose()
    mat.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  })
})
</script>

<template>
  <div ref="host" class="bh" aria-hidden="true" />
</template>

<style scoped>
.bh {
  position: absolute;
  inset: 0;
}
.bh :deep(canvas) {
  display: block;
}
</style>
