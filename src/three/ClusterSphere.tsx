import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { FresnelSphere } from './Fresnel'
import { COLORS } from './theme'
import { mulberry32 } from './utils'
import { scrollStore } from '../lib/scrollStore'

interface Props {
  radius?: number
  nodeCount?: number
  packetCount?: number
  position?: [number, number, number]
  scale?: number
  /** Nodes near the cursor light up. Only meaningful while the cluster is on screen. */
  interactive?: boolean
  animate?: boolean
  seed?: number
}

interface PacketState {
  edge: number
  t: number
  speed: number
  dir: 1 | -1
}

function buildCluster(count: number, radius: number, seed: number) {
  const rnd = mulberry32(seed)
  const pts: THREE.Vector3[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))

  // Fibonacci sphere, with a little radial jitter so it reads as a cluster
  // of machines rather than a perfect mesh.
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const th = golden * i
    const rad = radius * (0.9 + rnd() * 0.2)
    pts.push(new THREE.Vector3(Math.cos(th) * r * rad, y * rad, Math.sin(th) * r * rad))
  }

  // Link each node to its three nearest neighbours.
  const seen = new Set<string>()
  const edges: [number, number][] = []
  for (let i = 0; i < count; i++) {
    const order = pts
      .map((p, j) => ({ j, d: j === i ? Infinity : p.distanceToSquared(pts[i]) }))
      .sort((a, b) => a.d - b.d)
    for (let k = 0; k < 3; k++) {
      const a = Math.min(i, order[k].j)
      const b = Math.max(i, order[k].j)
      const key = `${a}-${b}`
      if (!seen.has(key)) {
        seen.add(key)
        edges.push([a, b])
      }
    }
  }

  const linePositions = new Float32Array(edges.length * 6)
  edges.forEach(([a, b], i) => {
    pts[a].toArray(linePositions, i * 6)
    pts[b].toArray(linePositions, i * 6 + 3)
  })

  return {
    pts,
    edges,
    linePositions,
    base: pts.map(() => 0.05 + rnd() * 0.06),
    phase: pts.map(() => rnd() * Math.PI * 2),
    speed: pts.map(() => 0.8 + rnd() * 1.6),
  }
}

