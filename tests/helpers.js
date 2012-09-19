var helpers = require('../lib/helpers')
  , should = require('should');

var groups;
describe('groupsForAuctions', function() {
  it('should return an array of length 4', function(done) {
    groups = helpers.groupsForAuctions(11,3); 
    groups.should.be.an.instanceOf(Array);
    groups.should.have.lengthOf(4);
    done();
  });
  it('should contain at least one array', function() {
    groups[0].should.be.an.instanceOf(Array);
  });
  it('should contain only non-empty arrays', function() {
    for(var g = 0; g < groups.length; g += 1) {
      groups[g].should.be.an.instanceOf(Array);
      groups[g].should.not.be.empty;
    }
  });
  it('groups should not have the same number twice', function() {
    var numbers = [];
    for(var g = 0; g < groups.length; g += 1) {
      numbers = numbers.concat(groups[g]);
    }
    numbers.should.have.lengthOf(11);
    for(var i = 0; i < 11; i += 1) {
      numbers.should.include(i);
    }
  });
});
