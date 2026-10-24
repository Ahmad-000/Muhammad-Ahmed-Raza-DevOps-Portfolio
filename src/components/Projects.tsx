import { useState } from 'react'
import { projects, type NodeKind, type Project } from '../data/projects'
import { ArchitectureDiagram, kindLabel } from './ArchitectureDiagram'
import { GlassPanel } from './GlassPanel'
import { SectionHeading } from './SectionHeading'

const legend: NodeKind[] = ['source', 'compute', 'gate', 'data']
const legendColor: Record<NodeKind, string> = {
  source: 'bg-slate-mute',
  compute: 'bg-cyan-neon',
  gate: 'bg-purple-glow',
  data: 'bg-ok',
}

function ProjectCard({ project, flip }: { project: Project; flip: boolean }) {
  const [runKey, setRunKey] = useState(0)

  return (
    <GlassPanel tilt className="rounded-3xl p-6 md:p-9">
      <article aria-labelledby={`${project.id}-title`} className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <div className={`min-w-0 ${flip ? 'lg:order-2' : ''}`}>
          <p className="inline-flex items-center gap-2 text-sm text-slate-mute">
            <span className="led" aria-hidden="true" />
            In production
          </p>
          <h3 id={`${project.id}-title`} className="mt-3 text-3xl leading-tight font-bold tracking-tight md:text-4xl">
            {project.name}
          </h3>
          <p className="mt-4 leading-relaxed text-[#b3c0d2]">{project.summary}</p>

          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies">
            {project.tags.map((t) => (
              <li key={t} className="rounded-full border border-slate-line px-3 py-1 text-sm text-slate-mute">
                {t}
              </li>
            ))}
          </ul>

          <dl className="mt-8 grid grid-cols-3 gap-3 border-y border-slate-line py-6 sm:gap-4">
            {project.metrics.map((m) => (
              <div key={m.label} className="min-w-0">
                <dd className="order-1 text-2xl font-bold tracking-tight text-cyan-neon tabular-nums sm:text-3xl md:text-4xl">{m.value}</dd>
                <dt className="mt-1 text-sm leading-snug text-slate-mute">{m.label}</dt>
              </div>
            ))}
          </dl>

          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost mt-7 min-h-11 px-5 text-sm"
          >
            View repo on GitHub
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>

        <div className={`min-w-0 ${flip ? 'lg:order-1' : ''}`}>
          <div className="rounded-2xl border border-slate-line bg-void/70 p-4 md:p-5">
            {/* On narrow screens the diagram keeps a readable size and scrolls sideways. */}
            <div
              className="scrollbar-thin overflow-x-auto"
              tabIndex={0}
              role="region"
              aria-label={`${project.name} architecture diagram`}
            >
              <ArchitectureDiagram project={project} runKey={runKey} />
            </div>
            <p className="mt-2 text-xs text-slate-mute sm:hidden">Swipe sideways to see the whole diagram.</p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-mute" aria-label="Diagram legend">
              {legend.map((k) => (
                <li key={k} className="flex items-center gap-1.5">
                  <span aria-hidden="true" className={`size-2 rounded-full ${legendColor[k]}`} />
                  {kindLabel[k]}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 flex items-start justify-between gap-4">
            <ol className="space-y-2.5 text-sm text-[#b3c0d2]" aria-label="How the flow works">
              {project.flow.map((line) => (
                <li key={line} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-neon" />
                  {line}
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => setRunKey((k) => k + 1)}
              className="shrink-0 rounded-lg border border-slate-line px-3 py-1.5 text-sm text-slate-mute transition-colors hover:border-cyan-neon/60 hover:text-ink pointer-coarse:min-h-11"
            >
              Replay flow
            </button>
          </div>
        </div>
      </article>
    </GlassPanel>
  )
}

export function Projects() {
  return (
    <section id="projects" data-station="2" aria-labelledby="projects-title" className="relative py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading id="projects-title" title="Systems I have built and run">
          Each one started as a reliability or speed problem. The diagrams show how a change moves through the system.
        </SectionHeading>

        <div className="mt-12 space-y-8">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} flip={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
