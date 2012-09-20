var pages = require('./pages');

exports.pages = pages;

exports.index = function(req, res){
    var page = pages[req.subject.pageIndex];
    var previous = page.previous || false;
    var next = page.next || false;
    var price = req.auction ? req.auction.price : null;
    res.render(page.title, {
      layout: 'subject_screen_layout',
      page: 'auction',
      title: 'Experiment',
      objectName: 'Chocolate Bar',
      price: price,
      subjectPrice: req.subject.price,
      roundChoice: req.subject.roundChoice,
      won: req.subject.won,
      showupFee: req.settings.showupFee,
      screenNumber: req.subject.pageIndex+1,
      subjectID: req.subject.id,
      previous: previous,
      next: next,
      paymentPerTable: 50,
      tableCount: req.subject.tableCount,
      tablesCorrect: req.subject.tablesCorrect,
      tryNumber: req.subject.tryNumber
    });
};

exports.login = function(req, res){
  var failedLogin = req.failedLogin || false;
  res.render(
    'login',
    {
      layout: false,
      title: 'Experiment',
      failedLogin: failedLogin
    }
  );
};

exports.admin = function(req, res){
  var settings = req.settings;
  var data = {
    layout: false,
    title: 'English Auction Admin',
    startTime: settings.startTime,
    subjectCount: req.info.subjectCount,
    groupSize: settings.groupSize,
    increment: settings.increment,
    showupFee: settings.showupFee,
    groupsAssigned: settings.groupsAssigned
  };
  res.render('admin', data);
};
