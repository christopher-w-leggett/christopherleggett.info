'use strict'

//load dependencies
const del = require('del');
const gulp = require('gulp');
const zip = require('gulp-zip');
const install = require('gulp-install');
const sink = require('stream-sink');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const properties = require('./gulp/properties.js');

//set constants
const TEMP_DIR = 'temp'
const BUILD_DIR = TEMP_DIR + '/build';
const BACKEND_BUILD_DIR = BUILD_DIR + '/code-backend';
const PACKAGE_FILES = ['package.json', 'package-lock.json', 'code-backend/src/main/**'];

gulp.task('clean', () => {
    return del([TEMP_DIR]);
});

gulp.task('build-backend', ['clean'], async () => {
    const archiveDir = BACKEND_BUILD_DIR + '/' + await properties.read('backend-code-archive-name', true)

    return gulp.src(PACKAGE_FILES)
        .pipe(gulp.dest(archiveDir))
        .pipe(install({
            npm: '--only=production'
        }))
        .pipe(sink.object());
});

gulp.task('package-backend', ['build-backend'], async () => {
    return gulp.src([
            BACKEND_BUILD_DIR + '/' + await properties.read('backend-code-archive-name', true) + '/**'
        ])
        .pipe(zip(await properties.read('backend-code-archive-name', true) + '.zip'))
        .pipe(gulp.dest(BACKEND_BUILD_DIR));
});

gulp.task('upload-backend', ['package-backend'], async () => {
    //read properties
    const s3Bucket = await properties.read('backend-s3-bucket', true);
    const profile = await properties.read('profile', true);

    //construct upload command
    let uploadCmdString = 'aws cloudformation package --template-file template.yaml --output-template-file ' +
        BACKEND_BUILD_DIR + '/output-template.yaml --s3-bucket ' + s3Bucket;
    if (profile) {
        uploadCmdString += ' --profile ' + profile;
    }

    //execute command
    let uploadCmd = exec(uploadCmdString);
    uploadCmd.then((value) => {
        console.info(value.stdout);
    }).catch((error) => {
        //do nothing
    });
    return uploadCmd;
});

gulp.task('deploy-backend', ['upload-backend'], async () => {
    //ensure required properties
    const stackName = await properties.read('stack-name', true);
    const profile = await properties.read('profile', true);

    //construct deploy command
    let deployCmdString = 'aws cloudformation deploy --template-file ' + BACKEND_BUILD_DIR + '/output-template.yaml --stack-name ' +
        stackName + ' --capabilities CAPABILITY_IAM';
    if (profile) {
        deployCmdString += ' --profile ' + profile;
    }

    //execute command
    let deployCmd = exec(deployCmdString);
    deployCmd.then((value) => {
        console.info(value.stdout);
    }).catch((error) => {
        //do nothing
    });
    return deployCmd;
});
//TODO: Add task to push up content to frontend S3 bucket.
gulp.task('watch', () => {
    let watchTimeout = null,
        watchBuildRunning = false,
        watcher = gulp.watch(PACKAGE_FILES, (event) => {
            //only queue up at most 1 build.
            if (!watchTimeout || watchBuildRunning) {
                watchTimeout = setTimeout(() => {
                    watchBuildRunning = true;
                    gulp.start('package-backend', () => {
                        watchTimeout = null;
                        watchBuildRunning = false;
                    });
                }, 2000);
            }
        });
});
