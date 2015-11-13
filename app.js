var fs = require('fs');
var Feed = require('rss'); // to create feed objects and
var feedmerger = require('./feedmerger.js').feedmerger;
var pagewriter = require('./pagewriter.js').pagewriter;
var sanitize = require('sanitize-filename');
var editorpicks = require('./editors.js');
editorpicks();

var FeedsJson = {};

var createCategories = function (feedsJson, categories){
  'use strict';
  for (var j = 0; j < feedsJson.blogs.length; j++){
    var blog = feedsJson.blogs[j];
    for (var k = 0; k < blog.categories.length; k++){
      var category = blog.categories[k];
      if (!(categories.indexOf(category) > -1)){
        categories.push(category);
      }
    }
  }
};


var filterFeedJson = function (category) {
  'use strict';
  var categoryFeeds = { 'category': category, 'blogs': [] };
  var blogs = categoryFeeds.blogs;
  for (var i = 0; i < FeedsJson.blogs.length; i++) {
    var blog = FeedsJson.blogs[i];
    if (blog.categories.indexOf(category) > -1){
      blogs.push(blog);
    }
  }
  return categoryFeeds;
};


FeedsJson = JSON.parse(fs.readFileSync('./feeds.json', 'utf8'));

var categories = [];
createCategories(FeedsJson, categories);

var sidebar = '<nav id="categories">\n';
for (var c = 0; c < categories.length; c++){
  var cat = categories[c];
  var url = categories[c].toLowerCase().replace(/ |'|&/g, '_');
  sidebar += '<a href="{{ site.baseurl }}/' + url + '.html">' + cat.replace(/&/g, '&amp;') + '</a>\n';
}
sidebar += '</nav>';
fs.writeFile('./mathblogging.org/_includes/sidebar-secondary.html', sidebar, function(err) {
  'use strict';
  if (err) {
    console.log('error: couldn\'t write Sidebar');
    return console.log(err);
  }
  console.log('SUCCESS: Sidebar saved');
});
// console.log(categories);
var catFeedsJson = categories.map(filterFeedJson);
catFeedsJson.push({ 'category': 'Posts', 'blogs': FeedsJson.blogs});
// console.log(JSON.stringify(catFeedsJson));

var filterUrl = function(blogObject) {
  'use strict';
  return './feeds/' + sanitize(blogObject.url) + '.xml';
};

for (var j = 0; j < catFeedsJson.length; j++){
  var catFeedJson = catFeedsJson[j];
  var category = catFeedJson.category;
  // console.log(category);
  var catFeedURLs = catFeedJson.blogs.map(filterUrl);
  // console.log(catFeedURLs);
  var catFeed = new Feed({
    title: 'Mathblogging.org -- ' + category,
    description: 'Your one stop shop for mathematical blogs',
    pubDate: new Date(),
    link: 'http://mathblogging.org/',
    copyright: 'No copyright asserted over individual posts; see original posts for copyright and/or licensing.',
    managingEditor: 'info@mathblogging.org (Mathblogging.org)'
  });
  feedmerger(catFeedURLs, catFeed, pagewriter.bind(null, category));
}
