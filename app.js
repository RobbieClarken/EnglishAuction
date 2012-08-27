var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , io  = require('socket.io')
  , mysql = require('mysql');

/* Globals */
var SESSION_ID
  , START_TIME
  , INCREMENT
  , GROUP_SIZE
  , ENDED;

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

    db.query('SELECT * FROM sessions ORDER BY sessionID DESC LIMIT 1', function(err, result) {
      if(err) {
        console.log('Error loading last session.', err);
      } else {
        if(result.length) {
          var row = result[0];
          SESSION_ID = row.sessionID;
          START_TIME = row.startTime;
          INCREMENT = row.increment;
          GROUP_SIZE = row.groupSize;
          ENDED = row.ended;
        }
        console.log(SESSION_ID, START_TIME, INCREMENT, GROUP_SIZE, ENDED);
      }
    });

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
  var query = db.query('INSERT INTO sessions SET ?', fields, function(err, result) {
    if(err) {
      console.log('Error adding new session', err, fields);
    } else {
      console.log('Added new session.');
      SESSION_ID = result.insertId;
      INCREMENT = fields.increment;
      GROUP_SIZE = fields.groupSize;
      ENDED = false;
    }
    console.log(SESSION_ID, START_TIME, INCREMENT, GROUP_SIZE, ENDED);
  });
  routes.admin(req, res);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
