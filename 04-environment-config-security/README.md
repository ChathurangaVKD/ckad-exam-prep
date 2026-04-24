# 🔐 Domain 4: Application Environment, Configuration and Security (25%)

## Topics Covered

- Discover and use resources that extend Kubernetes (CRD)
- Understand authentication, authorization and admission control
- Use ConfigMaps and Secrets to configure applications
- Understand ServiceAccounts
- Understand SecurityContexts
- Define resource requirements, limits and quotas

---

## 4.1 ConfigMaps

```bash
# Create imperatively
kubectl create configmap my-config \
  --from-literal=DB_HOST=localhost \
  --from-literal=DB_PORT=5432

# From a file
kubectl create configmap app-config --from-file=config.properties

# View
kubectl get configmap my-config -o yaml
kubectl describe configmap my-config
```

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DB_HOST: "postgres-service"
  DB_PORT: "5432"
  APP_ENV: "production"
  nginx.conf: |
    server {
      listen 80;
      location / {
        proxy_pass http://backend;
      }
    }
```

### Using ConfigMaps in Pods

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: config-pod
spec:
  volumes:
  - name: config-vol
    configMap:
      name: app-config
  containers:
  - name: app
    image: nginx:1.25
    # Method 1: Single env var from ConfigMap key
    env:
    - name: DB_HOST
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: DB_HOST
    # Method 2: All keys as env vars
    envFrom:
    - configMapRef:
        name: app-config
    # Method 3: Mount as volume (each key becomes a file)
    volumeMounts:
    - name: config-vol
      mountPath: /etc/config
    # Mount single key as a specific file path
    - name: config-vol
      mountPath: /etc/nginx/nginx.conf
      subPath: nginx.conf
```

---

## 4.2 Secrets

```bash
# Create Secret
kubectl create secret generic my-secret \
  --from-literal=username=admin \
  --from-literal=password=s3cr3t

# TLS secret
kubectl create secret tls my-tls --cert=tls.crt --key=tls.key

# Docker registry secret
kubectl create secret docker-registry regcred \
  --docker-server=registry.io \
  --docker-username=user \
  --docker-password=password \
  --docker-email=user@example.com

# Decode a secret value
kubectl get secret my-secret -o jsonpath='{.data.password}' | base64 -d
```

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: my-secret
type: Opaque
stringData:            # Plain text — auto base64-encoded
  username: admin
  password: s3cr3t
```

### Using Secrets in Pods

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-pod
spec:
  volumes:
  - name: secret-vol
    secret:
      secretName: my-secret
      defaultMode: 0400
  imagePullSecrets:
  - name: regcred
  containers:
  - name: app
    image: nginx:1.25
    env:
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: my-secret
          key: password
    envFrom:
    - secretRef:
        name: my-secret
    volumeMounts:
    - name: secret-vol
      mountPath: /etc/secrets
      readOnly: true
```

---

## 4.3 Security Contexts

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: security-demo
spec:
  # Pod-level security context
  securityContext:
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
    runAsNonRoot: true
  containers:
  - name: app
    image: busybox
    command: ["sleep", "3600"]
    # Container-level (overrides pod-level)
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        add: ["NET_BIND_SERVICE"]
        drop: ["ALL"]
    volumeMounts:
    - name: tmp
      mountPath: /tmp
  volumes:
  - name: tmp
    emptyDir: {}
```

### Common Linux Capabilities

| Capability | Purpose |
|-----------|---------|
| `NET_BIND_SERVICE` | Bind to ports below 1024 |
| `NET_ADMIN` | Network configuration |
| `SYS_ADMIN` | Various system admin calls |
| `CHOWN` | Change file ownership |
| `DAC_OVERRIDE` | Bypass file permission checks |

---

## 4.4 Service Accounts

```bash
# Create
kubectl create serviceaccount my-sa

# Generate a token
kubectl create token my-sa --duration=1h

