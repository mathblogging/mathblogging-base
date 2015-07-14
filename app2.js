#! /usr/bin/env node

var fs = require('fs');
// var async = require('async'); // asyncjs for async stuff
var feedscacher = require('./feedscacher.js').feedscacher;

var Feeds = fs.readFile('./feeds.json', 'utf8', function(err, data) {
  'use strict';
  if (err) {
    throw err;
  }
  Feeds = JSON.parse(data);
  feedscacher(Feeds);
});
