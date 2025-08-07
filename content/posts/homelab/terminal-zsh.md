+++
date = '2025-08-04T22:00:00+10:00'
title = 'Homelab: Oh My Zsh - My terminal setup'
series = ['homelab']
tags = ['zsh','powerlevel10k','macos']
topics = ['']
weight = 1
indexable = true
draft = true
+++

Tired of the plain old macOS terminal? Here's how to transform it into a powerful, beautiful, and productive environment using Zsh, [Oh My Zsh](https://ohmyz.sh/), Powerlevel10k, and a handful of plugins.

---

## Step 1: Install Zsh and Plugins

```sh
# Install zsh via Homebrew
brew install zsh

# Oh My Zsh framework
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Install plugins
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

git clone https://github.com/zsh-users/zsh-autosuggestions.git \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

## Step 2: Install Powerlevel10k Theme

```sh
# Install Powerlevel10k theme
brew install powerlevel10k

# Add theme to .zshrc
echo 'source $(brew --prefix)/share/powerlevel10k/powerlevel10k.zsh-theme' >>~/.zshrc

# Configure
p10k configure
```

> 💡 The `p10k configure` command launches an interactive wizard to customize your prompt.

---

## Step 3: Basic `~/.zshrc` Configuration

Below is a minimal yet powerful `.zshrc` example. It includes:

- Powerlevel10k theme
- Plugin setup (autosuggestions, syntax highlighting)
- Useful aliases and functions
- History, completion, and path setup

```sh
cat >> ~/.zshrc << 'EOF'
# Powerlevel10k Instant Prompt
if [[ -r "\${XDG_CACHE_HOME:-\$HOME/.cache}/p10k-instant-prompt-\${(%):-%n}.zsh" ]]; then
  source "\${XDG_CACHE_HOME:-\$HOME/.cache}/p10k-instant-prompt-\${(%):-%n}.zsh"
fi

# Plugins
source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh
source ~/.zsh/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

# Oh My Zsh
export ZSH="\$HOME/.oh-my-zsh"
source \$ZSH/oh-my-zsh.sh

plugins=(
  aliases alias-finder ansible macos argocd colored-man-pages colorize
  command-not-found common-aliases gh git-commit nmap oc python ssh sudo
  virtualenv zsh-interactive-cd zsh-navigation-tools dnf podman kubectl
)

# Custom Aliases
alias ipp="ifconfig en0 | grep 'inet ' | awk '{print \$2}'"

# Functions
backup() { cp -r "\$1" "\$1.backup"; }

ip() {
  ip=\$(ifconfig en0 | grep 'inet ' | awk '{print \$2}')
  ip1=\$(ifconfig en7 | grep 'inet ' | awk '{print \$2}')
  dns=\$(awk '/nameserver/ {print \$2}' /etc/resolv.conf)
  echo -e "WiFi: \$ip\nLAN:  \$ip1\nDNS:\n\$dns"
}

gp() {
  git add .
  git commit -am "git push via gp"
  git push
}

ct() {
  echo 'cat << EOF | oc apply -f-'
  echo 'EOF'
  echo "--or--"
  echo "cat >> text.sh <<EOL"
  echo 'EOL'
  echo "--or--"
  echo "sudo tee text.sh > /dev/null <<EOL"
  echo 'EOL'
}


# Alias Finder Plugin Settings
zstyle ':omz:plugins:alias-finder' autoload yes
zstyle ':omz:plugins:alias-finder' longer yes
zstyle ':omz:plugins:alias-finder' exact yes
zstyle ':omz:plugins:alias-finder' cheaper yes

# Path Setup
export PATH="\$HOME/.local/bin:\$HOME/.krew/bin:\$HOME/Codes/0-scripts:\$PATH"

# OpenShift Autocompletion
if [ -x "/usr/local/bin/oc" ]; then
  source <(oc completion zsh)
  compdef _oc oc
fi

# Editor and History
export EDITOR='vim'
HISTFILE=~/.histfile
HISTSIZE=100000
SAVEHIST=100000
alias hist="fc -ln"

# Powerlevel10k Prompt
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh
source /opt/homebrew/share/powerlevel10k/powerlevel10k.zsh-theme

# Brew Env
eval "\$(/opt/homebrew/bin/brew shellenv)"
EOF
```

---

## Step 4: Activate Your New Shell

```sh
# Change to zsh
exec zsh

# Reload config
source ~/.zshrc
```

---

## Result

Your Mac terminal will now be:

✅ **Visual**: Prompt with icons, colors, and context-aware sections  
✅ **Efficient**: Aliases, plugins, autosuggestions, syntax highlighting  
✅ **Extensible**: Add more plugins or themes as needed

To tweak appearance later, just run:

```sh
p10k configure
```
---

Done! Your terminal is now both beautiful and powerful.


![thank you](https://images.unsplash.com/photo-1499744937866-d7e566a20a61?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)