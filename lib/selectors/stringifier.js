var lineBreak = require('os').EOL;

function Stringifier(options, restoreCallback) {
  this.keepBreaks = options.keepBreaks;
  this.restoreCallback = restoreCallback;
}

function valueRebuilder(elements, separator) {
  var merged = '';
  var element;

  for (var i = 0, l = elements.length; i < l; i++) {
    element = elements[i];

    if (element[0].indexOf('__ESCAPED_') === 0) {
      merged += element[0];

      if (i === l - 1) {
        var lastSemicolonAt = merged.lastIndexOf(';');
        merged = merged.substring(0, lastSemicolonAt) + merged.substring(lastSemicolonAt + 1);
      }
    } else {
      merged += element[0] + (i < l - 1 ? separator : '');
    }
  }

  return merged;
}

function rebuild(tokens, keepBreaks, isFlatBlock) {
  var joinCharacter = isFlatBlock ? ';' : (keepBreaks ? lineBreak : '');
  var parts = [];
  var body;
  var selector;

  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];

    switch (token[0]) {
      case 'at-rule':
      case 'text':
        parts.push(token[1][0]);
        break;
      case 'block':
        body = rebuild(token[2], keepBreaks, false);
        if (body.length > 0)
          parts.push(token[1][0] + '{' + body + '}');
        break;
      case 'flat-block':
        body = valueRebuilder(token[2], ';');
        if (body.length > 0)
          parts.push(token[1][0] + '{' + body + '}');
        break;
      default:
        selector = valueRebuilder(token[1], ',');
        body = valueRebuilder(token[2], ';');
        parts.push(selector + '{' + body + '}');
    }
  }

  return parts.join(joinCharacter);
}

Stringifier.prototype.toString = function (tokens) {
  var rebuilt = rebuild(tokens, this.keepBreaks, false);

  return {
    styles: this.restoreCallback(rebuilt).trim()
  };
};

module.exports = Stringifier;
