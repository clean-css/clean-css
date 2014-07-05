(function() {
  var QuoteScanner = function QuoteScanner(data) {
    this.data = data;
  };

  var findCommentEnd = function(data, matched, cursor) {
    var commentStartMark = '/*';
    var commentEndMark = '*/';
    var escapeMark = '\\';
    var commentStarted = false;

    while (true) {
      if (data[cursor] === undefined)
        break;
      if (!commentStarted && data[cursor] == commentEndMark[1] && data[cursor - 1] == commentEndMark[0])
        break;
      if (data[cursor] == matched && data[cursor - 1] != escapeMark)
        break;
      if (data[cursor] == commentStartMark[1] && data[cursor - 1] == commentStartMark[0])
        commentStarted = true;

      cursor++;
    }

    return cursor;
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
      if (text.length > 0)
        callback(text, tempData, nextStart);

      cursor = nextEnd + 1;
    }

    return tempData.length > 0 ?
      tempData.join('') + data.substring(cursor, data.length) :
      data;
  };

  module.exports = QuoteScanner;
})();
