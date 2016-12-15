var serializeAll = require('../writer/one-time').all;
var serializeRules = require('../writer/one-time').rules;

var Token = require('../tokenizer/token');

function removeDuplicateMediaQueries(tokens) {
  var candidates = {};
  var candidate;
  var token;
  var key;
  var i, l;

  for (i = 0, l = tokens.length; i < l; i++) {
    token = tokens[i];
    if (token[0] != Token.BLOCK) {
      continue;
    }

    key = serializeRules(token[1]) + '%' + serializeAll(token[2]);
    candidate = candidates[key];

    if (candidate) {
      candidate[2] = [];
    }

    candidates[key] = token;
  }
}

module.exports = removeDuplicateMediaQueries;
