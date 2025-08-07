+++
date = '2025-08-04T22:50:00+10:00'
title = 'Homelab: Initial setup for a Fedora VM'
series = ['homelab']
tags = ['ansible','fedora']
topics = ['']
weight = 1
indexable = true
draft = true
+++

# ssh is on
```bash
# Enable SSH daemon
sudo systemctl enable sshd.service && systemctl start sshd.service

# Allow SSH in firewall
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

### Basic playbook
- Installs DNF packages
- Set Hostname
- Disable sleep when idle
- Changes terminal to ZSH


```yml
tee playbook.yaml > /dev/null <<EOL
---
- name: VM setup
  hosts: all
  gather_facts: true

  vars:
    hostname: node2
    packages_to_install:
      - podman
      - podman-compose
      - cockpit
      - cockpit-files
      - cockpit-machines
      - cockpit-navigator
      - cockpit-podman
      - cockpit-selinux
      - cockpit-storaged
      - cockpit-system
      - zsh
      - git
      - curl
      - python3-pygments
    local_backup_zsh: "~/Codes/homelab/ansible/files/zshrc"
    local_backup_p10k: "~/Codes/homelab/ansible/files/p10k"
    remote_home: "{{ ansible_env.HOME }}"
    remote_zshrc: "{{ remote_home }}/.zshrc"
    remote_p10k: "{{ remote_home }}/.p10k.zsh"
    ohmyzsh_install_script: "{{ remote_home }}/install-oh-my-zsh.sh"

  tasks:

    - name: Bootstrap dnf module support (Fedora only)
      become: true
      ansible.builtin.command: dnf install -y python3-libdnf5
      when: ansible_distribution == "Fedora"
      args:
        creates: /usr/lib/python3*/site-packages/libdnf5

    - name: Install required packages
      become: true
      ansible.builtin.dnf:
        name: "{{ packages_to_install }}"
        state: present

    - name: Enable and start cockpit
      become: true
      ansible.builtin.service:
        name: cockpit.socket
        enabled: true
        state: started

    - name: Change default shell to Zsh
      become: true
      ansible.builtin.user:
        name: "{{ ansible_user_id }}"
        shell: /bin/zsh

    - name: Check if Oh My Zsh is installed
      ansible.builtin.stat:
        path: "{{ remote_home }}/.oh-my-zsh"
      register: ohmyzsh_installed

    - name: Download Oh My Zsh installer
      ansible.builtin.get_url:
        url: "https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh"
        dest: "{{ ohmyzsh_install_script }}"
        mode: '0755'
      when: not ohmyzsh_installed.stat.exists

    - name: Run Oh My Zsh installer
      ansible.builtin.command: "{{ ohmyzsh_install_script }} --unattended"
      when: not ohmyzsh_installed.stat.exists
      args:
        chdir: "{{ remote_home }}"
        creates: "{{ remote_home }}/.oh-my-zsh"

    - name: Clone Powerlevel10k
      ansible.builtin.git:
        repo: https://github.com/romkatv/powerlevel10k.git
        dest: "{{ remote_home }}/.oh-my-zsh/custom/themes/powerlevel10k"
        depth: 1

    - name: Clone zsh-autosuggestions
      ansible.builtin.git:
        repo: https://github.com/zsh-users/zsh-autosuggestions.git
        dest: "{{ remote_home }}/.oh-my-zsh/custom/plugins/zsh-autosuggestions"
        depth: 1

    - name: Clone zsh-syntax-highlighting
      ansible.builtin.git:
        repo: https://github.com/zsh-users/zsh-syntax-highlighting.git
        dest: "{{ remote_home }}/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting"
        depth: 1

    - name: Copy .zshrc
      ansible.builtin.copy:
        src: "{{ local_backup_zsh }}"
        dest: "{{ remote_zshrc }}"
        mode: '0644'

    - name: Copy .p10k.zsh
      ansible.builtin.copy:
        src: "{{ local_backup_p10k }}"
        dest: "{{ remote_p10k }}"
        mode: '0644'

    - name: Set hostname
      become: true
      ansible.builtin.hostname:
        name: "{{ hostname }}"
      when: hostname is defined

    - name: Configure /etc/systemd/logind.conf to disable suspend/lid actions
      become: true
      ansible.builtin.blockinfile:
        path: /etc/systemd/logind.conf
        marker: "# {mark} ANSIBLE MANAGED BLOCK - power settings"
        block: |
          [Login]
          IdleAction=ignore
          IdleActionSec=0
          HandleLidSwitch=ignore
          HandleLidSwitchExternalPower=ignore
          HandleSuspendKey=ignore
          HandleHibernateKey=ignore
        create: true
        mode: '0644'

    - name: Restart systemd-logind
      become: true
      ansible.builtin.service:
        name: systemd-logind
        state: restarted
