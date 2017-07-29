exports.escapeMarkdown = function (string) {
  var newString = string.replace('|', '\\|');
  newString = newString.replace(/\n/g, ' ');
  return newString;
};

exports.categoryToUrl = function (string) {
  return string.toLowerCase().replace(/ |'|&/g, '_');
}


exports.filterEntriesByCategory = function (category, entries) {
  if (category === 'Posts') return entries;
  else return entries.filter((entry) => entry.categories.includes(category));
}

exports.filterCategories = function (entries) {
  const categories = new Set();
  entries.forEach((entry) => {
    entry.categories.forEach((category) => categories.add(category))
  })
  return categories;
};

exports.sortFeedByDate = function (itemA, itemB) {
  return itemB.date - itemA.date;
};
