var EscapeStore = require('./escape-store');

var UrlsProcessor = function UrlsProcessor(context) {
  this.urls = new EscapeStore('URL');
  this.context = context;
};

// Strip urls by replacing them by a special
// marker for further restoring. It's done via string scanning
// instead of regexps to speed up the process.
UrlsProcessor.prototype.escape = function (data) {
  var nextStart = 0;
  var nextEnd = 0;
  var cursor = 0;
  var tempData = [];

  for (; nextEnd < data.length;) {
    nextStart = data.indexOf('url(', nextEnd);
    if (nextStart == -1)
      break;

    nextEnd = data.indexOf(')', nextStart);
    // Following lines are a safety mechanism to ensure
    // incorrectly terminated urls are processed correctly.
    if (nextEnd == -1) {
      nextEnd = data.indexOf('}', nextStart);

      if (nextEnd == -1)
        nextEnd = data.length;
      else
        nextEnd--;

      this.context.warnings.push('Broken URL declaration: \'' + data.substring(nextStart, nextEnd + 1) + '\'.');
    }

    var url = data.substring(nextStart, nextEnd + 1);
    var placeholder = this.urls.store(url);
    tempData.push(data.substring(cursor, nextStart));
    tempData.push(placeholder);

    cursor = nextEnd + 1;
  }

  return tempData.length > 0 ?
    tempData.join('') + data.substring(cursor, data.length) :
    data;
};

function normalize(url) {
  url = url
    .replace(/\\?\n|\\?\r\n/g, '')
    .replace(/(\s{2,}|\s)/g, ' ')
    .replace(/^url\((['"])? /, 'url($1')
    .replace(/ (['"])?\)$/, '$1)');

  if (url.indexOf(' ') == -1 && !/url\(['"]data:[^;]+;charset/.test(url))
    url = url.replace(/["']/g, '');

  return url;
}

UrlsProcessor.prototype.restore = function (data) {
  var tempData = [];
  var cursor = 0;

  for (; cursor < data.length;) {
    var nextMatch = this.urls.nextMatch(data, cursor);
    if (nextMatch.start < 0)
      break;

    tempData.push(data.substring(cursor, nextMatch.start));
    var url = normalize(this.urls.restore(nextMatch.match));
    tempData.push(url);

    cursor = nextMatch.end;
  }

  return tempData.length > 0 ?
    tempData.join('') + data.substring(cursor, data.length) :
    data;
};

module.exports = UrlsProcessor;
