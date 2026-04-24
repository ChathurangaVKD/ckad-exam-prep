# 📦 Domain 1: Application Design and Build (20%)

## Topics Covered

- Define, build and modify container images
- Choose and use the right workload resource (Deployment, DaemonSet, CronJob, etc.)
- Understand multi-container Pod design patterns
- Utilize persistent and ephemeral volumes

---

## 1.1 Container Images

### Basic Dockerfile

```dockerfile
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

# Push to registry
docker tag myapp:1.0 myregistry.io/myapp:1.0
docker push myregistry.io/myapp:1.0
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

```bash
# Imperative commands (FASTER on exam!)
kubectl run my-pod --image=nginx:1.25
kubectl run my-pod --image=nginx --port=80 --labels="app=myapp,env=dev"

# Generate YAML without creating
kubectl run my-pod --image=nginx --dry-run=client -o yaml > pod.yaml

# Create from file
kubectl apply -f pod-basic.yaml
```

```yaml
# pod-basic.yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
  labels:
    app: myapp
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

---

## 1.3 Jobs

Jobs create one or more Pods and ensure a specified number complete successfully.

```yaml
# job-basic.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pi-calculator
spec:
  completions: 5        # Total successful completions needed
  parallelism: 2        # Run 2 pods at a time
  backoffLimit: 4       # Retry limit on failure
  activeDeadlineSeconds: 100
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
# cronjob-basic.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello-cron
spec:
  schedule: "*/5 * * * *"     # Every 5 minutes
  concurrencyPolicy: Forbid    # Allow, Forbid, Replace
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  startingDeadlineSeconds: 60
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
          - name: hello
            image: busybox:1.28
            command: ["/bin/sh", "-c", "date; echo Hello from CronJob"]
```

```bash
# Create imperatively
kubectl create cronjob my-cron --image=busybox --schedule="*/5 * * * *" -- echo hello

# Cron schedule cheatsheet:
# ┌─────────────── minute (0-59)
# │ ┌───────────── hour (0-23)
# │ │ ┌─────────── day of month (1-31)
# │ │ │ ┌───────── month (1-12)
# │ │ │ │ ┌─────── day of week (0-6, Sun=0)
# * * * * *
#
# "0 */2 * * *"  = Every 2 hours
# "0 8 * * 1"    = Every Monday at 8am
# "*/5 * * * *"  = Every 5 minutes
```

---

## 1.5 Multi-Container Pod Patterns

### Sidecar Pattern

The sidecar extends or enhances the main container.

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
  - name: app
    image: nginx:1.25
    volumeMounts:
    - name: shared-logs
      mountPath: /var/log/nginx
  - name: log-shipper
    image: busybox
    command: ["/bin/sh", "-c", "tail -n+1 -F /logs/access.log"]
    volumeMounts:
    - name: shared-logs
      mountPath: /logs
```

### Ambassador Pattern

The ambassador proxies network connections on behalf of the main container.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ambassador-example
spec:
  containers:
  - name: app
    image: myapp:1.0
    env:
    - name: DB_HOST
      value: "localhost"   # App connects to ambassador on localhost
  - name: db-ambassador
    image: haproxy:2.8
    ports:
    - containerPort: 5432  # Ambassador forwards to real DB
```

### Adapter Pattern

The adapter transforms the main container's output to a standard format.

```yaml
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
  - name: log-adapter
    image: log-transformer:1.0  # Converts legacy format to standard JSON
    volumeMounts:
    - name: shared-data
      mountPath: /logs
```

---

## 1.6 Init Containers

Init containers run **before** app containers start. All init containers must succeed.

```yaml
# init-pod.yaml
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
    command: ['sh', '-c', 'echo "Config ready" > /work-dir/status']
    volumeMounts:
    - name: workdir
      mountPath: /work-dir
  containers:
  - name: app
    image: nginx:1.25
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
  # RAM-backed: emptyDir: {medium: Memory, sizeLimit: 100Mi}
```

### HostPath (node directory)

```yaml
volumes:
- name: host-vol
  hostPath:
    path: /data
    type: DirectoryOrCreate
```

### PersistentVolumeClaim

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
  - ReadWriteOnce       # RWO | ROX (ReadOnlyMany) | RWX (ReadWriteMany)
  storageClassName: standard
  resources:
    requests:
      storage: 1Gi
---
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
    image: nginx:1.25
    volumeMounts:
    - name: my-storage
      mountPath: /data
```

---

## 🧪 Practice Exercises

### Exercise 1.1 — Build a Container Image

1. Write a `Dockerfile` for a simple Node.js or Python app
2. Build the image locally: `docker build -t myapp:1.0 .`
3. Run a Pod using that image

### Exercise 1.2 — Jobs

```bash
# Create a job that prints hostname 5 times in parallel (2 at a time)
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: hostname-job
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
        command: ["hostname"]
EOF
kubectl get jobs
kubectl get pods -l job-name=hostname-job
```

### Exercise 1.3 — CronJob

```bash
# Create a CronJob that prints the date every minute
kubectl create cronjob date-printer \
  --image=busybox \
  --schedule="* * * * *" \
  -- date

kubectl get cronjob date-printer
kubectl get jobs
```

### Exercise 1.4 — Multi-Container Pod

Create a Pod with:
- Init container (`busybox`) writing `index.html` to a shared volume
- Main container (`nginx`) serving from that volume
- Sidecar container (`busybox`) tailing the nginx access log

### Exercise 1.5 — PVC

```bash
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
kubectl get pvc
```

---

## 📝 Key Commands Summary

```bash
# Pods
kubectl run NAME --image=IMAGE [--port=PORT] [--labels="k=v"]
kubectl run NAME --image=IMAGE --dry-run=client -o yaml > pod.yaml

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
