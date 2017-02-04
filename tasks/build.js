'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const watch = require('gulp-watch');
const batch = require('gulp-batch');
const plumber = require('gulp-plumber');
const jetpack = require('fs-jetpack');
const bundle = require('./bundle');

const projectDir = jetpack;
const srcDir = jetpack.cwd('./src');
const destDir = jetpack.cwd('./dist');

gulp.task('bundle', () => {
    const file = 'main.js';

    return bundle(srcDir.path(`js/${file}`), destDir.path(file));
});

gulp.task('sass', () => {
    gulp.src(srcDir.path('scss/main.scss'))
    .pipe(plumber())
    .pipe(sass({outputStyle: 'compact'}))
    .pipe(gulp.dest(destDir.path('./')));
});

gulp.task('watch', () => {
    watch('./src/**/*.js', batch((events, done) => {
        gulp.start('bundle');
    }));

    watch('./src/**/*.scss', batch((events, done) => {
        gulp.start('sass');
    }));
});

gulp.task('build', ['bundle', 'sass']);
