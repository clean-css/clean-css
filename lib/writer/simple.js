var all = require('./helpers').all;

function store(token, serializeContext) {
  serializeContext.output.push(typeof token == 'string' ? token : token[1]);
}

function serializeStyles(tokens, context) {
  var serializeContext = {
    beautify: context.options.beautify,
    indent: 0,
    indentSpaces: '',
    keepBreaks: context.options.keepBreaks,
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
