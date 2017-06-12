const fs = require('fs');
const path = require('path');

const escapeMD = require('./helpers.js').escapeMarkdown;
const categoryToUrl = require('./helpers.js').categoryToUrl;

exports.pagewriter = function(cat, jsonFeed) {
  const theFeed = jsonFeed;
  const category = cat.replace(/&/g, '&amp;');
  const filename = categoryToUrl(cat);

  let theOutput = '---\n' +
    'layout: page\n' +
    'title: ' + category + '\n' +
    // TODO add filename cf #65
    '---\n\n' // +
  ;

  const addEntries = function(resultFeed) {
    let newPart = '';
    for (let item of resultFeed.items) {
      const today = new Date();
      const cutoff = new Date(today.getTime() - 31 * 24 * 60 * 60 * 1000); // only posts from past 31 days (ignoring leap seconds etc.)
      const itemDate = item.date;
      if ((cutoff < itemDate) && !(today < itemDate)) {
        newPart += '  <li> ' + '<a class="entry-title" href="' + item.url + '" rel="nofollow">' + ' <time datetime="' + itemDate + '" class="entry-date">' + itemDate.toUTCString().substring(5, 16) + '</time> ' + escapeMD(item.title) + '<span class="entry-blog">' + escapeMD(item.author) + '</span> </a> </li> \n';
      }
    }
    newPart = '<ul class="entry-list"> \n' + newPart + '</ul>\n';
    newPart += '<p> <a href="' + filename + '.xml">' + 'Grab the feed for ' + category + ' blogs!</a></p>\n';
    return newPart;
  };

  theOutput += addEntries(theFeed);
  fs.writeFile(path.resolve(__dirname,'../mathblogging.org/', filename + '.html'), theOutput, {mode:0o664}, function(err) {
    if (err) {
      console.log('error: couldn\'t write HTML for Category: ' + category);
      return console.log(err);
    }
    console.log('SUCCESS: HTML saved for Category: ' + category);
  });

  const xml = theFeed.xml({
    indent: true
  });
  fs.writeFile(path.resolve(__dirname,'../mathblogging.org/', filename + '.xml'), xml, {mode:0o664}, function(err) {
    if (err) {
      console.log('error: couldn\'t write Feed for Category: ' + category);
      return console.log(err);
    }
    console.log('SUCCESS: Feed saved for Category: ' + category);
  });
};
