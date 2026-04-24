# 📝 CKAD Practice Exam 1

> **Time limit:** 2 hours | **Pass mark:** 66%
> 
> ⚠️ Set up aliases before starting:
> ```bash
> alias k=kubectl
> export do="--dry-run=client -o yaml"
> source <(kubectl completion bash)
> ```

---

## Question 1 (4%) - Pod Creation

Create a Pod named `web-pod` in namespace `ckad-exam` with the following requirements:
- Image: `nginx:1.25`
- Label: `tier=frontend`
- Resource requests: CPU `100m`, Memory `64Mi`
- Resource limits: CPU `200m`, Memory `128Mi`

<details>
<summary>💡 Solution</summary>

```bash
kubectl create namespace ckad-exam

kubectl run web-pod \
  --image=nginx:1.25 \
  --labels="tier=frontend" \
  --requests='cpu=100m,memory=64Mi' \
  --limits='cpu=200m,memory=128Mi' \
  -n ckad-exam

# Verify
kubectl get pod web-pod -n ckad-exam
kubectl describe pod web-pod -n ckad-exam
```
</details>

---

## Question 2 (6%) - ConfigMap and Secrets

1. Create a ConfigMap named `app-config` with:
   - `APP_COLOR=blue`
   - `APP_MODE=production`

2. Create a Secret named `app-secret` with:
   - `DB_PASSWORD=mysecretpassword`

3. Create a Pod `config-pod` using `nginx:1.25` that uses both:
   - All ConfigMap keys as environment variables
   - Secret `DB_PASSWORD` as env var

<details>
<summary>💡 Solution</summary>

```bash
kubectl create configmap app-config \
  --from-literal=APP_COLOR=blue \
  --from-literal=APP_MODE=production

kubectl create secret generic app-secret \
  --from-literal=DB_PASSWORD=mysecretpassword

kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: config-pod
spec:
  containers:
  - name: nginx
    image: nginx:1.25
    envFrom:
    - configMapRef:
        name: app-config
    env:
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: app-secret
          key: DB_PASSWORD
EOF

# Verify
kubectl exec config-pod -- env | grep -E 'APP_|DB_'
```
</details>

---

## Question 3 (8%) - Multi-Container Pod

Create a Pod `multi-pod` with:
- Init container `init-setup` using `busybox` that writes `"Server Ready"` to `/work/status.txt`
- Main container `web` using `nginx:1.25` serving content from `/usr/share/nginx/html`
- Sidecar container `log-reader` using `busybox` that continuously reads `/logs/access.log`
- Shared volume between `web` and `log-reader`

<details>
<summary>💡 Solution</summary>

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: multi-pod
spec:
  volumes:
  - name: work-vol
    emptyDir: {}
  - name: log-vol
    emptyDir: {}
  initContainers:
  - name: init-setup
    image: busybox
    command: ['sh', '-c', 'echo "Server Ready" > /work/status.txt']
    volumeMounts:
    - name: work-vol
      mountPath: /work
  containers:
  - name: web
    image: nginx:1.25
    volumeMounts:
    - name: log-vol
      mountPath: /var/log/nginx
  - name: log-reader
    image: busybox
    command: ['sh', '-c', 'tail -f /logs/access.log 2>/dev/null || sleep 3600']
    volumeMounts:
    - name: log-vol
      mountPath: /logs
```
</details>

---

## Question 4 (6%) - Deployments and Rolling Updates

1. Create a Deployment `webapp` with image `nginx:1.23`, 3 replicas
2. Record the change (add annotation)
3. Update image to `nginx:1.25`
4. Verify rollout status
5. Rollback to the previous version

<details>
<summary>💡 Solution</summary>

```bash
kubectl create deployment webapp --image=nginx:1.23 --replicas=3

# Add annotation for history
kubectl annotate deployment webapp \
  kubernetes.io/change-cause="Initial deploy nginx:1.23"

# Update image
kubectl set image deployment/webapp nginx=nginx:1.25
kubectl annotate deployment webapp \
  kubernetes.io/change-cause="Updated to nginx:1.25"

# Check status
kubectl rollout status deployment/webapp

# View history
kubectl rollout history deployment/webapp

# Rollback
kubectl rollout undo deployment/webapp

# Verify
kubectl describe deployment webapp | grep Image
```
</details>

---

## Question 5 (5%) - Jobs

Create a Job named `compute-job` that:
- Runs `busybox` image
- Command: `echo "Completed" && sleep 5`
- Requires 5 successful completions
- Runs maximum 2 pods at a time
- Has a `backoffLimit` of 3

<details>
<summary>💡 Solution</summary>

```bash
kubectl create job compute-job \
  --image=busybox \
  -- sh -c "echo Completed && sleep 5"

# Edit to add completions and parallelism
kubectl patch job compute-job -p '{"spec":{"completions":5,"parallelism":2,"backoffLimit":3}}'

# OR apply full YAML:
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: compute-job
spec:
  completions: 5
  parallelism: 2
  backoffLimit: 3
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: job
        image: busybox
        command: ['sh', '-c', 'echo Completed && sleep 5']
EOF

kubectl get jobs
kubectl get pods -l job-name=compute-job
```
</details>

---

## Question 6 (5%) - CronJob

Create a CronJob `report-cron` that:
- Runs every 2 minutes
- Image: `busybox`
- Command: `date >> /tmp/report.txt`
- Keeps 3 successful job histories
- Uses `Forbid` concurrency policy

<details>
<summary>💡 Solution</summary>

```bash
kubectl create cronjob report-cron \
  --image=busybox \
  --schedule="*/2 * * * *" \
  -- sh -c "date >> /tmp/report.txt"

