var SourceMapConsumer = require('source-map').SourceMapConsumer;

function inputSourceMapTracker() {
  var maps = {};

  return {
    originalPositionFor: originalPositionFor.bind(null, maps),
    track: track.bind(null, maps)
  };
}

function originalPositionFor(maps, metadata) {
  var line = metadata[0];
  var column = metadata[1];
  var source = metadata[2];

  return source in maps ?
    toMetadata(maps[source].originalPositionFor({ line: line, column: column })) :
    metadata;
}

function toMetadata(asHash) {
  return [asHash.line, asHash.column, asHash.source];
}

function track(maps, source, data) {
  maps[source] = new SourceMapConsumer(data);
}

module.exports = inputSourceMapTracker;
