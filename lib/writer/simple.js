var all = require('./helpers').all;

var lineBreak = require('os').EOL;

function store(token, serializeContext) {
  var value = typeof token == 'string' ?
    token :
    token[1];

  serializeContext.wrap(value);
  serializeContext.track(value);
  serializeContext.output.push(value);
}

function wrap(value, serializeContext) {
  if (serializeContext.column + value.length > serializeContext.format.wrapAt) {
    track(lineBreak, serializeContext);
    serializeContext.output.push(lineBreak);
  }
}

function track(value, serializeContext) {
  var parts = value.split('\n');

  serializeContext.line += parts.length - 1;
  serializeContext.column = parts.length > 1 ? 0 : (serializeContext.column + parts.pop().length);
}

function serializeStyles(tokens, context) {
  var serializeContext = {
    column: 0,
    format: context.options.format,
    indentBy: 0,
    indentWith: '',
    line: 1,
    output: [],
    spaceAfterClosingBrace: context.options.compatibility.properties.spaceAfterClosingBrace,
    store: store,
    track: context.options.format.wrapAt ?
      function (value) { track(value, serializeContext); } :
      function () { /* noop */  },
    wrap: context.options.format.wrapAt ?
      function (value) { wrap(value, serializeContext); } :
      function () { /* noop */  }
  };

  all(tokens, serializeContext, false);

  return {
    styles: serializeContext.output.join('')
  };
}

module.exports = serializeStyles;
