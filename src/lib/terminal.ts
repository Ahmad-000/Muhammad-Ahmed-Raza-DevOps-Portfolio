import { career } from '../data/career'
import { profile } from '../data/profile'
import { projects } from '../data/projects'
import { categories } from '../data/skills'

export type Tone = 'in' | 'out' | 'ok' | 'err' | 'dim' | 'head'

export interface Out {
  tone: Tone
  text: string
  /** Keep columns aligned (no wrapping). Used for tables. */
  pre?: boolean
}

/** A line of a scripted run. `wait` is the pause before it appears, in ms. */
export interface Step extends Out {
  wait: number
}

export type Result =
  | { type: 'print'; lines: Out[]; after?: 'contact' }
  | { type: 'script'; steps: Step[] }
  | { type: 'clear' }

const BLANK: Out = { tone: 'out', text: '' }
const out = (text: string, tone: Tone = 'out', pre = false): Out => ({ tone, text, pre })

/** Everything Tab can complete. */
export const COMMANDS: string[] = [
  'help',
  'whoami',
  'ls',
  'cat skills.txt',
  'cat career.txt',
  'cat contact.txt',
  'kubectl get projects',
  ...projects.map((p) => `kubectl describe ${p.slug}`),
  'ping status',
  './deploy.sh',
  'clear',
  'sudo hire-me',
]

/** One-tap commands shown under the terminal. */
export const QUICK = ['help', 'cat skills.txt', 'kubectl get projects', 'ping status', './deploy.sh']

const WELCOME: Out[] = [
  out(`${profile.handle} shell, running in your browser.`, 'head'),
  out('Tab completes commands. Up and down browse history. Ctrl+C stops a running script.', 'dim'),
]

/** Finish what the visitor has typed: one match completes it, several complete the shared prefix. */
export function complete(input: string): string {
  const typed = input.replace(/\s+/g, ' ').trimStart()
  if (!typed) return input
  const matches = COMMANDS.filter((c) => c.startsWith(typed.toLowerCase()))
  if (matches.length === 0) return input
  if (matches.length === 1) return matches[0]
  let prefix = matches[0]
  for (const m of matches) while (!m.startsWith(prefix)) prefix = prefix.slice(0, -1)
  return prefix.length > typed.length ? prefix : input
}

/** ASCII bar: block glyphs fall back to another font in many mono typefaces, so stick to plain characters. */
const bar = (score: number) => {
  const n = Math.round(score / 12.5)
  return `[${'#'.repeat(n)}${'.'.repeat(8 - n)}]`
}

function help(): Out[] {
  const rows: [string, string][] = [
    ['help', 'show this list'],
    ['whoami', 'who I am'],
    ['ls', 'list files'],
    ['cat skills.txt', 'tools, by category'],
    ['cat career.txt', 'career highlights'],
    ['cat contact.txt', 'how to reach me'],
    ['kubectl get projects', 'list my projects'],
    ['kubectl describe <name>', 'details and metrics'],
    ['ping status', 'check system status'],
    ['./deploy.sh', 'run a sample deploy'],
    ['clear', 'clear the screen'],
  ]
  return [out('Available commands', 'head'), ...rows.map(([c, d]) => out(`  ${c.padEnd(26)}${d}`, 'out', true))]
}

function skills(): Out[] {
  const lines: Out[] = []
  categories.forEach((c, i) => {
    if (i) lines.push(BLANK)
    lines.push(out(c.title, 'head'))
    for (const t of c.tools) {
      lines.push(out(`  ${t.name.padEnd(15)}${t.level.padEnd(11)}${bar(t.score)} ${t.score}`, 'out', true))
    }
  })
  return lines
}

function getProjects(): Out[] {
  return [
    out(`${'NAME'.padEnd(27)}${'STATUS'.padEnd(10)}RESULT`, 'dim', true),
    ...projects.map((p) => out(`${p.slug.padEnd(27)}${'Running'.padEnd(10)}${p.headline}`, 'out', true)),
    BLANK,
    out('Try: kubectl describe multi-cloud-k8s-migration', 'dim'),
  ]
}

function describe(arg: string | undefined): Out[] {
  if (!arg) {
    return [out('error: a project name is required.', 'err'), out(`Try: kubectl describe ${projects[0].slug}`, 'dim')]
  }
  const p = projects.find((x) => x.slug === arg || x.id === arg)
  if (!p) {
    return [out(`error: project "${arg}" not found.`, 'err'), out('Run kubectl get projects to see the names.', 'dim')]
  }
  return [
    out(p.name, 'head'),
    out(`Status:  Running`, 'out', true),
    out(`Stack:   ${p.tags.join(', ')}`),
    BLANK,
    out('Summary', 'head'),
    out(`  ${p.summary}`),
    BLANK,
    out('Results', 'head'),
    ...p.metrics.map((m) => out(`  ${m.value.padEnd(9)}${m.label}`, 'ok', true)),
    BLANK,
    out('How it flows', 'head'),
    ...p.flow.map((f, i) => out(`  ${i + 1}. ${f}`)),
    BLANK,
    out(`Repo:    ${p.repo}`, 'dim'),
  ]
}

