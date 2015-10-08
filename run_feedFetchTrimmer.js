#! /usr/bin/env node

var fs = require('fs');
// var async = require('async'); // asyncjs for async stuff
var feedFetchTrimmer = require('./feedFetchTrimmer.js');
// process.setMaxListeners(0);
fs.readFile('./feeds.json', 'utf8', function(err, data) {
  'use strict';
  var FeedsJson = JSON.parse(data);
  var urls = [];
  for (var j = 0; j < FeedsJson.blogs.length; j++) {
    urls.push(FeedsJson.blogs[j].url);
  }
  // console.log(urls);
  if (err) {
    throw err;
  }
  // Feeds = JSON.parse(data);
  // var feed = Feeds.some;
  var callback = function(e) {
    if (e) {
      console.log(e);
      return;
    }
    console.log('something\'s odd, you expected an error but did not get one!');
  };
  for (var i = 0; i < urls.length; i++) {
      feedFetchTrimmer(urls[i], callback);
  }
});
