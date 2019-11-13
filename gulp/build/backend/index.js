'use strict'

//load dependencies
const del = require('del');
const gulp = require('gulp');
const zip = require('gulp-zip');
const install = require('gulp-install');
const sink = require('stream-sink');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const properties = require('../../properties.js');

const taskNames = {
    clean: 'backend-clean',
    build: 'backend-build',
    package: 'backend-package',
    upload: 'backend-upload',
    deploy: 'backend-deploy'
}

module.exports = {
    taskNames: taskNames,
    registerTasks: () => {
        gulp.task(taskNames.clean, gulp.series(async () => {
            const buildDir = await properties.read('backend-build-dir', false);
            return del([buildDir]);
        }));

        gulp.task(taskNames.build, gulp.series(taskNames.clean, async () => {
            const buildDir = await properties.read('backend-build-dir', false);
            const archiveFiles = await properties.read('backend-files', false);
            const archiveName = await properties.read('backend-archive-name', true);
            const archiveDir = `${buildDir}/${archiveName}`;

            return gulp.src(archiveFiles)
                .pipe(gulp.dest(archiveDir))
                .pipe(install({
                    npm: '--only=production'
                }))
                .pipe(sink.object());
        }));

        gulp.task(taskNames.package, gulp.series(taskNames.build, async () => {
            const buildDir = await properties.read('backend-build-dir', false);
            const archiveName = await properties.read('backend-archive-name', true);

            const zipStream = gulp.src([
                    `${buildDir}/${archiveName}/**`
                ])
                .pipe(zip(`${archiveName}.zip`))
                .pipe(gulp.dest(buildDir));
            return new Promise((resolve, reject) => {
                zipStream.on('error', reject);
                zipStream.on('finish', resolve);
            });
        }));

        gulp.task(taskNames.upload, gulp.series(taskNames.package, async () => {
            //read properties
            const buildDir = await properties.read('backend-build-dir', false);
            const s3Bucket = await properties.read('backend-s3-bucket', true);
            const profile = await properties.read('profile', true);

            //construct upload command
            let uploadCmdString = `aws cloudformation package --template-file template.yaml --output-template-file ${buildDir}/output-template.yaml --s3-bucket ${s3Bucket}`;
            if (profile) {
                uploadCmdString += ` --profile ${profile}`;
            }

            //execute command
            let uploadCmd = exec(uploadCmdString);
            uploadCmd.then((value) => {
                console.info(value.stdout);
            }).catch((error) => {
                //do nothing
            });
            return uploadCmd;
        }));

        gulp.task(taskNames.deploy, gulp.series(taskNames.upload, async () => {
            //ensure required properties
            const buildDir = await properties.read('backend-build-dir', false);
            const stackName = await properties.read('stack-name', true);
            const profile = await properties.read('profile', true);
            const domain = await properties.read('stack-root-domain-name', true);
            const hatSecret = await properties.read('stack-hat-secret', true);
            const secretSantaAdminUser = await properties.read('secretsanta-admin-user', true);
            const secretSantaAdminPass = await properties.read('secretsanta-admin-pass', true);

            //construct deploy command
            let deployCmdString = `aws cloudformation deploy --template-file ${buildDir}/output-template.yaml --stack-name ${stackName} --capabilities CAPABILITY_IAM`;
            deployCmdString += ` --parameter-overrides RootDomainName=${domain} HatSecret=${hatSecret} EnableSMS=true EnableDynamoDB=true SecretSantaAdminUser=${secretSantaAdminUser} SecretSantaAdminPass=${secretSantaAdminPass} SecretSantaRootUrl=https://${domain}`;

            if (profile) {
                deployCmdString += ` --profile ${profile}`;
            }

            //execute command
            let deployCmd = exec(deployCmdString);
            deployCmd.then((value) => {
                console.info(value.stdout);
            }).catch((error) => {
                //do nothing
            });
            return deployCmd;
        }));
    }
};
