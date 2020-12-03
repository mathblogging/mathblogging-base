const fs = require('fs');
const path = require('path');
const FeedParser = require('feedparser');

const extractBlogEntries = function (results, blog, index) {
    const categories = blog.categories;
    const sourcexml = './feeds/' + blog.id + '.xml';

    const feedparser = new FeedParser();
    const stream = fs.createReadStream(sourcexml);

    stream.on('error', function (error) {
        console.log('generateEntries: BLOGID ' + blog.id + ' (READ ERROR) ' + error.message);
    })
    stream.pipe(feedparser);

    feedparser.on('error', function (error) {
        console.log('generateEntries: BLOGID ' + blog.id+  ' (PARSE ERROR) ' + error);
    });

    feedparser.on('readable', function () {
        // This is where the action is!
        const stream = this;

        const today = new Date();
        console.log(today.toISOString())
        const cutoff = new Date(today.getTime() - 31 * 24 * 60 * 60 * 1000); // only posts from past 31 days (ignoring leap seconds etc.)
        let item;
        while ((item = stream.read())) {
            const itemDate = item.pubdate || item.date;
            if ((cutoff < itemDate) && !(today < itemDate)) {
                const entry = {
                    categories: categories,
                    date: itemDate,
                    postTitle: item.title,
                    // HACK for issue #43
                    url: item.link || item['atom:link']['@']['href'],
                    blogTitle: this.meta.title || '[UNTITLED BLOG]'
                };
                results.push(entry);
            }
        }
    });
    feedparser.on('finish', function () {
        runner(index+1);
    });
};

const runner = (index) => {
  if (FeedsJson.blogs[index]) {
    extractBlogEntries(results, FeedsJson.blogs[index], index);
  }
  else {
      // sort by descending date to ensure pages and feeds are written in the expected order
      results.sort((a,b) => b.date - a.date);
      fs.writeFileSync('./data/entries.json',JSON.stringify(results, null, 4));
      console.log('entries.json has been saved');
  }
}

const data = fs.readFileSync(path.resolve(__dirname, '../data/feeds.json'), 'utf8');
const FeedsJson = JSON.parse(data);
const results = [];

runner(0);
