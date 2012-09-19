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
      return res.redirect('/login');
    }
    req.subject = subject;
    var auctionID = subject.auctionID;
    // If already assigned to an auction, skip the wait page
    var page = routes.pages[subject.pageIndex];
    if(auctionID && page === 'wait') {
      subject.pageIndex += 1;
      subject.save();
    }
    if(subject.droppedOut && page === 'auction') {
      subject.pageIndex += 1;
      subject.save();
    }
    auctionHouse.Auction.findOne({'_id': auctionID}, function(err, auction) {
      req.auction = auction;
      res.cookie('auctionID', auctionID, { maxAge: 36000000, httpOnly: true });
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

function joinAuction(client, auctionID) {
  client.join(auctionID);
  client.get('subjectID', function(err, subjectID) {
    auctionHouse.Subject.findOneAndUpdate({_id: subjectID}, {auctionID: auctionID}, function(err) {
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
      var auction = new auctionHouse.Auction({
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
  auctionHouse.Subject.update(
    {auctionID: auctionID, roundChoice: 'drop out'},
    {droppedOut: true, roundChoice: null},
    {multi: true},
    callback
  );
}

function updateStayIns(auctionID, price, callback) {
  auctionHouse.Subject.update(
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
      auctionHouse.Subject.findOneAndUpdate({_id: subjectID}, {roundChoice: data.choice}, function(err) {
        console.log('Decision saved:', err, auctionID);
        auctionHouse.Subject.findOne({auctionID: auctionID, roundChoice: null, droppedOut: false}, function(err, result) {
          if(!result) {
            // Everyone has decided
            auctionHouse.Subject.find({auctionID: auctionID, roundChoice: 'stay in', droppedOut: false}, function(err, results) {
              if(results.length === 0) {
                // All bidders dropped out at the same price
                auctionHouse.Subject.find({auctionID: auctionID, roundChoice: 'drop out', droppedOut: false}, function(err, results) {
                  var winnerIndex = Math.floor(Math.random()*results.length);
                  endAuction(auctionID, results[winnerIndex], null);
                });
              } else if(results.length === 1) {
                auctionHouse.Auction.findOne({_id: auctionID}, function(err, auction) {
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
  console.log(winner);
  winner.save(function(err) {
    auctionHouse.Subject.find({auctionID: auctionID, droppedOut: false}, function(err, results) {
      for(subjectIndex in results) {
        var subject = results[subjectIndex];
        subject.pageIndex += 1;
        subject.save();
      }
      subjects.in(auctionID).emit('over');
    });
  });
}

function bumpPrice(auctionID) {
  auctionHouse.Auction.findOne({_id: auctionID}, function(err, auction) {
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
