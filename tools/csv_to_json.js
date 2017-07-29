const fs = require('fs');
const path = require('path');
const got = require('got');

const csvUrl = 'https://docs.google.com/spreadsheets/d/1tDmRWouGtsN1VGg1_77Z8hnb7FeHkppqbGCfSsDq9wk/pub?gid=1891944288&single=true&output=csv';

const csv2json = function (csv) {
  const lines = csv.split('\n');
  const feedsJson = {
    blogs: []
  };
  let wgetList = '';

  for (let [index, line] of lines.entries()) {
    var cells = line.split(',');
    var entry = {
      id: index.toString(),
      url: cells[0],
      categories: ['Posts']
    };
    wgetList += entry.url + '\n';
    for (let c = 1; c < 4; c++) {
      const category = cells[c].trim();
      if (category !== "" && entry.categories.indexOf(category) < 0) entry.categories.push(category);
    }
    feedsJson.blogs.push(entry);
  }

  fs.writeFile(path.resolve(__dirname, '../data/feeds.json'), JSON.stringify(feedsJson, null, 4), function (e) {
    if (e) {
      throw e;
    }
  });
  fs.writeFile(path.resolve(__dirname, '../data/wgetList.txt'), wgetList, function (e) {
    if (e) {
      throw e;
    }
  });
}

got(csvUrl)
  .then(response => {
    csv2json(response.body)
    //=> '<!doctype html> ...'
  })
  .catch(error => {
    console.log(error.response.body);
    //=> 'Internal server error ...'
  });
