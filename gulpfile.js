"use strict";

    var gulp  = require('gulp'),
      concat  = require('gulp-concat'),
      uglify  = require('gulp-uglify'),
      rename  = require('gulp-rename'),
        sass  = require('gulp-sass'),
        maps  = require('gulp-sourcemaps'),
autoprefixer  = require('gulp-autoprefixer'),
autoprefixerOptions = {browsers: ['last 2 versions', '> 5%', 'Firefox ESR']},
   uglifycss  = require('gulp-uglifycss'),
 browserSync  = require('browser-sync'),
        swig  = require('gulp-swig'),
      reload  = browserSync.reload,
         del  = require('del');


// Compile All Js includes in src into single app.js
gulp.task("concatScripts", function() {
    return gulp.src([
        'js/jquery.js',
        'js/sticky/jquery.sticky.js',
        'js/main.js'
        ])
    .pipe(maps.init())
    .pipe(concat('app.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('js'))
    .pipe(reload({stream: true}));
});


// Minify Compiled Java Scripts
gulp.task("minifyScripts", ["concatScripts"], function() {
  return gulp.src("js/app.js")
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('js'));
});


// Compile SCSS to CSS
gulp.task('compileSass', function() {
    return gulp.src("scss/style.scss")
        .pipe(maps.init())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(maps.write('./'))
        .pipe(gulp.dest('css'))
        .pipe(reload({stream: true}));
});

// Minify CSS in to one line
gulp.task('minifyCss', ['compileSass'], function () {
  gulp.src('css/style.css')
    .pipe(uglifycss({
      "uglyComments": true
    }))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('css'));
});


// Compile and Sync With browser
gulp.task('watchFiles', function() {
  browserSync({
        server: "./"
    });
  gulp.watch('scss/**/*.scss', ['compileSass']);
  gulp.watch('js/main.js', ['concatScripts']);
  gulp.watch('*.html', ['templates']);
})



// Swig templates: Watch changed in html files
gulp.task('templates', function() {
    return gulp.src('*.html')
        .pipe(swig())
        .pipe(gulp.dest('./stage'))
        .pipe(reload({stream: true}));
});



// Delete .min files and also stage and dist directory
gulp.task('clean', function() {
  del(['dist', 'css/style.min.css*', 'js/app*.js*', 'stage']);
});


// Compiles files for distribution
gulp.task("build", ['minifyScripts', 'minifyCss'], function() {
  return gulp.src(['css/style.min.css', 'js/app.min.js', '*.html',  'img/**', 'fonts/**'], { base: './'})
            .pipe(gulp.dest('dist'));
});


// Watch and Compile file to Stage Directory for Staging Server
gulp.task("stage", ['watchFiles'], function() {
  return gulp.src([
    "css/style.css", "js/app.js", "*.html", "img/**", "fonts/**"
    ],
    { base: './'})
  .pipe(gulp.dest('stage'));
});

// Watch Changes
gulp.task('watch', ['watchFiles']);


// Clean and Compile All The Files For Distribution
gulp.task("kick", ["clean"], function() {
  gulp.start('build');
});
