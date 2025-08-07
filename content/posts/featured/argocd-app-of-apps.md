+++
date = '2025-08-06T18:00:00+10:00'
title = 'Mastering Kubernetes Deployments with the GitOps based App of Apps Pattern'
series = ['pattern']
tags = ['gitops','kubernetes','devops']
topics = ['']
weight = 1
indexable = true
featured = true
draft = false
+++

# Mastering Kubernetes Deployments with GitOps

Managing multiple Kubernetes clusters and applications can get complex fast. **GitOps** helps tame this complexity—and the **App of Apps pattern** takes it to the next level with declarative, scalable, and automated infrastructure management.

---
## Why Read this blog?

To live like this
![relax](https://images.unsplash.com/photo-1496046744122-2328018d60b6?q=80&w=2374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

---
## What is GitOps?

GitOps is a **DevOps operating model** where Git is the **single source of truth** for declarative infrastructure and applications. Tools like Argo CD sync the state of your Kubernetes clusters to match Git, automatically and continuously.

## WHAT is the "App of Apps Pattern"?

The *App of Apps* pattern uses a single Argo CD Application to manage many other Argo CD Applications. It enables **modular**, **scalable**, and **environment-specific** deployment structures.

Imagine one app (`root-app.yaml`) that deploys:

- Platform apps like Ingress, Cert-Manager & Operators
- Workload apps like Podinfo, Guestbook, etc.

Each app lives in its own folder, can use Kustomize/Helm, and is deployed declaratively from Git.

## WHY use the "App of Apps Pattern"?

It offers:

- **Declarative control** :  Everything is defined in Git.
- **Zero-touch provisioning** :  GitOps installs and configures your entire stack.
- **Environment-specific overlays** :  Adapt configurations for K3s, OpenShift, Dev, Prod etc.
- **Disaster recovery** :  Rebuild any where
- **Auditable changes** :  Every change is a Git commit.
- **No drift** :  GitOps continuously reconciles desired vs. actual state.
- **Self Healing** :  Accidently deleted something ? Let GitOps fix it for you.

---
# Let's Deploy everything (in seconds)
Start the timer  
## Prerequisites to Deploy

- A Kubernetes cluster: This demo is tested on `K3s` but should work on any cluster
- CLI tools :  `kubectl`, `helm`
- Forked git repo :
  ```sh
  git clone https://github.com/arslankhanali/GitOps-App-of-Apps-Pattern.git`
  ```
Now! start the timer
## 1. Install argocd on your Kubernetes cluster

```bash
export KUBECONFIG=~/k3s-config  # <-- To access Kubernetes cluster
# kubectl get all -A

helm repo add argo https://argoproj.github.io/argo-helm
helm repo update
kubectl create namespace argocd
helm install argocd argo/argo-cd -n argocd -f argocd/values.yaml
```

Apply environment-specific ingress for argocd : 

```bash
# K3s
kubectl apply -f argocd/ingress.yaml

# OpenShift
kubectl apply -f argocd/route.yaml
```

---
## 2. Set DNS locally
Make sure your `/etc/hosts` file has following entries.    
```
# sudo vim /etc/hosts
<K3s-cluster-IP> k3s.node1 argocd.node1 test.node1 hello.node1
```
## 3. Login to Argo dashboard
To see apps getting deployed.
- Argocd [argocd.node1](https://argocd.node1)
```bash
# Get Login password for admin user
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

## 4. Unleash everything
This points to k3s right now
```bash
kubectl apply -f root-app.yaml
```
1. 
![oprah](/my-blog/static/argocd-app-of-apps/oprah.png)


2. 
![oprah](/static/argocd-app-of-apps/oprah.png)


3. 
![oprah](/argocd-app-of-apps/oprah.png)


#### Access apps
- Kubernetes Dashboard [k3s.node1](https://k3s.node1)
```
# Get Bearer Token
kubectl get secret admin-user -n kubernetes-dashboard -o jsonpath="{.data.token}" | base64 -d
```
- Guestbook [test.node1](http://test.node1)
- Podinfo [hello.node1](http://hello.node1)
 
You can now stop the Timer. It tooks me < 1min to deploy everything.

# ArgoCD has : 
1. Synced the `env/{k3s}/` directory.
2. Created child applications in {platform & workloads} folders.
3. Deployed all components declaratively.

This pattern allows full cluster rebuilds and updates via Git commits alone.
![alt text](/argocd-app-of-apps/argocd.png)

---

### Steps to deploy new app
1. Add application to the `apps/` folder.
2. Test the application
```sh
kustomize build <kustomization-dir> | kubectl apply -f -
# or
kubectl apply -k k8s/overlays/dev

```
3. Create argocd-application in `env/{k3s}` folder
<details>
<summary>See example: argoproj Application'</summary>

``` yml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: <app-name>      # <-- CHANGE THIS as needed
  namespace: argocd     # <-- NEVER CHANGE
spec:
  project: default
  source:
    repoURL: git@github.com:arslankhanali/homelab-kubernetes.git
    path: apps/<app-name>/overlays/k3s  # <-- CHANGE THIS as needed
    targetRevision: HEAD
  destination:
    server: https://kubernetes.default.svc
    namespace: <app-name> # <-- CHANGE THIS as needed
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true        # If namespace named above should be created
```
</details>    

4. Reference file you created in step3 in `/env/k3s/kustomization.yaml`
5. Push to git `git add . && git commit -m "new app" && git push`
6. Argo should sync automatically

---
## Delete All
```sh
kubectl delete -f root-app.yaml

# delete all argocd apps
for app in $(kubectl get applications -n argocd -o jsonpath='{.items[*].metadata.name}'); do
  kubectl patch application "$app" -n argocd -p '{"metadata":{"finalizers":[]}}' --type=merge
  kubectl delete application "$app" -n argocd --force --grace-period=0
done

kubectl delete ns argocd
kubectl delete ns kubernetes-dashboard
kubectl delete ns podinfo
kubectl delete ns guestbook
```
---

## Summary

The ArgoCD App of Apps pattern offers a scalable, Git-driven blueprint for managing Kubernetes clusters : 

- Manage everything declaratively in Git
- Scale across environments like K3s and OpenShift
- Rebuild or recover your clusters on demand

> The App of Apps pattern isn't just a tool—it's a mindset shift for cloud-native GitOps. Adopt it to bring structure, repeatability, and security to your infrastructure.

---

# Appendix
## Repository Structure Overview

```bash
├── apps             # Apps & workload YAMLS, Helm charts or Kustomize can go here
│   ├── guestbook    # Sample App from https://github.com/argoproj/argocd-example-apps/tree/master/kustomize-guestbook
│   │   ├── base
│   │   └── overlays
│   ├── kubernetes-dashboard    # Upstream K8s dashboard https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/
│   │   ├── base
│   │   └── overlays
│   └── podinfo       # Sample App from https://github.com/stefanprodan/podinfo/tree/master/kustomize
│       ├── base
│       └── overlays
├── env               # ArgoCD Applications - Folders can be Cluster-specific (k3s,openshift) or Env Specific (dev,
│   ├── k3s
│   │   ├── kustomization.yaml
│   │   ├── platform
│   │   └── workloads
│   └── openshift
│       ├── kustomization.yaml
│       ├── platform
│       └── workloads
├── ingress.yaml      # Ingress to access ArgoCD dashboard
├── README.md
├── root-app.yaml     # Root ARGOCD application
└── values.yaml       # Deploy Argo with insecure access (needed for Ingress) & enable Helm for kustomize
```
![as](/argocd-app-of-apps/flow1.png)
### 1. `apps/` – Add your Apps in a folder here

I have 3 apps here as an example : 
- guestbook :  Kustomize based app [argocd-kustomize-guestbook](https://github.com/argoproj/argocd-example-apps/tree/master/kustomize-guestbook) 
- kubernetes-dashboard/ :  Kustomize calls Helm to install K8s dashboard for K3s.
- podinfo :  Kustomize based app [stefanprodan-podinfo](https://github.com/stefanprodan/podinfo/tree/master/kustomize)

> You can use YAML manifests, kustomize or Helm charts to add more applications in this folder. 

Each app follows : 

```sh
apps/
  └── <app1>/
      ├── base/
      └── overlays/
          ├── <env1-name>/    # <--- Can Change Name - e.g. DEV
          └── <env2-name>/    # <--- Can Change Name - e.g. PROD
```

### 2. `env/` – Create your ARGOCD APPLICATIONS here for your env
"ArgoCD Application" definitions for different environments. They basically call different overlays in apps.

- env/k3s/ :  Deploys K8s Dashboard and uses `Ingress` for apps
- env/openshift/  :  No K8s Dashboard and uses `Route` for apps

Each env follows : 
```sh
── env
│   ├── <env1-name>
│   │   ├── kustomization.yaml
│   │   ├── platform  # <--- Can Change Name - Just used to categorise `argocd-application`
│   │   │   └── 'argocd-application-for-app1'.yaml
│   │   └── workloads # <--- Can Change Name - Just used to categorise `argocd-application`
│   │       ├── 'argocd-application-for-app2'.yaml
│   │       └── 'argocd-application-for-app3'.yaml
```
### 3. `root-app.yaml` – The Orchestrator

> Main reason this pattern is called `APP OF APPS`.   

This `top-level ArgoCD Application` points to env/{k3s} and deploys all children `ArgoCD Application` in it.
