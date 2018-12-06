'use strict';

// Gulp Configuration
var
// modules
gulp = require('gulp'),
plumber = require('gulp-plumber'),
autoprefixer = require('gulp-autoprefixer'),
sass = require('gulp-sass'),
markdown = require('gulp-markdown'),
cleanCSS = require('gulp-clean-css'),
sourcemaps = require('gulp-sourcemaps'),
imagemin = require( 'gulp-imagemin' ),
inject = require('gulp-inject'),
useref = require('gulp-useref'),
runSequence = require('run-sequence'),
runSequence = require('gulp-if'),
del = require('del'),
browserSync = require('browser-sync'),
rename = require("gulp-rename"),
plugins = require('gulp-load-plugins'),


// In development mode. change to production for diployment
devBuild = (process.env.NODE_ENV !== 'production');

// config
const config = {
    src: {
        root: './src',
        styles: './src/sass/style.scss',
        markdown: './readme.md',
        html: './src/*.html',
        font: './src/font/**/*',
        img: './src/img/main/**/*'
    },
    dist: './build',
    browserSync: {
        port: 9000,
        baseDir: ['./src', './build']
    }
};




/**
* Assets related tasks
*/

gulp.task('font', () => {
    return gulp.src(config.src.font)
    .pipe(gulp.dest(`${config.dist}/font`));
});

gulp.task('img', () => {
    gulp.src(config.src.img)
        .pipe( imagemin() )
        .pipe(gulp.dest(`${config.src.root}/img`))
        .pipe(gulp.dest(`${config.dist}/img`));
});

gulp.task( 'sass', function() {
    var stream = gulp.src(`${config.src.styles}`)
        .pipe( plumber( {
            errorHandler: function( err ) {
                console.log( err );
                this.emit( 'end' );
            }
        } ) )
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe( sass( { errLogToConsole: true } ) )
        .pipe( autoprefixer( 'last 2 versions' ) )
        .pipe(sourcemaps.write(undefined, { sourceRoot: null }))
        .pipe(gulp.dest(`${config.src.root}/css`))
        .pipe(gulp.dest(`${config.dist}/css`))

        .pipe(cleanCSS({debug: true}, (details) => {
            console.log(`${details.name}: ${details.stats.originalSize}`);
            console.log(`${details.name}: ${details.stats.minifiedSize}`);
        }))

        .pipe( rename( { suffix: '.min' } ) )
        .pipe(gulp.dest(`${config.dist}/css`))
        .pipe(gulp.dest(`${config.src.root}/css`))
    return stream;
});

gulp.task('sass:watch', () => {
    gulp.watch('./src/sass/**/*.scss', ['styles']);
});

gulp.task('clean', del.bind(null, [config.dist]));

/**
 * Serve assets
 */
gulp.task('serve:dev', () => {
    browserSync({
      port: config.browserSync.port,
      server: {
        baseDir: config.browserSync.baseDir,
        routes: {
          '/img': './src/img',
          '/css': './build/css',
          '/font': './build/font'
        }
      },
      logConnections: true,
      logFileChanges: true,
      notify: true
    });
  });

  gulp.task('serve:dist', () => {
    browserSync({
      port: config.browserSync.port,
      server: {
        baseDir: ['./build']
      },
      logConnections: true,
      logFileChanges: true,
      notify: true
    });
  });

  gulp.task('watch', () => {
    gulp.watch(config.src.markdown, ['markdown']);
    gulp.watch(`${config.src.styles}/**/*.scss`, ['styles']);
  });


/**
* Build tasks
*/
gulp.task('build', cb => {
runSequence('clean', ['styles','font', 'img'],  cb);
});

gulp.task('dev', cb => {
runSequence('clean', ['styles', 'font'], 'serve:dev', 'watch', cb);
});
  
/**
* Check production-ready code before deploying it to gh-pages
*/

gulp.task('dev:dist', cb => {
    runSequence('build', 'serve:dist', cb);
});

// gulp.task('default', ['build']);