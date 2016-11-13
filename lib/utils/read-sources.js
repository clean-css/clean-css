var path = require('path');

var tokenize = require('../tokenizer/tokenize');
var Token = require('../tokenizer/token');

var rewriteUrl = require('../urls/rewrite-url');

function readSources(input, context, callback) {
  var tokens;

  if (typeof input == 'string') {
    tokens = tokenize(input, context);
  } else if (typeof input == 'object') {
    tokens = fromHash(input, context);
  }

  return callback(tokens);
}

function fromHash(input, context) {
  var tokens = [];
  var sourcePath;
  var source;
  var baseRelativeTo = context.options.relativeTo || context.options.root;
  var relativeTo;
  var fullPath;
  var config;

  for (sourcePath in input) {
    source = input[sourcePath];
    relativeTo = sourcePath[0] == '/' ?
      context.options.root :
      baseRelativeTo;
    fullPath = path.resolve(
      path.join(
        relativeTo,
        sourcePath
      )
    );

    config = {
      relative: true,
      fromBase: path.dirname(fullPath),
      toBase: baseRelativeTo
    };

    tokens = tokens.concat(
      rebase(
        tokenize(source.styles, context),
        context.validator,
        config
      )
    );
  }

  return tokens;
}

function rebase(tokens, validator, config) {
  var token;
  var i, l;

  for (i = 0, l = tokens.length; i < l; i++) {
    token = tokens[i];

    switch (token[0]) {
      case Token.AT_RULE:
        //
        break;
      case Token.AT_RULE_BLOCK:
        //
        break;
      case Token.BLOCK:
        rebase(token[2], validator, config);
        break;
      case Token.PROPERTY:
        //
        break;
      case Token.RULE:
        rebaseProperties(token[2], validator, config);
        break;
    }
  }

  return tokens;
}

function rebaseProperties(properties, validator, config) {
  var property;
  var value;
  var i, l;
  var j, m;

  for (i = 0, l = properties.length; i < l; i++) {
    property = properties[i];

    for (j = 2 /* 0 is Token.PROPERTY, 1 is name */, m = property.length; j < m; j++) {
      value = property[j][1];

      if (validator.isValidUrl(value)) {
        property[j][1] = rewriteUrl(value, config);
      }
    }
  }
}

module.exports = readSources;
