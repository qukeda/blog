/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');

var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});

var app = express(); //生成一个express实例 app
// var multer  = require('multer');

// app.use(multer({
//   dest: 'd:nodejs/blog/public/images',
//   rename: function (fieldname, filename) {
//     return filename;
//   }
// }));
// all environments
app.set('port', process.env.PORT || 3000);//设置端口为process.ent.PORT或者3000
app.set('views', __dirname + '/views');//设置 views 文件夹为存放视图文件的目录, 即存放模板文件的地方,__dirname 为全局变量,存储当前正在执行的脚本所在的目录。
app.set('view engine', 'ejs');//设置视图模板引擎为 ejs
app.engine('.ejs', require('ejs').__express); //同上
app.use(flash());
app.use(express.favicon(__dirname + '/public/img/favicon.ico'));//设置/public/favicon.ico为favicon图标。
app.use(express.logger('dev'));//加载日志中间件,在终端显示日志
app.use(express.logger({stream: accessLog}));
app.use(express.bodyParser({ keepExtensions: true, uploadDir: './public/images' }));//设置public文件夹为存放静态文件的目录。//connect内建的中间件，用来解析请求体
app.use(express.methodOverride());//connect内建的中间件，可以协助处理POST请求，伪装PUT、DELETE和其他HTTP方法
app.use(express.cookieParser());//加载cookie解析的中间件
app.use(express.session({
  secret: settings.cookieSecret,
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  store: new MongoStore({
    db: settings.db
  })
}));
app.use(app.router);//调用路由解析的规则
app.use(express.static(path.join(__dirname, 'public')));//connect内建的中间件,将根目录下的public文件夹设置为存放image,css,js等静态文件的目录

app.use(function (err, req, res, next) {
  var meta = '[' + new Date() + '] ' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
});

// development only   
// 配置开发环境下的错误处理，输出错误信息
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

routes(app);//调用index.js