const sanitize = require('sanitize-filename');

exports.escapeMarkdown = function (string) {
  'use strict';
  var newString = string.replace('|', '\\|');
  newString = newString.replace(/\n/g, ' ');
  return newString;
};

exports.categoryToUrl = function (string) {
  return string.toLowerCase().replace(/ |'|&/g, '_');
}

exports.urlToFilename = function (blogObject) {
  return './feeds/' + sanitize(blogObject.url) + '.xml';
};
