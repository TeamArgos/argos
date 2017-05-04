var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

/**
 * -d: use dev
 * -e: use hue emulator
 * -b: use prod backend (only used with -d flag)
 */
gulp.task("run-dev", [], () => {
    nodemon({
        script: 'server.js',
        args: ['-d', '-e']
    }).on("start");
})
