'use strict';

// Plugins
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require( 'gulp-imagemin' );
const newer = require("gulp-newer");
const eslint = require("gulp-eslint");
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const del = require('del');
const browsersync = require('browser-sync');
const rename = require("gulp-rename");

// config
const config = {
    src: {
        root: './src',
        styles: './src/sass/style.scss',
        html: './src/*.html',
        font: './src/fonts/**/*',
        img: './src/img/main/**/*',
        js: '.src/js/**/*'
    },
    dist: './build',
    browserSync: {
        port: 9000,
        baseDir: {
            src: ['./src/'],
            build: ['./build/']
        }
    }
};

// BrowserSync
function Sync(done) {
    browsersync.init({
        port: config.browserSync.port,
        server: {
          baseDir: config.browserSync.baseDir.src,
        },
    });

    done();
}

// BrowserSync Reload
function SyncReload(done) {
    browsersync.reload();
    done();
}

// Assets related tasks
function font(){
    return gulp
        .src(`${config.src.font}`)
        .pipe(gulp.dest(`${config.dist}/fonts/`));
}

function html(){
    return gulp
        .src(`${config.src.html}`)
        .pipe(gulp.dest(`${config.dist}/`));
}


// Optimize Images
function images() {
    return gulp
        .src(`${config.src.img}`)
        .pipe(newer(`${config.src.img}`))
        .pipe(
        imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
            plugins: [
                {
                removeViewBox: false,
                collapseGroups: true
                }
            ]
            })
        ])
        )
        .pipe(gulp.dest(`${config.src.root}/img`))
        .pipe(gulp.dest(`${config.dist}/img`));
}


// CSS task
function css() {
    return gulp
        .src(`${config.src.styles}`)
        .pipe(plumber())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sass({ outputStyle: "expanded" }))
        .pipe( autoprefixer( 'last 2 versions' ) )
        .pipe(sourcemaps.write(undefined, { sourceRoot: null }))
        .pipe(gulp.dest(`${config.src.root}/css`))
        .pipe(gulp.dest(`${config.dist}/css`))
        .pipe(cleanCSS({debug: true}, (details) => {
            console.log(`${details.name}: ${details.stats.originalSize}`);
            console.log(`${details.name}: ${details.stats.minifiedSize}`);
        }))
        .pipe(rename({ suffix: ".min" }))
        .pipe(gulp.dest(`${config.dist}/css`))
        .pipe(gulp.dest(`${config.src.root}/css`))
        .pipe(browsersync.stream());
}

// Transpile, concatenate and minify scripts
function scripts() {
    return gulp
        .src([
            "./src/js/jquery.js",
            "./src/js//script.js",
        ])
        .pipe(plumber())
        .pipe( concat( 'theme.js' ) )
        .pipe(gulp.dest("./src/js/"))
        .pipe(gulp.dest("./build/js/"))
        .pipe(rename({ suffix: ".min" }))
        .pipe( uglify() )
        .pipe(gulp.dest("./src/js/"))
        .pipe(gulp.dest("./build/js/"))
        .pipe(browsersync.stream());
}


// Clean assets
function clean() {
    return del([config.dist]);
}

// Watch files
function watchFiles() {
    gulp.watch("./src/sass/**/*", css);
    gulp.watch("./src/js/**/*", scripts);

    gulp.watch(
      [
        "./src/font/**/*",
        "./src/*.html",
      ],
      gulp.series(html, font, SyncReload)
    );
    gulp.watch("./src/img/**/*", images);
}


// Tasks
gulp.task("images", images);
gulp.task("css", css);
gulp.task("js", scripts);
gulp.task("clean", clean);
gulp.task("font", font);
gulp.task("html", html);


// build
gulp.task(
    "build",
    gulp.series(clean, gulp.parallel(html, font, css, images, "js"))
);

// watch
gulp.task(
    "watch", 
    gulp.parallel(watchFiles, Sync)
);