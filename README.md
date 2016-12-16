# Gulp Basic Structure
This repository contains the basic gulp sturcture code. I used it in all of my front end projects.

## What You Can DO

1) Compile SCSS and Concat Js
```
gulp watch
```
2) Get it ready for staging
```
gulp stage
```
3) To Build Your Project For Product. 
```
gulp build
```
*It also minify your css and js, you need to add minify version into your html files *

4) Delete files to clean build dir
```
gulp clean
```
5) Clean and Build for delivery
```
gulp default
```


## Quick Start
Step 1 - Clone this repo
```
git clone @git.url
```
Step 2 - Install the project's node dependencies
```
npm install
```

# Package List

gulp-concat
gulp-uglify
gulp-rename
gulp-sass
gulp-sourcemaps
gulp-autoprefixer
gulp-uglifycss
browser-sync
gulp-swig
del
