# 📝 CKAD Practice Exam 3 (Hard Mode)

> **Time limit:** 2 hours | **Pass mark:** 66%
> This exam simulates the actual exam difficulty.

---

## Question 1 (8%) - Full Stack App

Deploy a 3-tier application:

**Database tier:**
- Pod `db` with `postgres:15` image
- Env: `POSTGRES_DB=myapp`, `POSTGRES_USER=admin`, `POSTGRES_PASSWORD=secret` (from secret)
- Service `db-svc` on port 5432 (ClusterIP)

**Backend tier:**
- Deployment `backend` with `nginx:1.25`, 2 replicas
- Env var `DB_HOST=db-svc` from a ConfigMap
- Service `backend-svc` on port 80

**Frontend tier:**
- Deployment `frontend` with `nginx:1.25`, 3 replicas
- Service `frontend-svc` on port 80 (NodePort)

**Ingress:**
- Route `myapp.local/api` → `backend-svc`
- Route `myapp.local/` → `frontend-svc`

<details>
<summary>💡 Solution</summary>

```bash
# Create secret for DB password
kubectl create secret generic db-secret \
  --from-literal=POSTGRES_PASSWORD=secret

# Create ConfigMap for backend config
kubectl create configmap backend-config \
  --from-literal=DB_HOST=db-svc

# Database pod + service
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: db
  labels:
    app: db
spec:
  containers:
  - name: postgres
    image: postgres:15
    env:
    - name: POSTGRES_DB
      value: myapp
    - name: POSTGRES_USER
      value: admin
    - name: POSTGRES_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: POSTGRES_PASSWORD
---
apiVersion: v1
kind: Service
metadata:
  name: db-svc
spec:
  selector:
    app: db
  ports:
  - port: 5432
EOF

# Backend
kubectl create deployment backend --image=nginx:1.25 --replicas=2
kubectl set env deployment/backend --from=configmap/backend-config
kubectl expose deployment backend --port=80 --name=backend-svc

# Frontend
kubectl create deployment frontend --image=nginx:1.25 --replicas=3
kubectl expose deployment frontend --port=80 --type=NodePort --name=frontend-svc

# Ingress
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.local
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-svc
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-svc
            port:
              number: 80
EOF
```
</details>

---

## Question 2 (7%) - RBAC with Multiple Subjects

1. Create namespace `team-dev`
2. Create ServiceAccount `dev-pipeline` in `team-dev`
3. Create ClusterRole `deployment-manager` with full CRUD on deployments and services
4. Bind the ClusterRole to `dev-pipeline` SA (namespace-scoped to `team-dev`)
5. Verify `dev-pipeline` can create deployments in `team-dev` but NOT in `default`

<details>
<summary>💡 Solution</summary>

```bash
kubectl create namespace team-dev
kubectl create serviceaccount dev-pipeline -n team-dev

kubectl create clusterrole deployment-manager \
  --verb=get,list,watch,create,update,patch,delete \
  --resource=deployments,services

# RoleBinding (not ClusterRoleBinding) - scopes to team-dev namespace
kubectl create rolebinding dev-pipeline-binding \
  -n team-dev \
  --clusterrole=deployment-manager \
  --serviceaccount=team-dev:dev-pipeline

# Verify
kubectl auth can-i create deployments \
  --as=system:serviceaccount:team-dev:dev-pipeline \
  -n team-dev    # Should be: yes

kubectl auth can-i create deployments \
  --as=system:serviceaccount:team-dev:dev-pipeline \
  -n default     # Should be: no
```
</details>

---

## Question 3 (6%) - Pod Disruption + Scheduling

Create a Pod `scheduled-pod` that:
- Must run on a node with label `disktype=ssd` (use nodeSelector)
- Must NOT run on nodes with taint `dedicated=gpu:NoSchedule`
- Has resource requests of `cpu=500m, memory=256Mi`

Then manually add the label to a node and verify the pod schedules.

