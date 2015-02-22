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

function naturalSorter(a, b) {
  return a > b;
}

function allProperties(token) {
  var properties = [];

  if (token.kind == 'selector') {
    for (var i = token.metadata.bodiesList.length - 1; i >= 0; i--) {
      var property = token.metadata.bodiesList[i];
      if (property.indexOf('__ESCAPED') === 0)
        continue;

      var splitAt = property.indexOf(':');
      var name = property.substring(0, splitAt);
      var nameRoot = name.match(/([a-z]+)/)[0];

      properties.push([
        name,
        property.substring(splitAt + 1),
        nameRoot
      ]);
    }
  } else if (token.kind == 'block') {
    for (var j = token.body.length - 1; j >= 0; j--) {
      properties = properties.concat(allProperties(token.body[j]));
    }
  }

  return properties;
}

function canReorder(left, right) {
  for (var i = right.length - 1; i >= 0; i--) {
    for (var j = left.length - 1; j >= 0; j--) {
      if (!canReorderSingle(right[i], left[j]))
        return false;
    }
  }

  return true;
}

function canReorderSingle(right, left) {
  var rightName = right[0];
  var rightValue = right[1];
  var rightNameRoot = right[2];
  var leftName = left[0];
  var leftValue = left[1];
  var leftNameRoot = left[2];

  if (rightNameRoot != leftNameRoot)
    return true;
  if (rightName == leftName && rightNameRoot == leftNameRoot && rightValue == leftValue)
    return true;
  if (rightName != leftName && rightNameRoot == leftNameRoot && rightName != rightNameRoot && leftName != leftNameRoot)
    return true;

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

    if (token.kind != 'selector') {
      lastToken = { selector: null, body: null };
      continue;
    }

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
      var movedProperties = allProperties(movedToken);

      for (var k = movedPosition - 1; k > targetPosition; k--) {
        var traversedProperties = allProperties(tokens[k]);

        // traversed then moved as we move selectors towards the start
        if (!canReorder(traversedProperties, movedProperties))
          continue selectorIterator;
      }

      var joinAt = [movedToken.body.length];
      var newBody = this.propertyOptimizer.process(targetToken.value, targetToken.body.concat(movedToken.body), joinAt, true);
      changeBodyOf(targetToken, newBody);
      changeBodyOf(movedToken, { tokenized: [], list: [] });
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

      changeBodyOf(oldToken, { tokenized: [], list: [] });
      candidates[token.metadata.body] = null;
    }

    candidates[token.metadata.body] = token;
  }
};

