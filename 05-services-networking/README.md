# 🌐 Domain 5: Services and Networking (20%)

## Topics Covered
- Demonstrate basic understanding of NetworkPolicies
- Provide and troubleshoot access to applications via services
- Use Ingress rules to expose applications

---

## 5.1 Services

Services provide stable network access to a set of Pods.

### Service Types

| Type | Description | Use Case |
|------|-------------|----------|
| ClusterIP | Internal cluster IP only | Internal communication |
| NodePort | Exposes on each node's IP | Dev/testing external access |
| LoadBalancer | External load balancer | Production external access |
| ExternalName | CNAME to external DNS | Access external services |

### ClusterIP (Default)

```yaml
# service-clusterip.yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: ClusterIP      # Default
  selector:
    app: myapp         # Must match pod labels
  ports:
  - name: http
    port: 80           # Service port (cluster-facing)
    targetPort: 8080   # Container port
    protocol: TCP
```

### NodePort

```yaml
# service-nodeport.yaml
apiVersion: v1
kind: Service
metadata:
  name: my-nodeport-service
spec:
  type: NodePort
  selector:
    app: myapp
  ports:
  - port: 80           # ClusterIP port
    targetPort: 8080   # Pod port
    nodePort: 30080    # Node port (30000-32767, optional)
```

### LoadBalancer

```yaml
# service-loadbalancer.yaml
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
  # Optional: static IP for cloud LB
  # loadBalancerIP: "1.2.3.4"
```

### ExternalName

```yaml
# service-externalname.yaml
apiVersion: v1
kind: Service
metadata:
  name: external-db
spec:
  type: ExternalName
  externalName: my-database.example.com
```

### Headless Service (for StatefulSets)

```yaml
# service-headless.yaml
apiVersion: v1
kind: Service
metadata:
  name: headless-svc
spec:
  clusterIP: None    # Headless - no ClusterIP assigned
  selector:
    app: myapp
  ports:
  - port: 80
```

```bash
# Imperative service commands
kubectl expose pod my-pod --port=80 --target-port=8080 --name=my-svc
kubectl expose deployment my-deploy --port=80 --type=NodePort
kubectl expose deployment my-deploy --port=80 --type=LoadBalancer

# Create service directly
kubectl create service clusterip my-svc --tcp=80:8080
kubectl create service nodeport my-svc --tcp=80:8080 --node-port=30080
kubectl create service loadbalancer my-svc --tcp=80:8080

# Check service endpoints
kubectl get endpoints my-service
kubectl describe service my-service

# DNS resolution inside cluster
# Format: <service>.<namespace>.svc.cluster.local
# Example: my-service.default.svc.cluster.local
```

---

## 5.2 DNS in Kubernetes

```bash
# Pod DNS format:
# <pod-ip-dashes>.<namespace>.pod.cluster.local
# 10-0-0-1.default.pod.cluster.local

# Service DNS format:
# <service-name>.<namespace>.svc.cluster.local
# my-service.default.svc.cluster.local

# Within same namespace - just use service name:
curl my-service

# Across namespaces:
curl my-service.other-namespace
curl my-service.other-namespace.svc.cluster.local

# Test DNS from inside a pod:
kubectl run test --image=busybox --rm -it -- \
  nslookup kubernetes.default.svc.cluster.local
```

---

## 5.3 Ingress

Ingress manages external HTTP/HTTPS access to services in the cluster.

> ⚠️ Requires an **Ingress Controller** (e.g., nginx-ingress, traefik)

### Install nginx-ingress controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```

### Basic Ingress

```yaml
# ingress-basic.yaml
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
# ingress-path-routing.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: path-routing
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /api(/|$)(.*)
        pathType: ImplementationSpecific
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

### Name-Based Virtual Hosting

```yaml
# ingress-virtual-hosting.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: virtual-hosts
spec:
  ingressClassName: nginx
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
  - host: admin.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: admin-service
            port:
              number: 80
```

### TLS Ingress

```yaml
# ingress-tls.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - myapp.example.com
    secretName: myapp-tls      # kubectl create secret tls myapp-tls --cert=tls.crt --key=tls.key
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

```bash
# Ingress commands
kubectl get ingress
kubectl describe ingress my-ingress
kubectl get ingress my-ingress -o yaml

# Test ingress (with host header)
curl -H "Host: myapp.example.com" http://<ingress-ip>/
```

---

## 5.4 Network Policies

NetworkPolicy controls which pods can communicate with each other.

> ⚠️ Requires a CNI plugin that supports NetworkPolicy (e.g., Calico, Cilium, Weave)

