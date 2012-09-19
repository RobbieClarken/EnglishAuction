var express = require('express')
  , partials = require('express3-partials')
  , routes = require('./routes')
  , auctionHouse = require('./lib/auctionHouse')
  , http = require('http')
  , path = require('path')
  , io = require('socket.io')
  , cookieParser = express.cookieParser('fun30fllkslfj24fdsakj')
  , helpers = require('./lib/helpers');

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
  app.use(cookieParser);
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


app.get('/', function(req, res) {
  var subjectID = req.cookies.subjectID;
  if(!subjectID) {
    return res.redirect('/login');
  }
  console.log(subjectID);
  auctionHouse.Subject.findOne({_id: subjectID}, function(err, subject) {
    if(!subject) {
      console.log('Error. Maybe...', err);
      return res.redirect('/login');
    }
    req.subject = subject;
    var auctionID = subject.auctionID;
    // If already assigned to an auction, skip the wait page
    if(auctionID && routes.pages[subject.pageIndex] === 'wait') {
      subject.pageIndex += 1;  
      subject.save();
    }
    auctionHouse.Auction.findOne({'_id': auctionID}, function(err, auction) {
      req.auction = auction;
      routes.index(req, res);
    });
  });
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
app.post('/session', function(req, res) {
  if(req.body.action === 'start') {
    var clients = sio.sockets.clients();
    var clientCount = clients.length;
    var settings = auctionHouse.getSettings();
    var groupSize = settings.groupSize;
    var groups = helpers.permute(helpers.arrayOfGroups(clientCount, groupSize));
  }
  res.redirect('/admin');
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var sio = io.listen(server);
sio.set('log level', 2); // no debug messages
/*
sio.set('authorization', function (data, accept) {
  if(data.headers.cookie) {
    cookieParser(socket.handshake, {}, function() {
      console.log(socket.handshake.cookies);                         
    });
    console.log(cookie);
    accept(null, true);
  } else {
    accept('No cookie.', false);
  }
});
*/

var bidders = {};

sio.sockets.on('connection', function (socket) {
    cookieParser(socket.handshake, {}, function() {
      var subjectID = socket.handshake.cookies.subjectID;
      socket.set('subjectID', subjectID);
      console.log(subjectID, 'connected.');
    });
    socket.on('disconnect', function () {
      socket.get('subjectID',function(err, subjectID){
        console.log(subjectID, 'disconnected.');
      });
    });
  /*
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
 */
});
