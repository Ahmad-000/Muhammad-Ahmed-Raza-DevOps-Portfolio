import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { COLORS } from './theme'
import { mulberry32 } from './utils'

const W = 1.5
const H = 4.2
const D = 1.8
const PER_SIDE = 7
const START_Z = -14
const STEP = -3.2
const X = 5.4
const ROWS = 9
const COLS = 2
const ARC_SEGMENTS = 28

interface Rack {
  cx: number
  cy: number
  cz: number
  side: number
}

const quad = (a: number, b: number, c: number, t: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c

/** Two rows of server racks flanking the flight path, linked by overhead cable arcs. */
export function ServerRacks({ animate }: { animate: boolean }) {
  const bodies = useRef<THREE.InstancedMesh>(null)
  const leds = useRef<THREE.InstancedMesh>(null)
  const pods = useRef<THREE.InstancedMesh>(null)

  const racks = useMemo<Rack[]>(() => {
    const out: Rack[] = []
    for (const side of [-1, 1]) {
      for (let i = 0; i < PER_SIDE; i++) out.push({ cx: side * X, cy: 0.9, cz: START_Z + i * STEP, side })
    }
    return out
  }, [])

  const ledCount = racks.length * ROWS * COLS

  const { edgePositions, arcPositions, ledData } = useMemo(() => {
    const rnd = mulberry32(5)

    // One merged line geometry for every rack outline.
    const unit = new THREE.EdgesGeometry(new THREE.BoxGeometry(W, H, D)).attributes.position.array as Float32Array
    const edgePositions = new Float32Array(unit.length * racks.length)
    racks.forEach((r, i) => {
      for (let k = 0; k < unit.length; k += 3) {
        const o = i * unit.length + k
        edgePositions[o] = unit[k] + r.cx
        edgePositions[o + 1] = unit[k + 1] + r.cy
        edgePositions[o + 2] = unit[k + 2] + r.cz
      }
    })

    // One arc of cable across the track per rack pair.
    const arcPositions = new Float32Array(PER_SIDE * ARC_SEGMENTS * 6)
    for (let i = 0; i < PER_SIDE; i++) {
      const z = START_Z + i * STEP
      for (let s = 0; s < ARC_SEGMENTS; s++) {
        const t0 = s / ARC_SEGMENTS
        const t1 = (s + 1) / ARC_SEGMENTS
        const o = (i * ARC_SEGMENTS + s) * 6
        arcPositions.set([quad(-X, 0, X, t0), quad(2.9, 7.2, 2.9, t0), z, quad(-X, 0, X, t1), quad(2.9, 7.2, 2.9, t1), z], o)
      }
    }

    const ledData = {
      phase: Array.from({ length: ledCount }, () => rnd() * 20),
      rate: Array.from({ length: ledCount }, () => 0.6 + rnd() * 2.4),
      thresh: Array.from({ length: ledCount }, () => -0.4 + rnd() * 0.9),
      hue: Array.from({ length: ledCount }, () => Math.floor(rnd() * 3)),
    }
    return { edgePositions, arcPositions, ledData }
  }, [racks, ledCount])

  const palette = useMemo(
    () => [new THREE.Color(COLORS.cyan), new THREE.Color(COLORS.purpleGlow), new THREE.Color(COLORS.ok)],
    [],
  )
  const off = useMemo(() => new THREE.Color('#0f1b2a'), [])
  const tmp = useMemo(() => new THREE.Object3D(), [])
  const frame = useRef(0)

  // Static transforms for rack bodies and LED bars.
  useLayoutEffect(() => {
    const b = bodies.current
    const l = leds.current
    if (!b || !l) return
    racks.forEach((r, i) => {
      tmp.position.set(r.cx, r.cy, r.cz)
      tmp.scale.set(1, 1, 1)
      tmp.updateMatrix()
      b.setMatrixAt(i, tmp.matrix)
      for (let row = 0; row < ROWS; row++) {
        for (let c = 0; c < COLS; c++) {
          const idx = i * ROWS * COLS + row * COLS + c
          tmp.position.set(r.cx - r.side * (W / 2 + 0.012), r.cy - H / 2 + 0.5 + row * 0.4, r.cz + (c ? 0.4 : -0.4))
          tmp.updateMatrix()
          l.setMatrixAt(idx, tmp.matrix)
          l.setColorAt(idx, off)
        }
      }
    })
    b.instanceMatrix.needsUpdate = true
    l.instanceMatrix.needsUpdate = true
    if (l.instanceColor) l.instanceColor.needsUpdate = true
  }, [racks, tmp, off])

  useFrame(({ clock }) => {
    const l = leds.current
    const p = pods.current
    if (!l || !p) return
    const t = animate ? clock.elapsedTime : 0

    // LEDs blink on their own clocks; updating every third frame is plenty.
    frame.current = (frame.current + 1) % 3
    if (frame.current === 0) {
      for (let i = 0; i < ledCount; i++) {
        const on = Math.sin(t * ledData.rate[i] + ledData.phase[i]) > ledData.thresh[i]
        l.setColorAt(i, on ? palette[ledData.hue[i]] : off)
      }
      if (l.instanceColor) l.instanceColor.needsUpdate = true
    }

    // Packets riding the overhead cables, two per arc.
    for (let i = 0; i < PER_SIDE; i++) {
      const z = START_Z + i * STEP
      for (let k = 0; k < 2; k++) {
        const tt = (t * (0.18 + 0.05 * k) + i * 0.17 + k * 0.5) % 1
        tmp.position.set(quad(-X, 0, X, tt), quad(2.9, 7.2, 2.9, tt), z)
        tmp.scale.setScalar(0.09)
        tmp.updateMatrix()
        p.setMatrixAt(i * 2 + k, tmp.matrix)
      }
    }
    p.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={bodies} args={[undefined, undefined, racks.length]} frustumCulled={false}>
        <boxGeometry args={[W, H, D]} />
        <meshBasicMaterial color="#0a111c" />
      </instancedMesh>

      <lineSegments frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[edgePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={COLORS.cyan} transparent opacity={0.32} toneMapped={false} />
      </lineSegments>

      <instancedMesh ref={leds} args={[undefined, undefined, ledCount]} frustumCulled={false}>
        <boxGeometry args={[0.03, 0.07, 0.55]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      <lineSegments frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[arcPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={COLORS.purpleGlow}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>

      <instancedMesh ref={pods} args={[undefined, undefined, PER_SIDE * 2]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>
    </group>
  )
}
