/**
 * Shared state between the identity card's HTML and its 3D hologram.
 *
 * The card is real HTML (crisp text, working links). While the 3D scene is
 * running, the hologram pins that HTML to a pose in the scene every frame and
 * draws the glass behind it. The render loop must not trigger React renders, so
 * the two halves find each other through this plain module instead.
 */

/** Card widths below this use the compact layout. Keep in sync with the @container query in identity.css. */
export const COMPACT_BELOW = 600

export const identityDom = {
  /** Fixed full-viewport layer that holds the card while it is pinned in 3D. */
  layer: null as HTMLElement | null,
  /** The element the hologram transforms. */
  card: null as HTMLElement | null,
  /** Layout size of the card in CSS px. Unaffected by the 3D transform. */
  width: 0,
  height: 0,
}

let staged = false
const listeners = new Set<() => void>()

/**
 * "Staged" means the 3D scene is running and has taken over the card. While it
 * is false (reduced motion, no WebGL, scene crashed) the card is a normal
 * in-flow element, so the content is never lost.
 */
export const identityStage = {
  get: () => staged,
  set(next: boolean) {
    if (next === staged) return
    staged = next
    listeners.forEach((fn) => fn())
  },
  subscribe(fn: () => void) {
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
    }
  },
}
