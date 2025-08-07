+++
date = '2025-08-07T15:12:10+10:00'
title = 'Homelab: Kubernetes'
series = ['homelab']
tags = ['kubernetes','gitops']
topics = ['deployment']
weight = 3
indexable = true
featured = false
draft = true
+++

# Let's Deploy Everything

### Example Remote Host

| Field     | Value            |
|-----------|------------------|
| Username  | `neo`            |
| Hostname  | `node1`          |
| IP        | `192.168.50.200` |
| OS        | `Fedora`         |
| Password  | `<expected that you know>` |


---
## 1. Deploy K3s

```sh
ansible-playbook --ask-pass --ask-become-pass -u neo -i 192.168.50.200, ansible/deploy-k3s.yaml
```
<details>
<summary>Click to see ansible playbook 'deploy-k3s.yaml'</summary>

``` yml
---
- name: Deploy K3s on Fedora VM
  hosts: all
  vars:
    k3s_install_script_url: "https://get.k3s.io"

  tasks:
    - name: Ensure firewalld is running
      ansible.builtin.service:
        name: firewalld
        state: started
        enabled: yes
      become: yes

    - name: Add K3s API server
      ansible.posix.firewalld:
        port: 6443/tcp
        permanent: yes
        state: enabled
      become: yes
      notify: Reload firewalld

    - name: Add K3s Pod network
      ansible.posix.firewalld:
        zone: trusted
        source: 10.42.0.0/16
        permanent: yes
        state: enabled
      become: yes
      notify: Reload firewalld

    - name: Add K3s Service network
      ansible.posix.firewalld:
        zone: trusted
        source: 10.43.0.0/16
        permanent: yes
        state: enabled
      become: yes
      notify: Reload firewalld

    - name: Create kubeconfig group
      ansible.builtin.group:
        name: kubeconfig
        state: present
      become: yes

    - name: Add user to kubeconfig group
      ansible.builtin.user:
        name: "{{ ansible_user }}"
        groups: kubeconfig
        append: yes
      become: yes

    - name: Install K3s with custom kubeconfig permissions
      ansible.builtin.shell: |
        curl -sfL {{ k3s_install_script_url }} | INSTALL_K3S_EXEC="--write-kubeconfig-mode 640 --write-kubeconfig-group kubeconfig" sh -
      args:
        creates: /usr/local/bin/k3s
      become: true

    - name: Create .kube directory for the user
      ansible.builtin.file:
        path: "{{ ansible_user_dir }}/.kube"
        state: directory
        mode: '0755'
        owner: "{{ ansible_user }}"
        group: "{{ ansible_user }}"

    - name: Symlink K3s kubeconfig to ~/.kube/config
      ansible.builtin.file:
        src: /etc/rancher/k3s/k3s.yaml
        dest: "{{ ansible_user_dir }}/.kube/config"
        state: link
        owner: "{{ ansible_user }}"
        group: "{{ ansible_user }}"
      become: true

  handlers:
    - name: Reload firewalld
      ansible.builtin.service:
        name: firewalld
        state: reloaded
      become: yes
```
</details> 

### Fetch kubeconfig

```sh
# Fetch kubeconfig from K8s cluster
scp -r neo@192.168.50.200:~/.kube/config ~/k3s-config

# MacOS only: Update IP in kubeconfig
sed -i '' 's/127.0.0.1/192.168.50.200/g' ~/k3s-config

# Login to K8s
export KUBECONFIG=~/k3s-config
kubectl get all -A  # verify access
```

---
See my previous post on [App of Apps](/posts/argocd-app-of-apps/)

## 2. Install ArgoCD

```sh
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

kubectl create namespace argocd
helm install argocd argo/argo-cd -n argocd -f argocd/values.yaml # insecure access = true for Ingress through Traefik & enable Helm through Kustomize

# Ingress (for K3s) - Expose argocd at https://argocd.node1
kubectl apply -f argocd/ingress.yaml
```

---


## 3. Set Local DNS

Edit `/etc/hosts`:

```sh
192.168.50.200 k3s.node1 argocd.node1 test.node1 hello.node1
```
---
## 4. Give ArgoCD Access to Your Private Git Repo

```sh
# Generate SSH key (no passphrase)
ssh-keygen -t ed25519 -C "argocd@node1" -f argocd_git_key

# Copy public key to GitHub deploy keys
cat argocd_git_key.pub
```

👉 Add the key at  
`https://github.com/arslankhanali/homelab-kubernetes/settings/keys/new`

```sh
# Login to ArgoCD
argocd login argocd.node1 --insecure --username admin \
  --password $(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)

# Add private Git repo
argocd repo add git@github.com:arslankhanali/homelab-kubernetes.git \
  --ssh-private-key-path argocd_git_key \
  --name homelab-kubernetes \
  --project default

# Clean up keys
rm argocd_git_key*
```

---

## 5. Access ArgoCD Dashboard

To observe app deployment in real time:

- Open [https://argocd.node1](https://argocd.node1)

```sh
# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

---

## 6. Unleash Everything

```sh
# Trigger App of Apps pattern
kubectl apply -f root-app.yaml
```

## 7. Access Apps

- [Kubernetes Dashboard](https://k3s.node1/#/workloads?namespace=_all)  
```sh
# Get bearer token
kubectl get secret admin-user -n kubernetes-dashboard -o jsonpath="{.data.token}" | base64 -d
```
If you get `401 Unauthorized`, ensure you're using HTTPS.

- [Guestbook](http://test.node1)  
- [Podinfo](http://hello.node1)

---

## 7. Delete Everything

```sh
# Delete all ArgoCD apps
kubectl delete -f root-app.yaml

for app in $(kubectl get applications -n argocd -o jsonpath='{.items[*].metadata.name}'); do
  kubectl patch application "$app" -n argocd -p '{"metadata":{"finalizers":[]}}' --type=merge
  kubectl delete application "$app" -n argocd --force --grace-period=0
done

# Clean up namespaces
kubectl delete ns argocd
kubectl delete ns kubernetes-dashboard
kubectl delete ns podinfo


# Delete K3s
# ansible-playbook --ask-pass --ask-become-pass -u neo -i 192.168.50.200, ansible/remove-k3s.yaml

```

---

## 8. Deploy new app
1. Add application to the `apps/` folder.
2. Test the application
```
kustomize build .
kustomize edit fix
kustomize build <kustomization-dir> | kubectl apply -f -
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
      - CreateNamespace=true        # If namespace should be created
```
</details>    

4. Reference file you created in step3 in `/env/k3s/kustomization.yaml`
5. Git push the repository
6. Argo should sync automatically

---