const gulp = require('gulp');
const babelify = require('babelify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const image = require('gulp-image');
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const babel = require('gulp-babel');

gulp.task('styles', function() {
  return gulp.src('./sass/**/*.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream());
});

gulp.task('scripts:main', function() {
    browserify({
      extensions: [".babel"]
    }).transform("babelify", {
      extensions: [".babel"]
    })
    .bundle()
    .pipe(source('main_bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(uglify())
    .pipe(sourcemaps.write('maps')) // You need this if you want to continue using the stream with other plugins
    .pipe(gulp.dest('./bundle_js'));
});

gulp.task('scripts:restaurant', function() {
    browserify({
      extensions: [".babel"]
    }).transform("babelify", {
      extensions: [".babel"]
    })
    .bundle()
    .pipe(source('restaurant_bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(uglify())
    .pipe(sourcemaps.write('maps')) // You need this if you want to continue using the stream with other plugins
    .pipe(gulp.dest('dist/js'))
    .pipe(gulp.dest('./bundle_js'));
});

gulp.task('watch', function() {
  gulp.watch(['./sw.js', './js/**/*.js'], gulp.series('scripts:main', 'scripts:restaurant'));
});

gulp.task('serve', gulp.series('styles', function() {
  browserSync.init({
    server: './',
    browser: 'google chrome'
  });

  gulp.watch('./sass/**/*.scss', gulp.series('styles'));
  gulp.watch('./**/**.html').on('change', browserSync.reload);
  gulp.watch('./bundle_js/**/*.js').on('change', browserSync.reload);

}));

gulp.task('copy-files', function() {
  gulp.src(['./index.html', './restaurant.html', 'manifest.json'])
    .pipe(gulp.dest('./dist'));
});

gulp.task('imagemin', function() {
  return gulp.src('./images/**/*.*')
    .pipe(imagemin([
            imageminMozjpeg({
                quality: 50
            })
        ], {
      verbose: true
    }))
    .pipe(gulp.dest('./dist/img'))
    .pipe(gulp.dest('./img'));
});

gulp.task('dist', gulp.series(gulp.parallel('copy-files', 'imagemin', 'styles', 'scripts:main', 'scripts:restaurant')));
gulp.task('default', gulp.series(gulp.parallel('imagemin', 'scripts:main', 'scripts:restaurant', 'watch', 'serve')));


