#! /usr/bin/env node

var Feed = require('feed'); // to creates feed objects and writes them out
var feedmerger1 = new require('./feedmerger.js').feedmerger; 

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
  name: "Booles' Rings",
  email: 'info@boolesrings.org',
  link: 'https://boolesrings.org'
  }
  });

feedmerger1(theFeeds,theFeed);

