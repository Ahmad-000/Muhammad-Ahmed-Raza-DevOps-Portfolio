import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { categories, type Category, type Level, type Tool } from '../data/skills'
import { useEffects } from '../hooks/useEffects'
import { GlassPanel } from './GlassPanel'
import { SectionHeading } from './SectionHeading'

const levelStyle: Record<Level, string> = {
  Expert: 'text-cyan-neon border-cyan-neon/40',
  Advanced: 'text-purple-glow border-purple-glow/40',
  Proficient: 'text-slate-mute border-slate-line',
}

/** Four-stage run for the selected tool, cycling the way a real pipeline would. */
function PipelineFlow({ stages }: { stages: string[] }) {
  const { reduced } = useEffects()
  const [step, setStep] = useState(reduced ? stages.length : 0)

  useEffect(() => {
    if (reduced) {
      setStep(stages.length)
      return
    }
    setStep(0)
    const id = window.setInterval(() => setStep((s) => (s >= stages.length + 1 ? 0 : s + 1)), 900)
    return () => window.clearInterval(id)
  }, [stages, reduced])

  return (
    <ol className="relative space-y-3" aria-label="Pipeline status">
      <span aria-hidden="true" className="absolute top-3 bottom-3 left-[0.42rem] w-px bg-slate-line" />
      {stages.map((name, i) => {
        const state = i < step ? 'passed' : i === step ? 'running' : 'queued'
        return (
          <li key={name} className="relative flex items-center gap-3 text-sm">
            <span
              aria-hidden="true"
              className={`relative z-10 size-3.5 rounded-full border-2 transition-colors duration-300 ${
                state === 'passed'
                  ? 'border-ok bg-ok shadow-[0_0_10px_var(--color-ok)]'
                  : state === 'running'
                    ? 'border-cyan-neon bg-obsidian shadow-[0_0_12px_var(--color-cyan-neon)]'
                    : 'border-slate-line bg-obsidian'
              }`}
            />
            <span className={state === 'queued' ? 'text-slate-mute' : 'text-ink'}>{name}</span>
            <span
              className={`ml-auto font-mono text-xs ${
                state === 'passed' ? 'text-ok' : state === 'running' ? 'text-cyan-neon' : 'text-slate-mute'
              }`}
            >
              {state}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function Inspector({ tool, category }: { tool: Tool; category: Category }) {
  return (
    <GlassPanel className="rounded-3xl p-6 lg:sticky lg:top-24">
      <div aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tool.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-3xl font-bold tracking-tight">{tool.name}</h3>
                <p className="mt-1 text-sm text-slate-mute">{category.title}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-sm font-medium ${levelStyle[tool.level]}`}>
                {tool.level}
              </span>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-mute">Proficiency</span>
                <span className="font-mono text-ink tabular-nums">{tool.score}/100</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-line/70">
                <motion.div
                  className="h-full origin-left rounded-full bg-cyan-neon shadow-[0_0_12px_var(--color-cyan-neon)]"
                  style={{ originX: 0 }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: tool.score / 100 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <p className="mt-2 text-sm text-slate-mute">{tool.years} years in production</p>
            </div>

            <p className="mt-6 leading-relaxed text-[#c0cbdb]">{tool.uses}</p>

            <div className="mt-6 rounded-xl border border-slate-line bg-void/60 p-4">
              <p className="mb-4 font-mono text-xs break-words text-slate-mute">last run: {tool.lastRun}</p>
              <PipelineFlow stages={category.flow} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </GlassPanel>
  )
}

export function TechStack() {
  const [selected, setSelected] = useState('kubernetes')

  const { tool, category } = useMemo(() => {
    for (const c of categories) {
      const t = c.tools.find((x) => x.id === selected)
      if (t) return { tool: t, category: c }
    }
    return { tool: categories[1].tools[1], category: categories[1] }
  }, [selected])

  return (
    <section id="stack" data-station="1" aria-labelledby="stack-title" className="relative py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading id="stack-title" title="Tools I run in production">
          Hover or focus a tool to see how I use it and what a run of its pipeline looks like.
        </SectionHeading>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_24rem]">
          {/* The patch panel: four columns of tools separated by hairlines, not four separate cards. */}
          <GlassPanel className="rounded-3xl">
            <div className="grid sm:grid-cols-2 sm:[&>*:nth-child(even)]:border-l sm:[&>*:nth-child(n+3)]:border-t [&>*]:border-slate-line">
              {categories.map((c) => (
                <div key={c.id} className="p-5 md:p-6">
                  <h3 className="text-xl font-semibold tracking-tight">{c.title}</h3>
                  <p className="mt-1 mb-4 text-sm text-slate-mute">{c.role}</p>
                  <ul className="space-y-1.5">
                    {c.tools.map((t) => {
                      const on = t.id === selected
                      return (
                        <li key={t.id}>
                          <button
                            type="button"
                            aria-pressed={on}
                            onMouseEnter={() => setSelected(t.id)}
                            onFocus={() => setSelected(t.id)}
                            onClick={() => setSelected(t.id)}
                            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                              on
                                ? 'border-cyan-neon/50 bg-cyan-neon/8'
                                : 'border-transparent hover:border-slate-line hover:bg-white/4'
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`grid size-9 shrink-0 place-items-center rounded-[10px] border font-mono text-[0.8rem] font-semibold transition-all ${
                                on
                                  ? 'border-cyan-neon text-cyan-neon shadow-[0_0_14px_rgba(0,240,255,0.35)]'
                                  : 'border-slate-line text-slate-mute'
                              }`}
                            >
                              {t.glyph}
                            </span>
                            <span className="font-medium text-ink">{t.name}</span>
                            <span className={`ml-auto text-xs ${on ? 'text-cyan-neon' : 'text-slate-mute'}`}>
                              {t.level}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </GlassPanel>

          <Inspector tool={tool} category={category} />
        </div>
      </div>
    </section>
  )
}
