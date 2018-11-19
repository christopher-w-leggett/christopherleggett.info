'use strict'

//load dependencies
const del = require('del');
const gulp = require('gulp');
const webpack = require('webpack');
const gulpWebpack = require('webpack-stream');
const buildWebpackConfig = require('../../../webpack.config.js');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const properties = require('../../properties.js');

const taskNames = {
    clean: 'frontend-clean',
    build: 'build-frontend',
    deploy: 'frontend-deploy'
}

module.exports = {
    taskNames: taskNames,
    registerTasks: () => {
        gulp.task(taskNames.clean, async () => {
            const buildDir = await properties.read('frontend-build-dir', false);
            return del([buildDir]);
        });

        gulp.task(taskNames.build, [taskNames.clean], async () => {
            const buildDir = await properties.read('frontend-build-dir', false);
            const codeEntryFile = await properties.read('frontend-code-entry-file', false);
            const webpackConfig = await buildWebpackConfig();

            return new Promise(function(resolve, reject) {
                gulp.src(codeEntryFile)
                    .pipe(gulpWebpack(webpackConfig, webpack))
                    .on('error', reject)
                    .pipe(gulp.dest(`${buildDir}`))
                    .on('end', resolve);
            });
        });

        gulp.task(taskNames.deploy, [taskNames.build], async () => {
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
        });
    }
};
