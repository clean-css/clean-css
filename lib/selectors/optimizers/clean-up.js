var CleanUp = {
  selectors: function (selectors) {
    var plain = [];

    for (var i = 0, l = selectors.length; i < l; i++) {
      var reduced = selectors[i]
        .replace(/\s*([>\+\~])\s*/g, '$1')
        .replace(/\*([:#\.\[])/g, '$1')
        .replace(/\[([^\]]+)\]/g, function (match, value) { return '[' + value.replace(/\s/g, '') + ']'; })
        .replace(/^(\:first\-child)?\+html/, '*$1+html');

      if (plain.indexOf(reduced) == -1)
        plain.push(reduced);
    }

    return plain.sort();
  },

  block: function (block) {
    return block
      .replace(/(\s{2,}|\s)/g, ' ')
      .replace(/(,|:|\() /g, '$1')
      .replace(/ \)/g, ')');
  }
};

module.exports = CleanUp;
