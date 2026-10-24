import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { COLORS } from './theme'
import { makeLabelTexture } from './utils'

const STAGES = [
  { z: -42, label: 'build' },
  { z: -47, label: 'test' },
  { z: -53, label: 'scan' },
  { z: -58, label: 'deploy' },
  { z: -63, label: 'observe' },
]

const RING_R = 2.7

/**
 * One pipeline stage. It idles dim, brightens as the camera approaches and
 * turns green once the camera has flown through it.
 */
function Gate({ z, label, animate }: { z: number; label: string; animate: boolean }) {
  const ringMat = useRef<THREE.MeshBasicMaterial>(null)
  const hexMat = useRef<THREE.MeshBasicMaterial>(null)
  const hex = useRef<THREE.Mesh>(null)
  const sprite = useRef<THREE.SpriteMaterial>(null)
  const lit = useRef(0)

  const colors = useMemo(
    () => ({
      dim: new THREE.Color(COLORS.purple),
      near: new THREE.Color(COLORS.cyan),
      done: new THREE.Color(COLORS.ok),
      out: new THREE.Color(),
    }),
    [],
  )
  const texture = useMemo(() => makeLabelTexture(label, COLORS.cyan), [label])
  useEffect(() => () => texture.dispose(), [texture])

  useFrame(({ camera }, dt) => {
    const dz = camera.position.z - z // > 0 until the camera has passed the gate
    const approach = THREE.MathUtils.clamp(1 - Math.abs(dz) / 18, 0, 1)
    lit.current = THREE.MathUtils.damp(lit.current, dz < -0.5 ? 1 : 0, 5, dt)

    colors.out.copy(colors.dim).lerp(colors.near, approach).lerp(colors.done, lit.current)
    if (ringMat.current) {
      ringMat.current.color.copy(colors.out)
      ringMat.current.opacity = 0.3 + 0.6 * approach + 0.1 * lit.current
    }
    if (hexMat.current) {
      hexMat.current.color.copy(colors.out)
      hexMat.current.opacity = 0.2 + 0.5 * approach
    }
    if (hex.current && animate) hex.current.rotation.z += dt * (0.4 + approach * 1.2)
    if (sprite.current) sprite.current.opacity = THREE.MathUtils.clamp(1.4 - Math.abs(dz) / 16, 0, 1)
  })

  return (
    <group position={[0, 0, z]}>
      <mesh>
        <torusGeometry args={[RING_R, 0.05, 10, 120]} />
        <meshBasicMaterial ref={ringMat} transparent toneMapped={false} />
      </mesh>
      <mesh ref={hex}>
        <torusGeometry args={[RING_R * 0.82, 0.025, 6, 6]} />
        <meshBasicMaterial ref={hexMat} transparent toneMapped={false} />
      </mesh>
      <sprite position={[0, RING_R + 0.75, 0]} scale={[2.6, 0.65, 1]}>
        <spriteMaterial ref={sprite} map={texture} transparent depthWrite={false} toneMapped={false} />
      </sprite>
    </group>
  )
}

const CUBES = 16
const SPAN = 30
const TOP_Z = -40

/** Build artifacts drifting down the pipeline and passing through each gate. */
function Artifacts({ animate }: { animate: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const tmp = useMemo(() => new THREE.Object3D(), [])
  const seeds = useMemo(
    () =>
      Array.from({ length: CUBES }, (_, i) => ({
        off: i / CUBES,
        x: Math.cos(i * 2.399) * (0.5 + ((i * 0.37) % 1) * 1.5),
        y: Math.sin(i * 2.399) * (0.5 + ((i * 0.53) % 1) * 1.3),
        speed: 2 + (i % 4) * 0.5,
      })),
    [],
  )

  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    const c = new THREE.Color()
    for (let i = 0; i < CUBES; i++) {
      m.setColorAt(i, c.set(i % 3 === 0 ? COLORS.purpleGlow : COLORS.cyan))
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [])

  useFrame(({ clock }) => {
    const m = mesh.current
    if (!m) return
    const t = animate ? clock.elapsedTime : 0
    for (let i = 0; i < CUBES; i++) {
      const s = seeds[i]
      const z = TOP_Z - (((t * s.speed + s.off * SPAN) % SPAN) + SPAN) % SPAN
      tmp.position.set(s.x, s.y, z)
      tmp.rotation.set(t * 0.8 + i, t * 0.6, 0)
      tmp.scale.setScalar(0.14)
      tmp.updateMatrix()
      m.setMatrixAt(i, tmp.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, CUBES]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

export function PipelineGates({ animate }: { animate: boolean }) {
  return (
    <group>
      {STAGES.map((s) => (
        <Gate key={s.label} z={s.z} label={s.label} animate={animate} />
      ))}
      <Artifacts animate={animate} />
    </group>
  )
}
