var express = require('express')
  , partials = require('express3-partials')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , io = require('socket.io')
  , mongoose = require('mongoose')
  , cookieParser = express.cookieParser('fun30fllkslfj24fdsakj')
  , helpers = require('./lib/helpers');

var db = mongoose.connect('mongodb://localhost/test');

// Create objects in mongoose
require('./lib/settings');
require('./lib/subject');
require('./lib/auction');

var Settings = db.model('Settings');
var Subject = db.model('Subject');
var Auction = db.model('Auction');

var settings;
var auctions = {};
var subjects = {};

Settings.find().sort('-startTime').limit(1).exec(function(err, results){
  if(!results.length) {
    settings = new Settings();
    settings.save();
  } else {
    settings = results[0];
  }
});


var app = express();

app.use(partials());

app.configure(function(){
  app.set('port', process.env.PORT || 4000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(function(req, res, next) {
    req.settings = settings;
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
  Subject.findOne({_id: subjectID}, function(err, subject) {
    if(!subject) {
      return res.redirect('/login');
    }
    req.subject = subject;
    var auctionID = subject.auctionID;
    // If already assigned to an auction, skip the wait page
    var page = routes.pages[subject.pageIndex].title;
    if(auctionID && page === 'wait') {
      subject.pageIndex += 1;
      subject.save();
    }
    if(subject.droppedOut && page === 'auction') {
      subject.pageIndex += 1;
      subject.save();
    }
    Auction.findOne({'_id': auctionID}, function(err, auction) {
      req.auction = auction;
      res.cookie('auctionID', auctionID, { maxAge: 36000000, httpOnly: true });
      routes.index(req, res);
    });
  });
});
app.post('/', function(req, res) {
  var subjectID = req.cookies.subjectID;
  if(!subjectID) {
    return res.redirect('/login');
  }
  var inc = 0;
  if(req.body.direction === 'next') {
    inc = 1;
  } else if (req.body.direction === 'previous') {
    inc = -1;
  }
  Subject.findOneAndUpdate({_id: subjectID}, {$inc: {pageIndex: inc}}, function(err) {
    res.redirect('/');
  });
});
app.get('/logout', function(req, res) {
  res.clearCookie('subjectID');
  res.clearCookie('auctionID');
  res.redirect('/login');
});
app.get('/login', routes.login);
app.get('/admin', routes.admin);
app.post('/settings', function(req, res) {
  var fields = req.body;
  settings = new Settings(fields);
  settings.save(function(err) {
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
  var subject = new Subject({
    showupFee: settings.showupFee,                         
    paymentPerTable: settings.paymentPerTable                         
  });
  subject.save(function(err) {
    // TODO: Error handling
    var subjectID = subject.id;
    res.cookie('subjectID', subjectID, { maxAge: 36000000, httpOnly: true });
    res.redirect('/');
  });
});
app.post('/save', function(req, res) {
  var subjectID = req.cookies.subjectID;
  Subject.findOneAndUpdate({_id: subjectID}, req.body, function(err) {
    if(parseInt(req.body.tableCount) > 4) {
      Subject.findOneAndUpdate({_id: subjectID}, {$inc: {pageIndex: 1}}, function(err) {
        return res.end('success');
      });
    } else {
      return res.end('success');
    }
  });
});

function joinAuction(client, auctionID) {
  client.join(auctionID);
  client.get('subjectID', function(err, subjectID) {
    Subject.findOneAndUpdate({_id: subjectID}, {auctionID: auctionID}, function(err) {
      client.emit('start auction');
    });
  });
}

app.post('/session', function(req, res) {
  if(req.body.action === 'start') {
    var clients = subjects.clients();
    var numberOfClients = clients.length;
    var groupSize = req.settings.groupSize;
    var groups = helpers.groupsForAuctions(numberOfClients, groupSize);
    var numberOfAuctions = Math.ceil(numberOfClients/groupSize);
    for(var auctionNumber = 0; auctionNumber < numberOfAuctions; auctionNumber += 1) {
      var auction = new Auction({
        increment: req.settings.increment,
        groupSize: req.settings.groupSize
      });
      var group = groups[auctionNumber];
      auction.save();
      for(var key in group) {
        var client = clients[group[key]];
        joinAuction(client, auction.id);
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

function updateDropouts(auctionID, callback) {
  Subject.update(
    {auctionID: auctionID, roundChoice: 'drop out'},
    {droppedOut: true, roundChoice: null},
    {multi: true},
    callback
  );
}

function updateStayIns(auctionID, price, callback) {
  Subject.update(
    {auctionID: auctionID, roundChoice: 'stay in'},
    {price: price, roundChoice: null},
    {multi: true},
    callback
  );
}

var subjects = sio.of('/subjects').on('connection', function (socket) {
  var subjectID
    , auctionID;
  cookieParser(socket.handshake, {}, function() {
    subjectID = socket.handshake.cookies.subjectID;
    if(subjectID) {
      socket.set('subjectID', subjectID);
    }
    auctionID = socket.handshake.cookies.auctionID || null;
    socket.set('auctionID', auctionID);
    socket.join(auctionID);
    observers.emit('subject', { subjectCount: subjects.clients().length });
  });
  socket.on('disconnect', function () {
    // We need to subtract 1 because the subject because the
    // subject that is disconnected is still in clients at this stage
    observers.emit('subject', { subjectCount: subjects.clients().length-1 });
  });
  socket.on('decision', function(data) {
    socket.get('auctionID', function(err, auctionID) {
      Subject.findOneAndUpdate({_id: subjectID}, {roundChoice: data.choice}, function(err) {
        Subject.findOne({auctionID: auctionID, roundChoice: null, droppedOut: false}, function(err, result) {
          if(!result) {
            // Everyone has decided
            Subject.find({auctionID: auctionID, roundChoice: 'stay in', droppedOut: false}, function(err, results) {
              if(results.length === 0) {
                // All bidders dropped out at the same price
                Subject.find({auctionID: auctionID, roundChoice: 'drop out', droppedOut: false}, function(err, results) {
                  var winnerIndex = Math.floor(Math.random()*results.length);
                  endAuction(auctionID, results[winnerIndex], null);
                });
              } else if(results.length === 1) {
                Auction.findOne({_id: auctionID}, function(err, auction) {
                  endAuction(auctionID, results[0], auction.price);
                });
              } else {
                bumpPrice(auctionID);
              }
            });
          }
        });
      });
    });
  });
});

function endAuction(auctionID, winner, price) {
  // If we don't need to update subject's price then price argument should be null
  if(price) {
    winner.price = price;
  }
  winner.won = true;
  winner.save(function(err) {
    Subject.find({auctionID: auctionID, droppedOut: false}, function(err, results) {
      for(var subjectIndex in results) {
        var subject = results[subjectIndex];
        subject.pageIndex += 1;
        subject.save();
      }
      subjects.in(auctionID).emit('over');
    });
  });
}

function bumpPrice(auctionID) {
  Auction.findOne({_id: auctionID}, function(err, auction) {
    var lastPrice = auction.price;
    auction.price += auction.increment;
    auction.save(function(err) {
      updateDropouts(auctionID, function(err) {
        if(err) { console.log('Error updating drop outs', err, auctionID); }
        updateStayIns(auctionID, lastPrice, function(err){
          if(err) { console.log('Error updating stay ins', err, auctionID); }
          subjects.in(auctionID).emit('price', auction.price);
        });
      });
    });
  });
}

var observers = sio.of('/observers').on('connection', function(socket) {
});
