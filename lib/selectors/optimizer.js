var Tokenizer = require('./tokenizer');

module.exports = function Optimizer(data) {
  var stripRepeats = function(selectors) {
    var plain = [];
    selectors = selectors.split(',');

    for (var i = 0, l = selectors.length; i < l; i++) {
      var sel = selectors[i];

      if (plain.indexOf(sel) == -1)
        plain.push(sel);
    }

    return plain.join(',');
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

  var optimize = function(tokens) {
    tokens = (Array.isArray(tokens) ? tokens : [tokens]);
    for (var i = 0, l = tokens.length; i < l; i++) {
      var token = tokens[i];

      if (token.selector)
        token.selector = stripRepeats(token.selector);
      if (token.block)
        optimize(token.body);
    }

    removeDuplicates(tokens);
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
      .join('');
  };

  return {
    process: function() {
      var tokenized = new Tokenizer(data).process();
      optimize(tokenized);
      return rebuild(tokenized);
    }
  };
};
