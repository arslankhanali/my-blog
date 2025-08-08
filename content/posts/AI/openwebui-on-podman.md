+++
date = '2025-08-08T20:52:03+10:00'
title = 'Open WebUI with Podman'
series = ['AI']
tags = ['openwebui', 'podman', 'ai', 'ollama', 'llm']
topics = ['ai-applications', 'containerization']
weight = 1
indexable = true
featured = true
draft = false
+++


## Introduction

Welcome to another installment in our AI series! Today, we're going to set up **Open WebUI**, a powerful, self-hosted web interface for interacting with various large language models (LLMs). This tool provides a beautiful user experience similar to ChatGPT but on your own terms. We'll be using Podman to containerize Open WebUI, making it a breeze to manage.

![Open WebUI](https://images.unsplash.com/photo-1494869042583-f6c911f04b4c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)


### Why Open WebUI?

Open WebUI acts as a central hub for your LLMs. It can connect to local models running on **Ollama** or **LM Studio**, as well as remote services like **MaaS** (Model as a Service). This flexibility allows you to experiment with different models and backends all from a single, consistent interface.

## Step 1: Pulling the Open WebUI Image

First, we need to pull the Open WebUI container image from its public registry. Podman makes this simple and efficient.

```sh
# This command fetches the latest main version of the Open WebUI image from GitHub's container registry.
podman pull ghcr.io/open-webui/open-webui:main
```
## Step 2: Running the Container
Now, let's run the container with all the necessary configurations. We'll map a port, set environment variables, and create a persistent volume for data.
```sh
podman run -d \
  --name open-webui \
  -p 3001:8080 \
  -e OLLAMA_BASE_URL=http://192.168.50.50:11434 \ # If you have Ollama
  -e OPENAI_API_KEY=dummykey \
  -v open-webui:/app/backend/data:z \
  --restart=always \
  ghcr.io/open-webui/open-webui:main
```

## Step 3: Accessing Open WebUI
Once the container is running, you can access the web interface by navigating to your host machine's IP address and the mapped port.

[http://192.168.50.200:3001](http://192.168.50.200:3001)


### Initial Setup
The first time you visit the page, you'll be prompted to create a user account. After creating your account, you can log in and access the admin settings to configure your LLM connections.

## Step 4: Configuring Connections
In the Open WebUI admin panel, you can add various connections to different LLM services.

- Add connections: Settings -> Admin Panel -> Conenctions
[http://192.168.50.200:3001/admin/settings/connections](http://192.168.50.200:3001/admin/settings/connections)

e.g. Notice URL format
> OLLAMA: http://192.168.50.50:11434   # < --- From Ollama CLI      
OPENAI: http://192.168.50.50:1234/v1   # < --- From LMStudio

![a](/ai/open_webui.png)

<div style="background-color: #d3cd22ff; padding: 2px; border-left: 10px solid red;">

⚠️ WARNING:
Remember to use http or https as appropriate for your connection. Always use the correct port and make sure your firewall is configured to allow traffic on these ports.

</div>

You now have a fully functional Open WebUI instance running on your server, giving you a powerful tool to manage and interact with all your LLMs in one place!