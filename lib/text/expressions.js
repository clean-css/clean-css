module.exports = function Expressions() {
  var expressions = [];

  var findEnd = function(data, start) {
    var end = start + 'expression'.length;
    var level = 0;
    var quoted = false;

    while(true) {
      var next = data[end++];

      if (quoted) {
        quoted = next != '\'' && next != '"';
      } else {
        quoted = next == '\'' || next == '"';

        if (next == '(')
          level++;
        if (next == ')')
          level--;
      }

      if (level === 0 || !next)
        break;
    }

    return end;
  };

  return {
    // Escapes expressions by replacing them by the __EXPRESSION__
    // marker for further restoring. It's done via string scanning
    // instead of regexps to speed up the process.
    escape: function(data) {
      var nextStart = 0;
      var nextEnd = 0;
      var cursor = 0;
      var tempData = [];

      for (; nextEnd < data.length; ) {
        nextStart = data.indexOf('expression(', nextEnd);
        if (nextStart == -1)
          break;

        nextEnd = findEnd(data, nextStart);

        tempData.push(data.substring(cursor, nextStart));
        tempData.push('__EXPRESSION__');
        expressions.push(data.substring(nextStart, nextEnd));
        cursor = nextEnd;
      }

      return tempData.length > 0 ?
        tempData.join('') + data.substring(cursor, data.length) :
        data;
    },

    restore: function(data) {
      return data.replace(/__EXPRESSION__/g, function() {
        return expressions.shift();
      });
    }
  };
};
