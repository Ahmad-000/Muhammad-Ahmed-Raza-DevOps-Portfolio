import { useMemo } from 'react'
import type { NodeKind, Project } from '../data/projects'
import { useEffects } from '../hooks/useEffects'

const NODE_W = 98
const NODE_H = 30

const kindColor: Record<NodeKind, string> = {
  source: '#8b9bb0',
  compute: '#00f0ff',
  gate: '#b98bff',
  data: '#3df5a0',
}

export const kindLabel: Record<NodeKind, string> = {
  source: 'Source',
  compute: 'Compute',
  gate: 'Gate',
  data: 'Data',
}

function edgePath(
  a: { x: number; y: number },
  b: { x: number; y: number },
  mode: 'h' | 'v',
): string {
  if (mode === 'v') {
    const down = b.y >= a.y
    const y1 = a.y + (down ? NODE_H / 2 : -NODE_H / 2)
    const y2 = b.y + (down ? -NODE_H / 2 : NODE_H / 2)
    const my = (y1 + y2) / 2
    return `M ${a.x} ${y1} C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${y2}`
  }
  const right = b.x >= a.x
  const x1 = a.x + (right ? NODE_W / 2 : -NODE_W / 2)
  const x2 = b.x + (right ? -NODE_W / 2 : NODE_W / 2)
  const mx = (x1 + x2) / 2
  return `M ${x1} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${x2} ${b.y}`
}

/** Animated SVG architecture preview. `runKey` restarts the packets when Replay is pressed. */
export function ArchitectureDiagram({ project, runKey }: { project: Project; runKey: number }) {
  const { reduced } = useEffects()
  const { nodes, edges, alt } = project.diagram
  const markerId = `arrow-${project.id}`

  const paths = useMemo(() => {
    const byId = new Map(nodes.map((n) => [n.id, n]))
    return edges.map((e) => edgePath(byId.get(e.from)!, byId.get(e.to)!, e.mode ?? 'h'))
  }, [nodes, edges])

  return (
    <svg viewBox="0 0 380 220" role="img" aria-label={alt} className="h-auto w-full min-w-[23rem]">
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#4a5d78" />
        </marker>
      </defs>

      {paths.map((d, i) => (
        <g key={`${runKey}-${i}`}>
          <path d={d} fill="none" stroke="#243146" strokeWidth="1.5" markerEnd={`url(#${markerId})`} />
          <path d={d} fill="none" stroke="#00f0ff" strokeWidth="1.5" opacity="0.85" className="flow-dash" />
          {!reduced && (
            <>
              <circle r="5" fill="#00f0ff" opacity="0.22">
                <animateMotion dur="2.6s" begin={`${i * 0.4}s`} repeatCount="indefinite" path={d} />
              </circle>
              <circle r="2.4" fill="#ffffff">
                <animateMotion dur="2.6s" begin={`${i * 0.4}s`} repeatCount="indefinite" path={d} />
              </circle>
            </>
          )}
        </g>
      ))}

      {nodes.map((n) => {
        const color = kindColor[n.kind]
        return (
          <g key={n.id} transform={`translate(${n.x - NODE_W / 2} ${n.y - NODE_H / 2})`}>
            <rect width={NODE_W} height={NODE_H} rx="8" fill="#0f1724" stroke={color} strokeOpacity="0.75" />
            <circle cx="10" cy={NODE_H / 2} r="2.6" fill={color} />
            <text
              x={NODE_W / 2 + 4}
              y={NODE_H / 2 + 3.6}
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="500"
              fill="#e8eef7"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {n.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
