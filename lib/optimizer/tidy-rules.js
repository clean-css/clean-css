var Marker = require('../tokenizer/marker');

var RELATION_PATTERN = /[>\+~]/;
var WHITESPACE_PATTERN = /\s/;

var STAR_PLUS_HTML_HACK = '*+html ';
var STAR_FIRST_CHILD_PLUS_HTML_HACK = '*:first-child+html ';

function removeWhitespace(value) {
  var stripped = [];
  var character;
  var isNewLineNix;
  var isNewLineWin;
  var isEscaped;
  var wasEscaped;
  var isQuote;
  var isAttribute;
  var isRelation;
  var isWhitespace;
  var roundBracketLevel = 0;
  var wasRelation = false;
  var wasWhitespace = false;
  var i, l;

  for (i = 0, l = value.length; i < l; i++) {
    character = value[i];

    isNewLineNix = character == Marker.NEW_LINE_NIX;
    isNewLineWin = character == Marker.NEW_LINE_NIX && value[i - 1] == Marker.NEW_LINE_WIN;
    isRelation = !isEscaped && RELATION_PATTERN.test(character);
    isWhitespace = WHITESPACE_PATTERN.test(character);

    if (wasEscaped && isQuote && isNewLineWin) {
      // swallow escaped new windows lines in comments
      stripped.pop();
      stripped.pop();
    } else if (isEscaped && isQuote && isNewLineNix) {
      // swallow escaped new *nix lines in comments
      stripped.pop();
    } else if (isEscaped) {
      stripped.push(character);
    } else if (character == Marker.OPEN_SQUARE_BRACKET && !isQuote) {
      stripped.push(character);
      isAttribute = true;
    } else if (character == Marker.CLOSE_SQUARE_BRACKET && !isQuote) {
      stripped.push(character);
      isAttribute = false;
    } else if (character == Marker.OPEN_ROUND_BRACKET && !isQuote) {
      stripped.push(character);
      roundBracketLevel++;
    } else if (character == Marker.CLOSE_ROUND_BRACKET && !isQuote) {
      stripped.push(character);
      roundBracketLevel--;
    } else if ((character == Marker.SINGLE_QUOTE || character == Marker.DOUBLE_QUOTE) && !isQuote) {
      stripped.push(character);
      isQuote = true;
    } else if (character == Marker.SINGLE_QUOTE || character == Marker.DOUBLE_QUOTE) {
      stripped.push(character);
      isQuote = false;
    } else if (isWhitespace && wasRelation) {
      continue;
    } else if (isWhitespace && (isAttribute || roundBracketLevel > 0) && !isQuote) {
      // skip space
    } else if (isWhitespace && wasWhitespace && !isQuote) {
      // skip extra space
    } else if ((isNewLineWin || isNewLineNix) && (isAttribute || roundBracketLevel > 0) && isQuote) {
      // skip newline
    } else if (isRelation && wasWhitespace) {
      stripped.pop();
      stripped.push(character);
    } else if (isWhitespace) {
      stripped.push(Marker.SPACE);
    } else {
      stripped.push(character);
    }

    wasEscaped = isEscaped;
    isEscaped = character == Marker.BACK_SLASH;
    wasRelation = isRelation;
    wasWhitespace = isWhitespace;
  }

  return stripped.join('');
}

function removeQuotes(value) {
  return value
    .replace(/([^\[])'([a-zA-Z][a-zA-Z\d\-_]+)([^\]])'/g, '$1$2$3')
    .replace(/([^\[])"([a-zA-Z][a-zA-Z\d\-_]+)([^\]])"/g, '$1$2$3');
}

function ruleSorter(s1, s2) {
  return s1[0] > s2[0] ? 1 : -1;
}

function tidyRules(rules, removeUnsupported, adjacentSpace) {
  var list = [];
  var repeated = [];

  for (var i = 0, l = rules.length; i < l; i++) {
    var rule = rules[i];
    var reduced = rule[0];

    reduced = removeWhitespace(reduced);
    reduced = removeQuotes(reduced);

    if (adjacentSpace && reduced.indexOf('nav') > 0) {
      reduced = reduced.replace(/\+nav(\S|$)/, '+ nav$1');
    }

    if (removeUnsupported && reduced.indexOf(STAR_PLUS_HTML_HACK) > -1) {
      continue;
    }

    if (removeUnsupported && reduced.indexOf(STAR_FIRST_CHILD_PLUS_HTML_HACK) > -1) {
      continue;
    }

    if (reduced.indexOf('*') > -1) {
      reduced = reduced
        .replace(/\*([:#\.\[])/g, '$1')
        .replace(/^(\:first\-child)?\+html/, '*$1+html');
    }

    if (repeated.indexOf(reduced) > -1) {
      continue;
    }

    rule[0] = reduced;
    repeated.push(reduced);
    list.push(rule);
  }

  return list.sort(ruleSorter);
}

module.exports = tidyRules;
