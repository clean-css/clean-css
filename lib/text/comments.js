module.exports = function Comments(keepSpecialComments, keepBreaks, lineBreak) {
  var comments = [];

  return {
    // Strip special comments (/*! ... */) by replacing them by __CSSCOMMENT__ marker
    // for further restoring. Plain comments are removed. It's done by scanning data using
    // String#indexOf scanning instead of regexps to speed up the process.
    escape: function(data) {
      var tempData = [];
      var nextStart = 0;
      var nextEnd = 0;
      var cursor = 0;

      for (; nextEnd < data.length; ) {
        nextStart = data.indexOf('/*', nextEnd);
        nextEnd = data.indexOf('*/', nextStart + 2);
        if (nextStart == -1 || nextEnd == -1)
          break;

        tempData.push(data.substring(cursor, nextStart));
        if (data[nextStart + 2] == '!') {
          // in case of special comments, replace them with a placeholder
          comments.push(data.substring(nextStart, nextEnd + 2));
          tempData.push('__CSSCOMMENT__');
        }
        cursor = nextEnd + 2;
      }

      return tempData.length > 0 ?
        tempData.join('') + data.substring(cursor, data.length) :
        data;
    },

    restore: function(data) {
      var commentsCount = comments.length;
      var breakSuffix = keepBreaks ? lineBreak : '';

      return data.replace(new RegExp('__CSSCOMMENT__(' + lineBreak + '| )?', 'g'), function() {
        switch (keepSpecialComments) {
          case '*':
            return comments.shift() + breakSuffix;
          case 1:
          case '1':
            return comments.length == commentsCount ?
              comments.shift() + breakSuffix :
              '';
          case 0:
          case '0':
            return '';
        }
      });
    }
  };
};
