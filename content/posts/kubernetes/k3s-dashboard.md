+++
date = '2025-08-04T20:00:00+10:00'
title = 'Kubernetes: Deploy Dashboard for K3s'
series = ['kubernetes']
tags = ['k3s']
topics = ['deployment']
weight = 1
indexable = true
draft = false
+++

This post walks through deploying the Kubernetes Dashboard using Helm, with access via Traefik Ingress.

---

## Prerequisites
- K3s on Fedora

Install Helm:
```sh
sudo dnf install helm
helm repo add kubernetes-dashboard https://kubernetes.github.io/dashboard/
helm repo update
```
---
## Deploy the Dashboard
> To avoid the error `Unknown error (200): Http failure during parsing`, configure Kong to enable HTTP access. This is needed for Ingress.

#### Allow http
```sh
tee dashboard-values.yaml > /dev/null <<EOL
kong:
  proxy:
    http:
      enabled: true
EOL
```
![Ingress diagram](/install-argocd/ingress.png)
#### Install the dashboard:
```sh
helm upgrade --install kubernetes-dashboard kubernetes-dashboard/kubernetes-dashboard \
  --namespace kubernetes-dashboard \
  --create-namespace \
  -f dashboard-values.yaml
```

---
## TLS Setup for Ingress
> If you want to provide your own certificate for Traefik Ingress.

Create a self-signed certificate:
```sh
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key \
  -out tls.crt \
  -subj "/CN=*node1" 
```
Create the secret in the correct namespace:
```sh
kubectl create secret tls dashboard-tls \
  --cert=tls.crt --key=tls.key \
  -n kubernetes-dashboard
```
---

## Create Admin Service Account
```yaml
cat << EOF | oc apply -f-
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
EOF
```

---

## Ingress Configuration (Traefik)
```yaml
cat << EOF | oc apply -f-
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dashboard-ingress
  namespace: kubernetes-dashboard
spec:
  ingressClassName: traefik
  rules:
  - host: k3s.node1 # Change as needed
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: kubernetes-dashboard-kong-proxy
            port:
              number: 80
# Comment below lines If you are happy to use default Traefik certificate
  tls:
  - hosts:
    - k3s.node1 # Change as needed
    secretName: dashboard-tls
```

---

## Verify Services and Ingress
```sh
kubectl -n kubernetes-dashboard get ingress
kubectl -n kubernetes-dashboard get services
```
Update `/etc/hosts`:
```sh
echo "192.168.50.200 k3s.node1" | sudo tee -a /etc/hosts
```
Test access:
```sh
curl -k https://192.168.50.200 -H "Host: k3s.node1"
curl -Ik https://k3s.node1/
```

---

## Browser Notes

| Browser | HTTPS | HTTP |
|---------|-------|------|
| Chrome  | ✅ Works | ❌ Fails with CSRF token error |
| Safari  | ✅ Works | ❌ Unauthorized (401) |

---

## Get Token for Login
```sh
kubectl -n kubernetes-dashboard create token admin-user --duration=1999h
```
Paste the token in the dashboard login screen.

---
## Errors
Login errors that you might see:
1. Unauthorized (401).
   - Try using [https](https://k3s.node1) instead of [http](http://k3s.node1).

2. Fails with CSRF token error
   - Did you allow insecure(http) connection. See [Allow http](#allow-http)
   - Try incognito mode - Previously saved tokens can lead to errors 
---
## Summary
This guide sets up the dashboard with HTTP enabled behind Traefik, adds an admin user, and exposes it securely with a self-signed TLS cert. Works best with Chrome.

![thank you](https://images.unsplash.com/photo-1499744937866-d7e566a20a61?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wx)

