<div align="center">

# 🎯 CKAD Exam Preparation Guide 2026

### Certified Kubernetes Application Developer (CKAD) — CNCF v1.35

[![CKAD](https://img.shields.io/badge/CKAD-v1.35-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://www.cncf.io/certification/ckad/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)
[![GitHub Stars](https://img.shields.io/github/stars/ChathurangaVKD/ckad-exam-prep?style=for-the-badge&color=gold)](https://github.com/ChathurangaVKD/ckad-exam-prep/stargazers)

**The most comprehensive free CKAD study guide — all 5 exam domains, 50+ YAML manifests, 30+ practice questions, kubectl cheatsheet, and a proven 2-week study plan to pass the CNCF CKAD certification exam.**

🌐 **[Live Website](https://chathurangavkd.github.io/ckad-exam-prep/)** &nbsp;·&nbsp;
[📚 Start Learning](#-curriculum-domains) &nbsp;·&nbsp;
[🧪 Practice Exams](#-practice-exams) &nbsp;·&nbsp;
[⚡ Quick Reference](#-quick-reference) &nbsp;·&nbsp;
[❓ FAQ](#-faq)

</div>

---

## 🎓 CKAD Exam Overview

> The **CKAD (Certified Kubernetes Application Developer)** is a performance-based certification by the **Cloud Native Computing Foundation (CNCF)**. You complete real tasks in a live Kubernetes cluster — no multiple choice.

| Property | Details |
|----------|---------|
| **Certification** | Certified Kubernetes Application Developer (CKAD) |
| **Provider** | Cloud Native Computing Foundation (CNCF) / Linux Foundation |
| **Duration** | 2 Hours |
| **Passing Score** | 66% |
| **Format** | Performance-based (hands-on tasks in a live Kubernetes cluster) |
| **Kubernetes Version** | v1.35 |
| **Allowed Resources** | kubernetes.io/docs, helm.sh/docs |
| **Cost** | $395 USD (includes one free retake) |
| **Validity** | 2 Years |

---

## 📚 Curriculum Domains

| # | Domain | Weight | Guide |
|---|--------|--------|-------|
| 1 | [Application Design and Build](./01-application-design-build/README.md) | **20%** | Containers, Jobs, CronJobs, Multi-container pods, Volumes |
| 2 | [Application Deployment](./02-application-deployment/README.md) | **20%** | Deployments, Rolling updates, Helm, Kustomize, DaemonSets |
| 3 | [Application Observability and Maintenance](./03-observability-maintenance/README.md) | **15%** | Probes, Logging, Monitoring, Debugging, API deprecations |
| 4 | [Application Environment, Configuration and Security](./04-environment-config-security/README.md) | **25%** | ConfigMaps, Secrets, RBAC, SecurityContext, ResourceQuota |
| 5 | [Services and Networking](./05-services-networking/README.md) | **20%** | Services, DNS, Ingress, NetworkPolicy |

> 💡 **Domain 4 (Security) has the highest weight at 25% — prioritize it!**

---

## 📁 Project Structure

```
ckad-exam-prep/
├── README.md
├── index.js                                  ← Interactive CLI study guide
├── docs/                                     ← GitHub Pages website (SEO-optimized)
│
├── 01-application-design-build/              ← Domain 1 (20%)
│   ├── README.md                             ← Full guide with exercises
│   ├── containers/Dockerfile
│   ├── containers/Dockerfile.multistage
│   ├── jobs/job-basic.yaml
│   ├── cronjobs/cronjob-basic.yaml
│   ├── multi-container-pods/sidecar-pod.yaml
│   ├── multi-container-pods/ambassador-adapter-pods.yaml
│   └── init-containers/init-pod.yaml
│
├── 02-application-deployment/                ← Domain 2 (20%)
│   ├── README.md
│   ├── deployments/deployment-basic.yaml
│   ├── deployments/daemonset.yaml
│   ├── deployments/statefulset.yaml
│   ├── rolling-updates/canary-deployment.yaml
│   └── kustomize/base/ + overlays/production/
│
├── 03-observability-maintenance/             ← Domain 3 (15%)
│   ├── README.md
│   └── probes/ (HTTP, TCP, exec probes)
│
├── 04-environment-config-security/           ← Domain 4 (25%) ← Most Important!
│   ├── README.md
│   ├── configmaps/configmap-demo.yaml
│   ├── secrets/secret-demo.yaml
│   ├── security-contexts/security-context-pod.yaml
│   ├── service-accounts/sa-clusterrole.yaml
│   ├── rbac/rbac-demo.yaml
│   └── resource-limits/limitrange-quota.yaml
│
├── 05-services-networking/                   ← Domain 5 (20%)
│   ├── README.md
│   ├── services/services-all-types.yaml
│   ├── ingress/ingress-tls.yaml
│   └── network-policies/network-policies.yaml
│
├── practice-exams/
│   ├── exam-01/README.md   ← 12 questions ⭐⭐⭐ Medium
│   ├── exam-02/README.md   ← 10 questions ⭐⭐⭐⭐ Hard
│   └── exam-03/README.md   ← 8 questions  ⭐⭐⭐⭐⭐ Expert
│
└── quick-reference/
    ├── kubectl-cheatsheet.md   ← Every kubectl command you need
    ├── yaml-templates.md       ← Copy-paste YAML for all resources
    └── exam-tips.md            ← Strategy, mistakes, checklist
```

---

## ⚡ Quick Start

### Prerequisites

```bash
# Install a local Kubernetes cluster (choose one)
brew install minikube && minikube start    # macOS — easiest option
# OR: kind, k3s, Docker Desktop Kubernetes

kubectl get nodes    # Verify cluster is running
```

### Clone and Use

```bash
git clone https://github.com/ChathurangaVKD/ckad-exam-prep.git
cd ckad-exam-prep

# Launch the interactive CLI guide
node index.js

# Apply any manifest to practice
kubectl apply -f 01-application-design-build/jobs/job-basic.yaml
kubectl get jobs
kubectl delete -f 01-application-design-build/jobs/job-basic.yaml
```

### ⚡ Exam Day Setup (Do This First!)

```bash
# Set up these aliases at the START of your exam session
alias k=kubectl
export do="--dry-run=client -o yaml"
export now="--force --grace-period 0"
source <(kubectl completion bash)    # bash
complete -F __start_kubectl k

# Time-saving usage:
k run pod1 --image=nginx $do > pod1.yaml    # Generate YAML in 2 seconds
k delete pod pod1 $now                       # Force delete stuck pods
k get pods -A                                # All namespaces shortcut
```

---

## 🧪 Practice Exams

| Exam | Questions | Topics | Difficulty |
|------|-----------|--------|------------|
| [Exam 1](./practice-exams/exam-01/README.md) | 12 | Pods, ConfigMaps, Secrets, Deployments, Jobs, RBAC, Probes, NetworkPolicy | ⭐⭐⭐ Medium |
| [Exam 2](./practice-exams/exam-02/README.md) | 10 | PVCs, Helm, Kustomize, DaemonSets, ResourceQuotas, Canary, Debugging | ⭐⭐⭐⭐ Hard |
| [Exam 3](./practice-exams/exam-03/README.md) | 8 | Full-stack apps, StatefulSets, Complex RBAC, Security hardening | ⭐⭐⭐⭐⭐ Expert |

Each practice exam includes:
- ⏱ Timed 2-hour format
- 💡 Hidden solution hints (click to reveal)
- ✅ Verification commands
- 📊 Score tracker

---

## ⚡ Quick Reference

| File | Contents |
|------|----------|
| [kubectl-cheatsheet.md](./quick-reference/kubectl-cheatsheet.md) | Every kubectl command organized by resource type — pods, deployments, services, RBAC, jobs, volumes, debugging |
| [yaml-templates.md](./quick-reference/yaml-templates.md) | Copy-paste YAML templates for Pod, Deployment, Service, Ingress, NetworkPolicy, RBAC, PVC, Job, CronJob, Secret, ConfigMap |
| [exam-tips.md](./quick-reference/exam-tips.md) | Time management strategy, common mistakes, kubectl aliases, allowed bookmarks, final domain checklist |

---

## 📅 2-Week Study Plan

| Week | Day | Focus | Resource |
|------|-----|-------|---------|
| **Week 1** | Day 1–2 | Domain 1: Containers, Jobs, Multi-container pods | [Guide →](./01-application-design-build/README.md) |
| | Day 3–4 | Domain 2: Deployments, Helm, Kustomize | [Guide →](./02-application-deployment/README.md) |
| | Day 5 | Domain 3: Probes, Logging, Debugging | [Guide →](./03-observability-maintenance/README.md) |
| | Day 6–7 | Practice Exam 1 + review all mistakes | [Exam →](./practice-exams/exam-01/README.md) |
| **Week 2** | Day 8–9 | Domain 4: ConfigMaps, Secrets, RBAC, SecurityContext | [Guide →](./04-environment-config-security/README.md) |
| | Day 10–11 | Domain 5: Services, Ingress, NetworkPolicy | [Guide →](./05-services-networking/README.md) |
| | Day 12 | Practice Exam 2 | [Exam →](./practice-exams/exam-02/README.md) |
| | Day 13 | Practice Exam 3 (Hard Mode) | [Exam →](./practice-exams/exam-03/README.md) |
| | Day 14 | Quick reference review + kubectl drills + rest | [Tips →](./quick-reference/exam-tips.md) |

---

## 🔗 Resources

### Official (Allowed During Exam)

- 📘 [CKAD Curriculum v1.35 (PDF)](https://github.com/cncf/curriculum/blob/master/CKAD_Curriculum_v1.35.pdf)
- 📗 [Kubernetes Documentation](https://kubernetes.io/docs) ← **Allowed during exam**
- ⛵ [Helm Documentation](https://helm.sh/docs) ← **Allowed during exam**
- 🔧 [kubectl Cheatsheet (Official)](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

### Practice Environments

- 🖥 [Killer.sh CKAD Simulator](https://killer.sh/ckad) — Closest to real exam (included with exam purchase)
- 🎮 [KodeKloud CKAD Labs](https://kodekloud.com/courses/certified-kubernetes-application-developer-ckad/) — Great hands-on labs
- 🌐 [Play with Kubernetes](https://labs.play-with-k8s.com/) — Free browser-based cluster
- 🔵 [Minikube](https://minikube.sigs.k8s.io/) — Local single-node cluster

### Books and Courses

- 📚 *Certified Kubernetes Application Developer (CKAD) Study Guide* — Benjamin Muschko (O'Reilly)
- 🎥 [Mumshad Mannambeth's CKAD Course on Udemy](https://www.udemy.com/course/certified-kubernetes-application-developer/)

---

## ❓ FAQ

<details>
<summary><strong>What is the CKAD exam?</strong></summary>

The **CKAD (Certified Kubernetes Application Developer)** is a hands-on, performance-based certification by the **Cloud Native Computing Foundation (CNCF)**. You are given a live Kubernetes cluster and must complete real tasks — no multiple choice. It validates you can design, build, configure and expose cloud-native applications using Kubernetes.

</details>

<details>
<summary><strong>What is the CKAD passing score and duration?</strong></summary>

- **Duration:** 2 hours
- **Passing score:** 66%
- **Format:** Performance-based in a live Kubernetes environment
- **Retake:** One free retake included with purchase
- **Results:** Available within 24 hours

</details>

<details>
<summary><strong>What are the 5 CKAD exam domains?</strong></summary>

1. **Application Design and Build (20%)** — Containers, Dockerfiles, Jobs, CronJobs, multi-container pods (sidecar, ambassador, adapter), init containers, volumes
2. **Application Deployment (20%)** — Deployments, rolling updates, blue-green/canary, Helm, Kustomize, DaemonSets, StatefulSets
3. **Application Observability and Maintenance (15%)** — Liveness/Readiness/Startup probes, logging, kubectl top, debugging, API deprecations
4. **Application Environment, Configuration and Security (25%)** — ConfigMaps, Secrets, SecurityContext, RBAC, ServiceAccounts, ResourceQuota, LimitRange
5. **Services and Networking (20%)** — Service types, DNS, Ingress, NetworkPolicies

</details>

<details>
<summary><strong>What kubectl aliases should I set up on exam day?</strong></summary>

```bash
alias k=kubectl
export do="--dry-run=client -o yaml"
export now="--force --grace-period 0"
source <(kubectl completion bash)
complete -F __start_kubectl k
```

These save significant time: `k run pod1 --image=nginx $do > pod.yaml` generates a pod YAML in under 2 seconds.

</details>

<details>
<summary><strong>What documentation is allowed during the CKAD exam?</strong></summary>

You may have **one additional browser tab** open with these approved resources only:
- `kubernetes.io/docs`
- `kubernetes.io/blog`
- `helm.sh/docs`

No personal notes, no other websites. Bookmark the [kubectl cheatsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/) before your exam.

</details>

<details>
<summary><strong>What is the difference between CKAD and CKA?</strong></summary>

| | CKAD | CKA |
|-|------|-----|
| **Focus** | Application development on Kubernetes | Kubernetes cluster administration |
| **Topics** | Pods, deployments, services, configmaps, security | Cluster setup, networking (CNI), etcd, upgrades |
| **Audience** | Developers | Platform/DevOps engineers |
| **Difficulty** | Intermediate | Intermediate–Advanced |

Many people take CKAD before CKA as a stepping stone.

</details>

<details>
<summary><strong>How do I create a Kubernetes resource quickly on exam day?</strong></summary>

Use **imperative commands** instead of writing YAML from scratch:

```bash
# Pods
kubectl run nginx --image=nginx:1.25

# Deployments
kubectl create deployment myapp --image=nginx --replicas=3

# Services
kubectl expose deployment myapp --port=80 --type=ClusterIP

# ConfigMaps
kubectl create configmap my-cm --from-literal=KEY=VALUE

# Secrets
kubectl create secret generic my-secret --from-literal=password=secret

# Jobs
kubectl create job my-job --image=busybox -- echo hello

# RBAC
kubectl create role my-role --verb=get,list --resource=pods
kubectl create rolebinding my-rb --role=my-role --serviceaccount=default:my-sa
```

</details>

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- 🐛 Fix incorrect commands or YAML
- ➕ Add more practice questions
- 📝 Improve explanations
- 🆕 Add examples for new Kubernetes features

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**⭐ If this helped you pass your CKAD exam, please star this repo — it helps others find it!**

🌐 [Website](https://chathurangavkd.github.io/ckad-exam-prep/) &nbsp;·&nbsp; Made with ❤️ by [Dasun Chathuranga](https://github.com/ChathurangaVKD)

*CKAD™ is a trademark of the Linux Foundation. This is an independent community study resource.*

</div>
