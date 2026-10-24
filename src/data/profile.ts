/**
 * Single place to personalise the portfolio.
 * Everything here is placeholder content: replace names, links and numbers
 * with your own before publishing.
 */
export const profile = {
  name: 'Muhammad Ahmed Raza',
  handle: 'ahmed.sh',
  title: 'Junior DevOps Engineer',
  location: 'Pakistan · Remote · UTC+5',
  availability: 'Open to Junior DevOps and Cloud Engineering roles',
  intro:
    'I am a Software Engineering graduate passionate about DevOps, cloud infrastructure, and automation. I build containerized applications, automate infrastructure with Terraform and Ansible, and develop CI/CD pipelines using GitHub Actions to streamline application deployment.',
  email: 'ahmad.ah1035@gmail.com',
  github: 'https://github.com/Ahmad-000',
  linkedin: 'https://linkedin.com/in/muhammad-ahmed-raza-devops',
  resume: '/Muhammad_Ahmed_Raza_DevOps.pdf',

  heroStats: [
    { value: '02', label: 'DevOps portfolio projects' },
    { value: 'AWS', label: 'Cloud infrastructure & deployment' },
    { value: 'CI/CD', label: 'Pipeline automation with GitHub Actions' },
  ],
} as const

export const sections = [
  { id: 'hero', label: 'Home' },
  { id: 'stack', label: 'Stack' },
  { id: 'projects', label: 'Projects' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'contact', label: 'Contact' },
] as const
