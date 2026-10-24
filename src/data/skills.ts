export type Level = 'Expert' | 'Advanced' | 'Proficient'

export interface Tool {
  id: string
  name: string
  glyph: string
  level: Level
  /** 0-100, drives the proficiency meter */
  score: number
  years: number
  uses: string
  lastRun: string
}

export interface Category {
  id: string
  title: string
  /** What this layer of the platform is responsible for. */
  role: string
  /** Stages shown in the live pipeline readout for tools in this category. */
  flow: string[]
  tools: Tool[]
}



export const categories: Category[] = [
  {
    id: 'infra',
    title: 'Infrastructure and cloud',
    role: 'Provisioning and managing cloud infrastructure',
    flow: ['configure', 'plan', 'provision', 'verify'],
    tools: [
      {
        id: 'aws',
        name: 'AWS',
        glyph: 'Aw',
        level: 'Proficient',
        score: 60,
        years: 1,
        uses:
          'Working with EC2 instances, security groups, IAM, OIDC authentication, and Systems Manager for cloud deployment workflows.',
        lastRun: 'EC2 deployment environment configured',
      },
      {
        id: 'terraform',
        name: 'Terraform',
        glyph: 'Tf',
        level: 'Proficient',
        score: 65,
        years: 1,
        uses:
          'Provisioning AWS infrastructure as Code, including EC2 instances, security groups, and SSH key pairs.',
        lastRun: 'Terraform plan completed',
      },
      {
        id: 'ansible',
        name: 'Ansible',
        glyph: 'An',
        level: 'Proficient',
        score: 60,
        years: 1,
        uses:
          'Automating Ubuntu server configuration and deploying containerized applications.',
        lastRun: 'Application deployment playbook configured',
      },
      {
        id: 'linux',
        name: 'Linux',
        glyph: 'Lx',
        level: 'Proficient',
        score: 55,
        years: 1,
        uses:
          'Using Ubuntu command-line tools, managing application services, and troubleshooting deployment environments.',
        lastRun: 'Ubuntu EC2 environment',
      },
    ],
  },
  {
    id: 'containers',
    title: 'Containers and deployment',
    role: 'Packaging and running applications consistently',
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
          'Building frontend and backend images, writing Dockerfiles, and troubleshooting container health checks.',
        lastRun: 'Frontend and backend images built',
      },
      {
        id: 'compose',
        name: 'Docker Compose',
        glyph: 'Dc',
        level: 'Advanced',
        score: 75,
        years: 1,
        uses:
          'Running multi-container applications with frontend, backend, and MongoDB services.',
        lastRun: 'Multi-service configuration prepared',
      },
      {
        id: 'nginx',
        name: 'Nginx',
        glyph: 'Nx',
        level: 'Proficient',
        score: 55,
        years: 1,
        uses:
          'Serving frontend assets over HTTP and configuring reverse proxy routing for application APIs.',
        lastRun: 'Frontend HTTP serving configured',
      },
      {
        id: 'dockerhub',
        name: 'Docker Hub',
        glyph: 'DH',
        level: 'Advanced',
        score: 70,
        years: 1,
        uses:
          'Building, tagging, publishing, and retrieving custom frontend and backend Docker images.',
        lastRun: 'Application images published',
      },
    ],
  },
  {
    id: 'cicd',
    title: 'CI/CD and automation',
    role: 'Automating application delivery',
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
          'Creating CI/CD workflows for application validation, Docker image builds, Docker Hub publishing, and AWS deployment automation.',
        lastRun: 'CI/CD workflow configured',
      },
      {
        id: 'git',
        name: 'Git and GitHub',
        glyph: 'Gh',
        level: 'Advanced',
        score: 75,
        years: 1,
        uses:
          'Managing source code, version control, repository collaboration, and automated workflows.',
        lastRun: 'Project repositories maintained',
      },
      {
        id: 'oidc',
        name: 'AWS OIDC',
        glyph: 'OI',
        level: 'Proficient',
        score: 55,
        years: 1,
        uses:
          'Configuring GitHub Actions identity federation with AWS IAM roles for short-lived cloud authentication.',
        lastRun: 'OIDC role integration configured',
      },
      {
        id: 'ssm',
        name: 'AWS Systems Manager',
        glyph: 'SM',
        level: 'Proficient',
        score: 50,
        years: 1,
        uses:
          'Working with SSM managed instances and Run Command for SSH-independent deployment automation.',
        lastRun: 'Deployment integration in progress',
      },
    ],
  },
  {
    id: 'development',
    title: 'Application development',
    role: 'Understanding the applications behind the pipeline',
    flow: ['develop', 'integrate', 'containerize', 'deploy'],
    tools: [
      {
        id: 'react',
        name: 'React',
        glyph: 'Re',
        level: 'Advanced',
        score: 75,
        years: 2,
        uses:
          'Building frontend interfaces and preparing React applications for containerized deployment.',
        lastRun: 'MERN frontend project',
      },
      {
        id: 'node',
        name: 'Node.js',
        glyph: 'Nj',
        level: 'Advanced',
        score: 70,
        years: 2,
        uses:
          'Developing backend APIs and connecting application services to MongoDB.',
        lastRun: 'Node.js backend project',
      },
      {
        id: 'mongodb',
        name: 'MongoDB',
        glyph: 'Mg',
        level: 'Advanced',
        score: 70,
        years: 2,
        uses:
          'Configuring database connectivity and running MongoDB alongside application services using Docker Compose.',
        lastRun: 'MongoDB service configured',
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
        lastRun: 'MERN stack development',
      },
    ],
  },
] as const;


