+++
date = '2025-08-04T23:55:00+10:00'
title = 'HomeLab: Home Assistant VM - Non-root deployment on Fedora'
series = ['homelab']
tags = ['homeassistant','libvirt','fedora']
topics = ['']
weight = 2
indexable = true
draft = true
+++

[Home Assistant](https://www.home-assistant.io/) is an open-source platform for smart home automation. It integrates with a wide range of devices and services, and allows powerful automation logic — all running locally on your own hardware.

Home Assistant OS (HAOS) is the official operating system for running Home Assistant as a virtual appliance. It includes everything needed: supervisor, OS, and the Home Assistant core.

This guide shows how to run HAOS inside a KVM virtual machine using `libvirt` on Fedora **without requiring sudo** to manage the VM — after an initial root configuration.

### Why run HAOS as a non-root user?

- Reduces attack surface and limits damage in case of misconfiguration
- Lets you manage your smart home environment without admin rights
- Enables easier automation and scripting without `sudo` prompts
- Aligns with the principle of least privilege in homelab setups

---

## 1. System Preparation

Install required packages:

```bash
sudo dnf install -y \
  libvirt \
  qemu-kvm \
  virt-install \
  bridge-utils \
  wget \
  xz \
  python3-libvirt \
  virt-manager
```

Enable and start the `libvirtd` service:

```bash
sudo systemctl enable --now libvirtd
```

---

## 2. Download and Prepare HAOS Image

Find the latest HAOS releases here:  
https://github.com/home-assistant/operating-system/releases/

```bash
mkdir haos && cd haos

download_url="https://github.com/home-assistant/operating-system/releases/download/16.1.rc1/haos_ova-16.1.rc1.qcow2.xz"
image_file="haos_ova-16.1.rc1.qcow2.xz"

wget "$download_url" -O "$image_file"
xz -dk "$image_file"
```

---

## 3. Create `bridge0` Network Interface

To enable the VM to access your LAN via bridged networking, create a `bridge0` interface using `nmcli`.

- Bridge on WiFi is not supported. 
- Use Ethernet for bridge
- Change `IFACE` variable accordingly

```bash
# Set your physical interface (e.g., enp3s0)
IFACE="enp3s0"

# See available devices
nmcli device status

# Create bridge0
sudo nmcli connection add type bridge ifname bridge0 con-name bridge0

# Set static IP, gateway, and DNS for the bridge
sudo nmcli connection modify bridge0 \
  ipv4.method manual \
  ipv4.addresses 192.168.50.200/24 \
  ipv4.gateway 192.168.50.100 \
  ipv4.dns "192.168.50.100 9.9.9.9 192.168.50.1" \
  ipv6.method auto \
  bridge.stp no

# Create and attach the physical interface as a bridge port
sudo nmcli connection add type ethernet ifname "$IFACE" con-name bridge0-slave \
  master bridge0

# Bring up the connections
sudo nmcli connection up bridge0
sudo nmcli connection up bridge0-slave
```

### 3.1 Allow `bridge0` in QEMU

```bash
sudo tee /etc/qemu/bridge.conf > /dev/null <<'EOL'
allow bridge0
EOL
```

---

## 4. Grant Non-Root Libvirt Access

These steps are required so you can manage VMs without needing `sudo`.

### 4.1 Authorise your user to manage libvirt

```bash
sudo tee /etc/polkit-1/rules.d/50-libvirt.rules > /dev/null <<EOL
polkit.addRule(function(action, subject) {
  if (action.id == "org.libvirt.unix.manage" &&
      subject.user == "$USER") {
    return polkit.Result.YES;
  }
});
EOL
```

### 4.2 Add user to `libvirt` group

```bash
sudo usermod -a -G libvirt $USER
newgrp libvirt  # Apply changes to current shell
```

Verify:

```bash
id -Gn
```

---

## 5. Create the HAOS VM

```bash
VM_NAME="haos"
VM_MAC="52:54:00:12:34:60"
VM_DISK="$HOME/haos/${image_file%.xz}"

virt-install \
  --name "$VM_NAME" \
  --description "Home Assistant OS" \
  --os-variant generic \
  --ram 3072 \
  --vcpus 1 \
  --disk path="$VM_DISK",bus=scsi \
  --controller type=scsi,model=virtio-scsi \
  --import \
  --graphics none \
  --boot uefi \
  --network bridge=bridge0,mac="$VM_MAC" \
  --noautoconsole
```

Enable autostart:

```bash
virsh autostart haos
```

---

## 6. Managing the VM (as non-root)

```bash
virsh list
virsh --connect qemu:///session list --all
virsh --connect qemu:///system list --all
```

Check MAC address:

```bash
virsh dumpxml haos | grep "mac address" | awk -F\' '{ print $2 }'
```

Delete the VM:

```bash
virsh destroy haos
virsh undefine haos
```

---

## 7. Backup and Restore

Fetch backups to your Mac:

```bash
scp -r "$USER@192.168.50.100:/home/$USER/haos/nfs/*" \
  ~/Codes/homelab/home_assisstant/backups/
```

---

## 8. Notes

| Action                         | Needs Sudo? |
|-------------------------------|-------------|
| Install packages              | ✅ Yes       |
| Setup bridge/qemu policies    | ✅ Yes       |
| VM create/operate via libvirt | ❌ No        |
| Use `virt-manager` GUI        | ❌ No        |

After one-time configuration, everything runs user-only.

---

## 9. Related

- [Home Assistant OS Releases](https://github.com/home-assistant/operating-system/releases)
- [Libvirt Non-root Setup](https://wiki.libvirt.org/page/SSHPolicyKitSetup)
- [Bridge Networking Guide](https://wiki.libvirt.org/page/Networking#Bridged_networking)

---

![thank you](https://images.unsplash.com/photo-1499744937866-d7e566a20a61?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx)
