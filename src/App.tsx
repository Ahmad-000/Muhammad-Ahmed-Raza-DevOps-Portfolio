import { lazy, Suspense } from 'react'
import { MotionConfig } from 'motion/react'
import { Contact } from './components/Contact'
import { ContactForm } from './components/ContactForm'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { IdentitySection } from './components/identity/IdentitySection'
import { Nav } from './components/Nav'
import { StaticBackdrop } from './components/StaticBackdrop'
import { Terminal } from './components/Terminal'
import { TechStack } from './components/TechStack'
import { Projects } from './components/Projects'
import { EffectsProvider, useEffects } from './hooks/useEffects'
import { useScrollBridge } from './hooks/useScrollBridge'

// three.js and react-three-fiber live in their own chunk, so the page text paints first.
const Experience = lazy(() => import('./three/Experience'))

function Page() {
  const { tier, reduced, webgl } = useEffects()
  useScrollBridge()

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* Always-present base layer: shows while the 3D chunk loads, and if WebGL is unavailable. */}
      <div aria-hidden="true" className="fixed inset-0 z-0">
        <StaticBackdrop  />
      </div>
      {webgl && (
        <Suspense fallback={null}>
          <Experience tier={tier} reduced={reduced} />
        </Suspense>
      )}

      <Nav />
      <main id="main" className="relative z-10" aria-label="Muhammad Ahmed Raza DevOps Portfolio">
        <Hero />
        <IdentitySection />
        <TechStack />
        <Projects />
        <Terminal />
        <Contact />
        <ContactForm />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </>
  )
}

export default function App() {
  return (
    <EffectsProvider>
      {/* Motion respects the visitor's OS reduced-motion setting everywhere it animates. */}
      <MotionConfig reducedMotion="user">
        <Page />
      </MotionConfig>
    </EffectsProvider>
  )
}
