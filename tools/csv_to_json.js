const fs = require('fs');
const path = require('path');

const csv = fs.readFileSync(path.resolve(__dirname, '../data/feeds.csv'), 'utf8');
const lines = csv.split('\n');
const feedsJson = {
  blogs: []
};

for (let line of lines) {
  var cells = line.split(',');
  var entry = {
    url: cells[0],
    categories: []
  };
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
