var gulp = require('gulp'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
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

gulp.task('devJs', function() {
  gulp.src(jsSources)
    .pipe(concat('app.dev5.js'))
    .pipe(gulp.dest('js/dist/'))
});

gulp.task('liveJs', function() {
  gulp.src(jsSources)
    .pipe(concat('app.min5.js'))
    .pipe(uglify())
    .pipe(gulp.dest('js/dist/'))
});


gulp.task('minCss', function() {
  gulp.src(cssSources)
    .pipe(concat('liveStyles.min5.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('css/dist'));
});

gulp.task('default', ['devJs', 'liveJs', 'minCss']);
