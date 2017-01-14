var SourceMapGenerator = require('source-map').SourceMapGenerator;
var all = require('./helpers').all;

var lineBreak = require('os').EOL;
var isRemoteResource = require('../utils/is-remote-resource');

var isWindows = process.platform == 'win32';

var NIX_SEPARATOR_PATTERN = /\//g;
var UNKNOWN_SOURCE = '$stdin';
var WINDOWS_SEPARATOR = '\\';

function store(element, serializeContext) {
  var fromString = typeof element == 'string';
  var value = fromString ? element : element[1];
  var mappings = fromString ? null : element[2];

  serializeContext.wrap(value);
  track(value, mappings, serializeContext);
  serializeContext.output.push(value);
}

function wrap(value, serializeContext) {
  if (serializeContext.column + value.length > serializeContext.format.wrapAt) {
    track(lineBreak, false, serializeContext);
    serializeContext.output.push(lineBreak);
  }
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
    storedSource = source.replace(NIX_SEPARATOR_PATTERN, WINDOWS_SEPARATOR);
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
    format: context.options.format,
    indentBy: 0,
    indentWith: '',
    inlineSources: context.options.sourceMapInlineSources,
    line: 1,
    output: [],
    outputMap: new SourceMapGenerator(),
    sourcesContent: context.sourcesContent,
    spaceAfterClosingBrace: context.options.compatibility.properties.spaceAfterClosingBrace,
    store: store,
    wrap: context.options.format.wrapAt ?
      function (value) { wrap(value, serializeContext); } :
      function () { /* noop */  }
  };

  all(tokens, serializeContext, false);

  return {
    sourceMap: serializeContext.outputMap,
    styles: serializeContext.output.join('')
  };
}

module.exports = serializeStylesAndSourceMap;
