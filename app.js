var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , io  = require('socket.io')
  , mysql = require('mysql');

var db = mysql.createConnection({
  host: 'monlee.monash.edu',
  user: 'anmolratan',
  password: 'monashecon',
  database: 'english_auction',
  insecureAuth: true
});

db.connect(function(err) {
  if(!err) {
    console.log('MySQL connection established.');
  } else {
    console.log(err);          
  }
});

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('fun30fllkslfj24fdsakj'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/admin', routes.admin);
app.get('/session/new', function(req, res) {
  var fields = req.query;
  fields.startTime = new Date();
  var query = db.query('INSERT INTO sessions SET ?', fields, function(err, result) {
    console.log('Query complete.');
    console.log(err);
    console.log(result);
  });
  routes.admin(req, res);
  console.log(query.sql);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
