var all = require('./helpers').all;

function store(token, serializeContext) {
  serializeContext.output.push(typeof token == 'string' ? token : token[1]);
}

function serializeStyles(tokens, context) {
  var serializeContext = {
    format: context.options.format,
    indentBy: 0,
    indentWith: '',
    output: [],
    spaceAfterClosingBrace: context.options.compatibility.properties.spaceAfterClosingBrace,
    store: store
  };

  all(tokens, serializeContext, false);

  return {
    styles: serializeContext.output.join('')
  };
}

module.exports = serializeStyles;
