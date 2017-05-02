var gulp = require('gulp'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    connect = require('gulp-connect'),
    cleanCSS = require('gulp-clean-css');

var jsSources = [
  'js/src/model.js',
  'js/src/view.js',
  'js/src/controller.js'
];

var cssSources = [
  'css/src/bootstrap.tyler.css',
  'css/src/style.css'
];

var htmlSources = ['index.html'];

gulp.task('devJs', function() {
  gulp.src(jsSources)
    .pipe(concat('app.dev12.js'))
    .pipe(gulp.dest('js/dist/'))
    .pipe(connect.reload())
});

gulp.task('liveJs', function() {
  gulp.src(jsSources)
    .pipe(concat('app.min12.js'))
    .pipe(uglify())
    .pipe(gulp.dest('js/dist/'))
});


gulp.task('minCss', function() {
  gulp.src(cssSources)
    .pipe(concat('liveStyles.min12.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('css/dist'))
    .pipe(connect.reload())
});

gulp.task('webserver', function() {
  connect.server({
    livereload: true
  });
});

gulp.task('html', function() {
  gulp.src(htmlSources)
    .pipe(connect.reload())
});

gulp.task('watch', function() {
  gulp.watch(jsSources, ['devJs', 'liveJs']);
  gulp.watch(cssSources, ['minCss']);
  gulp.watch(htmlSources, ['html']);
});

gulp.task('default', [ 'devJs', 'liveJs', 'minCss']);
