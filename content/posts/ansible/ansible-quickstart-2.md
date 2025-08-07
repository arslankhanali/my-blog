+++
date = '2025-08-04T22:45:00+10:00'
title = 'Ansible: Quick Start - 2'
series = ['automation']
tags = ['ansible']
topics = ['']
weight = 2
indexable = true
draft = true
+++

## 1. Install Ansible

```sh
# On RHEL
sudo dnf install -y ansible-core

# On macOS
brew install ansible
```

---

## 2. Example Remote Host

| Field     | Value            |
|-----------|------------------|
| Username  | `neo`            |
| Hostname  | `node2`          |
| IP        | `192.168.50.205` |
| OS        | `Fedora`         |
| Password  | `<you should know>` |

---

## 3. SSH Setup (Optional)
On your laptop

### 3.0 SSH setup for remote host
```sh
# Check for SSH keys
ls ~/.ssh

# If you dont already have a ssh key pair
ssh-keygen -t rsa -b 4096

# Copy your public key to host
ssh-copy-id -o StrictHostKeyChecking=no neo@192.168.50.205
```
### 3.1 SSH Config

```sh
tee ~/.ssh/config > /dev/null <<EOL
Host node2
    User neo
EOL
```

### 3.2 Local DNS Resolution

```sh
echo "192.168.50.205 node2" | sudo tee -a /etc/hosts
```

### 3.3 Test
Login without IP and password
```sh
ssh node2
```
---

## 4. Create Your First Playbook

```sh
tee ping.yaml > /dev/null <<EOL
---
- name: Test Connection Playbook
  hosts: all
  gather_facts: true
  max_fail_percentage: 0
  tasks:
    - name: Ping hosts
      ansible.builtin.ping:
EOL
```

---

## 5. Run Playbook with IP

```sh
# Run with login password prompt
ansible-playbook -u neo --ask-pass -i 192.168.50.205, ping.yaml

# Run with sudo password prompt as well
ansible-playbook -u neo --ask-pass --ask-become-pass -i 192.168.50.205, ping.yaml
```

> Note the trailing comma `,` tells Ansible this is a literal host list.

---

## 6. Create `ansible.cfg`

```sh
sudo tee ansible.cfg > /dev/null <<EOL
[defaults]
inventory = ~/Codes/inventory
gathering = explicit
private_key_file = ~/.ssh/id_rsa

[ssh_connection]
EOL
```

---

## 7. Create Inventory file

```sh
sudo tee inventory > /dev/null <<EOL
[nodes]
node2 ansible_host=192.168.50.205 ansible_user=neo ansible_become_password=<NOT REAL PASSWORD>

[localhost]
mac ansible_host=127.0.0.1 ansible_user=arslankhan ansible_connection=local

[nodes:vars]
ansible_ssh_common_args = -o StrictHostKeyChecking=no -o ControlMaster=auto -o ControlPersist=60s

[homelab]
node[1:2]
EOL
```
## Run playbooks

```sh
# Run playbooks
ansible-playbook ping.yaml -l node2
```

## 8. Common Commands

```sh
# View inventory
ansible-inventory --inventory inventory --list
ansible-inventory --graph

# List variables
ansible-inventory --host node1

# Syntax check
ansible-playbook ping.yaml --syntax-check

# List target hosts
ansible-playbook -l node1 ping.yaml --list-hosts
```

---

## 9. Using Ansible Vault

### 9.1 Create and Use Vault

```sh
ansible-vault create secrets.yaml
# Add secrets like:
# ansible_ssh_pass: your_password
# ansible_become_pass: your_sudo_password

echo "your_password" > vault-password-file
```

### 9.2 Edit/View Vault

```sh
ansible-vault edit secrets.yaml
ansible-vault view secrets.yaml
```

---

## 10. Run Playbooks with Vault and Inventory

```sh
# Basic
ansible-playbook ping.yaml -l node2

# With vault + vars
ansible-playbook ping.yaml \
  --vault-password-file vault-password-file \
  -e @secrets.yaml \
  -l node2
```

---

## 11. Run Locally on macOS

```sh
# Without root
ansible-playbook -l localhost ping.yaml --connection=local

# With root
ansible-playbook -l localhost ping.yaml --connection=local --ask-become-pass
```

---

## 12. Expect Module for Privileged Access

> Use when you can't `sudo` and root login is disabled.

```sh
# Whoami as root
ansible node2 \
  -u neo --ask-pass \
  -m expect \
  -a "command='su root -c whoami' responses=password=<YOUR PASSWORD> timeout=1"
```

### Make User Passwordless Sudo (using expect)

```sh
# Create sudoers file
ansible node2 \
  -u neo --ask-pass \
  -m expect \
  -a "command='su root -c \'touch /etc/sudoers.d/neo\'' responses=Password=<YOUR PASSWORD>"

# Add permission line
ansible node2 \
  -u neo --ask-pass \
  -m expect \
  -a "command='su root -c \'echo \"%neo ALL=(ALL) NOPASSWD: ALL\" | sudo tee -a /etc/sudoers.d/neo\'' responses=Password=<YOUR PASSWORD>"
```

---

## 13. Missing `sshpass` Error Fix (macOS)

```sh
brew install https://raw.githubusercontent.com/kadwanev/bigboybrew/master/Library/Formula/sshpass.rb
```

---

This is your personal Ansible quick reference — opinionated, minimal, and proven in a homelab context.

{{< figure src="https://images.unsplash.com/photo-1499744937866-d7e566a20a61?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Thank you" >}}
