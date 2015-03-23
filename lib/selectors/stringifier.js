var lineBreak = require('os').EOL;

function Stringifier(options, restoreCallback) {
  this.keepBreaks = options.keepBreaks;
  this.restoreCallback = restoreCallback;
}

function selectorRebuilder(elements) {
  var merged = '';

  for (var i = 0, l = elements.length; i < l; i++) {
    merged += elements[i] + (i < l - 1 ? ',' : '');
  }

  return merged;
}

function bodyRebuilder(elements) {
  var merged = '';
  var element, important, lastSemicolonAt, value, valueLastChar, shouldSkipSpaceAfter;

  for (var i = 0, l = elements.length; i < l; i++) {
    element = elements[i];

    if (typeof element == 'string' && element.indexOf('__ESCAPED_') === 0) {
      merged += element;

      if (i === l - 1) {
        lastSemicolonAt = merged.lastIndexOf(';');
        merged = merged.substring(0, lastSemicolonAt) + merged.substring(lastSemicolonAt + 1);
      }
    } else {
      important = element[0][1];
      merged += element[0][0] + ':';

      for (var j = 1, m = element.length; j < m; j++) {
        value = element[j][0];
        valueLastChar = value[value.length - 1];

        if (value == ',' || value == '/') {
          if (merged[merged.length - 1] == ')')
            merged += value;
          else
            merged = merged.substring(0, merged.length - 1) + value;
        } else {
          shouldSkipSpaceAfter = j == m - 1 || valueLastChar == ')' && value.indexOf('progid') == -1;
          merged += value + (shouldSkipSpaceAfter ? '' : ' ');
        }
      }

      if (important)
        merged += '!important';

      merged += (i < l - 1 ? ';' : '');
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
        body = bodyRebuilder(token[2]);
        if (body.length > 0)
          parts.push(token[1][0] + '{' + body + '}');
        break;
      default:
        selector = selectorRebuilder(token[1]);
        body = bodyRebuilder(token[2]);
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
