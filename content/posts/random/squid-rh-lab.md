+++
date = '2025-08-04T22:00:00+10:00'
title = 'Squid Proxy: Access Remote Red Hat Lab Environment'
series = ['networking']
tags = ['squid-proxy','redhat']
topics = ['']
weight = 1
indexable = true
draft = false
+++

This blog shows how to access URLs available only on a remote Red Hat lab environment from your local MacOS laptop using SSH tunneling and a Squid proxy.

---

## 1. Download and Configure SSH Key

For the Red Hat certification lab, the SSH private key is provided in the **Lab Environment** section.

Run these commands on your Mac terminal:

```bash
# Move the downloaded key to your SSH folder
mv ~/Downloads/rht_classroom.rsa ~/.ssh/

# Secure the key with correct permissions
chmod 0600 ~/.ssh/rht_classroom.rsa

# Add the key to your ssh-agent
ssh-add ~/.ssh/rht_classroom.rsa
```

### Test SSH login to remote VM via jump host

Replace IPs and ports if different:

```bash
ssh -i ~/.ssh/rht_classroom.rsa -J cloud-user@148.62.92.65:22022 student@172.25.252.1 -p 53009
```

> **Note:**  
> If you get the error `Host key verification failed`, remove your known hosts file and retry:

```bash
rm ~/.ssh/known_hosts
```

---

## 2. Setup Squid Proxy on Remote VM

SSH into the remote VM and become root or use sudo:

```bash
sudo su
dnf install squid -y
```

Add access control to Squid config (adjust IP range if different):

```bash
sudo tee /etc/squid/squid.conf > /dev/null <<EOL
acl localnet src 172.25.252.1/24 # Change IP as needed
acl Safe_ports port 22
EOL

```

Enable and restart Squid:

```bash
systemctl enable squid
systemctl restart squid
```

---

## 3. Create SSH Tunnel to Forward Proxy Port

From your **local Mac laptop** open a new terminal and run:

```bash
ssh -i ~/.ssh/rht_classroom.rsa -J cloud-user@148.62.92.65:22022 \
-L 3128:localhost:3128 \
student@172.25.252.1 -p 53009
```

This forwards local port `3128` to the remote Squid proxy.

---

## 4. Configure Browser Proxy Settings (Firefox Recommended)

> **Tip:** Use a secondary browser profile or a different browser to avoid routing all traffic unintentionally.

1. Open Firefox settings  
2. Scroll to the **Network** section at the bottom  
3. Select **Manual proxy configuration**  
4. Set:
   - HTTP Proxy: `localhost`
   - Port: `3128`  
5. Check **Use this proxy server for all protocols**
![alt text](/redhat-certification-lab.md/image.png)
---

## 5. Test Access

Visit any URL only accessible from the remote VM, e.g.:

```
https://console-openshift-console.apps.ocp4.example.com/
```

You should now be able to access it locally via your browser.

As a quick test, visit [https://whatismyipaddress.com](https://whatismyipaddress.com) to confirm your IP corresponds to the remote environment.

---

## Conclusion

You’ve successfully tunneled your browser traffic through the remote Squid proxy using SSH, enabling access to URLs only reachable from your lab environment.

This method keeps your local and remote network environments cleanly separated while allowing seamless access to remote resources.

---

![thank you](https://images.unsplash.com/photo-1499744937866-d7e566a20a61?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)