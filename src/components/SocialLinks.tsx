import type { ReactNode } from 'react'
import { profile } from '../data/profile'

const icons: Record<'github' | 'linkedin' | 'email', ReactNode> = {
  github: (
    <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
  ),
  linkedin: (
    <path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.3zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM7.1 20.5H3.6V9h3.5v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z" />
  ),
  email: (
    <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1.6 2 7.4 5.6L19.4 7H4.6zM4 17h16V9.3l-8 6-8-6V17z" />
  ),
}

const links = [
  { key: 'email', label: 'Email', href: `mailto:${profile.email}`, external: false },
  { key: 'github', label: 'GitHub', href: profile.github, external: true },
  { key: 'linkedin', label: 'LinkedIn', href: profile.linkedin, external: true },
] as const

export function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {links.map((l) => (
        <li key={l.key}>
          <a
            href={l.href}
            {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="flex min-h-11 min-w-11 items-center justify-center gap-2.5 rounded-xl border border-slate-line px-3 text-sm font-medium text-ink transition-colors hover:border-cyan-neon/60 hover:bg-cyan-neon/8 sm:px-4"
          >
            <svg viewBox="0 0 24 24" className="size-[1.1rem] fill-current text-cyan-neon" aria-hidden="true">
              {icons[l.key]}
            </svg>
            {/* Icon-only on small screens to keep the row on one line; the name stays for screen readers. */}
            <span className="sr-only sm:not-sr-only">{l.label}</span>
            {l.external && <span className="sr-only"> (opens in a new tab)</span>}
          </a>
        </li>
      ))}
    </ul>
  )
}
