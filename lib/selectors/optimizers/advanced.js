var PropertyOptimizer = require('../../properties/optimizer');
var CleanUp = require('./clean-up');

function AdvancedOptimizer(options, context) {
  this.options = options;
  this.minificationsMade = [];
  this.propertyOptimizer = new PropertyOptimizer(this.options, context);
}

function changeBodyOf(token, newBody) {
  token.body = newBody.tokenized;
  token.metadata.body = newBody.list.join(';');
  token.metadata.bodiesList = newBody.list;
}

function changeSelectorOf(token, newSelectors) {
  token.value = newSelectors.tokenized;
  token.metadata.selector = newSelectors.list.join(',');
  token.metadata.selectorsList = newSelectors.list;
}

function unsafeSelector(value) {
  return /\.|\*| :/.test(value);
}

function extractProperties(token) {
  return (token.metadata.body.match(/([a-z\-]+):/g) || [])
    .join('/')
    .replace(/\-[a-z]+/g, '')
    .split('/');
}

function unsafeTraversal(token, allProperties) {
  var properties = extractProperties(token);

  for (var j = 0; j < properties.length; j++) {
    if (allProperties.indexOf(properties[j]) > -1)
      return true;
  }

  return false;
}

AdvancedOptimizer.prototype.isSpecial = function (selector) {
  return this.options.compatibility.selectors.special.test(selector);
};

AdvancedOptimizer.prototype.removeDuplicates = function (tokens) {
  var matched = {};
  var forRemoval = [];

  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];
    if (token.kind != 'selector')
      continue;

    var id = token.metadata.body + '@' + token.metadata.selector;
    var alreadyMatched = matched[id];

    if (alreadyMatched) {
      forRemoval.push(alreadyMatched[0]);
      alreadyMatched.unshift(i);
    } else {
      matched[id] = [i];
    }
  }

  forRemoval = forRemoval.sort(function(a, b) {
    return a > b ? 1 : -1;
  });

  for (var j = 0, n = forRemoval.length; j < n; j++) {
    tokens.splice(forRemoval[j] - j, 1);
  }

  this.minificationsMade.unshift(forRemoval.length > 0);
};

AdvancedOptimizer.prototype.mergeAdjacent = function (tokens) {
  var forRemoval = [];
  var lastToken = { selector: null, body: null };
  var adjacentSpace = this.options.compatibility.selectors.adjacentSpace;

  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];

    if (token.kind != 'selector')
      continue;

    if (lastToken.kind == 'selector' && token.metadata.selector == lastToken.metadata.selector) {
      var joinAt = [lastToken.body.length];
      changeBodyOf(
        lastToken,
        this.propertyOptimizer.process(token.value, lastToken.body.concat(token.body), joinAt, true)
      );
      forRemoval.push(i);
    } else if (lastToken.body && token.metadata.body == lastToken.metadata.body &&
        !this.isSpecial(token.metadata.selector) && !this.isSpecial(lastToken.metadata.selector)) {
      changeSelectorOf(
        lastToken,
        CleanUp.selectors(lastToken.value.concat(token.value), false, adjacentSpace)
      );
      forRemoval.push(i);
    } else {
      lastToken = token;
    }
  }

  for (var j = 0, m = forRemoval.length; j < m; j++) {
    tokens.splice(forRemoval[j] - j, 1);
  }

  this.minificationsMade.unshift(forRemoval.length > 0);
};

