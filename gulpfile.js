'use strict'

//load dependencies
const gulp = require('gulp');
const backendTasks = require('./gulp/build/backend');

//register backend tasks
backendTasks.registerTasks();

//TODO: Add task to push up content to frontend S3 bucket.

//TODO: Update watch so it includes all builds.
gulp.task('watch', () => {
    let watchTimeout = null,
        watchBuildRunning = false,
        watcher = gulp.watch(archiveFiles, (event) => {
            //only queue up at most 1 build.
            if (!watchTimeout || watchBuildRunning) {
                watchTimeout = setTimeout(() => {
                    watchBuildRunning = true;
                    gulp.start(backendTasks.taskNames.package, () => {
                        watchTimeout = null;
                        watchBuildRunning = false;
                    });
                }, 2000);
            }
        });
});
