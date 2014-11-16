var SourceMapConsumer = require('source-map').SourceMapConsumer;

var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');
var url = require('url');

var SOURCE_MARKER_START = /__ESCAPED_SOURCE_CLEAN_CSS\(([^~][^\)]+)\)__/;
var SOURCE_MARKER_END = /__ESCAPED_SOURCE_END_CLEAN_CSS__/;
var MAP_MARKER = /\/\*# sourceMappingURL=(\S+) \*\//;

var DEFAULT_TIMEOUT = 5000;


function InputSourceMapStore(options, outerContext) {
  this.options = options;
  this.errors = outerContext.errors;
  this.timeout = (options.inliner && options.inliner.timeout) || DEFAULT_TIMEOUT;
  this.requestOptions = (options.inliner && options.inliner.request) || {};

  this.maps = {};
}

function merge(source1, source2) {
  var target = {};
  for (var key1 in source1)
    target[key1] = source1[key1];
  for (var key2 in source2)
    target[key2] = source2[key2];

  return target;
}

function fromString(self, data, whenDone) {
  self.maps[undefined] = new SourceMapConsumer(self.options.sourceMap);
  return whenDone();
}

function fromSource(self, data, whenDone, context) {
  var nextAt = 0;

  function proceedToNext() {
    context.cursor += nextAt + 1;
    fromSource(self, data, whenDone, context);
  }

  while (context.cursor < data.length) {
    var fragment = data.substring(context.cursor);

    var markerStartMatch = SOURCE_MARKER_START.exec(fragment) || { index: -1 };
    var markerEndMatch = SOURCE_MARKER_END.exec(fragment) || { index: -1 };
    var mapMatch = MAP_MARKER.exec(fragment) || { index: -1 };

    nextAt = data.length;
    if (markerStartMatch.index > -1)
      nextAt = markerStartMatch.index;
    if (markerEndMatch.index > -1 && markerEndMatch.index < nextAt)
      nextAt = markerEndMatch.index;
    if (mapMatch.index > -1 && mapMatch.index < nextAt)
      nextAt = mapMatch.index;

    if (nextAt == data.length)
      break;

    if (nextAt == markerStartMatch.index) {
      context.files.push(markerStartMatch[1]);
    } else if (nextAt == markerEndMatch.index) {
      context.files.pop();
    } else if (nextAt == mapMatch.index) {
      var isRemote = /^https?:\/\//.test(mapMatch[1]) || /^\/\//.test(mapMatch[1]);
      if (isRemote) {
        return fetchMapFile(self, mapMatch[1], context, proceedToNext);
      } else {
        var inputMapData = fs.readFileSync(path.join(self.options.root || '', mapMatch[1]), 'utf-8');
        self.maps[context.files[context.files.length - 1] || undefined] = new SourceMapConsumer(inputMapData);
      }
    }

    context.cursor += nextAt + 1;
  }

  return whenDone();
}

function fetchMapFile(self, mapSource, context, done) {
  function handleError(status) {
    context.errors.push('Broken source map at "' + mapSource + '" - ' + status);
    return done();
  }

  var method = mapSource.indexOf('https') === 0 ? https : http;
  var requestOptions = merge(url.parse(mapSource), self.requestOptions);

  method
    .get(requestOptions, function (res) {
      if (res.statusCode < 200 || res.statusCode > 299)
        return handleError(res.statusCode);

      var chunks = [];
      res.on('data', function (chunk) {
        chunks.push(chunk.toString());
      });
      res.on('end', function () {
        self.maps[context.files[context.files.length - 1] || undefined] = new SourceMapConsumer(chunks.join(''));
        done();
      });
    })
    .on('error', function(res) {
      handleError(res.message);
    })
    .on('timeout', function() {
      handleError('timeout');
    })
    .setTimeout(self.timeout);
}

InputSourceMapStore.prototype.track = function (data, whenDone) {
  return typeof this.options.sourceMap == 'string' ?
    fromString(this, data, whenDone) :
    fromSource(this, data, whenDone, { files: [], cursor: 0, errors: this.errors });
};

InputSourceMapStore.prototype.isTracking = function () {
  return Object.keys(this.maps).length > 0;
};

InputSourceMapStore.prototype.originalPositionFor = function (sourceInfo) {
  return this.maps[sourceInfo.source].originalPositionFor(sourceInfo);
};

module.exports = InputSourceMapStore;
