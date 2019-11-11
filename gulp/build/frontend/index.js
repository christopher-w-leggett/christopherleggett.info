'use strict'

//load dependencies
const del = require('del');
const gulp = require('gulp');
const webpack = require('webpack');
const gulpWebpack = require('webpack-stream');
const rename = require("gulp-rename");
const path = require('path');
const buildWebpackConfig = require('../../../webpack.config.js');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const properties = require('../../properties.js');

const taskNames = {
    clean: 'frontend-clean',
    config: 'frontend-config',
    build: 'build-frontend',
    deploy: 'frontend-deploy'
}

module.exports = {
    taskNames: taskNames,
    registerTasks: () => {
        gulp.task(taskNames.clean, async () => {
            const buildDir = await properties.read('frontend-build-dir', false);
            const frontendConfigDstFile = await properties.read('frontend-config-dst-file', false);

            return del([buildDir, path.resolve(__dirname, `../../../${frontendConfigDstFile}`)]);
        });

        gulp.task(taskNames.config, gulp.series(taskNames.clean, async () => {
            const frontendConfigSrcFile = await properties.read('frontend-config-src-file', false);
            const frontendConfigDstFile = await properties.read('frontend-config-dst-file', false);
            const frontendConfigDstFileNameIndex = frontendConfigDstFile.lastIndexOf('/');

            return new Promise(function(resolve, reject) {
                gulp.src(frontendConfigSrcFile)
                    .pipe(rename(frontendConfigDstFile.substring(frontendConfigDstFileNameIndex)))
                    .on('error', reject)
                    .pipe(gulp.dest(frontendConfigDstFile.substring(0, frontendConfigDstFileNameIndex)))
                    .on('end', resolve);
            });
        }));

        gulp.task(taskNames.build, gulp.series(taskNames.config, async () => {
            const buildDir = await properties.read('frontend-build-dir', false);
            const codeEntryFiles = await properties.read('frontend-code-entry-files', false);
            const webpackConfig = await buildWebpackConfig();

            return new Promise(function(resolve, reject) {
                gulp.src(Object.values(codeEntryFiles))
                    .pipe(gulpWebpack(webpackConfig, webpack))
                    .on('error', reject)
                    .pipe(gulp.dest(`${buildDir}`))
                    .on('end', resolve);
            });
        }));

        gulp.task(taskNames.deploy, gulp.series(taskNames.build, async () => {
            const buildDir = await properties.read('frontend-build-dir', false);
            const s3Bucket = await properties.read('frontend-s3-bucket', true);
            const profile = await properties.read('profile', true);

            //construct sync command
            let syncCmdString = `aws s3 sync ${buildDir} s3://${s3Bucket}/root/`;
            if (profile) {
                syncCmdString += ` --profile ${profile}`;
            }

            //execute command
            let syncCmd = exec(syncCmdString);
            syncCmd.then((value) => {
                console.info(value.stdout);
            }).catch((error) => {
                //do nothing
            });
            return syncCmd;
        }));
    }
};
