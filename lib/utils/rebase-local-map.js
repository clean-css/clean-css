var path = require('path');

function rebaseLocalMap(sourceMap, sourceUri, rebaseTo) {
  var currentPath = path.resolve('');
  var absolutePath = path.resolve(currentPath, sourceUri);
  var sourceDirectory = path.dirname(absolutePath);

  sourceMap.sources = sourceMap.sources.map(function(source) {
    return path.relative(rebaseTo, path.resolve(sourceDirectory, source));
  });

  return sourceMap;
}

module.exports = rebaseLocalMap;
