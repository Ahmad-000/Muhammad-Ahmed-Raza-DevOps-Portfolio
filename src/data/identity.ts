
import { profile } from './profile'

/**
 * Professional identity information for the portfolio's holographic card.
 * Profile details are reused from profile.ts.
 */
export const identity = {
  eyebrow: 'Professional Identity',

  name: profile.name,
  title: profile.title,

  photo: {
    src: '/images/profile-photo.jpg',
    alt: 'Muhammad Ahmed Raza, Junior DevOps Engineer',
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

/**
 * Accessible identity description for screen readers.
 */
export const identitySummary =
  `${identity.name}, ${identity.title}. ` +
  `${identity.education.degree} from ${identity.education.university}, ${identity.education.campus}. ` +
  `${identity.education.status} in ${identity.education.year}. ` +
  `${identity.certification}. ` +
  'Professional portfolio focused on AWS, Azure, Docker, Terraform, Linux, cloud infrastructure, and CI/CD automation.'
