# mathblogging-base

A new base for mathblogging.org

## How it works

This code base is a very simple "feed planet". It takes a bunch of feeds (organized by categories), fetches them, creates a (Jekyll) page and feed merging the feeds of each category. It also grabs some Twitter data to pull in "picks" from editors. Finally, there are some automation tools for running a cron job to build the site continuously.

## The various parts

### data

* `data/feeds.json`:  a json file consisting of feed URLs and category names for each URL

### the main parts

* `lib/feedFetchTrimmer.js`:  fetches feeds, filters recent posts and saves them in feed/
* `lib/feedmerger.js`:  merges a bunch of feeds into a new feed
* `lib/pagewriter.js`:  takes feed object and writes out a jekyll page
* `lib/editors.js`:  fetches twitter data and generates the frontpage
* `lib/specialPages.js`:  generate special jekyll content
* `lib/feedJsonHelpers.js`:  helpers for wrangling data/feeds.json
* `lib/helpers`:  a few simple helper functions
* `lib/app.js`:  puts the pieces together

### tools

* `tools/csv_to_json.js`:  fetches csv data from Google Sheets and generates `data/feeds.json` from it
* `tools/cse.js`:  logs out the homepage URLs for all feeds to feed into a Google Custom Search Engine.

### automation

* `bin/run_feedFetchTrimmer.js`: a wrapper for queuing feed aggregation
* `bin/run.sh`:  simple script (assuming a bunch of things) for a cron job which runs all the things and pushes updates out to https://github.com/mathblogging/mathblogging.org.

## How to re-use

First, you need a simple spreadsheet with entries like

    feedURL, category1, category2, category3

Then you'll need to remove all mathblogging specific data.

For example,

* `lib/editors.js`: change the array of Twitter handles to match your group of editors and set up your Twitter app secrets.
* Replace all references to `./mathblogging.org` to match the name of your Jekyll site (cloned into a subfolder).
* Replace all other mentions of mathblogging.org

Not perfect, we know. If you need help, file an issue.
