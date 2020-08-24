const fs = require('fs');
const path = require('path');
const Twit = require('twit');
const Feed = require('rss');
const sortFeedByDate = require('./helpers.js').sortFeedByDate;

// helper functions

// fetch recent tweets of editor
const getEditor = async function (editor) {
  return T.get('statuses/user_timeline', {
    'screen_name': editor,
    include_rts: false,
    count: 180
  });
};

// fetch embedded tweet HTML snippet
const getEmbed = async function (tweetId) {
  return T.get('statuses/oembed', {
    id: tweetId,
    hide_thread: true,
    omit_script: false,
    align: 'center',
    maxwidth: '500'
  });
};

// filter out tweets by hashtag
const filterPicks = function (tweetData) {
  // filter tweets by filtering their hashtag arrays -- a bit ugly
  const filterHash = tweetData.entities.hashtags.filter(function (tag) {
    return (tag.text === 'mbpick') || (tag.text === 'mbpicks');
  });
  return (filterHash.length > 0 && !tweetData.favorited);
}

// process a tweet of an editor
const processPick = function (editorPick, editor, tweetIds, feedObject) {
  const tweetId = editorPick.id_str;
  if (tweetIds.has(tweetId)) return;
  // add ID to array of IDs for fetching embed snippets later
  tweetIds.add(tweetId);

  // add entry to feed
  let theLink = '';
  if (editorPick.entities.urls.length > 0) {
    theLink = editorPick.entities.urls[0].expanded_url;
  } else {
    theLink = 'https://twitter.com/' + editor + '/status/' + tweetId;
  }
  const itemOptions = {
    date: editorPick.created_at,
    title: '@' + editor + '\'s pick',
    link: theLink,
    guid: theLink,
    description: editorPick.text,
    author: '@' + editor
  };
  feedObject.item(itemOptions);

  // retweet
  // NOTE Twitter will ignore repeated retweets so we can just be dumb
  T.post('statuses/retweet/:id', {
    id: tweetId
  }, function (err, data, response) {
    // NOTE not logging errors with code 327 ("you have already retweeted this tweet")
    if (err && err.code !== 327) console.log(err)
    return new Promise(function (resolve, reject) {
      return true
    });

  })
}

// THE ACTION

// set up Twitter app secrets
// WARNING don't store secrets in a public repository!
const config = {
  "consumer_key": process.env.consumer_key,
  "consumer_secret": process.env.consumer_secret,
  "access_token": process.env.access_token,
  "access_token_secret": process.env.access_token_secret
};

const T = new Twit(config);

// twitter handles of our editors
const editors = ['MrHonner', 'fawnpnguyen', 'SheckyR', 'danaernst', 'pkrautz', 'ilaba'];

// initial feed object
const editorFeed = new Feed({
  title: 'Mathblogging.org -- Editors\' Picks',
  description: 'Your one stop shop for mathematical blogs',
  pubDate: new Date(),
  feed_url: 'https://mathblogging.org/editors-picks.xml',
  site_url: 'https://mathblogging.org/',
  // image: 'http://mathblogging.org/logo.png',
  copyright: 'No copyright asserted over individual posts; see original posts for copyright and/or licensing.',
  managingEditor: 'info@mathblogging.org (Mathblogging.org)'
});

// initial string for html (with jekyll metadata)
let editorPage = '---\n' +
  'layout: page\n' +
  'title: Editor\'s picks\n' +
  '---\n\n';
const tweetIds = new Set();

// old exports
// const oldExport = async() => {
//   for (let editor of editors) {
//     const twitResponse = await getEditor(editor);
//     const editorPicks = twitResponse.data.filter(filterPicks);
//     for (let pick of editorPicks) processPick(pick, editor, tweetIds, editorFeed);
//   }

//   // write feed
//   editorFeed.items.sort(sortFeedByDate);
//   const xml = editorFeed.xml({
//     indent: true
//   });
//   fs.writeFileSync(path.resolve(__dirname, '../mathblogging.org/editors-picks.xml'), xml);
//   console.log('SUCCESS: Feed saved for "Editors\' Picks"');

//   // write page to file
//   tweetIds.sort((a, b) => b - a);
//   for (let tweetid of tweetIds) {
//     const embed = await getEmbed(tweetid);
//     editorPage += embed.data.html.replace(/<script async src="\/\/platform.twitter.com\/widgets.js" charset="utf-8"><\/script>/g,'') + '\n';
//   }
//   editorPage += '<p> <a href="editors-picks.xml">' + 'Grab the feed for our Editors\' Picks!</a></p>\n';
//   editorPage += `<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`
//   fs.writeFileSync(path.resolve(__dirname, '../mathblogging.org/index.md'), editorPage);
//   console.log('SUCCESS: HTML saved for "Editors\' Picks"');
// };


const mathbloggingTimeline = async function () {
  return T.get('statuses/mentions_timeline', {
    'screen_name': "mathblogging",
    'include_rts': false,
    'tweet_mode': 'extended',
    'count': 200
  });
};

// filter out tweets by hashtag
const filterTimeline = function (tweetObj) {
  // filter tweets by filtering their hashtag arrays -- a bit ugly
  const filterHash = tweetObj.entities.hashtags.filter(function (tag) {
    return (tag.text === 'mbpick') || (tag.text === 'mbpicks');
  });
  return ( (editors.indexOf(tweetObj.user.screen_name) > -1) && filterHash.length > 0 && !tweetObj.favorited);
}

const main = async(directory) => {
  for (let editor of editors) {
    const twitResponse = await getEditor(editor);
    const editorPicks = twitResponse.data.filter(filterPicks);
    for (let pick of editorPicks) processPick(pick, editor, tweetIds, editorFeed);
  }
  const timeline = await mathbloggingTimeline();
  const editorPicks = timeline.data.filter(filterTimeline);
  for (let pick of editorPicks) {
    const editor = pick.user.screen_name;
    processPick(pick, editor, tweetIds, editorFeed);
  }

  // write feed
  editorFeed.items.sort(sortFeedByDate);
  const xml = editorFeed.xml({
    indent: true
  });
  fs.writeFileSync(path.resolve(directory, './editors-picks.xml'), xml);
  console.log('SUCCESS: Feed saved for "Editors\' Picks"');

  // write page to file
  const tweetIdsArray = [...tweetIds].sort((a, b) => b - a);
  for (let tweetid of tweetIdsArray) {
    const embed = await getEmbed(tweetid);
    editorPage += embed.data.html.replace(/<script async src="\/\/platform.twitter.com\/widgets.js" charset="utf-8"><\/script>/g,'') + '\n';
  }
  editorPage += '<p> <a href="editors-picks.xml">' + 'Grab the feed for our Editors\' Picks!</a></p>\n';
  editorPage += `<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`
  fs.writeFileSync(path.resolve(directory, './index.md'), editorPage);
  console.log('SUCCESS: HTML saved for "Editors\' Picks"');
};


module.exports = main;
