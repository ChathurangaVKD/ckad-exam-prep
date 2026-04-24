# 📄 YAML Templates Quick Reference

## Pod Template

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: CHANGE_ME
  namespace: default
  labels:
    app: CHANGE_ME
spec:
  serviceAccountName: default
  securityContext:              # Pod-level security
    runAsUser: 1000
    runAsNonRoot: true
    fsGroup: 2000
  initContainers:
  - name: init
    image: busybox
    command: ['sh', '-c', 'echo init']
  containers:
  - name: CHANGE_ME
    image: nginx:1.25
    ports:
    - containerPort: 80
    env:
    - name: KEY
      value: "VALUE"
    - name: FROM_SECRET
      valueFrom:
        secretKeyRef:
          name: secret-name
          key: key
    - name: FROM_CONFIG
      valueFrom:
        configMapKeyRef:
          name: cm-name
          key: key
    envFrom:
    - configMapRef:
        name: cm-name
    - secretRef:
        name: secret-name
    resources:
      requests:
        cpu: "100m"
        memory: "128Mi"
      limits:
        cpu: "250m"
        memory: "256Mi"
    securityContext:            # Container-level
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      runAsUser: 1000
      capabilities:
        drop: ["ALL"]
        add: ["NET_BIND_SERVICE"]
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
      initialDelaySeconds: 30
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 3
    readinessProbe:
      httpGet:
        path: /ready
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5
    volumeMounts:
    - name: config-vol
      mountPath: /etc/config
    - name: secret-vol
      mountPath: /etc/secret
      readOnly: true
    - name: data-vol
      mountPath: /data
  volumes:
  - name: config-vol
    configMap:
      name: cm-name
  - name: secret-vol
    secret:
      secretName: secret-name
  - name: data-vol
    persistentVolumeClaim:
      claimName: my-pvc
  - name: empty-dir
    emptyDir: {}
  - name: host-path
    hostPath:
      path: /data
      type: DirectoryOrCreate
```

---

## Deployment Template

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: CHANGE_ME
  labels:
    app: CHANGE_ME
  annotations:
    kubernetes.io/change-cause: "Initial deployment"
spec:
  replicas: 3
  selector:
    matchLabels:
      app: CHANGE_ME          # Must match template labels
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: CHANGE_ME        # Must match selector
    spec:
      containers:
      - name: CHANGE_ME
        image: nginx:1.25
        ports:
        - containerPort: 80
```

---

## Service Templates

```yaml
# ClusterIP
apiVersion: v1
kind: Service
metadata:
  name: CHANGE_ME
spec:
  type: ClusterIP
  selector:
    app: CHANGE_ME
  ports:
  - port: 80
    targetPort: 8080
---
# NodePort
apiVersion: v1
kind: Service
metadata:
  name: CHANGE_ME
spec:
  type: NodePort
  selector:
    app: CHANGE_ME
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080
```

---

## Ingress Template

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: CHANGE_ME
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: CHANGE_ME.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: CHANGE_ME
            port:
              number: 80
```

---

## NetworkPolicy Templates

```yaml
# Default deny all
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
---
# Allow specific ingress
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: CHANGE_ME
spec:
  podSelector:
    matchLabels:
      app: TARGET_APP
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: SOURCE_APP
    - namespaceSelector:
        matchLabels:
          name: SOURCE_NS
    ports:
    - port: 80
```

---

## RBAC Templates

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: CHANGE_ME
  namespace: default
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: CHANGE_ME
  namespace: default
rules:
- apiGroups: [""]
  resources: ["pods", "pods/log"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: CHANGE_ME
  namespace: default
subjects:
- kind: ServiceAccount
  name: CHANGE_ME
  namespace: default
roleRef:
  kind: Role
  name: CHANGE_ME
  apiGroup: rbac.authorization.k8s.io
```

---

## Job Template

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: CHANGE_ME
spec:
  completions: 1
  parallelism: 1
  backoffLimit: 4
  activeDeadlineSeconds: 100
  template:
    spec:
      restartPolicy: Never       # Never or OnFailure
      containers:
      - name: CHANGE_ME
        image: busybox
        command: ["echo", "hello"]
```

---

## CronJob Template

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: CHANGE_ME
spec:
  schedule: "*/5 * * * *"      # Every 5 minutes
  concurrencyPolicy: Forbid     # Allow, Forbid, Replace
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
          - name: CHANGE_ME
            image: busybox
            command: ["echo", "hello"]
```

---

## PVC Template

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: CHANGE_ME
spec:
  accessModes:
  - ReadWriteOnce       # RWO | ROX | RWX
  storageClassName: standard
  resources:
    requests:
      storage: 1Gi
```

---

## ConfigMap Template

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: CHANGE_ME
data:
  KEY: "VALUE"
  multi-line-key: |
    line1
    line2
```

---

## Secret Template

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: CHANGE_ME
type: Opaque
stringData:              # Auto-encodes to base64
  KEY: "VALUE"
  PASSWORD: "secret"
```

