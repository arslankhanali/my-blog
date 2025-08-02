cd ~/Codes

hugo new site my-blog
cd my-blog

git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/arslankhanali/my-blog.git
git push -u origin main


git submodule add https://github.com/math-queiroz/rusty-typewriter.git themes/rusty-typewriter