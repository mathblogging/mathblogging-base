/* eslint-env node */

var FeedParser = require('feedparser'); // to parse feeds
var request = require('requestretry'); // TODO let's abstract this so that we can switch it out (e.g., to fs.readFile )
var Feed = require('rss'); // to write feeds (but not necessary to require here because we should get a Feed object from app.js -- which seems wrong)
var fs = require('fs');
var iconv = require('iconv-lite');
var zlib = require('zlib');
var sanitize = require('sanitize-filename');

var feedFetchTrimmer = function(feedUrl, callback) {
  'use strict';
  // thanks to example from feedparser:
  //  done, maybeDecompress, maybeTranslate, getParams
  var error = null;
  // Define our streams
  function done(err) {
    console.log( "in done function for: " + feedUrl );
    if (err) {
      error = err;
      console.log('feedFetchTrimmer: ' + feedUrl + ' : ' + error);
      //callback();
      // return this.emit('error', new Error('Feedparser ERROR: ' + feedUrl + ' THREW ' + err + '\n'));
    }
    // return;
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
    // var iconv;
    // Use iconv-lite if its not utf8 already.
    if (!iconv && charset && !/utf-*8/i.test(charset)) {
      try {
        console.log('Feedparser: ' + feedUrl + ': Converting from charset %s to utf-8', charset);
        res = res.pipe(iconv.decodeStream(charset));
      } catch (err) {
        console.log('feedFetchTrimmer: ' + feedUrl + ' : ' + err);
      }
    }
    return res;
  }

  function getParams(str) {
    var params = str.split(';').reduce(function(parameters, param) {
      var parts = param.split('=').map(function(part) {
        return part.trim();
      });
      if (parts.length === 2) {
        parameters[parts[0]] = parts[1];
      }
      return parameters;
    }, {});
    return params;
  }
  // set up request to fetch feed

  var options = {
    url: feedUrl,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
      'accept': 'text/html,application/xhtml+xml'
    },
    timeout: 3000,
    //setMaxListeners: 10,
    maxAttempts: 3, // (default) try 5 times
    retryDelay: 1000, // (default) wait for 5s before trying again
    retryStrategy: request.RetryStrategies.HTTPOrNetworkError
  };
  var req = request(options);

  var feedparser = new FeedParser();
  var feedObject;

  // Define our handlers
  req.on('error', done);
  req.on('response', function(res) {
    if (res.statusCode !== 200) {
      return this.emit('error' + req.url, new Error('Bad status code'));
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
          url: item.link,
          description: null, // item.description || null
          author: item.author || null
        };
        feedObject.item(itemOptions);
      }
    }
  });
  feedparser.on('finish', function() {
    if (!error) {
      feedObject.items.sort(function(a, b) { //sort by date for creating pages later
        return b.date - a.date;
      });
      var xml = feedObject.xml({
        indent: true
      });
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
    callback()
  });
};

module.exports = feedFetchTrimmer;
