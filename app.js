var express = require('express')
  , partials = require('express3-partials')
  , routes = require('./routes')
  , auctionHouse = require('./lib/auctionHouse')
  , http = require('http')
  , path = require('path')
  , io = require('socket.io');

var app = express();

app.use(partials());

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(function(req, res, next) {
    req.settings = auctionHouse.getSettings();
    req.info = {
      subjectCount: Object.keys(auctionHouse.subjects).length
    };
    next();
  });
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('fun30fllkslfj24fdsakj'));
  app.use(express.session());
  app.use(function(req, res, next) {
    if(req.url === '/') {

    }
    next();
  });
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


app.get('/', function(req, res) {
  var subjectID = req.cookies.subjectID;
  if(subjectID) {
    var subject = auctionHouse.subjects[subjectID];
    if(!subject) {
      return res.redirect('/login');
    }

    routes.index(req, res);
  } else {
    res.redirect('/login');
  }
});
app.get('/login', routes.login);
app.get('/admin', routes.admin);
app.post('/settings', function(req, res) {
  var fields = req.body;
  auctionHouse.setSettings(fields, function(err) {
    // TODO: Error handling
    res.redirect('/admin');
  });
});

app.post('/login', function(req, res) {
  if(req.body.id === 'abc') {
    auctionHouse.newSubject(function(err, subjectID) {
      // TODO: Error handling
      res.cookie('subjectID', subjectID, { maxAge: 36000000, httpOnly: true });
      res.redirect('/');
    });
  } else {
    req.failedLogin = true;
    routes.login(req, res);
  }
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var sio = io.listen(server);
sio.set('log level', 2);

sio.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
