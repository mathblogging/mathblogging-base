const fs = require('fs');
const path = require('path');
const FeedParser = require('feedparser'); // to parse feeds
const got = require('got');
const Feed = require('rss');
const sanitize = require('sanitize-filename');

const sortFeedByDate = require('./helpers.js').sortFeedByDate;

const feedFetchTrimmer = function(feedUrl, callback) {
  // options for got
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
      'accept': 'text/html,application/xhtml+xml'
    },
    timeout: 3000
  };

  const feedparser = new FeedParser();
  let feedObject = {};
  const stream = got.stream(feedUrl, options)

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
    const meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
    const feedOptions = {
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
    // This is where the action is!
    const stream = this;

    const today = new Date();
    const cutoff = new Date(today.getTime() - 31 * 24 * 60 * 60 * 1000); // only posts from past 31 days (ignoring leap seconds etc.)
    let item;
    while ((item = stream.read())) {
      const itemDate = item.pubdate || item.date;
      if ((cutoff < itemDate) && !(today < itemDate)) {
        const itemOptions = {
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
      let xml;
      if (feedObject.items) {
        feedObject.items.sort(sortFeedByDate);
        xml = feedObject.xml({
          indent: true
        });
      }
      const filename = sanitize(feedUrl) + '.xml';
      fs.writeFile(path.resolve(__dirname,'../feeds/', filename), xml, {mode:0o664}, function(err) {
        if (err) {
          console.log('feedFetchTrimmer: ' + feedUrl + ' : ' + err);
        }
      });
    }
    else {console.log('OH NOES! no feedObject.items for ' + feedUrl);}
    callback();
  });
};

module.exports = feedFetchTrimmer;
