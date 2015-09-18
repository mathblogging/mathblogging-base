/* eslint-env node */

var fs = require('fs');
var jspath = require('jspath');
// var async = require('async'); // asyncjs for async stuff
var FeedCreator = require('feed'); // to create feed objects and
var feedmerger = require('./feedmerger.js').feedmerger;
var pagewriter = require('./pagewriter.js').pagewriter;
var editorpicks = require('./editors.js');
editorpicks();

var FeedsJson = {};
// var Feeds = {};
var categories = ['Research', 'Journalism', 'Web', 'Recreational', 'Teaching', 'Education'];

var filterFeedJson = function (category) {
  'use strict';
  var categoryFeeds = { 'title': category, 'blogs': [] };
  var path = '.blogs {.category.title === "' + category + '"}';
  // console.log(category);
  // console.log(jspath.apply(path, FeedsJson));
  categoryFeeds.blogs = jspath.apply(path, FeedsJson);
  return categoryFeeds;
};

// async start
// fs.readFile('./feeds.json', 'utf8', function(err, data) {
//   'use strict';
//   if (err) {
//     throw err;
//   }
//   FeedsJson = JSON.parse(data);
//
//   var catFeedsJson = categories.map(filterFeedJson);
//   console.log(JSON.stringify(catFeedsJson));
//   //testing jspath
//   // var scat = 'Journalism';
//   // Feeds = jspath.apply('.blogs {.category.title === "' + scat + '"}', FeedsJson);
//   // console.log(Feeds);
// });

FeedsJson = JSON.parse(fs.readFileSync('./feeds.json', 'utf8'));

var catFeedsJson = categories.map(filterFeedJson);
// console.log(JSON.stringify(catFeedsJson));

var titleToFilenameHelper = function(title){
  'use strict';
  return './feeds/' + title + '.xml';
};

for (var j = 0; j < catFeedsJson.length; j++){
  var catFeedJson = catFeedsJson[j];
  var category = catFeedJson.title;
  // console.log(category);
  var catFeedURLs = jspath.apply('.blogs.title', catFeedJson);
  catFeedURLs = catFeedURLs.map(titleToFilenameHelper);
  console.log(catFeedURLs);
  var catFeed = new FeedCreator({
    title: 'Mathblogging.org -- ' + category,
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
  feedmerger(catFeedURLs, catFeed, pagewriter.bind(null, category));
}
  //testing jspath
  // var scat = 'Journalism';
  // Feeds = jspath.apply('.blogs {.category.title === "' + scat + '"}', FeedsJson);
  // console.log(Feeds);

//move to file feeds.json? Generating the list from the full JSON seems wasteful but storing in json as separate object might be better for maintenance
//
// for (var c = 0; c < categories.length; c++) {
//   var cat = categories[c];
//   function catFilter(obj) {
//     for (i = 0; i < Feeds.blogs.length; i++) {
//       if (cat in Feeds.blogs.category && blog === cat) {
//         return true
//       }
//     }
//   }

// var catFeed = new Feed({
//   title: 'Booles\' Rings Posts',
//   description: 'Researchers. Connecting.',
//   link: 'http://boolesrings.org/',
//   image: 'http://boolesrings.org/logo.png',
//   copyright: 'Copyright © 2015 by the respective authors',
//   author: {
//     name: 'Booles\' Rings Authors',
//     email: 'info@boolesrings.org',
//     link: 'https://boolesrings.org'
//   }
// });
// feedmerger(catFeeds, catFeed, function(returnedFeed) {
//   pagewriter(returnedFeed);
// });
// }
// //
//
//
//
// var theCommentFeeds = [
//   'http://boolesrings.org/scoskey/comments/feed/',
//   'http://boolesrings.org/matsguru/comments/feed/',
//   'http://boolesrings.org/ioanna/comments/feed/',
//   'http://boolesrings.org/nickgill/comments/feed/',
//   'http://boolesrings.org/victoriagitman/comments/feed/',
//   'http://blog.assafrinot.com/?feed=comments-rss2',
//   'http://boolesrings.org/thompson/comments/feed/',
//   'http://boolesrings.org/vonheymann/comments/feed/',
//   'http://danaernst.com/comments/feed/',
//   'http://jdh.hamkins.org/comments/feed/',
//   'http://boolesrings.org/mpawliuk/comments/feed/',
//   'http://boolesrings.org/asafk/comments/feed/',
//   'http://boolesrings.org/perlmutter/comments/feed/',
//   'http://logic.dorais.org/comments/feed/',
//   'http://boolesrings.org/krautzberger/comments/feed/',
//   'http://boolesrings.org/vatter/comments/feed/',
//   'http://m6c.org/w/comments/feed/'
// ];
//
//
// var theCommentFeed = new Feed({
//   title: 'Booles\' Rings Comments',
//   description: 'Researchers. Connecting.',
//   link: 'http://boolesrings.org/',
//   image: 'http://boolesrings.org/logo.png',
//   copyright: 'Copyright © 2015 by the respective authors',
//   author: {
//     name: 'Booles\' Rings Commenters',
//     email: 'info@boolesrings.org',
//     link: 'https://boolesrings.org'
//   }
// });
//
// var theOutput = '---\n' +
//   'layout: page\n' +
//   'title: Booles\' Rings\n' +
//   '---\n\n' // +
//   // '# Booles\' Rings Home\n\n'  // not needed because of jekyll title
// ;
//
// var addEntries = function(resultFeed) {
//   'use strict';
//   //   console.log(resultFeed.title);
//   var newPart = '\n## ' + resultFeed.title + '\n\n';
//   for (var i in resultFeed.items) {
//     if (i > 9) {
//       break;
//     }
//     var item = resultFeed.items[i];
//     //     console.log(item.title);
//     newPart += '* ' + '**' + escapeMD(item.author) + '**' + ' [' + escapeMD(item.title) + '](' + item.link + ')\n';
//   }
//   return newPart;
// };
//
// var doTheRest = function(results) {
//   //   console.log(results.one.render('atom-1.0'));
//   //    console.log(results.two.render('atom-1.0'));
//   theOutput += addEntries(results.one);
//   theOutput += addEntries(results.two);
//   fs.writeFile('./boolesrings.org/index.md', theOutput);
//   //   build out markdown now!
// };
//
// async.parallel({
//     one: function(callback) {
//       feedmerger(theFeeds, theFeed, callback);
//     },
//     two: function(callback) {
//       feedmerger(theCommentFeeds, theCommentFeed, callback);
//     }
//   },
//   function(err, results) {
//     doTheRest(results);
//     // results is now equals to: {one: 1, two: 2}
//   });
