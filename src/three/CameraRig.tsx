import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { FINAL_CENTER, HERO_CENTER, curve } from './constants'
import { progressToPath, scrollStore, smoothstep } from '../lib/scrollStore'

/**
 * Drives the camera along the spline from page scroll. The hero looks at the
 * cluster, travel looks down the track, and the last stretch swings around to
 * face the reformed cluster behind the contact section.
 */
export function CameraRig({ reduced }: { reduced: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const aspect = useThree((s) => s.size.width / s.size.height)

  const v = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      ahead: new THREE.Vector3(),
      look: new THREE.Vector3(),
      finalLook: new THREE.Vector3(),
      par: { x: 0, y: 0 },
    }),
    [],
  )

  // Portrait screens need a wider field of view to keep the cluster in frame.
  useEffect(() => {
    camera.fov = aspect < 1 ? 72 : 55
    camera.updateProjectionMatrix()
  }, [camera, aspect])

  useFrame((_, dt) => {
    const target = reduced ? 0 : progressToPath(scrollStore.progress)
    scrollStore.u = reduced ? 0 : THREE.MathUtils.damp(scrollStore.u, target, 3.4, dt)
    const u = scrollStore.u

    curve.getPoint(u, v.pos)
    curve.getPoint(Math.min(u + 0.03, 1), v.ahead)

    const px = reduced ? 0 : scrollStore.pointer.x
    const py = reduced ? 0 : scrollStore.pointer.y
    v.par.x = THREE.MathUtils.damp(v.par.x, px, 2.2, dt)
    v.par.y = THREE.MathUtils.damp(v.par.y, py, 2.2, dt)

    camera.position.set(v.pos.x + v.par.x * 0.45, v.pos.y + v.par.y * 0.25, v.pos.z)

    v.look.lerpVectors(HERO_CENTER, v.ahead, smoothstep(0, 0.07, u))
    // Aim slightly off the final cluster so it lands to the right of the contact copy
    // on wide screens, and above it on portrait screens.
    v.finalLook.set(
      FINAL_CENTER.x + (aspect < 1 ? 0 : -3.1),
      FINAL_CENTER.y + (aspect < 1 ? -3.7 : 0),
      FINAL_CENTER.z,
    )
    v.look.lerp(v.finalLook, smoothstep(0.86, 1, u))
    camera.lookAt(v.look)
  })

  return null
}
