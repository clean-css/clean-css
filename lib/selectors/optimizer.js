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

  var mergeProperties = function(body, allowAdjacent) {
    var merged = [];
    var properties = [];
    var flat = [];
    var tokenized = body.split(';');
    var lastKey = null;

    if (tokenized.length == 1 && tokenized[0] === '')
      return body;

    for (var i = 0, l = tokenized.length; i < l; i++) {
      var firstColon = tokenized[i].indexOf(':');
      var key = tokenized[i].substring(0, firstColon);
      var value = tokenized[i].substring(firstColon + 1);
      var alreadyIn = properties.indexOf(key);

      if (alreadyIn > -1 && merged[alreadyIn][1].indexOf('!important') > 0 && value.indexOf('!important') == -1)
        continue;

      // comment is necessary - we assume that if two keys are one after another
      // then it is intentional way of redefining property which may not be widely supported
      // however if `allowAdjacent` is set then the rule does not apply (see merging two adjacent selectors)
      if (alreadyIn > -1 && (allowAdjacent || lastKey != key)) {
        merged.splice(alreadyIn, 1);
        properties.splice(alreadyIn, 1);
      }

      merged.push([key, value]);
      properties.push(key);

      lastKey = key;
    }

    for (var j = 0, m = merged.length; j < m; j++) {
      flat.push(merged[j].join(':'));
    }

    return flat.join(';');
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
    var forMerging = [];
    var lastSelector = null;

    for (var i = 0, l = tokens.length; i < l; i++) {
      if (typeof(tokens[i]) == 'string' || tokens[i].block)
        continue;

      var selector = tokens[i].selector;
      if (lastSelector == selector)
        forMerging.push(i);

      lastSelector = selector;
    }

    for (var j = 0, m = forMerging.length; j < m; j++) {
      var position = forMerging[j] - j;
      tokens[position - 1].body = mergeProperties(tokens[position - 1].body + ';' + tokens[position].body, true);
      tokens.splice(position, 1);
    }
  };

  var optimize = function(tokens) {
    tokens = (Array.isArray(tokens) ? tokens : [tokens]);
    for (var i = 0, l = tokens.length; i < l; i++) {
      var token = tokens[i];

      if (token.selector) {
        token.selector = stripRepeats(token.selector);
        token.body = mergeProperties(token.body, false);
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
