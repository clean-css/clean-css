var SourceMapGenerator = require('source-map').SourceMapGenerator;
var all = require('./helpers').all;

var unknownSource = '$stdin';

function store(element, context) {
  // handles defaults and values like `,` or `/` which do not have mapping
  if (Array.isArray(element) && element.length == 1)
    element = element[0];

  var fromString = typeof element == 'string';
  var value = fromString ? element : element[0];

  if (value.indexOf('_') > -1)
    value = context.restore(value);

  track(value, fromString ? null : element, context);
  context.output.push(value);
}

function track(value, element, context) {
  if (element)
    trackMetadata(element, context);

  var parts = value.split('\n');
  context.line += parts.length - 1;
  context.column = parts.length > 1 ? 0 : (context.column + parts.pop().length);
}

function trackMetadata(element, context) {
  var sourceAt = element.length - 1;
  if (typeof element[sourceAt] == 'object')
    sourceAt--;

  if (typeof element[sourceAt - 1] != 'number')
    return;

  var source = element[sourceAt] || unknownSource;

  context.outputMap.addMapping({
    generated: {
      line: context.line,
      column: context.column
    },
    source: source,
    original: {
      line: element[sourceAt - 2],
      column: element[sourceAt - 1]
    }
  });

  if (element[sourceAt + 1])
    context.outputMap.setSourceContent(source, element[sourceAt + 1][element[sourceAt]]);
}

function stringify(tokens, options, restoreCallback, inputMapTracker) {
  var context = {
    column: 0,
    inputMapTracker: inputMapTracker,
    keepBreaks: options.keepBreaks,
    line: 1,
    output: [],
    outputMap: new SourceMapGenerator(),
    restore: restoreCallback,
    sourceMapInlineSources: options.sourceMapInlineSources,
    store: store
  };

  all(tokens, context, false);

  return {
    sourceMap: context.outputMap,
    styles: context.output.join('').trim()
  };
}

module.exports = stringify;