<details>
<summary>💡 Solution</summary>

```bash
# Label a node
kubectl label node NODENAME disktype=ssd

# Create the pod
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: scheduled-pod
spec:
  nodeSelector:
    disktype: ssd
  tolerations:
  - key: dedicated
    value: gpu
    effect: NoSchedule
    operator: Equal
  containers:
  - name: app
    image: nginx:1.25
    resources:
      requests:
        cpu: "500m"
        memory: "256Mi"
EOF

kubectl get pod scheduled-pod -o wide
```
</details>

---

## Question 4 (7%) - Complete Secret Workflow

1. Create a TLS secret `web-tls` (self-signed cert)
2. Create a Docker registry secret `registry-creds`
3. Create a generic secret `db-creds` with username and password
4. Create a Pod that:
   - Pulls image using `registry-creds`
   - Mounts `web-tls` as volume at `/etc/tls`
   - Uses `db-creds` password as env var `DB_PASS`

<details>
<summary>💡 Solution</summary>

```bash
# Generate self-signed cert
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt -subj "/CN=myapp.example.com"

# Create TLS secret
kubectl create secret tls web-tls \
  --cert=tls.crt \
  --key=tls.key

# Docker registry secret
kubectl create secret docker-registry registry-creds \
  --docker-server=myregistry.io \
  --docker-username=myuser \
  --docker-password=mypassword \
  --docker-email=me@example.com

# Generic secret
kubectl create secret generic db-creds \
  --from-literal=username=admin \
  --from-literal=password=s3cr3t

# Pod using all secrets
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: secret-consumer
spec:
  imagePullSecrets:
  - name: registry-creds
  volumes:
  - name: tls-vol
    secret:
      secretName: web-tls
  containers:
  - name: app
    image: nginx:1.25
    env:
    - name: DB_PASS
      valueFrom:
        secretKeyRef:
          name: db-creds
          key: password
    volumeMounts:
    - name: tls-vol
      mountPath: /etc/tls
      readOnly: true
EOF
```
</details>

---

## Question 5 (6%) - StatefulSet

Create a StatefulSet `mysql-cluster` with:
- 3 replicas of `mysql:8.0`
- Headless service `mysql-headless` on port 3306
- PVC template: `mysql-data`, 1Gi, ReadWriteOnce
- Env from secret: `MYSQL_ROOT_PASSWORD`

<details>
<summary>💡 Solution</summary>

```bash
kubectl create secret generic mysql-secret \
  --from-literal=MYSQL_ROOT_PASSWORD=rootpassword

kubectl apply -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: mysql-headless
spec:
  clusterIP: None
  selector:
    app: mysql-cluster
  ports:
  - port: 3306
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql-cluster
spec:
  serviceName: mysql-headless
  replicas: 3
  selector:
    matchLabels:
      app: mysql-cluster
  template:
    metadata:
      labels:
        app: mysql-cluster
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: MYSQL_ROOT_PASSWORD
        volumeMounts:
        - name: mysql-data
          mountPath: /var/lib/mysql
  volumeClaimTemplates:
  - metadata:
      name: mysql-data
    spec:
      accessModes: [ReadWriteOnce]
      resources:
        requests:
          storage: 1Gi
EOF

kubectl get statefulset mysql-cluster
kubectl get pods -l app=mysql-cluster
kubectl get pvc
```
</details>

---

## Question 6 (5%) - Network Policy Scenarios

Create the following in namespace `app`:
1. Deny all traffic (ingress + egress)
2. Allow `frontend` pods to access `backend` pods on port 80
3. Allow `backend` pods to access `database` pods on port 5432
4. Allow all pods to access DNS (UDP/TCP port 53)

<details>
<summary>💡 Solution</summary>

