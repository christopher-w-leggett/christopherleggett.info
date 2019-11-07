'use strict'

//load dependencies
const del = require('del');
const gulp = require('gulp');
const webpack = require('webpack');
const gulpWebpack = require('webpack-stream');
const fs = require('fs');
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
            return del([buildDir, path.resolve(__dirname, '../../../temp/modules')]);
        });

        gulp.task(taskNames.config, gulp.series(taskNames.clean, async () => {
            const frontendConfig = await properties.read('frontend-config', false);

            return new Promise(async function(resolve, reject) {
                    await new Promise(function(resolve, reject) {
                        fs.mkdir(`${path.resolve(__dirname, '../../../temp/modules/config')}`, { recursive: true }, (error) => {
                            if(error) {
                                reject(error);
                            } else {
                                resolve();
                            }
                        });
                    });
                    fs.writeFile(`${path.resolve(__dirname, '../../../temp/modules/config.json')}`, frontendConfig, 'utf8', (error) => {
                        if(error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
            });
        }));

        gulp.task(taskNames.build, gulp.series(taskNames.config, async () => {
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
