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
  /** One short result, used in the terminal's `kubectl get projects` table. */
  headline: string
  summary: string
  tags: string[]
  metrics: { value: string; label: string }[]
  /** Short live-flow summary shown beside the diagram. */
  flow: string[]
  repo: string
  diagram: { alt: string; nodes: DiagramNode[]; edges: DiagramEdge[] }
}


export const projects: Project[] = [
  {
    id: 'mern-devops-automation',
    name: 'MERN DevOps Automation',
    slug: 'mern-devops-automation',
    headline: 'Automated CI/CD Deployment',
    summary:
      'Built a containerized MERN application deployment workflow using Docker, Docker Compose, Docker Hub, and AWS EC2. Integrated GitHub Actions for application validation, image builds, publishing, and deployment automation, with AWS OIDC authentication and Systems Manager (SSM) for SSH-independent deployment execution.',
    tags: [
      'MERN Stack',
      'Docker',
      'Docker Compose',
      'Docker Hub',
      'AWS EC2',
      'Ubuntu',
      'Nginx',
      'GitHub Actions',
      'AWS IAM',
      'OIDC',
      'AWS Systems Manager',
    ],
    metrics: [
      { value: 'CI/CD', label: 'GitHub Actions automation' },
      { value: '2', label: 'custom Docker images' },
      { value: 'SSM', label: 'SSH-independent deployment approach' },
    ],
    flow: [
      'GitHub Actions validates the application and builds frontend and backend Docker images',
      'Publish versioned application images to Docker Hub',
      'Use AWS OIDC and Systems Manager to execute deployment commands on EC2',
    ],
    repo: 'https://github.com/Ahmad-000/mern-devops-automation',
    diagram: {
      alt: 'GitHub source code flows into GitHub Actions for validation and Docker image builds. Images are published to Docker Hub, while AWS OIDC and Systems Manager enable deployment to an EC2 instance running the frontend, backend, and MongoDB.',
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
    headline: 'Automated AWS Deployment',
    summary:
      'Developed a DevOps workflow for deploying a containerized Todo application to AWS. Used Terraform to provision infrastructure, Ansible to configure the server and deploy services, Docker Compose to orchestrate the React frontend, Node.js backend, and MongoDB, and GitHub Actions with Docker Hub for CI/CD automation. AWS OIDC and Systems Manager provide the intended SSH-independent deployment approach.',
    tags: [
      'AWS EC2',
      'Terraform',
      'Ansible',
      'Docker',
      'Docker Compose',
      'GitHub Actions',
      'Docker Hub',
      'AWS IAM',
      'OIDC',
      'AWS Systems Manager',
      'React',
      'Node.js',
      'MongoDB',
      'Nginx',
    ],
    metrics: [
      { value: 'IaC', label: 'Terraform infrastructure provisioning' },
      { value: 'CI/CD', label: 'GitHub Actions pipeline' },
      { value: '3', label: 'application services' },
    ],
    flow: [
      'Terraform provisions the Ubuntu EC2 instance and AWS networking access rules',
      'GitHub Actions builds and publishes application images to Docker Hub',
      'Ansible configures the server and deploys Docker Compose services, with AWS OIDC and SSM integration',
    ],
    repo: 'https://github.com/Ahmad-000/todos-devops-project',
    diagram: {
      alt: 'GitHub contains the Todo application and infrastructure code. GitHub Actions builds and publishes Docker images, Terraform provisions AWS infrastructure, and Ansible deploys the containerized application to EC2. AWS OIDC and Systems Manager support deployment automation.',
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
] as const;

