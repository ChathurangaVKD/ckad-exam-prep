<div align="center">
# 🎯 CKAD Exam Preparation Guide
### Certified Kubernetes Application Developer (v1.35)
[![CKAD](https://img.shields.io/badge/CKAD-v1.35-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://www.cncf.io/certification/ckad/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)
**A comprehensive, hands-on CKAD exam preparation guide with YAML manifests, imperative commands, practice exams, and quick-reference cheatsheets.**
[📚 Start Learning](#-curriculum-domains) · [🧪 Practice Exams](#-practice-exams) · [⚡ Quick Reference](#-quick-reference)
</div>
---
## 🎓 Exam Overview
| Property | Details |
|----------|---------|
| **Exam Name** | Certified Kubernetes Application Developer (CKAD) |
| **Provider** | Cloud Native Computing Foundation (CNCF) |
| **Duration** | 2 Hours |
| **Passing Score** | 66% |
| **Format** | Performance-based (hands-on tasks in a live cluster) |
| **Kubernetes Version** | v1.35 |
| **Allowed Docs** | kubernetes.io/docs, helm.sh/docs |
---
## 📚 Curriculum Domains
| # | Domain | Weight | Folder |
|---|--------|--------|--------|
| 1 | [Application Design and Build](./01-application-design-build/README.md) | **20%** | `01-application-design-build/` |
| 2 | [Application Deployment](./02-application-deployment/README.md) | **20%** | `02-application-deployment/` |
| 3 | [Application Observability and Maintenance](./03-observability-maintenance/README.md) | **15%** | `03-observability-maintenance/` |
| 4 | [Application Environment, Configuration and Security](./04-environment-config-security/README.md) | **25%** | `04-environment-config-security/` |
| 5 | [Services and Networking](./05-services-networking/README.md) | **20%** | `05-services-networking/` |
---
## 📁 Project Structure
```
ckad-exam-prep/
├── 📄 README.md
├── ⚡ index.js                               ← CLI study guide launcher
├── 📚 01-application-design-build/
│   ├── README.md                             ← Full domain guide with exercises
│   ├── containers/Dockerfile
│   ├── containers/Dockerfile.multistage
│   ├── jobs/job-basic.yaml
│   ├── cronjobs/cronjob-basic.yaml
│   ├── multi-container-pods/sidecar-pod.yaml
│   ├── multi-container-pods/ambassador-adapter-pods.yaml
│   └── init-containers/init-pod.yaml
├── 🚀 02-application-deployment/
│   ├── README.md
│   ├── deployments/deployment-basic.yaml
│   ├── deployments/daemonset.yaml
│   ├── deployments/statefulset.yaml
│   ├── rolling-updates/canary-deployment.yaml
│   └── kustomize/base/ + overlays/production/
├── 🔭 03-observability-maintenance/
│   ├── README.md
│   └── probes/ (HTTP, TCP, exec probes)
├── 🔐 04-environment-config-security/
│   ├── README.md
│   ├── configmaps/configmap-demo.yaml
│   ├── secrets/secret-demo.yaml
│   ├── security-contexts/security-context-pod.yaml
│   ├── service-accounts/sa-clusterrole.yaml
│   ├── rbac/rbac-demo.yaml
│   └── resource-limits/limitrange-quota.yaml
├── 🌐 05-services-networking/
│   ├── README.md
│   ├── services/services-all-types.yaml
│   ├── ingress/ingress-tls.yaml
│   └── network-policies/network-policies.yaml
├── 🧪 practice-exams/
│   ├── exam-01/README.md  ← 12 questions (⭐⭐⭐)
│   ├── exam-02/README.md  ← 10 questions (⭐⭐⭐⭐)
│   └── exam-03/README.md  ← 8 questions  (⭐⭐⭐⭐⭐ Hard)
└── ⚡ quick-reference/
    ├── kubectl-cheatsheet.md
    ├── yaml-templates.md
    └── exam-tips.md
```
---
## ⚡ Quick Start
### Prerequisites
```bash
# Install a local Kubernetes cluster
brew install minikube   # macOS
minikube start
kubectl get nodes
```
### Clone and Explore
```bash
git clone https://github.com/ChathurangaVKD/ckad-exam-prep.git
cd ckad-exam-prep
# Launch the interactive study guide
node index.js
# Apply any example to practice
kubectl apply -f 01-application-design-build/jobs/job-basic.yaml
kubectl get jobs
kubectl delete -f 01-application-design-build/jobs/job-basic.yaml
```
### Exam Day Setup
```bash
# ⚡ Run these at the start of every exam session
alias k=kubectl
export do="--dry-run=client -o yaml"
export now="--force --grace-period 0"
source <(kubectl completion bash)
complete -F __start_kubectl k
```
---
## 🧪 Practice Exams
| Exam | Questions | Difficulty |
|------|-----------|------------|
| [Exam 1](./practice-exams/exam-01/README.md) | 12 | ⭐⭐⭐ Medium |
| [Exam 2](./practice-exams/exam-02/README.md) | 10 | ⭐⭐⭐⭐ Hard |
| [Exam 3](./practice-exams/exam-03/README.md) | 8 | ⭐⭐⭐⭐⭐ Expert |
Each exam has timed format, hidden solutions, and score tracking.
---
## ⚡ Quick Reference
| File | Contents |
|------|----------|
| [kubectl-cheatsheet.md](./quick-reference/kubectl-cheatsheet.md) | All kubectl commands by resource type |
| [yaml-templates.md](./quick-reference/yaml-templates.md) | Copy-paste YAML templates |
| [exam-tips.md](./quick-reference/exam-tips.md) | Strategy, common mistakes, final checklist |
---
## 📅 2-Week Study Plan
| Week | Days | Focus |
|------|------|-------|
| **Week 1** | Day 1–2 | Domain 1: Application Design & Build |
| | Day 3–4 | Domain 2: Deployments, Helm, Kustomize |
| | Day 5 | Domain 3: Observability & Debugging |
| | Day 6–7 | Practice Exam 1 + review |
| **Week 2** | Day 8–9 | Domain 4: Config, Secrets, Security, RBAC |
| | Day 10–11 | Domain 5: Services & Networking |
| | Day 12 | Practice Exam 2 |
| | Day 13 | Practice Exam 3 (Hard Mode) |
| | Day 14 | Review + rest |
---
## 🔗 Resources
### Official (Allowed During Exam)
- 📘 [CKAD Curriculum v1.35](https://github.com/cncf/curriculum/blob/master/CKAD_Curriculum_v1.35.pdf)
- 📗 [Kubernetes Documentation](https://kubernetes.io/docs)
- ⛵ [Helm Documentation](https://helm.sh/docs)
- 🔧 [kubectl Cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
### Practice Environments
- 🖥 [Killer.sh CKAD Simulator](https://killer.sh/ckad) — Most realistic
- 🎮 [KodeKloud CKAD Labs](https://kodekloud.com/courses/certified-kubernetes-application-developer-ckad/)
- 🌐 [Play with Kubernetes](https://labs.play-with-k8s.com/)
---
## 🤝 Contributing
Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).
- 🐛 Fix typos or incorrect commands  
- ➕ Add more practice questions  
- 📝 Improve explanations  
- 🆕 Add examples for new Kubernetes features
---
## 📄 License
MIT License — see [LICENSE](LICENSE) for details.
---
<div align="center">
**⭐ If this helped you pass your CKAD exam, please star this repo!**
Made with ❤️ by [Dasun Chathuranga](https://github.com/ChathurangaVKD)
</div>
