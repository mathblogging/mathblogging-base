const fs = require('fs');
const path = require('path');
const https = require('https');

const csv2json = function (csv) {
  // console.log(csv);
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
     // if (!cells[c]) continue;
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

// google sheets URL to public sheet (as CSV)
// const csvUrl = 'https://docs.google.com/spreadsheets/d/1tDmRWouGtsN1VGg1_77Z8hnb7FeHkppqbGCfSsDq9wk/pub?gid=1891944288&single=true&output=csv';

const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTohVihVKYUFb7REtchf6PcoMejdrgEj4oTAphUhSUeREOau9QU8n1wGKg9cWNSmxMhMP1D3WKeyiw9/pub?gid=1891944288&single=true&output=csv';

//const stream = https.get(csvUrl, (res) => {
//  const chunks = [];
//  res.on('data', (chunk) => {
//    chunks.push(chunk);
//  });
//  res.on('end', () => {
//    csv2json(chunks.join(''));
//  })
//}).on('error', (error) => {
//  throw error;
//});

const csvData = fs.readFileSync('data.csv').toString();
csv2json(csvData);
