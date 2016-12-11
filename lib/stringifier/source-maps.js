var SourceMapGenerator = require('source-map').SourceMapGenerator;
var all = require('./helpers').all;

var isRemoteResource = require('../utils/is-remote-resource');

var isWindows = process.platform == 'win32';
var UNKNOWN_SOURCE = '$stdin';

function store(element, stringifyContext) {
  var fromString = typeof element == 'string';
  var value = fromString ? element : element[1];
  var mappings = fromString ? null : element[2];

  track(value, mappings, stringifyContext);
  stringifyContext.output.push(value);
}

function track(value, mappings, stringifyContext) {
  var parts = value.split('\n');

  if (mappings) {
    trackAllMappings(mappings, stringifyContext);
  }

  stringifyContext.line += parts.length - 1;
  stringifyContext.column = parts.length > 1 ? 0 : (stringifyContext.column + parts.pop().length);
}

function trackAllMappings(mappings, stringifyContext) {
  for (var i = 0, l = mappings.length; i < l; i++) {
    trackMapping(mappings[i], stringifyContext);
  }
}

function trackMapping(mapping, stringifyContext) {
  var line = mapping[0];
  var column = mapping[1];
  var originalSource = mapping[2];
  var source = originalSource;
  var storedSource = source || UNKNOWN_SOURCE;

  if (isWindows && source && !isRemoteResource(source)) {
    source = source.replace(/\\/g, '/');
  }

  stringifyContext.outputMap.addMapping({
    generated: {
      line: stringifyContext.line,
      column: stringifyContext.column
    },
    source: storedSource,
    original: {
      line: line,
      column: column
    }
  });

  if (stringifyContext.inlineSources && (originalSource in stringifyContext.sourcesContent)) {
    stringifyContext.outputMap.setSourceContent(storedSource, stringifyContext.sourcesContent[originalSource]);
  }
}

function stringify(tokens, context) {
  var stringifyContext = {
    column: 0,
    keepBreaks: context.options.keepBreaks,
    inlineSources: context.options.sourceMapInlineSources,
    line: 1,
    output: [],
    outputMap: new SourceMapGenerator(),
    sourcesContent: context.sourcesContent,
    spaceAfterClosingBrace: context.options.compatibility.properties.spaceAfterClosingBrace,
    store: store
  };

  all(tokens, stringifyContext, false);

  return {
    sourceMap: stringifyContext.outputMap,
    styles: stringifyContext.output.join('')
  };
}

module.exports = stringify;
