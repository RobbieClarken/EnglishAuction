var mongoose = require('mongoose');

var auctionSchema = new mongoose.Schema({
  startTime: {type: Date, default: Date.now},
  increment: {type: Number, required: true},
  groupSize: {type: Number, required: true},
  ended:     {type: Boolean, default: false},
  price:     {type: Number, default: 0},
  bidders:   {type: Array, default: []}
});

module.exports = mongoose.model('Auction', auctionSchema);


/*
auctionSchema.methods.bidReceived = function(callback) {
  var numberOfBidders = this.bidders.length;
  var allHaveChosen = true;
  for(var bN = 0; bN < numberOfBidders; bN += 1) {
    var bidderId = this.bidders[bN];
  }
};
*/
