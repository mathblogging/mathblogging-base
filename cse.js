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
        try{console.log(matches[1]);}
        catch(e){}
      });
    });
 });
