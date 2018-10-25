'use strict'

//load dependencies
const gulp = require('gulp');
const backend = require('./gulp/build/backend');
const frontend = require('./gulp/build/frontend');

//register backend tasks
backend.registerTasks();

//register frontend tasks
frontend.registerTasks();

//register global tasks
gulp.task('deploy', [backend.taskNames.deploy, frontend.taskNames.deploy], async () => {

});

//TODO: Update watch so it includes all builds.
gulp.task('watch', () => {
    let watchTimeout = null,
        watchBuildRunning = false,
        watcher = gulp.watch(archiveFiles, (event) => {
            //only queue up at most 1 build.
            if (!watchTimeout || watchBuildRunning) {
                watchTimeout = setTimeout(() => {
                    watchBuildRunning = true;
                    gulp.start(backend.taskNames.package, () => {
                        watchTimeout = null;
                        watchBuildRunning = false;
                    });
                }, 2000);
            }
        });
});
