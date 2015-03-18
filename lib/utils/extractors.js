var Splitter = require('./splitter');

var Extractors = {
  properties: function (string, context) {
    var list = [];
    var buffer = [];
    var all = [];
    var property;
    var isPropertyEnd;
    var isWhitespace;
    var wasWhitespace;
    var isSpecial;
    var wasSpecial;
    var current;
    var last;
    var secondToLast;
    var wasCloseParenthesis;
    var isEscape;
    var metadata;

    if (string.replace && string.indexOf(')') > 0)
      string = string.replace(/\)([^\s_;:,\)])/g, context.sourceMaps ? ') __ESCAPED_COMMENT_CLEAN_CSS(0,-1)__$1' : ') $1');

    for (var i = 0, l = string.length; i < l; i++) {
      current = string[i];
      isPropertyEnd = current === ';';

      isEscape = !isPropertyEnd && current == '_' && string.indexOf('__ESCAPED_COMMENT', i) === i;
      if (isEscape) {
        if (buffer.length > 0) {
          i--;
          isPropertyEnd = true;
        } else {
          var endOfEscape = string.indexOf('__', i + 1) + 2;
          var comment = string.substring(i, endOfEscape);
          i = endOfEscape - 1;

          if (comment.indexOf('__ESCAPED_COMMENT_SPECIAL') === -1) {
            context.track(comment);
            continue;
          }
          else {
            buffer = all = [comment];
          }
        }
      }

      if (isPropertyEnd || isEscape) {
        if (wasWhitespace && buffer[buffer.length - 1] === ' ')
          buffer.pop();
        if (buffer.length > 0) {
          property = buffer.join('');
          if (property.indexOf('{') === -1) {
            metadata = context.track(all.join(''), true);
            list.push([property].concat(metadata));

            if (!isEscape)
              context.track(';');
          }
        }
        buffer = [];
        all = [];
      } else {
        isWhitespace = current === ' ' || current === '\t' || current === '\n';
        isSpecial = current === ':' || current === '[' || current === ']' || current === ',' || current === '(' || current === ')';

        if (wasWhitespace && isSpecial) {
          last = buffer[buffer.length - 1];
          secondToLast = buffer[buffer.length - 2];
          if (secondToLast != '+' && secondToLast != '-' && secondToLast != '/' && secondToLast != '*' && last != '(')
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
      if (property.indexOf('{') === -1) {
        metadata = context.track(all.join(''), true);
        list.push([property].concat(metadata));
      }
    } else if (all.indexOf('\n') > -1) {
      context.track(all.join(''));
    }

    return list;
  },

  selectors: function (string, context) {
    var list = [];
    var metadata;
    var selectors = new Splitter(',').split(string);

    for (var i = 0, l = selectors.length; i < l; i++) {
      metadata = context.track(selectors[i], true, i);
      context.track(',');
      list.push([selectors[i]].concat(metadata));
    }

    return list;
  }
};

module.exports = Extractors;
