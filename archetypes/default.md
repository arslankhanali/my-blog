+++
date = '{{ .Date }}'
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
series = ['homelab']
tags = ['kubernetes','podman']
topics = ['']
weight = 1
indexable = true
featured = false
draft = true
+++

## Introduction

# Ref other blogs
# -------------------------------------- 
Part of series on Arr-stack:
1. [Arr-Stack Installation]({{<  relref "hidden/podman-arr-stack.md"  >}})
2. [Arr-Stack Configuration]({{<  relref "hidden/podman-arr-stack-configuration.md"  >}})

# Ref other Sections
# -------------------------------------- 

To link section with heading `## 8 Deploy the vm on kubevirt` , Use
[step-8](#8-deploy-the-vm-on-kubevirt)

# collapsable code block - if code is too long
# -------------------------------------- 
<details style="background-color: #6e68c6ff; border: 1px solid #12cb37ff; padding: 10px; border-radius: 5px;">
<summary style="font-weight: bold; color: #edf2f7ff;"> EXPAND: See podman-compose.yaml</summary>

``` yml
tee <>.yaml > /dev/null <<EOL
EOL
```
</details> 

# Highlited sections
# --------------------------------------
<div style="background-color: #d3cd22ff; padding: 2px; border-left: 10px solid red; border-radius: 5px;">

⚠️ WARNING: 
</div>


<div style="background-color: #255021ff; padding: 2px; border-left: 10px solid red; border-radius: 5px;">

⭐️ NOTE: 
</div>


<div style="background-color: #904f4fff; padding: 2px; border-left: 10px solid red; border-radius: 5px;">

🚨 DANGER: 
</div>

# To add table
# --------------------------------------

|a|b|c|
| :--- | :--- | :--- |
|d|e|f|

# How to refrence localimage
# -------------------------------------- 
![oprah.png](/argocd-app-of-apps/oprah.png) 

# How to ref [unsplash](https://unsplash.com) image
# --------------------------------------  
![thank you](https://images.unsplash.com/photo-1499744937866-d7e566a20a61?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)