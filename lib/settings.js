var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  groupSize: {type: Number, default: 3},
  increment: {type: Number, default: 5},
  showupFee: {type: Number, default: 10}
});

module.exports = mongoose.model('Settings', schema);
