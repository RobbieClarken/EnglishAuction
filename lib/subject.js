var mongoose = require('mongoose');

var DROPOUT = 1;
var BID = 2;

/* How to link with auction! */
var subjectSchema = new mongoose.Schema({
  sessionID:   {type: String,  default: null},
  group:       {type: Number,  default: null},
  startTime:   {type: Date,    default: Date.now},
  pageIndex:   {type: Number,  default: 0},
  price:       {type: Number,  default: 0},
  droppedOut:  {type: Boolean, default: false},
  won:         {type: Boolean, default: false},
  roundChoice: {type: Number,  default: null}
});

subjectSchema.methods.dropOut = function() {
  self.roundChoice = DROPOUT;
  //self.auction.bidderChose(self);
};

subjectSchema.methods.bid = function() {
  self.roundChoice = BID;
  //self.auction.bidderChose(self);
};

module.exports = mongoose.model('Subject', subjectSchema);