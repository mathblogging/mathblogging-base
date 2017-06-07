const fs = require('fs');
const Feed = require('rss'); // to create feed objects and
const feedmerger = require('./feedmerger.js').feedmerger;
const pagewriter = require('./pagewriter.js').pagewriter;
const sanitize = require('sanitize-filename');
const editorpicks = require('./editors.js');
editorpicks();

const createCategories = function (feedsJson){
  const categories = []
  for (let blog of feedsJson.blogs){
    for (let category of blog.categories){
      if (!(categories.indexOf(category) > -1)){
        categories.push(category);
      }
    }
  }
  return categories;
};


const filterFeedJson = function (category) {
  const categoryFeeds = { 'category': category, 'blogs': [] };
  for (let blog of FeedsJson.blogs) {
    if (blog.categories.indexOf(category) > -1){
      categoryFeeds.blogs.push(blog);
    }
  }
  return categoryFeeds;
};


const FeedsJson = JSON.parse(fs.readFileSync('./feeds.json', 'utf8'));

const categories = createCategories(FeedsJson);
categories.sort();

let sidebar = '<nav id="categories">\n';
for (let category of categories){
  const url = category.toLowerCase().replace(/ |'|&/g, '_');
  sidebar += '<a href="{{ site.baseurl }}/' + url + '.html">' + category.replace(/&/g, '&amp;') + '</a>\n';
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

let blogIndex = '---\n' +
  'layout: page\n' +
  'title: Blog Index \n' +
  '---\n\n' +
  '<p>This page lists all feeds we aggregate for mathblogging.org. If yours is not listed or out-of-date, please <a href="mailto:mathblogging.network@gmail.com">write us an email</a> or send us a tweet <a href="https://twitter.com/mathblogging">@mathblogging</a>.</p>\n' +
  '<ul>\n';
for (let blog of FeedsJson.blogs){
  blogIndex += '  <li>\n    <a href="' + blog.url + '" rel="nofollow"> ' + blog.url + '</a>\n  </li>\n';
}
blogIndex += '</ul>\n';
fs.writeFile('./mathblogging.org/blogindex.html', blogIndex, {mode:0o664}, function(err) {
  if (err) {
    console.log('error: couldn\'t write BlogIndex');
    return console.log(err);
  }
  console.log('SUCCESS: BlogIndex saved');
});

const categoriesFeedJson = categories.map(filterFeedJson);
categoriesFeedJson.push({ 'category': 'Posts', 'blogs': FeedsJson.blogs});

const filterUrl = function(blogObject) {
  'use strict';
  return './feeds/' + sanitize(blogObject.url) + '.xml';
};

for (let categoryFeedJson of categoriesFeedJson){
  const category = categoryFeedJson.category;
  // console.log(category);
  const catFeedURLs = categoryFeedJson.blogs.map(filterUrl);
  // console.log(catFeedURLs);
  const catFeed = new Feed({
    title: 'Mathblogging.org -- ' + category,
    description: 'Your one stop shop for mathematical blogs',
    pubDate: new Date(),
    link: 'http://mathblogging.org/',
    copyright: 'No copyright asserted over individual posts; see original posts for copyright and/or licensing.',
    managingEditor: 'info@mathblogging.org (Mathblogging.org)'
  });
  feedmerger(catFeedURLs, catFeed, pagewriter.bind(null, category));
}
