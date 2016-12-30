var tidyRules = require('./tidy-rules');
var tidyBlock = require('./tidy-block');
var tidyAtRule = require('./tidy-at-rule');
var split = require('../utils/split');
var formatPosition = require('../utils/format-position');

var Token = require('../tokenizer/token');
var Marker = require('../tokenizer/marker');

var RGB = require('../colors/rgb');
var HSL = require('../colors/hsl');
var HexNameShortener = require('../colors/hex-name-shortener');

var Hack = require('../properties/hack');

var wrapForOptimizing = require('../properties/wrap-for-optimizing').all;
var restoreFromOptimizing = require('../properties/restore-from-optimizing');
var removeUnused = require('../properties/remove-unused');

var DEFAULT_ROUNDING_PRECISION = require('../utils/rounding-precision').DEFAULT;
var CHARSET_TOKEN = '@charset';
var CHARSET_REGEXP = new RegExp('^' + CHARSET_TOKEN, 'i');

var FONT_NUMERAL_WEIGHTS = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
var FONT_NAME_WEIGHTS = ['normal', 'bold', 'bolder', 'lighter'];
var FONT_NAME_WEIGHTS_WITHOUT_NORMAL = ['bold', 'bolder', 'lighter'];

var WHOLE_PIXEL_VALUE = /(?:^|\s|\()(-?\d+)px/;
var TIME_VALUE = /^(\-?[\d\.]+)(m?s)$/;

var PROPERTY_NAME_PATTERN = /^(?:\-chrome\-|\-[\w\-]+\w|\w[\w\-]+\w|\-\-\S+)$/;
var IMPORT_PREFIX_PATTERN = /^@import/i;
var QUOTED_PATTERN = /^('.*'|".*")$/;
var QUOTED_BUT_SAFE_PATTERN = /^['"][a-zA-Z][a-zA-Z\d\-_]+['"]$/;
var URL_PREFIX_PATTERN = /^url\(/i;

var valueMinifiers = {
  'background': function (value, index, total) {
    return index === 0 && total == 1 && (value == 'none' || value == 'transparent') ? '0 0' : value;
  },
  'font-weight': function (value, _index, _total, options) {
    if (!options.compatibility.properties.fontWeight) {
      return value;
    } else if (value == 'normal') {
      return '400';
    } else if (value == 'bold') {
      return '700';
    } else {
      return value;
    }
  },
  'outline': function (value, index, total) {
    return index === 0 && total == 1 && value == 'none' ? '0' : value;
  }
};

function isNegative(value) {
  return value && value[1][0] == '-' && parseFloat(value[1]) < 0;
}

function zeroMinifier(name, value) {
  if (value.indexOf('0') == -1)
    return value;

  if (value.indexOf('-') > -1) {
    value = value
      .replace(/([^\w\d\-]|^)\-0([^\.]|$)/g, '$10$2')
      .replace(/([^\w\d\-]|^)\-0([^\.]|$)/g, '$10$2');
  }

  return value
    .replace(/(^|\s)0+([1-9])/g, '$1$2')
    .replace(/(^|\D)\.0+(\D|$)/g, '$10$2')
    .replace(/(^|\D)\.0+(\D|$)/g, '$10$2')
    .replace(/\.([1-9]*)0+(\D|$)/g, function (match, nonZeroPart, suffix) {
      return (nonZeroPart.length > 0 ? '.' : '') + nonZeroPart + suffix;
    })
    .replace(/(^|\D)0\.(\d)/g, '$1.$2');
}

function zeroDegMinifier(_, value) {
  if (value.indexOf('0deg') == -1)
    return value;

  return value.replace(/\(0deg\)/g, '(0)');
}

function whitespaceMinifier(name, value) {
  if (name.indexOf('filter') > -1 || value.indexOf(' ') == -1 || value.indexOf('expression') === 0)
    return value;

  if (value.indexOf(Marker.SINGLE_QUOTE) > -1 || value.indexOf(Marker.DOUBLE_QUOTE) > -1)
    return value;

  value = value.replace(/\s+/g, ' ');

  if (value.indexOf('calc') > -1)
    value = value.replace(/\) ?\/ ?/g, ')/ ');

  return value
    .replace(/\( /g, '(')
    .replace(/ \)/g, ')')
    .replace(/, /g, ',');
}

function precisionMinifier(_, value, precisionOptions) {
  var optimizedValue = value.replace(/(\d)\.($|\D)/g, '$1$2');

  if (!precisionOptions.matcher || value.indexOf('.') === -1) {
    return optimizedValue;
  }

  return optimizedValue
    .replace(precisionOptions.matcher, function (match, integerPart, fractionPart, unit) {
      var multiplier = precisionOptions.units[unit].multiplier;
      var parsedInteger = parseInt(integerPart);
      var integer = isNaN(parsedInteger) ? 0 : parsedInteger;
      var fraction = parseFloat(fractionPart);

      return Math.round((integer + fraction) * multiplier) / multiplier + unit;
    });
}

function unitMinifier(name, value, unitsRegexp) {
  if (/^(?:\-moz\-calc|\-webkit\-calc|calc)\(/.test(value))
    return value;

  if (name == 'flex' || name == '-ms-flex' || name == '-webkit-flex' || name == 'flex-basis' || name == '-webkit-flex-basis')
    return value;

  if (value.indexOf('%') > 0 && (name == 'height' || name == 'max-height'))
    return value;

  return value
    .replace(unitsRegexp, '$1' + '0' + '$2')
    .replace(unitsRegexp, '$1' + '0' + '$2');
}

function multipleZerosMinifier(property) {
  var values = property.value;
  var spliceAt;

  if (values.length == 4 && values[0][1] === '0' && values[1][1] === '0' && values[2][1] === '0' && values[3][1] === '0') {
    if (property.name.indexOf('box-shadow') > -1) {
      spliceAt = 2;
    } else {
      spliceAt = 1;
    }
  }

  if (spliceAt) {
    property.value.splice(spliceAt);
    property.dirty = true;
  }
}

function colorMininifier(name, value, compatibility) {
  if (value.indexOf('#') === -1 && value.indexOf('rgb') == -1 && value.indexOf('hsl') == -1)
    return HexNameShortener.shorten(value);

  value = value
    .replace(/rgb\((\-?\d+),(\-?\d+),(\-?\d+)\)/g, function (match, red, green, blue) {
      return new RGB(red, green, blue).toHex();
    })
    .replace(/hsl\((-?\d+),(-?\d+)%?,(-?\d+)%?\)/g, function (match, hue, saturation, lightness) {
      return new HSL(hue, saturation, lightness).toHex();
    })
    .replace(/(^|[^='"])#([0-9a-f]{6})/gi, function (match, prefix, color) {
      if (color[0] == color[1] && color[2] == color[3] && color[4] == color[5]) {
        return (prefix + '#' + color[0] + color[2] + color[4]).toLowerCase();
      } else {
        return (prefix + '#' + color).toLowerCase();
      }
    })
    .replace(/(^|[^='"])#([0-9a-f]{3})/gi, function (match, prefix, color) {
      return prefix + '#' + color.toLowerCase();
    })
    .replace(/(rgb|rgba|hsl|hsla)\(([^\)]+)\)/g, function (match, colorFunction, colorDef) {
      var tokens = colorDef.split(',');
      var applies = (colorFunction == 'hsl' && tokens.length == 3) ||
        (colorFunction == 'hsla' && tokens.length == 4) ||
        (colorFunction == 'rgb' && tokens.length == 3 && colorDef.indexOf('%') > 0) ||
        (colorFunction == 'rgba' && tokens.length == 4 && colorDef.indexOf('%') > 0);
      if (!applies)
        return match;

      if (tokens[1].indexOf('%') == -1)
        tokens[1] += '%';
      if (tokens[2].indexOf('%') == -1)
        tokens[2] += '%';
      return colorFunction + '(' + tokens.join(',') + ')';
    });

  if (compatibility.colors.opacity && name.indexOf('background') == -1) {
    value = value.replace(/(?:rgba|hsla)\(0,0%?,0%?,0\)/g, function (match) {
      if (split(value, ',').pop().indexOf('gradient(') > -1)
        return match;

      return 'transparent';
    });
  }

  return HexNameShortener.shorten(value);
}

function pixelLengthMinifier(_, value, compatibility) {
  if (!WHOLE_PIXEL_VALUE.test(value))
    return value;

  return value.replace(WHOLE_PIXEL_VALUE, function (match, val) {
    var newValue;
    var intVal = parseInt(val);

    if (intVal === 0)
      return match;

    if (compatibility.properties.shorterLengthUnits && compatibility.units.pt && intVal * 3 % 4 === 0)
      newValue = intVal * 3 / 4 + 'pt';

    if (compatibility.properties.shorterLengthUnits && compatibility.units.pc && intVal % 16 === 0)
      newValue = intVal / 16 + 'pc';

    if (compatibility.properties.shorterLengthUnits && compatibility.units.in && intVal % 96 === 0)
      newValue = intVal / 96 + 'in';

    if (newValue)
      newValue = match.substring(0, match.indexOf(val)) + newValue;

    return newValue && newValue.length < match.length ? newValue : match;
  });
}

function timeUnitMinifier(_, value) {
  if (!TIME_VALUE.test(value))
    return value;

  return value.replace(TIME_VALUE, function (match, val, unit) {
    var newValue;

    if (unit == 'ms') {
      newValue = parseInt(val) / 1000 + 's';
    } else if (unit == 's') {
      newValue = parseFloat(val) * 1000 + 'ms';
    }

    return newValue.length < match.length ? newValue : match;
  });
}

function minifyBorderRadius(property) {
  var values = property.value;
  var spliceAt;

  if (values.length == 3 && values[1][1] == '/' && values[0][1] == values[2][1])
    spliceAt = 1;
  else if (values.length == 5 && values[2][1] == '/' && values[0][1] == values[3][1] && values[1][1] == values[4][1])
    spliceAt = 2;
  else if (values.length == 7 && values[3][1] == '/' && values[0][1] == values[4][1] && values[1][1] == values[5][1] && values[2][1] == values[6][1])
    spliceAt = 3;
  else if (values.length == 9 && values[4][1] == '/' && values[0][1] == values[5][1] && values[1][1] == values[6][1] && values[2][1] == values[7][1] && values[3][1] == values[8][1])
    spliceAt = 4;

  if (spliceAt) {
    property.value.splice(spliceAt);
    property.dirty = true;
  }
}

function minifyFilter(property) {
  if (property.value.length == 1) {
    property.value[0][1] = property.value[0][1].replace(/progid:DXImageTransform\.Microsoft\.(Alpha|Chroma)(\W)/, function (match, filter, suffix) {
      return filter.toLowerCase() + suffix;
    });
  }

  property.value[0][1] = property.value[0][1]
    .replace(/,(\S)/g, ', $1')
    .replace(/ ?= ?/g, '=');
}

function minifyFont(property, options) {
  var values = property.value;
  var hasNumeral = FONT_NUMERAL_WEIGHTS.indexOf(values[0][1]) > -1 ||
    values[1] && FONT_NUMERAL_WEIGHTS.indexOf(values[1][1]) > -1 ||
    values[2] && FONT_NUMERAL_WEIGHTS.indexOf(values[2][1]) > -1;

  if (!options.compatibility.properties.fontWeight) {
    return;
  }

  if (hasNumeral)
    return;

  if (values[1] && values[1][1] == '/')
    return;

  var normalCount = 0;
  if (values[0][1] == 'normal')
    normalCount++;
  if (values[1] && values[1][1] == 'normal')
    normalCount++;
  if (values[2] && values[2][1] == 'normal')
    normalCount++;

  if (normalCount > 1)
    return;

  var toOptimize;
  if (FONT_NAME_WEIGHTS_WITHOUT_NORMAL.indexOf(values[0][1]) > -1)
    toOptimize = 0;
  else if (values[1] && FONT_NAME_WEIGHTS_WITHOUT_NORMAL.indexOf(values[1][1]) > -1)
    toOptimize = 1;
  else if (values[2] && FONT_NAME_WEIGHTS_WITHOUT_NORMAL.indexOf(values[2][1]) > -1)
    toOptimize = 2;
  else if (FONT_NAME_WEIGHTS.indexOf(values[0][1]) > -1)
    toOptimize = 0;
  else if (values[1] && FONT_NAME_WEIGHTS.indexOf(values[1][1]) > -1)
    toOptimize = 1;
  else if (values[2] && FONT_NAME_WEIGHTS.indexOf(values[2][1]) > -1)
    toOptimize = 2;

  if (toOptimize !== undefined) {
    property.value[toOptimize][1] = valueMinifiers['font-weight'](values[toOptimize][1], null, null, options);
    property.dirty = true;
  }
}

function normalizeUrl(value) {
  return value
    .replace(URL_PREFIX_PATTERN, 'url(')
    .replace(/\\?\n|\\?\r\n/g, '');
}

function removeUrlQuotes(value) {
  return /^url\(['"].+['"]\)$/.test(value) && !/^url\(['"].*[\*\s\(\)'"].*['"]\)$/.test(value) && !/^url\(['"]data:[^;]+;charset/.test(value) ?
    value.replace(/["']/g, '') :
    value;
}

function isQuoted(value) {
  return QUOTED_PATTERN.test(value);
}

function removeQuotes(name, value) {
  if (name == 'content') {
    return value;
  }

  return QUOTED_BUT_SAFE_PATTERN.test(value) ?
    value.substring(1, value.length - 1) :
    value;
}

function optimizeBody(properties, context) {
  var options = context.options;
  var property, name, type, value;
  var valueIsUrl;
  var propertyToken;
  var _properties = wrapForOptimizing(properties);

  for (var i = 0, l = _properties.length; i < l; i++) {
    property = _properties[i];
    name = property.name;

    if (!PROPERTY_NAME_PATTERN.test(name)) {
      propertyToken = property.all[property.position];
      context.warnings.push('Invalid property name \'' + name + '\' at ' + formatPosition(propertyToken[1][2][0]) + '. Ignoring.');
      property.unused = true;
    }

    if (property.value.length === 0) {
      propertyToken = property.all[property.position];
      context.warnings.push('Empty property \'' + name + '\' at ' + formatPosition(propertyToken[1][2][0]) + '. Ignoring.');
      property.unused = true;
    }

    if (property.hack && (
        (property.hack == Hack.STAR || property.hack == Hack.UNDERSCORE) && !options.compatibility.properties.iePrefixHack ||
        property.hack == Hack.BACKSLASH && !options.compatibility.properties.ieSuffixHack ||
        property.hack == Hack.BANG && !options.compatibility.properties.ieBangHack)) {
      property.unused = true;
    }

    if (name.indexOf('padding') === 0 && (isNegative(property.value[0]) || isNegative(property.value[1]) || isNegative(property.value[2]) || isNegative(property.value[3])))
      property.unused = true;

    if (property.unused)
      continue;

    if (property.block) {
      optimizeBody(property.value[0][1], context);
      continue;
    }

    for (var j = 0, m = property.value.length; j < m; j++) {
      type = property.value[j][0];
      value = property.value[j][1];
      valueIsUrl = isUrl(value);

      if (type == Token.PROPERTY_BLOCK) {
        property.unused = true;
        context.warnings.push('Invalid value token at ' + formatPosition(value[0][1][2][0]) + '. Ignoring.');
        break;
      }

      if (valueIsUrl && !context.validator.isValidUrl(value)) {
        property.unused = true;
        context.warnings.push('Broken URL \'' + value + '\' at ' + formatPosition(property.value[j][2][0]) + '. Ignoring.');
        break;
      }

      if (valueMinifiers[name]) {
        value = valueMinifiers[name](value, j, m, options);
      }

      if (valueIsUrl) {
        value = normalizeUrl(value);
        value = options.compatibility.properties.urlQuotes ?
          value :
          removeUrlQuotes(value);
      } else if (isQuoted(value)) {
        value = removeQuotes(name, value);
      } else {
        value = whitespaceMinifier(name, value);
        value = precisionMinifier(name, value, options.precision);
        value = pixelLengthMinifier(name, value, options.compatibility);
        value = timeUnitMinifier(name, value);
        value = zeroMinifier(name, value);
        if (options.compatibility.properties.zeroUnits) {
          value = zeroDegMinifier(name, value);
          value = unitMinifier(name, value, options.unitsRegexp);
        }
        if (options.compatibility.properties.colors)
          value = colorMininifier(name, value, options.compatibility);
      }

      property.value[j][1] = value;
    }

    multipleZerosMinifier(property);

    if (name.indexOf('border') === 0 && name.indexOf('radius') > 0)
      minifyBorderRadius(property);
    else if (name == 'filter')
      minifyFilter(property);
    else if (name == 'font')
      minifyFont(property, options);
  }

  restoreFromOptimizing(_properties, true);
  removeUnused(_properties);

  if (_properties.length != properties.length) {
    removeComments(properties, options);
  }
}

function isUrl(value) {
  return URL_PREFIX_PATTERN.test(value);
}

function removeComments(tokens, options) {
  var token;
  var i;

  for (i = 0; i < tokens.length; i++) {
    token = tokens[i];

    if (token[0] != Token.COMMENT) {
      continue;
    }

    optimizeComment(token, options);

    if (token[1].length === 0) {
      tokens.splice(i, 1);
      i--;
    }
  }
}

function optimizeComment(token, options) {
  if (token[1][2] == Marker.EXCLAMATION && (options.keepSpecialComments == '*' || options.commentsKept < options.keepSpecialComments)) {
    options.commentsKept++;
    return;
  }

  token[1] = [];
}

function cleanupCharsets(tokens) {
  var hasCharset = false;

  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];

    if (token[0] != Token.AT_RULE)
      continue;

    if (!CHARSET_REGEXP.test(token[1]))
      continue;

    if (hasCharset || token[1].indexOf(CHARSET_TOKEN) == -1) {
      tokens.splice(i, 1);
      i--;
      l--;
    } else {
      hasCharset = true;
      tokens.splice(i, 1);
      tokens.unshift([Token.AT_RULE, token[1].replace(CHARSET_REGEXP, CHARSET_TOKEN)]);
    }
  }
}

function buildUnitRegexp(options) {
  var units = ['px', 'em', 'ex', 'cm', 'mm', 'in', 'pt', 'pc', '%'];
  var otherUnits = ['ch', 'rem', 'vh', 'vm', 'vmax', 'vmin', 'vw'];

  otherUnits.forEach(function (unit) {
    if (options.compatibility.units[unit])
      units.push(unit);
  });

  return new RegExp('(^|\\s|\\(|,)0(?:' + units.join('|') + ')(\\W|$)', 'g');
}

function buildPrecisionOptions(roundingPrecision) {
  var precisionOptions = {
    matcher: null,
    units: {},
  };
  var optimizable = [];
  var unit;
  var value;

  for (unit in roundingPrecision) {
    value = roundingPrecision[unit];

    if (value != DEFAULT_ROUNDING_PRECISION) {
      precisionOptions.units[unit] = {};
      precisionOptions.units[unit].value = value;
      precisionOptions.units[unit].multiplier = Math.pow(10, value);

      optimizable.push(unit);
    }
  }

  if (optimizable.length > 0) {
    precisionOptions.matcher = new RegExp('(\\d*)(\\.\\d+)(' + optimizable.join('|') + ')', 'g');
  }

  return precisionOptions;
}

function isImport(token) {
  return IMPORT_PREFIX_PATTERN.test(token[1]);
}

function basicOptimize(tokens, context) {
  var options = context.options;
  var ie7Hack = options.compatibility.selectors.ie7Hack;
  var adjacentSpace = options.compatibility.selectors.adjacentSpace;
  var spaceAfterClosingBrace = options.compatibility.properties.spaceAfterClosingBrace;
  var beautify = options.beautify;
  var mayHaveCharset = false;
  var afterRules = false;

  options.unitsRegexp = options.unitsRegexp || buildUnitRegexp(options);
  options.precision = options.precision || buildPrecisionOptions(options.roundingPrecision);
  options.commentsKept = options.commentsKept || 0;

  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];

    switch (token[0]) {
      case Token.AT_RULE:
        token[1] = isImport(token) && afterRules ? '' : tidyAtRule(token[1]);
        mayHaveCharset = true;
        break;
      case Token.AT_RULE_BLOCK:
        optimizeBody(token[2], context);
        afterRules = true;
        break;
      case Token.BLOCK:
        token[1] = tidyBlock(token[1], spaceAfterClosingBrace);
        basicOptimize(token[2], context);
        afterRules = true;
        break;
      case Token.COMMENT:
        optimizeComment(token, options);
        break;
      case Token.RULE:
        token[1] = tidyRules(token[1], !ie7Hack, adjacentSpace, beautify, context.warnings);
        optimizeBody(token[2], context);
        afterRules = true;
        break;
    }

    if (token[1].length === 0 || (token[2] && token[2].length === 0)) {
      tokens.splice(i, 1);
      i--;
      l--;
    }
  }

  if (mayHaveCharset) {
    cleanupCharsets(tokens);
  }

  return tokens;
}

module.exports = basicOptimize;