/** A glowing sphere of interconnected nodes with data packets running along the links. */
export function ClusterSphere({
  radius = 2.2,
  nodeCount = 72,
  packetCount = 36,
  position = [0, 0, 0],
  scale = 1,
  interactive = false,
  animate = true,
  seed = 7,
}: Props) {
  const group = useRef<THREE.Group>(null)
  const ringA = useRef<THREE.Mesh>(null)
  const ringB = useRef<THREE.Mesh>(null)
  const nodes = useRef<THREE.InstancedMesh>(null)
  const halos = useRef<THREE.InstancedMesh>(null)
  const packets = useRef<THREE.InstancedMesh>(null)

  const c = useMemo(() => buildCluster(nodeCount, radius, seed), [nodeCount, radius, seed])

  const work = useMemo(
    () => ({
      hl: new Float32Array(nodeCount),
      pk: Array.from(
        { length: packetCount },
        (_, i): PacketState => ({
          edge: (i * 7) % c.edges.length,
          t: (i * 0.137) % 1,
          speed: 0.25 + ((i * 37) % 10) / 25,
          dir: i % 2 ? 1 : -1,
        }),
      ),
      tmp: new THREE.Object3D(),
      v: new THREE.Vector3(),
      col: new THREE.Color(),
      cyan: new THREE.Color(COLORS.cyan),
      purple: new THREE.Color(COLORS.purpleGlow),
      white: new THREE.Color('#ffffff'),
    }),
    [nodeCount, packetCount, c.edges.length],
  )

  // Packet colours never change, so set them once.
  useEffect(() => {
    const mesh = packets.current
    if (!mesh) return
    for (let i = 0; i < packetCount; i++) {
      mesh.setColorAt(i, i % 3 === 0 ? work.purple : work.white)
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [packetCount, work])

  useFrame(({ clock, camera, size }, dt) => {
    const g = group.current
    const nodeMesh = nodes.current
    const haloMesh = halos.current
    const packetMesh = packets.current
    if (!g || !nodeMesh || !haloMesh || !packetMesh) return

    const t = animate ? clock.elapsedTime : 0
    const { tmp, v, col, hl } = work

    if (animate) {
      g.rotation.y += dt * 0.09
      const tiltTarget = interactive ? scrollStore.pointer.y * -0.22 : 0
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tiltTarget, 2, dt)
      if (ringA.current) ringA.current.rotation.z += dt * 0.35
      if (ringB.current) ringB.current.rotation.z -= dt * 0.22
    }
    g.updateMatrixWorld()

    const aspect = size.width / size.height
    const hover = interactive && animate && scrollStore.pointer.active && scrollStore.progress < 0.12

    for (let i = 0; i < nodeCount; i++) {
      let target = 0
      if (hover) {
        v.copy(c.pts[i]).applyMatrix4(g.matrixWorld).project(camera)
        const dx = (v.x - scrollStore.pointer.x) * aspect
        const dy = v.y - scrollStore.pointer.y
        target = Math.max(0, 1 - Math.hypot(dx, dy) / 0.3)
      }
      hl[i] = THREE.MathUtils.damp(hl[i], target, 9, dt)

      const pulse = 1 + 0.28 * Math.sin(t * c.speed[i] + c.phase[i])
      const s = c.base[i] * pulse * (1 + hl[i] * 1.7)

      tmp.position.copy(c.pts[i])
      tmp.scale.setScalar(s)
      tmp.updateMatrix()
      nodeMesh.setMatrixAt(i, tmp.matrix)

      tmp.scale.setScalar(s * 3.4 * (1 + hl[i]))
      tmp.updateMatrix()
      haloMesh.setMatrixAt(i, tmp.matrix)

      col.copy(i % 4 === 0 ? work.purple : work.cyan).lerp(work.white, hl[i])
      nodeMesh.setColorAt(i, col)
      haloMesh.setColorAt(i, col)
    }
    nodeMesh.instanceMatrix.needsUpdate = true
    haloMesh.instanceMatrix.needsUpdate = true
    if (nodeMesh.instanceColor) nodeMesh.instanceColor.needsUpdate = true
    if (haloMesh.instanceColor) haloMesh.instanceColor.needsUpdate = true

    for (let i = 0; i < work.pk.length; i++) {
      const p = work.pk[i]
      if (animate) p.t += dt * p.speed
      if (p.t > 1) {
        p.t = 0
        p.edge = (p.edge * 7 + 13) % c.edges.length
      }
      const [a, b] = c.edges[p.edge]
      tmp.position.lerpVectors(c.pts[a], c.pts[b], p.dir > 0 ? p.t : 1 - p.t)
      tmp.scale.setScalar(i % 3 === 0 ? 0.05 : 0.042)
      tmp.updateMatrix()
      packetMesh.setMatrixAt(i, tmp.matrix)
    }
    packetMesh.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={position} scale={scale}>
      <group ref={group}>
        {/* link lines */}
        <lineSegments frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[c.linePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            color={COLORS.cyan}
            transparent
            opacity={0.26}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </lineSegments>

        {/* nodes, their halos, and travelling packets */}
        <instancedMesh ref={nodes} args={[undefined, undefined, nodeCount]} frustumCulled={false}>
          <sphereGeometry args={[1, 14, 14]} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
        <instancedMesh ref={halos} args={[undefined, undefined, nodeCount]} frustumCulled={false}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshBasicMaterial
            transparent
            opacity={0.13}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </instancedMesh>
        <instancedMesh ref={packets} args={[undefined, undefined, packetCount]} frustumCulled={false}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>

        {/* faint faceted shell */}
        <mesh>
          <icosahedronGeometry args={[radius * 0.97, 2]} />
          <meshBasicMaterial
            color={COLORS.purple}
            wireframe
            transparent
            opacity={0.17}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        {/* energy shell + core */}
        <FresnelSphere radius={radius * 1.04} color={COLORS.cyan} power={2.8} intensity={1.15} animate={animate} />
        <FresnelSphere radius={radius * 0.34} color={COLORS.purpleGlow} power={1.6} intensity={1.5} animate={animate} />
        <mesh>
          <icosahedronGeometry args={[radius * 0.12, 1]} />
          <meshBasicMaterial color="#d8fbff" toneMapped={false} />
        </mesh>
      </group>

      {/* orbit rings with a pod riding each one */}
      <mesh ref={ringA} rotation={[1.2, 0.2, 0.4]}>
        <torusGeometry args={[radius * 1.32, 0.007, 6, 180]} />
        <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.5} toneMapped={false} />
        <mesh position={[radius * 1.32, 0, 0]}>
          <boxGeometry args={[0.16, 0.16, 0.16]} />
          <meshBasicMaterial color={COLORS.cyan} toneMapped={false} />
        </mesh>
      </mesh>
      <mesh ref={ringB} rotation={[0.5, 0.9, -0.3]}>
        <torusGeometry args={[radius * 1.5, 0.006, 6, 180]} />
        <meshBasicMaterial color={COLORS.purpleGlow} transparent opacity={0.4} toneMapped={false} />
        <mesh position={[-radius * 1.5, 0, 0]}>
          <octahedronGeometry args={[0.12, 0]} />
          <meshBasicMaterial color={COLORS.purpleGlow} toneMapped={false} />
        </mesh>
      </mesh>
    </group>
  )
}
