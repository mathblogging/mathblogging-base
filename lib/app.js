const fs = require('fs');
const path = require('path');

const filterCategories = require('./feedJsonHelpers.js').filterCategories;
const createSidebar = require('./specialPages.js').createSidebar;
const createBlogIndex = require('./specialPages.js').createBlogIndex;
const feedFilenamesForCategory = require('./feedJsonHelpers.js').feedFilenamesForCategory;
const mergeFeedsOfCategory = require('./feedJsonHelpers.js').mergeFeedsOfCategory;
const editors = require('./editors.js');

// The action

// load the main json file
const FeedsJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/feeds.json'), 'utf8'));

// extract categories
const categories = filterCategories(FeedsJson);

// create sidebar HTML (jekyll include for navigation)
createSidebar(categories);

// create the blog index page (for easy look-up of current list of blogs)
createBlogIndex(FeedsJson.blogs);

// merge feeds for each category and process
for (let category of categories) {
  mergeFeedsOfCategory(category, feedFilenamesForCategory(FeedsJson, category))
}
// generate all-posts page
mergeFeedsOfCategory('Posts', feedFilenamesForCategory(FeedsJson, 'Posts'))

// generate Editors' Picks
editors();
