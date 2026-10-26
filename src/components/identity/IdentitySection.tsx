import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { identitySummary } from '../../data/identity'
import { identityDom, identityStage } from '../../lib/identityStore'
import { IdentityCard } from './IdentityCard'

/**
 * Card width in CSS px while it is pinned in 3D. Wide enough to read on desktop,
 * and on phones almost the full width. Capped by height so short landscape
 * screens never get a card taller than the viewport.
 */
function pinnedWidth(vw: number, vh: number) {
  const w = vw < 640 ? vw - 32 : Math.min(760, Math.max(600, vw * 0.62))
  const byHeight = w >= 600 ? vh * 1.2 : vh * 0.9
  return Math.round(Math.max(280, Math.min(w, byHeight)))
}

/**
 * The scroll stretch between the hero and the Tech Stack where the identity card
 * floats through the scene.
 *
 * - 3D running ("staged"): the section is tall, and the card sits in a fixed layer
 *   that the hologram (src/three/IdentityHologram.tsx) positions every frame.
 * - Otherwise (reduced motion, no WebGL, scene failed): an ordinary card in the page
 *   flow, so the content is always there.
 */
export function IdentitySection() {
  const staged = useSyncExternalStore(identityStage.subscribe, identityStage.get, () => false)
  const layerRef = useRef<HTMLDivElement>(null)
  const poseRef = useRef<HTMLDivElement>(null)

  // Height is bucketed so a phone's collapsing address bar doesn't resize the card mid-scroll.
  const [view, setView] = useState(() => ({ w: window.innerWidth, h: Math.round(window.innerHeight / 80) * 80 }))
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth
      const h = Math.round(window.innerHeight / 80) * 80
      setView((v) => (v.w === w && v.h === h ? v : { w, h }))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Let the hologram find the card, and keep its measured size current.
  useEffect(() => {
    const layer = layerRef.current
    const pose = poseRef.current
    if (!layer || !pose) return

    identityDom.layer = layer
    identityDom.card = pose
    const measure = () => {
      identityDom.width = pose.offsetWidth
      identityDom.height = pose.offsetHeight
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(pose)

    return () => {
      ro.disconnect()
      identityDom.layer = null
      identityDom.card = null
      identityDom.width = 0
      identityDom.height = 0
    }
  }, [])

  return (
    <section
      id="identity"
      data-identity
      aria-labelledby="identity-title"
      className={staged ? 'relative h-[230svh]' : 'relative py-20 md:py-28'}
    >
      <h2 id="identity-title" className="sr-only">
        Digital identity
      </h2>
      <p className="sr-only">{identitySummary}</p>

      <div ref={layerRef} className={staged ? 'idc-layer' : 'idc-flow'}>
        <div ref={poseRef} className="idc-pose">
          <div className="idc-wrap" style={staged ? { width: pinnedWidth(view.w, view.h) } : undefined}>
            <IdentityCard staged={staged} />
          </div>
        </div>
      </div>
    </section>
  )
}
