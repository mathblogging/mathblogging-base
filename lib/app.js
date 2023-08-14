const fs = require('fs');
const path = require('path');

const filterCategories = require('./helpers.js').filterCategories;
const createSidebar = require('./specialPages.js').createSidebar;
const createBlogIndex = require('./specialPages.js').createBlogIndex;
const publishCategory = require('./publishCategory.js').publishCategory;
const editors = require('./editors.js');

const mathbloggingDir = path.resolve(process.argv[2]);
if (!mathbloggingDir) {
    console.warn('No CLI argument for target directory -- stopping')
    return;
}

// The action

// load the json files
const feeds = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/feeds.json'), 'utf8'));
const entries = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/entries.json'), 'utf8'));

// extract categories
const categories = filterCategories(entries);

// create sidebar HTML (jekyll include for navigation)
createSidebar(categories, mathbloggingDir);

// create the blog index page (for easy look-up of current list of blogs)
createBlogIndex(feeds.blogs, mathbloggingDir);

// merge feeds for each category and process
categories.forEach((category) => publishCategory(category, entries, mathbloggingDir));

// generate homepage
publishCategory('Homepage', entries, mathbloggingDir)

// generate Editors' Picks
// editors(mathbloggingDir);
