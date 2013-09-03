var path = require('path');

module.exports = {
  process: function(data, fromBase, toBase) {
    var tempData = [];
    var nextStart = 0;
    var nextEnd = 0;
    var cursor = 0;

    for (; nextEnd < data.length; ) {
      nextStart = data.indexOf('url(', nextEnd);
      if (nextStart == -1)
        break;
      nextEnd = data.indexOf(')', nextStart + 4);
      if (nextEnd == -1)
        break;

      tempData.push(data.substring(cursor, nextStart));
      var url = data.substring(nextStart + 4, nextEnd).replace(/['"]/g, '');
      if (url[0] != '/' && url.indexOf('data:') !== 0 && url.substring(url.length - 4) != '.css')
        url = path.relative(toBase, path.join(fromBase, url)).replace(/\\/g, '/');
      tempData.push('url(' + url + ')');
      cursor = nextEnd + 1;
    }

    return tempData.length > 0 ?
      tempData.join('') + data.substring(cursor, data.length) :
      data;
  }
};
