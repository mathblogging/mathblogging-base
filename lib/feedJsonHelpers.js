const Feed = require('rss'); // to create feed objects
const feedmerger = require('./feedmerger.js').feedmerger;
const pagewriter = require('./pagewriter.js').pagewriter;
const urlToFilename = require('./helpers.js').urlToFilename;
const categoryToUrl = require('./helpers.js').categoryToUrl;


exports.filterCategories = function (feedsjson) {
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

exports.feedFilenamesForCategory = function (feedsjson, category) {
  const feedsFilenames = [];
  for (let blog of feedsjson.blogs) {
    if (category === 'Posts' || blog.categories.indexOf(category) > -1) {
      feedsFilenames.push(urlToFilename(blog));
    }
  }
  return feedsFilenames;
};


exports.mergeFeedsOfCategory = function (category, feedFilenames) {
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
