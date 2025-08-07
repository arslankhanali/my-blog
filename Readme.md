## Setup the new blog site
``` sh
hugo new site my-blog
cd my-blog

git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/arslankhanali/my-blog.git
git push -u origin main


git submodule add https://github.com/math-queiroz/rusty-typewriter.git themes/rusty-typewriter

hugo server -D
```

## Setup pages site on github
Follow instructions [here](https://gohugo.io/host-and-deploy/host-on-github-pages/)

1. Change `Source -> GitHub Actions` https://github.com/arslankhanali/my-blog/settings/pages 
2. Add following in hugo.toml
```sh
[caches]
  [caches.images]
    dir = ':cacheDir/images'
```
3. Add `my-blog/.github/workflows`
4. git add -A && git commit -m "Create hugo.yaml" && git push
5. See [GitHub Actions](https://github.com/arslankhanali/my-blog/actions) 

### New Post
```sh
hugo new content ~/Codes/my-blog/content/posts/the-title-you-want.md

git add -A
git commit -m "Updated Site $time"
git push
```