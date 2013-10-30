module.exports = function Optimizer() {
  var tokenize = function(body) {
    var tokens = body.split(';');
    var keyValues = [];

    for (var i = 0, l = tokens.length; i < l; i++) {
      var token = tokens[i];
      var firstColon = token.indexOf(':');
      keyValues.push([token.substring(0, firstColon), token.substring(firstColon + 1)]);
    }

    return keyValues;
  };

  var optimize = function(tokenized, allowAdjacent) {
    var merged = [];
    var properties = [];
    var lastProperty = null;

    for (var i = 0, l = tokenized.length; i < l; i++) {
      var property = tokenized[i][0];
      var value = tokenized[i][1];
      var alreadyIn = properties.indexOf(property);

      if (alreadyIn > -1 && merged[alreadyIn][1].indexOf('!important') > 0 && value.indexOf('!important') == -1)
        continue;

      // comment is necessary - we assume that if two properties are one after another
      // then it is intentional way of redefining property which may not be widely supported
      // however if `allowAdjacent` is set then the rule does not apply (see merging two adjacent selectors)
      if (alreadyIn > -1 && (allowAdjacent || lastProperty != property)) {
        merged.splice(alreadyIn, 1);
        properties.splice(alreadyIn, 1);
      }

      merged.push([property, value]);
      properties.push(property);

      lastProperty = property;
    }

    return merged;
  };

  var rebuild = function(tokenized) {
    var flat = [];

    for (var i = 0, l = tokenized.length; i < l; i++) {
      flat.push(tokenized[i][0] + ':' + tokenized[i][1]);
    }

    return flat.join(';');
  };

  return {
    process: function(body, allowAdjacent) {
      var tokenized = tokenize(body);
      if (tokenized.length < 2)
        return body;

      var optimized = optimize(tokenized, allowAdjacent);
      return rebuild(optimized);
    }
  };
};
