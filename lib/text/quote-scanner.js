(function() {
  var QuoteScanner = function QuoteScanner(data) {
    this.data = data;
  };

  var findNonEscapedEnd = function(data, matched, start) {
    var end = start;
    while (true) {
      end = data.indexOf(matched, end);

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

      nextEnd = findNonEscapedEnd(data, matchedMark, nextStart + 1);
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
