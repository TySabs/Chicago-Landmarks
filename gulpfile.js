var gulp = require('gulp'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css');


gulp.task('minify-css', function() {
  return gulp.src('css/src/*.css')
    .pipe(cleanCSS())
    .pipe(gulp.dest('css/dist'));
});
