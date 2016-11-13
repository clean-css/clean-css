var optimizeProperties = require('../properties/optimizer');

var stringifyBody = require('../stringifier/one-time').body;
var stringifyRules = require('../stringifier/one-time').rules;
var tidyRules = require('./tidy-rules');
var isSpecial = require('./is-special');

var Token = require('../tokenizer/token');

function mergeAdjacent(tokens, context) {
  var lastToken = [null, [], []];
  var options = context.options;
  var adjacentSpace = options.compatibility.selectors.adjacentSpace;

  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];

    if (token[0] != Token.RULE) {
      lastToken = [null, [], []];
      continue;
    }

    if (lastToken[0] == Token.RULE && stringifyRules(token[1]) == stringifyRules(lastToken[1])) {
      var joinAt = [lastToken[2].length];
      Array.prototype.push.apply(lastToken[2], token[2]);
      optimizeProperties(token[1], lastToken[2], joinAt, true, context);
      token[2] = [];
    } else if (lastToken[0] == Token.RULE && stringifyBody(token[2]) == stringifyBody(lastToken[2]) &&
        !isSpecial(options, stringifyRules(token[1])) && !isSpecial(options, stringifyRules(lastToken[1]))) {
      lastToken[1] = tidyRules(lastToken[1].concat(token[1]), false, adjacentSpace);
      token[2] = [];
    } else {
      lastToken = token;
    }
  }
}

module.exports = mergeAdjacent;
