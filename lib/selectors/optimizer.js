var Tokenizer = require('./tokenizer');
var SimpleOptimizer = require('./optimizers/simple');
var AdvancedOptimizer = require('./optimizers/advanced');

var lineBreak = require('os').EOL;

function SelectorsOptimizer(options, context) {
  this.options = options || {};
  this.context = context || {};
}

function rebuild(tokens, keepBreaks, isFlatBlock) {
  var joinCharacter = isFlatBlock ? ';' : (keepBreaks ? lineBreak : '');
  var parts = [];

  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];

    if (typeof token === 'string') {
      parts.push(token);
      continue;
    }

    // TODO: broken due to joining/splitting
    if (token.body.length === 0 || (token.body.length == 1 && token.body[0] === ''))
      continue;

    if (token.block) {
      var body = rebuild(token.body, keepBreaks, token.isFlatBlock);
      if (body.length > 0)
        parts.push(token.block + '{' + body + '}');
    } else {
      parts.push(token.selector.join(',') + '{' + token.body.join(';') + '}');
    }
  }

  return parts.join(joinCharacter);
}

SelectorsOptimizer.prototype.process = function (data) {
  var tokens = new Tokenizer(this.context).toTokens(data);

  new SimpleOptimizer(this.options).optimize(tokens);
  if (!this.options.noAdvanced)
    new AdvancedOptimizer(this.options, this.context).optimize(tokens);

  return rebuild(tokens, this.options.keepBreaks, false).trim();
};

module.exports = SelectorsOptimizer;
