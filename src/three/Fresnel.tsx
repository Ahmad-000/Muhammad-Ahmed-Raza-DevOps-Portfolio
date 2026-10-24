import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const vertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), uPower);
    float pulse = 0.86 + 0.14 * sin(uTime * 1.4);
    gl_FragColor = vec4(uColor * uIntensity * pulse, f);
    #include <colorspace_fragment>
  }
`

interface Props {
  radius: number
  color: string
  power?: number
  intensity?: number
  animate?: boolean
}

/** Soft rim-light sphere: gives the cluster its "energy shell" glow without bloom. */
export function FresnelSphere({ radius, color, power = 2.6, intensity = 1.3, animate = true }: Props) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uPower: { value: power },
      uIntensity: { value: intensity },
      uTime: { value: 0 },
    }),
    [color, power, intensity],
  )

  useFrame(({ clock }) => {
    if (mat.current && animate) mat.current.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <mesh>
      <sphereGeometry args={[radius, 48, 48]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