AdvancedOptimizer.prototype.reduceNonAdjacent = function (tokens) {
  var candidates = {};
  var repeated = [];

  for (var i = tokens.length - 1; i >= 0; i--) {
    var token = tokens[i];

    if (token.kind != 'selector')
      continue;

    var isComplexAndNotSpecial = token.value.length > 1 && !this.isSpecial(token.metadata.selector);
    var selectors = isComplexAndNotSpecial ?
      [token.metadata.selector].concat(token.metadata.selectorsList) :
      [token.metadata.selector];

    for (var j = 0, m = selectors.length; j < m; j++) {
      var selector = selectors[j];

      if (!candidates[selector])
        candidates[selector] = [];
      else
        repeated.push(selector);

      candidates[selector].push({
        where: i,
        list: token.metadata.selectorsList,
        isPartial: isComplexAndNotSpecial && j > 0,
        isComplex: isComplexAndNotSpecial && j === 0
      });
    }
  }

  var reducedInSimple = this.reduceSimpleNonAdjacentCases(tokens, repeated, candidates);
  var reducedInComplex = this.reduceComplexNonAdjacentCases(tokens, candidates);

  this.minificationsMade.unshift(reducedInSimple || reducedInComplex);
};

AdvancedOptimizer.prototype.reduceSimpleNonAdjacentCases = function (tokens, repeated, candidates) {
  var reduced = false;

  function filterOut(idx, bodies) {
    return data[idx].isPartial && bodies.length === 0;
  }

  function reduceBody(token, newBody, processedCount, tokenIdx) {
    if (!data[processedCount - tokenIdx - 1].isPartial) {
      changeBodyOf(token, newBody);
      reduced = true;
    }
  }

  for (var i = 0, l = repeated.length; i < l; i++) {
    var selector = repeated[i];
    var data = candidates[selector];

    this.reduceSelector(tokens, selector, data, {
      filterOut: filterOut,
      callback: reduceBody
    });
  }

  return reduced;
};

AdvancedOptimizer.prototype.reduceComplexNonAdjacentCases = function (tokens, candidates) {
  var reduced = false;
  var localContext = {};

  function filterOut(idx) {
    return localContext.data[idx].where < localContext.intoPosition;
  }

  function collectReducedBodies(token, newBody, processedCount, tokenIdx) {
    if (tokenIdx === 0)
      localContext.reducedBodies.push(newBody);
  }

  allSelectors:
  for (var complexSelector in candidates) {
    var into = candidates[complexSelector];
    if (!into[0].isComplex)
      continue;

    var intoPosition = into[into.length - 1].where;
    var intoToken = tokens[intoPosition];
    var reducedBodies = [];

    var selectors = this.isSpecial(complexSelector) ?
      [complexSelector] :
      into[0].list;

    localContext.intoPosition = intoPosition;
    localContext.reducedBodies = reducedBodies;

    for (var j = 0, m = selectors.length; j < m; j++) {
      var selector = selectors[j];
      var data = candidates[selector];

      if (data.length < 2)
        continue allSelectors;

      localContext.data = data;

      this.reduceSelector(tokens, selector, data, {
        filterOut: filterOut,
        callback: collectReducedBodies
      });

      if (reducedBodies[reducedBodies.length - 1].list.join(';') != reducedBodies[0].list.join(';'))
        continue allSelectors;
    }

    intoToken.body = reducedBodies[0].tokenized;
    reduced = true;
  }

  return reduced;
};

AdvancedOptimizer.prototype.reduceSelector = function (tokens, selector, data, options) {
  var bodies = [];
  var bodiesAsList = [];
  var joinsAt = [];
  var processedTokens = [];

  for (var j = data.length - 1, m = 0; j >= 0; j--) {
    if (options.filterOut(j, bodies))
      continue;

    var where = data[j].where;
    var token = tokens[where];

    bodies = bodies.concat(token.body);
    bodiesAsList.push(token.metadata.bodiesList);
    processedTokens.push(where);
  }

  for (j = 0, m = bodiesAsList.length; j < m; j++) {
    if (bodiesAsList[j].length > 0)
      joinsAt.push((joinsAt[j - 1] || 0) + bodiesAsList[j].length);
  }

  var optimizedBody = this.propertyOptimizer.process(selector, bodies, joinsAt, false);

  var processedCount = processedTokens.length;
  var propertyIdx = optimizedBody.tokenized.length - 1;
  var tokenIdx = processedCount - 1;

  while (tokenIdx >= 0) {
     if ((tokenIdx === 0 || (optimizedBody.tokenized[propertyIdx] && bodiesAsList[tokenIdx].indexOf(optimizedBody.tokenized[propertyIdx].value) > -1)) && propertyIdx > -1) {
      propertyIdx--;
      continue;
    }

    var newBody = {
      list: optimizedBody.list.splice(propertyIdx + 1),
      tokenized: optimizedBody.tokenized.splice(propertyIdx + 1)
    };
    options.callback(tokens[processedTokens[tokenIdx]], newBody, processedCount, tokenIdx);

    tokenIdx--;
  }
};