### Default Deny All (best practice baseline)

```yaml
# netpol-deny-all.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: default
spec:
  podSelector: {}    # Selects ALL pods
  policyTypes:
  - Ingress
  - Egress
```

### Allow Specific Traffic

```yaml
# netpol-allow-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: backend          # Apply to backend pods
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend      # Only allow from frontend pods
    - namespaceSelector:
        matchLabels:
          name: monitoring   # Or from monitoring namespace
    ports:
    - protocol: TCP
      port: 8080
```

### Egress Network Policy

```yaml
# netpol-egress.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-egress
  namespace: default
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
  - to:                    # Allow DNS
    - namespaceSelector: {}
    ports:
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 53
```

### Combined Policy Example

```yaml
# netpol-full.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  # Allow from frontend in same namespace
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - port: 8080
  # Allow from load balancer (external)
  - from:
    - ipBlock:
        cidr: 10.0.0.0/8
        except:
        - 10.0.1.0/24
    ports:
    - port: 443
  egress:
  # Allow to database
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - port: 5432
  # Allow DNS
  - ports:
    - port: 53
      protocol: UDP
    - port: 53
      protocol: TCP
```

```bash
# Test network connectivity
kubectl run test-pod --image=busybox --rm -it \
  -- wget -O- http://my-service:80

# Check NetworkPolicies
kubectl get networkpolicies
kubectl describe networkpolicy my-policy

# Debug networking
kubectl run netshoot --image=nicolaka/netshoot --rm -it -- bash
```

---

## 5.5 Service Troubleshooting

```bash
# Common issue: Service not routing to pods
# Check 1: Do pod labels match service selector?
kubectl get svc my-service -o jsonpath='{.spec.selector}'
kubectl get pods --show-labels

# Check 2: Are there endpoints?
kubectl get endpoints my-service
# If endpoints is empty, labels don't match!

# Check 3: Is the port correct?
kubectl describe svc my-service
kubectl get pod my-pod -o jsonpath='{.spec.containers[0].ports}'

# Check 4: Can you reach the pod directly?
kubectl exec test-pod -- curl <pod-ip>:<container-port>

# Check 5: DNS resolution
kubectl exec test-pod -- nslookup my-service
kubectl exec test-pod -- nslookup my-service.default.svc.cluster.local

# Check 6: NetworkPolicies blocking?
kubectl get networkpolicies
kubectl describe networkpolicy
```

---

## 🧪 Practice Exercises

### Exercise 5.1 - Services
```bash
# 1. Create deployment
kubectl create deployment webapp --image=nginx:1.25 --replicas=3

# 2. Expose as ClusterIP
kubectl expose deployment webapp --port=80 --name=webapp-clusterip

# 3. Test from inside cluster
kubectl run curl-test --image=curlimages/curl --rm -it \
  -- curl http://webapp-clusterip

# 4. Expose as NodePort
kubectl expose deployment webapp \
  --port=80 \
  --type=NodePort \
  --name=webapp-nodeport

# 5. Check node port assigned
kubectl get svc webapp-nodeport
```

### Exercise 5.2 - Ingress
```bash
# 1. Create two services
kubectl create deployment api --image=nginx:1.25
kubectl expose deployment api --port=80 --name=api-svc

kubectl create deployment frontend --image=nginx:1.25
kubectl expose deployment frontend --port=80 --name=frontend-svc

# 2. Create ingress with path routing
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.local
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-svc
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-svc
            port:
              number: 80
EOF
```

### Exercise 5.3 - Network Policies
```bash
# 1. Label namespaces
kubectl label namespace default name=default

# 2. Create deny-all policy
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
EOF

# 3. Allow specific traffic
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-nginx
spec:
  podSelector:
    matchLabels:
      app: nginx
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: client
    ports:
    - port: 80
EOF
```

---

## 📝 Key Commands Summary

```bash
# Services
kubectl expose TYPE/NAME --port=PORT [--target-port=PORT] [--type=TYPE] [--name=NAME]
kubectl create service TYPE NAME --tcp=PORT:TARGETPORT
kubectl get endpoints NAME
kubectl describe svc NAME

# Ingress
kubectl get ingress
kubectl describe ingress NAME
kubectl apply -f ingress.yaml

# NetworkPolicy
kubectl get networkpolicies [-n NAMESPACE]
kubectl describe networkpolicy NAME

# DNS testing
kubectl run test --image=busybox --rm -it -- nslookup SERVICE_NAME
kubectl run test --image=nicolaka/netshoot --rm -it -- curl http://SERVICE
```

