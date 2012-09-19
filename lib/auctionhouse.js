var mongoose = require('mongoose')
  , EventEmitter = require('events').EventEmitter;

var db = mongoose.connect('mongodb://localhost/test');

// Create objects in mongoose
require('./settings');
require('./subject');
require('./auction');

var Settings = db.model('Settings')
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

function newAuction() {
  var options = {
    id: JSON.stringify(new Date()),
    increment: settings.increment,
    groupSize: settings.groupSize
  };
  auctions[id] = new auctionHouse.Auction(options);
  return auctions[id];
}

function newSubject(callback) {
  var err = null;
  var subject = new Subject();
  subject.save();
  subjects[subject.id] = subjects;
  callback(err, subject.id);
}

module.exports.setSettings = function(fields, callback) {
  Object.keys(fields).forEach(function(key) {
    settings[key] = fields[key];
  });
  settings.save(callback);
};

module.exports.Subject = Subject;
module.exports.Auction = Auction;
module.exports.getSettings = function() { return settings; };
module.exports.newSubject = newSubject;
module.exports.newAuction = newAuction;
module.exports.subjects = subjects;
module.exports.auctions = auctions;

/*
var me = new Subject();
console.log(me);
me.save(function(err) {
  console.log(err);
});
*/
/*
module.exports.Bidder = Bidder;
module.exports.Auction = Auction;
var bidders = module.exports.bidders = {};

var DROPOUT = 1;
var BID = 2;

function Bidder(id, auction, price, droppedOut) {
  var self = this;
  self.id = id;
  self.price = price ? price : 0;
  self.droppedOut = droppedOut ? droppedOut : false;
  self.auction = auction;
  self.roundChoice = null;
  self.won = false;

  self.dropOut = function() {
    self.roundChoice = DROPOUT;
    self.auction.bidderChose(self);
  };

  self.bid = function() {
    self.roundChoice = BID;
    self.auction.bidderChose(self);
  };

  self.auctionEnded = function() {
    //TODO: Send ended
    console.log('ENDED!!!');
    self.emit('auction ended', self.id);
  };

  bidders[id] = self;
  return self;
}


function Auction(options) {
  var self = this;

  self.id = options.id;
  self.startTime = options.startTime ? options.startTime : null;
  self.increment = options.increment;
  self.groupSize = options.groupSize;
  self.ended = options.ended ? options.ended : false;
  self.price = options.price ? options.price : 0;
  self.bidders = [];
  self.biddersInRound = [];

  self.addBidder = function(id, price, droppedOut) {
    if (self.bidders.length < self.groupSize) {
      var newBidder = new Bidder(id, self, price, droppedOut);
      self.bidders.push(id);
      return newBidder;
    } else {
      return false;
    }
  };

  function forEachBidder(callback) {
    Object.keys(self.bidders).forEach(function(key) {
      callback(bidders[self.bidders[key]]);
    });
  }

  function forEachBidderInRound(callback) {
    Object.keys(self.biddersInRound).forEach(function(key) {
      callback(bidders[self.biddersInRound[key]]);
    });
  }

  self.start = function() {
    self.startTime = new Date();
    startRound();
  };

  function startRound() {
    self.biddersInRound = [];
    forEachBidder(function(bidder) {
      if(!bidder.droppedOut) {
        self.biddersInRound.push(bidder.id);
      }
    });
    self.emit('start round');
  }

  self.status = function() {
    var status = {};
    forEachBidder(function(bidder) {
      status[bidder.id] = {
        roundChoice: bidder.roundChoice,
        droppedOut: bidder.droppedOut,
        price: bidder.price
      };
    });
    return status;
  };

  self.bidderChose = function(bidder) {
    var allHaveChosen = true;
    var remaining = 0;
    forEachBidderInRound(function(bidder) {
      if(!bidder.roundChoice) {
        allHaveChosen = false;
      }
      if(bidder.roundChoice === BID) {
        remaining += 1;
      }
    });
    if (allHaveChosen) {
      if (remaining === 0) {
        // Everyone dropped out at once - pick a winner at random
        var winnerKey = Math.floor(self.biddersInRound.length*Math.random());
        self.biddersInRound[winnerKey].won = true;
        //forEachBidder(function(bidder) {
        //  bidder.auctionEnded();
        //});
        self.emit('ended', self.id);
      } else if (remaining === 1) {
        // We have a clear winner!
        forEachBidder(function(bidder) {
          if (!bidder.droppedOut) {
            if (bidder.roundChoice === BID) {
              bidder.won = true;
            } else {
              bidder.droppedOut = true;
            }
          }
          //bidder.auctionEnded();
        });
        self.emit('ended', self.id);
      } else {
        // Bump up price and start next round
        self.price += self.increment;
        forEachBidder(function(bidder) {
          if (!bidder.droppedOut) {
            if (bidder.roundChoice === BID) {
              bidder.price = self.price;
            } else {
              bidder.droppedOut = true;
            }
          }
          bidder.roundChoice = null;
        });
        startRound();
      }
    }
  };
  return self;
}
Auction.prototype = Object.create(EventEmitter.prototype);
*/
