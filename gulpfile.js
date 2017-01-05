'use strict';
var gulp = require('gulp'),
    buffer = require('gulp-buffer'),
    ts = require('gulp-typescript'),
    tap = require('gulp-tap'),
    ava = require('gulp-ava'),
    tslint = require('gulp-tslint'),
    sourcemaps = require('gulp-sourcemaps'),
    glob = require('glob'),
    browserify = require('browserify'),
    path = require('path'),
    fs = require('fs'),
    gutil = require('gulp-util'),
    connect = require('connect'),
    gulpConnect = require('gulp-connect'),
    del = require('del');

gulp.task('clean', () => {
    return del(['build', 'web', 'test']);
});

gulp.task('tslint', () => {
    return gulp.src('src/**/*.ts', { since: gulp.lastRun('tslint') })
        .pipe(tslint({
            formatter: 'verbose'
        }))
        .pipe(tslint.report())
});

gulp.task('tslint-nothrow', (done) => {
    return gulp.src('src/**/*.ts', { since: gulp.lastRun('tslint-nothrow') })
        .pipe(tslint({
            formatter: 'verbose'
        }))
        .pipe(tslint.report())
        .on('error', () => done());
});


gulp.task('serve', () => {
    let connectApp = gulpConnect.server({
        livereload: true,
        port: 8081
    });
    connectApp.app.stack = connectApp.app.stack.slice(0, 1);
    connectApp.app.use(connect.directory(connectApp.root));
    connectApp.app.use(connect["static"](connectApp.root, {
        index: connectApp.index
    }));
});

gulp.task('reload', (done) => {
    gulpConnect.reload();
    done();
});

// By using a project we can do incremental compilation of the typescript code
var tsProject = ts.createProject('tsconfig.json');

// The ts task is for checking if your code compiles and to compile the code
// that is needed for testing. Gulp-typescript only emits javascript code for
// the files we reference here. In the case of compiling tesets, we do not know
// which files the tests depend on we need to pass all the ts files. A github
// issue exists for this problem:
// https://github.com/ivogabe/gulp-typescript/issues/190
// This could enhance compilation speeds when only tests are relevant

gulp.task('ts', function() {
    return gulp.src(['src/**/*.ts'], { since: gulp.lastRun('ts') })
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(sourcemaps.write({
            mapSources: function(sourcePath) {
                // We need to specify absolute path to the original source files.
                // If we don't it uses the relative path of the .ts file and uses
                // the destination directory as base. You then get source file
                // paths like:
                // symbol/demo/build/symbol/features/symbol/features/DownstrokeLength.ts
                // Using absolute paths prevents this from happening.
                var resolved = path.resolve('src/', sourcePath);
                return resolved;
            }
        }))
        .pipe(gulp.dest('build'));
});

// This runs ava (without compiling the code first)
gulp.task('ava', function() {
    return gulp.src('build/**/*Test.js')
        .pipe(ava());
});

