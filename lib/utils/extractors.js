var Splitter = require('./splitter');
var SourceMaps = require('../utils/source-maps');

function tokenMetadata(value, context, addExtra) {
  var withoutContent;
  var total;
  var split = value.split('\n');
  var shift = 0;
  for (withoutContent = 0, total = split.length; withoutContent < total; withoutContent++) {
    var part = split[withoutContent];
    if (/\S/.test(part))
      break;

    shift += part.length + 1;
  }

  context.line += withoutContent;
  context.column = withoutContent > 0 ? 1 : context.column;
  context.column += /^(\s)*/.exec(split[withoutContent])[0].length;

  return SourceMaps.saveAndTrack(value.substring(shift).trimLeft(), context, addExtra);
}

var Extractors = {
  properties: function (string, context) {
    var tokenized = [];
    var list = [];
    var buffer = [];
    var all = [];
    var property;
    var isWhitespace;
    var wasWhitespace;
    var isSpecial;
    var wasSpecial;
    var current;
    var wasCloseParenthesis;
    var isEscape;
    var token;
    var addSourceMap = context.addSourceMap;

    for (var i = 0, l = string.length; i < l; i++) {
      current = string[i];

      isEscape = current == '_' && buffer.length < 2 && string.indexOf('__ESCAPED_', i) === 0;
      if (isEscape) {
        var endOfEscape = string.indexOf('__', i + 1) + 2;
        buffer = all = [string.substring(i, endOfEscape)];
        i = endOfEscape - 1;
      }

      if (current === ';' || isEscape) {
        if (wasWhitespace && buffer[buffer.length - 1] === ' ')
          buffer.pop();
        if (buffer.length > 0) {
          property = buffer.join('');
          token = { value: property };
          tokenized.push(token);
          list.push(property);

          if (addSourceMap)
            token.metadata = tokenMetadata(all.join(''), context, !isEscape);
        }
        buffer = [];
        all = [];
      } else {
        isWhitespace = current === ' ' || current === '\t' || current === '\n';
        isSpecial = current === ':' || current === '[' || current === ']' || current === ',' || current === '(' || current === ')';

        if (wasWhitespace && isSpecial) {
          buffer.pop();
          buffer.push(current);
        } else if (isWhitespace && wasSpecial && !wasCloseParenthesis) {
        } else if (isWhitespace && !wasWhitespace && buffer.length > 0) {
          buffer.push(' ');
        } else if (isWhitespace && buffer.length === 0) {
        } else if (isWhitespace && wasWhitespace) {
        } else {
          buffer.push(isWhitespace ? ' ' : current);
        }

        all.push(current);
      }

      wasSpecial = isSpecial;
      wasWhitespace = isWhitespace;
      wasCloseParenthesis = current === ')';
    }

    if (wasWhitespace && buffer[buffer.length - 1] === ' ')
      buffer.pop();
    if (buffer.length > 0) {
      property = buffer.join('');
      token = { value: property };
      tokenized.push(token);
      list.push(property);

      if (addSourceMap)
        token.metadata = tokenMetadata(all.join(''), context, false);
    } else if (all.indexOf('\n') > -1) {
      SourceMaps.track(all.join('\n'), context);
    }

    return {
      list: list,
      tokenized: tokenized
    };
  },

  selectors: function (string, context) {
    var tokenized = [];
    var list = [];
    var selectors = new Splitter(',').split(string);
    var addSourceMap = context.addSourceMap;

    for (var i = 0, l = selectors.length; i < l; i++) {
      var selector = selectors[i];

      list.push(selector);

      var token = { value: selector };
      tokenized.push(token);

      if (addSourceMap)
        token.metadata = tokenMetadata(selector, context, true);
    }

    return {
      list: list,
      tokenized: tokenized
    };
  }
};

module.exports = Extractors;
