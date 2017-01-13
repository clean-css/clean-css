var lineBreak = require('os').EOL;
var emptyCharacter = '';

var Breaks = require('../options/format').Breaks;
var Spaces = require('../options/format').Spaces;

var Marker = require('../tokenizer/marker');
var Token = require('../tokenizer/token');

function supportsAfterClosingBrace(token) {
  return token[1][1] == 'background' || token[1][1] == 'transform' || token[1][1] == 'src';
}

function afterClosingBrace(token, valueIndex) {
  return token[valueIndex][1][token[valueIndex][1].length - 1] == Marker.CLOSE_ROUND_BRACKET;
}

function afterComma(token, valueIndex) {
  return token[valueIndex][1] == Marker.COMMA;
}

function afterSlash(token, valueIndex) {
  return token[valueIndex][1] == Marker.FORWARD_SLASH;
}

function beforeComma(token, valueIndex) {
  return token[valueIndex + 1] && token[valueIndex + 1][1] == Marker.COMMA;
}

function beforeSlash(token, valueIndex) {
  return token[valueIndex + 1] && token[valueIndex + 1][1] == Marker.FORWARD_SLASH;
}

function inFilter(token) {
  return token[1][1] == 'filter' || token[1][1] == '-ms-filter';
}

function inSpecialContext(token, valueIndex, context) {
  return !context.spaceAfterClosingBrace && supportsAfterClosingBrace(token) && afterClosingBrace(token, valueIndex) ||
    beforeSlash(token, valueIndex) ||
    afterSlash(token, valueIndex) ||
    beforeComma(token, valueIndex) ||
    afterComma(token, valueIndex);
}

function rules(tokens, context) {
  var store = context.store;

  for (var i = 0, l = tokens.length; i < l; i++) {
    store(tokens[i], context);

    if (i < l - 1) {
      store(comma(context), context);
    }
  }
}

function body(tokens, context) {
  var lastPropertyAt = lastPropertyIndex(tokens);

  for (var i = 0, l = tokens.length; i < l; i++) {
    property(tokens, i, lastPropertyAt, context);
  }
}

function lastPropertyIndex(tokens) {
  var index = tokens.length - 1;

  for (; index >= 0; index--) {
    if (tokens[index][0] != Token.COMMENT) {
      break;
    }
  }

  return index;
}

function property(tokens, position, lastPropertyAt, context) {
  var store = context.store;
  var token = tokens[position];
  var isPropertyBlock = token[2][0] == Token.PROPERTY_BLOCK;
  var needsSemicolon = position < lastPropertyAt || isPropertyBlock;
  var isLast = position === lastPropertyAt;

  switch (token[0]) {
    case Token.AT_RULE:
      store(token, context);
      store(position < lastPropertyAt ? semicolon(context, Breaks.AfterProperty, false) : emptyCharacter, context);
      break;
    case Token.COMMENT:
      store(token, context);
      break;
    case Token.PROPERTY:
      store(token[1], context);
      store(colon(context), context);
      value(token, context);
      store(needsSemicolon ? semicolon(context, Breaks.AfterProperty, isLast) : emptyCharacter, context);
  }
}

function value(token, context) {
  var store = context.store;
  var j, m;

  if (token[2][0] == Token.PROPERTY_BLOCK) {
    store(openBrace(context, Breaks.AfterBlockBegins, false), context);
    body(token[2][1], context);
    store(closeBrace(context, Breaks.AfterBlockEnds, false, true), context);
  } else {
    for (j = 2, m = token.length; j < m; j++) {
      store(token[j], context);

      if (j < m - 1 && (inFilter(token) || !inSpecialContext(token, j, context))) {
        store(Marker.SPACE, context);
      }
    }
  }
}

function allowsBreak(context, where) {
  return context.format && context.format.breaks[where];
}

function allowsSpace(context, where) {
  return context.format && context.format.spaces[where];
}

function openBrace(context, where, needsPrefixSpace) {
  if (context.format) {
    context.indentBy += context.format.indentBy;
    context.indentWith = context.format.indentWith.repeat(context.indentBy);
    return (needsPrefixSpace && allowsSpace(context, Spaces.BeforeBlockBegins) ? Marker.SPACE : emptyCharacter) +
      Marker.OPEN_BRACE +
      (allowsBreak(context, where) ? lineBreak : emptyCharacter) +
      context.indentWith;
  } else {
    return Marker.OPEN_BRACE;
  }
}

function closeBrace(context, where, beforeBlockEnd, isLast) {
  if (context.format) {
    context.indentBy -= context.format.indentBy;
    context.indentWith = context.format.indentWith.repeat(context.indentBy);
    return (allowsBreak(context, Breaks.AfterProperty) || beforeBlockEnd && allowsBreak(context, Breaks.BeforeBlockEnds) ? lineBreak : emptyCharacter) +
      context.indentWith +
      Marker.CLOSE_BRACE +
      (isLast ? emptyCharacter : (allowsBreak(context, where) ? lineBreak : emptyCharacter) + context.indentWith);
  } else {
    return Marker.CLOSE_BRACE;
  }
}

function colon(context) {
  return context.format ?
    Marker.COLON + (allowsSpace(context, Spaces.BeforeValue) ? Marker.SPACE : emptyCharacter) :
    Marker.COLON;
}

function semicolon(context, where, isLast) {
  return context.format ?
    Marker.SEMICOLON + (isLast || !allowsBreak(context, where) ? emptyCharacter : lineBreak + context.indentWith) :
    Marker.SEMICOLON;
}

function comma(context) {
  return context.format ?
    Marker.COMMA + (allowsBreak(context, Breaks.BetweenSelectors) ? lineBreak : emptyCharacter) + context.indentWith :
    Marker.COMMA;
}

function all(tokens, context) {
  var store = context.store;
  var token;
  var isLast;
  var i, l;

  for (i = 0, l = tokens.length; i < l; i++) {
    token = tokens[i];
    isLast = i == l - 1;

    switch (token[0]) {
      case Token.AT_RULE:
        store(token, context);
        store(semicolon(context, Breaks.AfterAtRule, isLast), context);
        break;
      case Token.AT_RULE_BLOCK:
        rules(token[1], context);
        store(openBrace(context, Breaks.AfterRuleBegins, true), context);
        body(token[2], context);
        store(closeBrace(context, Breaks.AfterRuleEnds, false, isLast), context);
        break;
      case Token.BLOCK:
        rules(token[1], context);
        store(openBrace(context, Breaks.AfterBlockBegins, true), context);
        all(token[2], context);
        store(closeBrace(context, Breaks.AfterBlockEnds, true, isLast), context);
        break;
      case Token.COMMENT:
        store(token, context);
        store(allowsBreak(context, Breaks.AfterComment) ? lineBreak : emptyCharacter, context);
        break;
      case Token.RULE:
        rules(token[1], context);
        store(openBrace(context, Breaks.AfterRuleBegins, true), context);
        body(token[2], context);
        store(closeBrace(context, Breaks.AfterRuleEnds, false, isLast), context);
        break;
    }
  }
}

module.exports = {
  all: all,
  body: body,
  property: property,
  rules: rules,
  value: value
};
