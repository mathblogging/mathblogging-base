const fs = require('fs');
const path = require('path');
const Feed = require('rss'); // to create feed objects and
const sanitize = require('sanitize-filename');
const feedmerger = require('./feedmerger.js').feedmerger;
const pagewriter = require('./pagewriter.js').pagewriter;
const editors = require('./editors.js');

// helper functions

const categoryToUrl = function (string) {
  return string.toLowerCase().replace(/ |'|&/g, '_');
}

const urlToFilename = function (blogObject) {
  return './feeds/' + sanitize(blogObject.url) + '.xml';
};

const filterCategories = function (feedsjson) {
  const categories = []
  for (let blog of feedsjson.blogs) {
    for (let category of blog.categories) {
      if (!(categories.indexOf(category) > -1)) {
        categories.push(category);
      }
    }
  }
  categories.sort();
  return categories;
};

const feedFilenamesForCategory = function (feedsjson, category) {
  const feedsFilenames = [];
  for (let blog of feedsjson.blogs) {
    if (blog.categories.indexOf(category) > -1) {
      feedsFilenames.push(urlToFilename(blog));
    }
  }
  return feedsFilenames;
};

const createSidebar = function (categories) {
  let sidebar = '<nav id="categories">\n';
  for (let category of categories) {
    const url = categoryToUrl(category);
    sidebar += '<a href="{{ site.baseurl }}/' + url + '.html">' + category.replace(/&/g, '&amp;') + '</a>\n';
  }
  sidebar += '</nav>';
  fs.writeFile('../mathblogging.org/_includes/sidebar-secondary.html', sidebar, function (err) {
    'use strict';
    if (err) {
      console.log('error: couldn\'t write Sidebar');
      return console.log(err);
    }
    console.log('SUCCESS: Sidebar saved');
  });
}

const createBlogIndex = function (blogs) {
  let blogIndex = '---\n' +
    'layout: page\n' +
    'title: Blog Index \n' +
    '---\n\n' +
    '<p>This page lists all feeds we aggregate for mathblogging.org. If yours is not listed or out-of-date, please <a href="mailto:mathblogging.network@gmail.com">write us an email</a> or send us a tweet <a href="https://twitter.com/mathblogging">@mathblogging</a>.</p>\n' +
    '<ul>\n';
  for (let blog of blogs) {
    blogIndex += '  <li>\n    <a href="' + blog.url + '" rel="nofollow"> ' + blog.url + '</a>\n  </li>\n';
  }
  blogIndex += '</ul>\n';
  fs.writeFile(path.resolve(__dirname, '../mathblogging.org/blogindex.html'), blogIndex, {
    mode: 0o664
  }, function (err) {
    if (err) {
      console.log('error: couldn\'t write BlogIndex');
      return console.log(err);
    }
    console.log('SUCCESS: BlogIndex saved');
  });
}

const mergeFeedsOfCategory = function (category, feedFilenames) {
  const categoryFeed = new Feed({
    title: 'Mathblogging.org -- ' + category,
    description: 'Your one stop shop for mathematical blogs',
    pubDate: new Date(),
    feed_url: 'https://mathblogging.org/' + categoryToUrl(category) + '.xml',
    site_url: 'https://mathblogging.org/',
    copyright: 'No copyright asserted over individual posts; see original posts for copyright and/or licensing.',
    managingEditor: 'info@mathblogging.org (Mathblogging.org)'
  });
  feedmerger(feedFilenames, categoryFeed, pagewriter.bind(null, category));
}

// The action

// load the main json file
const FeedsJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/feeds.json'), 'utf8'));

// extract categories
const categories = filterCategories(FeedsJson);

// create sidebar HTML (jekyll include for navigation)
createSidebar(categories);
// create the blog index page (for easy look-up of current list of blogs)
createBlogIndex(FeedsJson.blogs);

// merge feeds for each category and process
for (let category of categories) {
  mergeFeedsOfCategory(category, feedFilenamesForCategory(FeedsJson, category))
}

// generate Editors' Picks
editors();
