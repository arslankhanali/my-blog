+++
date = '2025-08-04T22:50:00+10:00'
title = 'Ansible: Quick Start - 1'
series = ['automation']
tags = ['ansible']
topics = ['']
weight = 1
indexable = true
draft = false
+++

Get started with Ansible in under 1 minute — ideal for homelab setups and automation testing.

---

## Install Ansible

```sh
# On RHEL
sudo dnf install -y ansible-core

# On macOS
brew install ansible
```

---

## Run an Ansible Playbook

### Example Remote Host

| Field     | Value            |
|-----------|------------------|
| Username  | `neo`            |
| Hostname  | `node2`          |
| IP        | `192.168.50.205` |
| OS        | `Fedora`         |
| Password  | `<expected that you know>` |

---

### My playbook

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

### Run the Playbook

```sh
# Run with `login password` prompt
ansible-playbook --ask-pass -u neo -i 192.168.50.205, ping.yaml

# Run with 'login password' & 'sudo password' prompt
ansible-playbook --ask-pass --ask-become-pass -u neo -i 192.168.50.205, ping.yaml 
```

---

### Try Ad-hoc Commands
Need to use `all`
```sh
# Ping remote node
ansible all -i 192.168.50.205, -u neo -m ping 

# Run shell command
ansible all -i 192.168.50.205, -u neo -m shell -a "uptime" 
```

> Note the trailing comma `,` — this tells Ansible you're passing a literal list of hosts, not an inventory file.

---

This gets you running fast with **Ansible** on **macOS** or **RHEL**. You can later scale by adding inventories, roles, and vaults.

![thank you](https://images.unsplash.com/photo-1499744937866-d7e566a20a61?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)