var Chunker = require('../utils/chunker');
var Splitter = require('../utils/splitter');

var flatBlock = /(^@(font\-face|page|\-ms\-viewport|\-o\-viewport|viewport|counter\-style)|\\@.+?)/;
var WHITESPACE = /\s/g;
var MULTI_WHITESPACE = /\s{2,}/g;
var WHITESPACE_COMMA = / ?, ?/g;

function Tokenizer(minifyContext, addMetadata) {
  this.minifyContext = minifyContext;
  this.addMetadata = addMetadata;
}

Tokenizer.prototype.toTokens = function (data) {
  data = data.replace(/\r\n/g, '\n');

  var chunker = new Chunker(data, '}', 128);
  if (chunker.isEmpty())
    return [];

  var context = {
    cursor: 0,
    mode: 'top',
    chunker: chunker,
    chunk: chunker.next(),
    outer: this.minifyContext,
    addMetadata: this.addMetadata
  };

  return tokenize(context);
};

function valueMapper(property) { return { value: property }; }

function extractProperties(string) {
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
}

function extractSelectors(string) {
  var extracted = string
    .replace(WHITESPACE, ' ')
    .replace(MULTI_WHITESPACE, ' ')
    .replace(WHITESPACE_COMMA, ',')
    .trim();

  var selectors = new Splitter(',').split(extracted);
  return {
    list: selectors,
    tokenized: selectors.map(valueMapper)
  };
}

function extractBlock(string) {
  return string
    .replace(WHITESPACE, ' ')
    .replace(MULTI_WHITESPACE, ' ')
    .trim();
}

function whatsNext(context) {
  var mode = context.mode;
  var chunk = context.chunk;
  var closest;

  if (chunk.length == context.cursor) {
    if (context.chunker.isEmpty())
      return null;

    context.chunk = chunk = context.chunker.next();
    context.cursor = 0;
  }

  if (mode == 'body') {
    closest = chunk.indexOf('}', context.cursor);
    return closest > -1 ?
      [closest, 'bodyEnd'] :
      null;
  }

  var nextSpecial = chunk.indexOf('@', context.cursor);
  var nextEscape = chunk.indexOf('__ESCAPED_', context.cursor);
  var nextBodyStart = chunk.indexOf('{', context.cursor);
  var nextBodyEnd = chunk.indexOf('}', context.cursor);

  if (nextEscape > -1 && /\S/.test(chunk.substring(context.cursor, nextEscape)))
    nextEscape = -1;

  closest = nextSpecial;
  if (closest == -1 || (nextEscape > -1 && nextEscape < closest))
    closest = nextEscape;
  if (closest == -1 || (nextBodyStart > -1 && nextBodyStart < closest))
    closest = nextBodyStart;
  if (closest == -1 || (nextBodyEnd > -1 && nextBodyEnd < closest))
    closest = nextBodyEnd;

  if (closest == -1)
    return;
  if (nextEscape === closest)
    return [closest, 'escape'];
  if (nextBodyStart === closest)
    return [closest, 'bodyStart'];
  if (nextBodyEnd === closest)
    return [closest, 'bodyEnd'];
  if (nextSpecial === closest)
    return [closest, 'special'];
}

function tokenize(context) {
  var chunk = context.chunk;
  var tokenized = [];

  while (true) {
    var next = whatsNext(context);
    if (!next) {
      var whatsLeft = context.chunk.substring(context.cursor);
      if (whatsLeft.length > 0) {
        tokenized.push({ kind: 'text', value: whatsLeft });
        context.cursor += whatsLeft.length;
      }
      break;
    }

    var nextSpecial = next[0];
    var what = next[1];
    var nextEnd;
    var oldMode;

    chunk = context.chunk;

    if (what == 'special') {
      var firstOpenBraceAt = chunk.indexOf('{', nextSpecial);
      var firstSemicolonAt = chunk.indexOf(';', nextSpecial);
      var isSingle = firstSemicolonAt > -1 && (firstOpenBraceAt == -1 || firstSemicolonAt < firstOpenBraceAt);
      var isBroken = firstOpenBraceAt == -1 && firstSemicolonAt == -1;
      if (isBroken) {
        context.outer.warnings.push('Broken declaration: \'' + chunk.substring(context.cursor) +  '\'.');
        context.cursor = chunk.length;
      } else if (isSingle) {
        nextEnd = chunk.indexOf(';', nextSpecial + 1);

        var single = extractBlock(chunk.substring(context.cursor, nextEnd + 1));
        tokenized.push({ kind: 'text', value: single });

        context.cursor = nextEnd + 1;
      } else {
        nextEnd = chunk.indexOf('{', nextSpecial + 1);
        var block = chunk.substring(context.cursor, nextEnd).trim();

        var isFlat = flatBlock.test(block);
        oldMode = context.mode;
        context.cursor = nextEnd + 1;
        context.mode = isFlat ? 'body' : 'block';
        var specialBody = tokenize(context);

        if (typeof specialBody == 'string')
          specialBody = extractProperties(specialBody).tokenized;

        context.mode = oldMode;

        tokenized.push({ kind: 'block', value: block, body: specialBody, isFlatBlock: isFlat });
      }
    } else if (what == 'escape') {
      nextEnd = chunk.indexOf('__', nextSpecial + 1);
      var escaped = chunk.substring(context.cursor, nextEnd + 2);
      tokenized.push({ kind: 'text', value: escaped });

      context.cursor = nextEnd + 2;
    } else if (what == 'bodyStart') {
      var selectorData = extractSelectors(chunk.substring(context.cursor, nextSpecial));

      oldMode = context.mode;
      context.cursor = nextSpecial + 1;
      context.mode = 'body';
      var bodyData = extractProperties(tokenize(context));

      context.mode = oldMode;

      var newToken = {
        kind: 'selector',
        value: selectorData.tokenized,
        body: bodyData.tokenized
      };
      if (context.addMetadata) {
        newToken.metadata = {
          body: bodyData.list.join(','),
          bodiesList: bodyData.list,
          selector: selectorData.list.join(','),
          selectorsList: selectorData.list
        };
      }
      tokenized.push(newToken);
    } else if (what == 'bodyEnd') {
      // extra closing brace at the top level can be safely ignored
      if (context.mode == 'top') {
        var at = context.cursor;
        var warning = chunk[context.cursor] == '}' ?
          'Unexpected \'}\' in \'' + chunk.substring(at - 20, at + 20) + '\'. Ignoring.' :
          'Unexpected content: \'' + chunk.substring(at, nextSpecial + 1) + '\'. Ignoring.';

        context.outer.warnings.push(warning);
        context.cursor = nextSpecial + 1;
        continue;
      }

      if (context.mode != 'block')
        tokenized = chunk.substring(context.cursor, nextSpecial);

      context.cursor = nextSpecial + 1;

      break;
    }
  }

  return tokenized;
}

module.exports = Tokenizer;
