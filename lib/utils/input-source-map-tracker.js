var SourceMapConsumer = require('source-map').SourceMapConsumer;

var fs = require('fs');
var path = require('path');

var SOURCE_MARKER_START = /__ESCAPED_SOURCE_CLEAN_CSS\(([^~][^\)]+)\)__/;
var SOURCE_MARKER_END = /__ESCAPED_SOURCE_END_CLEAN_CSS__/;
var MAP_MARKER = /\/\*# sourceMappingURL=(\S+) \*\//;

function InputSourceMapStore(options) {
  this.options = options;
  this.maps = {};
}

InputSourceMapStore.prototype.track = function (data) {
  if (typeof this.options.sourceMap == 'string') {
    this.maps[undefined] = new SourceMapConsumer(this.options.sourceMap);
    this.options.sourceMap = true;
    return this;
  }

  var files = [];
  for (var cursor = 0, len = data.length; cursor < len; ) {
    var fragment = data.substring(cursor, len);

    var markerStartMatch = SOURCE_MARKER_START.exec(fragment) || { index: -1 };
    var markerEndMatch = SOURCE_MARKER_END.exec(fragment) || { index: -1 };
    var mapMatch = MAP_MARKER.exec(fragment) || { index: -1 };

    var nextAt = len;
    if (markerStartMatch.index > -1)
      nextAt = markerStartMatch.index;
    if (markerEndMatch.index > -1 && markerEndMatch.index < nextAt)
      nextAt = markerEndMatch.index;
    if (mapMatch.index > -1 && mapMatch.index < nextAt)
      nextAt = mapMatch.index;

    if (nextAt == len)
      break;

    if (nextAt == markerStartMatch.index) {
      files.push(markerStartMatch[1]);
    } else if (nextAt == markerEndMatch.index) {
      files.pop();
    } else if (nextAt == mapMatch.index) {
      var inputMapData = fs.readFileSync(path.join(this.options.root || '', mapMatch[1]), 'utf-8');
      this.maps[files[files.length - 1] || undefined] = new SourceMapConsumer(inputMapData);
      this.options.sourceMap = true;
    }

    cursor += nextAt + 1;
  }

  return this;
};

InputSourceMapStore.prototype.isTracking = function () {
  return Object.keys(this.maps).length > 0;
};

InputSourceMapStore.prototype.originalPositionFor = function (sourceInfo) {
  return this.maps[sourceInfo.source].originalPositionFor(sourceInfo);
};

module.exports = InputSourceMapStore;
