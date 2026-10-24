import { useRef, type PointerEvent, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useEffects } from '../hooks/useEffects'

interface Props {
  children: ReactNode
  className?: string
  /** Subtle 3D tilt that follows the cursor. Off for touch and reduced motion. */
  tilt?: boolean
  id?: string
}

/**
 * Glass surface with a neon hairline edge and a cursor-following spotlight.
 * The spotlight position is written straight to CSS variables, so moving the
 * pointer never re-renders React.
 */
export function GlassPanel({ children, className = '', tilt = false, id }: Props) {
  const { reduced } = useEffects()
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 170, damping: 20 })
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), { stiffness: 170, damping: 20 })

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    ref.current.style.setProperty('--mx', `${px * 100}%`)
    ref.current.style.setProperty('--my', `${py * 100}%`)
    if (tilt && !reduced) {
      mx.set(px - 0.5)
      my.set(py - 0.5)
    }
  }
  const onLeave = () => {
    mx.set(0)
    my.set(0)
  }

  const useTilt = tilt && !reduced
  return (
    <motion.div
      id={id}
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={useTilt ? { rotateX, rotateY, transformPerspective: 1100 } : undefined}
      whileHover={useTilt ? { y: -4 } : undefined}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`glass edge spot ${className}`}
    >
      {children}
    </motion.div>
  )
}
