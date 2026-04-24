# 🔭 Domain 3: Application Observability and Maintenance (15%)

## Topics Covered
- Understand API deprecations
- Implement Probes and Health Checks
- Use built-in CLI tools to monitor Kubernetes applications
- Utilize container logs
- Debugging in Kubernetes

---

## 3.1 Probes (Health Checks)

Kubernetes has three types of probes:
- **Liveness**: Is the container alive? Restart if failing.
- **Readiness**: Is the container ready to serve traffic? Remove from Service if failing.
- **Startup**: Has the container started? Disable liveness/readiness until done.

### Complete Probes Example

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
    
    # Startup probe - for slow starting containers
    startupProbe:
      httpGet:
        path: /healthz
        port: 80
      failureThreshold: 30    # Allow 30 * 10s = 5 min to start
      periodSeconds: 10
    
    # Liveness probe - restart if unhealthy
    livenessProbe:
      httpGet:
        path: /healthz
        port: 80
      initialDelaySeconds: 30  # Wait 30s after startup
      periodSeconds: 10        # Check every 10s
      timeoutSeconds: 5        # Timeout after 5s
      failureThreshold: 3      # Restart after 3 failures
      successThreshold: 1      # 1 success to be considered live
    
    # Readiness probe - remove from service endpoints if failing
    readinessProbe:
      httpGet:
        path: /ready
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5
      failureThreshold: 3
      successThreshold: 1
```

### Probe Types

```yaml
# HTTP GET probe
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
    httpHeaders:
    - name: X-Custom-Header
      value: probe

# TCP Socket probe
livenessProbe:
  tcpSocket:
    port: 3306
  initialDelaySeconds: 15

# Exec Command probe
livenessProbe:
  exec:
    command:
    - cat
    - /tmp/healthy
  initialDelaySeconds: 5
  periodSeconds: 5

# gRPC probe (K8s 1.24+)
livenessProbe:
  grpc:
    port: 2379
```

---

## 3.2 Logging

```bash
# View pod logs
kubectl logs my-pod
kubectl logs my-pod -c my-container    # Specific container
kubectl logs my-pod --previous         # Previous container instance
kubectl logs my-pod -f                 # Follow (stream) logs
kubectl logs my-pod --tail=50          # Last 50 lines
kubectl logs my-pod --since=1h         # Last 1 hour
kubectl logs my-pod --since-time="2024-01-01T00:00:00Z"

# View logs for all pods with a label
kubectl logs -l app=myapp --all-containers

# Save logs to file
kubectl logs my-pod > pod.log
```

### Log Aggregation with Sidecar

```yaml
# logging-sidecar.yaml
apiVersion: v1
kind: Pod
metadata:
  name: logging-pod
spec:
  volumes:
  - name: log-vol
    emptyDir: {}
  containers:
  - name: app
    image: nginx:1.25
    volumeMounts:
    - name: log-vol
      mountPath: /var/log/nginx
  - name: log-agent
    image: busybox
    command: ["/bin/sh", "-c", "tail -n+1 -F /logs/access.log"]
    volumeMounts:
    - name: log-vol
      mountPath: /logs
```

---

## 3.3 Monitoring

```bash
# Node resource usage
kubectl top nodes
kubectl top nodes --sort-by=cpu
kubectl top nodes --sort-by=memory

# Pod resource usage
kubectl top pods
kubectl top pods -n kube-system
kubectl top pods --sort-by=cpu
kubectl top pods -l app=myapp
kubectl top pods --containers   # Show per-container metrics

# Requires metrics-server to be installed
# Install metrics-server:
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

---

## 3.4 Debugging

### Debugging Pods

```bash
# Check pod status
kubectl get pod my-pod
kubectl describe pod my-pod       # Events, conditions, status
kubectl get pod my-pod -o yaml    # Full spec and status

# Common pod states:
# Pending       - Not scheduled yet (resource issues, taints)
# Running       - At least one container running
# Completed     - All containers exited successfully
# Error/CrashLoopBackOff - Container keeps failing
# ImagePullBackOff - Can't pull image
# OOMKilled     - Out of memory

# Get events
kubectl get events --sort-by='.lastTimestamp'
kubectl get events -n mynamespace

# Execute command in running pod
kubectl exec my-pod -- ls /
kubectl exec my-pod -c my-container -- env
kubectl exec -it my-pod -- /bin/bash
kubectl exec -it my-pod -c sidecar -- /bin/sh

# Copy files
kubectl cp my-pod:/etc/hosts ./hosts
kubectl cp ./config.yaml my-pod:/app/config.yaml

# Port forward (for debugging)
kubectl port-forward pod/my-pod 8080:80
kubectl port-forward service/my-service 8080:80
kubectl port-forward deployment/my-deploy 8080:80
```

### Debugging Nodes

```bash
# Check node status
kubectl get nodes
kubectl describe node my-node
kubectl top node my-node

# Check node conditions
kubectl get node my-node -o jsonpath='{.status.conditions[*].type}'

# Debug with ephemeral container (K8s 1.23+)
kubectl debug my-pod -it --image=busybox --target=my-container

# Create a debug copy of a pod
kubectl debug my-pod -it --image=busybox --copy-to=debug-pod

# Debug node issues
kubectl debug node/my-node -it --image=ubuntu
```

### Debugging Deployments

```bash
# Check deployment status
kubectl rollout status deployment/my-deploy
kubectl rollout history deployment/my-deploy

# Check ReplicaSet
kubectl get rs -l app=myapp
kubectl describe rs my-rs

# Check endpoints (service not routing?)
kubectl get endpoints my-service
kubectl describe service my-service

# Check if labels match
kubectl get pod --show-labels
kubectl get pod -l app=myapp
```

---

## 3.5 API Deprecations

```bash
# Check API versions available
kubectl api-versions
kubectl api-resources

# Check what version an object uses
kubectl explain deployment --api-version=apps/v1

# Convert deprecated manifests
kubectl convert -f old-manifest.yaml --output-version apps/v1

# Check deprecation warnings
kubectl apply -f manifest.yaml --warnings-as-errors

# Common API version changes:
# extensions/v1beta1 Ingress → networking.k8s.io/v1
# apps/v1beta1 Deployment → apps/v1
# batch/v1beta1 CronJob → batch/v1
```

---

## 🧪 Practice Exercises

### Exercise 3.1 - Probes
```bash
# Create a pod with failing liveness probe and observe behavior
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

### Exercise 3.2 - Debugging CrashLoopBackOff
```bash
# Create a crashing pod
kubectl run crash-pod --image=busybox -- /bin/sh -c "exit 1"

# Debug it
kubectl get pod crash-pod
kubectl describe pod crash-pod
kubectl logs crash-pod --previous

# Fix and redeploy
kubectl delete pod crash-pod
kubectl run fixed-pod --image=busybox -- /bin/sh -c "sleep 3600"
```

### Exercise 3.3 - Exec and Port-Forward
```bash
# Deploy nginx and debug via exec
kubectl run debug-nginx --image=nginx:1.25

# Exec into pod
kubectl exec -it debug-nginx -- /bin/bash
# Inside pod:
# apt-get update && apt-get install -y curl
# curl localhost

# Port-forward to access locally
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
kubectl debug POD -it --image=IMAGE [--target=CONTAINER]
kubectl port-forward POD LOCAL:REMOTE
kubectl cp POD:REMOTE LOCAL

# API
kubectl api-versions
kubectl api-resources
kubectl explain RESOURCE.FIELD
```

