# 🔐 Domain 4: Application Environment, Configuration and Security (25%)

## Topics Covered
- Discover and use resources that extend Kubernetes (CRD)
- Understand authentication, authorization and admission control
- Use ConfigMaps and Secrets to configure applications
- Understand ServiceAccounts
- Understand SecurityContexts
- Define resource requirements, limits and quotas
- Understand ConfigMaps
- Create & consume Secrets
- Understand Application Security (SecurityContexts, Capabilities)

---

## 4.1 ConfigMaps

ConfigMaps store non-sensitive configuration data as key-value pairs.

```bash
# Create ConfigMap imperatively
kubectl create configmap my-config \
  --from-literal=DB_HOST=localhost \
  --from-literal=DB_PORT=5432

# From a file
kubectl create configmap app-config --from-file=config.properties
kubectl create configmap nginx-config --from-file=nginx.conf=/path/to/nginx.conf

# From a directory
kubectl create configmap my-config --from-file=./config-dir/

# View ConfigMap
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
  # Simple key-value
  DB_HOST: "postgres-service"
  DB_PORT: "5432"
  APP_ENV: "production"
  # Multi-line (file content)
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
# pod-with-configmap.yaml
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
    # Method 1: Individual env vars
    env:
    - name: DB_HOST
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: DB_HOST
    - name: DB_PORT
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: DB_PORT
    # Method 2: All keys as env vars
    envFrom:
    - configMapRef:
        name: app-config
    # Method 3: Mount as volume (files)
    volumeMounts:
    - name: config-vol
      mountPath: /etc/config
    # Mount specific key as a file
    - name: config-vol
      mountPath: /etc/nginx/nginx.conf
      subPath: nginx.conf
```

---

## 4.2 Secrets

Secrets store sensitive data (base64 encoded, not encrypted by default).

```bash
# Create Secret imperatively
kubectl create secret generic my-secret \
  --from-literal=username=admin \
  --from-literal=password=s3cr3t

# From files
kubectl create secret generic tls-certs \
  --from-file=tls.crt \
  --from-file=tls.key

# TLS secret type
kubectl create secret tls my-tls \
  --cert=tls.crt \
  --key=tls.key

# Docker registry secret
kubectl create secret docker-registry regcred \
  --docker-server=registry.io \
  --docker-username=user \
  --docker-password=password \
  --docker-email=user@example.com

# View (base64 encoded)
kubectl get secret my-secret -o yaml

# Decode
kubectl get secret my-secret -o jsonpath='{.data.password}' | base64 -d
```

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: my-secret
type: Opaque          # Opaque, kubernetes.io/tls, kubernetes.io/dockerconfigjson
data:
  username: YWRtaW4=           # base64: admin
  password: czNjcjN0          # base64: s3cr3t
# OR use stringData (auto-encodes)
stringData:
  api-key: "my-plain-text-key"
```

### Using Secrets in Pods

```yaml
# pod-with-secret.yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-pod
spec:
  volumes:
  - name: secret-vol
    secret:
      secretName: my-secret
      defaultMode: 0400   # Read-only for owner
  containers:
  - name: app
    image: nginx:1.25
    # Method 1: Individual env vars
    env:
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: my-secret
          key: password
    # Method 2: All keys as env vars
    envFrom:
    - secretRef:
        name: my-secret
    # Method 3: Mount as volume
    volumeMounts:
    - name: secret-vol
      mountPath: /etc/secrets
      readOnly: true
  # Pull from private registry
  imagePullSecrets:
  - name: regcred
```

---

## 4.3 Security Contexts

SecurityContext defines privilege and access control settings for a Pod or Container.

```yaml
# security-context-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: security-demo
spec:
  # Pod-level security context
  securityContext:
    runAsUser: 1000           # Run as user ID 1000
    runAsGroup: 3000          # Primary group ID
    fsGroup: 2000             # Volume ownership group
    runAsNonRoot: true        # Must not run as root
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: nginx:1.25
    # Container-level (overrides pod-level)
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true  # Immutable filesystem
      runAsUser: 1000
      capabilities:
        add: ["NET_BIND_SERVICE"]   # Add capabilities
        drop: ["ALL"]              # Drop all others
    volumeMounts:
    - name: tmp
      mountPath: /tmp
    - name: var-run
      mountPath: /var/run
  volumes:
  - name: tmp
    emptyDir: {}
  - name: var-run
    emptyDir: {}
```

### Linux Capabilities Reference

```bash
# Common capabilities:
# NET_BIND_SERVICE  - Bind to ports < 1024
# NET_ADMIN         - Network configuration
# SYS_ADMIN         - Various system calls
# SYS_TIME          - Set system time
# CHOWN             - Change file ownership
# DAC_OVERRIDE      - Bypass file permission checks

# Check capabilities in a running container
kubectl exec my-pod -- cat /proc/1/status | grep Cap
```

---

## 4.4 Service Accounts

Service accounts provide an identity for pods to authenticate with the API server.

```yaml
# service-account.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-service-account
  namespace: default
automountServiceAccountToken: false  # Opt-in token mounting
```

```yaml
# pod-with-sa.yaml
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

```bash
# Create service account
kubectl create serviceaccount my-sa

# Check token (K8s 1.24+: no auto-created secret)
kubectl create token my-sa --duration=1h

# Old way (before 1.24): view auto-mounted token
kubectl exec my-pod -- cat /var/run/secrets/kubernetes.io/serviceaccount/token
```

---

## 4.5 RBAC (Role-Based Access Control)

```yaml
# role.yaml - namespace-scoped
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: default
rules:
- apiGroups: [""]         # "" = core API group
  resources: ["pods", "pods/log"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
```

