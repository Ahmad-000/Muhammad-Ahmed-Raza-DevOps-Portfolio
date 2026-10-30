
export type Level = 'Expert' | 'Advanced' | 'Proficient'

export interface Tool {
  id: string
  name: string
  glyph: string
  level: Level
  /** Self-assessed proficiency indicator from 0 to 100. */
  score: number
  /** Years of hands-on learning and project experience. */
  years: number
  /** Practical explanation of how the technology is used. */
  uses: string
  /** Project or practical context where the technology is used. */
  projectUse: string
}

export interface Category {
  id: string
  title: string
  /** Responsibility of this technology category. */
  role: string
  /** Illustrative workflow stages, not a live pipeline execution. */
  flow: string[]
  tools: Tool[]
}

export const categories: Category[] = [
  {
    id: 'infra',
    title: 'Cloud & Infrastructure',
    role: 'Provisioning, configuring, and managing cloud infrastructure',
    flow: ['configure', 'plan', 'provision', 'verify'],
    tools: [
      {
        id: 'aws',
        name: 'Amazon Web Services (AWS)',
        glyph: 'Aw',
        level: 'Proficient',
        score: 60,
        years: 1,
        uses:
          'Working with AWS EC2, security groups, IAM roles, OIDC authentication, and Systems Manager to build and manage cloud deployment environments.',
        projectUse: 'AWS EC2 application deployment',
      },
      {
        id: 'terraform',
        name: 'Terraform',
        glyph: 'Tf',
        level: 'Proficient',
        score: 65,
        years: 1,
        uses:
          'Defining AWS infrastructure as code, including EC2 instances, security groups, networking rules, and reusable infrastructure configuration.',
        projectUse: 'AWS infrastructure provisioning',
      },
      {
        id: 'ansible',
        name: 'Ansible',
        glyph: 'An',
        level: 'Proficient',
        score: 60,
        years: 1,
        uses:
          'Automating Ubuntu server configuration, managing deployment tasks, and preparing Linux environments for containerized applications.',
        projectUse: 'Automated server configuration',
      },
      {
        id: 'linux',
        name: 'Linux',
        glyph: 'Lx',
        level: 'Proficient',
        score: 55,
        years: 1,
        uses:
          'Using Linux command-line tools, navigating the file system, managing services and permissions, and troubleshooting Ubuntu deployment environments.',
        projectUse: 'Ubuntu EC2 server management',
      },
    ],
  },

  {
    id: 'containers',
    title: 'Containers & Deployment',
    role: 'Building, packaging, and running applications consistently',
    flow: ['build', 'configure', 'run', 'verify'],
    tools: [
      {
        id: 'docker',
        name: 'Docker',
        glyph: 'Dk',
        level: 'Advanced',
        score: 75,
        years: 1,
        uses:
          'Writing Dockerfiles, building frontend and backend container images, managing containers, and troubleshooting container health checks.',
        projectUse: 'Containerized MERN and Todo applications',
      },
      {
        id: 'compose',
        name: 'Docker Compose',
        glyph: 'Dc',
        level: 'Advanced',
        score: 75,
        years: 1,
        uses:
          'Defining and running multi-container applications with frontend, backend, and MongoDB services through Docker Compose configuration.',
        projectUse: 'Multi-container application deployment',
      },
      {
        id: 'nginx',
        name: 'Nginx',
        glyph: 'Nx',
        level: 'Proficient',
        score: 55,
        years: 1,
        uses:
          'Serving frontend application assets over HTTP and configuring reverse proxy routing for backend API requests.',
        projectUse: 'Frontend hosting and API routing',
      },
      {
        id: 'dockerhub',
        name: 'Docker Hub',
        glyph: 'DH',
        level: 'Advanced',
        score: 70,
        years: 1,
        uses:
          'Tagging, publishing, versioning, and retrieving custom frontend and backend Docker images for application deployment.',
        projectUse: 'Docker image publishing and distribution',
      },
    ],
  },

  {
    id: 'cicd',
    title: 'CI/CD & Automation',
    role: 'Automating software integration and application delivery',
    flow: ['validate', 'build', 'publish', 'deploy'],
    tools: [
      {
        id: 'gha',
        name: 'GitHub Actions',
        glyph: 'GA',
        level: 'Advanced',
        score: 75,
        years: 1,
        uses:
          'Creating CI/CD workflows to validate application code, build Docker images, publish images to Docker Hub, and automate AWS deployment tasks.',
        projectUse: 'Automated application CI/CD workflows',
      },
      {
        id: 'git',
        name: 'Git & GitHub',
        glyph: 'Gh',
        level: 'Advanced',
        score: 75,
        years: 1,
        uses:
          'Managing source code with Git, maintaining GitHub repositories, tracking changes, and integrating version control with automated workflows.',
        projectUse: 'DevOps project source code management',
      },
      {
        id: 'oidc',
        name: 'AWS OIDC',
        glyph: 'OI',
        level: 'Proficient',
        score: 55,
        years: 1,
        uses:
          'Configuring identity federation between GitHub Actions and AWS IAM roles to support short-lived credentials without storing long-term AWS access keys.',
        projectUse: 'GitHub Actions and AWS authentication',
      },
      {
        id: 'ssm',
        name: 'AWS Systems Manager',
        glyph: 'SM',
        level: 'Proficient',
        score: 50,
        years: 1,
        uses:
          'Working with managed EC2 instances and Systems Manager Run Command to execute remote deployment tasks without requiring SSH access from CI/CD runners.',
        projectUse: 'SSH-independent deployment automation',
      },
    ],
  },

  {
    id: 'development',
    title: 'Application Development',
    role: 'Understanding and preparing applications for deployment',
    flow: ['develop', 'integrate', 'containerize', 'deploy'],
    tools: [
      {
        id: 'react',
        name: 'React.js',
        glyph: 'Re',
        level: 'Advanced',
        score: 75,
        years: 2,
        uses:
          'Developing responsive frontend interfaces and preparing React applications for production-oriented containerized deployment.',
        projectUse: 'MERN and Todo frontend development',
      },
      {
        id: 'node',
        name: 'Node.js',
        glyph: 'Nj',
        level: 'Advanced',
        score: 70,
        years: 2,
        uses:
          'Building backend APIs, managing application services, and connecting Node.js applications to MongoDB databases.',
        projectUse: 'Backend API development',
      },
      {
        id: 'mongodb',
        name: 'MongoDB',
        glyph: 'Mg',
        level: 'Advanced',
        score: 70,
        years: 2,
        uses:
          'Working with NoSQL databases, configuring application database connections, and running MongoDB as a containerized service.',
        projectUse: 'MongoDB database integration',
      },
      {
        id: 'javascript',
        name: 'JavaScript',
        glyph: 'Js',
        level: 'Advanced',
        score: 75,
        years: 2,
        uses:
          'Developing JavaScript applications across React frontend interfaces and Node.js backend services.',
        projectUse: 'Full-stack JavaScript development',
      },
    ],
  },
]
