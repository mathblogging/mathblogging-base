/* eslint-env node */

exports.escapeMarkdown = function (string) {
  'use strict';
  var newString = string.replace('|', '\\|');
  return newString;
};
