import * as THREE from 'three'

/**
 * The camera flies along this spline. Even-indexed points are the five
 * "stations" (hero, racks, pipeline, terminal grid, contact). Odd points are
 * gentle S-bends between them, so station k sits at u = k / 4 exactly.
 */
const PATH_POINTS: [number, number, number][] = [
  [0, 0.4, 9], // 0 hero
  [-1.5, 0.8, -6],
  [0, 1.0, -22], // 1 server racks
  [1.2, 0.6, -36],
  [0, 0.0, -50], // 2 pipeline gates
  [-0.8, 1.0, -66],
  [0, 2.0, -80], // 3 holo grid + terminal panels
  [0.5, 1.2, -88],
  [0, 0.4, -96], // 4 contact, facing the reformed cluster
]

export const curve = new THREE.CatmullRomCurve3(
  PATH_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  'catmullrom',
  0.5,
)

export const HERO_CENTER = new THREE.Vector3(0, 0, 0)
export const FINAL_CENTER = new THREE.Vector3(0, 0, -106)

/** World-space z range the ambient particle stream covers. */
export const STREAM_Z_NEAR = 16
export const STREAM_Z_FAR = -118
