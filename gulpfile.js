var
  bump                    = require('gulp-bump'),
  changed                 = require('gulp-changed'),
  concat                  = require('gulp-concat'),
  config                  = require('./build.config.js'),
  cssUrlAdjuster          = require('gulp-css-url-adjuster'),
  debug                   = require('gulp-debug'),
  del                     = require('del'),
  ecstatic                = require('ecstatic'),
  fs                      = require('fs'),
  gulp                    = require('gulp'),
  gutil                   = require('gulp-util'),
  header                  = require('gulp-header'),
  html2js                 = require('gulp-html2js'),
  http                    = require('http'),
  inject                  = require("gulp-inject"),
  jshint                  = require('gulp-jshint'),
  less                    = require('gulp-less'),
  livereload              = require('gulp-livereload'),
  merge                   = require('merge-stream'),
  minify                  = require('gulp-minify-css'),
  ngAnnotate              = require('gulp-ng-annotate'),
  pkg                     = require('./package.json'),
  rename                  = require('gulp-rename'),
  rev                     = require('gulp-rev'),
  runSequence             = require('run-sequence'),
  sass                    = require('gulp-sass'),
  streamqueue             = require('streamqueue'),
  stylish                 = require('jshint-stylish'),
  svgstore                = require('gulp-svgstore'),
  uglify                  = require('gulp-uglify'),
  using                   = require('gulp-using'),
  watch                   = require('gulp-watch')
;

gulp.task('sass', function () {
  return gulp.src(config.app_files.scss)
    .pipe(sass({noCache: true}))
    .on('error', function (err) { console.log(err.message); })
    .pipe(rename(function(path){
      path.basename = pkg.name + '-' + pkg.version;
    }))
    .pipe(gulp.dest(config.build_dir + '/assets'));
});

gulp.task('copy', function() {
  var sources = [
    gulp.src('src/assets/**/*', { base: 'src/assets/' })
      .pipe(changed(config.build_dir + '/assets'))
      .pipe(gulp.dest(config.build_dir + '/assets')),

    gulp.src(config.app_files.js)
      .pipe(changed(config.build_dir + '/src'))
      .pipe(gulp.dest(config.build_dir + '/src')),

    gulp.src(config.vendor_files.js.concat(config.vendor_files.css.concat(config.vendor_files.assets)), {base: '.'})
      .pipe(changed(config.build_dir))
      .pipe(gulp.dest(config.build_dir))
  ];

  return merge(sources);
});

gulp.task('clean:build', function(callback){
  del(config.build_dir, callback);
});

gulp.task('clean:prod', function(callback){
  del(config.prod_dir, callback);
});

gulp.task('prod', function(callback){
  runSequence(
    'clean:build',
    'build',
    'clean:prod',
    'compile',
    'inject:prod',
  callback);
});

gulp.task('inject:prod', function () {

  var target = gulp.src('src/index.html'),
    files = ['assets/*.css', 'app*.js'],
    sources = gulp.src(files, {read: false, cwd: config.prod_dir})
  ;
  return target
    .pipe(inject(sources, {addRootSlash: false}))
    .pipe(gulp.dest(config.prod_dir));
});

gulp.task('compile', ['compile:js', 'compile:assets']);

gulp.task('compile:js', function(){
  return streamqueue(
    {objectMode: true},
    gulp.src(config.vendor_files.js),
    gulp.src(config.app_files.js.concat([config.build_dir + '/templates-app.js']))
  )
    .pipe(concat('app.js'))
    .pipe(ngAnnotate({
      remove: false,
      add: false,
      single_quotes: true
    }))
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest(config.prod_dir))
  ;
});

gulp.task('compile:assets', function() {
  return merge([
    gulp.src(config.build_dir + '/assets/**/*.css')
      .pipe(cssUrlAdjuster({
        replace: [/^(\.\.\/)+/, '']
      }))
      .pipe(minify())
      .pipe(rev())
      .pipe(gulp.dest(config.prod_dir + '/assets')),
    gulp.src(config.build_dir + '/assets/**/!(*.css)')
      .pipe(gulp.dest(config.prod_dir + '/assets')),
    gulp.src(config.vendor_files.assets, {base: '.'})
      .pipe(changed(config.prod_dir))
      .pipe(gulp.dest(config.prod_dir + '/assets'))
  ]);
});

