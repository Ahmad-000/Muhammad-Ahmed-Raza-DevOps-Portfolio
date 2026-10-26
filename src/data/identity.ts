import { profile } from './profile'

/**
 * Content for the floating identity card. Name, title and links come from
 * profile.ts so there is one source of truth. Everything else here is exactly
 * what appears on the card: no registration numbers, grades or extra credentials.
 */
export const identity = {
  eyebrow: 'Digital credential',
  name: profile.name,
  title: profile.title,

  /** Original photo, served as-is from /public. Cropped with CSS only. */
  photo: {
    src: '/images/profile-photo.jpg',
    alt: `${profile.name}, portrait`,
    width: 896,
    height: 1196,
  },

  education: {
    university: 'COMSATS University Islamabad',
    campus: 'Abbottabad Campus',
    degree: "Bachelor's in Software Engineering",
    status: 'Graduated',
    year: '2026',
  },

  certification: 'Microsoft Certified: DevOps Engineer Expert',

  links: [
    { key: 'github', label: 'GitHub', href: profile.github, external: true },
    { key: 'linkedin', label: 'LinkedIn', href: profile.linkedin, external: true },
    { key: 'email', label: 'Email', href: `mailto:${profile.email}`, external: false },
  ],
} as const

/** One sentence for screen readers, so the card's facts are available even while the 3D card is off-screen. */
export const identitySummary = `${identity.name}, ${identity.title}. ${identity.education.degree}, ${identity.education.university}, ${identity.education.campus}. ${identity.education.status} ${identity.education.year}. ${identity.certification}.`
