exports.index = function(req, res){
  if(req.session.id) {
    var page = 'auction';

    res.render(page, {
      page: 'auction',
      title: 'Experiment',
      objectName: 'Chocolate Bar',
      price: 0
    });
  } else {
    exports.login(req, res);
  }
};

exports.login = function(req, res, data){
  var failedLogin = false;
  if(data) {
    failedLogin = data.failedLogin ? true : false;
  }
  res.render('login', {title: 'Experiment', failedLogin: failedLogin});
};

exports.admin = function(req, res, settings){
  var data = {
    layout: false,
    title: 'English Auction Admin',
    startTime: null,
    subjectCount: settings.subjectCount,
    groupSize: settings.groupSize,
    increment: settings.increment 
  };
  res.render('admin', data);
};
