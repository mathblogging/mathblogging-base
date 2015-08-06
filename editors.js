/* eslint-env node */
var fs = require('fs');
var Twit = require('twit');
var FeedCreator = require('feed'); // to create feed objects and
var escapeMD = require('./escape-markdown.js').escapeMarkdown; // our module
var Autolinker = require('autolinker');

// set up secrets
var fileName = './secret-config.json';
var config = {};

try {
  config = require(fileName);
}
catch (err) {
  config = {};
  console.log('unable to read file ' + fileName + ': ', err);
  console.log('see secret-config-sample.json for an example');
}

module.exports = function() {
  'use strict';
  var T = new Twit(config);
  var editors = ['MrHonner', 'fawnpnguyen', 'SheckyR', 'danaernst', 'pkrautz'];

  var editorFeed = new FeedCreator({
    title: 'Mathblogging.org -- Editor\'s Picks',
    description: 'Your one stop shop for mathematical blogs',
    link: 'http://mathblogging.org/',
    image: 'http://mathblogging.org/logo.png',
    copyright: 'No copyright asserted over individual posts; see original posts for copyright and/or licensing.',
    author: {
      name: 'Mathblogging.org',
      email: 'info@mathblogging.org',
      link: 'https://mathblogging.org'
    }
  });

  var editorPage = '---\n' +
    'layout: page\n' +
    'title: Mathblogging.org\n' +
    '---\n\n' +
    '## Editor\'s picks\n\n';

  T.get('search/tweets', {
    q: '#MBPick since:2011-04-14',
    count: 10
  }, function(err, data) {
    if (err) {
      throw err;
    }
    console.log(data);
    var tweets = data.statuses;
    for (var i = 0; i < tweets.length; i++) {
      var tweet = tweets[i];
      console.log(tweet.user);
      var editor = tweet.user.screen_name;
      var linkedText = tweet.text;
      // console.log(tweet);
      // console.log(tweet.retweeted + tweet.favorited);
      if ( (editors.indexOf(editor) > -1) && (!tweet.favorited) && (!tweet.retweeted)) {
        // console.log('**' + editor + '**: ' + tweet.text);
        // console.log(linkedText);TODO tweets have link at end
        console.log(tweet.text);
        editorPage += '* ' + '**' + escapeMD(editor) + '\'s pick**: ' + //' [' +
          linkedText + '\n'; //'](' + tweet.link + ')\n';

        var itemTitle = editor + '\'s pick';
        var itemLink = 'http://mathblogging.org';
        var itemDescription = tweet.text;
        console.log(tweet.created_at);
        var itemDate = new Date(tweet.created_at);
        var itemAuthor = [{
          name: 'picked by ' + editor,
          email: '',
          link: ''
        }];
        editorFeed.addItem({
          title: itemTitle,
          link: itemLink,
          description: itemDescription,
          date: itemDate,
          author: itemAuthor
        });
      }
    }
    fs.writeFile('./mathblogging.org/editor-picks.xml', editorFeed.render('atom-1.0'));
    fs.writeFile('./mathblogging.org/index.md', editorPage);

  });
};