var copyWebSrc = ['**/*.html', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.ico', '**/*.css', '**/*.js'].map((x) => 'src/**/demo/**/' + x);
gulp.task('linkDemoAssets', function() {
    return gulp.src(copyWebSrc)
        .pipe(gulp.symlink('web'))
        .pipe(gulpConnect.reload());
});

var copyTestAssests = ['**/*Test/**/assets/*.html', '**/*Test/assets/*.css', '**/*Test/assets/*.png'].map((x) => 'src/' + x);
gulp.task('linkTestAssets', function() {
    return gulp.src(copyTestAssests)
        .pipe(gulp.symlink('build'))
        .pipe(gulpConnect.reload());
});

function browserifyTask(js, targetDir) {
    // given a js file, defines a corresponding browserify task
    // returns a function f to use as follows: gulp.task(name, f)
    return function() {
        return gulp.src(js, { read: false, base: path.dirname(js) }) // no need of reading file because browserify does.
            // transform file objects using gulp-tap plugin
            .pipe(tap(function(file) {
                // replace file contents with browserify's bundle stream
                file.contents = browserify(file.path, {
                    debug: true,
                    fast: true,
                    'detect-globals': false
                }).bundle();
            }))
            // transform streaming contents into buffer contents (because gulp-sourcemaps does not support streaming contents)
            .pipe(buffer())
            // load and init sourcemaps
            .pipe(sourcemaps.init({ loadMaps: true, debug: true }))
            // write sourcemaps
            .pipe(sourcemaps.write({
                includeContent: false,
                debug: true,
                mapSources: function(sourcePath) {
                    //console.log('mapsources-browserify');
                    //console.log(sourcePath);
                    if (sourcePath.substr(0, '../src'.length) === '../src') {
                        sourcePath = sourcePath.substr('..'.length);
                    } else {
                        var index = sourcePath.indexOf('node_modules');
                        if (index !== -1) {
                            sourcePath = sourcePath.substr(index - 1);
                        }
                    }
                    //console.log('final path:' + sourcePath);
                    return sourcePath;
                }
            }))
            .pipe(gulp.dest(targetDir));
    }
}

// Generate tasks for each demo app. Note that this happens on start of gulp.
// If app files are created afterwards gulp needs to restart
var browserifyAppTasks = [];
var appFiles = glob.sync('src/**/demo/**/app*.ts').map((fname) => { return path.normalize(fname); });
for (let appTs of appFiles) {
    let transpiled = path.join('build', path.dirname(appTs).substr('src'.length), path.basename(appTs, '.ts') + '.js');
    let targetDir = path.join('web', path.dirname(appTs).substr('src'.length));
    let taskName = 'browserify ' + transpiled;
    browserifyAppTasks.push(taskName);
    gulp.task(taskName, browserifyTask(transpiled, targetDir));
    gulp.task(appTs, gulp.series([gulp.parallel('linkDemoAssets', 'ts', 'tslint-nothrow'), taskName]));
    gulp.task(appTs + '-watch', gulp.parallel(
        'serve',
        gulp.series(
            appTs,
            () => {
                gulp.watch(copyTestAssests, gulp.series('reload'));
                gulp.watch('src/**/*.ts', gulp.parallel(gulp.series(['ts', appTs]), 'tslint-nothrow'));
            })
    ));
}

// Generate tasks for each demo app. Note that this happens on start of gulp.
// If app files are created afterwards gulp needs to restart
var browserifyAllTestFoldersTasks = [];
var testFiles = glob.sync('src/**/*Test/assets/*.ts').map((fname) => { return path.normalize(fname); });

var testFlds = {};
for (let testTs of testFiles) {
    var fileFld = path.dirname(testTs);
    var testFld = path.normalize(fileFld.substr(0, fileFld.length - '/assets'.length));
    if (testFlds.hasOwnProperty(testFld)) {
        testFlds[testFld].push(testTs);
    } else {
        testFlds[testFld] = [testTs];
    }
}

for (let testFld in testFlds) {
    if (testFlds.hasOwnProperty(testFld)) {
        var browserifyTestFolderTasks = [];
        for (let testTs of testFlds[testFld]) {
            let transpiled = path.join('build', path.dirname(testTs).substr('src'.length), path.basename(testTs, '.ts') + '.js');
            let targetDir = path.join('build', path.dirname(testTs).substr('src'.length));
            let taskFileName = 'browserify ' + transpiled;
            browserifyTestFolderTasks.push(taskFileName);
            gulp.task(taskFileName, browserifyTask(transpiled, targetDir));
        }
        let folderTaskName = 'browserify ' + testFld;
        browserifyAllTestFoldersTasks.push(folderTaskName);
        gulp.task(folderTaskName, gulp.parallel(browserifyTestFolderTasks));
        gulp.task(testFld, gulp.series([gulp.parallel('linkTestAssets', 'ts', 'tslint-nothrow'), folderTaskName, 'ava']));
        gulp.task(testFld + '-watch', gulp.parallel(
            gulp.series(
                testFld,
                () => {
                    gulp.watch(copyTestAssests, gulp.parallel(gulp.series(['ts', testFld]), 'tslint-nothrow'));
                    gulp.watch('src/**/*.ts', gulp.parallel(gulp.series(['ts', testFld]), 'tslint-nothrow'));
                })
        ));
    }
}


gulp.task('browserifyApps', gulp.parallel(browserifyAppTasks));
gulp.task('browserifyTests', gulp.parallel(browserifyAllTestFoldersTasks));

gulp.task('demo', gulp.parallel('linkDemoAssets', gulp.series(['ts', 'browserifyApps', 'serve'])));

gulp.task('test', gulp.series(['linkTestAssets', 'ts', 'browserifyTests', 'ava']));
gulp.task('test-watch', gulp.series(gulp.parallel(['tslint-nothrow', 'test']), () => {
    return gulp.watch('src/**/*.ts', gulp.parallel(['test', 'tslint-nothrow']));
}));

gulp.task('all', gulp.series(
    'clean',
    gulp.parallel(['tslint', 'linkDemoAssets', 'linkTestAssets']),
    'ts',
    gulp.parallel(['browserifyApps', 'browserifyTests']),
    'ava'
));

var gulpStartedFromProjectRoot = process.env['PWD'] === undefined || process.env['PWD'] === process.cwd();
if (gulpStartedFromProjectRoot) {
    gulp.task('default', gulp.series('all'));
} else {
    var appFiles = glob.sync('app*.ts', { cwd: process.env['PWD'] });
    //Assume demo context
    if (appFiles.length > 0) {
        let browserifyTasks = appFiles.map((tspath) => path.relative(process.cwd(), path.resolve(process.env['PWD'], tspath)));

        gulp.task('default',
            gulp.series((done) => {
                    gutil.log('Found app*.ts files in the current directory, assuming demo development context');
                    done();
                },
                'linkDemoAssets',
                gulp.parallel('tslint-nothrow', 'ts'),
                browserifyAppTasks,
                gulp.parallel(
                    'serve', () => {
                        gulp.watch(copyWebSrc, gulp.series('reload'));
                        gulp.watch('src/**/*.ts', gulp.parallel('tslint-nothrow', gulp.series(['ts'], browserifyTasks)));
                    })));
    } else {
        gulp.task('default',
            gulp.series((done) => {
                    gutil.log('Did not find app*.ts files in the current directory, assuming automatic testing context');
                    done();
                },
                'test-watch'));
    }
}