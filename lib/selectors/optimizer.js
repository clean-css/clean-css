var Tokenizer = require('./tokenizer');
var SimpleOptimizer = require('./optimizers/simple');
var AdvancedOptimizer = require('./optimizers/advanced');

var lineBreak = require('os').EOL;

function SelectorsOptimizer(options, context) {
  this.options = options || {};
  this.context = context || {};
}

function rebuild(tokens, keepBreaks) {
  return tokens
    .map(function (token) {
      if (typeof token === 'string')
        return token;
      // TODO: broken due to joining/splitting
      if (token.body.length === 0 || (token.body.length == 1 && token.body[0] === ''))
        return '';

      return token.block ?
        token.block + '{' + rebuild(token.body, keepBreaks) + '}' :
        token.selector.join(',') + '{' + token.body.join(';') + '}';
    })
    .join(keepBreaks ? lineBreak : '')
    .trim();
}

SelectorsOptimizer.prototype.process = function (data) {
  var tokens = new Tokenizer(this.context).toTokens(data);

  new SimpleOptimizer(this.options, this.context).optimize(tokens);
  if (!this.options.noAdvanced)
    new AdvancedOptimizer(this.options, this.context).optimize(tokens);

  return rebuild(tokens, this.options.keepBreaks);
};

module.exports = SelectorsOptimizer;
