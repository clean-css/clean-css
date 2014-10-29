function removeWhitespace(match, value) {
  return '[' + value.replace(/ /g, '') + ']';
}

function selectorSorter(s1, s2) {
  return s1.value > s2.value ? 1 : -1;
}

var CleanUp = {
  selectors: function (selectors) {
    var plain = [];
    var tokenized = [];

    for (var i = 0, l = selectors.length; i < l; i++) {
      var selector = selectors[i];
      var value = selector.value;
      var reduced = value
        .replace(/\s/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .replace(/ ?, ?/g, ',')
        .replace(/\s*([>\+\~])\s*/g, '$1')
        .trim();

      if (value.indexOf('*') > -1) {
        reduced = reduced
          .replace(/\*([:#\.\[])/g, '$1')
          .replace(/^(\:first\-child)?\+html/, '*$1+html');
      }

      if (value.indexOf('[') > -1)
        reduced = reduced.replace(/\[([^\]]+)\]/g, removeWhitespace);

      if (plain.indexOf(reduced) == -1) {
        plain.push(reduced);
        selector.value = reduced;
        tokenized.push(selector);
      }
    }

    return {
      list: plain.sort(),
      tokenized: tokenized.sort(selectorSorter)
    };
  },

  block: function (block) {
    return block
      .replace(/(\s{2,}|\s)/g, ' ')
      .replace(/(,|:|\() /g, '$1')
      .replace(/ \)/g, ')');
  },

  atRule: function (block) {
    return block
      .replace(/\s/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
};

module.exports = CleanUp;
