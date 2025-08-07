+++
date = '2025-08-04T21:45:00+10:00'
title = 'HAProxy: How Ceph Found L3 Balance'
series = ['networking']
tags = ['haproxy', 'ceph']
topics = ['deployment']
weight = 1
indexable = true
draft = false
+++
![haproxy](/basic-haproxy/haproxy.png)
In a lab far away, Ceph lived across three nodes — `ceph-node01`, `ceph-node02`, and `ceph-node03`. Each node was a diligent guardian, managing storage and services on port **8443**. But there was a problem: access was restricted, and only one gateway, a single door at IP `192.168.99.61` on port **9000**, was open to outsiders. No one could knock on port 80’s door anymore — it was locked tight.

Ceph needed a wise gatekeeper to direct visitors fairly among the three nodes, so none got overwhelmed. Enter **HAProxy**, a simple but powerful load balancer, ready to bring harmony.

### The Challenge

- The Ceph nodes spoke securely on port **8443**.
- Only port **9000** was reachable from outside.
- SELinux guarded the system fiercely, preventing rogue processes from binding unusual ports or making unexpected connections.

### HAProxy to the Rescue

HAProxy was installed quietly with:

```bash
dnf -y install haproxy
```

To convince SELinux to trust HAProxy’s new role, the magic command was cast:

```bash
setsebool -P haproxy_connect_any=1
```

With trust secured, HAProxy configured its front door by listening on `192.168.99.61:9000` and redirecting incoming visitors to the three Ceph nodes in a balanced, round-robin dance.

### The Configuration Story

A little script was written to tell HAProxy exactly how to guide visitors:

```bash
#!/bin/bash

# frontend_ip="192.168.99.61"
# frontend_port="9000"

# backend_ips=("192.168.99.61" "192.168.99.62" "192.168.99.63")
# backend_hostnames=("ceph-node01" "ceph-node02" "ceph-node03")
# backend_port="8443"

cat > /etc/haproxy/haproxy.cfg << EOF
frontend ceph_front
    bind 192.168.99.61:9000
    default_backend ceph_back

backend ceph_back
    balance roundrobin
    server ceph-node01 192.168.99.61:8443 check
    server ceph-node02 192.168.99.62:8443 check
    server ceph-node03 192.168.99.63:8443 check
EOF


systemctl restart haproxy
```

This script is HAProxy’s map and guide, balancing load and checking if each Ceph node is ready to receive guests.

### The Happy Ending

Visitors came knocking on `https://192.168.99.61:9000`, unaware of the careful orchestration behind the scenes. HAProxy gracefully sent each visitor to a Ceph node in turn, ensuring no one node was overwhelmed.

SELinux nodded approvingly, and the lab stayed secure.

You can test this harmony yourself:

```bash
curl -k https://192.168.99.61:9000
```

### Lessons from Ceph’s Story

| Problem                      | Solution                                |
| ---------------------------- | --------------------------------------- |
| Restricted port access       | Use HAProxy on an allowed port (9000)   |
| Multiple backend servers     | Round-robin load balancing              |
| SELinux blocking connections | Enable `haproxy_connect_any` boolean    |
| Dynamic backend management   | Scripted configuration for easy updates |

In your own labs, think of HAProxy as the wise gatekeeper, balancing requests with fairness, security, and simplicity — just like Ceph needed.

---

This story shows how small tweaks and a simple tool can solve network puzzles and keep services running smoothly.


![thank you](https://images.unsplash.com/photo-1499744937866-d7e566a20a61?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)