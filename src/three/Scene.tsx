import { useThree } from '@react-three/fiber'
import { CameraRig } from './CameraRig'
import { ClusterSphere } from './ClusterSphere'
import { DataPacket } from './DataPacket'
import { DataStream } from './DataStream'
import { HoloGrid } from './HoloGrid'
import { PipelineGates } from './PipelineGates'
import { ServerRacks } from './ServerRacks'
import { FINAL_CENTER } from './constants'
import { COLORS } from './theme'
import type { Tier } from '../hooks/useEffects'

interface Props {
  tier: Tier
  reduced: boolean
}

export function Scene({ tier, reduced }: Props) {
  const aspect = useThree((s) => s.size.width / s.size.height)
  const high = tier === 'high'
  const animate = !reduced
  const portrait = aspect < 1

  // Wide screens: cluster on the right so it sits beside the hero copy.
  // Portrait: cluster above the copy.
  const heroPosition: [number, number, number] = portrait ? [0, 3.1, 0] : [2.7, 0, 0]

  return (
    <>
      <color attach="background" args={[COLORS.bg]} />
      <fogExp2 attach="fog" args={[COLORS.bg, 0.011]} />

      <CameraRig reduced={reduced} />
      <DataStream count={high ? 2400 : 1000} animate={animate} />

      <ClusterSphere
        position={heroPosition}
        scale={portrait ? 0.72 : 1}
        nodeCount={high ? 72 : 44}
        packetCount={high ? 40 : 20}
        interactive={!portrait}
        animate={animate}
        seed={7}
      />

      {/* The rest of the flight path is only built when motion is on. */}
      {animate && (
        <>
          <ServerRacks animate />
          <PipelineGates animate />
          <HoloGrid animate />
          <ClusterSphere
            position={[FINAL_CENTER.x, FINAL_CENTER.y, FINAL_CENTER.z]}
            radius={1.9}
            nodeCount={high ? 52 : 34}
            packetCount={high ? 28 : 14}
            seed={19}
          />
          <DataPacket />
        </>
      )}
    </>
  )
}
