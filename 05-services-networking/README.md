# 🌐 Domain 5: Services and Networking (20%)

## Topics Covered

- Demonstrate basic understanding of NetworkPolicies
- Provide and troubleshoot access to applications via services
- Use Ingress rules to expose applications

---

## 5.1 Services

### Service Types

| Type | Description | Use Case |
|------|-------------|---------|
| **ClusterIP** | Internal cluster IP only | Internal communication |
| **NodePort** | Exposes on each node's IP | Dev/testing external access |
| **LoadBalancer** | External load balancer | Production external access |
| **ExternalName** | CNAME to external DNS | Access external services |

### ClusterIP (Default)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: ClusterIP
  selector:
    app: myapp
  ports:
  - name: http
    port: 80           # Service port (cluster-facing)
    targetPort: 8080   # Container port
```

### NodePort

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-nodeport-service
spec:
  type: NodePort
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080    # Range: 30000-32767
```

### LoadBalancer

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-lb-service
spec:
  type: LoadBalancer
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
```

### Headless Service (for StatefulSets)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: headless-svc
spec:
  clusterIP: None    # No ClusterIP assigned
  selector:
    app: myapp
  ports:
  - port: 80
```

```bash
# Imperative commands
kubectl expose pod POD --port=80 --target-port=8080 --name=my-svc
kubectl expose deployment DEPLOY --port=80 --type=NodePort

# Check service and endpoints
kubectl get svc
kubectl get endpoints my-service
kubectl describe service my-service
```

---

## 5.2 DNS in Kubernetes

```bash
# Service DNS format:
# <service>.<namespace>.svc.cluster.local

# Within same namespace:
curl my-service

# Across namespaces:
curl my-service.other-namespace
curl my-service.other-namespace.svc.cluster.local

# Test DNS from inside a pod:
kubectl run test --image=busybox --rm -it -- nslookup my-service
kubectl run test --image=busybox --rm -it -- nslookup kubernetes.default
```

---

## 5.3 Ingress

> Requires an **Ingress Controller** (e.g., nginx-ingress, traefik)

```bash
# Install nginx ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```

### Basic Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-service
            port:
              number: 80
```

### Path-Based Routing

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: path-routing
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

### TLS Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - myapp.example.com
    secretName: myapp-tls
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-service
            port:
              number: 80
```

---

## 5.4 Network Policies

> Requires a CNI plugin that supports NetworkPolicy (Calico, Cilium, Weave)

### Default Deny All (Best Practice Baseline)

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: default
spec:
  podSelector: {}    # Applies to ALL pods
  policyTypes:
  - Ingress
  - Egress
```

### Allow Specific Traffic

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
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
    - namespaceSelector:
        matchLabels:
          name: monitoring
    ports:
    - protocol: TCP
      port: 8080
```

### Egress with DNS Allow

```yaml
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
    - protocol: TCP
      port: 5432
  - ports:           # Always allow DNS
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 53
```

---

## 5.5 Service Troubleshooting

```bash
# Step 1: Does service selector match pod labels?
kubectl get svc my-service -o jsonpath='{.spec.selector}'
kubectl get pods --show-labels

# Step 2: Are there endpoints? (Empty = label mismatch!)
kubectl get endpoints my-service

# Step 3: Is the port correct?
kubectl describe svc my-service

# Step 4: Can you reach the pod directly?
kubectl exec test-pod -- curl <pod-ip>:<container-port>

# Step 5: DNS resolution
kubectl exec test-pod -- nslookup my-service
kubectl exec test-pod -- nslookup my-service.default.svc.cluster.local

# Step 6: NetworkPolicies blocking?
kubectl get networkpolicies
kubectl describe networkpolicy
```

---

## 🧪 Practice Exercises

### Exercise 5.1 — Services

```bash
kubectl create deployment webapp --image=nginx:1.25 --replicas=3
kubectl expose deployment webapp --port=80 --name=webapp-clusterip
kubectl run curl-test --image=curlimages/curl --rm -it -- curl http://webapp-clusterip
kubectl expose deployment webapp --port=80 --type=NodePort --name=webapp-nodeport
kubectl get svc webapp-nodeport
```

### Exercise 5.2 — Network Policy

```bash
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
spec:
  podSelector: {}
  policyTypes: [Ingress, Egress]
EOF
```

---

## 📝 Key Commands Summary

```bash
# Services
kubectl expose TYPE/NAME --port=PORT [--target-port=PORT] [--type=TYPE] [--name=NAME]
kubectl get endpoints NAME
kubectl describe svc NAME

# Ingress
kubectl get ingress
kubectl describe ingress NAME

# NetworkPolicy
kubectl get networkpolicies [-n NAMESPACE]
kubectl describe networkpolicy NAME

# DNS testing
kubectl run test --image=busybox --rm -it -- nslookup SERVICE_NAME
kubectl run test --image=nicolaka/netshoot --rm -it -- curl http://SERVICE
```
