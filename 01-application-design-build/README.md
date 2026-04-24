# 📦 Domain 1: Application Design and Build (20%)

## Topics Covered
- Define, build and modify container images
- Choose and use the right workload resource (Deployment, DaemonSet, CronJob, etc.)
- Understand multi-container Pod design patterns
- Utilize persistent and ephemeral volumes

---

## 1.1 Container Images

### Building a Docker Image

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
USER node
CMD ["node", "server.js"]
```

```bash
# Build and tag
docker build -t myapp:1.0 .
docker build -t myapp:1.0 -f Dockerfile.prod .

# Push to registry
docker tag myapp:1.0 myregistry.io/myapp:1.0
docker push myregistry.io/myapp:1.0

# Run container locally
docker run -d -p 3000:3000 --name myapp myapp:1.0
```

### Multi-Stage Build (Optimized)

```dockerfile
# Build stage
FROM golang:1.21 AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o server .

# Final stage - minimal image
FROM gcr.io/distroless/static
COPY --from=builder /app/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]
```

---

## 1.2 Running Pods

### Basic Pod

```yaml
# pod-basic.yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
  labels:
    app: myapp
    env: dev
spec:
  containers:
  - name: my-container
    image: nginx:1.25
    ports:
    - containerPort: 80
    resources:
      requests:
        cpu: "100m"
        memory: "128Mi"
      limits:
        cpu: "250m"
        memory: "256Mi"
```

```bash
# Imperative commands (FASTER on exam!)
kubectl run my-pod --image=nginx:1.25
kubectl run my-pod --image=nginx --port=80 --labels="app=myapp,env=dev"

# Generate YAML without creating
kubectl run my-pod --image=nginx --dry-run=client -o yaml > pod.yaml

# Create from file
kubectl apply -f pod-basic.yaml

# Get pod info
kubectl get pod my-pod -o wide
kubectl describe pod my-pod
kubectl get pod my-pod -o yaml
```

---

## 1.3 Jobs

Jobs create one or more Pods and ensure a specified number of them successfully terminate.

```yaml
# job-basic.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pi-calculator
spec:
  completions: 5        # Total successful completions needed
  parallelism: 2        # Run 2 pods at a time
  backoffLimit: 4       # Retry on failure
  activeDeadlineSeconds: 100  # Kill job after 100s
  template:
    spec:
      restartPolicy: Never   # Never or OnFailure (NOT Always)
      containers:
      - name: pi
        image: perl:5.34
        command: ["perl", "-Mbignum=bpi", "-wle", "print bpi(2000)"]
```

```bash
# Create job imperatively
kubectl create job my-job --image=busybox -- echo "Hello Job"

# Create job from a cronjob
kubectl create job test-job --from=cronjob/my-cronjob

# Watch job progress
kubectl get jobs
kubectl get pods --selector=job-name=pi-calculator
kubectl logs -l job-name=pi-calculator
```

### Job Patterns

| Pattern | completions | parallelism |
|---------|-------------|-------------|
| Single run | 1 (default) | 1 (default) |
| Fixed task queue | N | 1 |
| Work queue | unset | M |
| Parallel fixed | N | M |

---

## 1.4 CronJobs

```yaml
# cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello-cron
spec:
  schedule: "*/5 * * * *"     # Every 5 minutes
  timeZone: "America/New_York" # Optional timezone
  concurrencyPolicy: Forbid    # Allow, Forbid, Replace
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  startingDeadlineSeconds: 60  # Start within 60s of scheduled time
  suspend: false
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
          - name: hello
            image: busybox:1.28
            command:
            - /bin/sh
            - -c
            - date; echo "Hello from CronJob"
```

```bash
# Create imperatively
kubectl create cronjob my-cron --image=busybox --schedule="*/5 * * * *" -- echo hello

# Cron schedule examples
# ┌───────────── minute (0-59)
# │ ┌───────────── hour (0-23)
# │ │ ┌───────────── day of month (1-31)
# │ │ │ ┌───────────── month (1-12)
# │ │ │ │ ┌───────────── day of week (0-6, Sun=0)
# * * * * *

# "0 */2 * * *"   = Every 2 hours
# "0 8 * * 1"     = Every Monday at 8am
# "@daily"        = Every day at midnight
```

---

## 1.5 Multi-Container Pod Patterns

### Sidecar Pattern

```yaml
# sidecar-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: sidecar-example
spec:
  volumes:
  - name: shared-logs
    emptyDir: {}
  containers:
  # Main application container
  - name: app
    image: nginx:1.25
    volumeMounts:
    - name: shared-logs
      mountPath: /var/log/nginx
  # Sidecar: ships logs to external system
  - name: log-shipper
    image: busybox
    command: ["/bin/sh", "-c", "tail -f /logs/access.log"]
    volumeMounts:
    - name: shared-logs
      mountPath: /logs
