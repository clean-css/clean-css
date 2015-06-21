var optimizeProperties = require('../properties/optimizer');

var removeDuplicates = require('./remove-duplicates');
var mergeAdjacent = require('./merge-adjacent');
var reduceNonAdjacent = require('./reduce-non-adjacent');
var mergeNonAdjacentBySelector = require('./merge-non-adjacent-by-selector');
var mergeNonAdjacentByBody = require('./merge-non-adjacent-by-body');
var restructure = require('./restructure');
var removeDuplicateMediaQueries = require('./remove-duplicate-media-queries');
var mergeMediaQueries = require('./merge-media-queries');

function AdvancedOptimizer(options, context) {
  this.options = options;
  this.validator = context.validator;
}

AdvancedOptimizer.prototype.removeEmpty = function (tokens) {
  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];
    var isEmpty = false;

    switch (token[0]) {
      case 'selector':
        isEmpty = token[1].length === 0 || token[2].length === 0;
        break;
      case 'block':
        this.removeEmpty(token[2]);
        isEmpty = token[2].length === 0;
    }

    if (isEmpty) {
      tokens.splice(i, 1);
      i--;
      l--;
    }
  }
};

function recursivelyOptimizeProperties(tokens, options, validator) {
  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];

    switch (token[0]) {
      case 'selector':
        optimizeProperties(token[1], token[2], false, true, options, validator);
        break;
      case 'block':
        recursivelyOptimizeProperties(token[2], options, validator);
    }
  }
}

AdvancedOptimizer.prototype.optimize = function (tokens) {
  var self = this;

  function _optimize(tokens, withRestructuring) {
    tokens.forEach(function (token) {
      if (token[0] == 'block') {
        var isKeyframes = /@(-moz-|-o-|-webkit-)?keyframes/.test(token[1][0]);
        _optimize(token[2], !isKeyframes);
      }
    });

    recursivelyOptimizeProperties(tokens, self.options, self.validator);

    removeDuplicates(tokens);
    mergeAdjacent(tokens, self.options, self.validator);
    reduceNonAdjacent(tokens, self.options, self.validator);

    mergeNonAdjacentBySelector(tokens, self.options, self.validator);
    mergeNonAdjacentByBody(tokens, self.options);

    if (self.options.restructuring && withRestructuring) {
      restructure(tokens, self.options);
      mergeAdjacent(tokens, self.options, self.validator);
    }

    if (self.options.mediaMerging) {
      removeDuplicateMediaQueries(tokens);
      var reduced = mergeMediaQueries(tokens);
      for (var i = reduced.length - 1; i >= 0; i--) {
        _optimize(reduced[i][2]);
      }
    }

    self.removeEmpty(tokens);
  }

  _optimize(tokens, true);
};

module.exports = AdvancedOptimizer;
