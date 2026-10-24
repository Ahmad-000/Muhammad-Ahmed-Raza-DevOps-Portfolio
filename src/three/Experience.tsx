import { Component, type ReactNode, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { motion, useScroll, useTransform } from 'motion/react'
import { Scene } from './Scene'
import { StaticBackdrop } from '../components/StaticBackdrop'
import type { Tier } from '../hooks/useEffects'

class Boundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.warn('The 3D scene could not start, showing the static backdrop instead.', error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/**
 * Watches frame time and steps the pixel ratio down if the device can't hold
 * ~42fps. It only ever degrades, so there is no flip-flopping on a busy GPU.
 */
function FrameGovernor() {
  const setDpr = useThree((s) => s.setDpr)
  const acc = useRef({ time: 0, frames: 0, level: 0, warm: 0 })

  useFrame((_, dt) => {
    const a = acc.current
    if (dt > 0.25) return // tab was hidden; ignore the hitch
    a.warm += dt
    if (a.warm < 3) return // skip shader compilation hitches at start-up
    a.time += dt
    a.frames++
    if (a.time >= 2) {
      const avg = a.time / a.frames
      a.time = 0
      a.frames = 0
      if (avg > 1 / 42 && a.level < 2) {
        a.level++
        setDpr(a.level === 1 ? 1.25 : 1)
      }
    }
  })
  return null
}

interface Props {
  tier: Tier
  reduced: boolean
}

/** Fixed full-screen canvas behind the page. Pointer events are handled in the DOM, not here. */
export default function Experience({ tier, reduced }: Props) {
  // With motion off the cluster is a still backdrop. Fade it as the page scrolls so it never
  // competes with content (opacity is safe for reduced-motion visitors).
  const { scrollY } = useScroll()
  const dim = useTransform(scrollY, [0, 520], [1, 0.2])

  return (
    <motion.div style={{ opacity: reduced ? dim : 1 }} className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Boundary fallback={<StaticBackdrop />}>
        <Canvas
          frameloop={reduced ? 'demand' : 'always'}
          dpr={[1, tier === 'high' ? 1.75 : 1.25]}
          camera={{ fov: 55, near: 0.1, far: 220, position: [0, 0.4, 9] }}
          gl={{ antialias: tier === 'high', powerPreference: 'high-performance', stencil: false }}
        >
          <Scene tier={tier} reduced={reduced} />
          {!reduced && <FrameGovernor />}
        </Canvas>
      </Boundary>
    </motion.div>
  )
}
