exports.index = function(req, res){
  res.render('auction', {
    page: 'auction',
    title: 'Experiment',
    objectName: 'Chocolate Bar',
    price: 0
  });
};

exports.admin = function(req, res){
  var data = {
    layout: false,
    title: 'English Auction Admin',
    startTime: new Date(),
    subjectCount: 0,
    groupSize: 999,
    increment: 666 
  };
  res.render('admin', data);
};