```

### Ambassador Pattern

```yaml
# ambassador-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: ambassador-example
spec:
  containers:
  # Main app connects to localhost:5432
  - name: app
    image: myapp:1.0
    env:
    - name: DB_HOST
      value: "localhost"
    - name: DB_PORT
      value: "5432"
  # Ambassador proxies to real DB
  - name: db-ambassador
    image: haproxy:2.8
    ports:
    - containerPort: 5432
```

### Adapter Pattern

```yaml
# adapter-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: adapter-example
spec:
  volumes:
  - name: shared-data
    emptyDir: {}
  containers:
  - name: app
    image: legacy-app:1.0
    volumeMounts:
    - name: shared-data
      mountPath: /app/logs
  # Adapter transforms legacy log format to standard format
  - name: log-adapter
    image: log-transformer:1.0
    volumeMounts:
    - name: shared-data
      mountPath: /logs
```

---

## 1.6 Init Containers

Init containers run **before** app containers. They must complete successfully before main containers start.

```yaml
# init-container-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: init-example
spec:
  initContainers:
  - name: wait-for-db
    image: busybox:1.28
    command: ['sh', '-c', 
      'until nslookup db-service; do echo "Waiting for DB..."; sleep 2; done']
  - name: init-config
    image: busybox:1.28
    command: ['sh', '-c', 'echo "Config initialized" > /work-dir/status']
    volumeMounts:
    - name: workdir
      mountPath: /work-dir
  containers:
  - name: app
    image: myapp:1.0
    volumeMounts:
    - name: workdir
      mountPath: /app/config
  volumes:
  - name: workdir
    emptyDir: {}
```

---

## 1.7 Volumes

### EmptyDir (temporary, pod-scoped)

```yaml
volumes:
- name: cache-vol
  emptyDir: {}
  # emptyDir:
  #   medium: Memory   # RAM-backed (tmpfs)
  #   sizeLimit: 100Mi
```

### HostPath (node directory)

```yaml
volumes:
- name: host-vol
  hostPath:
    path: /data
    type: DirectoryOrCreate  # Directory, File, Socket, etc.
```

### PersistentVolumeClaim

```yaml
# pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
  - ReadWriteOnce       # RWO, ROX (ReadOnlyMany), RWX (ReadWriteMany)
  storageClassName: standard
  resources:
    requests:
      storage: 1Gi
---
# pod using PVC
apiVersion: v1
kind: Pod
metadata:
  name: pvc-pod
spec:
  volumes:
  - name: my-storage
    persistentVolumeClaim:
      claimName: my-pvc
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - name: my-storage
      mountPath: /data
```

```bash
kubectl get pv
kubectl get pvc
kubectl describe pvc my-pvc
```

---

## 🧪 Practice Exercises

### Exercise 1.1 - Build and Run a Container
1. Create a `Dockerfile` for a simple web app
2. Build the image locally
3. Run a Pod using that image

### Exercise 1.2 - Jobs
```bash
# Task: Run a job that calculates MD5 of /etc/hosts, 3 times in parallel
kubectl create job hash-job \
  --image=busybox \
  -- sh -c "md5sum /etc/hosts"
# Then edit to add completions: 3, parallelism: 3
```

### Exercise 1.3 - CronJob
```bash
# Task: Create a CronJob that prints the date every minute
kubectl create cronjob date-printer \
  --image=busybox \
  --schedule="* * * * *" \
  -- date
# Verify it runs
kubectl get cronjob date-printer
kubectl get jobs
```

### Exercise 1.4 - Multi-Container Pod
Create a Pod with:
- Main container: `nginx` serving from `/usr/share/nginx/html`
- Init container: `busybox` that writes `index.html` to a shared volume

### Exercise 1.5 - Volumes
```bash
# Task: Create PVC of 500Mi and mount it in an nginx pod at /data
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: nginx-pvc
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 500Mi
EOF
```

---

## 📝 Key Commands Summary

```bash
# Pods
kubectl run NAME --image=IMAGE [--port=PORT] [--labels="k=v"]
kubectl run NAME --image=IMAGE --dry-run=client -o yaml

# Jobs
kubectl create job NAME --image=IMAGE -- COMMAND
kubectl create job NAME --from=cronjob/CRONJOB_NAME

# CronJobs
kubectl create cronjob NAME --image=IMAGE --schedule="* * * * *" -- COMMAND

# Explain resources
kubectl explain pod.spec.initContainers
kubectl explain pod.spec.volumes
kubectl explain pvc.spec.accessModes
```

