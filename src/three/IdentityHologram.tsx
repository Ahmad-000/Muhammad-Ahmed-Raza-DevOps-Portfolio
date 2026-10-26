import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Tier } from '../hooks/useEffects'
import { COMPACT_BELOW, identityDom, identityStage } from '../lib/identityStore'
import { phaseAt } from '../lib/identityTimeline'
import { scrollStore } from '../lib/scrollStore'
import { COLORS } from './theme'
import { mulberry32 } from './utils'

/**
 * Floating holographic identity card.
 *
 * The card is real HTML (see src/components/identity). This component does two jobs
 * inside the existing canvas and render loop, with no second canvas or loop:
 *
 *  1. Draws the glass: a rounded translucent panel with luminous edges, a back outline,
 *     a soft halo, a few data traces and drifting nodes.
 *  2. Pins the HTML to the same pose, using a CSS 3D matrix derived from the camera
 *     (same field of view, same pose), so text, photo and glass line up exactly and
 *     the card is truly in the scene instead of an overlay.
 *
 * The pose is expressed in camera space and driven by the card's scroll section:
 * it flies in from ahead, settles facing the viewer, holds, then flies past.
 */

const WORLD_W = 3.2 // card width in world units; height follows the HTML card
const GLASS_PAD = 0.7 // extra plane around the card so the edge glow can spill outside it
const OUTLINE_PAD = 0.2

/* ---------------- shaders ---------------- */

const planeVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const planeFragment = /* glsl */ `
  uniform vec2 uPlane;    // plane size in world units
  uniform vec2 uHalf;     // card half size in world units
  uniform float uRadius;  // corner radius in world units
  uniform float uAlpha;
  uniform float uTime;
  uniform float uMode;    // 0 glass, 1 outline, 2 halo
  varying vec2 vUv;

  float sdRound(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uPlane;
    vec3 cyan = vec3(0.0, 0.94, 1.0);
    vec3 purple = vec3(0.62, 0.36, 0.98);
    vec4 outc;

    if (uMode > 1.5) {
      // Soft back-glow behind the card.
      vec2 n = p / (uHalf * 1.25);
      float g = exp(-dot(n, n) * 1.6);
      vec3 c = mix(purple, cyan, smoothstep(-0.8, 0.8, n.x));
      float a = g * 0.16;
      outc = vec4(c * a, a);
    } else {
      float scale = uMode > 0.5 ? 1.045 : 1.0;
      float d = sdRound(p, uHalf * scale, uRadius * scale);
      float aa = fwidth(d) * 1.2;
      float inside = 1.0 - smoothstep(-aa, aa, d);

      // Edge colour flows slowly around the card between cyan and purple.
      float ang = atan(p.y, p.x);
      float flow = 0.5 + 0.5 * sin(ang - uTime * 0.45);
      vec3 edgeCol = mix(cyan, purple, flow);
      float pulse = 0.82 + 0.18 * sin(ang * 3.0 + uTime * 0.9);

      if (uMode < 0.5) {
        float core = exp(-abs(d) / 0.0055) * pulse;
        // Outer glow only: it must not wash out the card's interior, where the text sits.
        float halo = exp(-max(d, 0.0) / 0.1) * 0.28 * (1.0 - inside);
        float innerGlow = exp(-max(-d, 0.0) / 0.07) * 0.2 * inside;

        // Glass body: deep navy, lighter toward the top, with a slow diagonal reflection.
        float gy = clamp(p.y / uHalf.y * 0.5 + 0.5, 0.0, 1.0);
        vec3 body = mix(vec3(0.03, 0.05, 0.09), vec3(0.075, 0.115, 0.2), gy);
        float diag = p.x / uHalf.x * 0.55 + p.y / uHalf.y * 0.45;
        float streak = smoothstep(0.1, 0.0, abs(diag - 0.1 + sin(uTime * 0.22) * 0.18));
        body += vec3(0.25, 0.55, 0.7) * streak * 0.1;
        body += vec3(0.012, 0.024, 0.03) * (0.5 + 0.5 * sin(p.y * 260.0));
        float top = pow(1.0 - clamp((uHalf.y - p.y) / (uHalf.y * 0.9), 0.0, 1.0), 3.0) * 0.07;
        body += vec3(0.4, 0.8, 1.0) * top;

        float fillA = inside * 0.84;
        float glow = core * 0.9 + innerGlow + halo;
        vec3 rgb = body * fillA + edgeCol * glow;
        float a = clamp(fillA + glow * 0.55, 0.0, 1.0);
        outc = vec4(rgb, a);
      } else {
        float line = exp(-abs(d) / 0.004) * pulse * 0.5;
        outc = vec4(mix(purple, cyan, 0.35) * line, line * 0.8);
      }
    }

    gl_FragColor = outc * uAlpha;
    #include <colorspace_fragment>
  }
`

const pointVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uAlpha;
  uniform float uPR;
  uniform float uOrbit;
  varying float vA;
  varying float vMix;

  void main() {
    vec3 p = position;
    if (uOrbit > 0.5) {
      // Nodes drifting slowly on a loose ring around the card (card space, scaled by the card size).
      float a = aSeed * 6.2831 + uTime * (0.05 + aSeed * 0.07);
      float rx = 0.62 + 0.3 * fract(aSeed * 7.13);
      float ry = 0.68 + 0.34 * fract(aSeed * 3.71);
      p = vec3(
        cos(a) * rx,
        sin(a) * ry + sin(uTime * 0.7 + aSeed * 20.0) * 0.015,
        (fract(aSeed * 11.3) - 0.65) * 0.7
      );
    }
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float size = (uOrbit > 0.5 ? 8.0 + aSeed * 14.0 : 16.0) / max(-mv.z, 0.5);
    gl_PointSize = clamp(uPR * size, 1.0, 16.0 * uPR);
    vA = uAlpha * (uOrbit > 0.5 ? 0.35 + 0.45 * aSeed : 0.9);
    vMix = step(0.6, fract(aSeed * 5.31));
    gl_Position = projectionMatrix * mv;
  }
`

const pointFragment = /* glsl */ `
  varying float vA;
  varying float vMix;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    vec3 c = mix(vec3(0.0, 0.94, 1.0), vec3(0.62, 0.36, 0.98), vMix);
    gl_FragColor = vec4(c, a * a * vA);
    #include <colorspace_fragment>
  }
