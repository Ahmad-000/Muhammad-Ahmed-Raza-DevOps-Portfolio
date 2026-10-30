
export type NodeKind = 'source' | 'compute' | 'gate' | 'data'

export interface DiagramNode {
  id: string
  label: string
  /** Centre of the node in the 380 x 220 diagram viewBox. */
  x: number
  y: number
  kind: NodeKind
}

export interface DiagramEdge {
  from: string
  to: string
  /** 'h' leaves the right side of a node, 'v' leaves the bottom. */
  mode?: 'h' | 'v'
}

export interface Project {
  id: string
  name: string
  slug: string
  /** Short project outcome displayed in the portfolio terminal. */
  headline: string
  summary: string
  tags: string[]
  metrics: { value: string; label: string }[]
  /** Short technical workflow displayed beside the architecture diagram. */
  flow: string[]
  repo: string
  diagram: {
    alt: string
    nodes: DiagramNode[]
    edges: DiagramEdge[]
  }
}

export const projects: Project[] = [
  {
    id: 'mern-devops-automation',
    name: 'MERN DevOps Automation',
    slug: 'mern-devops-automation',

    headline: 'Dockerized MERN Deployment with AWS CI/CD',

    summary:
      'Implemented a containerized MERN stack application deployment workflow using Docker, Docker Compose, Docker Hub, and AWS EC2. Configured GitHub Actions to automate application validation, Docker image builds, image publishing, and deployment workflows. Integrated AWS IAM OpenID Connect (OIDC) authentication and AWS Systems Manager (SSM) to support secure, SSH-independent deployment execution.',

    tags: [
      'DevOps',
      'MERN Stack',
      'Docker',
      'Docker Compose',
      'Docker Hub',
      'AWS',
      'AWS EC2',
      'AWS IAM',
      'OpenID Connect (OIDC)',
      'AWS Systems Manager',
      'GitHub Actions',
      'CI/CD',
      'Linux',
      'Ubuntu',
      'Nginx',
      'MongoDB',
    ],

    metrics: [
      { value: 'CI/CD', label: 'GitHub Actions automation' },
      { value: '2', label: 'Frontend and backend Docker images' },
      { value: 'SSM', label: 'SSH-independent deployment workflow' },
    ],

    flow: [
      'GitHub Actions validates application code and builds frontend and backend Docker images',
      'Docker images are tagged and published to Docker Hub',
      'AWS IAM OIDC authentication and Systems Manager support secure deployment commands on EC2',
    ],

    repo: 'https://github.com/Ahmad-000/mern-devops-automation',

    diagram: {
      alt:
        'MERN DevOps architecture showing GitHub source code, GitHub Actions CI/CD automation, Docker image builds, Docker Hub publishing, AWS IAM OIDC authentication, AWS Systems Manager, and application deployment on AWS EC2 with MongoDB.',

      nodes: [
        { id: 'git', label: 'GitHub', x: 56, y: 36, kind: 'source' },
        { id: 'ci', label: 'GitHub Actions', x: 168, y: 36, kind: 'gate' },
        { id: 'build', label: 'Docker Build', x: 280, y: 36, kind: 'compute' },
        { id: 'hub', label: 'Docker Hub', x: 280, y: 114, kind: 'data' },
        { id: 'oidc', label: 'AWS OIDC', x: 168, y: 114, kind: 'gate' },
        { id: 'ssm', label: 'AWS SSM', x: 56, y: 114, kind: 'gate' },
        { id: 'ec2', label: 'AWS EC2', x: 168, y: 190, kind: 'compute' },
        { id: 'app', label: 'MERN + MongoDB', x: 280, y: 190, kind: 'data' },
      ],

      edges: [
        { from: 'git', to: 'ci' },
        { from: 'ci', to: 'build' },
        { from: 'build', to: 'hub', mode: 'v' },
        { from: 'ci', to: 'oidc', mode: 'v' },
        { from: 'oidc', to: 'ssm' },
        { from: 'ssm', to: 'ec2', mode: 'v' },
        { from: 'hub', to: 'app', mode: 'v' },
        { from: 'ec2', to: 'app' },
      ],
    },
  },

  {
    id: 'todos-devops-project',
    name: 'Todo DevOps Project',
    slug: 'todo-devops-project',

    headline: 'AWS Infrastructure Automation with Terraform',

    summary:
      'Building a DevOps automation workflow for a containerized Todo application using AWS, Terraform, Ansible, Docker, and GitHub Actions. The project uses Terraform to define and provision AWS infrastructure, Ansible for Linux server configuration and application deployment, and Docker Compose to orchestrate React, Node.js, and MongoDB services. GitHub Actions and Docker Hub are used to develop an automated CI/CD workflow, with AWS IAM OIDC and Systems Manager being implemented for secure, SSH-independent deployment.',

    tags: [
      'DevOps',
      'AWS',
      'AWS EC2',
      'Terraform',
      'Infrastructure as Code (IaC)',
      'Ansible',
      'Linux',
      'Docker',
      'Docker Compose',
      'Docker Hub',
      'GitHub Actions',
      'CI/CD',
      'AWS IAM',
      'OpenID Connect (OIDC)',
      'AWS Systems Manager',
      'React',
      'Node.js',
      'MongoDB',
      'Nginx',
    ],

    metrics: [
      { value: 'IaC', label: 'AWS infrastructure with Terraform' },
      { value: 'CI/CD', label: 'GitHub Actions automation workflow' },
      { value: '3', label: 'Frontend, backend, and database services' },
    ],

    flow: [
      'Terraform defines and provisions AWS EC2 infrastructure and networking resources',
      'GitHub Actions builds application images and publishes them to Docker Hub',
      'Ansible configures the Linux server and manages Docker Compose deployment, while AWS OIDC and SSM integration are being implemented',
    ],

    repo: 'https://github.com/Ahmad-000/todos-devops-project',

    diagram: {
      alt:
        'Todo application DevOps architecture showing GitHub source code, GitHub Actions CI/CD, Docker Hub image publishing, Terraform AWS infrastructure provisioning, Ansible server configuration, AWS EC2 deployment, React frontend, Node.js backend, MongoDB, and AWS Systems Manager integration.',

      nodes: [
        { id: 'git', label: 'GitHub Repo', x: 56, y: 36, kind: 'source' },
        { id: 'ci', label: 'GitHub Actions', x: 168, y: 36, kind: 'gate' },
        { id: 'hub', label: 'Docker Hub', x: 280, y: 36, kind: 'data' },
        { id: 'tf', label: 'Terraform', x: 56, y: 114, kind: 'compute' },
        { id: 'aws', label: 'AWS EC2', x: 168, y: 114, kind: 'compute' },
        { id: 'deploy', label: 'Ansible + SSM', x: 280, y: 114, kind: 'gate' },
        { id: 'app', label: 'React + Node.js', x: 168, y: 190, kind: 'compute' },
        { id: 'db', label: 'MongoDB', x: 280, y: 190, kind: 'data' },
      ],

      edges: [
        { from: 'git', to: 'ci' },
        { from: 'ci', to: 'hub' },
        { from: 'git', to: 'tf', mode: 'v' },
        { from: 'tf', to: 'aws' },
        { from: 'ci', to: 'deploy', mode: 'v' },
        { from: 'hub', to: 'deploy', mode: 'v' },
        { from: 'deploy', to: 'aws' },
        { from: 'aws', to: 'app', mode: 'v' },
        { from: 'app', to: 'db' },
      ],
    },
  },
]
