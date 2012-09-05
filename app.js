var express = require('express')
  , partials = require('express3-partials')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , io  = require('socket.io')
  , mysql = require('mysql')
  , auctionHouse = require('./lib/auctionhouse');

var settings = {}
  , auctions = {};

function newAuction() {
  var options = {
    id: JSON.stringify(new Date()),
    increment: settings.increment,
    groupSize: settings.groupSize
  };
  auctions[id] = new auctionHouse.Auction(options);
  return auctions[id];
}

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
          settings.sessionID = row.sessionID;
          settings.startTime = row.startTime;
          settings.increment = row.increment;
          settings.groupSize = row.groupSize;
        }
        console.log(JSON.stringify(settings));
      }
    });
  } else {
    console.log(err);
  }
});

var app = express();

app.use(partials());

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
app.get('/login', routes.login);
app.get('/admin', routes.admin);
app.post('/session', function(req, res) {
  var fields = req.body;
  var query = db.query('INSERT INTO sessions SET ?', fields, function(err, result) {
    if(err) {
      console.log('Error adding new session', err, fields);
    } else {
      console.log('Added new session.');
      settings.sessionID = result.insertId;
      settings.increment = fields.increment;
      settings.groupSize = fields.groupSize;
    }
    console.log(JSON.stringify(settings));
  });
  routes.admin(req, res);
});

app.post('/login', function(req, res) {
  if(!req.body.id) {
    routes.login(req, res, { failedLogin: true } );
  }

  routes.login(req, res, { failedLogin: true } );
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