# Check what's auto-mounted
kubectl exec my-pod -- cat /var/run/secrets/kubernetes.io/serviceaccount/token
```

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-service-account
  namespace: default
automountServiceAccountToken: false
---
apiVersion: v1
kind: Pod
metadata:
  name: sa-pod
spec:
  serviceAccountName: my-service-account
  automountServiceAccountToken: true
  containers:
  - name: app
    image: curlimages/curl:8.1.2
    command: ["sleep", "3600"]
```

---

## 4.5 RBAC

```yaml
# role.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: default
rules:
- apiGroups: [""]        # "" = core API group
  resources: ["pods", "pods/log"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
- kind: ServiceAccount
  name: my-service-account
  namespace: default
- kind: User
  name: jane
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

```bash
# Imperative RBAC
kubectl create role pod-reader --verb=get,list,watch --resource=pods
kubectl create rolebinding read-pods --role=pod-reader --serviceaccount=default:my-sa
kubectl create clusterrole node-reader --verb=get,list,watch --resource=nodes
kubectl create clusterrolebinding read-nodes --clusterrole=node-reader --user=jane

# Check permissions
kubectl auth can-i get pods
kubectl auth can-i get pods --as=jane
kubectl auth can-i get pods --as=system:serviceaccount:default:my-sa
kubectl auth can-i --list
kubectl auth can-i --list --as=jane
```

---

## 4.6 Resource Requests and Limits

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
  - name: app
    image: nginx:1.25
    resources:
      requests:           # Minimum guaranteed
        memory: "64Mi"
        cpu: "250m"       # 250 millicores = 0.25 CPU
      limits:             # Maximum allowed
        memory: "128Mi"
        cpu: "500m"
```

```yaml
# LimitRange: defaults for the namespace
apiVersion: v1
kind: LimitRange
metadata:
  name: mem-cpu-limits
spec:
  limits:
  - type: Container
    default:
      cpu: 500m
      memory: 128Mi
    defaultRequest:
      cpu: 100m
      memory: 64Mi
    max:
      cpu: "2"
      memory: 1Gi
    min:
      cpu: 50m
      memory: 32Mi
---
# ResourceQuota: caps for the namespace
apiVersion: v1
kind: ResourceQuota
metadata:
  name: my-quota
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "20"
    services: "10"
```

---

## 🧪 Practice Exercises

### Exercise 4.1 — ConfigMap + Secret

```bash
kubectl create configmap db-config --from-literal=DB_HOST=postgres --from-literal=DB_PORT=5432
kubectl create secret generic db-creds --from-literal=password='S3cr3t!'

# Decode the secret
kubectl get secret db-creds -o jsonpath='{.data.password}' | base64 --decode
```

### Exercise 4.2 — Security Context

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: nonroot-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
  containers:
  - name: app
    image: busybox
    command: ["sleep", "3600"]
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
EOF

kubectl exec nonroot-pod -- id
```

### Exercise 4.3 — RBAC

```bash
kubectl create sa deploy-manager
kubectl create role deployment-admin --verb=get,list,create,update,patch,delete --resource=deployments
kubectl create rolebinding deploy-manager-binding --role=deployment-admin --serviceaccount=default:deploy-manager
kubectl auth can-i create deployments --as=system:serviceaccount:default:deploy-manager
```

---

## 📝 Key Commands Summary

```bash
# ConfigMaps
kubectl create configmap NAME --from-literal=K=V --from-file=FILE
kubectl get configmap NAME -o yaml

# Secrets
kubectl create secret generic NAME --from-literal=K=V
kubectl get secret NAME -o jsonpath='{.data.KEY}' | base64 -d

# ServiceAccounts
kubectl create serviceaccount NAME
kubectl create token NAME

# RBAC
kubectl create role NAME --verb=VERBS --resource=RESOURCES
kubectl create rolebinding NAME --role=ROLE --serviceaccount=NS:SA
kubectl create clusterrole NAME --verb=VERBS --resource=RESOURCES
kubectl create clusterrolebinding NAME --clusterrole=CR --serviceaccount=NS:SA
kubectl auth can-i VERB RESOURCE [--as=USER]
kubectl auth can-i --list [--as=USER]
```
