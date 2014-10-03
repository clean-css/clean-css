var Chunker = require('../utils/chunker');
var Splitter = require('../utils/splitter');

var flatBlock = /(^@(font\-face|page|\-ms\-viewport|\-o\-viewport|viewport)|\\@.+?)/;

function Tokenizer(minifyContext) {
  this.minifyContext = minifyContext;
}

Tokenizer.prototype.toTokens = function (data) {
  var chunker = new Chunker(data, '}', 128);
  if (chunker.isEmpty())
    return [];

  var context = {
    cursor: 0,
    mode: 'top',
    chunker: chunker,
    chunk: chunker.next(),
    outer: this.minifyContext
  };

  return tokenize(context);
};

function extractProperties(string) {
  return string
    .replace(/\s{2,}/g, ' ')
    .replace(/ ?: ?/g, ':')
    .replace(/([\(,]) /g, '$1')
    .replace(/ ([\),])/g, '$1')
    .split(';')
    .map(function (value) { return value.trim(); })
    .filter(function (value) { return value.length > 0; });
}

function extractSelectors(string) {
  string = string
    .replace(/(\s{2,}|\s)/g, ' ')
    .replace(/, /g, ',');

  return new Splitter(',').split(string)
    .map(function (value) { return value.trim(); });
}

function extractBlock(string) {
  return string
    .replace(/\s/g, ' ')
    .replace(/\s{2,}/g, ' ')
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
        tokenized.push(whatsLeft);
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
      if (isSingle) {
        nextEnd = chunk.indexOf(';', nextSpecial + 1);

        var single = extractBlock(chunk.substring(context.cursor, nextEnd + 1));
        tokenized.push(single);

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
          specialBody = extractProperties(specialBody);

        context.mode = oldMode;

        tokenized.push({ block: block, body: specialBody, isFlatBlock: isFlat });
      }
    } else if (what == 'escape') {
      nextEnd = chunk.indexOf('__', nextSpecial + 1);
      var escaped = chunk.substring(context.cursor, nextEnd + 2);
      tokenized.push(escaped);

      context.cursor = nextEnd + 2;
    } else if (what == 'bodyStart') {
      var selector = extractSelectors(chunk.substring(context.cursor, nextSpecial));

      oldMode = context.mode;
      context.cursor = nextSpecial + 1;
      context.mode = 'body';
      var body = extractProperties(tokenize(context));

      context.mode = oldMode;

      tokenized.push({ selector: selector, body: body });
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
