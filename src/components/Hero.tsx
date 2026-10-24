import { useEffect, useState } from 'react'
import { motion, stagger, type Variants } from 'motion/react'
import { profile } from '../data/profile'

const container: Variants = {
  hidden: {},
  show: { transition: { delayChildren: stagger(0.12) } },
}
const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

/** Floating readouts beside the cluster. Purely decorative, so hidden from assistive tech. */
function Telemetry() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 2600)
    return () => window.clearInterval(id)
  }, [])

  const items = [
    { label: 'Pods ready', value: '128 / 128', pos: 'left-[54%] top-[26%]' },
    { label: 'p99 latency', value: `${38 + ((tick * 7) % 9)} ms`, pos: 'left-[80%] top-[58%]' },
    { label: 'Deploys today', value: `${14 + (Math.floor(tick / 3) % 4)}`, pos: 'left-[55%] top-[66%]' },
  ]

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      {items.map((it) => (
        <div key={it.label} className={`glass edge absolute rounded-xl px-4 py-2.5 ${it.pos}`}>
          <div className="text-xs text-slate-mute">{it.label}</div>
          <div className="font-mono text-base font-medium text-cyan-neon tabular-nums">{it.value}</div>
        </div>
      ))}
    </div>
  )
}

export function Hero() {
  return (
    <section
      id="hero"
      data-station="0"
      aria-labelledby="hero-title"
      className="relative flex min-h-svh items-end overflow-hidden lg:items-center"
    >
      {/* Keeps the headline legible over the 3D scene without dimming the cluster.
          Wide screens: copy on the left, cluster on the right. Narrow screens: cluster on top, copy below. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            'linear-gradient(90deg, rgba(13,17,23,0.86) 0%, rgba(13,17,23,0.55) 38%, transparent 66%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 lg:hidden"
        style={{
          background:
            'linear-gradient(180deg, transparent 22%, rgba(13,17,23,0.82) 40%, rgba(13,17,23,0.9) 100%)',
        }}
      />
      <Telemetry />

      <div className="relative mx-auto w-full max-w-7xl px-6 pt-[38svh] pb-14 md:px-10 lg:pt-28 lg:pb-24">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl">
          <motion.p
            variants={rise}
            className="glass edge inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-sm text-ink"
          >
            <span className="led" aria-hidden="true" />
            {profile.availability}
          </motion.p>

          {/* Weight and width step down line by line: heavy and wide at the top, light and narrow at the bottom. */}

          <h1 id="hero-title" className="mt-7 leading-[0.98] tracking-tight text-ink">
            <motion.span
              variants={rise}
              className="block text-[clamp(1.9rem,5.1vw,4.5rem)] font-extrabold"
              style={{ fontStretch: '100%' }}
            >
              Cloud & AWS.
            </motion.span>

            <motion.span
              variants={rise}
              className="block text-[clamp(1.9rem,5.1vw,4.5rem)] font-semibold"
              style={{ fontStretch: '88%' }}
            >
              Docker & CI/CD.
            </motion.span>

            <motion.span
              variants={rise}
              className="block text-[clamp(1.9rem,5.1vw,4.5rem)] font-light text-[#c5d0df]"
              style={{ fontStretch: '76%' }}
            >
              DevOps Automation.
              <span
                aria-hidden="true"
                className="animate-blink ml-2 inline-block h-[0.8em] w-[0.12em] translate-y-[0.1em] bg-cyan-neon shadow-[0_0_14px_var(--color-cyan-neon)]"
              />
            </motion.span>
          </h1>


          <motion.p variants={rise} className="mt-5 max-w-xl text-base leading-relaxed text-[#aab7c9] sm:mt-7 sm:text-lg">
            {profile.intro}
          </motion.p>

          <motion.div variants={rise} className="mt-7 flex flex-wrap gap-3 sm:mt-9 sm:gap-4">
            <a href="#projects" className="btn btn-primary max-sm:px-3.5 max-sm:text-sm">
              Explore Architecture
            </a>
            <a href={profile.resume} download className="btn btn-ghost max-sm:px-3.5 max-sm:text-sm">
              Download Resume
            </a>
          </motion.div>

          <motion.dl variants={rise} className="mt-8 grid max-w-xl grid-cols-3 gap-3 sm:mt-12 sm:gap-6">
            {profile.heroStats.map((s) => (
              <div key={s.label} className="border-l border-slate-line pl-3 sm:pl-4">
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-2xl font-bold tracking-tight text-ink tabular-nums sm:text-3xl">{s.value}</dd>
                <p aria-hidden="true" className="mt-1 text-sm leading-snug text-slate-mute">
                  {s.label}
                </p>
              </div>
            ))}
          </motion.dl>
        </motion.div>
      </div>

      <a
        href="#stack"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-sm text-slate-mute transition-colors hover:text-ink md:flex"
      >
        Scroll to fly through the stack
        <span aria-hidden="true" className="animate-drift block h-6 w-px bg-linear-to-b from-cyan-neon to-transparent" />
      </a>
    </section>
  )
}
