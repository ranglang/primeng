'use strict';

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglifycss = require('gulp-uglifycss'),
    rename = require('gulp-rename'),
    del = require('del'),
 sourcemaps = require('gulp-sourcemaps'),
    flatten = require('gulp-flatten');
var sass = require('gulp-sass');


// .pipe(concat('primeng.css'))
gulp.task('build-css', function() {
  gulp.src('src/app/components/**/**.scss')
    .pipe(sass().on('error', sass.logError))
    .on('error', sass.logError)
    .pipe(gulp.dest('/home/tian/udian/resource/src/styles/resource'));

  //   .pipe(sourcemaps.write('maps', {
  //     includeContent: false,
  //     sourceRoot: 'source'
  //   }))
  //   .pipe(gulp.dest('resources'))

  gulp.src(['src/assets/components/themes/**/*'])
    .pipe(gulp.dest('/home/tian/udian/resource/src/styles/resource/themes'));

	gulp.src([
        'src/app/components/common/common.css',
		    'src/app/components/**/*.css'
    ])
	.pipe(gulp.dest('/home/tian/udian/resource/src/styles/resource'));
});

gulp.task('build-css-prod', function() {


    gulp.src([
        'src/app/components/common/common.css',
        'src/app/components/**/*.css'
    ])
	  .pipe(concat('primeng.css'))
	  .pipe(gulp.dest('resources'))
    .pipe(uglifycss({"uglyComments": true}))
    .pipe(rename('primeng.min.css'))
    .pipe(gulp.dest('resources'));
});

gulp.task('images', function() {
    return gulp.src(['src/app/components/**/images/*.png', 'src/app/components/**/images/*.gif'])
        .pipe(flatten())
        .pipe(gulp.dest('resources/images'));
});

gulp.task('themes', function() {
    return gulp.src(['src/assets/components/themes/**/*'])
        .pipe(gulp.dest('resources/themes'));
});

//Cleaning previous gulp tasks from project
gulp.task('clean', function() {
	del(['resources']);
});

//Building project with run sequence
gulp.task('build-assets', ['clean','build-css-prod', 'images', 'themes']);

