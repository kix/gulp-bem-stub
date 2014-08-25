var gulp = require('gulp');
var bem = require('gulp-bem');
var bh = require('gulp-bh');
var concat = require('gulp-concat');
var del = require('del');
var debug = require('gulp-bem-debug');
var argv = require('yargs').alias('d', 'debug').boolean('d').argv;
var buildBranch = require('buildbranch');
var less = require('gulp-less');

var deps;
var levels = [
    'libs/base',
    'bootstrap/core',
    'bootstrap/mixins',
    'blocks',
    'pages/index'
];

gulp.task('deps', function (done) {
    var tree = bem.objects(levels)
        .pipe(bem.deps())
        .pipe(bem.tree());

    deps = tree.deps('pages/index/page');

    if (argv.debug) { deps.pipe(debug()); }

    done();
});

gulp.task('less', ['deps', 'clean'], function () {
    return deps.src('{bem}.less')
        .pipe(concat('index.less'))
        .pipe(less())
        .pipe(gulp.dest('./dist'));
});

gulp.task('html', ['deps', 'clean'], function () {
    return deps.src('{bem}.bh.js')
        .pipe(bh(require('./pages/index/page/page.bemjson.js'), 'index.html'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['clean', 'html', 'less']);

gulp.task('clean', function (cb) {
    del(['./dist'], cb);
});

gulp.task('watch', ['build'], function() {
    return gulp.watch(['**/*.css', '**/*.bemjson.js'], ['build']);
});

gulp.task('gh', ['build'], function(done) {
    buildBranch({ folder: 'dist' }, done);
});

gulp.task('default', ['watch']);


/**
 * Bootstra splitting stages
 * Open ./node_modules/less/bootstrap.less
 * Copy ./node_modules/less/variables.less -> ./variables/variables.less
 * Go to mixins
 * Handle hide-text.less:
 *     Copy ./node_modules/less/mixins/hide-text.less -> ./hide-text/hide-text.less
 *     Create ./hide-text/text-hide.less and add block "hide-text" to expect deps
 *
 */

