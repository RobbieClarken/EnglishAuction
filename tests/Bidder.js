var bidderSchema = require('../lib/subject')
  , should = require('should')
  , mongoose = require('mongoose');

var options = {
  id: 1,
  increment: 10,
  groupSize: 3
};

var Bidder = mongoose.model('Bidder', bidderSchema); 

var bidder = new Bidder();

describe('Bidder', function() {
  /*
  it('should have auction property', function(done) {
    bidder = auction.addBidder('abc');
    bidder.auction.id.should.equal(1);
    done();
  });
  it('should be in bidders', function() {
    auctionHouse.bidders.should.have.property(bidder.id);
  });
  it('should be in auction.bidders', function() {
    auction.bidders.should.include(bidder.id);
  });
 */
  it('should have price equal to zero', function() {
    bidder.should.have.property('price', 0);
  });
  it('should not have dropped out', function() {
    bidder.should.have.property('droppedOut', false);
  });
  /*
  it('should emit event when auction is over', function(done) {
    bidder.on('auction ended', function(id) {
      bidder.id.should.equal('abc');
      done();
    });
    bidder.auctionEnded();
  });
 */
});
