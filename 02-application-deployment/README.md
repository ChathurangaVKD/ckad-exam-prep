# 🚀 Domain 2: Application Deployment (20%)

## Topics Covered
- Use Kubernetes primitives to implement common deployment strategies
- Understand Deployments and how to perform rolling updates
- Use the Helm package manager to deploy existing packages
- Kustomize

---

## 2.1 Deployments

A Deployment provides declarative updates for Pods and ReplicaSets.

```yaml
# deployment-basic.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment
  labels:
    app: myapp
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

# Check rollout status
kubectl rollout status deployment/my-deploy

# View rollout history
kubectl rollout history deployment/my-deploy
kubectl rollout history deployment/my-deploy --revision=2

# Rollback
kubectl rollout undo deployment/my-deploy
kubectl rollout undo deployment/my-deploy --to-revision=1

# Pause/Resume rollout
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

### Recreate Strategy (Downtime)

```yaml
strategy:
  type: Recreate
# All old pods killed before new ones created
# Causes downtime but ensures no version mixing
```

### Blue-Green Deployment

```bash
# Blue (current) deployment exists: my-app-blue
# Create green (new) deployment
kubectl create deployment my-app-green --image=nginx:1.25 --replicas=3

# Switch service selector to green
kubectl patch service my-service -p '{"spec":{"selector":{"version":"green"}}}'

# Verify, then delete blue
kubectl delete deployment my-app-blue
```

```yaml
# blue-green-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: myapp
    version: blue    # Change to "green" to switch traffic
  ports:
  - port: 80
    targetPort: 80
```

### Canary Deployment

```yaml
# canary-deployment.yaml
# Stable: 9 replicas
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
# Canary: 1 replica (10% traffic)
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
# Service selects ALL pods with app=myapp
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp    # Selects both stable and canary
  ports:
  - port: 80
```

---

## 2.3 ReplicaSets & DaemonSets

### ReplicaSet

```yaml
# replicaset.yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: my-rs
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: nginx:1.25
```

### DaemonSet (one pod per node)

```yaml
# daemonset.yaml
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

## 2.4 StatefulSets

```yaml
# statefulset.yaml
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
# Required headless service
apiVersion: v1
kind: Service
metadata:
  name: web-headless
spec:
  clusterIP: None    # Headless!
  selector:
    app: web
  ports:
  - port: 80
```

---

## 2.5 Helm

Helm is the package manager for Kubernetes.

```bash
# Install Helm (if not installed)
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Add a repo
helm repo add stable https://charts.helm.sh/stable
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Search for charts
helm search repo nginx
helm search hub wordpress

# Install a chart
helm install my-nginx bitnami/nginx
helm install my-nginx bitnami/nginx --namespace mynamespace --create-namespace

# Install with custom values
helm install my-nginx bitnami/nginx --set service.type=NodePort
helm install my-nginx bitnami/nginx -f custom-values.yaml

# List releases
helm list
helm list -A  # All namespaces

# Upgrade a release
helm upgrade my-nginx bitnami/nginx --set replicaCount=3
helm upgrade --install my-nginx bitnami/nginx  # Install if not exists

# View release info
helm status my-nginx
helm get values my-nginx
helm get manifest my-nginx

# Rollback
helm rollback my-nginx 1  # Rollback to revision 1

# Uninstall
helm uninstall my-nginx

# Dry run
helm install my-nginx bitnami/nginx --dry-run

# Template (generate manifests)
helm template my-nginx bitnami/nginx

# Inspect chart
helm show values bitnami/nginx
helm show chart bitnami/nginx
```

### Custom Helm Chart Structure

```
my-chart/
├── Chart.yaml         # Chart metadata
├── values.yaml        # Default values
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── _helpers.tpl   # Template helpers
│   └── NOTES.txt      # Post-install notes
└── charts/            # Dependencies
```

```yaml
# Chart.yaml
apiVersion: v2
name: my-chart
description: A sample Helm chart
type: application
version: 0.1.0
appVersion: "1.0.0"
```

---

## 2.6 Kustomize

Kustomize allows customization of Kubernetes YAML without templates.

```bash
# Built into kubectl
kubectl apply -k ./overlays/production
kubectl kustomize ./overlays/production | kubectl apply -f -
```

### Base Structure

```
kustomize/
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   └── service.yaml
└── overlays/
    ├── development/
    │   ├── kustomization.yaml
    │   └── patch-replicas.yaml
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
bases:
- ../../base
namePrefix: prod-
namespace: production
patchesStrategicMerge:
- patch-replicas.yaml
images:
- name: nginx
  newTag: "1.25"
```

```yaml
# overlays/production/patch-replicas.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment
spec:
  replicas: 5
```

---

## 🧪 Practice Exercises

### Exercise 2.1 - Rolling Update
```bash
# 1. Create deployment with nginx:1.23
kubectl create deployment webapp --image=nginx:1.23 --replicas=4

# 2. Update to nginx:1.25
kubectl set image deployment/webapp nginx=nginx:1.25
kubectl rollout status deployment/webapp

# 3. Rollback to previous version
kubectl rollout undo deployment/webapp
kubectl rollout history deployment/webapp
```

### Exercise 2.2 - Blue-Green
```bash
# Create blue deployment
kubectl create deployment myapp-blue \
  --image=nginx:1.23 --replicas=3
kubectl label pod -l app=myapp-blue version=blue

# Create service pointing to blue
kubectl expose deployment myapp-blue \
  --name=myapp-svc --port=80

# Create green, switch service
kubectl create deployment myapp-green \
  --image=nginx:1.25 --replicas=3
kubectl patch svc myapp-svc \
  -p '{"spec":{"selector":{"app":"myapp-green"}}}'
```

### Exercise 2.3 - Helm
```bash
# 1. Install WordPress using Helm
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install my-wordpress bitnami/wordpress \
  --set wordpressUsername=admin \
  --set wordpressPassword=secret

# 2. Check status
helm status my-wordpress

# 3. Upgrade with more replicas
helm upgrade my-wordpress bitnami/wordpress \
  --reuse-values \
  --set replicaCount=2

# 4. Uninstall
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
kubectl rollout pause deployment/NAME
kubectl rollout resume deployment/NAME

# Helm
helm repo add NAME URL
helm repo update
helm install RELEASE CHART [--set key=value] [-f values.yaml]
helm upgrade RELEASE CHART
helm rollback RELEASE REVISION
helm uninstall RELEASE
helm list [-A]
helm status RELEASE
```

