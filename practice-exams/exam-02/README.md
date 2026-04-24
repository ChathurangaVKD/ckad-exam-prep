# 📝 CKAD Practice Exam 2

> **Time limit:** 2 hours | **Pass mark:** 66%

---

## Question 1 (5%) - Persistent Volumes

Create a PersistentVolumeClaim `data-pvc` with:
- `ReadWriteOnce` access mode
- Storage request: `256Mi`
- StorageClassName: `standard`

Then create a Pod `pvc-pod` using `nginx:1.25` that mounts it at `/data`.

<details>
<summary>💡 Solution</summary>

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 256Mi
---
apiVersion: v1
kind: Pod
metadata:
  name: pvc-pod
spec:
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: data-pvc
  containers:
  - name: nginx
    image: nginx:1.25
    volumeMounts:
    - name: data
      mountPath: /data
```

```bash
kubectl apply -f pvc-pod.yaml
kubectl get pvc data-pvc
kubectl get pod pvc-pod
```
</details>

---

## Question 2 (5%) - Helm

1. Add the Bitnami Helm repository
2. Install a release named `my-apache` using `bitnami/apache` chart
3. Upgrade the release to set `replicaCount=2`
4. Verify the release
5. Get the values used

<details>
<summary>💡 Solution</summary>

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

helm install my-apache bitnami/apache

helm upgrade my-apache bitnami/apache --set replicaCount=2

helm status my-apache
helm get values my-apache
helm list
```
</details>

---

## Question 3 (7%) - Kustomize

Given this base deployment, create an overlay for `staging` that:
- Sets replicas to 2
- Changes the image tag to `1.25`
- Adds namespace prefix `staging-`

<details>
<summary>💡 Solution</summary>

```bash
mkdir -p kustomize/base kustomize/overlays/staging

# base/deployment.yaml
cat > kustomize/base/deployment.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
      - name: nginx
        image: nginx:1.23
EOF

cat > kustomize/base/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
- deployment.yaml
EOF

cat > kustomize/overlays/staging/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
- ../../base
namePrefix: staging-
replicas:
- name: webapp
  count: 2
images:
- name: nginx
  newTag: "1.25"
EOF

kubectl apply -k kustomize/overlays/staging
```
</details>

---

## Question 4 (8%) - DaemonSet

Create a DaemonSet `monitoring-agent` that:
- Runs `busybox` image with command `sleep 3600`
- Mounts `/var/log` from the host node at `/host-logs` (read-only)
- Has label `type=monitoring`
- Tolerates the `node-role.kubernetes.io/control-plane:NoSchedule` taint

<details>
<summary>💡 Solution</summary>

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: monitoring-agent
  labels:
    type: monitoring
spec:
  selector:
    matchLabels:
      type: monitoring
  template:
    metadata:
      labels:
        type: monitoring
    spec:
      tolerations:
      - key: node-role.kubernetes.io/control-plane
        effect: NoSchedule
      containers:
      - name: agent
        image: busybox
        command: ["sleep", "3600"]
        volumeMounts:
        - name: host-logs
          mountPath: /host-logs
          readOnly: true
      volumes:
      - name: host-logs
        hostPath:
          path: /var/log
```
</details>

---

## Question 5 (6%) - Resource Quota

Create a namespace `restricted` with a ResourceQuota:
- Max 5 Pods
- CPU requests max: `2`
- Memory requests max: `2Gi`
- CPU limits max: `4`
- Memory limits max: `4Gi`

Then create a pod with requests and limits in that namespace.

<details>
<summary>💡 Solution</summary>

```bash
kubectl create namespace restricted

kubectl apply -f - <<EOF
apiVersion: v1
kind: ResourceQuota
metadata:
  name: restricted-quota
  namespace: restricted
spec:
  hard:
    pods: "5"
    requests.cpu: "2"
    requests.memory: 2Gi
    limits.cpu: "4"
    limits.memory: 4Gi
EOF

kubectl run quota-pod \
  --image=nginx:1.25 \
  -n restricted \
  --requests='cpu=100m,memory=64Mi' \
  --limits='cpu=200m,memory=128Mi'
```
</details>

---

## Question 6 (5%) - Debugging Network

A Pod `client` can't reach a Service `backend-svc`. Debug and fix the issue.

```bash
# Setup
kubectl run backend --image=nginx:1.25 --labels="app=backend-wrong"
kubectl expose pod backend --port=80 --selector="app=backend" --name=backend-svc
kubectl run client --image=busybox -- sleep 3600
```

<details>
<summary>💡 Solution</summary>

```bash
# Check the service
kubectl describe svc backend-svc
# Notice: selector is app=backend