`

/* ---------------- geometry ---------------- */

/** Right-angled data traces leaving the card edges, each ending in a node. Card space: x, y in [-0.5, 0.5]. */
function buildTraces() {
  const paths: [number, number][][] = [
    [[-0.3, 0.5], [-0.3, 0.57], [-0.46, 0.57], [-0.46, 0.64]],
    [[0.5, 0.18], [0.56, 0.18], [0.56, 0.06], [0.66, 0.06]],
    [[0.34, -0.5], [0.34, -0.58], [0.5, -0.58], [0.5, -0.66]],
    [[-0.5, -0.22], [-0.57, -0.22], [-0.57, -0.36], [-0.67, -0.36]],
  ]
  const segs: number[] = []
  const dots: number[] = []
  const seeds: number[] = []
  paths.forEach((pts, pi) => {
    for (let i = 0; i < pts.length - 1; i++) segs.push(pts[i][0], pts[i][1], 0, pts[i + 1][0], pts[i + 1][1], 0)
    const end = pts[pts.length - 1]
    dots.push(end[0], end[1], 0)
    seeds.push(0.15 + pi * 0.23)
  })
  const lines = new THREE.BufferGeometry()
  lines.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3))
  const nodes = new THREE.BufferGeometry()
  nodes.setAttribute('position', new THREE.Float32BufferAttribute(dots, 3))
  nodes.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1))
  return { lines, nodes }
}

function buildField(count: number) {
  const rnd = mulberry32(33)
  const seeds = new Float32Array(count)
  for (let i = 0; i < count; i++) seeds[i] = rnd()
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
  return g
}

const fmt5 = (v: number) => (Math.abs(v) < 1e-6 ? 0 : Number(v.toFixed(5)))
const fmt2 = (v: number) => Number(v.toFixed(2))

/* ---------------- component ---------------- */

export function IdentityHologram({ tier }: { tier: Tier }) {
  const low = tier === 'low'

  const root = useRef<THREE.Group>(null)
  const sizeGroup = useRef<THREE.Group>(null)
  const glass = useRef<THREE.Mesh>(null)
  const outline = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Mesh>(null)

  const gpu = useMemo(() => {
    const plane = (mode: number) =>
      new THREE.ShaderMaterial({
        uniforms: {
          uPlane: { value: new THREE.Vector2(1, 1) },
          uHalf: { value: new THREE.Vector2(1, 1) },
          uRadius: { value: 0.14 },
          uAlpha: { value: 0 },
          uTime: { value: 0 },
          uMode: { value: mode },
        },
        vertexShader: planeVertex,
        fragmentShader: planeFragment,
        transparent: true,
        depthWrite: false,
        // Always drawn over the scene, so the glass can never be hidden behind a rack or gate
        // while the HTML text on top of it stays visible.
        depthTest: false,
        premultipliedAlpha: true,
      })

    const points = (orbit: number) =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uAlpha: { value: 0 },
          uPR: { value: 1 },
          uOrbit: { value: orbit },
        },
        vertexShader: pointVertex,
        fragmentShader: pointFragment,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      })

    const traces = buildTraces()
    return {
      glass: plane(0),
      outline: plane(1),
      halo: plane(2),
      dots: points(0),
      field: points(1),
      fieldGeo: buildField(low ? 8 : 18),
      traceLines: traces.lines,
      traceNodes: traces.nodes,
      lineMat: new THREE.LineBasicMaterial({
        color: COLORS.cyan,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        toneMapped: false,
      }),
    }
  }, [low])

  // Everything mutable per frame lives here, outside React state.
  const rt = useMemo(
    () => ({
      shown: false,
      live: false,
      sweep: -1,
      opacity: -1,
      perspective: 0,
      px: 0,
      py: 0,
      pos: new THREE.Vector3(),
      worldPos: new THREE.Vector3(),
      euler: new THREE.Euler(),
      quat: new THREE.Quaternion(),
      scl: new THREE.Vector3(),
      mat: new THREE.Matrix4(),
    }),
    [],
  )

  // Take over the card while mounted; hand it back (as a normal in-flow card) when unmounted.
  useEffect(() => {
    identityStage.set(true)
    return () => {
      identityStage.set(false)
      const layer = identityDom.layer
      const card = identityDom.card
      if (layer) {
        layer.style.visibility = ''
        layer.style.perspective = ''
      }
      if (card) {
        card.style.transform = ''
        card.style.opacity = ''
        card.style.removeProperty('--sw')
        card.removeAttribute('data-live')
      }
      rt.shown = false
      rt.live = false
      rt.sweep = -1
      rt.opacity = -1
      rt.perspective = 0
    }
  }, [rt])

  useEffect(
    () => () => {
      gpu.glass.dispose()
      gpu.outline.dispose()
      gpu.halo.dispose()
      gpu.dots.dispose()
      gpu.field.dispose()
      gpu.lineMat.dispose()
      gpu.fieldGeo.dispose()
      gpu.traceLines.dispose()
      gpu.traceNodes.dispose()
    },
    [gpu],
  )

  useFrame(({ camera, size, clock, gl }, dt) => {
    const g = root.current
    const sg = sizeGroup.current
    if (!g || !sg) return

    const layer = identityDom.layer
    const card = identityDom.card
    const cw = identityDom.width
    const ch = identityDom.height
    const ph = phaseAt(scrollStore.identity)

    // Outside the card's scroll range: draw nothing and keep the HTML hidden.
    if (!layer || !card || cw < 8 || ch < 8 || ph.alpha < 0.002) {
      g.visible = false
      if (rt.shown && layer) {
        layer.style.visibility = 'hidden'
        card?.removeAttribute('data-live')
        rt.shown = false
        rt.live = false
      }
      return
    }

    const cam = camera as THREE.PerspectiveCamera
    const t = clock.elapsedTime
    const compact = cw < COMPACT_BELOW
    const amp = low || compact ? 0.55 : 1 // gentler rotation and travel on small or weak devices

    // Card size in the world. The HTML card's pixel size maps to WORLD_W so text stays crisp.
    const W = WORLD_W
    const H = (W * ch) / cw
    const pxToWorld = W / cw

    // Distance at which the card is exactly cw CSS pixels wide on screen.
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2)
    const aspect = size.width / size.height
    const d = W / ((cw / size.width) * 2 * tanHalf * aspect)
    const focal = size.height / 2 / tanHalf // CSS perspective distance equivalent to the camera

    // Pointer parallax: desktop only, damped.
    const usePointer = !low && scrollStore.pointer.active
    rt.px = THREE.MathUtils.damp(rt.px, usePointer ? scrollStore.pointer.x : 0, 2.4, dt)
    rt.py = THREE.MathUtils.damp(rt.py, usePointer ? scrollStore.pointer.y : 0, 2.4, dt)

    const inW = 1 - ph.enter // 1 at the start of the fly-in, 0 once settled
    const outW = ph.exit // 0 until the fly-out starts
    const holdW = (1 - inW) * (1 - outW)
    const bob = Math.sin(t * 0.9) * 0.04 * holdW

    // Pose in camera space (x right, y up, looking down -z).
    rt.pos.set(
      inW * 0.55 * W * amp - outW * 0.7 * W * amp,
      -inW * 0.2 * H + outW * 0.28 * H + bob,
      -(d + inW * 7.5) + outW * d * 0.45,
    )
    const yaw = -0.12 + ph.hold * 0.07 - inW * 0.7 * amp + outW * 0.55 * amp + rt.px * 0.07
    const pitch = 0.025 + inW * 0.15 * amp - outW * 0.12 * amp - rt.py * 0.045
    const roll = inW * 0.08 * amp - outW * 0.06 * amp + Math.sin(t * 0.6) * 0.008 * holdW
    rt.quat.setFromEuler(rt.euler.set(pitch, yaw, roll, 'YXZ'))
    const sc = 0.9 + 0.1 * ph.enter

    // 3D: place the glass in the world, relative to the camera.
    g.visible = true
    g.position.copy(rt.pos).applyQuaternion(cam.quaternion).add(cam.position)
    g.quaternion.copy(cam.quaternion).multiply(rt.quat)
    g.scale.setScalar(sc)
    sg.scale.set(W, H, 1)

    const radius = (compact ? 0.055 : 0.044) * W
    const setPlane = (m: THREE.Material, pw: number, phh: number) => {
      const u = (m as THREE.ShaderMaterial).uniforms
      u.uPlane.value.set(pw, phh)
      u.uHalf.value.set(W / 2, H / 2)
      u.uRadius.value = radius
      u.uTime.value = t
      u.uAlpha.value = ph.alpha
    }
    setPlane(gpu.glass, W + 2 * GLASS_PAD, H + 2 * GLASS_PAD)
    setPlane(gpu.outline, W + 2 * OUTLINE_PAD, H + 2 * OUTLINE_PAD)
    setPlane(gpu.halo, W * 1.9, H * 1.9)
    glass.current?.scale.set(1 + (2 * GLASS_PAD) / W, 1 + (2 * GLASS_PAD) / H, 1)
    outline.current?.scale.set(1 + (2 * OUTLINE_PAD) / W, 1 + (2 * OUTLINE_PAD) / H, 1)
    halo.current?.scale.set(1.9, 1.9, 1)

    const pr = gl.getPixelRatio()
    for (const m of [gpu.dots, gpu.field]) {
      m.uniforms.uTime.value = t
      m.uniforms.uAlpha.value = ph.alpha
      m.uniforms.uPR.value = pr
    }
    gpu.lineMat.opacity = 0.38 * ph.alpha

    // HTML: same pose through a CSS 3D matrix. Camera space -> CSS space flips y,
    // and translations are expressed in the card's own pixels (1 px = pxToWorld units).
    rt.scl.setScalar(sc)
    rt.mat.compose(rt.pos, rt.quat, rt.scl)
    const e = rt.mat.elements
    const k = 1 / pxToWorld
    if (Math.abs(focal - rt.perspective) > 0.5) {
      layer.style.perspective = `${fmt2(focal)}px`
      rt.perspective = focal
    }
    card.style.transform =
      `translateZ(${fmt2(focal)}px) matrix3d(` +
      `${fmt5(e[0])},${fmt5(-e[1])},${fmt5(e[2])},0,` +
      `${fmt5(-e[4])},${fmt5(e[5])},${fmt5(-e[6])},0,` +
      `${fmt5(e[8])},${fmt5(-e[9])},${fmt5(e[10])},0,` +
      `${fmt2(e[12] * k)},${fmt2(-e[13] * k)},${fmt2(e[14] * k)},1)`

    if (Math.abs(ph.alpha - rt.opacity) > 0.002) {
      card.style.opacity = ph.alpha.toFixed(3)
      rt.opacity = ph.alpha
    }
    const sweep = Math.round(ph.sweep * 400) / 400
    if (sweep !== rt.sweep) {
      card.style.setProperty('--sw', String(sweep))
      rt.sweep = sweep
    }
    const live = ph.alpha > 0.92
    if (live !== rt.live) {
      if (live) card.setAttribute('data-live', '')
      else card.removeAttribute('data-live')
      rt.live = live
    }
    if (!rt.shown) {
      layer.style.visibility = 'visible'
      rt.shown = true
    }
  })

  return (
    <group ref={root} visible={false}>
      <group ref={sizeGroup}>
        <mesh ref={halo} material={gpu.halo} position={[0, 0, -0.35]} renderOrder={18} frustumCulled={false}>
          <planeGeometry args={[1, 1]} />
        </mesh>
        <mesh ref={outline} material={gpu.outline} position={[0, 0, -0.07]} renderOrder={19} frustumCulled={false}>
          <planeGeometry args={[1, 1]} />
        </mesh>
        <mesh ref={glass} material={gpu.glass} renderOrder={20} frustumCulled={false}>
          <planeGeometry args={[1, 1]} />
        </mesh>
        <lineSegments geometry={gpu.traceLines} material={gpu.lineMat} renderOrder={21} frustumCulled={false} />
        <points geometry={gpu.traceNodes} material={gpu.dots} renderOrder={22} frustumCulled={false} />
        <points geometry={gpu.fieldGeo} material={gpu.field} renderOrder={22} frustumCulled={false} />
      </group>
    </group>
  )
}
