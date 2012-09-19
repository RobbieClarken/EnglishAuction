var helpers = require('../lib/helpers')
  , should = require('should');

describe('arrayOfGroups', function() {
  it('should return an empty array for no subjects', function() {
    var groups = helpers.arrayOfGroups(0,3);
    groups.should.eql([]);
  });
  it('should minimise the number of unfilled groups', function() {
    var groups = helpers.arrayOfGroups(11,3);
    groups.should.eql([0,0,0,1,1,1,2,2,2,3,3]);
  });
  it('one more for good measure', function() {
    var groups = helpers.arrayOfGroups(5,2);
    groups.should.eql([0,0,1,1,2]);
  });
});

var initArray;
var finalArray;

describe('permute', function() {
  it('should return an empty array given an empty array', function() {
    initArray = [];
    finalArray = helpers.permute(initArray);
    finalArray.should.eql([]);
  });
  it('should not effect the original array', function(done) {
    initArray = [0,4,3];
    finalArray = helpers.permute(initArray);
    initArray.should.eql([0,4,3]);
    done();
  });
  it('should not return array with same number of elements', function() {
    finalArray.should.have.lengthOf(3);
  });
  it('should not return the same array (in general)', function() {
    initArray = [0,4,3,1,5,1,2,5,6,1,2,9];
    finalArray = helpers.permute(initArray);
    finalArray.should.not.eql(initArray);
  });
});

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
