var all = require('./helpers').all;

function store(token, stringifyContext) {
  stringifyContext.output.push(typeof token == 'string' ? token : token[1]);
}

function stringify(tokens, context) {
  var stringifyContext = {
    keepBreaks: context.options.keepBreaks,
    output: [],
    spaceAfterClosingBrace: context.options.compatibility.properties.spaceAfterClosingBrace,
    store: store
  };

  all(tokens, stringifyContext, false);

  return {
    styles: stringifyContext.output.join('')
  };
}

module.exports = stringify;
