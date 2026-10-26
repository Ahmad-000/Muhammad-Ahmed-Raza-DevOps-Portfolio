import { clamp01, smoothstep } from './scrollStore'

/**
 * Timeline of the identity card against the progress of its scroll section.
 *
 * p = 0 when the section's top reaches the top of the viewport (the hero is
 * fully gone), p = 1 when its bottom reaches the bottom of the viewport (the
 * next section is about to appear). The card is fully gone before p = 1, so it
 * never overlaps the Tech Stack heading.
 *
 *   0 ............ 0.30 ................ 0.72 ............ 1
 *   fly in + settle   hold: stable, readable     fly out
 */
export const ENTER_END = 0.3
export const EXIT_START = 0.72

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInCubic = (t: number) => t * t * t

export interface Phase {
  /** 0 = invisible, 1 = fully visible. */
  alpha: number
  /** Eased 0 -> 1 while flying in. Stays at 1 afterwards. */
  enter: number
  /** Eased 0 -> 1 while flying out. */
  exit: number
  /** 0 -> 1 across the hold, for a slow drift that keeps it alive. */
  hold: number
  /** 0 -> 1 progress of the one-off light sweep across the glass. */
  sweep: number
}

export function phaseAt(p: number): Phase {
  return {
    alpha: smoothstep(0, 0.16, p) * (1 - smoothstep(0.8, 0.97, p)),
    enter: easeOutCubic(clamp01(p / ENTER_END)),
    exit: easeInCubic(clamp01((p - EXIT_START) / (1 - EXIT_START))),
    hold: clamp01((p - ENTER_END) / (EXIT_START - ENTER_END)),
    sweep: clamp01((p - 0.14) / 0.2),
  }
}
