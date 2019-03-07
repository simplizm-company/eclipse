var gulp = require('gulp');
var browserSync = require('browser-sync').create();

gulp.task('server', function () {
    browserSync.init({
        port: 1234,
        server: {
            baseDir: './docs/'
        }
    });
    gulp.watch('docs/**/*.*', browserSync.reload);
});

gulp.task('default', ['server']);