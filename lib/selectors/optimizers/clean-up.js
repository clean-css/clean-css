function removeWhitespace(match, value) {
  return '[' + value.replace(/ /g, '') + ']';
}

var CleanUp = {
  selectors: function (selectors) {
    var plain = [];

    for (var i = 0, l = selectors.length; i < l; i++) {
      var selector = selectors[i].value;
      var reduced = selector.replace(/\s*([>\+\~])\s*/g, '$1');

      if (selector.indexOf('*') > -1) {
        reduced = reduced
          .replace(/\*([:#\.\[])/g, '$1')
          .replace(/^(\:first\-child)?\+html/, '*$1+html');
      }

      if (selector.indexOf('[') > -1)
        reduced = reduced.replace(/\[([^\]]+)\]/g, removeWhitespace);

      if (plain.indexOf(reduced) == -1)
        plain.push(reduced);
    }

    return plain.sort().map(function (selector) {
      return { value: selector };
    });
  },

  block: function (block) {
    return block
      .replace(/(\s{2,}|\s)/g, ' ')
      .replace(/(,|:|\() /g, '$1')
      .replace(/ \)/g, ')');
  }
};

module.exports = CleanUp;
