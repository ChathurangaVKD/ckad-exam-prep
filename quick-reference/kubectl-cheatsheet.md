# ⚡ kubectl Cheatsheet for CKAD

## 🚀 First Things to Do on Exam Day

```bash
# 1. Set up aliases
alias k=kubectl
alias kgp='kubectl get pods'
alias kgs='kubectl get svc'
alias kgd='kubectl get deploy'
alias kgn='kubectl get nodes'

# 2. Enable autocompletion
source <(kubectl completion bash)    # bash
source <(kubectl completion zsh)     # zsh
complete -F __start_kubectl k        # Make alias work with completion

# 3. Shorthand for dry-run
export do="--dry-run=client -o yaml"
export now="--force --grace-period 0"

# Usage examples:
kubectl run pod1 --image=nginx $do > pod1.yaml
kubectl delete pod pod1 $now
```

---

## 🏃 Pods

```bash
# Create
kubectl run NAME --image=IMAGE
kubectl run NAME --image=IMAGE --port=PORT
kubectl run NAME --image=IMAGE --labels="k=v,k2=v2"
kubectl run NAME --image=IMAGE --env="K=V" --env="K2=V2"
kubectl run NAME --image=IMAGE --requests='cpu=100m,memory=64Mi'
kubectl run NAME --image=IMAGE --limits='cpu=200m,memory=128Mi'
kubectl run NAME --image=IMAGE --serviceaccount=SA
kubectl run NAME --image=IMAGE --restart=Never      # One-shot pod (not deployment)
kubectl run NAME --image=IMAGE -- COMMAND [ARGS]    # Override command

# Dry-run → generate YAML
kubectl run NAME --image=IMAGE --dry-run=client -o yaml > pod.yaml

# Get
kubectl get pods
kubectl get pods -o wide          # Show node and IP
kubectl get pods -o yaml
kubectl get pods -l app=myapp    # By label
kubectl get pods --show-labels
kubectl get pods -A              # All namespaces
kubectl get pods -w              # Watch changes
kubectl get pods --field-selector=status.phase=Running

# Describe / Logs / Exec
kubectl describe pod NAME
kubectl logs NAME [-c CONTAINER] [-f] [--previous] [--tail=N] [--since=Nh]
kubectl exec NAME -- COMMAND
kubectl exec -it NAME -- /bin/bash
kubectl exec NAME -c CONTAINER -- COMMAND

# Delete
kubectl delete pod NAME
kubectl delete pod NAME --force --grace-period=0
kubectl delete pods -l app=myapp

# Copy
kubectl cp NAME:/path/to/file ./local-file
kubectl cp ./local-file NAME:/path/to/file

# Port-forward
kubectl port-forward pod/NAME 8080:80
kubectl port-forward svc/NAME 8080:80
```

---

## 📦 Deployments

```bash
# Create
kubectl create deployment NAME --image=IMAGE [--replicas=N]
kubectl create deployment NAME --image=IMAGE --port=PORT

# Get
kubectl get deployments
kubectl get deploy NAME -o yaml
kubectl describe deploy NAME

# Scale
kubectl scale deployment NAME --replicas=N

# Update image
kubectl set image deployment/NAME CONTAINER=IMAGE:TAG

# Rollout
kubectl rollout status deployment/NAME
kubectl rollout history deployment/NAME
kubectl rollout history deployment/NAME --revision=N
kubectl rollout undo deployment/NAME
kubectl rollout undo deployment/NAME --to-revision=N
kubectl rollout pause deployment/NAME
kubectl rollout resume deployment/NAME
kubectl rollout restart deployment/NAME

# Annotate (for history)
kubectl annotate deployment NAME kubernetes.io/change-cause="message"

# Edit
kubectl edit deployment NAME
```

---

## ⚙️ Services

```bash
# Create / Expose
kubectl expose pod/deploy/rs NAME --port=PORT [--target-port=PORT] [--type=TYPE] [--name=NAME]
kubectl create service clusterip NAME --tcp=80:8080
kubectl create service nodeport NAME --tcp=80:8080 --node-port=30080
kubectl create service loadbalancer NAME --tcp=80:8080

# Get
kubectl get services / svc
kubectl get svc NAME -o yaml
kubectl describe svc NAME
kubectl get endpoints NAME

# Delete
kubectl delete svc NAME
```

---

## 🔒 ConfigMaps & Secrets

```bash
# ConfigMap
kubectl create configmap NAME --from-literal=K=V --from-literal=K2=V2
kubectl create configmap NAME --from-file=FILE
kubectl create configmap NAME --from-file=KEY=FILE
kubectl create configmap NAME --from-env-file=FILE.env
kubectl get configmap NAME -o yaml
kubectl describe configmap NAME

# Secret
kubectl create secret generic NAME --from-literal=K=V
kubectl create secret generic NAME --from-file=FILE
kubectl create secret tls NAME --cert=tls.crt --key=tls.key
kubectl create secret docker-registry NAME \
  --docker-server=SERVER \
  --docker-username=USER \
  --docker-password=PASS

kubectl get secret NAME -o yaml
kubectl get secret NAME -o jsonpath='{.data.KEY}' | base64 -d
```

---

## 👤 RBAC

