/* eslint-env node */

exports.escapeMarkdown = function (string) {
  'use strict';
  var newString = string.replace('|', '\\|');
  newString = newString.replace(/\n/g, ' ');
  return newString;
};
