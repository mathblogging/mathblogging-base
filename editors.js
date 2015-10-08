/* eslint-env node */
var fs = require('fs');
var Twit = require('twit');
var Feed = require('rss');
// var escapeMD = require('./escape-markdown.js').escapeMarkdown; // our module
// var Autolinker = require('autolinker');
var async = require('async');

// set up Twitter app secrets
var fileName = './secret-config.json';
var config = {};

try {
  config = require(fileName);
} catch (err) {
  config = {};
  console.log('unable to read file ' + fileName + ': ', err);
  console.log('see secret-config-sample.json for an example');
}

module.exports = function() {
  'use strict';

  var T = new Twit(config);

  var editors = ['MrHonner', 'fawnpnguyen', 'SheckyR', 'danaernst', 'pkrautz'];

  var editorFeed = new Feed({
    title: 'Mathblogging.org -- Editor\'s Picks',
    description: 'Your one stop shop for mathematical blogs',
    pubDate: new Date(),
    link: 'http://mathblogging.org/',
    // image: 'http://mathblogging.org/logo.png',
    copyright: 'No copyright asserted over individual posts; see original posts for copyright and/or licensing.',
    managingEditor: 'info@mathblogging.org (Mathblogging.org)'
  });

  var editorPage = '---\n' +
    'layout: page\n' +
    'title: Editor\'s picks\n' +
    '---\n\n';
//    '## Editor\'s picks\n\n';

  // Fetch embedded tweet HTML snippet
  var getEmbed = function(tweetId, callback) {
    T.get('statuses/oembed', {
      id: tweetId,
      /*eslint-disable */
      hide_thread: true,
      omit_script: false,
      /*eslint-enable */
      align: 'center',
      maxwidth: '500'
    }, function(Error, pickData) {
      // console.log(tweetId);
      // console.log(pickData.html);
      editorPage += pickData.html + '\n';
      callback(Error);
    });
  };

  var tweetIds = [];

  var getEditor = function(editor, callback) {
    T.get('statuses/user_timeline', {
      'screen_name': editor,
      count: 180
    }, function(err, tweets) {
      // console.log(JSON.stringify(data));
      // filter tweets by filtering their hashtag arrays -- a bit ugly
      var editorPicks = tweets.filter(function(el) {
        var filterHash = el.entities.hashtags.filter(function(tag) {
          return (tag.text === 'mbpick') || (tag.text === 'mbpicks');
        });
        return (filterHash.length > 0);
      });
      for (var i = 0; i < editorPicks.length; i++) {
        tweetIds.push(editorPicks[i].id_str);
        var theLink = '';
        if (editorPicks[i].entities.urls.length > 0) {
          theLink = editorPicks[i].entities.urls[0].expanded_url;
        } else {
          theLink = 'https://twitter.com/' + editor + '/status/' + editorPicks[i].id_str;
        }
        var itemOptions = {
          date: editorPicks[i].created_at,
          title: '@' + editor + '\'s pick',
          link: theLink,
          guid: theLink,
          description: editorPicks[i].text,
          author: '@' + editor
        };
        // console.log(itemOptions);
        editorFeed.item(itemOptions);
      }
      callback(err);
    });
  };
  // collect all tweetIds with hashtag
  async.each(editors, getEditor, function(error) {
    if (error) {
      console.log(error);
    }
    // console.log(tweetIds);
    // turn this into a module? used everywhere...
    editorFeed.items.sort(function(a, b) { //sort by date for creating pages later
      return b.date - a.date;
    });
    var xml = editorFeed.xml({
      indent: true
    });
    fs.writeFile('./mathblogging.org/editors-picks.xml', xml, function(err) {
      if (err) {
        console.log('error: couldn\'t write Editors\' Picks Feed');
        return console.log(err);
      }
      // console.log('SUCCESS: "Editors\' Feed" was saved!');
    });
    // this is stupid...
    async.each(tweetIds, getEmbed, function(e) {
      if (e) {
        console.log(e);
      }
      fs.writeFile('./mathblogging.org/index.md', editorPage);
      // console.log('SUCCESS: "Editors\' Picks Homepage" was saved!');
    });

  });


};
