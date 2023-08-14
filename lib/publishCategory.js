const fs = require('fs');
const path = require('path');
const Feed = require('rss'); // to create feed objects

const escapeMD = require('./helpers.js').escapeMarkdown;
const categoryToUrl = require('./helpers.js').categoryToUrl;
const filterEntriesByCategory = require('./helpers.js').filterEntriesByCategory;

exports.publishCategory = function(cat, entries, directory) {
  const filteredEntries = filterEntriesByCategory(cat, entries);
  const isHomepage = (cat === 'Homepage');
  const category = isHomepage? 'Random recent posts' : cat.replace(/&/g, '&amp;');
  const filename = isHomepage ? 'index' : categoryToUrl(cat);

  let theOutput = '---\n' +
    'layout: page\n' +
    'title: ' + category + '\n' +
    'feedLink: ' + filename + '\n' +
    '---\n\n' // +
  ;

  if (isHomepage)   theOutput += '<p>A random selection of recent posts from around the mathematical blogosphere.</p>\n'

  theOutput += '<ul class="entry-list">\n'

  filteredEntries.forEach( (entry) => {
    theOutput += `<li><a class="entry-title" href="${entry.url}" rel="nofollow"><time datetime="${entry.date}" class="entry-date">${new Date(entry.date).toUTCString().substring(5, 16)}</time>${escapeMD(entry.postTitle)}<span class="entry-blog">${escapeMD(entry.blogTitle)}</span></a></li>\n`;
  })

    theOutput += '</ul>\n';
    theOutput += '<p> <a href="' + filename + '.xml">' + 'Grab the feed for ' + category + ' blogs!</a></p>\n';

  fs.writeFile(path.resolve(directory, filename + '.html'), theOutput, {mode:0o664}, function(err) {
    if (err) {
      console.log('error: couldn\'t write HTML for Category: ' + category);
      return console.log(err);
    }
    console.log('SUCCESS: HTML saved for Category: ' + category);
  });

  const categoryFeed = new Feed({
    title: 'Mathblogging.org -- ' + category,
    description: 'Your one stop shop for mathematical blogs',
    pubDate: new Date(),
    feed_url: 'https://mathblogging.org/' + categoryToUrl(category) + '.xml',
    site_url: 'https://mathblogging.org/',
    copyright: 'No copyright asserted over individual posts; see original posts for copyright and/or licensing.',
    managingEditor: 'info@mathblogging.org (Mathblogging.org)'
  });

  entries.forEach( (entry) => {
          const itemOptions = {
            date: entry.date,
            title: entry.postTitle,
            url: encodeURI(entry.url),
            guid: entry.url,
            description: '',
            author: entry.blogTitle
          };
          categoryFeed.item(itemOptions);
  })
  const xml = categoryFeed.xml({
    indent: true
  });
  fs.writeFile(path.resolve(directory, filename + '.xml'), xml, {mode:0o664}, function(err) {
    if (err) {
      console.log('error: couldn\'t write Feed for Category: ' + category);
      return console.log(err);
    }
    console.log('SUCCESS: Feed saved for Category: ' + category);
  });
};
