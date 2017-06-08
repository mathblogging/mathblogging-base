/* eslint-env node */

var FeedParser = require('feedparser'); // to parse feeds
var got = require('got');
var Feed = require('rss'); // to write feeds (but not necessary to require here because we should get a Feed object from app.js -- which seems wrong)
var fs = require('fs');
var sanitize = require('sanitize-filename');

var feedFetchTrimmer = function(feedUrl, callback) {
  'use strict';
  // options for got

  var options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
      'accept': 'text/html,application/xhtml+xml'
    },
    timeout: 3000
  };

  var feedparser = new FeedParser();
  var feedObject = {};

  var stream = got.stream(feedUrl, options)

  stream.on('error', function(error){
    console.log( error.message + ' (FETCH)' + feedUrl);
  })

  stream.on('response', function(response){
    console.log(response.statusCode + ' ' + feedUrl);
  })

  stream.pipe(feedparser);

  feedparser.on('error', function(error){
    console.log(error + ' (PARSE)' + feedUrl);
  });
  feedparser.on('meta', function() {
    var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
    var feedOptions = {
      title: meta.title,
      description: meta.description,
      pubDate: meta.date,
      feed_url: meta.xmlurl,
      site_url: meta.link,
      // image: meta.image.url,
      copyright: meta.copyright,
      // feedObject.author.email = meta.author.email;
      // author.link: meta.author.link,
      author: meta.author
    };

    feedObject = new Feed(feedOptions);
  });
  feedparser.on('readable', function() {
    // console.log(feedUrl);
    // This is where the action is!
    var stream = this;

    var today = new Date();
    var cutoff = new Date(today.getTime() - 31 * 24 * 60 * 60 * 1000); // only posts from past 31 days (ignoring leap seconds etc.)
    var item;
    while ((item = stream.read())) {
      var itemDate = item.pubdate || item.date;
      // console.log(cutoff, itemDate, cutoff < itemDate);
      if ((cutoff < itemDate) && !(today < itemDate)) {
        var itemOptions = {
          date: itemDate,
          title: item.title,
          // HACK for issue #43
          url: item.link || item['atom:link']['@']['href'],
          description: null, // item.description || null
          author: item.author || null
        };
        feedObject.item(itemOptions);
      }
    }
  });
  feedparser.on('finish', function() {
    if (feedObject) {
      // console.log("YAY feedObject" + feedUrl);

      if (feedObject.items) {
        feedObject.items.sort(function(a, b) { //sort by date for creating pages later
          return b.date - a.date;
        });
        var xml = feedObject.xml({
          indent: true
        });
      }
      // console.log(xml);
      var filename = sanitize(feedUrl) + '.xml';
      // console.log(filename);
      fs.writeFile('./feeds/' + filename, xml, {mode:0o664}, function(err) {
        if (err) {
          console.log('feedFetchTrimmer: ' + feedUrl + ' : ' + err);
        }
        //callback();
        // console.log('SUCCESS: "' + filename + '" was saved!');
      });
    }
    else {console.log('OH NOES! no feedObject.items for ' + feedUrl);}
    callback()
  });
};

module.exports = feedFetchTrimmer;
