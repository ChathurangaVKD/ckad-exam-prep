# 🎯 CKAD Exam Tips & Strategies

## ⚡ Before You Start (First 5 Minutes)

```bash
# 1. Set up aliases - DO THIS IMMEDIATELY
alias k=kubectl
export do="--dry-run=client -o yaml"
export now="--force --grace-period 0"
source <(kubectl completion bash)
complete -F __start_kubectl k

# 2. Verify cluster is working
kubectl get nodes
kubectl cluster-info

# 3. Understand the exam environment
# - Multiple clusters/contexts
# - Each question specifies which context to use
# - Switch context: kubectl config use-context CONTEXT_NAME
```

---

## 🏆 Exam Strategy

### Time Management
- **2 hours = 120 minutes** for ~15-20 questions
- Average: **6-8 minutes per question**
- **Skip hard questions** - mark them, come back later
- Always **verify your work** before moving on

### Question Approach
1. Read question fully, note: namespace, name, requirements
2. Switch to the correct context: `kubectl config use-context NAME`
3. Switch to correct namespace: `kubectl config set-context --current --namespace=NS`
4. Solve the question
5. **Verify** with `kubectl get` and `kubectl describe`

### Point Strategy
- Do easy questions first (2-4% each)
- Attempt all questions - partial credit is given
- Focus on high-value questions (8-10%) carefully

---

## 🔑 Most Tested Topics

### 1. Imperative Commands (Save Time!)
```bash
# Instead of writing YAML, use:
kubectl run pod1 --image=nginx                            # Pod
kubectl create deployment d1 --image=nginx --replicas=3  # Deployment
kubectl expose deployment d1 --port=80 --type=NodePort   # Service
kubectl create configmap cm1 --from-literal=k=v          # ConfigMap
kubectl create secret generic s1 --from-literal=k=v      # Secret
kubectl create job j1 --image=busybox -- echo hi         # Job
kubectl create cronjob cj1 --image=busybox --schedule="* * * * *" -- date  # CronJob
kubectl create sa sa1                                     # ServiceAccount
kubectl create role r1 --verb=get --resource=pods        # Role
kubectl create rolebinding rb1 --role=r1 --user=u1       # RoleBinding
```

### 2. Generate YAML from Imperative Commands
```bash
# Template trick - generate and edit
kubectl run pod1 --image=nginx $do > pod1.yaml
# Edit pod1.yaml to add what's needed
kubectl apply -f pod1.yaml
```

### 3. Critical Patterns to Memorize

#### Pod with ConfigMap env vars
```yaml
envFrom:
- configMapRef:
    name: my-cm
```

#### Pod with Secret single key
```yaml
env:
- name: MY_VAR
  valueFrom:
    secretKeyRef:
      name: my-secret
      key: my-key
```

#### Security Context (most common combo)
```yaml
securityContext:        # pod level
  runAsUser: 1000
  runAsNonRoot: true
# container level
securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop: ["ALL"]
```

#### Liveness + Readiness Probes
```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 80
  initialDelaySeconds: 15
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## 🚨 Common Mistakes to Avoid

### 1. Wrong `restartPolicy` for Jobs
```yaml
# Jobs MUST use Never or OnFailure (NOT Always)
restartPolicy: Never    # ✅
restartPolicy: Always   # ❌ - Will cause "Invalid value" error
```

### 2. Forgetting selector in Deployment
```yaml
# selector.matchLabels MUST match template.metadata.labels
selector:
  matchLabels:
    app: myapp    # ← Must match ↓
template:
  metadata:
    labels:
      app: myapp  # ← Must match ↑
```

### 3. Wrong namespace
```bash
# Always check/set namespace
kubectl config set-context --current --namespace=TARGET_NS
# OR use -n flag on every command
kubectl get pods -n TARGET_NS
```

### 4. Not verifying work
```bash
# Always verify:
kubectl get pod NAME
kubectl describe pod NAME
kubectl get events --sort-by='.lastTimestamp' | tail -20
```

### 5. Forgetting `apiGroup` in RBAC
```yaml
roleRef:
  apiGroup: rbac.authorization.k8s.io  # Don't forget this!
  kind: Role
  name: my-role
