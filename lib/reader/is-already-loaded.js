var restoreImport = require('./restore-import');

var Marker = require('../tokenizer/marker');

function isAlreadyLoaded(uri, sourcesContent) {
  // the second check is because clean-css accepts an array of input file paths
  // which are internally transformed into imports
  return uri in sourcesContent && sourcesContent[uri] != (restoreImport(uri, '') + Marker.SEMICOLON);
}

module.exports = isAlreadyLoaded;