# Check pod labels
kubectl get pod backend --show-labels
# Notice: label is app=backend-wrong (mismatch!)

# Check endpoints (will be empty)
kubectl get endpoints backend-svc

# Fix: relabel the pod OR update service selector
kubectl label pod backend app=backend --overwrite

# Verify endpoints are now populated
kubectl get endpoints backend-svc

# Test connectivity
kubectl exec client -- wget -O- http://backend-svc
```
</details>

---

## Question 7 (5%) - Canary Deployment

Create a canary setup:
1. Stable deployment: `app-stable` with `nginx:1.23`, 4 replicas, labels `app=webapp, track=stable`
2. Canary deployment: `app-canary` with `nginx:1.25`, 1 replica, labels `app=webapp, track=canary`
3. Service that routes to BOTH (10% canary traffic)

<details>
<summary>💡 Solution</summary>

```bash
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-stable
spec:
  replicas: 4
  selector:
    matchLabels:
      app: webapp
      track: stable
  template:
    metadata:
      labels:
        app: webapp
        track: stable
    spec:
      containers:
      - name: nginx
        image: nginx:1.23
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: webapp
      track: canary
  template:
    metadata:
      labels:
        app: webapp
        track: canary
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
---
apiVersion: v1
kind: Service
metadata:
  name: webapp-svc
spec:
  selector:
    app: webapp    # Routes to BOTH stable and canary
  ports:
  - port: 80
EOF
```
</details>

---

## Question 8 (5%) - Port Forward and Logs

1. Deploy `my-app` with `nginx:1.25`
2. Port-forward local port 8080 to the pod's port 80
3. Access the application
4. Check the logs

<details>
<summary>💡 Solution</summary>

```bash
kubectl run my-app --image=nginx:1.25 --port=80

# Wait for pod to be running
kubectl get pod my-app -w

# Port-forward in background
kubectl port-forward pod/my-app 8080:80 &

# Access
curl http://localhost:8080

# Logs
kubectl logs my-app
kubectl logs my-app -f  # Follow

# Stop port-forward
kill %1
```
</details>

---

## Question 9 (4%) - EmptyDir Shared Volume

Create a pod `shared-volume-pod` with:
- Container 1 `writer`: `busybox`, writes current date to `/shared/date.txt` every 5 seconds
- Container 2 `reader`: `busybox`, reads `/shared/date.txt` continuously
- Both share an `emptyDir` volume

<details>
<summary>💡 Solution</summary>

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: shared-volume-pod
spec:
  volumes:
  - name: shared-data
    emptyDir: {}
  containers:
  - name: writer
    image: busybox
    command: ["/bin/sh", "-c", "while true; do date > /shared/date.txt; sleep 5; done"]
    volumeMounts:
    - name: shared-data
      mountPath: /shared
  - name: reader
    image: busybox
    command: ["/bin/sh", "-c", "while true; do cat /shared/date.txt; sleep 5; done"]
    volumeMounts:
    - name: shared-data
      mountPath: /shared
```

```bash
# Check logs of reader container
kubectl logs shared-volume-pod -c reader
```
</details>

---

## Question 10 (5%) - Labels and Selectors

1. Create 3 pods: `prod-pod-1`, `prod-pod-2` with `env=prod`, and `dev-pod-1` with `env=dev`
2. Create a Service that only selects `env=prod` pods
3. List only prod pods

<details>
<summary>💡 Solution</summary>

```bash
kubectl run prod-pod-1 --image=nginx --labels="env=prod,app=web"
kubectl run prod-pod-2 --image=nginx --labels="env=prod,app=web"
kubectl run dev-pod-1 --image=nginx --labels="env=dev,app=web"

kubectl apply -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: prod-service
spec:
  selector:
    env: prod
  ports:
  - port: 80
EOF

# List only prod pods
kubectl get pods -l env=prod
kubectl get pods -l 'env in (prod)'
kubectl get pods -l 'env!=dev'
```
</details>

---

## 🎯 Exam Score Card

| Question | Topic | Points | Done? |
|----------|-------|--------|-------|
| 1 | PVC + Volumes | 5% | ☐ |
| 2 | Helm | 5% | ☐ |
| 3 | Kustomize | 7% | ☐ |
| 4 | DaemonSet | 8% | ☐ |
| 5 | ResourceQuota | 6% | ☐ |
| 6 | Network Debugging | 5% | ☐ |
| 7 | Canary Deployment | 5% | ☐ |
| 8 | Port-Forward + Logs | 5% | ☐ |
| 9 | Shared Volumes | 4% | ☐ |
| 10 | Labels + Selectors | 5% | ☐ |
| **Total** | | **55%** | |

