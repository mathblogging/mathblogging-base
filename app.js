#! /usr/bin/env node

var Feed = require('feed'); // to creates feed objects and writes them out
var feedmerger = new require('./feedmerger.js').feedmerger; 
var async = require('async');

var theFeeds = ['http://boolesrings.org/scoskey/feed/', 
//             'http://boolesrings.org/matsguru/feed/',
//             'http://boolesrings.org/ioanna/feed/',
//             'http://boolesrings.org/nickgill/feed/',
//             'http://boolesrings.org/victoriagitman/feed/',
//             'http://blog.assafrinot.com/?feed=rss2', 
//             'http://boolesrings.org/thompson/feed/',
//             'http://boolesrings.org/vonheymann/feed/',
//             'http://danaernst.com/feed/',
//             'http://jdh.hamkins.org/feed/',
//             'http://boolesrings.org/mpawliuk/feed/',
//             'http://boolesrings.org/asafk/feed/',
//             'http://boolesrings.org/perlmutter/feed/',
//             'http://logic.dorais.org/feed',
//             'http://boolesrings.org/krautzberger/feed/',
//             'http://boolesrings.org/vatter/feed/',
             'http://m6c.org/w/blog/feed/'
             ];
var theFeed = new Feed({
  title: "Booles' Rings",
  description: 'Researchers. Connecting.',
  link: 'http://boolesrings.org/',
  image: 'http://boolesrings.org/logo.png',
  copyright: "Copyright © 2015 by the respective authors",
  author: {
  name: "Booles' Rings Authors",
  email: 'info@boolesrings.org',
  link: 'https://boolesrings.org'
  }
  });


var theCommentFeeds = ['http://boolesrings.org/scoskey/comments/feed/', 
//             'http://boolesrings.org/matsguru/comments/feed/',
//             'http://boolesrings.org/ioanna/comments/feed/',
//             'http://boolesrings.org/nickgill/comments/feed/',
//             'http://boolesrings.org/victoriagitman/comments/feed/',
//             'http://blog.assafrinot.com/?feed=comments-rss2', 
//             'http://boolesrings.org/thompson/comments/feed/',
//             'http://boolesrings.org/vonheymann/comments/feed/',
//             'http://danaernst.com/comments/feed/',
//             'http://jdh.hamkins.org/comments/feed/',
//             'http://boolesrings.org/mpawliuk/comments/feed/',
//             'http://boolesrings.org/asafk/comments/feed/',
//             'http://boolesrings.org/perlmutter/comments/feed/',
//             'http://logic.dorais.org/comments/feed/',
//             'http://boolesrings.org/krautzberger/comments/feed/',
//             'http://boolesrings.org/vatter/comments/feed/',
             'http://m6c.org/w/comments/feed/'
             ];


var theCommentFeed = new Feed({
  title: "Booles' Rings Comments",
  description: 'Researchers. Connecting.',
  link: 'http://boolesrings.org/',
  image: 'http://boolesrings.org/logo.png',
  copyright: "Copyright © 2015 by the respective authors",
  author: {
  name: "Booles' Rings Commenters",
  email: 'info@boolesrings.org',
  link: 'https://boolesrings.org'
  }
  });

var theOutput = '# Booles\' Rings Home\n';

var addEntries = function (resultFeed){
//   console.log(resultFeed.title);
  var newPart = '\n## '+ resultFeed.title + '\n\n';
  for (var i in resultFeed.items){
    var item = resultFeed.items[i];
//     console.log(item.title);
    newPart += '* ' + '**' + item.author + '**' + ' ' + item.title + '\n';
  }
  return newPart;
};

var doTheRest = function(results) {
   console.log(results.one.render('atom-1.0'));
//    console.log(results.two.render('atom-1.0'));
   theOutput += addEntries(results.one);
   theOutput += addEntries(results.two);
   console.log(theOutput);
//   build out markdown now!
  };

async.parallel({
    one: function(callback){
        feedmerger(theFeeds,theFeed,callback)
    },
    two: function(callback){
      feedmerger(theCommentFeeds,theCommentFeed,callback)
    }
},
function(err, results) {
  doTheRest(results);
    // results is now equals to: {one: 1, two: 2}
});