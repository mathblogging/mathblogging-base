#! /usr/bin/env node

var fs = require('fs');
 var async = require('async'); // asyncjs for async stuff
var feedFetchTrimmer = require('../lib/feedFetchTrimmer.js');
// process.setMaxListeners(0);
fs.readFile('../data/feeds.json', 'utf8', function(err, data) {
  'use strict';
  var q = async.queue(feedFetchTrimmer, 5);
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
//  var callback = function(e) {
//    if (e) {
//      console.log(e);
//      return;
//    }
//    console.log('something\'s odd, you expected an error but did not get one!');
//  };
  q.drain = function() {
    console.log('all items have been processed');
  };
  q.push(urls, function(error, warning) {
    if (error) {
      console.log(error);
    }
    if (warning) {console.log(warning); }
    //console.log('finished processing item');
  });
//  for (var i = 0; i < urls.length; i++) {
//      feedFetchTrimmer(urls[i], callback);
//  }
});