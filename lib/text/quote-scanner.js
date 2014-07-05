(function() {
  var QuoteScanner = function QuoteScanner(data) {
    this.data = data;
  };

  var findCommentEnd = function(data, matched, start) {
    var commentStartMark = '/*';
    var commentEndMark = '*/';
    var end = start;
    while (true) {
      var from = end;

      end = data.indexOf(matched, from);
      var commentStart = data.indexOf(commentStartMark, from);
      var commentEnd = data.indexOf(commentEndMark, from);

      if (end > -1 && commentEnd > -1 && commentEnd < end && (commentStart == -1 || commentStart > commentEnd)) {
        end = commentEnd + 1;
        break;
      }

      if (end > -1 && data[end - 1] == '\\') {
        end += 1;
        continue;
      } else {
        break;
      }
    }

    return end;
  };

  QuoteScanner.prototype.each = function(callback) {
    var data = this.data;
    var tempData = [];
    var nextStart = 0;
    var nextEnd = 0;
    var cursor = 0;
    var matchedMark = null;
    var singleMark = '\'';
    var doubleMark = '"';
    var dataLength = data.length;

    for (; nextEnd < data.length;) {
      var nextStartSingle = data.indexOf(singleMark, nextEnd + 1);
      var nextStartDouble = data.indexOf(doubleMark, nextEnd + 1);

      if (nextStartSingle == -1)
        nextStartSingle = dataLength;
      if (nextStartDouble == -1)
        nextStartDouble = dataLength;

      if (nextStartSingle < nextStartDouble) {
        nextStart = nextStartSingle;
        matchedMark = singleMark;
      } else {
        nextStart = nextStartDouble;
        matchedMark = doubleMark;
      }

      if (nextStart == -1)
        break;

      nextEnd = findCommentEnd(data, matchedMark, nextStart + 1);
      if (nextEnd == -1)
        break;

      var text = data.substring(nextStart, nextEnd + 1);
      tempData.push(data.substring(cursor, nextStart));
      callback(text, tempData, nextStart);

      cursor = nextEnd + 1;
    }

    return tempData.length > 0 ?
      tempData.join('') + data.substring(cursor, data.length) :
      data;
  };

  module.exports = QuoteScanner;
})();
