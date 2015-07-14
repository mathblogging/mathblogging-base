#! /usr/bin/env node

var fs = require('fs');
var request = require('request');
// var async = require('async'); // asyncjs for async stuff

exports.feedscacher = function(jsonFeed) {
  'use strict';

  var updateFeed = function(blogData) {
    var currentTime = new Date(); // TODO cf. wiki
    if (blogData.ttl < currentTime) {
      request
        .get(blogData.feedURL)
        .on('response', function(response) {
          // write out file
          // write out TTL
          if (response.statusCode === 200) {
            // blogData.ttl = response.headers['Last-Modified'];
            // console.log(response.headers);
            response.pipe(fs.createWriteStream('./feeds/' + blogData.title + '.xml'));
          }
        })
        .on('error', function(error) {
          console.log('Requesting ' + blogData.title + ' - ' + error);
          return error;
        });
    }
  };

  var blogs = jsonFeed.blogs;

  for (var i = 0; i < blogs.length; i++) {
    updateFeed(blogs[i]);
  }
  // do treatFeed using async https://www.npmjs.com/package/async#foreachof-obj-iterator-callback


  // var output = console.log(jsonFeed.blogs[0].title);

  // return output;
  //end module
};
