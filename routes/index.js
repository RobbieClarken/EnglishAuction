exports.index = function(req, res){
  res.render('auction', {
    page: 'auction',
    title: 'Experiment',
    objectName: 'Chocolate Bar',
    price: 0
  });
};

exports.login = function(req, res, data){
  var failedLogin = data.failedLogin ? true : false;
  res.render('login', {title: 'Experiment', failedLogin: failedLogin});
};

exports.admin = function(req, res){
  var data = {
    layout: false,
    title: 'English Auction Admin',
    startTime: null,
    subjectCount: 0,
    groupSize: 999,
    increment: 666 
  };
  res.render('admin', data);
};
