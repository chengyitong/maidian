var gulp = require('gulp'),
  less = require('gulp-less'), //编译less
  nano = require('gulp-cssnano'), //压缩css
  postcss = require('gulp-postcss'),
  imagemin = require('gulp-imagemin'), //压缩images
  autoprefixer = require('autoprefixer'), //自动添加浏览器前缀
  connect = require('gulp-connect'), //启动服务
  proxy = require('http-proxy-middleware'), //设置服务器代理
  uglify = require('gulp-uglify'), //压缩js
  htmlmin = require('gulp-htmlmin'), //压缩html
  header = require('gulp-header'), //定义文件头部信息
  rename = require('gulp-rename'), //重命名文件
  runSequence = require('gulp-run-sequence'), //顺序执行命令
  plumber = require('gulp-plumber'), //捕获处理任务中的错误
  sourcemaps = require('gulp-sourcemaps'),
  assetRev = require('gulp-asset-rev'), //给js和css添加版本号，对文件名加MD5后缀
  pkg = require('./package.json'),
  zip = require('gulp-zip'), //压缩为zip文件
  clean = require('gulp-clean'), //删除文件
  changed = require('gulp-changed'), //只编译修改过的文件
  concat = require('gulp-concat'), //多个文件合并为一个
  yargs = require('yargs').options({
    'w': {
      alias: 'watch',
      type: 'boolean'
    },
    's': {
      alias: 'server',
      type: 'boolean'
    },
    'p': {
      alias: 'port',
      type: 'number'
    }
  }).argv;

var option = {
  base: 'src'
},
  dist = __dirname + '/dist';

//定义css、js源文件路径
var cssSrc = 'src/static/css/*.css',
  lessSrc = 'src/static/css/style.less',
  jsSrc = ['src/static/js/**/*.js', '!src/static/js/libs/*.js'],
  imgSrc = 'src/static/img/**/*.+(png|jpg|jpeg|gif|svg|ico)',
  assetsSrc = ['src/static/**/*.?(min.js|min.css|png|jpg|jpeg|gif|svg|ico)', 'src/static/js/libs/**/*.js', 'src/static/css/common/**/*.css'],
  htmlSrc = 'src/**/*.html';

// 编译 less 文件
gulp.task('build:style', ['build:concatCss'], function () {
  var banner = [
    '/*!',
    ' * v<%= pkg.version %> (<%= pkg.homepage %>)',
    ' * <%= new Date().toLocaleString() %>',
    ' * Authour: chengyitong',
    ' */',
    ''
  ].join('\n');
  return gulp.src(lessSrc, option)
    .pipe(plumber())
    .pipe(changed(dist, { extension: '.less' }))//只编译修改过的文件
    .pipe(sourcemaps.init())
    .pipe(less().on('error', function (e) {
      console.error(e.message);
      this.emit('end');
    }))
    .pipe(postcss([autoprefixer(['iOS >= 7', 'Android >= 4.1'])]))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./src'))
    .pipe(connect.reload())
});

// 合并、压缩、重命名css
gulp.task('build:concatCss', function () {
  return gulp.src(cssSrc)
    .pipe(changed(dist, { extension: '.css' }))//只编译修改过的文件
    .pipe(assetRev()) //为css中的背景图片添加版本号
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./dist/static/css'))
    .pipe(connect.reload())
    .pipe(nano({
      zindex: false,
      autoprefixer: false
    }))
    .pipe(rename(function (path) {
      path.basename += '.min';
    }))
    .pipe(gulp.dest('./dist/static/css'))
});

