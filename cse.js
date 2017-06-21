var fs = require('fs');
fs.readdir('./feeds/',function(err,files){
    if(err) throw err;
    files.forEach(function(file){
      fs.readFile('./feeds/'+file, 'utf8', function(err, data) {
        'use strict';
        if (err) {
          console.log(err);
        }
        // console.log(data);
        var matches = /<link>(.*)<\/link>/.exec(data);
        // console.log(matches);
        if(matches && matches[1] !== 'http://github.com/dylang/node-rss') {
          console.log(matches[1]);
        }
      });
    });
 });
