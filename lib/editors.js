const fs = require('fs');
const path = require('path');
const Twit = require('twit');
const Feed = require('rss');
const async = require('async');
const sortFeedByDate = require('./helpers.js').sortFeedByDate;

// set up Twitter app secrets
// WARNING don't store secrets in a public repository!
const fileName = path.resolve(__dirname,'../secret-config.json');
let config = {};

try {
  config = require(fileName);
} catch (err) {
  config = {};
  console.log('unable to read file ' + fileName + ': ', err);
  console.log('see secret-config-sample.json for an example');
  throw err
}

module.exports = function() {
  'use strict';

  const T = new Twit(config);

  const editors = ['MrHonner', 'fawnpnguyen', 'SheckyR', 'danaernst', 'pkrautz', 'ilaba'];

  const editorFeed = new Feed({
    title: 'Mathblogging.org -- Editors\' Picks',
    description: 'Your one stop shop for mathematical blogs',
    pubDate: new Date(),
    feed_url: 'https://mathblogging.org/editors-picks.xml',
    site_url: 'https://mathblogging.org/',
    // image: 'http://mathblogging.org/logo.png',
    copyright: 'No copyright asserted over individual posts; see original posts for copyright and/or licensing.',
    managingEditor: 'info@mathblogging.org (Mathblogging.org)'
  });

  let editorPage = '---\n' +
    'layout: page\n' +
    'title: Editor\'s picks\n' +
    '---\n\n';

  // Fetch embedded tweet HTML snippet
  const getEmbed = function(tweetId, callback) {
    T.get('statuses/oembed', {
      id: tweetId,
      hide_thread: true,
      omit_script: false,
      align: 'center',
      maxwidth: '500'
    }, function(Error, pickData) {
      editorPage += pickData.html + '\n';
      callback(Error);
    });
  };

  const tweetIds = [];

  const getEditor = function(editor, callback) {
    T.get('statuses/user_timeline', {
      'screen_name': editor,
      include_rts: false,
      count: 180
    }, function(err, tweets) {
      // filter tweets by filtering their hashtag arrays -- a bit ugly
      const editorPicks = tweets.filter(function(el) {
        // TODO abstract to function
        const filterHash = el.entities.hashtags.filter(function(tag) {
          return (tag.text === 'mbpick') || (tag.text === 'mbpicks');
        });
        return (filterHash.length > 0 && !el.favorited);
      });
      for (let editorPick of editorPicks) {
        const tweetId = editorPick.id_str;
        tweetIds.push(tweetId);
        let theLink = '';
        if (editorPick.entities.urls.length > 0) {
          theLink = editorPick.entities.urls[0].expanded_url;
        } else {
          theLink = 'https://twitter.com/' + editor + '/status/' + tweetId;
        }
        const itemOptions = {
          date: editorPick.created_at,
          title: '@' + editor + '\'s pick',
          link: theLink,
          guid: theLink,
          description: editorPick.text,
          author: '@' + editor
        };
        editorFeed.item(itemOptions);
        // retweet
        // NOTE Twitter will ignore repeated retweets so we can just be dumb
        T.post('statuses/retweet/:id', { id: tweetId }, function (err, data, response) {
          // NOTE not logging errors with code 327 ("you have already retweeted this tweet")
           if (err && err.code !== 327) console.log(err)
        })
      }
      callback(err);
    });
  };
  // collect all tweetIds with hashtag
  async.each(editors, getEditor, function(error) {
    if (error) {
      console.log(error);
    }
    editorFeed.items.sort(sortFeedByDate);
    tweetIds.sort((a, b)=> b-a);
    const xml = editorFeed.xml({
      indent: true
    });
    fs.writeFile(path.resolve(__dirname,'../mathblogging.org/editors-picks.xml'), xml, function(err) {
      if (err) {
        console.log('error: couldn\'t write Editors\' Picks Feed');
        return console.log(err);
      }
      // console.log('SUCCESS: "Editors\' Feed" was saved!');
    });
    // this is stupid...
    async.eachSeries(tweetIds, getEmbed, function(e) {
      if (e) {
        console.log(e);
      }
      editorPage += '<p> <a href="editors-picks.xml">' + 'Grab the feed for our Editors\' Picks!</a></p>\n';
      fs.writeFile(path.resolve(__dirname, '../mathblogging.org/index.md'), editorPage);
      console.log('SUCCESS: "Editors\' Picks" saved!');
    });
  });
};
