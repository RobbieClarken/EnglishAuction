var auctionHouse = require('../lib/auctionhouse')
  , should = require('should');

var options = {
  id: 1,
  increment: 10,
  groupSize: 3
};

var auction = new auctionHouse.Auction(options);
var bidders = [];
var price = 0;

describe('example auction', function() {
  it('should make three bidders', function(done) {
    for(var i = 0; i < 3; i += 1) {
      var bidder = auction.addBidder(i);
      bidder.should.be.a('object');
      bidders.push(bidder);
    }
    done();
  });
  it('should not be able to add another bidder', function(done) {
    var bidder = auction.addBidder('x');
    bidder.should.not.be.a('object');
    auction.start();
    done();
  });
  it('price should be zero', function(done) {
    auction.price.should.equal(0);
    for(var i = 0; i < 3; i += 1) {
      var bidder = auctionHouse.bidders[String(i)];
      bidder.price.should.equal(0);
      bidder.droppedOut.should.equal(false);
      bidder.should.have.property('roundChoice',null);
    }
    done();
  });
  it('bidder 0 bids', function(done) {
    var bidder = auctionHouse.bidders['0'];
    bidder.bid();

    auction.price.should.equal(0);

    bidder.price.should.equal(0);
    bidder.droppedOut.should.equal(false);
    bidder.should.have.property('roundChoice',2);
    for(var i = 1; i < 3; i += 1) {
      var bidder = auctionHouse.bidders[String(i)];
      bidder.price.should.equal(0);
      bidder.droppedOut.should.equal(false);
      bidder.should.have.property('roundChoice',null);
    }
    done();
  });
  it('bidder 1 bids', function(done) {
    var bidder = auctionHouse.bidders['1'];
    bidder.bid();

    auction.price.should.equal(0);

    bidder.price.should.equal(0);
    bidder.droppedOut.should.equal(false);
    bidder.should.have.property('roundChoice',2);
    for(var i = 2; i < 3; i += 1) {
      var bidder = auctionHouse.bidders[String(i)];
      bidder.price.should.equal(0);
      bidder.droppedOut.should.equal(false);
      bidder.should.have.property('roundChoice',null);
    }
    done();
  });
  it('bidder 2 bids', function(done) {
    var bidder = auctionHouse.bidders['2'];
    bidder.bid();

    price += options.increment;
    // Price is now 10

    auction.price.should.equal(price);

    for(var i = 0; i < 3; i += 1) {
      var bidder = auctionHouse.bidders[String(i)];
      bidder.price.should.equal(price);
      bidder.droppedOut.should.equal(false);
      bidder.should.have.property('roundChoice',null);
    }
    done();
  });
  it('bidder 0 bids', function(done) {
    var bidder = auctionHouse.bidders['0'];
    bidder.bid();

    auction.price.should.equal(price);

    bidder.price.should.equal(price);
    bidder.droppedOut.should.equal(false);
    bidder.should.have.property('roundChoice',2);
    for(var i = 1; i < 3; i += 1) {
      var bidder = auctionHouse.bidders[String(i)];
      bidder.price.should.equal(price);
      bidder.droppedOut.should.equal(false);
      bidder.should.have.property('roundChoice',null);
    }
    done();
  });
  it('bidder 1 bids', function(done) {
    var bidder = auctionHouse.bidders['1'];
    bidder.bid();

    auction.price.should.equal(price);

    bidder.price.should.equal(price);
    bidder.droppedOut.should.equal(false);
    bidder.should.have.property('roundChoice',2);
    for(var i = 2; i < 3; i += 1) {
      var bidder = auctionHouse.bidders[String(i)];
      bidder.price.should.equal(price);
      bidder.droppedOut.should.equal(false);
      bidder.should.have.property('roundChoice',null);
    }
    done();
  });
  it('bidder 2 bids', function(done) {
    var bidder = auctionHouse.bidders['2'];
    bidder.bid();

    price += options.increment;
    // Price is now 20

    auction.price.should.equal(price);

    for(var i = 0; i < 3; i += 1) {
      var bidder = auctionHouse.bidders[String(i)];
      bidder.price.should.equal(price);
      bidder.droppedOut.should.equal(false);
      bidder.should.have.property('roundChoice',null);
    }
    done();
  });
  it('bidder 0 bids', function(done) {
    var bidder = auctionHouse.bidders['0'];
    bidder.bid();

    auction.price.should.equal(price);

    bidder.price.should.equal(price);
    bidder.droppedOut.should.equal(false);
    bidder.should.have.property('roundChoice',2);
    for(var i = 1; i < 3; i += 1) {
      var bidder = auctionHouse.bidders[String(i)];
      bidder.price.should.equal(price);
      bidder.droppedOut.should.equal(false);
      bidder.should.have.property('roundChoice',null);
    }
    done();
  });
  it('bidder 1 drops out', function(done) {
    var bidder = auctionHouse.bidders['1'];
    bidder.dropOut();

    auction.price.should.equal(price);

    bidder.price.should.equal(price);
    bidder.droppedOut.should.equal(false);
    bidder.should.have.property('roundChoice',1);
    for(var i = 2; i < 3; i += 1) {
      var bidder = auctionHouse.bidders[String(i)];
      bidder.price.should.equal(price);
      bidder.droppedOut.should.equal(false);
      bidder.should.have.property('roundChoice',null);
    }
    done();
  });
  it('bidder 2 bids', function(done) {
    var bidder = auctionHouse.bidders['2'];
    bidder.bid();

    price += options.increment;
    // Price is now 30
    var bidder = auctionHouse.bidders['1'];
    bidder.price.should.equal(20);
    bidder.droppedOut.should.equal(true);
    bidder.should.have.property('roundChoice',null);

    auction.price.should.equal(price);
    for(var i = 0; i < 3; i += 2) {
      var bidder = auctionHouse.bidders[String(i)];
      bidder.price.should.equal(price);
      bidder.droppedOut.should.equal(false);
      bidder.should.have.property('roundChoice',null);
    }
    done();
  });
  it('bidder 0 bids', function(done) {
    var bidder = auctionHouse.bidders['0'];
    bidder.bid();
    auction.price.should.equal(price);

    bidder = auctionHouse.bidders['0'];
    bidder.price.should.equal(price);
    bidder.droppedOut.should.equal(false);
    bidder.should.have.property('roundChoice',2);

    bidder = auctionHouse.bidders['1'];
    bidder.price.should.equal(20);
    bidder.droppedOut.should.equal(true);
    bidder.should.have.property('roundChoice',null);

    bidder = auctionHouse.bidders['2'];
    bidder.price.should.equal(price);
    bidder.droppedOut.should.equal(false);
    bidder.should.have.property('roundChoice',null);

    done();
  });
  it('bidder 2 bids', function(done) {
    var bidder = auctionHouse.bidders['2'];
    bidder.bid();

    price += options.increment;

    auction.price.should.equal(price);

    bidder = auctionHouse.bidders['0'];
    bidder.price.should.equal(price);
    bidder.droppedOut.should.equal(false);
    bidder.should.have.property('roundChoice',null);

    bidder = auctionHouse.bidders['1'];
    bidder.price.should.equal(20);
    bidder.droppedOut.should.equal(true);
    bidder.should.have.property('roundChoice',null);

    bidder = auctionHouse.bidders['2'];
    bidder.price.should.equal(price);
    bidder.droppedOut.should.equal(false);
    bidder.should.have.property('roundChoice',null);

    done();
  });
  it('bidder 0 drops out', function(done) {
    var bidder = auctionHouse.bidders['0'];
    bidder.dropOut();
    auction.price.should.equal(price);

    bidder = auctionHouse.bidders['0'];
    bidder.price.should.equal(price);
    bidder.droppedOut.should.equal(false);
    bidder.should.have.property('roundChoice',1);

    bidder = auctionHouse.bidders['1'];
    bidder.price.should.equal(20);
    bidder.droppedOut.should.equal(true);
    bidder.should.have.property('roundChoice',null);

    bidder = auctionHouse.bidders['2'];
    bidder.price.should.equal(price);
    bidder.droppedOut.should.equal(false);
    bidder.should.have.property('roundChoice',null);

    done();
  });
  it('bidder 2 drops out', function(done) {
    var bidder = auctionHouse.bidders['2'];

    bidder.bid();
    auction.price.should.equal(price);

    bidder = auctionHouse.bidders['0'];
    bidder.price.should.equal(price);
    bidder.droppedOut.should.equal(true);
    bidder.won.should.equal(false);

    bidder = auctionHouse.bidders['1'];
    bidder.price.should.equal(20);
    bidder.droppedOut.should.equal(true);
    bidder.won.should.equal(false);

    bidder = auctionHouse.bidders['2'];
    bidder.price.should.equal(price);
    bidder.droppedOut.should.equal(false);
    bidder.won.should.equal(true);

    done();
  });
});
