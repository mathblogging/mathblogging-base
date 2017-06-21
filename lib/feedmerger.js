const FeedParser = require('feedparser'); // to parse feeds
const async = require('async');
const fs = require('fs');

const sortFeedByDate = require('./helpers.js').sortFeedByDate;

exports.feedmerger = function(feedsJson, feedObject, mergedCallback) {
  let guids = []; // store GUIDs to check against (to avoid duplicates)
  const getFeed = function(feed, callback) {
    const feedparser = new FeedParser();
    try {
      fs.accessSync(feed);
    }
    catch (e){
      console.log('File for ' + feed + ' was not accessible');
      callback();
      return;
    }
    const req = fs.createReadStream(feed);
    req.on('error', function(error) {
        console.error(error);
    });
    req.on('readable', function() {
      this.pipe(feedparser);
    });

    feedparser.on('error', function(error) {
      console.error(feed + ' as a parsing error' + error);
    });
    feedparser.on('readable', function() {
      // This is where the action is!
      const stream = this;
      let item;
      while ( (item = stream.read())) {
        const itemGuid = item.guid || item.permalink;
        if (guids.indexOf(itemGuid) === -1) {
          guids.push(itemGuid);
          const itemOptions = {
            date: item.date,
            title: item.title,
            url: encodeURI(item.link),
            guid: itemGuid || '',
            description: '',
            author: stream.meta.title
          };
          feedObject.item(itemOptions);
        }
      }
    });
    feedparser.on('finish', function() {
      callback();
    });
  };

  async.eachLimit(feedsJson, 10, getFeed, function(err) {
    if (err) {
      throw err;
    }
    feedObject.items.sort(sortFeedByDate);
    return mergedCallback(feedObject);
  });
};
