const fs = require('fs');
const path = require('path');
const categoryToUrl = require('./helpers.js').categoryToUrl;

exports.createSidebar = function (categories) {
  let sidebar = '<nav id="categories">\n';
  for (let category of categories) {
    const url = categoryToUrl(category);
    sidebar += '<a href="{{ site.baseurl }}/' + url + '.html">' + category.replace(/&/g, '&amp;') + '</a>\n';
  }
  sidebar += '</nav>';
  fs.writeFile(path.resolve(__dirname, '../mathblogging.org/_includes/sidebar-secondary.html'), sidebar, function (err) {
    'use strict';
    if (err) {
      console.log('error: couldn\'t write Sidebar');
      return console.log(err);
    }
    console.log('SUCCESS: Sidebar saved');
  });
}

exports.createBlogIndex = function (blogs) {
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
