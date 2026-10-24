import { useEffect, useState } from 'react'

/** Decorative "all systems operational" readout with a live-looking latency number. */
export function StatusPing({ showLatency = true }: { showLatency?: boolean }) {
  const [ms, setMs] = useState(24)

  useEffect(() => {
    const id = window.setInterval(() => setMs(18 + Math.round(Math.random() * 20)), 4000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <p className="inline-flex items-center gap-2.5 text-sm text-ink">
      <span className="relative flex size-2.5" aria-hidden="true">
        <span className="animate-ping-soft absolute inset-0 rounded-full bg-ok" />
        <span className="relative size-2.5 rounded-full bg-ok shadow-[0_0_10px_var(--color-ok)]" />
      </span>
      <span>All systems operational</span>
      {showLatency && <span className="font-mono text-xs text-slate-mute tabular-nums">{ms} ms</span>}
    </p>
  )
}
