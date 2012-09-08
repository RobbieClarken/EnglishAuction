var express = require('express')
  , partials = require('express3-partials')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , io  = require('socket.io')
  , db = require('./lib/db')
  , auctionHouse = require('./lib/auctionhouse');

var settings = db.settings
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
app.get('/admin', function(req, res) { routes.admin(req, res, settings) });
app.post('/session', function(req, res) {
  var fields = req.body;
  db.updateSettings(fields, function(err) {
    // TODO: Handle error
    routes.admin(req, res, settings);
  });
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
