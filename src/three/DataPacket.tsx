import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { curve } from './constants'
import { COLORS } from './theme'
import { scrollStore, smoothstep } from '../lib/scrollStore'

const TRAIL = 30

const vertex = /* glsl */ `
  attribute float aAge;
  uniform float uPR;
  varying float vAge;
  void main() {
    vAge = aAge;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uPR * mix(20.0, 2.0, aAge) / max(-mv.z * 0.3, 0.8);
    gl_Position = projectionMatrix * mv;
  }
`

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uFade;
  varying float vAge;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * pow(1.0 - vAge, 2.0) * uFade;
    gl_FragColor = vec4(uColor, a);
    #include <colorspace_fragment>
  }
`

/**
 * The "data packet" the camera appears to chase. It rides a little ahead of
 * the camera on the same spline and leaves a short fading trail.
 */
export function DataPacket() {
  const head = useRef<THREE.Group>(null)
  const mat = useRef<THREE.ShaderMaterial>(null)

  const trail = useMemo(() => {
    const positions = new Float32Array(TRAIL * 3)
    const age = new Float32Array(TRAIL)
    for (let i = 0; i < TRAIL; i++) age[i] = i / (TRAIL - 1)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aAge', new THREE.BufferAttribute(age, 1))
    return { g, positions }
  }, [])

  useEffect(() => () => trail.g.dispose(), [trail])

  const uniforms = useMemo(
    () => ({ uPR: { value: 1 }, uColor: { value: new THREE.Color(COLORS.cyan) }, uFade: { value: 1 } }),
    [],
  )
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const primed = useRef(false)

  useFrame(({ clock, gl }) => {
    const u = scrollStore.u
    const fade = smoothstep(0.012, 0.05, u) // hidden at the very top of the page
    curve.getPoint(Math.min(u + 0.03, 1), tmp)
    tmp.x += 0.95
    tmp.y += -0.5 + Math.sin(clock.elapsedTime * 2.2) * 0.05

    head.current?.position.copy(tmp)
    head.current?.scale.setScalar(fade)

    const p = trail.positions
    if (!primed.current) {
      for (let i = 0; i < TRAIL; i++) tmp.toArray(p, i * 3)
      primed.current = true
    }
    p.copyWithin(3, 0, (TRAIL - 1) * 3)
    tmp.toArray(p, 0)
    trail.g.attributes.position.needsUpdate = true

    if (mat.current) {
      mat.current.uniforms.uPR.value = gl.getPixelRatio()
      mat.current.uniforms.uFade.value = fade
    }
  })

  return (
    <>
      <group ref={head}>
        <mesh>
          <icosahedronGeometry args={[0.1, 1]} />
          <meshBasicMaterial color="#e9feff" toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshBasicMaterial
            color={COLORS.cyan}
            transparent
            opacity={0.22}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>
      <points geometry={trail.g} frustumCulled={false}>
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
    </>
  )
}
