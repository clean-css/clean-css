var SourceMapGenerator = require('source-map').SourceMapGenerator;
var all = require('./helpers').all;

var isRemoteResource = require('../utils/is-remote-resource');

var isWindows = process.platform == 'win32';
var UNKNOWN_SOURCE = '$stdin';

function store(element, serializeContext) {
  var fromString = typeof element == 'string';
  var value = fromString ? element : element[1];
  var mappings = fromString ? null : element[2];

  track(value, mappings, serializeContext);
  serializeContext.output.push(value);
}

function track(value, mappings, serializeContext) {
  var parts = value.split('\n');

  if (mappings) {
    trackAllMappings(mappings, serializeContext);
  }

  serializeContext.line += parts.length - 1;
  serializeContext.column = parts.length > 1 ? 0 : (serializeContext.column + parts.pop().length);
}

function trackAllMappings(mappings, serializeContext) {
  for (var i = 0, l = mappings.length; i < l; i++) {
    trackMapping(mappings[i], serializeContext);
  }
}

function trackMapping(mapping, serializeContext) {
  var line = mapping[0];
  var column = mapping[1];
  var originalSource = mapping[2];
  var source = originalSource;
  var storedSource = source || UNKNOWN_SOURCE;

  if (isWindows && source && !isRemoteResource(source)) {
    source = source.replace(/\\/g, '/');
  }

  serializeContext.outputMap.addMapping({
    generated: {
      line: serializeContext.line,
      column: serializeContext.column
    },
    source: storedSource,
    original: {
      line: line,
      column: column
    }
  });

  if (serializeContext.inlineSources && (originalSource in serializeContext.sourcesContent)) {
    serializeContext.outputMap.setSourceContent(storedSource, serializeContext.sourcesContent[originalSource]);
  }
}

function serializeStylesAndSourceMap(tokens, context) {
  var serializeContext = {
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

  all(tokens, serializeContext, false);

  return {
    sourceMap: serializeContext.outputMap,
    styles: serializeContext.output.join('')
  };
}

module.exports = serializeStylesAndSourceMap;
