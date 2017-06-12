/* eslint-env node */

var fs = require('fs');
// var Feed = require('feed'); // to create feed objects and write them out
// var feedmerger = new require('./feedmerger.js').feedmerger; // our module to merge several feeds into one. Includes additional dependencies
var escapeMD = require('./escape-markdown.js').escapeMarkdown; // our module to escape markdown control characters
// var async = require('async'); // asyncjs for async stuff

exports.pagewriter = function(cat, jsonFeed) {
  'use strict';

  var theFeed = jsonFeed;
  var category = cat.replace(/&/g, '&amp;');
  var filename = cat.toLowerCase().replace(/ |'|&/g, '_');
  // console.log(category);

  var theOutput = '---\n' +
    'layout: page\n' +
    'title: ' + category + '\n' +
    '---\n\n' // +
  ;

  var addEntries = function(resultFeed) {
    //   console.log(resultFeed.title);
    var newPart = '';
    for (var i in resultFeed.items) {
      // if (i > 9) {
      //   break;
      // }
      var item = resultFeed.items[i];
      var today = new Date();
      var cutoff = new Date(today.getTime() - 31 * 24 * 60 * 60 * 1000); // only posts from past 31 days (ignoring leap seconds etc.)
      var itemDate = item.date;
      if ((cutoff < itemDate) && !(today < itemDate)) {
        newPart += '  <li> ' + '<a class="entry-title" href="' + item.url + '" rel="nofollow">' + ' <time datetime="' + itemDate + '" class="entry-date">' + itemDate.toUTCString().substring(5, 16) + '</time> ' + escapeMD(item.title) + '<span class="entry-blog">' + escapeMD(item.author) + '</span> </a> </li> \n';
      }
    }
    newPart = '<ul class="entry-list"> \n' + newPart + '</ul>\n';
    newPart += '<p> <a href="' + filename + '.xml">' + 'Grab the feed for ' + category + ' blogs!</a></p>\n';
    return newPart;
  };

  theOutput += addEntries(theFeed);
  fs.writeFile('../mathblogging.org/' + filename + '.html', theOutput, {mode:0o664}, function(err) {
    if (err) {
      console.log('error: couldn\'t write HTML for Category: ' + category);
      return console.log(err);
    }
    console.log('SUCCESS: HTML saved for Category: ' + category);
  });

  var xml = theFeed.xml({
    indent: true
  });
  fs.writeFile('../mathblogging.org/' + filename + '.xml', xml, {mode:0o664}, function(err) {
    if (err) {
      console.log('error: couldn\'t write Feed for Category: ' + category);
      return console.log(err);
    }
    console.log('SUCCESS: Feed saved for Category: ' + category);
  });

  return;
};
