/**
 * Plain module-level store shared between the DOM tree and the R3F canvas.
 * React context does not cross the react-three-fiber reconciler, and we want
 * the render loop to read scroll and pointer without triggering React renders.
 */
export const STATION_COUNT = 5

export const scrollStore = {
  /** 0..1 raw page scroll. */
  progress: 0,
  /** Scroll progress at which each station (page section) is centred. */
  stops: [0, 0.25, 0.5, 0.75, 1] as number[],
  /** Pointer in normalised device coordinates (-1..1). */
  pointer: { x: 0, y: 0, active: false },
  /** Smoothed position along the camera path (0..1), written by CameraRig. */
  u: 0,
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/**
 * Maps raw scroll to a position on the camera path so that each page section
 * lines up with its 3D station, however tall the sections actually are.
 */
export function progressToPath(p: number): number {
  const { stops } = scrollStore
  const last = stops.length - 1
  if (p <= stops[0]) return 0
  if (p >= stops[last]) return 1
  for (let i = 0; i < last; i++) {
    if (p <= stops[i + 1]) {
      const span = stops[i + 1] - stops[i] || 1e-4
      return (i + (p - stops[i]) / span) / last
    }
  }
  return 1
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}
