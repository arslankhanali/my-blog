
New Post
```sh
hugo new content ~/Codes/my-blog/content/posts/the-title-you-want.md
```

Setup the new blog site
``` sh
cd ~/Codes

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


Push Changes to 
```sh
git add -A
git commit -m "Updated Site $time"
git push
```