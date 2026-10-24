import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const gridVertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
  }
`

const gridFragment = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorld;

  void main() {
    vec2 g = vWorld.xz / 2.0;
    vec2 lines = abs(fract(g - 0.5) - 0.5) / fwidth(g);
    float line = 1.0 - min(min(lines.x, lines.y), 1.0);

    float d = length(vWorld.xz - vec2(0.0, -84.0));
    float fade = 1.0 - smoothstep(12.0, 42.0, d);

    // Pulses spreading out from three points, like pings across a network.
    float ring = 0.0;
    for (int i = 0; i < 3; i++) {
      vec2 c = vec2(float(i - 1) * 11.0, -78.0 - float(i) * 6.0);
      float r = mod(uTime * 4.0 + float(i) * 8.0, 30.0);
      ring += smoothstep(1.3, 0.0, abs(length(vWorld.xz - c) - r)) * (1.0 - r / 30.0);
    }

    vec3 cyan = vec3(0.0, 0.94, 1.0);
    vec3 purple = vec3(0.62, 0.36, 0.98);
    vec3 col = mix(cyan, purple, clamp(ring, 0.0, 1.0));
    float a = (line * 0.42 + ring * 0.85) * fade;
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`

const panelVertex = /* glsl */ `
  varying vec2 vUv;
  varying float vDist;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDist = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

// A fake terminal window: border, title bar and rows of scrolling "text".
const panelFragment = /* glsl */ `
  uniform float uTime;
  uniform float uSeed;
  varying vec2 vUv;
  varying float vDist;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    vec2 uv = vUv;
    float border = clamp(step(uv.x, 0.006) + step(0.994, uv.x) + step(uv.y, 0.008) + step(0.992, uv.y), 0.0, 1.0);
    float bar = step(0.9, uv.y);

    float rows = 15.0;
    float y = uv.y * rows + uTime * 0.7;
    float rowId = floor(y);
    float rowFrac = fract(y);
    float len = 0.2 + 0.7 * hash(rowId + uSeed * 13.0);
    float indent = floor(hash(rowId * 1.7 + uSeed) * 3.0) * 0.06;
    float x = (uv.x - 0.06 - indent) / len;
    float text = step(0.0, x) * step(x, 1.0) * step(0.22, rowFrac) * step(rowFrac, 0.68);
    text *= step(0.16, fract(x * 7.0 + hash(rowId))) * (1.0 - bar);

    vec3 cyan = vec3(0.0, 0.94, 1.0);
    vec3 purple = vec3(0.62, 0.36, 0.98);
    vec3 col = mix(cyan, purple, step(0.7, hash(rowId * 3.1 + uSeed)));
    // Panels fade as the camera gets close so they never sit on top of page text.
    float near = smoothstep(3.5, 10.0, vDist);
    float a = (border * 0.5 + text * 0.5 + bar * 0.2 + 0.04) * near;
    gl_FragColor = vec4(col * (border * 0.7 + text * 0.9 + bar * 0.5 + 0.2), a);
    #include <colorspace_fragment>
  }
`

function Panel({
  position,
  rotationY,
  size,
  seed,
  animate,
}: {
  position: [number, number, number]
  rotationY: number
  size: [number, number]
  seed: number
  animate: boolean
}) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uSeed: { value: seed } }), [seed])
  useFrame(({ clock }) => {
    if (mat.current && animate) mat.current.uniforms.uTime.value = clock.elapsedTime + seed * 10
  })
  return (
    <mesh position={position} rotation={[0, rotationY, 0]}>
      <planeGeometry args={size} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={panelVertex}
        fragmentShader={panelFragment}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

/** The floor grid with network pings, plus floating terminal windows around it. */
export function HoloGrid({ animate }: { animate: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  useFrame(({ clock }) => {
    if (mat.current && animate) mat.current.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, -84]} frustumCulled={false}>
        <planeGeometry args={[100, 100]} />
        <shaderMaterial
          ref={mat}
          uniforms={uniforms}
          vertexShader={gridVertex}
          fragmentShader={gridFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <Panel position={[-5.2, 1.2, -74]} rotationY={0.45} size={[3.6, 2.4]} seed={0.11} animate={animate} />
      <Panel position={[5.6, 2.4, -78]} rotationY={-0.5} size={[3.2, 2.1]} seed={0.37} animate={animate} />
      <Panel position={[-6.4, 2.8, -86]} rotationY={0.35} size={[3.8, 2.5]} seed={0.62} animate={animate} />
      <Panel position={[6.2, 0.6, -90]} rotationY={-0.4} size={[3.4, 2.3]} seed={0.83} animate={animate} />
      <Panel position={[0.4, 4.6, -94]} rotationY={0} size={[4.2, 2.2]} seed={0.94} animate={animate} />
    </group>
  )
}