```

### 6. ConfigMap mounted volume vs env vars
```yaml
# Volume mount (for file content)
volumes:
- name: config-vol
  configMap:
    name: my-cm
containers:
- volumeMounts:
  - name: config-vol
    mountPath: /etc/config    # Each key becomes a file

# Env var (for key-value)
envFrom:
- configMapRef:
    name: my-cm               # Each key becomes env var
```

---

## 📚 kubectl explain - Your Built-in Docs

```bash
# Use this when you forget the exact YAML structure!
kubectl explain pod.spec
kubectl explain pod.spec.containers
kubectl explain pod.spec.containers.livenessProbe
kubectl explain pod.spec.containers.securityContext
kubectl explain pod.spec.securityContext
kubectl explain pod.spec.volumes
kubectl explain deployment.spec.strategy
kubectl explain networkpolicy.spec
kubectl explain job.spec
kubectl explain cronjob.spec.jobTemplate
kubectl explain pvc.spec
kubectl explain service.spec
kubectl explain ingress.spec.rules
```

---

## 🎓 Kubernetes Documentation Bookmarks

Allowed during exam: https://kubernetes.io/docs

### Most Useful Pages
- https://kubernetes.io/docs/concepts/workloads/pods/
- https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
- https://kubernetes.io/docs/concepts/configuration/configmap/
- https://kubernetes.io/docs/concepts/configuration/secret/
- https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
- https://kubernetes.io/docs/concepts/services-networking/service/
- https://kubernetes.io/docs/concepts/services-networking/ingress/
- https://kubernetes.io/docs/concepts/services-networking/network-policies/
- https://kubernetes.io/docs/reference/access-authn-authz/rbac/
- https://kubernetes.io/docs/tasks/run-application/run-stateless-application-deployment/
- https://kubernetes.io/docs/concepts/workloads/controllers/job/
- https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
- https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
- https://kubernetes.io/docs/reference/kubectl/cheatsheet/

---

## 🏅 Final Checklist

### Domain 1 - Application Design and Build (20%)
- [ ] Build/modify container images (Dockerfile)
- [ ] Multi-stage builds
- [ ] Pods: create, labels, env vars
- [ ] Jobs: completions, parallelism, backoffLimit, restartPolicy
- [ ] CronJobs: schedule syntax, concurrencyPolicy
- [ ] Multi-container pods: sidecar, ambassador, adapter
- [ ] Init containers
- [ ] Volumes: emptyDir, hostPath, PVC, configMap, secret

### Domain 2 - Application Deployment (20%)
- [ ] Deployments: create, scale, update strategy
- [ ] Rolling updates and rollbacks
- [ ] Blue-green deployments
- [ ] Canary deployments
- [ ] DaemonSets
- [ ] StatefulSets
- [ ] Helm: install, upgrade, rollback, uninstall
- [ ] Kustomize: base, overlays, patches

### Domain 3 - Observability (15%)
- [ ] Liveness, readiness, startup probes (HTTP, TCP, exec, gRPC)
- [ ] Pod logging (logs, follow, previous, containers)
- [ ] kubectl top (pods, nodes)
- [ ] Debugging: describe, events, exec, debug
- [ ] Port-forward
- [ ] API deprecations

### Domain 4 - Environment, Config, Security (25%)
- [ ] ConfigMaps: create, mount as env, mount as volume
- [ ] Secrets: create, decode, use in pods, image pull secrets
- [ ] Security contexts: runAsUser, runAsNonRoot, capabilities, readOnlyRootFilesystem
- [ ] ServiceAccounts: create, assign to pod, token
- [ ] RBAC: Role, ClusterRole, RoleBinding, ClusterRoleBinding
- [ ] auth can-i: check permissions
- [ ] Resource requests and limits
- [ ] LimitRange and ResourceQuota
- [ ] CRDs (basic understanding)

### Domain 5 - Services and Networking (20%)
- [ ] Service types: ClusterIP, NodePort, LoadBalancer, ExternalName
- [ ] Headless services
- [ ] DNS: service and pod DNS resolution
- [ ] Ingress: basic, path-based, virtual hosts, TLS
- [ ] NetworkPolicy: ingress, egress, podSelector, namespaceSelector, ipBlock
- [ ] Service debugging: endpoints, label matching

