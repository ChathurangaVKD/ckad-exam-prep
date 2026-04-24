#!/usr/bin/env node

/**
 * CKAD Study Guide CLI
 * Run: node index.js
 */

const topics = {
  '1': {
    name: 'Application Design and Build (20%)',
    subtopics: [
      'Container images & Dockerfiles',
      'Jobs & CronJobs',
      'Multi-container Pod patterns (Sidecar, Ambassador, Adapter)',
      'Init Containers',
      'Volumes (emptyDir, hostPath, PVC)',
    ],
    file: '01-application-design-build/README.md',
  },
  '2': {
    name: 'Application Deployment (20%)',
    subtopics: [
      'Deployments & ReplicaSets',
      'Rolling Updates & Rollbacks',
      'Blue-Green & Canary Deployments',
      'DaemonSets & StatefulSets',
      'Helm Package Manager',
      'Kustomize',
    ],
    file: '02-application-deployment/README.md',
  },
  '3': {
    name: 'Application Observability and Maintenance (15%)',
    subtopics: [
      'Liveness, Readiness & Startup Probes',
      'Logging (kubectl logs)',
      'Monitoring (kubectl top)',
      'Debugging Pods & Nodes',
      'API Deprecations',
    ],
    file: '03-observability-maintenance/README.md',
  },
  '4': {
    name: 'Application Environment, Configuration and Security (25%)',
    subtopics: [
      'ConfigMaps',
      'Secrets',
      'Security Contexts',
      'Service Accounts',
      'RBAC (Role, ClusterRole, RoleBinding)',
      'Resource Requests, Limits & Quotas',
      'Custom Resource Definitions (CRDs)',
    ],
    file: '04-environment-config-security/README.md',
  },
  '5': {
    name: 'Services and Networking (20%)',
    subtopics: [
      'Service Types (ClusterIP, NodePort, LoadBalancer)',
      'DNS Resolution',
      'Ingress Rules',
      'Network Policies',
      'Troubleshooting Services',
    ],
    file: '05-services-networking/README.md',
  },
};

const commands = {
  quickref: [
    'quick-reference/kubectl-cheatsheet.md',
    'quick-reference/yaml-templates.md',
    'quick-reference/exam-tips.md',
  ],
  exams: [
    'practice-exams/exam-01/README.md',
    'practice-exams/exam-02/README.md',
    'practice-exams/exam-03/README.md',
  ],
};

console.log('');
console.log('╔════════════════════════════════════════════════════╗');
console.log('║        🎯 CKAD Exam Preparation Guide              ║');
console.log('║    Certified Kubernetes Application Developer       ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log('');
console.log('📚 CURRICULUM DOMAINS:');
console.log('─────────────────────────────────────────────────────');

Object.entries(topics).forEach(([key, topic]) => {
  console.log(`\n  [${key}] ${topic.name}`);
  topic.subtopics.forEach(sub => {
    console.log(`      • ${sub}`);
  });
  console.log(`      📁 → ${topic.file}`);
});

console.log('');
console.log('─────────────────────────────────────────────────────');
console.log('📖 QUICK REFERENCE:');
commands.quickref.forEach(f => console.log(`  → ${f}`));

console.log('');
console.log('🧪 PRACTICE EXAMS:');
commands.exams.forEach((f, i) => console.log(`  [Exam ${i + 1}] → ${f}`));

console.log('');
console.log('─────────────────────────────────────────────────────');
console.log('⚡ EXAM DAY SETUP:');
console.log('');
console.log('  alias k=kubectl');
console.log('  export do="--dry-run=client -o yaml"');
console.log('  export now="--force --grace-period 0"');
console.log('  source <(kubectl completion bash)');
console.log('  complete -F __start_kubectl k');
console.log('');
console.log('🎓 Good luck on your CKAD exam! You\'ve got this! 💪');
console.log('');