EOL
```

### Configure Networking
Check network settings
```sh
sudo ls /etc/NetworkManager/system-connections/
sudo cat /etc/NetworkManager/system-connections/bridge0.nmconnection
```

> You can edit the file before copying
```yml
tee network.yaml > /dev/null <<EOL
---
- name: Configure Fedora Networking
  hosts: all
  gather_facts: true
  vars:
    wifi_conn: "ASUS_6E"
    bridge_conn: "bridge0"
    eth_conn: "Wired Connection"
    wifi_iface: "wlp1s0"
    bridge_iface: "bridge0"
    eth_iface: "enp3s0"
    wifi_psk: "eq4akar?qk"

  tasks:

    - name: Configure ASUS_6E Wi-Fi connection
      become: true
      community.general.nmcli:
        conn_name: "{{ wifi_conn }}"
        type: wifi
        ifname: "{{ wifi_iface }}"
        state: present
        autoconnect: yes
        wifi:
          ssid: "{{ wifi_conn }}"
        wifi_sec:
          key_mgmt: sae
          psk: "{{ wifi_psk }}"
        ipv4:
          method: manual
          address1: "192.168.50.100/24"
          gateway: "192.168.50.100"
          dns:
            - 192.168.50.100
            - 9.9.9.9
            - 192.168.50.1
        ipv6:
          method: disabled

    - name: Activate ASUS_6E connection
      become: true
      ansible.builtin.command: "nmcli con up {{ wifi_conn }}"
      changed_when: false
      ignore_errors: true  # Safe fallback in case it's already up

    - name: Configure bridge0 connection with static IP
      become: true
      community.general.nmcli:
        conn_name: "{{ bridge_conn }}"
        type: bridge
        ifname: "{{ bridge_iface }}"
        state: present
        autoconnect: yes
        bridge:
          stp: no
        ipv4:
          method: manual
          address1: "192.168.50.200/24"
          gateway: "192.168.50.100"
          dns:
            - 192.168.50.100
            - 9.9.9.9
            - 192.168.50.1
        ipv6:
          method: disabled

    - name: Activate bridge0 connection
      become: true
      ansible.builtin.command: "nmcli con up {{ bridge_conn }}"
      changed_when: false
      ignore_errors: true

    - name: Attach enp3s0 to bridge0
      become: true
      community.general.nmcli:
        conn_name: "{{ eth_conn }}"
        type: ethernet
        ifname: "{{ eth_iface }}"
        state: present
        master: "{{ bridge_conn }}"
        ethernet: {}
        bridge_port: {}

    - name: Activate Wired (bridge slave) connection
      become: true
      ansible.builtin.command: "nmcli con up {{ eth_conn }}"
      changed_when: false
      ignore_errors: true
EOL
```

---

### Run the Playbook

```sh
# ssh-copy-id -o StrictHostKeyChecking=no neo@192.168.50.100

ansible-playbook --ask-pass --ask-become-pass -u neo -i 192.168.50.205, playbook.yaml 

ansible-playbook --ask-pass --ask-become-pass -u neo -i 192.168.50.205, network.yaml 
```

![thank you](https://images.unsplash.com/photo-1499744937866-d7e566a20a61?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)