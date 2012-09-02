var auctionHouse = require('../lib/auctionhouse')
  , should = require('should');

var options = {
  id: 1,
  increment: 10,
  groupSize: 3
};

var auction = new auctionHouse.Auction(options);

describe('Auction', function() {
  it('should have: id, startTime, increment, groupSize, ended, price, bidders', function() {
    auction.should.have.property('id', options.id);
    auction.should.have.property('startTime', null);
    auction.should.have.property('groupSize', options.groupSize);
    auction.should.have.property('ended', false);
    auction.should.have.property('price', 0);
    auction.should.have.property('bidders');
  });
  it('#bidders should be empty', function(done) {
    auction.bidders.should.be.empty;
    done();
  });
});
