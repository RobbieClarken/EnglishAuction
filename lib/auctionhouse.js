module.exports.bidder = bidder;
module.exports.auction = auction;

var DROPOUT = 1;
var BID = 2;

function bidder(id, auction, price, droppedOut) {
  var self = this;
  self.id = id;
  self.price = price;
  self.droppedOut = droppedOut;
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

  return self;
}

function auction(options) {
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
    var newBidder = bidder(id, self, price, droppedOut);
    self.bidders.push(newBidder);
    return newBidder;
  };

  function forEachBidder(callback) {
    Object.keys(self.bidders).forEach(function(bidderID) {
      callback(self.bidders[bidderID]);
    });
  }

  function forEachBidderInRound(callback) {
    Object.keys(self.biddersInRound).forEach(function(key) {
      callback(self.biddersInRound[key]);
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
        self.biddersInRound.push(bidder);
      }
    });
  }

  self.status = function() {
    var status = {};
    forEachBidder(function(bidder) {
      status[bidder.id] = {
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
        if(bidder.roundChoice === BID) {
          remaining += 1;
        }
      }
    });
    if (allHaveChosen) {
      if (remaining === 0) {
        // Everyone dropped out at once - pick a winner at random
        var winnerKey = Math.floor(self.biddersInRound.length*Math.random());
        self.biddersInRound[winnerKey].won = true;
        forEachBidder(function(bidder) {
          bidder.auctionEnded();
        });
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
          bidder.auctionEnded();
        });
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
