var Marker = require('./marker');
var Token = require('./token');

var Level = {
  BLOCK: 'block',
  COMMENT: 'comment',
  DOUBLE_QUOTE: 'double-quote',
  RULE: 'rule',
  SINGLE_QUOTE: 'single-quote'
};

var AT_RULES = [
  '@charset',
  '@import'
];

var BLOCK_RULES = [
  '@-moz-document',
  '@document',
  '@-moz-keyframes',
  '@-ms-keyframes',
  '@-o-keyframes',
  '@-webkit-keyframes',
  '@keyframes',
  '@media',
  '@supports'
];

var TAIL_BROKEN_VALUE_PATTERN = /[\s|\}]*$/;

function tokenize(source, externalContext) {
  var internalContext = {
    level: Level.BLOCK,
    position: {
      source: externalContext.source || undefined,
      line: 1,
      column: 0,
      index: 0
    }
  };

  return intoTokens(source, externalContext, internalContext, false);
}

function intoTokens(source, externalContext, internalContext, isNested) {
  var allTokens = [];
  var newTokens = allTokens;
  var lastToken;
  var ruleToken;
  var ruleTokens = [];
  var propertyToken;
  var metadata;
  var metadatas = [];
  var level = internalContext.level;
  var levels = [];
  var buffer = [];
  var buffers = [];
  var roundBracketLevel = 0;
  var isQuoted;
  var isSpace;
  var isNewLineNix;
  var isNewLineWin;
  var isCommentStart;
  var wasCommentStart = false;
  var isCommentEnd;
  var wasCommentEnd = false;
  var isEscaped;
  var seekingValue = false;
  var position = internalContext.position;

  for (; position.index < source.length; position.index++) {
    var character = source[position.index];

    isQuoted = level == Level.SINGLE_QUOTE || level == Level.DOUBLE_QUOTE;
    isSpace = character == Marker.SPACE;
    isNewLineNix = character == Marker.NEW_LINE_NIX;
    isNewLineWin = character == Marker.NEW_LINE_NIX && source[position.index - 1] == Marker.NEW_LINE_WIN;
    isCommentStart = !wasCommentEnd && level != Level.COMMENT && !isQuoted && character == Marker.STAR && source[position.index - 1] == Marker.FORWARD_SLASH;
    isCommentEnd = !wasCommentStart && level == Level.COMMENT && character == Marker.FORWARD_SLASH && source[position.index - 1] == Marker.STAR;

    metadata = buffer.length === 0 ?
      metadataFrom(position, 0, externalContext) :
      metadata;

    if (isEscaped) {
      // previous character was a backslash
      buffer.push(character);
    } else if (!isCommentEnd && level == Level.COMMENT) {
      buffer.push(character);
    } else if (isCommentStart && (level == Level.BLOCK || level == Level.RULE) && buffer.length > 1) {
      // comment start within block preceded by some content, e.g. div/*<--
      metadatas.push(metadata);
      buffer.push(character);
      buffers.push(buffer.slice(0, buffer.length - 2));

      buffer = buffer.slice(buffer.length - 2);
      metadata = metadataFrom(position, 1, externalContext);

      levels.push(level);
      level = Level.COMMENT;
    } else if (isCommentStart) {
      // comment start, e.g. /*<--
      levels.push(level);
      level = Level.COMMENT;
      buffer.push(character);
    } else if (isCommentEnd) {
      // comment end, e.g. /* comment */<--
      lastToken = [Token.COMMENT, [buffer.join('').trim() + character, [metadata]]];
      newTokens.push(lastToken);

      level = levels.pop();
      metadata = metadatas.pop() || null;
      buffer = buffers.pop() || [];
    } else if (character == Marker.SINGLE_QUOTE && !isQuoted) {
      // single quotation start, e.g. a[href^='https<--
      levels.push(level);
      level = Level.SINGLE_QUOTE;
      buffer.push(character);
    } else if (character == Marker.SINGLE_QUOTE && level == Level.SINGLE_QUOTE) {
      // single quotation end, e.g. a[href^='https'<--
      level = levels.pop();
      buffer.push(character);
    } else if (character == Marker.DOUBLE_QUOTE && !isQuoted) {
      // double quotation start, e.g. a[href^="<--
      levels.push(level);
      level = Level.DOUBLE_QUOTE;
      buffer.push(character);
    } else if (character == Marker.DOUBLE_QUOTE && level == Level.DOUBLE_QUOTE) {
      // double quotation end, e.g. a[href^="https"<--
      level = levels.pop();
      buffer.push(character);
    } else if (!isCommentStart && !isCommentEnd && character != Marker.CLOSE_ROUND_BRACKET && character != Marker.OPEN_ROUND_BRACKET && level != Level.COMMENT && !isQuoted && roundBracketLevel > 0) {
      // character inside any function, e.g. hsla(.<--
      buffer.push(character);
    } else if (character == Marker.OPEN_ROUND_BRACKET && !isQuoted && level != Level.COMMENT && !seekingValue) {
      // round open bracket, e.g. @import url(<--
      buffer.push(character);

      roundBracketLevel++;
    } else if (character == Marker.CLOSE_ROUND_BRACKET && !isQuoted && level != Level.COMMENT && !seekingValue) {
      // round open bracket, e.g. @import url(test.css)<--
      buffer.push(character);

      roundBracketLevel--;
    } else if (character == Marker.SEMICOLON && level == Level.BLOCK) {
      // semicolon ending rule at block level, e.g. @import '...';<--
      allTokens.push([Token.AT_RULE, buffer.join('').trim(), [metadata]]);

      buffer = [];
    } else if (character == Marker.COMMA && level == Level.BLOCK && ruleToken) {
      // comma separator at block level, e.g. a,div,<--
      ruleToken[1].push([buffer.join('').trim(), [metadata]]);

      buffer = [];
    } else if (character == Marker.COMMA && level == Level.BLOCK && tokenTypeFrom(buffer) == Token.AT_RULE) {
      // comma separator at block level, e.g. @import url(...) screen,<--
      // keep iterating as end semicolon will create the token
      buffer.push(character);
    } else if (character == Marker.COMMA && level == Level.BLOCK) {
      // comma separator at block level, e.g. a,<--
      ruleToken = [tokenTypeFrom(buffer), [[buffer.join('').trim(), [metadata]]], []];

      buffer = [];
    } else if (character == Marker.OPEN_BRACE && level == Level.BLOCK && ruleToken && ruleToken[0] == Token.BLOCK) {
      // open brace opening at-rule at block level, e.g. @media{<--
      ruleToken[1].push([buffer.join('').trim(), [metadata]]);
      allTokens.push(ruleToken);

      levels.push(level);
      position.column++;
      position.index++;
      buffer = [];

      ruleToken[2] = intoTokens(source, externalContext, internalContext, true);
      ruleToken = null;
    } else if (character == Marker.OPEN_BRACE && level == Level.BLOCK && tokenTypeFrom(buffer) == Token.BLOCK) {
      // open brace opening at-rule at block level, e.g. @media{<--
      ruleToken = ruleToken || [Token.BLOCK, [], []];
      ruleToken[1].push([buffer.join('').trim(), [metadata]]);
      allTokens.push(ruleToken);

      levels.push(level);
      position.column++;
      position.index++;
      buffer = [];

      ruleToken[2] = intoTokens(source, externalContext, internalContext, true);
      ruleToken = null;
    } else if (character == Marker.OPEN_BRACE && level == Level.BLOCK) {
      // open brace opening rule at block level, e.g. div{<--
      ruleToken = ruleToken || [tokenTypeFrom(buffer), [], []];
      ruleToken[1].push([buffer.join('').trim(), [metadata]]);
      newTokens = ruleToken[2];
      allTokens.push(ruleToken);

      levels.push(level);
      level = Level.RULE;
      buffer = [];
    } else if (character == Marker.OPEN_BRACE && level == Level.RULE && seekingValue) {
      // open brace opening rule at rule level, e.g. div{--variable:{<--
      ruleTokens.push(ruleToken);
      ruleToken = [Token.PROPERTY_BLOCK, []];
      propertyToken.push(ruleToken);
      newTokens = ruleToken[1];

      levels.push(level);
      level = Level.RULE;
      seekingValue = false;
    } else if (character == Marker.COLON && level == Level.RULE && !seekingValue) {
      // colon at rule level, e.g. a{color:<--
      propertyToken = [Token.PROPERTY, [Token.PROPERTY_NAME, buffer.join('').trim(), [metadata]]];
      newTokens.push(propertyToken);

      seekingValue = true;
      buffer = [];
    } else if (character == Marker.SEMICOLON && level == Level.RULE && propertyToken && ruleTokens.length > 0 && buffer.length > 0 && buffer[0] == Marker.AT) {
      // semicolon at rule level for at-rule, e.g. a{--color:{@apply(--other-color);<--
      ruleToken[1].push([Token.AT_RULE, buffer.join('').trim(), [metadata]]);

      buffer = [];
    } else if (character == Marker.SEMICOLON && level == Level.RULE && propertyToken && buffer.length > 0) {
      // semicolon at rule level, e.g. a{color:red;<--
      propertyToken.push([Token.PROPERTY_VALUE, buffer.join('').trim(), [metadata]]);

      seekingValue = false;
      buffer = [];
    } else if (character == Marker.SEMICOLON && level == Level.RULE && propertyToken && buffer.length === 0) {
      // semicolon after bracketed value at rule level, e.g. a{color:rgb(...);<--
      seekingValue = false;
    } else if (character == Marker.SEMICOLON && level == Level.RULE && buffer.length > 0 && buffer[0] == Marker.AT) {
      // semicolon for at-rule at rule level, e.g. a{@apply(--variable);<--
      newTokens.push([Token.AT_RULE, buffer.join('').trim(), [metadata]]);

      seekingValue = false;
      buffer = [];
    } else if (character == Marker.SEMICOLON && level == Level.RULE && buffer.length === 0) {
      // stray semicolon at rule level, e.g. a{;<--
      // noop
    } else if (character == Marker.CLOSE_BRACE && level == Level.RULE && propertyToken && seekingValue && buffer.length > 0 && ruleTokens.length > 0) {
      // close brace at rule level, e.g. a{--color:{color:red}<--
      propertyToken.push([Token.PROPERTY_VALUE, buffer.join(''), [metadata]]);
      propertyToken = null;
      ruleToken = ruleTokens.pop();
      newTokens = ruleToken[2];

      level = levels.pop();
      seekingValue = false;
      buffer = [];
    } else if (character == Marker.CLOSE_BRACE && level == Level.RULE && propertyToken && buffer.length > 0 && buffer[0] == Marker.AT && ruleTokens.length > 0) {
      // close brace at rule level for at-rule, e.g. a{--color:{@apply(--other-color)}<--
      ruleToken[1].push([Token.AT_RULE, buffer.join(''), [metadata]]);
      propertyToken = null;
      ruleToken = ruleTokens.pop();
      newTokens = ruleToken[2];

      level = levels.pop();
      seekingValue = false;
      buffer = [];
    } else if (character == Marker.CLOSE_BRACE && level == Level.RULE && propertyToken && ruleTokens.length > 0) {
      // close brace at rule level after space, e.g. a{--color:{color:red }<--
      propertyToken = null;
      ruleToken = ruleTokens.pop();
      newTokens = ruleToken[2];

      level = levels.pop();
      seekingValue = false;
    } else if (character == Marker.CLOSE_BRACE && level == Level.RULE && propertyToken && buffer.length > 0) {
      // close brace at rule level, e.g. a{color:red}<--
      propertyToken.push([Token.PROPERTY_VALUE, buffer.join(''), [metadata]]);
      propertyToken = null;
      ruleToken = ruleTokens.pop();
      newTokens = allTokens;

      level = levels.pop();
      seekingValue = false;
      buffer = [];
    } else if (character == Marker.CLOSE_BRACE && level == Level.RULE && buffer.length > 0 && buffer[0] == Marker.AT) {
      // close brace after at-rule at rule level, e.g. a{@apply(--variable)}<--
      ruleToken = null;
      newTokens.push([Token.AT_RULE, buffer.join('').trim(), [metadata]]);
      newTokens = allTokens;

      level = levels.pop();
      seekingValue = false;
      buffer = [];
    } else if (character == Marker.CLOSE_BRACE && level == Level.RULE) {
      // close brace after at-rule at rule level, e.g. a{color:red;}<--
      ruleToken = null;
      newTokens = allTokens;

      level = levels.pop();
      seekingValue = false;
    } else if (character == Marker.CLOSE_BRACE && level == Level.BLOCK && !isNested && position.index <= source.length - 1) {
      // stray close brace at block level, e.g. a{color:red}color:blue}<--
      externalContext.warnings.push('Unexpected \'}\' at line ' + position.line + ', column ' + position.column + '.');
      buffer.push(character);
    } else if (character == Marker.CLOSE_BRACE && level == Level.BLOCK) {
      // close brace at block level, e.g. @media screen {...}<--
      break;
    } else if (character == Marker.OPEN_ROUND_BRACKET && level == Level.RULE && seekingValue) {
      // round open bracket, e.g. a{color:hsla(<--
      buffer.push(character);
      roundBracketLevel++;
    } else if (character == Marker.CLOSE_ROUND_BRACKET && level == Level.RULE && seekingValue && roundBracketLevel == 1) {
      // round close bracket, e.g. a{color:hsla(0,0%,0%)<--
      buffer.push(character);
      propertyToken.push([Token.PROPERTY_VALUE, buffer.join('').trim(), [metadata]]);

      roundBracketLevel--;
      buffer = [];
    } else if (character == Marker.CLOSE_ROUND_BRACKET && level == Level.RULE && seekingValue) {
      // round close bracket within other brackets, e.g. a{width:calc((10rem / 2)<--
      buffer.push(character);
      roundBracketLevel--;
    } else if (character == Marker.FORWARD_SLASH && source[position.index + 1] != Marker.STAR && level == Level.RULE && seekingValue && buffer.length > 0) {
      // forward slash within a property, e.g. a{background:url(image.png) 0 0/<--
      propertyToken.push([Token.PROPERTY_VALUE, buffer.join('').trim(), [metadata]]);
      propertyToken.push([Token.PROPERTY_VALUE, character, [metadataFrom(position, 0, externalContext)]]);

      buffer = [];
    } else if (character == Marker.FORWARD_SLASH && source[position.index + 1] != Marker.STAR && level == Level.RULE && seekingValue) {
      // forward slash within a property after space, e.g. a{background:url(image.png) 0 0 /<--
      propertyToken.push([Token.PROPERTY_VALUE, character, [metadataFrom(position, 0, externalContext)]]);

      buffer = [];
    } else if (character == Marker.COMMA && level == Level.RULE && seekingValue && buffer.length > 0) {
      // comma within a property, e.g. a{background:url(image.png),<--
      propertyToken.push([Token.PROPERTY_VALUE, buffer.join('').trim(), [metadata]]);
      propertyToken.push([Token.PROPERTY_VALUE, character, [metadataFrom(position, 0, externalContext)]]);

      buffer = [];
    } else if (character == Marker.COMMA && level == Level.RULE && seekingValue) {
      // comma within a property after space, e.g. a{background:url(image.png) ,<--
      propertyToken.push([Token.PROPERTY_VALUE, character, [metadataFrom(position, 0, externalContext)]]);

      buffer = [];
    } else if ((isSpace || (isNewLineNix && !isNewLineWin)) && level == Level.RULE && seekingValue && propertyToken && buffer.length > 0) {
      // space or *nix newline within property, e.g. a{margin:0 <--
      propertyToken.push([Token.PROPERTY_VALUE, buffer.join('').trim(), [metadata]]);

      buffer = [];
    } else if (isNewLineWin && level == Level.RULE && seekingValue && propertyToken && buffer.length > 1) {
      // win newline within property, e.g. a{margin:0\r\n<--
      propertyToken.push([Token.PROPERTY_VALUE, buffer.join('').trim(), [metadata]]);

      buffer = [];
    } else if (isNewLineWin && level == Level.RULE && seekingValue) {
      // win newline
      buffer = [];
    } else if (buffer.length == 1 && isNewLineWin) {
      // ignore windows newline which is composed of two characters
      buffer.pop();
    } else if (buffer.length > 0 || !isSpace && !isNewLineNix && !isNewLineWin) {
      // any character
      buffer.push(character);
    }

    isEscaped = character == Marker.BACK_SLASH;
    wasCommentStart = isCommentStart;
    wasCommentEnd = isCommentEnd;

    position.line = (isNewLineWin || isNewLineNix) ? position.line + 1 : position.line;
    position.column = (isNewLineWin || isNewLineNix) ? 0 : position.column + 1;
  }

  if (seekingValue) {
    externalContext.warnings.push('Missing \'}\' at line ' + position.line + ', column ' + position.column);
  }

  if (seekingValue && buffer.length > 0) {
    propertyToken.push([Token.PROPERTY_VALUE, buffer.join('').replace(TAIL_BROKEN_VALUE_PATTERN, ''), [metadata]]);
  }

  return allTokens;
}

function metadataFrom(position, columnDelta, externalContext) {
  var metadata = [position.line, position.column - columnDelta, position.source];
  metadata = externalContext.inputSourceMap ?
    externalContext.inputSourceMapTracker.originalPositionFor(metadata) :
    metadata;

  return metadata;
}

function tokenTypeFrom(buffer) {
  var isAtRule = buffer[0] == Marker.AT || buffer[0] == Marker.UNDERSCORE;
  var ruleWord = buffer.join('').split(/\s/)[0];

  if (isAtRule && BLOCK_RULES.indexOf(ruleWord) > -1) {
    return Token.BLOCK;
  } else if (isAtRule && AT_RULES.indexOf(ruleWord) > -1) {
    return Token.AT_RULE;
  } else if (isAtRule) {
    return Token.AT_RULE_BLOCK;
  } else {
    return Token.RULE;
  }
}

module.exports = tokenize;
