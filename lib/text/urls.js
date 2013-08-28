module.exports = function Urls() {
  var urls = [];

  return {
    // Strip urls by replacing them by the __URL__
    // marker for further restoring. It's done via string scanning
    // instead of regexps to speed up the process.
    escape: function(data) {
      var nextStart = 0;
      var nextEnd = 0;
      var cursor = 0;
      var tempData = [];

      for (; nextEnd < data.length; ) {
        nextStart = data.indexOf('url(', nextEnd);
        if (nextStart == -1)
          break;

        nextEnd = data.indexOf(')', nextStart);

        tempData.push(data.substring(cursor, nextStart));
        tempData.push('__URL__');
        urls.push(data.substring(nextStart, nextEnd + 1));
        cursor = nextEnd + 1;
      }

      return tempData.length > 0 ?
        tempData.join('') + data.substring(cursor, data.length) :
        data;
    },

    restore: function(data) {
      return data.replace(/__URL__/g, function() {
        return urls.shift();
      });
    }
  };
};