AdvancedOptimizer.prototype.restructure = function (tokens) {
  var movableTokens = {};
  var movedProperties = [];
  var self = this;

  function tokensToMerge(sourceTokens) {
    var uniqueTokens = [];
    var mergeableTokens = [];

    for (var i = sourceTokens.length - 1; i >= 0; i--) {
      if (self.isSpecial(sourceTokens[i].metadata.selector))
        continue;

      mergeableTokens.unshift(sourceTokens[i]);
      if (uniqueTokens.indexOf(sourceTokens[i]) == -1)
        uniqueTokens.push(sourceTokens[i]);
    }

    return uniqueTokens.length > 1 ?
      mergeableTokens :
      [];
  }

  function shouldResultInAShorterContent(movedProperty, asNewTokenCallback) {
    var name = movedProperty[0];
    var value = movedProperty[1];
    var valueSize = name.length + value.length + 2;
    var beforeSize = 0;
    var afterSize = 0;
    var allSelectors = [];
    var mergeableTokens = tokensToMerge(movableTokens[name]);

    for (var i = mergeableTokens.length - 1; i >= 0; i--) {
      var mergeableToken = mergeableTokens[i];
      allSelectors = mergeableToken.value.concat(allSelectors);

      var selectorLength = mergeableToken.metadata.selector.length + mergeableToken.metadata.body.length;
      if (mergeableToken.body.length > 1)
        afterSize += selectorLength - valueSize - 1;
      beforeSize += selectorLength;
    }

    allSelectors = CleanUp.selectorDuplicates(allSelectors);
    afterSize += allSelectors.list.join(',').length + valueSize;

    if (afterSize < beforeSize)
      asNewTokenCallback(name, value, allSelectors, mergeableTokens);
  }

  function dropAsNewTokenAt(position) {
    return function (name, value, allSelectors, mergeableTokens) {
      var bodyMetadata;

      for (var i = mergeableTokens.length - 1; i >= 0; i--) {
        var mergeableToken = mergeableTokens[i];

        for (var j = mergeableToken.body.length - 1; j >= 0; j--) {
          if (mergeableToken.body[j].value.indexOf(name + ':') === 0) {
            bodyMetadata = mergeableToken.body[j].metadata;

            mergeableToken.body.splice(j, 1);
            mergeableToken.metadata.bodiesList.splice(j, 1);
            mergeableToken.metadata.body = mergeableToken.metadata.bodiesList.join(';');
            break;
          }
        }
      }

      var newToken = { kind: 'selector', metadata: {} };
      changeSelectorOf(newToken, allSelectors);
      changeBodyOf(newToken, {
        tokenized: [{ value: name + ':' + value }],
        list: [name + ':' + value]
      });
      if (self.options.sourceMap)
        newToken.body[0].metadata = bodyMetadata;

      tokens.splice(position, 0, newToken);
    };
  }

  function dropPropertiesAt(position, movedProperty) {
    var movedName = movedProperty[0];

    if (movableTokens[movedName] && movableTokens[movedName].length > 1)
      shouldResultInAShorterContent(movedProperty, dropAsNewTokenAt(position));
  }

  for (var i = tokens.length - 1; i >= 0; i--) {
    var token = tokens[i];
    var isSelector;

    if (token.kind == 'selector') {
      isSelector = true;
    } else if (token.kind == 'block' && !token.isFlatBlock) {
      isSelector = false;
    } else {
      continue;
    }

    var properties = allProperties(token);
    var movedToBeDropped = [];

    // We cache movedProperties.length as it may change in the loop
    var movedCount = movedProperties.length;

    for (var j = 0, m = properties.length; j < m; j++) {
      var property = properties[j];
      var canReorder = true;
      var movedSameProperty = false;

      for (var k = 0; k < movedCount; k++) {
        var movedProperty = movedProperties[k];

        if (movedToBeDropped.indexOf(k) == -1 && !canReorderSingle(property, movedProperty)) {
          dropPropertiesAt(i + 1, movedProperty);
          movedToBeDropped.push(k);
          canReorder = false;
        }

        if (!movedSameProperty)
          movedSameProperty = property[0] == movedProperty[0] && property[1] == movedProperty[1];
      }

      if (!isSelector)
        continue;

      if (canReorder) {
        var name = property[0];
        movableTokens[name] = movableTokens[name] || [];
        movableTokens[name].push(token);
      }

      if (!movedSameProperty)
        movedProperties.push(property);
    }

    movedToBeDropped = movedToBeDropped.sort(naturalSorter);
    for (j = 0, m = movedToBeDropped.length; j < m; j++) {
      delete movableTokens[movedProperties[movedToBeDropped[j] - j][0]];
      movedProperties.splice(movedToBeDropped[j] - j, 1);
    }
  }

  var position = tokens[0] && tokens[0].kind == 'at-rule' && tokens[0].value.indexOf('@charset') === 0 ? 1 : 0;
  for (i = 0; i < movedProperties.length; i++) {
    dropPropertiesAt(position, movedProperties[i]);
  }
};

AdvancedOptimizer.prototype.mergeMediaQueries = function (tokens) {
  var candidates = {};
  var reduced = [];

  for (var i = tokens.length - 1; i >= 0; i--) {
    var token = tokens[i];
    if (token.kind != 'block' || token.isFlatBlock === true)
      continue;

    var candidate = candidates[token.value];
    if (!candidate) {
      candidate = [];
      candidates[token.value] = candidate;
    }

    candidate.push(i);
  }

  for (var name in candidates) {
    var positions = candidates[name];

    positionLoop:
    for (var j = positions.length - 1; j > 0; j--) {
      var source = tokens[positions[j]];
      var target = tokens[positions[j - 1]];
      var movedProperties = allProperties(source);

      for (var k = positions[j] + 1; k < positions[j - 1]; k++) {
        var traversedProperties = allProperties(tokens[k]);

        // moved then traversed as we move @media towards the end
        if (!canReorder(movedProperties, traversedProperties))
          continue positionLoop;
      }

      target.body = source.body.concat(target.body);
      source.body = [];

      reduced.push(target);
    }
  }

  return reduced;
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

  function _optimize(tokens, withRestructuring) {
    tokens.forEach(function (token) {
      if (token.kind == 'block') {
        var isKeyframes = /@(-moz-|-o-|-webkit-)?keyframes/.test(token.value);
        _optimize(token.body, !isKeyframes);
      }
    });

    optimizeProperties(tokens, self.propertyOptimizer);

    self.removeDuplicates(tokens);
    self.mergeAdjacent(tokens);
    self.reduceNonAdjacent(tokens);

    self.mergeNonAdjacentBySelector(tokens);
    self.mergeNonAdjacentByBody(tokens);

    if (withRestructuring) {
      self.restructure(tokens);
      self.mergeAdjacent(tokens);
    }

    if (self.options.mediaMerging) {
      var reduced = self.mergeMediaQueries(tokens);
      for (var i = reduced.length - 1; i >= 0; i--) {
        _optimize(reduced[i].body);
      }
    }
  }

  _optimize(tokens, true);
};

module.exports = AdvancedOptimizer;
