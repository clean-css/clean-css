var Marker = require('../tokenizer/marker');

var RELATION_PATTERN = /[>\+~]/;
var WHITESPACE_PATTERN = /\s/;

var STAR_PLUS_HTML_HACK = '*+html ';
var STAR_FIRST_CHILD_PLUS_HTML_HACK = '*:first-child+html ';

function hasInvalidCharacters(value) {
  return value.indexOf(Marker.SINGLE_QUOTE) > -1 || value.indexOf(Marker.DOUBLE_QUOTE) > -1 ?
    hasInvalidCharactersWithQuotes(value) :
    hasInvalidCharactersWithoutQuotes(value);
}

function hasInvalidCharactersWithQuotes(value) {
  var isEscaped;
  var isInvalid = false;
  var character;
  var isQuote = false;
  var i, l;

  for (i = 0, l = value.length; i < l; i++) {
    character = value[i];

    if (isEscaped) {
      // continue as always
    } else if (character == Marker.SINGLE_QUOTE || character == Marker.DOUBLE_QUOTE) {
      isQuote = !isQuote;
    } else if (character == Marker.CLOSE_BRACE && !isQuote) {
      isInvalid = true;
      break;
    }

    isEscaped = character == Marker.BACK_SLASH;
  }

  return isInvalid;
}

function hasInvalidCharactersWithoutQuotes(value) {
  return value.indexOf(Marker.CLOSE_BRACE) > -1;
}

function removeWhitespace(value) {
  var stripped = [];
  var character;
  var isNewLineNix;
  var isNewLineWin;
  var isEscaped;
  var wasEscaped;
  var isQuoted;
  var isSingleQuoted;
  var isDoubleQuoted;
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
    isQuoted = isSingleQuoted || isDoubleQuoted;
    isRelation = !isEscaped && RELATION_PATTERN.test(character);
    isWhitespace = WHITESPACE_PATTERN.test(character);

    if (wasEscaped && isQuoted && isNewLineWin) {
      // swallow escaped new windows lines in comments
      stripped.pop();
      stripped.pop();
    } else if (isEscaped && isQuoted && isNewLineNix) {
      // swallow escaped new *nix lines in comments
      stripped.pop();
    } else if (isEscaped) {
      stripped.push(character);
    } else if (character == Marker.OPEN_SQUARE_BRACKET && !isQuoted) {
      stripped.push(character);
      isAttribute = true;
    } else if (character == Marker.CLOSE_SQUARE_BRACKET && !isQuoted) {
      stripped.push(character);
      isAttribute = false;
    } else if (character == Marker.OPEN_ROUND_BRACKET && !isQuoted) {
      stripped.push(character);
      roundBracketLevel++;
    } else if (character == Marker.CLOSE_ROUND_BRACKET && !isQuoted) {
      stripped.push(character);
      roundBracketLevel--;
    } else if (character == Marker.SINGLE_QUOTE && !isQuoted) {
      stripped.push(character);
      isSingleQuoted = true;
    } else if (character == Marker.DOUBLE_QUOTE && !isQuoted) {
      stripped.push(character);
      isDoubleQuoted = true;
    } else if (character == Marker.SINGLE_QUOTE && isQuoted) {
      stripped.push(character);
      isSingleQuoted = false;
    } else if (character == Marker.DOUBLE_QUOTE && isQuoted) {
      stripped.push(character);
      isDoubleQuoted = false;
    } else if (isWhitespace && wasRelation) {
      continue;
    } else if (isWhitespace && (isAttribute || roundBracketLevel > 0) && !isQuoted) {
      // skip space
    } else if (isWhitespace && wasWhitespace && !isQuoted) {
      // skip extra space
    } else if ((isNewLineWin || isNewLineNix) && (isAttribute || roundBracketLevel > 0) && isQuoted) {
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
    .replace(/='([a-zA-Z][a-zA-Z\d\-_]+)'/g, '=$1')
    .replace(/="([a-zA-Z][a-zA-Z\d\-_]+)"/g, '=$1');
}

function ruleSorter(s1, s2) {
  return s1[1] > s2[1] ? 1 : -1;
}

function tidyRules(rules, removeUnsupported, adjacentSpace, warnings) {
  var list = [];
  var repeated = [];

  for (var i = 0, l = rules.length; i < l; i++) {
    var rule = rules[i];
    var reduced = rule[1];

    if (hasInvalidCharacters(reduced)) {
      warnings.push('Invalid selector \'' + rule[1] + '\' at line ' + rule[2][0][0] + ', column ' + rule[2][0][1] + '. Ignoring.');
      continue;
    }

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

    rule[1] = reduced;
    repeated.push(reduced);
    list.push(rule);
  }

  return list.sort(ruleSorter);
}

module.exports = tidyRules;
