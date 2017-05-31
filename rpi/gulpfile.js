var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

/**
 * -d: use dev
 * -e: use hue emulator
 * -b: use prod backend (only used with -d flag)
 */
gulp.task("emulated", [], () => {
    nodemon({
        script: 'server.js',
        args: [
            '-d',
            '-e'
        ]
    }).on("start");
})

gulp.task("prod-backend", [], () => {
    nodemon({
        script: 'server.js',
        args: [
            '-d',
            '-e',
            '-b'
        ]
    }).on("start");
})

gulp.task("prod", [], () => {
    nodemon({
        script: 'server.js',
        args: []
    }).on("start");
})
