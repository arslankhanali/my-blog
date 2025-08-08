+++
date = '2025-08-08T20:36:01+10:00'
title = 'Dify: A Podman Deployment Guide'
series = ['AI']
tags = ['dify', 'podman', 'ai', 'langgenius', 'docker-compose']
topics = ['ai-applications', 'containerization']
weight = 1
indexable = true
featured = true
draft = false
+++

## Introduction

Today, we're going to deploy Dify, an AI application development platform, using Podman and `podman-compose`. Dify provides a powerful, visual way to build and manage AI applications, and deploying it on your local fedora server gives you full control.

![Dify AI platform](https://images.unsplash.com/photo-1716637644831-e046c73be197?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

### Prerequisites

Before we start, make sure you have Podman and `podman-compose` installed. If you haven't, you can refer to my previous blog post on how to set up Podman.

<div style="background-color: #255021ff; padding: 2px; border-left: 10px solid red;">

#### 🟢 NOTE: 
This guide assumes you are running on a RHEL-based system with SELinux enabled, which is a common setup for fedora environments. The steps for SELinux are crucial for a smooth deployment.
</div>

## Step 1: Clone the Dify Repository

First, we need to clone the Dify repository from GitHub. This will give us the necessary configuration files to deploy the application.

```sh
git clone [https://github.com/langgenius/dify.git](https://github.com/langgenius/dify.git)
cd ~/dify/docker
cp .env.example .env
```
After cloning, we move into the docker directory and copy the example environment file to .env. This file contains the configuration variables for our Dify deployment.

## Step 2: Configure SELinux
For systems with SELinux enabled, you'll need to adjust the security context of the Dify volumes. This step prevents permission errors when Podman tries to access the files. By setting the context correctly, we avoid having to use the :z flag in our compose file.

```sh
chcon -Rt container_file_t /home/neo/dify/docker/
ls -Z
```

## Step 3: Modify the docker-compose.yaml
We need to make a couple of small but important changes to the docker-compose.yaml file to ensure Dify runs smoothly with Podman.
```
vim docker-compose.yaml
```
#### Change 1: Add Default Networks

Add a default network to the end of the file. This ensures all services that don't have an explicit network defined can communicate. 
```sh
# Go to end of file `shift+g`
networks:
  ssrf_proxy_network:
    driver: bridge 
    internal: true 
  milvus:
    driver: bridge
  opensearch-net:
    driver: bridge
    internal: true
  default:
    driver: bridge
```
#### Change 2: Ports
Adjust the NGINX ports to avoid conflicts on your host. We'll change the host ports from 80 and 443 to 980 and 9443 respectively. Remember to also change the corresponding variables in the .env file you copied earlier.

```YAML
# Search `/NGINX_PORT`
ports:
      - '980:${NGINX_PORT:-80}'
      - '9443:${NGINX_SSL_PORT:-443}'
```
> Might also have to change nginx port in `.env` file 980 and 9443


## Step 4: Deploy and Verify
Now we're ready to deploy Dify using podman-compose.

Start the containers
```Bash
podman-compose up -d

podman pod logs pod_docker -f

```
## Step 5: Open Ports
```sh
sudo firewall-cmd --add-port=980/tcp --permanent
sudo firewall-cmd --reload
```

## Step 6: Test and Access
```sh
podman pod logs pod_docker -f

curl http://localhost:980/apps
curl http://192.168.50.200:980/apps
```

That's it! You now have Dify running on your server. You can start building AI applications and experimenting with the platform.