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
gulp.task('deploy', gulp.series(backend.taskNames.deploy, frontend.taskNames.deploy));

gulp.task('run', gulp.series(backend.taskNames.package, frontend.taskNames.build, async () => {
    const backendFiles = await properties.read('backend-files', false);
    const frontendBuildDir = await properties.read('frontend-build-dir', false);
    const frontendContentFiles = await properties.read('frontend-content-watch-files', false);
    const frontendCodeFiles = await properties.read('frontend-code-files', false);
    const frontendConfigDstFile = await properties.read('frontend-config-dst-file', false);
    const hatSecret = await properties.read('stack-hat-secret', true);

    //start sam
    const startCmdString = `ROOT_DOMAIN_NAME=localhost:3000 HAT_SECRET=${hatSecret} SECRETSANTA_ADMIN_USER=test SECRETSANTA_ADMIN_PASS=test SECRETSANTA_ROOT_URL=http://localhost:3000 sam local start-api -t template.yaml -s ${frontendBuildDir} > "temp/sam.log" 2>&1`;
    const startCmd = exec(startCmdString);

    //watch backend files
    gulp.watch(backendFiles, {delay: 2000}, gulp.series(backend.taskNames.package));

    //watch frontend files
    gulp.watch([...frontendContentFiles, ...frontendCodeFiles, `!${frontendConfigDstFile}`], {delay: 2000}, gulp.series(frontend.taskNames.build));
}));
