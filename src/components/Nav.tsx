import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react'
import { profile, sections } from '../data/profile'
import { useEffects } from '../hooks/useEffects'
import { StatusPing } from './StatusPing'

function Logo() {
  return (
    <a href="#hero" className="flex min-h-11 items-center gap-2.5 font-display text-lg font-bold tracking-tight text-ink">
      <svg viewBox="0 0 64 64" className="size-7" aria-hidden="true">
        <g fill="none" stroke="#00f0ff" strokeWidth="3.5" strokeLinejoin="round">
          <path d="M32 8 52 20v24L32 56 12 44V20z" />
          <path d="M32 8v48M12 20l40 24M52 20 12 44" stroke="#7928ca" opacity=".85" />
        </g>
        <circle cx="32" cy="32" r="5.5" fill="#00f0ff" />
      </svg>
      <span>{profile.handle}</span>
    </a>
  )
}

export function Nav() {
  const { reduced, toggleMotion } = useEffects()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string>('hero')

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 })

  // Highlight the link for whichever section is crossing the middle of the viewport.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-station]'))
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{ scaleX }}
        className="fixed top-0 right-0 left-0 z-50 h-0.5 origin-left bg-cyan-neon shadow-[0_0_12px_var(--color-cyan-neon)]"
      />
      <header className="fixed inset-x-3 top-3 z-40 md:inset-x-6">
        <nav
          aria-label="Primary"
          className="glass edge mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl px-4 md:px-5"
        >
          <Logo />

          <ul className="hidden items-center gap-1 md:flex">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={active === s.id ? 'true' : undefined}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    active === s.id ? 'bg-cyan-neon/10 text-cyan-neon' : 'text-slate-mute hover:text-ink'
                  }`}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <div className="hidden xl:block">
              <StatusPing showLatency={false} />
            </div>
            <button
              type="button"
              onClick={toggleMotion}
              aria-pressed={!reduced}
              title={reduced ? 'Turn 3D motion on' : 'Turn 3D motion off'}
              className="flex items-center gap-2 rounded-lg border border-slate-line px-3 py-1.5 text-sm text-slate-mute transition-colors hover:border-cyan-neon/60 hover:text-ink pointer-coarse:min-h-11"
            >
              <span
                aria-hidden="true"
                className={`size-2 rounded-full ${reduced ? 'bg-slate-line' : 'bg-cyan-neon shadow-[0_0_8px_var(--color-cyan-neon)]'}`}
              />
              Motion {reduced ? 'off' : 'on'}
            </button>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-lg border border-slate-line text-ink md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.ul
              id="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="glass edge mx-auto mt-2 max-w-7xl rounded-2xl p-2 md:hidden"
            >
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-4 py-3 text-base font-medium ${
                      active === s.id ? 'bg-cyan-neon/10 text-cyan-neon' : 'text-ink'
                    }`}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
