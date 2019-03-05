var gulp = require('gulp');
var path = require('path');
var del = require('del');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var fileinclude = require('gulp-file-include');
var browserSync = require('browser-sync').create();

gulp.task('server', ['fonts', 'images', 'html', 'js', 'sass', 'css'], function () {
    browserSync.init({
        port: 1234,
        server: {
            baseDir: 'project/dist'
        }
    });
    gulp.watch('project/src/assets/fonts/**/*.*', ['fonts']);
    gulp.watch('project/src/assets/images/**/*.*', ['images']);
    gulp.watch('project/src/**/*.html', ['html']);
    gulp.watch('project/src/assets/js/**/*.js', ['js']);
    gulp.watch('project/src/assets/scss/**/*.scss', ['sass']);
    gulp.watch('project/src/assets/css/**/*.css', ['css']);
    gulp.watch('project/src/**', function (e) {
        if (e.type === 'deleted') {
            var filePathFromSrc = path.relative(path.resolve('project/src/'), e.path);
            var destFilePath = path.resolve('project/dist/', filePathFromSrc);
            del.sync(destFilePath);
        }
    });
    gulp.watch('project/dist/**/*.*', browserSync.reload);
});

gulp.task('html', function () {
    return gulp
        .src('project/src/**/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('project/dist'))
});

gulp.task('js', function () {
    return gulp
        // 모든 js파일을 하나의 파일로 압축할 때 사용
        // .src([
        //     'project/src/assets/js/library/jquery-3.2.1.min.js',
        //     'project/src/assets/js/plugin/cookie.js',
        //     'project/src/assets/js/plugin/slick.js',
        //     'project/src/assets/js/plugin/sunrise.js',
        //     'project/src/assets/js/ui.js'
        // ])
        // .pipe(concat('conbined.js'))
        // .pipe(gulp.dest('project/dist/assets/js'))
        // .pipe(uglify())
        // .pipe(rename('combined.min.js'))
        // .pipe(gulp.dest('project/dist/assets/js'));
        .src('project/src/assets/js/**/*.js')
        .pipe(gulp.dest('project/dist/assets/js'));
});

gulp.task('sass', function () {
    return gulp
        .src('project/src/assets/scss/**/*.scss')
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie >= 9']
        }))
        .pipe(gulp.dest('project/src/assets/css'))
});

gulp.task('css', function () {
    return gulp
        .src('project/src/assets/css/**/*.css')
        .pipe(gulp.dest('project/dist/assets/css'))
});

gulp.task('fonts', function () {
    return gulp
        .src('project/src/assets/fonts/*.*')
        .pipe(gulp.dest('project/dist/assets/fonts'))
});

gulp.task('images', function () {
    return gulp
        .src('project/src/assets/images/**/*.*')
        .pipe(gulp.dest('project/dist/assets/images'))
});

gulp.task('default', ['server']);