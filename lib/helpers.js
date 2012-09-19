exports.arrayOfGroups = function(subjectCount, groupSize) {
  var groups = [];
  var groupNumber = 0;
  var numberInGroup = 0;
  for(var i = 0; i < subjectCount; i += 1) {
    groups.push(groupNumber);
    numberInGroup += 1;
    if(numberInGroup >= groupSize) {
      groupNumber += 1;
      numberInGroup = 0;
    }
  }
  return groups;
};

exports.permute = function(arr) {
  var permutatedArray = [];
  var i;
  while(arr.length) {
    i = Math.floor(Math.random()*arr.length);
    permutatedArray.push(arr[i]);
    arr = arr.slice(0,i).concat(arr.slice(i+1));
  }
  return permutatedArray;
};