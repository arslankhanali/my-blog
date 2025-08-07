+++
date = '2025-08-04T14:31:23+10:00'
title = 'ArgoCD: Installation'
series = ['kubernetes']
tags = ['argocd','k3s']
topics = ['']
weight = 1
indexable = true
featured = false
draft = false
+++

# Install ArgoCD on K3s with Traefik Ingress

This post walks through installing [ArgoCD](https://argo-cd.readthedocs.io/) on a K3s cluster that uses Traefik as its default Ingress controller.

## Setup

- Kubernetes: [K3s](https://k3s.io)
- Ingress Controller: [Traefik](https://doc.traefik.io/)
- Deployment method: Helm

---

## Install ArgoCD via Helm

```sh
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update
kubectl create namespace argocd
```

### Option 1: Without Ingress
Access service locally. Access service locally. See [Port Forwarding](#port-forwarding-optional-access) section.

```sh
helm install argocd argo/argo-cd --create-namespace --namespace argocd
```

### Option 2: With Ingress (Insecure)
Ingress is needed to expose the Services out of the cluster
![Ingress diagram](/install-argocd/ingress.png)

By setting the `server.insecure` flag to `true`, you're telling the `ArgoCD server` **not** to handle TLS itself to avoid common issue known as a "redirect loop" or `ERR_TOO_MANY_REDIRECTS`. Instead, it listens for and accepts plain HTTP traffic.

1. Your browser sends an HTTPS request to Traefik.
2. Traefik **terminates the TLS** and forwards an HTTP request to the argocd-server service.
3. The argocd-server accepts this HTTP request on its insecure port (typically port 80), serves the content, and the connection is successful.

```sh
# Using CLI flag
helm install argocd argo/argo-cd --create-namespace --namespace argocd --set configs.params."server\.insecure"=true

# OR using values.yaml
tee argocd-values.yaml > /dev/null <<EOL
configs:
  params:
    server.insecure: true
EOL
helm install argocd argo/argo-cd --create-namespace --namespace argocd -f argocd-values.yaml
```

Verify that `server.insecure` is set:

```sh
kubectl get cm argocd-cmd-params-cm -n argocd -o yaml | grep insecure
```

---

## Port Forwarding (Optional Access)

```sh
# Kubeconfig
# Fetch kubeconfig to your local machine
scp -r <user>@<K8s-cluster-IP>:~/.kube/config ~/k3s-config

export KUBECONFIG=~/k3s-config

# Port-forward to localhost
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Open in browser
http://localhost:8080
```
---

## Get Default Admin Password

```sh
# Ignore the `%` sign at the end - It's not part of the password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

Default username: `admin`

---

## Ingress Setup (Traefik)

### 1. Make sure you set `server.insecure:true`
If you did not Install argo with "server.insecure":"true" then you can patch the configmap and restart pods.
```sh
# Check current value
kubectl get cm argocd-cmd-params-cm -n argocd -o yaml | grep insecure

# Change value to true if not already
kubectl patch cm argocd-cmd-params-cm -n argocd --type=merge \
  -p '{"data":{"server.insecure":"true"}}'

# Restart the server for changes to take effect
kubectl -n argocd rollout restart deployment argocd-server
```

### 2. Create Ingress Resource

```yaml
cat << EOF | oc apply -f-
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-ingress
  namespace: argocd
spec:
  ingressClassName: traefik
  rules:
    - host: argocd.node1 #Change to your hostname
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: argocd-server
                port:
                  number: 80
EOF
```

Apply it:

```sh
kubectl apply -f argocd-ingress.yaml
```

---

## Add local DNS

Update your `/etc/hosts`:

`echo "192.168.50.200 argocd.node1" | sudo tee -a /etc/hosts`

or
```sh
sudo vim /etc/hosts
```

Add:

```
192.168.50.200 argocd.node1
```

Now you can access ArgoCD [https://argocd.node1](https://argocd.node1)

---

## Cleanup

```sh
helm uninstall argocd --namespace argocd
kubectl delete namespace argocd
```

ArgoCD is now set up with Traefik Ingress on your K3s cluster.