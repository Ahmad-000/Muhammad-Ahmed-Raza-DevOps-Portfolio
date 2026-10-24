import { profile } from '../data/profile'
import { SocialLinks } from './SocialLinks'

/**
 * Final station of the flight. The camera arrives here and holds while the form and
 * footer scroll past, with the reformed cluster glowing beside the copy.
 */
export function Contact() {
  return (
    <section
      id="contact"
      data-station="4"
      aria-labelledby="contact-title"
      className="relative flex min-h-svh items-end py-24 lg:items-center"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="glass edge relative max-w-xl rounded-3xl p-6 shadow-[0_0_80px_-18px_rgba(0,240,255,0.4)] md:p-10">
          {/* Soft neon wash behind the copy */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-px rounded-3xl"
            style={{
              background:
                'radial-gradient(70% 60% at 0% 0%, rgba(0,240,255,0.14), transparent 70%), radial-gradient(60% 60% at 100% 100%, rgba(121,40,202,0.2), transparent 70%)',
            }}
          />
          <div className="relative">
            <h2 id="contact-title" className="text-3xl leading-[1.04] font-extrabold tracking-tight sm:text-4xl md:text-6xl">
              Let&rsquo;s build resilient systems together
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#b3c0d2] md:mt-5 md:text-lg">
              Planning a migration, a faster pipeline or a calmer on-call rotation? Tell me what you are working on and I will
              reply within two working days.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 md:mt-8 md:gap-4">
              <a href={`mailto:${profile.email}`} className="btn btn-primary max-sm:px-4 max-sm:text-sm">
                Email me
              </a>
              <a href="#message" className="btn btn-ghost max-sm:px-4 max-sm:text-sm">
                Send a message
              </a>
            </div>

            <SocialLinks className="mt-5 md:mt-8" />
          </div>
        </div>
      </div>
    </section>
  )
}
