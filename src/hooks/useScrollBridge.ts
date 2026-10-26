import { useEffect } from 'react'
import { STATION_COUNT, clamp01, scrollStore } from '../lib/scrollStore'

/**
 * Feeds scroll progress, pointer position and section positions into the
 * shared store that the 3D camera rig reads every frame.
 */
export function useScrollBridge() {
  useEffect(() => {
    const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight)

    // The identity card's scroll section: cached on measure so scrolling never reads layout.
    let idTop = 0
    let idSpan = 0

    const onScroll = () => {
      scrollStore.progress = clamp01(window.scrollY / maxScroll())
      scrollStore.identity = idSpan > 1 ? clamp01((window.scrollY - idTop) / idSpan) : 0
    }

    const measureIdentity = () => {
      const el = document.querySelector<HTMLElement>('[data-identity]')
      if (!el) {
        idSpan = 0
        return
      }
      const r = el.getBoundingClientRect()
      idTop = r.top + window.scrollY
      idSpan = r.height - window.innerHeight
    }

    const measure = () => {
      measureIdentity()
      const vh = window.innerHeight
      const els = Array.from(document.querySelectorAll<HTMLElement>('[data-station]')).sort(
        (a, b) => Number(a.dataset.station) - Number(b.dataset.station),
      )
      if (els.length !== STATION_COUNT) return

      const max = maxScroll()
      const stops = els.map((el) => {
        const r = el.getBoundingClientRect()
        const centre = r.top + window.scrollY + r.height / 2
        return clamp01((centre - vh / 2) / max)
      })

      // The first station is the top of the page. The last is wherever the contact
      // banner is centred, so the camera arrives and holds there while the form and
      // footer scroll past. The sequence must strictly increase so the path mapping
      // never divides by zero.
      const gap = 0.01
      stops[0] = 0
      for (let i = 1; i < stops.length; i++) {
        stops[i] = Math.min(Math.max(stops[i], stops[i - 1] + gap), 1 - gap * (stops.length - 1 - i))
      }
      scrollStore.stops = stops
      onScroll()
    }

    const onPointer = (e: PointerEvent) => {
      scrollStore.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      scrollStore.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
      scrollStore.pointer.active = true
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    window.addEventListener('load', measure)
    window.addEventListener('pointermove', onPointer, { passive: true })

    const ro = new ResizeObserver(measure)
    ro.observe(document.body)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
      window.removeEventListener('load', measure)
      window.removeEventListener('pointermove', onPointer)
      ro.disconnect()
    }
  }, [])
}