```bash
# Role
kubectl create role NAME --verb=get,list,watch --resource=pods
kubectl create role NAME --verb=get --resource=pods --resource-name=specific-pod

# RoleBinding
kubectl create rolebinding NAME --role=ROLE --user=USER
kubectl create rolebinding NAME --role=ROLE --serviceaccount=NS:SA
kubectl create rolebinding NAME --role=ROLE --group=GROUP

# ClusterRole
kubectl create clusterrole NAME --verb=get,list --resource=nodes
kubectl create clusterrole NAME --non-resource-url=/healthz --verb=get

# ClusterRoleBinding
kubectl create clusterrolebinding NAME --clusterrole=ROLE --user=USER
kubectl create clusterrolebinding NAME --clusterrole=ROLE --serviceaccount=NS:SA

# ServiceAccount
kubectl create serviceaccount NAME
kubectl create token NAME [--duration=1h]

# Check permissions
kubectl auth can-i VERB RESOURCE
kubectl auth can-i VERB RESOURCE --as=USER
kubectl auth can-i VERB RESOURCE --as=system:serviceaccount:NS:SA
kubectl auth can-i --list
kubectl auth can-i --list --as=USER
```

---

## 📋 Jobs & CronJobs

```bash
# Job
kubectl create job NAME --image=IMAGE -- COMMAND
kubectl create job NAME --from=cronjob/CRONJOB_NAME
kubectl get jobs
kubectl get pods -l job-name=NAME

# CronJob
kubectl create cronjob NAME --image=IMAGE --schedule="*/5 * * * *" -- COMMAND
kubectl get cronjobs / cj
kubectl describe cronjob NAME

# Manually trigger a cronjob
kubectl create job NAME --from=cronjob/CRONJOB_NAME
```

---

## 🌐 Networking

```bash
# Ingress
kubectl get ingress / ing
kubectl describe ingress NAME
kubectl apply -f ingress.yaml

# NetworkPolicy
kubectl get networkpolicies / netpol
kubectl describe netpol NAME

# DNS testing inside cluster
kubectl run test --image=busybox --rm -it -- nslookup SERVICE
kubectl run test --image=nicolaka/netshoot --rm -it -- curl http://SERVICE
kubectl run test --image=busybox --rm -it -- wget -qO- http://SERVICE
```

---

## 🔍 Debugging & Monitoring

```bash
# Resource usage
kubectl top pods [--sort-by=cpu|memory] [--containers]
kubectl top nodes

# Events
kubectl get events --sort-by='.lastTimestamp'
kubectl get events -n NAMESPACE
kubectl get events --field-selector=reason=OOMKilling

# Debug pod
kubectl debug POD -it --image=busybox
kubectl debug POD -it --image=busybox --copy-to=debug-pod
kubectl debug node/NODE -it --image=ubuntu

# Api resources
kubectl api-resources
kubectl api-versions
kubectl explain RESOURCE
kubectl explain RESOURCE.FIELD
kubectl explain pod.spec.containers.livenessProbe
```

---

## 📁 Namespaces

```bash
kubectl create namespace NAME
kubectl get namespaces / ns
kubectl config set-context --current --namespace=NAME  # Set default namespace
kubectl get pods -n NAME
kubectl get pods -A   # All namespaces
kubectl delete namespace NAME
```

---

## 🏷️ Labels & Annotations

```bash
# Labels
kubectl label pod NAME KEY=VALUE
kubectl label pod NAME KEY=VALUE --overwrite
kubectl label pod NAME KEY-              # Remove label
kubectl get pods -l KEY=VALUE
kubectl get pods -l 'KEY in (v1,v2)'
kubectl get pods -l 'KEY notin (v1,v2)'
kubectl get pods -l 'KEY'              # Has this label
kubectl get pods -l '!KEY'             # Does not have label

# Annotations
kubectl annotate pod NAME KEY=VALUE
kubectl annotate deployment NAME kubernetes.io/change-cause="msg"
```

---

## 📊 Output Formats

```bash
kubectl get pod NAME -o yaml     # Full YAML output
kubectl get pod NAME -o json     # JSON output
kubectl get pod NAME -o wide     # Extra columns
kubectl get pod NAME -o name     # Just resource name

# JSONPath
kubectl get pod NAME -o jsonpath='{.status.podIP}'
kubectl get pods -o jsonpath='{.items[*].metadata.name}'
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.phase}{"\n"}{end}'

# Custom columns
kubectl get pods -o custom-columns=NAME:.metadata.name,NODE:.spec.nodeName
```

---

## 🔧 Helm Commands

```bash
helm repo add NAME URL
helm repo update
helm repo list
helm search repo CHART
helm search hub CHART

helm install RELEASE CHART
helm install RELEASE CHART --namespace NS --create-namespace
helm install RELEASE CHART --set key=val
helm install RELEASE CHART -f values.yaml
helm install RELEASE CHART --dry-run
helm install RELEASE CHART --version VERSION

helm upgrade RELEASE CHART
helm upgrade --install RELEASE CHART
helm upgrade RELEASE CHART --reuse-values

helm rollback RELEASE REVISION

helm list [-A]
helm status RELEASE
helm get values RELEASE
helm get manifest RELEASE

helm uninstall RELEASE

helm template RELEASE CHART   # Generate manifests locally
helm show values CHART        # Show default values
```

---

## ⏱️ Time-Saving Tricks

```bash
# Generate base YAML quickly
kubectl run pod1 --image=nginx $do > pod1.yaml
kubectl create deploy d1 --image=nginx $do > deploy1.yaml
kubectl create svc clusterip svc1 --tcp=80 $do > svc1.yaml
kubectl create cm cm1 --from-literal=k=v $do > cm1.yaml

# Quickly apply inline YAML
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
...
EOF

# Edit live resource
KUBE_EDITOR=nano kubectl edit pod NAME

# Force delete (when pod is stuck)
kubectl delete pod NAME --force --grace-period=0

# Watch rollout
kubectl rollout status deployment/NAME -w

# Get all resources in namespace
kubectl get all -n NAMESPACE

# Find which node a pod is on
kubectl get pod NAME -o wide

# Sort pods by creation time
kubectl get pods --sort-by='.metadata.creationTimestamp'

# Count pods
kubectl get pods | wc -l
```

