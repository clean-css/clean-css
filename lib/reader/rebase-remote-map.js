function rebaseRemoteMap(sourceMap, sourceUri) {
  // Note: Keep these as dynamic, on-demand requires for edge compatibility
  var path = require('path');
  var url = require('url');

  var sourceDirectory = path.dirname(sourceUri);

  sourceMap.sources = sourceMap.sources.map(function(source) {
    return url.resolve(sourceDirectory, source);
  });

  return sourceMap;
}

module.exports = rebaseRemoteMap;