gulp.task('less', function() {
  return gulp.src(config.app_files.less)
    .pipe(changed(config.build_dir + '/assets', {extension: '.css'}))
    .pipe(less())
    .pipe(rename(function(path){
      path.basename = pkg.name + '-' + pkg.version;
    }))
    .pipe(gulp.dest(config.build_dir + '/assets'));
});

gulp.task('jshint', function() {
  var options = {
    curly: true,
    immed: true,
    newcap: true,
    noarg: true,
    sub: true,
    boss: true,
    eqnull: true,
    globalstrict: true
  };

  return gulp.src(config.app_files.js)
    .pipe(jshint(options))
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});

gulp.task('html2js', function() {
  var templates = [
    { files: config.app_files.atpl, type: 'app'},
    { files: config.app_files.ctpl, type: 'common'}
  ];

  return templates.map(function(template) {
    return gulp.src(template.files)
      .pipe(html2js({base: 'src/' + template.type, outputModuleName: 'templates-' + template.type}))
      .pipe(changed(config.build_dir, {extension: '.js'}))
      .pipe(concat('templates-'+ template.type +'.js'))
      .pipe(gulp.dest(config.build_dir));
  });
});

var buildTask = function() {
  var target = gulp.src('src/index.html'),
    files = [].concat(
      config.vendor_files.js,
      config.app_files.js,
      config.vendor_files.css,
      'templates-common.js',
      'templates-app.js',
        'assets/' + pkg.name + '-' + pkg.version + '.css'
    ),
    sources = gulp.src(files, {read: false, cwd: config.build_dir})
  ;
  return target.pipe(inject(sources, {addRootSlash:false}))
    .pipe(gulp.dest(config.build_dir));
};

gulp.task('build', ['sass', 'copy', 'html2js'], function() {
  return buildTask();
});

gulp.task('watch-build', ['sass'], function() {
  return buildTask();
});

var svgstoreTask = function() {
  var svgs = gulp.src('src/assets/svg/*.svg')
      .pipe(svgstore({ prefix: pkg.name + '-', inlineSvg: true })),

    fileContents = function fileContents (filePath, file) {
      return file.contents.toString('utf8');
    };

  return gulp.src(config.build_dir + '/index.html')
    .pipe(inject(svgs, { transform: fileContents }))
    .pipe(gulp.dest(config.build_dir));
};

gulp.task('svgstore', ['build'], function () {
  return svgstoreTask();
});

gulp.task('watch-svgstore', ['watch-build'], function () {
  return svgstoreTask();
});

gulp.task('livereload', ['svgstore'], function() {
  livereload.listen();
  gulp.watch(config.build_dir + '/**').on('change', livereload.changed);
});

gulp.task('watch', ['svgstore'], function() {
  gulp.watch(['**/*.scss'], ['sass']);
  gulp.watch(['src/**/*.js'], [
    //'jshint',
    'copy'
  ]);
  gulp.watch([config.app_files.atpl, config.app_files.ctpl], ['html2js']);
  gulp.watch('src/index.html', ['watch-build', 'watch-svgstore']);
  gulp.watch('src/assets/svg/*.svg', ['svgstore']);
});

gulp.task('server', function() {
  http.createServer(ecstatic({root: __dirname + '/' + config.build_dir})).listen(8080);
  gutil.log(gutil.colors.blue('HTTP server listening on port 8080'));
});

gulp.task('server:prod', function() {
  http.createServer(ecstatic({root: __dirname + '/' + config.prod_dir})).listen(8080);
  gutil.log(gutil.colors.blue('HTTP server listening on port 8080'));
});

gulp.task('default', [
  //'jshint',
  'server',
  'watch',
  'livereload'
]);
