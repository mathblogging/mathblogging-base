#! /usr/bin/env node

var FeedParser = require('feedparser'); // to parse feeds
// var Feed = require('feed'); // to write feeds (but not necessary to require here because we should get a Feed object from app.js -- which seems wrong)
var async = require('async');
var request = require('request'); // TODO let's abstract this so that we can switch it out (e.g., to fs.readFile )

exports.feedmerger = function (feedsArray, feedObject, mergedCallback) {
  // TODO some error handling; checking the arguments etc.

  var getFeed = function (feed, callback) {
    var req = request(feed);
    var feedparser = new FeedParser();
    req.on('error', function (error) {
      console.error(error);
    });
    req.on('response', function (res) {
      var stream = this;
      if (res.statusCode != 200) {
        return this.emit('error', new Error('Bad status code'));
      }
      //    stream.pipe(process.stdout); //works
      stream.pipe(feedparser);
    });
    feedparser.on('error', function (error) {
      console.error(error);
    });
    feedparser.on('readable', function () {
      // This is where the action is!
      var stream = this;
      //    var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
      var item;
      while (item = stream.read()) {
        var itemTitle = item['rss:title']['#']; // how to make it "or use item['atom:title']['#']" ??
        var itemLink = item.link;
        var itemDescription = item.description;
        var itemDate = item.date;
        var itemAuthor = item.author;
//        console.error(typeof itemAuthor);
        feedObject.addItem({
          title: itemTitle,
          link: itemLink,
          description: itemDescription,
          date: itemDate,
          author: itemAuthor
        });
      }
    });
    feedparser.on('finish', function () {
      callback();
    });
  };

//  console.log(feedsArray);
  async.each(feedsArray, getFeed, function (err) {
    if (err) {
      throw err;
    }
    feedObject.items.sort(function (a, b) { //sort by date for creating pages later
      return b.date - a.date;
    });
//   console.log("feedmerger completed!");
//     console.log(feedObject.render('atom-1.0'));
   return mergedCallback(null,feedObject);
  });
};


//    exports.feedmerger = new feedmerger();