# 🔭 Domain 3: Application Observability and Maintenance (15%)

## Topics Covered

- Understand API deprecations
- Implement Probes and Health Checks
- Use built-in CLI tools to monitor Kubernetes applications
- Utilize container logs
- Debugging in Kubernetes

---

## 3.1 Probes

| Probe | Purpose | Failure Action |
|-------|---------|----------------|
| **Liveness** | Is the container alive? | Restart the container |
| **Readiness** | Is the container ready for traffic? | Remove from Service endpoints |
| **Startup** | Has the container started? | Disables liveness/readiness until done |

```yaml
# pod-with-probes.yaml
apiVersion: v1
kind: Pod
metadata:
  name: probe-demo
spec:
  containers:
  - name: app
    image: nginx:1.25
    ports:
    - containerPort: 80

    # Startup probe: for slow-starting containers
    startupProbe:
      httpGet:
        path: /
        port: 80
      failureThreshold: 30    # Allow 30 × 10s = 5 min to start
      periodSeconds: 10

    # Liveness probe: restart if unhealthy
    livenessProbe:
      httpGet:
        path: /healthz
        port: 80
      initialDelaySeconds: 30
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 3

    # Readiness probe: remove from service if not ready
    readinessProbe:
      httpGet:
        path: /ready
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5
      failureThreshold: 3
```

### Probe Types

```yaml
# HTTP GET
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080

# TCP Socket
livenessProbe:
  tcpSocket:
    port: 3306
  initialDelaySeconds: 15

# Exec Command
livenessProbe:
  exec:
    command: [cat, /tmp/healthy]
  initialDelaySeconds: 5
  periodSeconds: 5

# gRPC (K8s 1.24+)
livenessProbe:
  grpc:
    port: 2379
```

---

## 3.2 Logging

```bash
# Basic log commands
kubectl logs POD_NAME
kubectl logs POD_NAME -c CONTAINER_NAME   # Specific container
kubectl logs POD_NAME --previous          # Previous (crashed) container
kubectl logs POD_NAME -f                  # Stream (follow)
kubectl logs POD_NAME --tail=50           # Last 50 lines
kubectl logs POD_NAME --since=1h          # Last 1 hour

# All pods matching a label
kubectl logs -l app=myapp --all-containers

# Save to file
kubectl logs POD_NAME > pod.log
```

---

## 3.3 Monitoring

```bash
# Requires metrics-server
kubectl top nodes
kubectl top nodes --sort-by=cpu

kubectl top pods
kubectl top pods -n kube-system
kubectl top pods --sort-by=memory
kubectl top pods --containers            # Per-container metrics

# Install metrics-server if not present
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

---

## 3.4 Debugging

```bash
# Pod status and events
kubectl get pod POD_NAME -o wide
kubectl describe pod POD_NAME
kubectl get events --sort-by='.lastTimestamp'

# Common pod failure states:
# Pending          → Not scheduled (resources, taints, affinity)
# CrashLoopBackOff → Container keeps crashing
# ImagePullBackOff → Cannot pull image (bad tag, auth)
# OOMKilled        → Container exceeded memory limit
# Error            → Container exited with non-zero code

# Execute into running pod
kubectl exec -it POD_NAME -- /bin/bash
kubectl exec POD_NAME -c CONTAINER -- env

# Ephemeral debug container (K8s 1.23+)
kubectl debug POD_NAME -it --image=busybox --target=CONTAINER

# Debug copy of pod
kubectl debug POD_NAME -it --image=busybox --copy-to=debug-pod

# Port-forward for local testing
kubectl port-forward pod/POD_NAME 8080:80
kubectl port-forward svc/SVC_NAME 8080:80

# Copy files
kubectl cp POD_NAME:/etc/hosts ./hosts
kubectl cp ./config.yaml POD_NAME:/app/config.yaml
```

---

## 3.5 API Deprecations

```bash
# View available API versions
kubectl api-versions
kubectl api-resources

# Inspect a resource's API version
kubectl explain deployment --api-version=apps/v1

# Common migrations:
# extensions/v1beta1 Ingress  → networking.k8s.io/v1
# apps/v1beta1 Deployment     → apps/v1
# batch/v1beta1 CronJob       → batch/v1
```

---

## 🧪 Practice Exercises

### Exercise 3.1 — Liveness Probe

```bash
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: liveness-demo
spec:
  containers:
  - name: app
    image: busybox
    command: ["/bin/sh", "-c", "touch /tmp/healthy; sleep 30; rm /tmp/healthy; sleep 600"]
    livenessProbe:
      exec:
        command: [cat, /tmp/healthy]
      initialDelaySeconds: 5
      periodSeconds: 5
EOF

# Watch restarts
kubectl get pod liveness-demo -w
kubectl describe pod liveness-demo
```

### Exercise 3.2 — Debug a Crashing Pod

```bash
kubectl run crash-pod --image=busybox -- /bin/sh -c "exit 1"
kubectl get pod crash-pod
kubectl describe pod crash-pod
kubectl logs crash-pod --previous
```

### Exercise 3.3 — Port Forward

```bash
kubectl run debug-nginx --image=nginx:1.25
kubectl port-forward pod/debug-nginx 8080:80 &
curl http://localhost:8080
```

---

## 📝 Key Commands Summary

```bash
# Logs
kubectl logs POD [-c CONTAINER] [-f] [--previous] [--tail=N] [--since=Nh]
kubectl logs -l LABEL --all-containers

# Monitoring
kubectl top pods [--sort-by=cpu|memory]
kubectl top nodes

# Debugging
kubectl describe pod POD
kubectl get events --sort-by='.lastTimestamp'
kubectl exec -it POD [-c CONTAINER] -- COMMAND
kubectl debug POD -it --image=IMAGE
kubectl port-forward POD LOCAL:REMOTE
kubectl cp POD:REMOTE LOCAL
```