function ping(): Step[] {
  const host = `status.${profile.handle}`
  const times = Array.from({ length: 4 }, () => 18 + Math.floor(Math.random() * 21))
  const min = Math.min(...times)
  const max = Math.max(...times)
  const avg = times.reduce((a, b) => a + b, 0) / times.length
  return [
    { tone: 'out', text: `PING ${host} (203.0.113.10): 56 data bytes`, wait: 250 },
    ...times.map<Step>((ms, i) => ({
      tone: 'out',
      text: `64 bytes from 203.0.113.10: icmp_seq=${i} ttl=57 time=${ms} ms`,
      wait: 600,
    })),
    { tone: 'out', text: '', wait: 300 },
    { tone: 'dim', text: `--- ${host} ping statistics ---`, wait: 50 },
    { tone: 'out', text: '4 packets transmitted, 4 received, 0% packet loss', wait: 50 },
    { tone: 'out', text: `round-trip min/avg/max = ${min}/${avg.toFixed(1)}/${max} ms`, wait: 50 },
    { tone: 'ok', text: 'All systems operational.', wait: 250 },
  ]
}

function deploy(): Step[] {
  return [
    { tone: 'head', text: 'deploy.sh  production  (canary, then full rollout)', wait: 200 },
    { tone: 'out', text: '[1/6] terraform plan ........ 0 to destroy, 3 to change', wait: 750 },
    { tone: 'out', text: '[2/6] build image ........... 61 MB, 0 critical CVEs', wait: 850 },
    { tone: 'out', text: '[3/6] push to registry ...... sha256:9f2c...e41a', wait: 650 },
    { tone: 'out', text: '[4/6] argocd sync ........... Synced and Healthy', wait: 800 },
    { tone: 'out', text: '[5/6] canary at 10% ......... error rate 0.02%, p99 41 ms', wait: 1000 },
    { tone: 'out', text: '[6/6] promote to 100% ....... 24/24 pods ready', wait: 850 },
    { tone: 'ok', text: 'Deployed with zero downtime in 3m 48s.', wait: 350 },
    { tone: 'dim', text: 'This is the shape of the pipeline in the projects above.', wait: 150 },
  ].map((s) => ({ pre: true, ...s })) as Step[]
}

/** Parse one line of input and say what to show. Pure, so it is easy to test. */
export function run(input: string): Result {
  const raw = input.trim().replace(/\s+/g, ' ')
  if (!raw) return { type: 'print', lines: [] }

  const [cmd, ...rest] = raw.split(' ')
  const args = rest.map((a) => a.toLowerCase())
  const key = cmd.toLowerCase()

  switch (key) {
    case 'help':
    case '?':
      return { type: 'print', lines: help() }

    case 'clear':
      return { type: 'clear' }

    case 'whoami':
      return {
        type: 'print',
        lines: [
          out(profile.name, 'head'),
          out(profile.title),
          out(profile.location, 'dim'),
          out(profile.availability, 'ok'),
        ],
      }

    case 'ls':
      return {
        type: 'print',
        lines: [out('skills.txt  career.txt  contact.txt  deploy.sh', 'out', true)],
      }

    case 'cat': {
      const file = args[0]
      if (!file) return { type: 'print', lines: [out('usage: cat <file>. Try: cat skills.txt', 'err')] }
      if (file === 'skills.txt') return { type: 'print', lines: skills() }
      if (file === 'career.txt') {
        return { type: 'print', lines: career.map((c) => out(`${c.when}  ${c.text}`)) }
      }
      if (file === 'contact.txt') {
        return {
          type: 'print',
          lines: [
            out(`email     ${profile.email}`, 'out', true),
            out(`github    ${profile.github}`, 'out', true),
            out(`linkedin  ${profile.linkedin}`, 'out', true),
          ],
        }
      }
      if (file === 'deploy.sh') {
        return { type: 'print', lines: [out('Binary-looking? No, just a script. Run it with ./deploy.sh', 'dim')] }
      }
      return { type: 'print', lines: [out(`cat: ${rest[0]}: No such file or directory`, 'err')] }
    }

    case 'kubectl': {
      const verb = args[0]
      if (verb === 'get') {
        const res = args[1]
        if (res === 'projects' || res === 'project' || res === 'pods') return { type: 'print', lines: getProjects() }
        return {
          type: 'print',
          lines: [
            out(res ? `error: the server doesn't have a resource type "${rest[1]}"` : 'error: you must specify a resource type', 'err'),
            out('Try: kubectl get projects', 'dim'),
          ],
        }
      }
      if (verb === 'describe') {
        const name = args.filter((a) => a !== 'project' && a !== 'projects')[1]
        return { type: 'print', lines: describe(name) }
      }
      return {
        type: 'print',
        lines: [out('usage: kubectl get projects | kubectl describe <name>', 'err')],
      }
    }

    case 'ping':
      if (args[0] === 'status') return { type: 'script', steps: ping() }
      return { type: 'print', lines: [out('usage: ping status', 'err')] }

    case './deploy.sh':
    case 'deploy.sh':
    case 'bash':
    case 'sh':
      if (key.endsWith('deploy.sh') || args[0] === 'deploy.sh' || args[0] === './deploy.sh') {
        return { type: 'script', steps: deploy() }
      }
      return { type: 'print', lines: [out(`${cmd}: nothing to run. Try ./deploy.sh`, 'err')] }

    case 'sudo':
      if (args.join(' ') === 'hire-me' || args.join(' ') === 'hire me') {
        return {
          type: 'print',
          after: 'contact',
          lines: [out('[sudo] password for recruiter: ********', 'dim'), out('Access granted. Taking you to the contact section.', 'ok')],
        }
      }
      return {
        type: 'print',
        lines: [out(`visitor is not in the sudoers file. This incident will be reported.`, 'err')],
      }

    default:
      return {
        type: 'print',
        lines: [out(`command not found: ${cmd}`, 'err'), out('Type help to see what is available.', 'dim')],
      }
  }
}

/** What the window shows on load: a greeting, then the output of `help` so it is never an empty box. */
export function initialLines(): Out[] {
  const first = run('help')
  return [...WELCOME, { tone: 'in', text: 'help' }, ...(first.type === 'print' ? first.lines : [])]
}
