import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { profile } from '../data/profile'
import { useEffects } from '../hooks/useEffects'
import { QUICK, complete, initialLines, run, type Out } from '../lib/terminal'
import { GlassPanel } from './GlassPanel'
import { SectionHeading } from './SectionHeading'

interface Line extends Out {
  id: number
}

const toneClass: Record<Out['tone'], string> = {
  in: 'text-ink',
  out: 'text-[#c0cbdb]',
  ok: 'text-ok',
  err: 'text-warn',
  dim: 'text-slate-mute',
  head: 'font-semibold text-cyan-neon',
}

const MAX_LINES = 400

export function Terminal() {
  const { reduced } = useEffects()
  const inputId = useId()
  const nextId = useRef(0)
  const timers = useRef<number[]>([])
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [lines, setLines] = useState<Line[]>(() => initialLines().map((l) => ({ ...l, id: nextId.current++ })))
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [cursor, setCursor] = useState(-1)
  const [running, setRunning] = useState(false)

  const push = useCallback((add: Out[]) => {
    setLines((prev) => [...prev, ...add.map((o) => ({ tone: o.tone, text: o.text, pre: o.pre, id: nextId.current++ }))].slice(-MAX_LINES))
  }, [])

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  // Keep the newest output in view without scrolling the page itself.
  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const submit = useCallback(
    (raw: string) => {
      if (running) return
      const cmd = raw.trim()
      push([{ tone: 'in', text: cmd }])
      if (cmd) setHistory((h) => (h[h.length - 1] === cmd ? h : [...h, cmd]))
      setCursor(-1)
      setValue('')

      const res = run(cmd)
      if (res.type === 'clear') {
        setLines([])
        return
      }
      if (res.type === 'print') {
        push(res.lines)
        if (res.after === 'contact') {
          window.setTimeout(
            () => document.getElementById('contact')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }),
            700,
          )
        }
        return
      }

      // A scripted run: lines arrive one at a time, unless the visitor prefers reduced motion.
      if (reduced) {
        push(res.steps)
        return
      }
      setRunning(true)
      let t = 0
      for (const step of res.steps) {
        t += step.wait
        timers.current.push(window.setTimeout(() => push([step]), t))
      }
      timers.current.push(window.setTimeout(() => setRunning(false), t + 150))
    },
    [running, reduced, push],
  )

  const cancel = useCallback(() => {
    clearTimers()
    setRunning(false)
    push([{ tone: 'err', text: '^C' }])
  }, [clearTimers, push])

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'c' && running) {
      e.preventDefault()
      cancel()
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault()
      setLines([])
    } else if (e.key === 'Tab') {
      // Only take over Tab while there is something to complete, so keyboard users can still move on.
      if (value.trim()) {
        const next = complete(value)
        if (next !== value) {
          e.preventDefault()
          setValue(next)
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!history.length) return
      const i = cursor === -1 ? history.length - 1 : Math.max(0, cursor - 1)
      setCursor(i)
      setValue(history[i])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (cursor === -1) return
      if (cursor >= history.length - 1) {
        setCursor(-1)
        setValue('')
      } else {
        setCursor(cursor + 1)
        setValue(history[cursor + 1])
      }
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit(value)
  }

  // Clicking the window focuses the prompt, unless the visitor is selecting text to copy.
  const focusPrompt = () => {
    if (window.getSelection()?.toString()) return
    inputRef.current?.focus({ preventScroll: true })
  }

  return (
    <section id="terminal" data-station="3" aria-labelledby="terminal-title" className="relative py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading id="terminal-title" title="Ask the terminal">
          Type a command or tap one below to explore my skills, projects and career. It all runs in your browser.
        </SectionHeading>

        <GlassPanel className="mt-12 max-w-4xl overflow-hidden rounded-3xl">
          <div className="flex items-center gap-3 border-b border-slate-line px-4 py-3">
            <span aria-hidden="true" className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
              <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
              <span className="size-2.5 rounded-full bg-[#28c840]/80" />
            </span>
            <span className="truncate font-mono text-xs text-slate-mute">visitor@{profile.handle}: ~</span>
          </div>

          {/* The scrollable output area is focusable so keyboard users can scroll it. */}
          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label="Terminal output"
            tabIndex={0}
            onClick={focusPrompt}
            className="scrollbar-thin h-96 overflow-auto bg-void/70 px-4 py-4 font-mono text-[0.75rem] leading-6 sm:text-[0.82rem] md:h-[28rem] md:px-6"
          >
            {lines.map((l) => (
              <div
                key={l.id}
                className={`${toneClass[l.tone]} ${l.pre ? 'whitespace-pre' : 'break-words whitespace-pre-wrap'}`}
              >
                {l.tone === 'in' && (
                  <span aria-hidden="true" className="text-purple-glow select-none">
                    ${' '}
                  </span>
                )}
                {l.tone === 'in' && <span className="sr-only">Command: </span>}
                {l.text || ' '}
              </div>
            ))}
          </div>

          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-slate-line bg-void/85 px-4 py-3 font-mono md:px-6">
            <label htmlFor={inputId} className="shrink-0 text-sm">
              <span className="sr-only">Terminal command</span>
              <span aria-hidden="true" className="hidden text-ok sm:inline">
                visitor@{profile.handle}
              </span>
              <span aria-hidden="true" className="text-purple-glow sm:ml-1">
                ~$
              </span>
            </label>
            <input
              ref={inputRef}
              id={inputId}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              readOnly={running}
              placeholder={running ? 'Running. Press Ctrl+C to stop.' : 'Type a command'}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="send"
              className="min-h-10 min-w-0 flex-1 bg-transparent text-base text-ink caret-cyan-neon outline-none placeholder:text-slate-mute/70 sm:text-sm"
            />
            <button
              type="submit"
              disabled={running}
              className="shrink-0 rounded-lg border border-slate-line px-3 py-1.5 text-sm text-slate-mute transition-colors hover:border-cyan-neon/60 hover:text-ink disabled:opacity-40 pointer-coarse:min-h-11"
            >
              Run
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-line px-4 py-3 md:px-6">
            <span className="mr-1 text-sm text-slate-mute">Try:</span>
            {QUICK.map((c) => (
              <button
                key={c}
                type="button"
                disabled={running}
                onClick={() => submit(c)}
                className="rounded-full border border-slate-line px-3 py-1.5 font-mono text-xs text-ink transition-colors hover:border-cyan-neon/60 hover:bg-cyan-neon/8 disabled:opacity-40 pointer-coarse:min-h-11 pointer-coarse:px-4"
              >
                {c}
              </button>
            ))}
            {running && (
              <button
                type="button"
                onClick={cancel}
                className="ml-auto rounded-full border border-warn/60 px-3 py-1.5 text-xs font-medium text-warn transition-colors hover:bg-warn/10 pointer-coarse:min-h-11"
              >
                Stop (Ctrl+C)
              </button>
            )}
          </div>
        </GlassPanel>

      </div>
    </section>
  )
}
