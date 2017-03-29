var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.task("run-dev", [], () => {
    nodemon({
        script: 'server.js',
        args: ['-d']
    }).on("start");
})
