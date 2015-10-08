/* eslint-env node */

var FeedParser = require('feedparser'); // to parse feeds
// var Feed = require('feed'); // to write feeds (but not necessary to require here because we should get a Feed object from app.js -- which seems wrong)
var async = require('async');
// var request = require('request'); // TODO let's abstract this so that we can switch it out (e.g., to fs.readFile )
var fs = require('fs');

exports.feedmerger = function(feedsJson, feedObject, mergedCallback) {
  'use strict';
  // TODO some error handling; checking the arguments etc.

  var getFeed = function(feed, callback) {
    var feedparser = new FeedParser();
    try {
      fs.accessSync(feed);
      var req = fs.createReadStream(feed); // request(feed);
    }
    catch (e){
      console.log('File for ' + feed + ' was not accessible');
      callback();
      return;
    }
    req.on('error', function(error) {
        console.error(error);
    });
    req.on('readable', function() {
      var stream = this;
      stream.pipe(feedparser);
    });
    // req.on('response', function(res) {
    //   var stream = this;
    //   if (res.statusCode !== 200) {
    //     return this.emit('error', new Error('Bad status code'));
    //   }
    //   //    stream.pipe(process.stdout); //works
    //   stream.pipe(feedparser);
    // });
    feedparser.on('error', function(error) {
      console.error(feed + ' as a parsing error' + error);
    });
    feedparser.on('readable', function() {
      // This is where the action is!
      var stream = this;
      //    var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
      var item;
      while ( (item = stream.read())) {
        var itemOptions = {
          date: item.date,
          title: item.title,
          url: item.link,
          guid: item.guid || item.permalink || '',
          description: '',
          author: stream.meta.title
        };
        // console.log(itemOptions);
        feedObject.item(itemOptions);
      }
    });
    feedparser.on('finish', function() {
      callback();
    });
  };

  //  console.log(feedsJson);
  async.each(feedsJson, getFeed, function(err) {
    if (err) {
      console.log(err);
    }
    feedObject.items.sort(function(a, b) { //sort by date for creating pages later
      return b.date - a.date;
    });
    //   console.log("feedmerger completed!");
    //     console.log(feedObject.render('atom-1.0'));
    return mergedCallback(feedObject);
  });
};


//    exports.feedmerger = new feedmerger();
