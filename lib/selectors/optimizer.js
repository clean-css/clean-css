var Tokenizer = require('./tokenizer');
var PropertyOptimizer = require('../properties/optimizer');

module.exports = function Optimizer(data, options) {
  var specialSelectors = {
    '*': /\-(moz|ms|o|webkit)\-/,
    'ie8': /(\-moz\-|\-ms\-|\-o\-|\-webkit\-|:not|:target|:visited|:empty|:first\-of|:last|:nth|:only|:root)/
  };

  var propertyOptimizer = new PropertyOptimizer();

  var cleanUpSelector = function(selectors) {
    var plain = [];
    selectors = selectors.split(',');

    for (var i = 0, l = selectors.length; i < l; i++) {
      var sel = selectors[i];

      if (plain.indexOf(sel) == -1)
        plain.push(sel);
    }

    return plain.sort().join(',');
  };

  var isSpecial = function(selector) {
    return specialSelectors[options.selectorsMergeMode || '*'].test(selector);
  };

  var removeDuplicates = function(tokens) {
    var matched = {};
    var forRemoval = [];

    for (var i = 0, l = tokens.length; i < l; i++) {
      if (typeof(tokens[i]) == 'string' || tokens[i].block)
        continue;

      var selector = tokens[i].selector;
      var body = tokens[i].body;
      var id = body + '@' + selector;
      var alreadyMatched = matched[id];

      if (alreadyMatched) {
        forRemoval.push(alreadyMatched[alreadyMatched.length - 1]);
        alreadyMatched.push(i);
      } else {
        matched[id] = [i];
      }
    }

    forRemoval = forRemoval.sort(function(a, b) { return a > b ? 1 : -1; });
    for (var j = 0, n = forRemoval.length; j < n; j++) {
      tokens.splice(forRemoval[j] - j, 1);
    }
  };

  var mergeAdjacent = function(tokens) {
    var forRemoval = [];
    var lastToken = { selector: null, body: null };

    for (var i = 0, l = tokens.length; i < l; i++) {
      var token = tokens[i];

      if (typeof(token) == 'string' || token.block)
        continue;

      if (token.selector == lastToken.selector) {
        lastToken.body = propertyOptimizer.process(lastToken.body + ';' + token.body, true);
        forRemoval.push(i);
      } else if (token.body == lastToken.body && !isSpecial(token.selector) && !isSpecial(lastToken.selector)) {
        lastToken.selector = cleanUpSelector(lastToken.selector + ',' + token.selector);
        forRemoval.push(i);
      } else {
        lastToken = token;
      }
    }

    for (var j = 0, m = forRemoval.length; j < m; j++) {
      tokens.splice(forRemoval[j] - j, 1);
    }
  };

  var optimize = function(tokens) {
    tokens = (Array.isArray(tokens) ? tokens : [tokens]);
    for (var i = 0, l = tokens.length; i < l; i++) {
      var token = tokens[i];

      if (token.selector) {
        token.selector = cleanUpSelector(token.selector);
        token.body = propertyOptimizer.process(token.body, false);
      } else if (token.block) {
        optimize(token.body);
      }
    }

    removeDuplicates(tokens);
    mergeAdjacent(tokens);
  };

  var rebuild = function(tokens) {
    return (Array.isArray(tokens) ? tokens : [tokens])
      .map(function(token) {
        if (typeof token == 'string')
          return token;

        if (token.block)
          return token.block + '{' + rebuild(token.body) + '}';
        else
          return token.selector + '{' + token.body + '}';
      })
      .join(options.keepBreaks ? options.lineBreak : '');
  };

  return {
    process: function() {
      var tokenized = new Tokenizer(data).process();
      optimize(tokenized);
      return rebuild(tokenized);
    }
  };
};
