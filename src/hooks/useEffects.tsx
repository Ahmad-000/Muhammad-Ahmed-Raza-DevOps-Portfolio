import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Tier = 'high' | 'low'

interface EffectsValue {
  /** Device capability bucket, used to scale 3D detail and blur. */
  tier: Tier
  /** True when motion should be minimised (OS setting or the nav toggle). */
  reduced: boolean
  /** False when the browser cannot create a WebGL context. */
  webgl: boolean
  toggleMotion: () => void
}

const STORAGE_KEY = 'portfolio:motion'
const Ctx = createContext<EffectsValue | null>(null)

function detectTier(): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4
  const lowMemory = (nav.deviceMemory ?? 8) <= 4
  const phone = window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 820
  return fewCores || lowMemory || phone ? 'low' : 'high'
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

function readPref(): 'on' | 'off' | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'on' || v === 'off' ? v : null
  } catch {
    return null
  }
}

export function EffectsProvider({ children }: { children: ReactNode }) {
  const [tier] = useState<Tier>(detectTier)
  const [webgl] = useState<boolean>(detectWebGL)
  const [system, setSystem] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [pref, setPref] = useState<'on' | 'off' | null>(readPref)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setSystem(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // An explicit choice from the nav toggle beats the OS setting.
  const reduced = pref ? pref === 'off' : system

  useEffect(() => {
    document.documentElement.dataset.perf = tier
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full'
  }, [tier, reduced])

  const toggleMotion = useCallback(() => {
    const next = reduced ? 'on' : 'off'
    setPref(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* storage can be blocked; the toggle still works for this visit */
    }
  }, [reduced])

  const value = useMemo(() => ({ tier, reduced, webgl, toggleMotion }), [tier, reduced, webgl, toggleMotion])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useEffects(): EffectsValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useEffects must be used inside <EffectsProvider>')
  return v
}
