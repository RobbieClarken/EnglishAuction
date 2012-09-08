var mysql = require('mysql');

var settings = {
  subjectCount: 0,
  sessionID: null,
  startTime: null,
  increment: null,
  groupSize: null
};

var db = mysql.createConnection({
  /*host: 'monlee.monash.edu',*/
  host: 'elab.me',
  user: 'anmolratan',
  password: 'monashecon',
  database: 'english_auction',
  insecureAuth: true
});

db.connect(function(err) {
  if(!err) {
    console.log('MySQL connection established.');

    db.query('SELECT * FROM sessions ORDER BY sessionID DESC LIMIT 1', function(err, result) {
      if(err) {
        console.log('Error loading last session.', err);
      } else {
        if(result.length) {
          var row = result[0];
          settings.sessionID = row.sessionID;
          settings.startTime = row.startTime;
          settings.increment = row.increment;
          settings.groupSize = row.groupSize;
        }
      }
    });
  } else {
    console.log('MySQL error!', err);
    process.exit(1);
  }
});

function updateSettings(fields, callback) {
  var query = db.query('INSERT INTO sessions SET ?', fields, function(err, result) {
    if(err) {
      console.log('Error adding new session', err, fields);
    } else {
      console.log('Added new session.');
      settings.sessionID = result.insertId;
      settings.increment = fields.increment;
      settings.groupSize = fields.groupSize;
    }
    console.log(JSON.stringify(settings));
    callback(err);
  });
}

function getSubjectData(subjectID, callback) {
    db.query('SELECT * FROM subjects WHERE subjectID = "'+connection.escape(subjectID)+'" LIMIT 1', function(err, result) {
      var data = {};
      if(!err) {
        if(result.length) {
          var row = result[0];
          data.sessionID = row.sessionID;
          data.price = row.price;
          data.droppedOut = row.droppedOut;
        } else {
          err = new Error('Could not find subject.');
        }
      }
      callback(err, data);
    });
}

module.exports.settings = settings;
module.exports.updateSettings = updateSettings;
module.exports.getSubjectData = getSubjectData;