# Patch the settings
kubectl patch cronjob report-cron -p '{
  "spec": {
    "successfulJobsHistoryLimit": 3,
    "concurrencyPolicy": "Forbid"
  }
}'

# Verify
kubectl get cronjob report-cron
kubectl describe cronjob report-cron
```
</details>

---

## Question 7 (8%) - Security Context

Create a Pod `secure-pod` with:
- Image: `nginx:1.25`
- Must run as user ID `1000`
- Must NOT run as root
- Container: `allowPrivilegeEscalation: false`
- Container: drop ALL capabilities
- Container: `readOnlyRootFilesystem: true`
- Mount an `emptyDir` volume at `/tmp` (so the container can write)

<details>
<summary>💡 Solution</summary>

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsUser: 1000
    runAsNonRoot: true
  containers:
  - name: nginx
    image: nginx:1.25
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop: ["ALL"]
    volumeMounts:
    - name: tmp-dir
      mountPath: /tmp
    - name: var-run
      mountPath: /var/run
    - name: var-cache
      mountPath: /var/cache/nginx
  volumes:
  - name: tmp-dir
    emptyDir: {}
  - name: var-run
    emptyDir: {}
  - name: var-cache
    emptyDir: {}
```
</details>

---

## Question 8 (6%) - Service and Ingress

1. Create a Deployment `api-server` with image `nginx:1.25`, 2 replicas
2. Expose it as a ClusterIP service on port 80 targeting port 80
3. Create an Ingress that routes `api.example.com/` to `api-server` service

<details>
<summary>💡 Solution</summary>

```bash
kubectl create deployment api-server --image=nginx:1.25 --replicas=2
kubectl expose deployment api-server --port=80 --name=api-service

kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
EOF

kubectl get ingress
kubectl describe ingress api-ingress
```
</details>

---

## Question 9 (6%) - NetworkPolicy

In namespace `default`, create a NetworkPolicy `db-policy` that:
- Applies to pods with label `app=database`
- Allows INGRESS only from pods with label `app=backend` on port `5432`
- Denies all other ingress traffic

<details>
<summary>💡 Solution</summary>

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-policy
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: database
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: backend
    ports:
    - protocol: TCP
      port: 5432
```
</details>

---

## Question 10 (6%) - ServiceAccount and RBAC

1. Create a ServiceAccount `job-sa` in namespace `default`
2. Create a Role `job-manager` that can `create`, `get`, `list` Jobs in `default` namespace
3. Bind the role to the service account
4. Create a Pod `rbac-pod` using `busybox` with the service account

<details>
<summary>💡 Solution</summary>

```bash
kubectl create serviceaccount job-sa

kubectl create role job-manager \
  --verb=create,get,list \
  --resource=jobs

kubectl create rolebinding job-sa-binding \
  --role=job-manager \
  --serviceaccount=default:job-sa

kubectl run rbac-pod \
  --image=busybox \
  --serviceaccount=job-sa \
  -- sleep 3600

# Verify
kubectl auth can-i create jobs \
  --as=system:serviceaccount:default:job-sa
```
</details>

---

## Question 11 (6%) - Liveness and Readiness Probes

Create a Deployment `probe-deploy` with:
- Image: `nginx:1.25`
- **Liveness probe**: HTTP GET `/healthz` port 80, initial delay 15s, period 10s
- **Readiness probe**: HTTP GET `/` port 80, initial delay 5s, period 5s
- **Startup probe**: HTTP GET `/` port 80, failureThreshold 30, period 10s

<details>
<summary>💡 Solution</summary>

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: probe-deploy
spec:
  replicas: 1
  selector:
    matchLabels:
      app: probe-deploy
  template:
    metadata:
      labels:
        app: probe-deploy
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        startupProbe:
          httpGet:
            path: /
            port: 80
          failureThreshold: 30
          periodSeconds: 10
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
</details>

---

## Question 12 (4%) - Debugging

A Pod `broken-pod` is failing. Find out why and fix it.

```bash
# The broken pod
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: broken-pod
spec:
  containers:
  - name: app
    image: nginx:WRONG_TAG
EOF
```

<details>
<summary>💡 Solution</summary>

```bash
# Diagnose
kubectl get pod broken-pod
kubectl describe pod broken-pod
# Look for: ImagePullBackOff or ErrImagePull in Events

# Fix: Update the image tag
kubectl delete pod broken-pod
kubectl run broken-pod --image=nginx:1.25

# OR patch the pod (not possible for image directly, need to delete+recreate)
# For a deployment:
kubectl set image deployment/broken-deploy app=nginx:1.25
```
</details>

---

## 🎯 Exam Score Card

| Question | Topic | Points | Done? |
|----------|-------|--------|-------|
| 1 | Pod Creation | 4% | ☐ |
| 2 | ConfigMap + Secrets | 6% | ☐ |
| 3 | Multi-Container Pod | 8% | ☐ |
| 4 | Deployments + Rollouts | 6% | ☐ |
| 5 | Jobs | 5% | ☐ |
| 6 | CronJobs | 5% | ☐ |
| 7 | Security Context | 8% | ☐ |
| 8 | Service + Ingress | 6% | ☐ |
| 9 | NetworkPolicy | 6% | ☐ |
| 10 | RBAC | 6% | ☐ |
| 11 | Probes | 6% | ☐ |
| 12 | Debugging | 4% | ☐ |
| **Total** | | **70%** | |

