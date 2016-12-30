var Marker = require('../tokenizer/marker');
var split = require('../utils/split');

var DEEP_SELECTOR_PATTERN = /\/deep\//;
var DOUBLE_COLON_PATTERN = /^::/;
var NOT_PSEUDO = ':not';
var PSEUDO_CLASSES_WITH_ARGUMENTS = [
  ':dir',
  ':lang',
  ':not',
  ':nth-child',
  ':nth-last-child',
  ':nth-last-of-type',
  ':nth-of-type'
];
var RELATION_PATTERN = /[>\+~]/;

var Level = {
  DOUBLE_QUOTE: 'double-quote',
  SINGLE_QUOTE: 'single-quote',
  ROOT: 'root'
};

function isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements) {
  return split(selector, Marker.COMMA).every(function (singleSelector) {
    return singleSelector.length > 0 &&
      !isDeepSelector(singleSelector) &&
      areMergable(singleSelector, extractPseudoFrom(singleSelector), mergeablePseudoClasses, mergeablePseudoElements);
  });
}

function isDeepSelector(selector) {
  return DEEP_SELECTOR_PATTERN.test(selector);
}

function extractPseudoFrom(selector) {
  var list = [];
  var character;
  var buffer = [];
  var level = Level.ROOT;
  var roundBracketLevel = 0;
  var isQuoted;
  var isEscaped;
  var isPseudo = false;
  var isRelation;
  var wasColon = false;
  var index;
  var len;

  for (index = 0, len = selector.length; index < len; index++) {
    character = selector[index];

    isRelation = !isEscaped && RELATION_PATTERN.test(character);
    isQuoted = level == Level.DOUBLE_QUOTE || level == Level.SINGLE_QUOTE;

    if (isEscaped) {
      buffer.push(character);
    } else if (isQuoted) {
      buffer.push(character);
    } else if (character == Marker.DOUBLE_QUOTE && level == Level.ROOT) {
      buffer.push(character);
      level = Level.DOUBLE_QUOTE;
    } else if (character == Marker.DOUBLE_QUOTE && level == Level.DOUBLE_QUOTE) {
      buffer.push(character);
      level = Level.ROOT;
    } else if (character == Marker.SINGLE_QUOTE && level == Level.ROOT) {
      buffer.push(character);
      level = Level.SINGLE_QUOTE;
    } else if (character == Marker.SINGLE_QUOTE && level == Level.SINGLE_QUOTE) {
      buffer.push(character);
      level = Level.ROOT;
    } else if (character == Marker.OPEN_ROUND_BRACKET) {
      buffer.push(character);
      roundBracketLevel++;
    } else if (character == Marker.CLOSE_ROUND_BRACKET && roundBracketLevel == 1 && isPseudo) {
      buffer.push(character);
      list.push(buffer.join(''));
      roundBracketLevel--;
      buffer = [];
      isPseudo = false;
    } else if (character == Marker.CLOSE_ROUND_BRACKET) {
      buffer.push(character);
      roundBracketLevel--;
    } else if (character == Marker.COLON && roundBracketLevel === 0 && isPseudo && !wasColon) {
      list.push(buffer.join(''));
      buffer = [];
      buffer.push(character);
    } else if (character == Marker.COLON && roundBracketLevel === 0 && !wasColon) {
      buffer = [];
      buffer.push(character);
      isPseudo = true;
    } else if (character == Marker.SPACE && roundBracketLevel === 0 && isPseudo) {
      list.push(buffer.join(''));
      buffer = [];
      isPseudo = false;
    } else if (isRelation && roundBracketLevel === 0 && isPseudo) {
      list.push(buffer.join(''));
      buffer = [];
      isPseudo = false;
    } else {
      buffer.push(character);
    }

    isEscaped = character == Marker.BACK_SLASH;
    wasColon = character == Marker.COLON;
  }

  if (buffer.length > 0 && isPseudo) {
    list.push(buffer.join(''));
  }

  return list;
}

function areMergable(selector, matches, mergeablePseudoClasses, mergeablePseudoElements) {
  return areAllowed(matches, mergeablePseudoClasses, mergeablePseudoElements) &&
    needArguments(matches) &&
    !someIncorrectlyChained(selector, matches) &&
    !someMixed(matches);
}

function areAllowed(matches, mergeablePseudoClasses, mergeablePseudoElements) {
  return matches.every(function (match) {
    var name = match.indexOf(Marker.OPEN_ROUND_BRACKET) > -1 ?
      match.substring(0, match.indexOf(Marker.OPEN_ROUND_BRACKET)) :
      match;

    return mergeablePseudoClasses.indexOf(name) > -1 || mergeablePseudoElements.indexOf(name) > -1;
  });
}

function needArguments(matches) {
  return matches.every(function (match) {
    var bracketOpensAt = match.indexOf(Marker.OPEN_ROUND_BRACKET);
    var hasArguments = bracketOpensAt > -1;
    var name = hasArguments ?
      match.substring(0, bracketOpensAt) :
      match;

    return hasArguments ?
      PSEUDO_CLASSES_WITH_ARGUMENTS.indexOf(name) > -1 :
      PSEUDO_CLASSES_WITH_ARGUMENTS.indexOf(name) == -1;
  });
}

function someIncorrectlyChained(selector, matches) {
  var positionInSelector = 0;

  return matches.some(function (match, index) {
    var matchAt;
    var nextMatch = matches[index + 1];
    var nextMatchAt;
    var name;
    var nextName;
    var areChained;

    if (!nextMatch) {
      return false;
    }

    matchAt = selector.indexOf(match, positionInSelector);
    nextMatchAt = selector.indexOf(match, matchAt + 1);
    positionInSelector = nextMatchAt;
    areChained = matchAt + match.length == nextMatchAt;

    if (areChained) {
      name = match.indexOf(Marker.OPEN_ROUND_BRACKET) > -1 ?
        match.substring(0, match.indexOf(Marker.OPEN_ROUND_BRACKET)) :
        match;
      nextName = nextMatch.indexOf(Marker.OPEN_ROUND_BRACKET) > -1 ?
        nextMatch.substring(0, nextMatch.indexOf(Marker.OPEN_ROUND_BRACKET)) :
        nextMatch;

      return name != NOT_PSEUDO || nextName != NOT_PSEUDO;
    } else {
      return false;
    }
  });
}

function someMixed(matches) {
  var firstIsPseudoElement = DOUBLE_COLON_PATTERN.test(matches[0]);

  return matches.some(function (match) {
    return DOUBLE_COLON_PATTERN.test(match) != firstIsPseudoElement;
  });
}

module.exports = isMergeable;
