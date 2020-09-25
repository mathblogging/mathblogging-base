const fs = require('fs');
const path = require('path');
const Feed = require('rss');

const editorsPicks = require('./editorsPicks.json').slice(0, 17);

const main = async (directory) => {
  // initial feed object
  const editorFeed = new Feed({
    title: "Mathblogging.org -- Editors' Picks",
    description: 'Your one stop shop for mathematical blogs',
    pubDate: new Date(),
    feed_url: 'https://mathblogging.org/editors-picks.xml',
    site_url: 'https://mathblogging.org/',
    // image: 'https://mathblogging.org/logo.png',
    copyright:
      'No copyright asserted over individual posts; see original posts for copyright and/or licensing.',
    managingEditor: 'info@mathblogging.org (Mathblogging.org)',
  });

  // initial string for html (with jekyll metadata)
  let editorPage =
    '---\n' + 'layout: page\n' + "title: Editor's picks\n" + '---\n\n';

  for (let editorPick of editorsPicks) {
    // add to page
    editorPage += editorPick.embed;
    // add to feed
    editorFeed.item({
      date: editorPick.date,
      title: editorPick.editor + "'s pick",
      link: editorPick.url,
      guid: editorPick.url,
      description: editorPick.embed,
      author: editorPick.editor,
    });
  }

  editorPage +=
    '<p> <a href="editors-picks.xml">' +
    "Grab the feed for our Editors' Picks!</a></p>\n";

  fs.writeFileSync(path.resolve(directory, './index.md'), editorPage);
  console.log('SUCCESS: HTML saved for "Editors\' Picks"');

  // write feed
  const xml = editorFeed.xml({
    indent: true,
  });
  fs.writeFileSync(path.resolve(directory, './editors-picks.xml'), xml);
  console.log('SUCCESS: Feed saved for "Editors\' Picks"');
};

module.exports = main;
