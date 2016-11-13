function ruleSorter(s1, s2) {
  return s1[0] > s2[0] ? 1 : -1;
}

function tidyRuleDuplicates(rules) {
  var list = [];
  var repeated = [];

  for (var i = 0, l = rules.length; i < l; i++) {
    var rule = rules[i];

    if (repeated.indexOf(rule[0]) == -1) {
      repeated.push(rule[0]);
      list.push(rule);
    }
  }

  return list.sort(ruleSorter);
}

module.exports = tidyRuleDuplicates;
