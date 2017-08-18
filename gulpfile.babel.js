'use strict'

import gulp from 'gulp'
import runSequence from 'run-sequence'
import gulpLoadPlugins from 'gulp-load-plugins'
import { spawn } from "child_process";

const $ = gulpLoadPlugins()
const browserSync = require('browser-sync').create()
const isProduction = process.env.NODE_ENV === 'production'

// --

gulp.task('server', ['build'], () => {
    browserSync.init({
        server: {
            baseDir: "./public"
        }
    })
    gulp.watch(['./src/sass/**/*.scss'], ['sass'])
    gulp.watch(['./src/js/**/*.js'], ['js-watch'])
    gulp.watch(['./archetypes/**/*', './content/**/*', './layouts/**/*', './static/**/*'], ['hugo'])
});

gulp.task('build', () => {
    runSequence(['sass', 'js'], 'hugo')
})

gulp.task('hugo', (cb) => {
    return spawn('hugo').on('close', (code) => {
        browserSync.reload()
        cb()
    })
})

// --

gulp.task('sass', () => {
    return gulp.src([
        'src/sass/app.scss'
    ])
    .pipe($.sass({ precision: 5 }))
    .pipe($.autoprefixer(['ie >= 10', 'last 2 versions']))
    .pipe($.if(isProduction, $.cssnano({ discardUnused: false, minifyFontValues: false })))
    .pipe(gulp.dest('static/css'))
    .pipe(browserSync.stream())
})

gulp.task('js-watch', ['js'], (cb) => {
    browserSync.reload();
    cb();
});

gulp.task('js', () => {
    return gulp.src([
        'src/js/app.js'
    ])
    .pipe($.babel())
    .pipe($.concat('app.js'))
    .pipe($.if(isProduction, $.uglify()))
    .pipe(gulp.dest('static/js'))
})
