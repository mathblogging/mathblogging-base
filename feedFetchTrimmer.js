/* eslint-env node */

var FeedParser = require('feedparser'); // to parse feeds
var request = require('request'); // TODO let's abstract this so that we can switch it out (e.g., to fs.readFile )
var Feed = require('rss'); // to write feeds (but not necessary to require here because we should get a Feed object from app.js -- which seems wrong)
var fs = require('fs');
var Iconv = require('iconv').Iconv;
var zlib = require('zlib');
var sanitize = require('sanitize-filename');

var feedFetchTrimmer = function(feedUrl) {
  'use strict';
  // thanks to example from feedparser:
  //  done, maybeDecompress, maybeTranslate, getParams

  // Define our streams
  function done(err) {
    if (err) {
      // console.log('Feedparser ERROR:' + feedUrl + 'THREW' + err);
      throw err;
    }
    return;
  }

  function maybeDecompress(res, encoding) {
    var decompress;
    if (encoding.match(/\bdeflate\b/)) {
      decompress = zlib.createInflate();
    } else if (encoding.match(/\bgzip\b/)) {
      decompress = zlib.createGunzip();
    }
    return decompress ? res.pipe(decompress) : res;
  }

  function maybeTranslate(res, charset) {
    var iconv;
    // Use iconv if its not utf8 already.
    if (!iconv && charset && !/utf-*8/i.test(charset)) {
      try {
        iconv = new Iconv(charset, 'utf-8');
        console.log('Converting from charset %s to utf-8', charset);
        iconv.on('error', done);
        // If we're using iconv, stream will be the output of iconv
        // otherwise it will remain the output of request
        res = res.pipe(iconv);
      } catch (err) {
        res.emit('error', err);
      }
    }
    return res;
  }

  function getParams(str) {
    var params = str.split(';').reduce(function(params, param) {
      var parts = param.split('=').map(function(part) {
        return part.trim();
      });
      if (parts.length === 2) {
        params[parts[0]] = parts[1];
      }
      return params;
    }, {});
    return params;
  }
  // set up request to fetch feed

  var options = {
    url: feedUrl,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
      'accept': 'text/html,application/xhtml+xml',
      timeout: 4000,
      pool: false,
      setMaxListeners: 100
    }
  };
  var req = request(options);

  var feedparser = new FeedParser();
  var feedObject;

  // Define our handlers
  req.on('error', done);
  req.on('response', function(res) {
    if (res.statusCode !== 200) {
      return this.emit('error', new Error('Bad status code'));
    }
    var encoding = res.headers['content-encoding'] || 'identity',
      charset = getParams(res.headers['content-type'] || '').charset;
    res = maybeDecompress(res, encoding);
    res = maybeTranslate(res, charset);
    res.pipe(feedparser);
  });

  feedparser.on('error', done);
  feedparser.on('end', done);
  feedparser.on('meta', function() {
    var stream = this;
    var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
    var feedOptions = {
      title: meta.title,
      description: meta.description,
      link: meta.link,
      pubDate: meta.date,
      feed_url: meta.xmlurl,
      // image: meta.image.url,
      copyright: meta.copyright,
      // feedObject.author.email = meta.author.email;
      // author.link: meta.author.link,
      author: meta.author
    };

    feedObject = new Feed(feedOptions);
  })
  feedparser.on('readable', function() {
    // console.log(feedUrl);
    // This is where the action is!
    var stream = this;

    var today = new Date();
    var cutoff = new Date(today.getTime() - 31 * 24 * 60 * 60 * 1000); // only posts from past 30 days (ignoring leap seconds etc.)
    var item;
    while ((item = stream.read())) {
      var itemDate = item.pubdate || item.date;
      // console.log(cutoff, itemDate, cutoff < itemDate);
      if (cutoff < itemDate) {
        var itemOptions = {
          date: itemDate,
          title: item.title,
          url: item.link,
          description: null, // item.description || null
          author: item.author || null
        };
        feedObject.item(itemOptions);
      }
    }
  });
  feedparser.on('finish', function() {
    feedObject.items.sort(function(a, b) { //sort by date for creating pages later
      return b.date - a.date;
    });
    var xml = feedObject.xml({
      indent: true
    });
    // console.log(xml);
    var filename = sanitize(feedUrl) + '.xml';
    // console.log(filename);
    fs.writeFile('./feeds/' + filename, xml, function(err) {
    if(err) {
      console.log('hello error');
        return console.log(err);
    }
    console.log('SUCCESS: "' + filename + '" was saved!');
});
  });
};

module.exports = feedFetchTrimmer;