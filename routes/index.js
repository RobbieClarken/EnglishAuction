
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'English Auction' });
};

exports.admin = function(req, res){
  var data = {
    title: 'English Auction Admin',
    startTime: new Date(),
    subjectCount: 0,
    subjectsPerAuction: 999,
    increment: 666 
  };
  res.render('admin', data);
};
