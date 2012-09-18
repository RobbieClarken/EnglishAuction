var pages = [
  'wait',
  'auction'
];

exports.index = function(req, res){
    var page = pages[req.subject.pageIndex];
    var price = req.auction ? req.auction.price : null;
    res.render(page, {
      page: 'auction',
      title: 'Experiment',
      objectName: 'Chocolate Bar',
      price: price
    });
};

exports.login = function(req, res){
  var failedLogin = req.failedLogin || false;
  res.render('login', {title: 'Experiment', failedLogin: failedLogin});
};

exports.admin = function(req, res){
  console.log(req.settings);
  console.log(req.info);
  var settings = req.settings;
  var data = {
    layout: false,
    title: 'English Auction Admin',
    startTime: null,
    subjectCount: req.info.subjectCount,
    groupSize: settings.groupSize,
    increment: settings.increment,
    showupFee: settings.showupFee
  };
  res.render('admin', data);
};
