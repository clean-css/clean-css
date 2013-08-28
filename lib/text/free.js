module.exports = function Free() {
  var texts = [];

  return {
    // Strip content tags by replacing them by the __CSSFREETEXT__
    // marker for further restoring. It's done via string scanning
    // instead of regexps to speed up the process.
    escape: function(data) {
      var tempData = [];
      var nextStart = 0;
      var nextEnd = 0;
      var cursor = 0;
      var matchedParenthesis = null;
      var singleParenthesis = "'";
      var doubleParenthesis = '"';
      var dataLength = data.length;

      for (; nextEnd < data.length; ) {
        var nextStartSingle = data.indexOf(singleParenthesis, nextEnd + 1);
        var nextStartDouble = data.indexOf(doubleParenthesis, nextEnd + 1);

        if (nextStartSingle == -1)
          nextStartSingle = dataLength;
        if (nextStartDouble == -1)
          nextStartDouble = dataLength;

        if (nextStartSingle < nextStartDouble) {
          nextStart = nextStartSingle;
          matchedParenthesis = singleParenthesis;
        } else {
          nextStart = nextStartDouble;
          matchedParenthesis = doubleParenthesis;
        }

        if (nextStart == -1)
          break;

        nextEnd = data.indexOf(matchedParenthesis, nextStart + 1);
        if (nextStart == -1 || nextEnd == -1)
          break;

        tempData.push(data.substring(cursor, nextStart));
        tempData.push('__CSSFREETEXT__');
        texts.push(data.substring(nextStart, nextEnd + 1));
        cursor = nextEnd + 1;
      }

      return tempData.length > 0 ?
        tempData.join('') + data.substring(cursor, data.length) :
        data;
    },

    restore: function(data) {
      return data.replace(/__CSSFREETEXT__/g, function() {
        return texts.shift();
      });
    }
  };
};
