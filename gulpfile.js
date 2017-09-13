//initialize all of our variables
var app, base, concat, directory, gulp, gutil, hostname, path, refresh, sass, uglify, imagemin, minifyCSS, del, browserSync, autoprefixer, gulpSequence, shell, sourceMaps, plumber, htmlreplace;

var autoPrefixBrowserList = ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'];

//load all of our dependencies
//add more here if you want to include more libraries
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
    // browserSync({
        // server: {
            // baseDir: "app/"
        // },
        browserSync.init({
            proxy: "http://jjaleman.dev/",
        options: {
            reloadDelay: 250
        },
        notify: false
    });
});

//compressing images & handle SVG files
gulp.task('images', function(tmp) {
//  gulp.src(['app/images/*.jpg', 'app/images/*.png'])
//  gulp.src(['public_html/images/src/**/*.jpg', 'public_html/images/src/**/*.png'])
    gulp.src(['app/images/src/**/*.jpg', 'app/images/src/**/*.png'])
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
//      .pipe(gulp.dest('app/images'));
//      .pipe(gulp.dest('public_html/images'));
        .pipe(gulp.dest('app/images'));
});

//compressing images & handle SVG files
gulp.task('images-deploy', function() {
//  gulp.src(['app/images/**/*', '!app/images/README'])
//  gulp.src(['public_html/images/**/*', '!public_html/images/README'])
    gulp.src(['app/images/**/*', '!app/images/README'])
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
//      .pipe(gulp.dest('dist/images'));
//      .pipe(gulp.dest('public_html/images'));
        .pipe(gulp.dest('dist/images'));
});

//compiling our Javascripts
gulp.task('scripts', function() {
    //this is where our dev JS scripts are
//  return gulp.src(['app/scripts/src/_includes/**/*.js', 'app/scripts/src/**/*.js'])
//  return gulp.src(['public_html/scripts/src/_includes/**/*.js', 'public_html/scripts/src/**/*.js'])
//  return gulp.src(['app/scripts/src/**/*.js'])
    return gulp.src(['app/scripts/src/**/*.js', 'app/scripts/src/_includes/**/*.js'])
                //prevent pipe breaking caused by errors from gulp plugins
                .pipe(plumber())
                //this is the filename of the compressed version of our JS
//              .pipe(concat('app.js'))
                .pipe(concat('scripts.min.js'))
                //catch errors
                .on('error', gutil.log)
                //where we will store our finalized, compressed script
//              .pipe(gulp.dest('app/scripts'))
//              .pipe(gulp.dest('public_html/scripts'))
                .pipe(gulp.dest('app/scripts'))
                //notify browserSync to refresh
                .pipe(browserSync.reload({stream: true}));
});

//compiling our Javascripts for deployment
gulp.task('scripts-deploy', function() {
    //this is where our dev JS scripts are
//  return gulp.src(['app/scripts/src/_includes/**/*.js', 'app/scripts/src/**/*.js'])
//  return gulp.src(['public_html/scripts/src/_includes/**/*.js', 'public_html/scripts/src/**/*.js'])
    return gulp.src(['app/scripts/src/_includes/**/*.js', 'app/scripts/src/**/*.js'])
                //prevent pipe breaking caused by errors from gulp plugins
                .pipe(plumber())
                //this is the filename of the compressed version of our JS
//              .pipe(concat('app.js'))
                .pipe(concat('scripts.min.js'))
                //compress :D
//              .pipe(uglify())
                .pipe(uglify('scripts.min.js'))
                //where we will store our finalized, compressed script
//              .pipe(gulp.dest('dist/scripts'));
//              .pipe(gulp.dest('public_html/scripts'));
                .pipe(gulp.dest('dist/scripts'));
});

//compiling our SCSS files
gulp.task('styles', function() {
    //the initializer / master SCSS file, which will just be a file that imports everything
//  return gulp.src('app/styles/scss/init.scss')
//  return gulp.src('public_html/styles/scss/init.scss')
    return gulp.src('app/styles/scss/init.scss')
                //prevent pipe breaking caused by errors from gulp plugins
                .pipe(plumber({
                  errorHandler: function (err) {
                    console.log(err);
                    this.emit('end');
                  }
                }))
                //get sourceMaps ready
                .pipe(sourceMaps.init())
                //include SCSS and list every "include" folder
                .pipe(sass({
                      errLogToConsole: true,
                      includePaths: [
//                        'app/styles/scss/'
//                        'public_html/styles/scss/'
                          'app/styles/scss/'
                      ]
                }))
                .pipe(autoprefixer({
                   browsers: autoPrefixBrowserList,
                   cascade:  true
                }))
                //catch errors
                .on('error', gutil.log)
                //the final filename of our combined css file
                .pipe(concat('styles.min.css'))
                //get our sources via sourceMaps
                .pipe(sourceMaps.write())
                //where to save our final, compressed css file
//              .pipe(gulp.dest('app/styles'))
//              .pipe(gulp.dest('public_html/styles/css'))
                .pipe(gulp.dest('app/styles'))
                //notify browserSync to refresh
                .pipe(browserSync.reload({stream: true}));
});

