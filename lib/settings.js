var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  startTime:      {type: Date, default: Date.now},
  groupSize:      {type: Number, default: 3},
  increment:      {type: Number, default: 5},
  showupFee:      {type: Number, default: 10},
  groupsAssigned: {type: Boolean, default: false}
});

module.exports = mongoose.model('Settings', schema);
