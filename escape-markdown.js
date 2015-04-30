#! /usr/bin/env node

exports.escapeMarkdown = function (string) {
  var newString = string.replace('|','\\|');
  return newString;
};