```yaml
# rolebinding.yaml
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
- kind: Group
  name: developers
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role           # Role or ClusterRole
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

```yaml
# clusterrole.yaml - cluster-scoped
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: node-reader
rules:
- apiGroups: [""]
  resources: ["nodes"]
  verbs: ["get", "list", "watch"]
- nonResourceURLs: ["/healthz", "/readyz"]
  verbs: ["get"]
```

```bash
# Imperative RBAC commands
kubectl create role pod-reader \
  --verb=get,list,watch \
  --resource=pods

kubectl create rolebinding read-pods \
  --role=pod-reader \
  --serviceaccount=default:my-sa \
  --user=jane

kubectl create clusterrole node-reader \
  --verb=get,list,watch \
  --resource=nodes

kubectl create clusterrolebinding read-nodes \
  --clusterrole=node-reader \
  --serviceaccount=default:my-sa

# Check permissions
kubectl auth can-i get pods
kubectl auth can-i get pods --as=jane
kubectl auth can-i get pods --as=system:serviceaccount:default:my-sa
kubectl auth can-i --list  # All permissions for current user
kubectl auth can-i --list --as=jane
```

---

## 4.6 Resource Requests and Limits

```yaml
# resources-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
  - name: app
    image: nginx:1.25
    resources:
      requests:           # Minimum guaranteed resources
        memory: "64Mi"
        cpu: "250m"       # 250 millicores = 0.25 CPU
        ephemeral-storage: "1Gi"
      limits:             # Maximum allowed resources
        memory: "128Mi"
        cpu: "500m"
        ephemeral-storage: "2Gi"
```

### LimitRange (default limits for namespace)

```yaml
# limitrange.yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: mem-cpu-limit-range
  namespace: default
spec:
  limits:
  - type: Container
    default:              # Default limit
      cpu: 500m
      memory: 128Mi
    defaultRequest:       # Default request
      cpu: 100m
      memory: 64Mi
    max:                  # Maximum limit
      cpu: "2"
      memory: 1Gi
    min:                  # Minimum request
      cpu: 50m
      memory: 32Mi
  - type: Pod
    max:
      cpu: "4"
      memory: 2Gi
  - type: PersistentVolumeClaim
    max:
      storage: 10Gi
    min:
      storage: 1Gi
```

### ResourceQuota (limits for namespace)

```yaml
# resourcequota.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: my-quota
  namespace: default
spec:
  hard:
    # Compute
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    # Objects
    pods: "20"
    services: "10"
    secrets: "20"
    configmaps: "20"
    persistentvolumeclaims: "10"
    services.loadbalancers: "2"
    services.nodeports: "5"
```

```bash
kubectl describe resourcequota my-quota
kubectl describe limitrange mem-cpu-limit-range
```

---

## 4.7 Custom Resource Definitions (CRDs)

```yaml
# crd.yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: foos.example.com
spec:
  group: example.com
  versions:
  - name: v1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              replicas:
                type: integer
              image:
                type: string
  scope: Namespaced   # or Cluster
  names:
    plural: foos
    singular: foo
    kind: Foo
    shortNames:
    - fo
```

```bash
# After CRD is created, use the custom resource
kubectl get foos
kubectl apply -f my-foo.yaml
kubectl explain foo.spec
```

---

## 🧪 Practice Exercises

### Exercise 4.1 - ConfigMaps
```bash
# Create configmap from literals
kubectl create configmap db-config \
  --from-literal=DB_HOST=postgres \
  --from-literal=DB_PORT=5432 \
  --from-literal=DB_NAME=myapp

# Use in a pod - inject as env vars
kubectl run app \
  --image=busybox \
  --env="DB_HOST=placeholder" \
  --dry-run=client -o yaml > pod.yaml
# Edit pod.yaml to use configMapKeyRef, then apply
```

### Exercise 4.2 - Secrets
```bash
# Create and consume a secret
kubectl create secret generic db-credentials \
  --from-literal=username=dbuser \
  --from-literal=password='S!B\*d$zDsb='

# Decode a secret value
kubectl get secret db-credentials \
  -o jsonpath='{.data.password}' | base64 --decode
```

### Exercise 4.3 - Security Context
```bash
# Run a pod as non-root user
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

# Verify
kubectl exec nonroot-pod -- whoami
kubectl exec nonroot-pod -- id
```

### Exercise 4.4 - RBAC
```bash
# Create SA, Role, RoleBinding
kubectl create sa deploy-manager
kubectl create role deployment-admin \
  --verb=get,list,create,update,patch,delete \
  --resource=deployments
kubectl create rolebinding deploy-manager-binding \
  --role=deployment-admin \
  --serviceaccount=default:deploy-manager

# Test permissions
kubectl auth can-i create deployments \
  --as=system:serviceaccount:default:deploy-manager
```

### Exercise 4.5 - Resource Limits
```bash
# Create a pod with resource limits
kubectl run limited-pod \
  --image=nginx:1.25 \
  --requests='cpu=100m,memory=64Mi' \
  --limits='cpu=200m,memory=128Mi'

# Check resource usage
kubectl top pod limited-pod
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
kubectl create rolebinding NAME --role=ROLE --serviceaccount=NS:SA --user=USER
kubectl create clusterrole NAME --verb=VERBS --resource=RESOURCES
kubectl create clusterrolebinding NAME --clusterrole=CR --user=USER
kubectl auth can-i VERB RESOURCE [--as=USER]
kubectl auth can-i --list [--as=USER]

# Resources
kubectl describe limitrange NAME
kubectl describe resourcequota NAME
```