```bash
kubectl create namespace app
kubectl label namespace app name=app

kubectl apply -n app -f - <<EOF
# 1. Default deny all
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
---
# 2. Frontend → Backend
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: frontend-to-backend
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - port: 80
---
# 3. Backend → Database + DNS
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-egress
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Egress
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - port: 5432
  - ports:
    - port: 53
      protocol: UDP
    - port: 53
      protocol: TCP
EOF
```
</details>

---

## Question 7 (5%) - Troubleshoot a Broken Deployment

The following deployment has issues. Find and fix all problems:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: broken-deploy
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: frontend     # Bug 1
    spec:
      containers:
      - name: app
        image: nginx:NOTEXIST  # Bug 2
        resources:
          limits:
            memory: 10Mi    # Bug 3 (too small for nginx)
        livenessProbe:
          httpGet:
            path: /
            port: 8080     # Bug 4 (wrong port)
          initialDelaySeconds: 1
          periodSeconds: 1  # Bug 5 (too aggressive)
```

<details>
<summary>💡 Solution</summary>

```bash
# Identify bugs:
# 1. selector.matchLabels has app:backend but template has app:frontend
# 2. Image tag doesn't exist
# 3. Memory limit too small for nginx (needs ~50Mi+)
# 4. Liveness probe on wrong port (nginx listens on 80, not 8080)
# 5. Period too aggressive (use 10s minimum)

kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: broken-deploy
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend          # Fixed: match selector
    spec:
      containers:
      - name: app
        image: nginx:1.25     # Fixed: valid image
        resources:
          limits:
            memory: 128Mi     # Fixed: adequate memory
        livenessProbe:
          httpGet:
            path: /
            port: 80          # Fixed: correct port
          initialDelaySeconds: 15
          periodSeconds: 10   # Fixed: reasonable period
EOF
```
</details>

---

## Question 8 (6%) - Complete Pod Security

Create namespace `secure-ns` with:
1. A LimitRange enforcing: default CPU 100m, default memory 64Mi, max CPU 500m, max memory 256Mi
2. A Pod `hardened-pod` with:
   - `runAsUser: 2000`, `runAsNonRoot: true`
   - `readOnlyRootFilesystem: true`
   - Drop ALL capabilities
   - No privilege escalation
   - emptyDir volumes for `/tmp` and `/var/run`

<details>
<summary>💡 Solution</summary>

```bash
kubectl create namespace secure-ns

kubectl apply -n secure-ns -f - <<EOF
apiVersion: v1
kind: LimitRange
metadata:
  name: secure-limits
spec:
  limits:
  - type: Container
    default:
      cpu: 100m
      memory: 64Mi
    defaultRequest:
      cpu: 50m
      memory: 32Mi
    max:
      cpu: 500m
      memory: 256Mi
---
apiVersion: v1
kind: Pod
metadata:
  name: hardened-pod
spec:
  securityContext:
    runAsUser: 2000
    runAsNonRoot: true
    fsGroup: 2000
  containers:
  - name: app
    image: nginx:1.25
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop: ["ALL"]
    volumeMounts:
    - name: tmp
      mountPath: /tmp
    - name: var-run
      mountPath: /var/run
    - name: var-cache
      mountPath: /var/cache/nginx
  volumes:
  - name: tmp
    emptyDir: {}
  - name: var-run
    emptyDir: {}
  - name: var-cache
    emptyDir: {}
EOF
```
</details>

---

## 🎯 Exam Score Card

| Question | Topic | Points | Done? |
|----------|-------|--------|-------|
| 1 | Full Stack App | 8% | ☐ |
| 2 | RBAC Multi-Subject | 7% | ☐ |
| 3 | Scheduling | 6% | ☐ |
| 4 | Complete Secrets | 7% | ☐ |
| 5 | StatefulSet | 6% | ☐ |
| 6 | NetworkPolicy Scenarios | 5% | ☐ |
| 7 | Troubleshoot Deployment | 5% | ☐ |
| 8 | Pod Security | 6% | ☐ |
| **Total** | | **50%** | |

> Note: Actual exam will have more questions to reach 100%. This exam focuses on complex scenarios.

