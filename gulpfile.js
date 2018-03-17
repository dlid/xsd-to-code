/// <binding BeforeBuild='build-js, build-js-raw' Clean='build-clean' />
'use strict';

var gulp = require("gulp");
var gutil = require('gulp-util'); 
var jasmine = require('gulp-jasmine');
var reporters = require('jasmine-reporters');
var fs = require('fs');

gulp.task('test',  function (cb) {
    gulp.src('tests/*.spec.js')
        .pipe(jasmine({ 
            consolidateAll : true,
            includeStackTrace : true,
            errorOnFail : false
        }))
        
});

gulp.task("default", ['upload-when-saved']);
gulp.task("serve", ['serve-watch']);