AdvancedOptimizer.prototype.mergeNonAdjacentBySelector = function (tokens) {
  var allSelectors = {};
  var repeatedSelectors = [];
  var i;

  for (i = tokens.length - 1; i >= 0; i--) {
    if (tokens[i].kind != 'selector')
      continue;
    if (tokens[i].body.length === 0)
      continue;

    var selector = tokens[i].metadata.selector;
    allSelectors[selector] = [i].concat(allSelectors[selector] || []);

    if (allSelectors[selector].length == 2)
      repeatedSelectors.push(selector);
  }

  for (i = repeatedSelectors.length - 1; i >= 0; i--) {
    var positions = allSelectors[repeatedSelectors[i]];

    selectorIterator:
    for (var j = positions.length - 1; j > 0; j--) {
      var targetPosition = positions[j - 1];
      var targetToken = tokens[targetPosition];
      var movedPosition = positions[j];
      var movedToken = tokens[movedPosition];
      var movedProperties = extractProperties(movedToken);

      for (var k = movedPosition - 1; k > targetPosition; k--) {
        if (tokens[k].kind == 'selector' && unsafeTraversal(tokens[k], movedProperties))
          continue selectorIterator;
      }

      var joinAt = [movedToken.body.length];
      var newBody = this.propertyOptimizer.process(targetToken.value, targetToken.body.concat(movedToken.body), joinAt, true);
      changeBodyOf(targetToken, newBody);
      movedToken.body = [];
    }
  }
};

AdvancedOptimizer.prototype.mergeNonAdjacentByBody = function (tokens) {
  var candidates = {};
  var adjacentSpace = this.options.compatibility.selectors.adjacentSpace;

  for (var i = tokens.length - 1; i >= 0; i--) {
    var token = tokens[i];
    if (token.kind != 'selector')
      continue;

    if (token.body.length > 0 && unsafeSelector(token.metadata.selector))
      candidates = {};

    var oldToken = candidates[token.metadata.body];
    if (oldToken && !this.isSpecial(token.metadata.selector) && !this.isSpecial(oldToken.metadata.selector)) {
      changeSelectorOf(
        token,
        CleanUp.selectors(oldToken.value.concat(token.value), false, adjacentSpace)
      );

      oldToken.body = [];
      candidates[token.metadata.body] = null;
    }

    candidates[token.metadata.body] = token;
  }
};

function optimizeProperties(tokens, propertyOptimizer) {
  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];

    if (token.kind == 'selector') {
      changeBodyOf(
        token,
        propertyOptimizer.process(token.value, token.body, false, true)
      );
    } else if (token.kind == 'block') {
      optimizeProperties(token.body, propertyOptimizer);
    }
  }
}

AdvancedOptimizer.prototype.optimize = function (tokens) {
  var self = this;

  function _optimize(tokens) {
    tokens.forEach(function (token) {
      if (token.kind == 'block')
        _optimize(token.body);
    });

    optimizeProperties(tokens, self.propertyOptimizer);

    self.removeDuplicates(tokens);
    self.mergeAdjacent(tokens);
    self.reduceNonAdjacent(tokens);

    self.removeDuplicates(tokens);
    self.mergeAdjacent(tokens);

    self.mergeNonAdjacentBySelector(tokens);
    self.mergeNonAdjacentByBody(tokens);
  }

  _optimize(tokens);
};

module.exports = AdvancedOptimizer;
