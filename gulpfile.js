'use strict'

//load dependencies
const gulp = require('gulp');
const backend = require('./gulp/build/backend');
const frontend = require('./gulp/build/frontend');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const properties = require('./gulp/properties.js');

//register backend tasks
backend.registerTasks();

//register frontend tasks
frontend.registerTasks();

//register global tasks
gulp.task('deploy', [backend.taskNames.deploy, frontend.taskNames.deploy], async () => {

});

gulp.task('run', [backend.taskNames.package, frontend.taskNames.build], async () => {
    const backendFiles = await properties.read('backend-files', false);
    const frontendBuildDir = await properties.read('frontend-build-dir', false);
    const frontendContentFiles = await properties.read('frontend-content-watch-files', false);
    const frontendCodeFiles = await properties.read('frontend-code-files', false);

    //start sam
    const startCmdString = `sam local start-api -t template.yaml -s ${frontendBuildDir}`;
    const startCmd = exec(startCmdString);

    //watch backend files
    let backendWatchTimeout = null,
        backendBuildRunning = false,
        backendWatcher = gulp.watch(backendFiles, (event) => {
            //only queue up at most 1 build.
            if (!backendWatchTimeout || backendBuildRunning) {
                backendWatchTimeout = setTimeout(() => {
                    backendBuildRunning = true;
                    gulp.start(backend.taskNames.package, () => {
                        backendWatchTimeout = null;
                        backendBuildRunning = false;
                    });
                }, 2000);
            }
        });

    //watch frontend files TODO: Add code files to watch
    let frontendWatchTimeout = null,
        frontendBuildRunning = false,
        frontendWatcher = gulp.watch([...frontendContentFiles, ...frontendCodeFiles], (event) => {
            //only queue up at most 1 build.
            if (!frontendWatchTimeout || frontendBuildRunning) {
                frontendWatchTimeout = setTimeout(() => {
                    frontendBuildRunning = true;
                    gulp.start(frontend.taskNames.build, () => {
                        frontendWatchTimeout = null;
                        frontendBuildRunning = false;
                    });
                }, 2000);
            }
        });
});
