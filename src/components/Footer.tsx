import { profile } from '../data/profile'
import { SocialLinks } from './SocialLinks'
import { StatusPing } from './StatusPing'

export function Footer() {
  return (
    <footer className="relative border-t border-slate-line bg-void/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 md:px-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <StatusPing />
          <p className="text-sm text-slate-mute">
            &copy; {new Date().getFullYear()} {profile.name}. {profile.title}, {profile.location}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <SocialLinks />
          <a
            href="#hero"
            className="min-h-11 rounded-xl border border-slate-line px-4 py-3 text-sm font-medium text-slate-mute transition-colors hover:border-cyan-neon/60 hover:text-ink"
          >
            Back to top
          </a>
        </div>
      </div>
    </footer>
  )
}
