//initialize all of our variables
var app, base, concat, directory, gulp, gutil, hostname, path, refresh, sass, uglify, imagemin, minifyCSS, del, browserSync, autoprefixer, gulpSequence, shell, sourceMaps, plumber, htmlreplace;

var autoPrefixBrowserList = ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'];

gulp         = require('gulp');
gutil        = require('gulp-util');
concat       = require('gulp-concat');
uglify       = require('gulp-uglify');
sass         = require('gulp-sass');
sourceMaps   = require('gulp-sourcemaps');
imagemin     = require('gulp-imagemin');
minifyCSS    = require('gulp-minify-css');
browserSync  = require('browser-sync');
autoprefixer = require('gulp-autoprefixer');
gulpSequence = require('gulp-sequence').use(gulp);
shell        = require('gulp-shell');
plumber      = require('gulp-plumber');
htmlreplace  = require('gulp-html-replace');

gulp.task('browserSync', function() {
        browserSync.init({
            proxy: "http://jjaleman.dev/",
        options: {
            reloadDelay: 250
        },
        notify: false
    });
});

gulp.task('images', function(tmp) {
    gulp.src(['app/images/src/**/*.jpg', 'app/images/src/**/*.png'])
        .pipe(plumber())
        .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
        .pipe(gulp.dest('app/images'))
});

gulp.task('images-deploy', function() {
    gulp.src(['app/images/**/*', '!app/images/README'])
        .pipe(plumber())
        .pipe(gulp.dest('dist/images'))
});

gulp.task('scripts', function() {
    return gulp.src(['app/scripts/src/**/*.js'])
                .pipe(plumber())
                .pipe(concat('scripts.min.js'))
                .on('error', gutil.log)
                .pipe(gulp.dest('app/scripts'))
                .pipe(browserSync.reload({stream: true}))
});

gulp.task('scripts-deploy', function() {
    return gulp.src(['app/scripts/src/_includes/**/*.js', 'app/scripts/src/**/*.js'])
                .pipe(plumber())
                .pipe(concat('scripts.min.js'))
                .pipe(uglify('scripts.min.js'))
                .pipe(gulp.dest('dist/scripts'))
});

gulp.task('styles', function() {
    return gulp.src('app/styles/scss/init.scss')
                .pipe(plumber({
                  errorHandler: function (err) {
                    console.log(err);
                    this.emit('end');
                  }
                }))
                .pipe(sourceMaps.init())
                .pipe(sass({
                      errLogToConsole: true,
                      includePaths: [
                          'app/styles/scss/'
                      ]
                }))
                .pipe(autoprefixer({
                   browsers: autoPrefixBrowserList,
                   cascade:  true
                }))
                .on('error', gutil.log)
                .pipe(concat('styles.min.css'))
                .pipe(sourceMaps.write())
                .pipe(gulp.dest('app/styles'))
                .pipe(browserSync.reload({stream: true}))
});

gulp.task('styles-deploy', function() {
    return gulp.src('app/styles/scss/init.scss')
                .pipe(plumber())
                .pipe(sass({
                      includePaths: [
                          'app/styles/scss'
                      ]
                }))
                .pipe(autoprefixer({
                  browsers: autoPrefixBrowserList,
                  cascade:  true
                }))
                .pipe(concat('styles.min.css'))
                .pipe(minifyCSS('styles.min.css'))
                .pipe(gulp.dest('dist/styles'))
});

gulp.task('html', function() {
    return gulp.src('app/**/*.html')
        .pipe(plumber())
        .pipe(browserSync.reload({stream: true}))
        .on('error', gutil.log)
});

gulp.task('html-deploy', function() {
    gulp.src('app/**/*.html')
        .pipe(plumber())
        .pipe(gulp.dest('dist'))
    gulp.src('app/.*')
        .pipe(plumber())
        .pipe(gulp.dest('dist'))
    gulp.src('app/fonts/**/*')
        .pipe(plumber())
        .pipe(gulp.dest('dist/fonts'))
    gulp.src(['app/styles/*.css', '!app/styles/styles.css'])
        .pipe(plumber())
        .pipe(gulp.dest('dist/styles'))
});

    gulp.task('clean', shell.task([
        'rm -rf dist'
    ]));

    gulp.task('scaffold', shell.task([
        'mkdir dist',
        'mkdir dist/fonts',
        'mkdir dist/images',
        'mkdir dist/scripts',
        'mkdir dist/styles',
        'cp -r app/admin dist'
    ]));

    gulp.task('gitall', shell.task([
        'gulp deploy',
        'git add .',
        'git commit -m \'DEPLOY\'',
        'git push',
        'git status'
    ]));

gulp.task('default', ['browserSync', 'scripts', 'styles'], function() {
    gulp.watch('app/scripts/src/**', ['scripts']);
    gulp.watch('app/styles/scss/**', ['styles']);
    gulp.watch('app/images/**', ['images']);
    gulp.watch('app/**/*.html').on("change", browserSync.reload);
});

gulp.task('deploy', gulpSequence('clean', 'scaffold', ['scripts-deploy', 'styles-deploy', 'images-deploy'], 'html-deploy'));
// 297 -> 155