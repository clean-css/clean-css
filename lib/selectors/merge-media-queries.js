var canReorder = require('./reorderable').canReorder;
var extractProperties = require('./extractor');

function mergeMediaQueries(tokens) {
  var candidates = {};
  var reduced = [];

  for (var i = tokens.length - 1; i >= 0; i--) {
    var token = tokens[i];
    if (token[0] != 'block')
      continue;

    var candidate = candidates[token[1][0]];
    if (!candidate) {
      candidate = [];
      candidates[token[1][0]] = candidate;
    }

    candidate.push(i);
  }

  for (var name in candidates) {
    var positions = candidates[name];

    positionLoop:
    for (var j = positions.length - 1; j > 0; j--) {
      var source = tokens[positions[j]];
      var target = tokens[positions[j - 1]];
      var movedProperties = extractProperties(source);

      for (var k = positions[j] + 1; k < positions[j - 1]; k++) {
        var traversedProperties = extractProperties(tokens[k]);

        // moved then traversed as we move @media towards the end
        if (!canReorder(movedProperties, traversedProperties))
          continue positionLoop;
      }

      target[2] = source[2].concat(target[2]);
      source[2] = [];

      reduced.push(target);
    }
  }

  return reduced;
}

module.exports = mergeMediaQueries;
