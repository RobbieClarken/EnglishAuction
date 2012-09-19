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
      subjectCount: subjects.clients().length
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
  if(req.settings.groupsAssigned) {
    req.failedLogin = 'Groups have already been assigned.';
    return routes.login(req, res);
  }
  if(req.body.id !== 'abc') {
    req.failedLogin = 'Incorrect experiment code.';
    return routes.login(req, res);
  }
  auctionHouse.newSubject(function(err, subjectID) {
    // TODO: Error handling
    res.cookie('subjectID', subjectID, { maxAge: 36000000, httpOnly: true });
    res.redirect('/');
  });
});
app.post('/session', function(req, res) {
  if(req.body.action === 'start') {
    var clients = subjects.clients();
    var numberOfClients = clients.length;
    var groupSize = req.settings.groupSize;
    var groups = helpers.groupsForAuctions(numberOfClients, groupSize);
    var numberOfAuctions = Math.ceil(numberOfClients/groupSize);
    for(var auctionNumber = 0; auctionNumber < numberOfAuctions; auctionNumber += 1) {
      var auction = new auctionHouse.Auction({
        increment: req.settings.increment,
        groupSize: req.settings.groupSize        
      });
      var group = groups[auctionNumber];
      auction.save();
      for(var key in group) {
        var client = clients[group[key]];
        client.get('subjectID', function(err, subjectID) {
          auctionHouse.Subject.findOneAndUpdate({_id: subjectID}, {auctionID: auction.id}, function(err) {
            console.log('Updated:', subjectID, err);
          });
        });
      }
    }
    req.settings.groupsAssigned = true;
    req.settings.save();
  }
  res.redirect('/admin');
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var sio = io.listen(server);
sio.set('log level', 2); // no debug messages

var subjects = sio.of('/subjects').on('connection', function (socket) {
  console.log('Subject joined');
  cookieParser(socket.handshake, {}, function() {
    var subjectID = socket.handshake.cookies.subjectID;
    if(subjectID) {
      socket.set('subjectID', subjectID);
    }
    observers.emit('subject', { subjectCount: subjects.clients().length });
  });
  socket.on('disconnect', function () {
    // We need to subtract 1 because the subject because the
    // subject that is disconnected is still in clients at this stage
    observers.emit('subject', { subjectCount: subjects.clients().length-1 });
  });
});

var observers = sio.of('/observers').on('connection', function(socket) {
});
