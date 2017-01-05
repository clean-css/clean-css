var optimizeProperties = require('../properties/optimizer');

var removeDuplicates = require('./remove-duplicates');
var mergeAdjacent = require('./merge-adjacent');
var reduceNonAdjacent = require('./reduce-non-adjacent');
var mergeNonAdjacentBySelector = require('./merge-non-adjacent-by-selector');
var mergeNonAdjacentByBody = require('./merge-non-adjacent-by-body');
var restructure = require('./restructure');
var removeDuplicateFontAtRules = require('./remove-duplicate-font-at-rules');
var removeDuplicateMediaQueries = require('./remove-duplicate-media-queries');
var mergeMediaQueries = require('./merge-media-queries');

var OptimizationLevel = require('../options/optimization-level').OptimizationLevel;
var Token = require('../tokenizer/token');

function removeEmpty(tokens) {
  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];
    var isEmpty = false;

    switch (token[0]) {
      case Token.RULE:
        isEmpty = token[1].length === 0 || token[2].length === 0;
        break;
      case Token.BLOCK:
        removeEmpty(token[2]);
        isEmpty = token[2].length === 0;
        break;
      case Token.AT_RULE_BLOCK:
        isEmpty = token[2].length === 0;
    }

    if (isEmpty) {
      tokens.splice(i, 1);
      i--;
      l--;
    }
  }
}

function recursivelyOptimizeBlocks(tokens, context) {
  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];

    if (token[0] == Token.BLOCK) {
      var isKeyframes = /@(-moz-|-o-|-webkit-)?keyframes/.test(token[1][0][1]);
      optimize(token[2], context, !isKeyframes);
    }
  }
}

function recursivelyOptimizeProperties(tokens, context) {
  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];

    switch (token[0]) {
      case Token.RULE:
        optimizeProperties(token[1], token[2], false, true, context);
        break;
      case Token.BLOCK:
        recursivelyOptimizeProperties(token[2], context);
    }
  }
}

function optimize(tokens, context, withRestructuring) {
  recursivelyOptimizeBlocks(tokens, context);
  recursivelyOptimizeProperties(tokens, context);

  removeDuplicates(tokens, context);
  mergeAdjacent(tokens, context);
  reduceNonAdjacent(tokens, context);

  mergeNonAdjacentBySelector(tokens, context);
  mergeNonAdjacentByBody(tokens, context);

  if (context.options.level[OptimizationLevel.Two].restructuring && withRestructuring) {
    restructure(tokens, context);
    mergeAdjacent(tokens, context);
  }

  removeDuplicateFontAtRules(tokens, context);

  if (context.options.level[OptimizationLevel.Two].mediaMerging) {
    removeDuplicateMediaQueries(tokens, context);
    var reduced = mergeMediaQueries(tokens, context);
    for (var i = reduced.length - 1; i >= 0; i--) {
      optimize(reduced[i][2], context, false);
    }
  }

  removeEmpty(tokens);

  return tokens;
}

module.exports = optimize;
