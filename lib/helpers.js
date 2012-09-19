exports.groupsForAuctions = function(subjectCount, groupSize) {
  var subjects = []
    , groups = []
    , group = []
    , i;
  for(i = 0; i < subjectCount; i += 1) {
    subjects.push(i);
  }

  while(subjects.length) {
    i = Math.floor(Math.random()*subjects.length);
    group.push(subjects[i]);
    if(group.length === groupSize) {
      groups.push(group);
      group = [];
    }
    subjects = subjects.slice(0,i).concat(subjects.slice(i+1));
  }
  if(group.length) {
    groups.push(group);
  }
  return groups;
};
