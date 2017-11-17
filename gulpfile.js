// Gulp.js configuration
// Defining base paths
var basePaths = {
    js: './js/',
    node: './node_modules/',
    dev: './src/'
};


var
// modules
    gulp = require('gulp'),
    newer = require('gulp-newer'),
    imagemin = require('gulp-imagemin'),
    kraken = require('gulp-kraken'),
    concat = require('gulp-concat'),
    deporder = require('gulp-deporder'),
    stripdebug = require('gulp-strip-debug'),
    uglify = require('gulp-uglify'),
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    assets = require('postcss-assets'),
    autoprefixer = require('autoprefixer'),
    mqpacker = require('css-mqpacker'),
    rename = require("gulp-rename"),
    cssnano = require('gulp-cssnano'),
    clone = require('gulp-clone'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync').create(),


    // In development mode. change to production for diployment
    devBuild = (process.env.NODE_ENV !== 'production');

// folders
folder = {
    src: './src/',
    build: './build/',
    node: './node_modules/',
};

gulp.task('img', function () {
    var build = folder.build + 'img/';
    return gulp.src(folder.src + 'img/**/*')
        .pipe(plumber())
        .pipe(newer(build))
        .pipe(kraken({
            key: '44cdedd7e5dd92931f8bbc87ebe2b76d',
            secret: '0a87f54204bb3fb34169d6e9f1528bda2a167198',
            lossy: true,
            concurrency: 6
        }))
        .pipe(gulp.dest(build));
});

// Copy font files
gulp.task('fonts', function() {
    var build = folder.build + 'fonts/';
    return gulp.src(folder.src + 'fonts/**/*')
        .pipe(plumber())
        .pipe(newer(build))
        .pipe(gulp.dest(build));
});


// CSS processing
gulp.task('sass', function() {

    var postCssOpts = [
        assets({ loadPaths: ['../img/'] }),
        autoprefixer({ browsers: ['last 2 versions', '> 2%'] }),
        mqpacker
    ];

    if (!devBuild) {
        postCssOpts.push(cssnano);
    }

    return gulp.src(folder.src + 'scss/style.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sass({
            outputStyle: 'nested',
            imagePath: '../img/',
            precision: 3,
            errLogToConsole: true
        }))
        .pipe(postcss(postCssOpts))
        .pipe(gulp.dest(folder.src + 'css/'))
        .pipe(browserSync.reload({ stream: true }));
});

// Copy Css to Build
gulp.task('copyCss', ['sass'], function() {
    return gulp.src(folder.src + 'css/style.css')
        .pipe(plumber())
        .pipe(gulp.dest(folder.build + 'css/'));
});

// Minify Css
gulp.task('minCss', ['copyCss'], function() {
    return gulp.src(folder.src + 'css/style.css')
        .pipe(plumber())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cssnano({ discardComments: { removeAll: true } }))
        .pipe(gulp.dest(folder.build + 'css/'));
});


// JavaScript processing
gulp.task('js', function() {

    var jsbuild = gulp.src(folder.src + 'js/**/*')
        .pipe(deporder())
        .pipe(uglify())
        .pipe(concat('theme.js'));

    if (!devBuild) {
        jsbuild = jsbuild
            .pipe(stripdebug())
            .pipe(uglify());
    }

    return jsbuild.pipe(gulp.dest(folder.src + 'js/'));

});

// Run: 
// gulp scripts. 
// Uglifies and concat all JS files into one
gulp.task('scripts', function() {
    var scripts = [

        // Jquery Library
        folder.src + 'js/jquery.js',

        // Them Javascript
        folder.src + 'js/script.js',

        // folder.src + 'js/skip-link-focus-fix.js'
    ];
  gulp.src(scripts)
    .pipe(concat('theme.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(folder.src + 'js/'));

  gulp.src(scripts)
    .pipe(concat('theme.js'))
    .pipe(gulp.dest(folder.src + 'js/'));
});

// HTML processing
gulp.task('html', ['img'], function() {
    var
        out = folder.build,
        page = gulp.src(folder.src + '*.html')
        .pipe(newer(out));

    // // minify production code
    if (!devBuild) {
        page = page.pipe(htmlclean());
    }

    return page.pipe(gulp.dest(out));
});





// Run:
// gulp copy-assets.
// Copy all needed dependency assets files from bower_component assets to themes /js, /scss and /fonts folder. Run this task after bower install or bower update

////////////////// All Bootstrap SASS  Assets /////////////////////////
gulp.task('copy-assets', function() {
    
    ////////////////// All Bootstrap 4 Assets /////////////////////////
    // Copy all JS files

    // var stream = gulp.src(basePaths.node + 'bootstrap/dist/js/**/*.js')
    //    .pipe(gulp.dest(basePaths.dev + '/js/bootstrap4'));


    return stream;
});
    




// run build tasks
gulp.task('build', ['html', 'img', 'fonts', 'minCss', 'js']);

// Starts browser-sync task for starting the server.
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./src/" // loading files from src folder
        }
    });
});


// watch for changes
gulp.task('watch', ['browser-sync'], function() {

    // image changes
    gulp.watch(folder.src + 'img/**/*');

    // font changes
    gulp.watch(folder.src + 'font/**/*');

    // css changes
    gulp.watch(folder.src + 'scss/**/*', ['sass']);

    // javascript changes
    gulp.watch(folder.src + 'js/**/*');

    // html changes
    gulp.watch(folder.src + '*.html').on('change', browserSync.reload);

});