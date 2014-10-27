var Splitter = require('./splitter');

function valueMapper(property) {
  return { value: property };
}

var Extractors = {
  properties: function (string) {
    var tokenized = [];
    var list = [];
    var buffer = [];
    var property;
    var isWhitespace;
    var wasWhitespace;
    var isSpecial;
    var wasSpecial;
    var current;
    var wasCloseParenthesis;

    for (var i = 0, l = string.length; i < l; i++) {
      current = string[i];

      if (current === ';') {
        if (wasWhitespace && buffer[buffer.length - 1] === ' ')
          buffer.pop();
        if (buffer.length > 0) {
          property = buffer.join('');
          tokenized.push({ value: property });
          list.push(property);
        }
        buffer = [];
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
      }

      wasSpecial = isSpecial;
      wasWhitespace = isWhitespace;
      wasCloseParenthesis = current === ')';
    }

    if (wasWhitespace && buffer[buffer.length - 1] === ' ')
      buffer.pop();
    if (buffer.length > 0) {
      property = buffer.join('');
      tokenized.push({ value: property });
      list.push(property);
    }

    return {
      list: list,
      tokenized: tokenized
    };
  },

  selectors: function (string) {
    var selectors = new Splitter(',').split(string);

    return {
      list: selectors,
      tokenized: selectors.map(valueMapper)
    };
  }
};

module.exports = Extractors;
