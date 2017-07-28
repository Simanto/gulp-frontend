// Gulp.js configuration

var
  // modules
  gulp = require('gulp'),
  newer = require('gulp-newer'),
  imagemin = require('gulp-imagemin'),
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
  devBuild = (process.env.NODE_ENV !== 'production'),

// folders
folder = {
  src: 'src/',
  build: 'build/'
};

// image processing
gulp.task('img', function() {
  var build = folder.build + 'img/';
  return gulp.src(folder.src + 'img/**/*')
    .pipe(newer(build))
    .pipe(imagemin({ optimizationLevel: 5 }))
    .pipe(gulp.dest(build));
});

// Copy font files
gulp.task('fonts', function() {
  var build = folder.build + 'fonts/';
  return gulp.src(folder.src + 'fonts/**/*')
    .pipe(newer(build))
    .pipe(gulp.dest(build));
});


// CSS processing
gulp.task('sass', function() {

  var postCssOpts = [
  assets({ loadPaths: ['images/'] }),
  autoprefixer({ browsers: ['last 2 versions', '> 2%'] }),
  mqpacker
  ];

  if (!devBuild) {
    postCssOpts.push(cssnano);
  }

  return gulp.src(folder.src + 'scss/style.scss')
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass({
      outputStyle: 'nested',
      imagePath: 'images/',
      precision: 3,
      errLogToConsole: true
    }))
    .pipe(postcss(postCssOpts))
    .pipe(gulp.dest(folder.src + 'css/' ))
    .pipe(browserSync.reload({stream: true}));
});

// Copy Css to Build
gulp.task('copyCss', ['sass'], function(){
  return gulp.src(folder.src + 'css/style.css')
    .pipe(gulp.dest(folder.build + 'css/'));
});

// Minify Css
gulp.task('minCss', ['copyCss'], function(){
  return gulp.src(folder.src + 'css/style.css')
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(plumber())
    .pipe(rename({suffix: '.min'}))
    .pipe(cssnano({discardComments: {removeAll: true}}))
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

  return jsbuild.pipe(gulp.dest(folder.build + 'js/'));

});

// HTML processing
gulp.task('html', ['img'], function() {
  var
    out = folder.build ,
    page = gulp.src(folder.src + '*.html')
      .pipe(newer(out));

  // // minify production code
  if (!devBuild) {
    page = page.pipe(htmlclean());
  }

  return page.pipe(gulp.dest(out));
});


// run build tasks
gulp.task('build', ['html','img', 'fonts', 'minCss', 'js']);


// Starts browser-sync task for starting the server.
gulp.task('browser-sync', function() {
  browserSync.init({
      server: {
          baseDir: "./src/" // loading files from src folder
      }
  });
});
// watch for changes
gulp.task('watch', ['browser-sync'], function(){

  // image changes
  gulp.watch(folder.src + 'img/**/*');

  // font changes
  gulp.watch(folder.src + 'font/**/*');

  // css changes
  gulp.watch(folder.src + 'scss/**/*', ['sass']);

  // javascript changes
  gulp.watch(folder.src + 'js/**/*');

  // html changes
  gulp.watch(folder.src + 'html/**/*').on('change', browserSync.reload);

});