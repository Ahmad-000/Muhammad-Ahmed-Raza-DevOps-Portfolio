import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { STREAM_Z_FAR, STREAM_Z_NEAR } from './constants'
import { mulberry32 } from './utils'

const vertex = /* glsl */ `
  attribute float aSeed;
  attribute float aMix;
  uniform float uTime;
  uniform float uZMin;
  uniform float uZLen;
  uniform float uPR;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    float speed = 1.2 + aSeed * 4.5;
    // Packets drift down the track and wrap around at the far end.
    p.z = uZMin + mod(position.z - uZMin - uTime * speed, uZLen);
    p.x += sin(uTime * 0.3 + aSeed * 20.0) * 0.15;
    p.y += cos(uTime * 0.25 + aSeed * 31.0) * 0.15;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = -mv.z;
    gl_PointSize = clamp(uPR * (0.6 + aSeed * 1.2) * (20.0 / max(dist, 0.5)), 1.0, 26.0 * uPR);

    // Fade very close points (no giant flares) and very distant ones.
    vAlpha = smoothstep(0.8, 3.2, dist) * (1.0 - smoothstep(55.0, 95.0, dist)) * (0.3 + 0.7 * aSeed);
    vColor = mix(vec3(0.0, 0.94, 1.0), vec3(0.62, 0.36, 0.98), aMix);
    gl_Position = projectionMatrix * mv;
  }
`

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, a * a * vAlpha);
    #include <colorspace_fragment>
  }
`

interface Props {
  count: number
  animate: boolean
}

/** Ambient field of data packets streaming along the whole flight path, animated on the GPU. */
export function DataStream({ count, animate }: Props) {
  const mat = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => {
    const rnd = mulberry32(21)
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    const mix = new Float32Array(count)
    const len = STREAM_Z_NEAR - STREAM_Z_FAR
    for (let i = 0; i < count; i++) {
      const r = 1.5 + Math.pow(rnd(), 1.6) * 9.5
      const a = rnd() * Math.PI * 2
      pos[i * 3] = Math.cos(a) * r
      pos[i * 3 + 1] = Math.sin(a) * r * 0.7
      pos[i * 3 + 2] = STREAM_Z_FAR + rnd() * len
      seed[i] = rnd()
      mix[i] = rnd() > 0.72 ? 1 : 0
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.setAttribute('aMix', new THREE.BufferAttribute(mix, 1))
    return g
  }, [count])

  useEffect(() => () => geometry.dispose(), [geometry])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uZMin: { value: STREAM_Z_FAR },
      uZLen: { value: STREAM_Z_NEAR - STREAM_Z_FAR },
      uPR: { value: 1 },
    }),
    [],
  )

  useFrame(({ clock, gl }) => {
    if (!mat.current) return
    mat.current.uniforms.uPR.value = gl.getPixelRatio()
    if (animate) mat.current.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
