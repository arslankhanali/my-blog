+++
date = '2025-08-04T19:00:00+10:00'
title = 'Kubernetes: Install K3s on Fedora'
series = ['kubernetes']
tags = ['k3s','fedora']
topics = ['deployment']
weight = 1
indexable = true
featured = false
draft = false
+++

A minimal and secure K3s setup on a Fedora host with proper firewalld rules and SELinux support.

---

## Prerequisites

- Fedora (Workstation or Server)
- `firewalld` active and running
- SELinux in enforcing mode — K3s works fine
- User with `sudo` privileges

---

## Deploy K3s via ansible
This playbook deploys K3s on fedora

<details>
<summary>Create 'deploy-k3s.yaml'</summary>

``` yml
tee deploy-k3s.yaml > /dev/null <<EOL
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
EOL
```
</details> 

```sh
ansible-playbook --ask-pass --ask-become-pass -u <ssh-user> -i <IP-of-Server>, deploy-k3s.yaml
```
# Step by Step via CLI
## Configure Firewalld

```bash
sudo firewall-cmd --permanent --add-port=6443/tcp                            # API Server port
sudo firewall-cmd --permanent --zone=trusted --add-source=10.42.0.0/16     # Pod CIDR
sudo firewall-cmd --permanent --zone=trusted --add-source=10.43.0.0/16     # Service CIDR
sudo firewall-cmd --reload

# Optional: Confirm port is listening
ss -tulpn | grep 6443
```
---

## Install K3s

```bash
# Create a secure group(kubeconfig) to access kubeconfig
sudo groupadd kubeconfig
sudo usermod -aG kubeconfig $USER
newgrp kubeconfig

# Install K3s with kubeconfig permissions
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--write-kubeconfig-mode 640 --write-kubeconfig-group kubeconfig" sh -
```

Verify kubeconfig permissions:

```bash
ls -l /etc/rancher/k3s/k3s.yaml
# Expected: -rw-r----- 1 root kubeconfig ...
```

---

## Test K3s Installation

```bash
kubectl get all -A

# Create kubeconfig symlink
mkdir -p ~/.kube
ln -s /etc/rancher/k3s/k3s.yaml ~/.kube/config
```

---

## Uninstall K3s

```bash
sudo /usr/local/bin/k3s-uninstall.sh
```

---

## Optional: Install OpenShift CLI (`oc`)

```bash
wget https://github.com/cptmorgan-rh/install-oc-tools/blob/master/install-oc-tools.sh
chmod +x install-oc-tools.sh
sudo ./install-oc-tools.sh --latest
```

---

## Access K3s Remotely (macOS or Another Host)

``` sh
# From your client (e.g., macOS), copy kubeconfig from Fedora host:
scp -r <user>@<fedora-host-ip>:~/.kube/config ~/k3s-config
```
Edit the config file:
```yml
# vim ~/k3s-config
Change:
  server: https://127.0.0.1:6443
To:
  server: https://<fedora-host-ip>:6443
```
Use it:
```  sh
export KUBECONFIG=~/Codes/k3s-config
oc get all -A
```

---

## Summary

| Step              | Command/Action                          |
|-------------------|-----------------------------------------|
| Firewall Setup    | `firewall-cmd` for 6443 and CIDRs       |
| SELinux           | K3s runs fine in enforcing mode         |
| K3s Install       | `curl -sfL https://get.k3s.io`          |
| Verify Node       | `kubectl get nodes`                     |
| Remote Access     | `scp` + IP update + `export KUBECONFIG` |
| Uninstall         | `k3s-uninstall.sh`                      |

This setup gives you a clean, minimal Kubernetes environment with K3s on Fedora. Works great for homelabs and lightweight clusters.

![thank you](https://images.unsplash.com/photo-1499744937866-d7e566a20a61?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)