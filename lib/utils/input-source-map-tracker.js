var SourceMapConsumer = require('source-map').SourceMapConsumer;

var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');
var url = require('url');

var override = require('../utils/object.js').override;

var MAP_MARKER = /\/\*# sourceMappingURL=(\S+) \*\//;
var REMOTE_RESOURCE = /^(https?:)?\/\//;

function InputSourceMapStore(outerContext) {
  this.options = outerContext.options;
  this.errors = outerContext.errors;
  this.sourceTracker = outerContext.sourceTracker;
  this.timeout = this.options.inliner.timeout;
  this.requestOptions = this.options.inliner.request;

  this.maps = {};
}

function fromString(self, _, whenDone) {
  self.trackLoaded(undefined, undefined, self.options.sourceMap);
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

    var markerStartMatch = self.sourceTracker.nextStart(fragment) || { index: -1 };
    var markerEndMatch = self.sourceTracker.nextEnd(fragment) || { index: -1 };
    var mapMatch = MAP_MARKER.exec(fragment) || { index: -1 };
    var sourceMapFile = mapMatch[1];

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
      context.files.push(markerStartMatch.filename);
    } else if (nextAt == markerEndMatch.index) {
      context.files.pop();
    } else if (nextAt == mapMatch.index) {
      var isRemote = /^https?:\/\//.test(sourceMapFile) || /^\/\//.test(sourceMapFile);
      if (isRemote) {
        return fetchMapFile(self, sourceMapFile, context, proceedToNext);
      } else {
        var sourceFile = context.files[context.files.length - 1];
        var sourceDir = sourceFile ? path.dirname(sourceFile) : self.options.relativeTo;
        var sourceMapPath = path.resolve(self.options.root, path.join(sourceDir || '', sourceMapFile));

        var sourceMapData = fs.readFileSync(sourceMapPath, 'utf-8');
        self.trackLoaded(sourceFile || undefined, sourceMapPath, sourceMapData);
      }
    }

    context.cursor += nextAt + 1;
  }

  return whenDone();
}

function fetchMapFile(self, sourceUrl, context, done) {
  function handleError(status) {
    context.errors.push('Broken source map at "' + sourceUrl + '" - ' + status);
    return done();
  }

  var method = sourceUrl.indexOf('https') === 0 ? https : http;
  var requestOptions = override(url.parse(sourceUrl), self.requestOptions);

  method
    .get(requestOptions, function (res) {
      if (res.statusCode < 200 || res.statusCode > 299)
        return handleError(res.statusCode);

      var chunks = [];
      res.on('data', function (chunk) {
        chunks.push(chunk.toString());
      });
      res.on('end', function () {
        self.trackLoaded(context.files[context.files.length - 1] || undefined, sourceUrl, chunks.join(''));
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

function originalPositionIn(trackedSource, sourceInfo, token, allowNFallbacks) {
  var originalPosition;
  var maxRange = token.length;
  var position = {
    line: sourceInfo.line,
    column: sourceInfo.column + maxRange
  };

  while (maxRange-- > 0) {
    position.column--;
    originalPosition = trackedSource.data.originalPositionFor(position);

    if (originalPosition)
      break;
  }

  if (originalPosition.line === null && sourceInfo.line > 1 && allowNFallbacks > 0)
    return originalPositionIn(trackedSource, { line: sourceInfo.line - 1, column: sourceInfo.column }, token, allowNFallbacks - 1);

  if (trackedSource.path) {
    originalPosition.source = REMOTE_RESOURCE.test(trackedSource.path) ?
      url.resolve(trackedSource.path, originalPosition.source) :
      path.join(trackedSource.path, originalPosition.source);

    originalPosition.sourceResolved = true;
  }

  return originalPosition;
}

InputSourceMapStore.prototype.track = function (data, whenDone) {
  return typeof this.options.sourceMap == 'string' ?
    fromString(this, data, whenDone) :
    fromSource(this, data, whenDone, { files: [], cursor: 0, errors: this.errors });
};

InputSourceMapStore.prototype.trackLoaded = function (sourcePath, mapPath, mapData) {
  var relativeTo = this.options.explicitTarget ? this.options.target : this.options.root;
  var isRemote = REMOTE_RESOURCE.test(sourcePath);

  if (mapPath) {
    mapPath = isRemote ?
      path.dirname(mapPath) :
      path.dirname(path.relative(relativeTo, mapPath));
  }

  this.maps[sourcePath] = {
    path: mapPath,
    data: new SourceMapConsumer(mapData)
  };
};

InputSourceMapStore.prototype.isTracking = function (source) {
  return !!this.maps[source];
};

InputSourceMapStore.prototype.originalPositionFor = function (sourceInfo, token, allowNFallbacks) {
  return originalPositionIn(this.maps[sourceInfo.source], sourceInfo.original, token, allowNFallbacks);
};

module.exports = InputSourceMapStore;
