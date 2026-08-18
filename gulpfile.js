const gulp     = require('gulp');
const concat   = require('gulp-concat');
const replace  = require('gulp-replace');
const htmlmin  = require('gulp-htmlmin');
const cssmin   = require('gulp-minify-css');
const jsmin    = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const changed  = require('gulp-changed');
const pkg      = require('./package.json');
const crypto   = require('crypto');
const fs       = require('fs');
const manifest = require('./build/build-resource-list');

/// sets some variables
const cssPath  = 'public/css/**/*';
const jsPath   = 'public/js/**/*';
const htmlPath = 'views.default/**/*';
const imgPath  = 'public/images/**/*';
let pathManifest;
let cacheManifest;

function createHashFromFileContents (data) {
    return crypto
        .createHash('sha256')
        .update(data)
        .digest('hex');
};

gulp.task('default',['cssmin','jsmin','htmlmin','imagemin'],function(){
	manifest().then(resources=>{
		pathManifest = resources[0];
	 	cacheManifest = resources[1];
	 	gulp.src('sw.default.js')
		.pipe(replace('{%APP_NAME%}',pkg.name+'-'))
		.pipe(replace('{%VERSION%}',pkg.version))
		.pipe(replace('{%PATH_MANIFEST%}',pathManifest))
		.pipe(replace('{%CACHE_MANIFEST%}',cacheManifest))
		.pipe(concat('sw.js'))
		.pipe(gulp.dest("./"));

		gulp.src('manifest.default.appcache')
		.pipe(replace('{%DATE%}',new Date()))
		.pipe(replace('{%VERSION%}',pkg.version))
		.pipe(concat('manifest.appcache'))
		.pipe(gulp.dest("./"));
	});
    console.log('Finished running gulp default task.');
});

gulp.task('cssmin',function(){
    return gulp.src(cssPath)
    .pipe(concat('app.min.css'))
    .pipe(cssmin({keepSpecialComments: 1}))
    .pipe(gulp.dest('static/css'));
});

gulp.task('jsmin',function(){
    return gulp.src(jsPath)
    .pipe(concat('app.min.js'))
    .pipe(jsmin())
    .pipe(gulp.dest('static/js'));
});

gulp.task('htmlmin',function(){
    return gulp.src(htmlPath)
    .pipe(htmlmin({
    	collapseWhitespace: true,
    	minifyCSS: true,
  		minifyJS: false,
  		removeComments: true,
  		removeTagWhitespace: true
    }))
    .pipe(gulp.dest('views'));
});

gulp.task('imagemin',function(){
    let imgDst = 'static/images';
    return gulp.src(imgPath)
    .pipe(changed(imgDst))
    .pipe(imagemin({optimizationLevel: 7}))
    .pipe(gulp.dest(imgDst));
});