//compiling our SCSS files for deployment
gulp.task('styles-deploy', function() {
    //the initializer / master SCSS file, which will just be a file that imports everything
//  return gulp.src('app/styles/scss/init.scss')
//  return gulp.src('public_html/styles/scss/init.scss')
    return gulp.src('app/styles/scss/init.scss')
                .pipe(plumber())
                //include SCSS includes folder
                .pipe(sass({
                      includePaths: [
//                        'app/styles/scss',
//                        'public_html/styles/scss',
                          'app/styles/scss',
                      ]
                }))
                .pipe(autoprefixer({
                  browsers: autoPrefixBrowserList,
                  cascade:  true
                }))
                //the final filename of our combined css file
                .pipe(concat('styles.min.css'))
                .pipe(minifyCSS('styles.min.css'))
                //where to save our final, compressed css file
//              .pipe(gulp.dest('dist/styles'));
//              .pipe(gulp.dest('public_html/styles/css'));
                .pipe(gulp.dest('dist/styles/css'));
});

//basically just keeping an eye on all HTML files
gulp.task('html', function() {
    //watch any and all HTML files and refresh when something changes
//  return gulp.src('app/*.html')
//  return gulp.src('public_html/**/*.html')
    return gulp.src('app/**/*.html')
        .pipe(plumber())
        .pipe(browserSync.reload({stream: true}))
        //catch errors
        .on('error', gutil.log);
});

//migrating over all HTML files for deployment
gulp.task('html-deploy', function() {

    //grab everything, which should include htaccess, robots, etc
 // gulp.src('app/*')
    gulp.src('app/**/*.html')
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest('dist'));

    //grab any hidden files too
    gulp.src('app/.*')
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest('dist'));

    gulp.src('app/fonts/**/*')
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest('dist/fonts'));

    //grab all of the styles
    gulp.src(['app/styles/*.css', '!app/styles/styles.css'])
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest('dist/styles'));
});

    //cleans our dist directory in case things got deleted
    // gulp.task('clean', function() {
    //     return shell.task([
    //       'rm -rf dist'
    //     ]);
    // });
    gulp.task('clean', shell.task([
        'rm -rf dist'
    ]));


    //create folders using shell
    // gulp.task('scaffold', function() {
    //   return shell.task([
    //       'mkdir dist',
    //       'mkdir dist/fonts',
    //       'mkdir dist/images',
    //       'mkdir dist/scripts',
    //       'mkdir dist/styles'
    //     ]
    //   );
    gulp.task('scaffold', shell.task([
        'mkdir dist',
        'mkdir dist/fonts',
        'mkdir dist/images',
        'mkdir dist/scripts',
        'mkdir dist/styles'
    ]));
// });


// NO NEED FOR THIS ANYMORE
// INSTEAD JUST SAVING AS *.min.* ANYWAY
// gulp.task('htmlreplace', function() {
// //	gulp.src('dist/index.html')
// 	gulp.src('dist/**/*.html')
// 	.pipe(htmlreplace({'css': 'styles/css/styles.min.css','js': 'scripts/scripts.min.js'}))
// 	.pipe(gulp.dest('dist'));
// });



    gulp.task('gitall', shell.task([
        'git add .',
        'git commit -m \'DEPLOY\'',
        'git push'
    ]));




//this is our master task when you run `gulp` in CLI / Terminal
//this is the main watcher to use when in active development
//  this will:
//  startup the web server,
//  start up browserSync
//  compress all scripts and SCSS files
gulp.task('default', ['browserSync', 'scripts', 'styles'], function() {
//a list of watchers, so it will watch all of the following files waiting for changes

//  gulp.watch('app/scripts/src/**', ['scripts']);
//  gulp.watch('public_html/scripts/src/**', ['scripts']);
    gulp.watch('app/scripts/src/**', ['scripts']);

//  gulp.watch('public_html/styles/scss/**', ['styles']);
    gulp.watch('app/styles/scss/**', ['styles']);

//  gulp.watch('app/images/**', ['images']);
//  gulp.watch('public_html/images/**', ['images']);
    gulp.watch('app/images/**', ['images']);

//  gulp.watch('app/*.php', ['html']);
//  gulp.watch('public_html/**/*.html').on("change", browserSync.reload);
    gulp.watch('app/**/*.html').on("change", browserSync.reload);
});

//this is our deployment task, it will set everything for deployment-ready files
// gulp.task('deploy', gulpSequence('clean', 'scaffold', ['scripts-deploy', 'styles-deploy', 'images-deploy'], 'html-deploy', 'htmlreplace'));
gulp.task('deploy', gulpSequence('clean', 'scaffold', ['scripts-deploy', 'styles-deploy', 'images-deploy'], 'html-deploy'));
