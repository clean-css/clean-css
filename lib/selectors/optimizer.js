var Tokenizer = require('./tokenizer');
var SimpleOptimizer = require('./optimizers/simple');
var AdvancedOptimizer = require('./optimizers/advanced');

var lineBreak = require('os').EOL;

function SelectorsOptimizer(options, context) {
  this.options = options || {};
  this.context = context || {};
}

function valueRebuilder(list, separator) {
  var merged = '';

  for (var i = 0, l = list.length; i < l; i++)
    merged += list[i].value + (i < l - 1 ? separator : '');

  return merged;
}

function rebuild(tokens, keepBreaks, isFlatBlock) {
  var joinCharacter = isFlatBlock ? ';' : (keepBreaks ? lineBreak : '');
  var parts = [];
  var body;
  var selector;

  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];

    if (token.kind === 'text') {
      parts.push(token.value);
      continue;
    }

    // TODO: broken due to joining/splitting
    if (token.body && (token.body.length === 0 || (token.body.length == 1 && token.body[0].value === '')))
      continue;

    if (token.kind == 'block') {
      body = token.isFlatBlock ?
        valueRebuilder(token.body, ';') :
        rebuild(token.body, keepBreaks, token.isFlatBlock);
      if (body.length > 0)
        parts.push(token.value + '{' + body + '}');
    } else {
      selector = valueRebuilder(token.value, ',');
      body = valueRebuilder(token.body, ';');
      parts.push(selector + '{' + body + '}');
    }
  }

  return parts.join(joinCharacter);
}

SelectorsOptimizer.prototype.process = function (data) {
  var tokens = new Tokenizer(this.context).toTokens(data);

  new SimpleOptimizer(this.options).optimize(tokens);
  if (this.options.advanced)
    new AdvancedOptimizer(this.options, this.context).optimize(tokens);

  return rebuild(tokens, this.options.keepBreaks, false).trim();
};

module.exports = SelectorsOptimizer;
