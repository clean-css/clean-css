function rebaseLocalMap(sourceMap, sourceUri, rebaseTo) {
  // Note: Keep this as a dynamic, on-demand require for edge compatibility
  var path = require('path');

  var currentPath = path.resolve('');
  var absoluteUri = path.resolve(currentPath, sourceUri);
  var absoluteUriDirectory = path.dirname(absoluteUri);

  sourceMap.sources = sourceMap.sources.map(function(source) {
    return path.relative(rebaseTo, path.resolve(absoluteUriDirectory, source));
  });

  return sourceMap;
}

module.exports = rebaseLocalMap;
