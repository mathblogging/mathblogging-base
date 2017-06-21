const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(path.resolve(__dirname,'../feeds/'));

const printHomeURL = function (filename) {
  const file = fs.readFileSync('./feeds/' + filename, 'utf8');
  const matches = /<link>(.*)<\/link>/.exec(file);
  if (matches && matches[1] !== 'http://github.com/dylang/node-rss') {
    console.log(matches[1]);
  }
}
files.forEach(printHomeURL);
