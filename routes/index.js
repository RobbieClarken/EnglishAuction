
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'English Auction' });
};

exports.admin = function(req, res){
  res.render('admin', { title: 'English Auction Admin' });
};
