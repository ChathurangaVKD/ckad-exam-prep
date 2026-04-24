# 🚀 Domain 2: Application Deployment (20%)

## Topics Covered

- Use Kubernetes primitives to implement common deployment strategies
- Understand Deployments and how to perform rolling updates
- Use the Helm package manager to deploy existing packages
- Kustomize

---

## 2.1 Deployments

```yaml
# deployment-basic.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment
  labels:
    app: myapp
  annotations:
    kubernetes.io/change-cause: "Initial deployment nginx 1.24"
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp          # Must match template labels
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1         # Max pods above desired (number or %)
      maxUnavailable: 0   # Max pods unavailable during update
  template:
    metadata:
      labels:
        app: myapp        # Must match selector
    spec:
      containers:
      - name: myapp
        image: nginx:1.24
        ports:
        - containerPort: 80
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

```bash
# Create imperatively
kubectl create deployment my-deploy --image=nginx:1.24 --replicas=3

# Scale
kubectl scale deployment my-deploy --replicas=5

# Update image
kubectl set image deployment/my-deploy myapp=nginx:1.25

# Rollout commands
kubectl rollout status deployment/my-deploy
kubectl rollout history deployment/my-deploy
kubectl rollout history deployment/my-deploy --revision=2
kubectl rollout undo deployment/my-deploy
kubectl rollout undo deployment/my-deploy --to-revision=1
kubectl rollout pause deployment/my-deploy
kubectl rollout resume deployment/my-deploy
```

---

## 2.2 Deployment Strategies

### Rolling Update (Default)

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 25%        # Default: 25%
    maxUnavailable: 25%  # Default: 25%
```

### Recreate Strategy

```yaml
strategy:
  type: Recreate
# All old pods killed before new ones start — causes downtime
```

### Blue-Green Deployment

```bash
# 1. Blue (current) deployment exists with label version=blue
# 2. Create green deployment
kubectl create deployment myapp-green --image=nginx:1.25 --replicas=3
kubectl label pods -l app=myapp-green version=green

# 3. Switch service selector to green
kubectl patch service myapp-svc -p '{"spec":{"selector":{"version":"green"}}}'

# 4. Verify, then delete blue
kubectl delete deployment myapp-blue
```

### Canary Deployment

```yaml
# 9 stable replicas + 1 canary = 10% canary traffic
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-stable
spec:
  replicas: 9
  selector:
    matchLabels:
      app: myapp
      track: stable
  template:
    metadata:
      labels:
        app: myapp
        track: stable
    spec:
      containers:
      - name: myapp
        image: myapp:v1
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
      track: canary
  template:
    metadata:
      labels:
        app: myapp
        track: canary
    spec:
      containers:
      - name: myapp
        image: myapp:v2
---
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp    # Selects BOTH stable and canary pods
  ports:
  - port: 80
```

---

## 2.3 DaemonSet

Runs one pod per node.

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: log-agent
spec:
  selector:
    matchLabels:
      app: log-agent
  template:
    metadata:
      labels:
        app: log-agent
    spec:
      tolerations:
      - key: node-role.kubernetes.io/control-plane
        effect: NoSchedule
      containers:
      - name: log-agent
        image: fluentd:v1.16
        volumeMounts:
        - name: varlog
          mountPath: /var/log
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
```

---

## 2.4 StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
spec:
  serviceName: "web-headless"
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        volumeMounts:
        - name: www
          mountPath: /usr/share/nginx/html
  volumeClaimTemplates:
  - metadata:
      name: www
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 1Gi
---
apiVersion: v1
kind: Service
metadata:
  name: web-headless
spec:
  clusterIP: None    # Headless service required for StatefulSet
  selector:
    app: web
  ports:
  - port: 80
```

---

## 2.5 Helm

```bash
# Repo management
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm search repo nginx

# Install
helm install my-nginx bitnami/nginx
helm install my-nginx bitnami/nginx --set service.type=NodePort
helm install my-nginx bitnami/nginx -f custom-values.yaml

# Manage releases
helm list
helm status my-nginx
helm get values my-nginx
helm get manifest my-nginx

# Upgrade and rollback
helm upgrade my-nginx bitnami/nginx --set replicaCount=3
helm rollback my-nginx 1

# Uninstall
helm uninstall my-nginx

# Inspect before installing
helm show values bitnami/nginx
helm template my-nginx bitnami/nginx
helm install my-nginx bitnami/nginx --dry-run
```

---

## 2.6 Kustomize

```bash
# Apply an overlay
kubectl apply -k ./overlays/production
kubectl kustomize ./overlays/production | kubectl apply -f -
```

```
kustomize/
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   └── service.yaml
└── overlays/
    └── production/
        ├── kustomization.yaml
        └── patch-replicas.yaml
```

```yaml
# base/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
- deployment.yaml
- service.yaml
commonLabels:
  app: myapp
```

```yaml
# overlays/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
- ../../base
namePrefix: prod-
namespace: production
replicas:
- name: my-deployment
  count: 5
images:
- name: nginx
  newTag: "1.25"
```

---

## 🧪 Practice Exercises

### Exercise 2.1 — Rolling Update

```bash
kubectl create deployment webapp --image=nginx:1.23 --replicas=4
kubectl set image deployment/webapp nginx=nginx:1.25
kubectl rollout status deployment/webapp
kubectl rollout undo deployment/webapp
kubectl rollout history deployment/webapp
```

### Exercise 2.2 — Helm

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install my-wordpress bitnami/wordpress \
  --set wordpressUsername=admin \
  --set wordpressPassword=secret
helm status my-wordpress
helm upgrade my-wordpress bitnami/wordpress --reuse-values --set replicaCount=2
helm uninstall my-wordpress
```

---

## 📝 Key Commands Summary

```bash
# Deployments
kubectl create deployment NAME --image=IMAGE --replicas=N
kubectl scale deployment NAME --replicas=N
kubectl set image deployment/NAME CONTAINER=IMAGE:TAG
kubectl rollout status deployment/NAME
kubectl rollout history deployment/NAME
kubectl rollout undo deployment/NAME [--to-revision=N]

# Helm
helm repo add NAME URL && helm repo update
helm install RELEASE CHART [--set key=value] [-f values.yaml]
helm upgrade RELEASE CHART
helm rollback RELEASE REVISION
helm uninstall RELEASE
helm list [-A]
```
