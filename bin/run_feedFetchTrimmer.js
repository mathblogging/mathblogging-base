const fs = require('fs');
const path = require('path');
const async = require('async');
const feedFetchTrimmer = require('../lib/feedFetchTrimmer.js');

const data = fs.readFileSync(path.resolve(__dirname, '../data/feeds.json'), 'utf8');
const q = async.queue(feedFetchTrimmer, 5);
const FeedsJson = JSON.parse(data);

let urls = FeedsJson.blogs.map((blog)=>blog.url);

q.push(urls, function (error, warning) {
  if (error) {
    console.log(error);
  }
  if (warning) {
    console.log(warning);
  }
});
q.drain = function () {
  console.log('all items have been processed');
};
