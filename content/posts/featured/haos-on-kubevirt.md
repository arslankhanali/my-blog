+++
date = '2025-08-17T15:56:30+10:00'
title = 'Home Assistant VM on Kubevirt'
series = ['homelab']
tags = ['kubernetes','podman']
topics = ['']
weight = 1
indexable = true
featured = true
draft = false
+++

## 1. Introduction: What is Home Assistant?

**Home Assistant** is a powerful, open-source home automation platform that puts local control and privacy first. It can be run on various devices, from single-board computers like the Raspberry Pi to virtual machines and containers. It's a great tool for anyone looking to automate their home without relying on big tech companies, giving you complete control over your smart devices.

---

## 2. Installation Methods

Home Assistant offers a few different ways to get started, but two of the most common are:

* **Home Assistant Operating System (HaOS):** This is the recommended and most popular installation method. **HaOS** is a lightweight, embedded operating system designed specifically to run Home Assistant and its ecosystem. It's easy to install on a dedicated device like a Home Assistant Green, a Raspberry Pi, or a virtual machine. This method gives you access to the full Home Assistant experience, including the convenience of **add-ons**, which are pre-packaged applications that extend its functionality.

* **Home Assistant Container:** This method is for more advanced users who want to run Home Assistant within a container environment (like Docker or Podman). You're responsible for managing the underlying operating system and the container yourself. While this offers flexibility, it comes with a trade-off: you don't get access to the official add-ons.

---

## 3. HaOS on KubeVirt: The Best of Both Worlds

If you're already running a Kubernetes homelab and prefer the flexibility of containerized applications but still want the convenience and features of the full HaOS experience, **KubeVirt** is the perfect solution. KubeVirt is a Kubernetes add-on that lets you run traditional virtual machines (VMs) alongside your container workloads. This means you can run the full HaOS as a VM right inside your Kubernetes cluster, giving you a powerful, unified platform for both your containers and your home automation.

---

## 4. Install KubeVirt and CDI

The first step is to get KubeVirt and its dependencies up and running in your cluster. We will also install the **Containerized Data Importer (CDI)**, which is essential for importing the virtual machine disk image into Kubernetes.

### Install Kubevirt & CDI
<details style="background-color: #6e68c6ff; border: 1px solid #12cb37ff; padding: 10px; border-radius: 5px;">
<summary style="font-weight: bold; color: #edf2f7ff;"> Install Kubevirt </summary>

``` yml
# Install KuberVirt
export KUBEVIRT_VERSION=$(curl -s https://api.github.com/repos/kubevirt/kubevirt/releases/latest | jq -r .tag_name)
echo $KUBEVIRT_VERSION
kubectl create -f https://github.com/kubevirt/kubevirt/releases/download/$KUBEVIRT_VERSION/kubevirt-operator.yaml
kubectl create -f https://github.com/kubevirt/kubevirt/releases/download/$KUBEVIRT_VERSION/kubevirt-cr.yaml
kubectl get pods -n kubevirt

# Install Containerized Data Importer (CDI)
export CDI_VERSION=$(curl -s https://api.github.com/repos/kubevirt/containerized-data-importer/releases/latest | jq -r .tag_name)
echo $CDI_VERSION
kubectl create -f https://github.com/kubevirt/containerized-data-importer/releases/download/$CDI_VERSION/cdi-operator.yaml
kubectl create -f https://github.com/kubevirt/containerized-data-importer/releases/download/$CDI_VERSION/cdi-cr.yaml
kubectl get pods -n cdi

# kubectl -n cdi port-forward svc/cdi-uploadproxy 8443:443
```
</details> 

---


<div style="background-color: #03f90cff; padding: 1px; border-left: 10px solid black; border-radius: 10px;">

⭐️ NOTE: Steps 5-7 are about creating your own HaOS containerdisks. If you are happy to use my image based on HomeAssistant 16.1 then go to [step-8](#8-deploy-the-vm-on-kubevirt) directly.   
</div>

In case you are interested. [Here](https://quay.io/organization/containerdisks) are the official containerdisk images for various OS


## 5. Download the HaOS image
```sh
# Download the HaOS qcow2 image
wget https://github.com/home-assistant/operating-system/releases/download/16.1/haos_ova-16.1.qcow2.xz
# unzip
xz -dk haos_ova-16.1.qcow2.xz
```

## 6. Convert the image
 Convert the image into a foramt that is understood by Kubevirt
```sh
sudo dnf install podman libguestfs-tools guestfs-tools -y

# machine-id gave error
# virt-sysprep -a haos_ova-16.1.qcow2 --operations machine-id,bash-history,logfiles,tmp-files,net-hostname,net-hwaddr  

Image_name=haos_ova-16.1.qcow2

# Make Golden Image by removing unique identifiers and temporary files from the image.
virt-sysprep -a $Image_name --operations bash-history,logfiles,tmp-files,net-hostname,net-hwaddr  

# Conpress image
qemu-img convert -c -O qcow2 $Image_name "$Image_name-containerimage.qcow2"
```

## 7. Build the image and push to your repo
``` sh
# Create your Containerfile
tee Containerfile > /dev/null <<EOL
FROM kubevirt/container-disk-v1alpha
ADD $Image_name-containerimage.qcow2 /disk/
EOL

# Login to your repo

podman login quay.io -u arslankhanali -p <>

# Make sure `homeassistant` repo exists and it is public
# Buld the image
podman build -t quay.io/arslankhanali/homeassistant:v1 .

# Push the image
podman push quay.io/arslankhanali/homeassistant:v1
```

## 8. Deploy the VM on Kubevirt
I will deploy in the namespace `vm`
```sh
kubectl create ns vm
kubectl config set-context --current --namespace=vm
```

```sh
cat << EOF | oc apply -f-
apiVersion: kubevirt.io/v1
kind: VirtualMachineInstance
metadata:
  name: haos
  namespace: vm # <-- Change as per need
spec:
  domain:
    resources:
      requests:
        memory: 2048Mi
        cpu: 1
      limits:
        memory: 4096Mi
        cpu: 2
    devices:
      disks:
      - name: containerdisk
        disk:
          bus: virtio
      rng: {}
    firmware:
      bootloader:
        efi:
          secureBoot: false   # ✅ disable SecureBoot to avoid SMM requirement
  terminationGracePeriodSeconds: 0
  volumes:
  - name: containerdisk
    containerDisk:
      image: quay.io/arslankhanali/homeassistant:v1 # <-- Change as per need
---
apiVersion: v1
kind: Service
metadata:
  name: haos
  namespace: vm
spec:
  type: NodePort
  selector:
    vmi: haos
  ports:
  - name: haos-ui
    port: 8123
    protocol: TCP
    targetPort: 8123
    nodePort: 30003 # <-- Change as per need - Will be random it not set
EOF
```


## 9. Console and port forward
```sh
virtctl console haos

# Password is ususlly set in cloud init inside vmi yaml
```
## 10. Console and port forward
```sh
virtctl port-forward vmi/haos 8123:8123

curl -kI http://localhost:8123/onboarding.html

curl -kI http://192.168.50.200:30003
```

## Delete
```sh
oc delete -f vm-haos.yaml

oc delete vmi haos
oc delete svc haos
```

References:
- https://github.com/ormergi/vm-image-builder/tree/main?tab=readme-ov-file 


![thank you](https://images.unsplash.com/photo-1499744937866-d7e566a20a61?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)
