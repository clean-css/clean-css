var stringifyBody = require('../stringifier/one-time').body;
var stringifyRules = require('../stringifier/one-time').rules;
var tidyRules = require('./tidy-rules');
var isSpecial = require('./is-special');

var Token = require('../tokenizer/token');

function unsafeSelector(value) {
  return /\.|\*| :/.test(value);
}

function isBemElement(token) {
  var asString = stringifyRules(token[1]);
  return asString.indexOf('__') > -1 || asString.indexOf('--') > -1;
}

function withoutModifier(selector) {
  return selector.replace(/--[^ ,>\+~:]+/g, '');
}

function removeAnyUnsafeElements(left, candidates) {
  var leftSelector = withoutModifier(stringifyRules(left[1]));

  for (var body in candidates) {
    var right = candidates[body];
    var rightSelector = withoutModifier(stringifyRules(right[1]));

    if (rightSelector.indexOf(leftSelector) > -1 || leftSelector.indexOf(rightSelector) > -1)
      delete candidates[body];
  }
}

function mergeNonAdjacentByBody(tokens, context) {
  var options = context.options;
  var adjacentSpace = options.compatibility.selectors.adjacentSpace;
  var candidates = {};

  for (var i = tokens.length - 1; i >= 0; i--) {
    var token = tokens[i];
    if (token[0] != Token.RULE)
      continue;

    if (token[2].length > 0 && (!options.semanticMerging && unsafeSelector(stringifyRules(token[1]))))
      candidates = {};

    if (token[2].length > 0 && options.semanticMerging && isBemElement(token))
      removeAnyUnsafeElements(token, candidates);

    var candidateBody = stringifyBody(token[2]);
    var oldToken = candidates[candidateBody];
    if (oldToken && !isSpecial(options, stringifyRules(token[1])) && !isSpecial(options, stringifyRules(oldToken[1]))) {
      token[1] = token[2].length > 0 ?
        tidyRules(oldToken[1].concat(token[1]), false, adjacentSpace, context.warnings) :
        oldToken[1].concat(token[1]);

      oldToken[2] = [];
      candidates[candidateBody] = null;
    }

    candidates[stringifyBody(token[2])] = token;
  }
}

module.exports = mergeNonAdjacentByBody;
