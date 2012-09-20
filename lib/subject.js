var mongoose = require('mongoose');

var DROPOUT = 1;
var BID = 2;

/* How to link with auction! */
var subjectSchema = new mongoose.Schema({
  sessionID:      {type: String,  default: null},
  auctionID:      {type: String,  default: null},
  group:          {type: Number,  default: null},
  startTime:      {type: Date,    default: Date.now},
  pageIndex:      {type: Number,  default: 0},
  price:          {type: Number,  default: 0},
  droppedOut:     {type: Boolean, default: false},
  won:            {type: Boolean, default: false},
  roundChoice:    {type: String,  default: null},
  pageIndex:      {type: Number,  default: 0},
  tableCount:     {type: Number,  default: 0},
  tablesCorrect:  {type: Number,  default: 0},
  tryNumber:      {type: Number,  default: 1}
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
