var fs = require('fs');
fs.readFile('./feeds.csv', 'utf8', function(err, data) {
  'use strict';
  if (err) {
    throw err;
  }
  var lines = data.split('\n');
  var feedsJson = {
    blogs: []
  };
  for (var j = 0; j + 1 < lines.length; j++) {
    var cells = lines[j].split(',');
    var entry = {
      url: cells[0],
      categories: [cells[1], cells[2], cells[3]]
    };
    feedsJson.blogs.push(entry);
  }
  fs.writeFile('./feeds.json', JSON.stringify(feedsJson), function(e) {
    if (e) {
      throw e;
    }
  });
});