// 合并、压缩 javascript 文件
gulp.task('build:scripts', function () {
  var banner = [
    '/*!',
    ' * v<%= pkg.version %> (<%= pkg.homepage %>)',
    ' * <%= new Date().toLocaleString() %>',
    ' * Authour: chengyitong',
    ' */',
    ''
  ].join('\n');
  return gulp.src(jsSrc, option)
    .pipe(plumber())
    .pipe(changed(dist, { extension: '.js' }))//只编译修改过的文件
    // .pipe(concat('main.js')) //合并js
    .pipe(gulp.dest(dist))
    .pipe(uglify().on('error', function (e) {
      console.error(e.message);
      this.emit('end');
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(connect.reload())
    .pipe(rename(function (path) {
      path.basename += '.min';
    }))
    .pipe(gulp.dest(dist))
});

// 压缩图片
gulp.task('build:img', function () {
  var options = {
    optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
    progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
    interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
    multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
  }
  return gulp.src(imgSrc)
    .pipe(plumber())
    .pipe(changed(dist, { extension: '.(png|jpg|jpeg|gif|svg|ico)' }))//只编译修改过的文件
    // .pipe(imagemin(options))
    .pipe(gulp.dest(dist + '/static/img'))
    .pipe(connect.reload())
});

// 压缩 html 文件
gulp.task('build:html', function () {
  var options = {
    collapseWhitespace: true, //从字面意思应该可以看出来，清除空格，压缩html，这一条比较重要，作用比较大，引起的改变压缩量也特别大。
    collapseBooleanAttributes: true, //省略布尔属性的值，比如：<input checked="checked"/>,那么设置这个属性后，就会变成 <input checked/>。
    removeComments: true, //清除html中注释的部分，我们应该减少html页面中的注释。
    removeEmptyAttributes: true, //清除所有的空属性。
    removeScriptTypeAttributes: true, //清除所有script标签中的type="text/javascript"属性。
    removeStyleLinkTypeAttributes: true, //清楚所有Link标签上的type属性。
    minifyJS: true, //压缩html中的javascript代码。
    minifyCSS: true //压缩html中的css代码。
  };
  return gulp.src(htmlSrc)
    .pipe(changed(dist, { extension: '.html' }))//只编译修改过的文件
    .pipe(assetRev()) //为html中的js和css添加版本号
    // .pipe(htmlmin(options))
    .pipe(gulp.dest(dist))
    .pipe(connect.reload())
});

// 转移不需要处理的静态文件
gulp.task('build:assets', function () {
  return gulp.src(assetsSrc, option)
    .pipe(plumber())
    .pipe(changed(dist, { extension: '.*' }))//只编译修改过的文件
    .pipe(gulp.dest(dist))
    .pipe(connect.reload())
});

// 压缩打包项目为zip文件
gulp.task('zip', function () {
  return gulp.src('dist/**/*.*')
    .pipe(zip(pkg.name + '.zip'))
    .pipe(gulp.dest('./zip'))
});

// 删除文件
gulp.task('clean', function () {
  return gulp.src(['dist/**/*.*', '!dist/**/img/*.*'])
    .pipe(clean())
});

gulp.task('release', function (cb) {
  runSequence('clean', 'build:html', 'build:assets', 'build:style', 'build:scripts', 'build:img', cb);
});

gulp.task('watch', ['release'], function () {
  gulp.watch('src/static/css/**/*', ['build:style']);
  gulp.watch('src/static/js/**/*', ['build:scripts']);
  gulp.watch('src/static/img/**/*', ['build:img']);
  gulp.watch('src/**/*.html', ['build:html']);
});

// 用 connect 启动服务，http-proxy-middleware 代理服务器
gulp.task('server', function () {
  yargs.p = yargs.p || 8081;
  connect.server({
    root: './dist',
    port: yargs.p,
    livereload: true,
    middleware: function (connect, opt) {
      return [
        // /api请求都转发到http://localhost:8081中去，如果需要其他服务就在这里添加就行
        proxy('/app', {
          target: 'https://linkcrm.verge-tech.cn/?c=record&m=add_record',
          changeOrigin: true
        })
      ]
    }
  });
});

// 参数说明
// -w: 实时监听
// -s: 启动服务器
// -p: 服务器启动端口，默认8081
// -z: 打包zip文件
// -r: 生成dist文件
gulp.task('default', ['release'], function () {
  if (yargs.s) {
    gulp.start('server');
  }
  if (yargs.w) {
    gulp.start('watch');
  }
  if (yargs.z) {
    gulp.start('zip');
  }
  if (yargs.r) {
    gulp.start('release');
  }
});
