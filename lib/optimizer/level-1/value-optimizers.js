var shortenHex = require('./shorten-hex');
var shortenHsl = require('./shorten-hsl');
var shortenRgb = require('./shorten-rgb');

var Marker = require('../../tokenizer/marker');

var OptimizationLevel = require('../../options/optimization-level').OptimizationLevel;

var split = require('../../utils/split');

var TIME_VALUE = /^(\-?[\d\.]+)(m?s)$/;
var WHOLE_PIXEL_VALUE = /(?:^|\s|\()(-?\d+)px/;

var HEX_VALUE_PATTERN = /[0-9a-f]/i;
var LOCAL_PREFIX_PATTERN = /^local\(/i;
var QUOTED_PATTERN = /^('.*'|".*")$/;
var QUOTED_BUT_SAFE_PATTERN = /^['"][a-zA-Z][a-zA-Z\d\-_]+['"]$/;
var URL_PREFIX_PATTERN = /^url\(/i;

// Helpers

function startsAsUrl(value) {
  return URL_PREFIX_PATTERN.test(value);
}

// Optimizers

function color(name, value, options) {
  if (!options.compatibility.properties.colors) {
    return value;
  }

  if (!value.match(/#|rgb|hsl/gi)) {
    return shortenHex(value);
  }

  value = value
    .replace(/(rgb|hsl)a?\((\-?\d+),(\-?\d+\%?),(\-?\d+\%?),(0*[1-9]+[0-9]*(.?\d*)?)\)/gi, function (match, colorFn, p1, p2, p3, alpha) {
      return (parseInt(alpha, 10) >= 1 ? colorFn + '(' + [p1,p2,p3].join(',') + ')' : match);
    })
    .replace(/rgb\((\-?\d+),(\-?\d+),(\-?\d+)\)/gi, function (match, red, green, blue) {
      return shortenRgb(red, green, blue);
    })
    .replace(/hsl\((-?\d+),(-?\d+)%?,(-?\d+)%?\)/gi, function (match, hue, saturation, lightness) {
      return shortenHsl(hue, saturation, lightness);
    })
    .replace(/(^|[^='"])#([0-9a-f]{6})/gi, function (match, prefix, color, at, inputValue) {
      var suffix = inputValue[at + match.length];

      if (suffix && HEX_VALUE_PATTERN.test(suffix)) {
        return match;
      } else if (color[0] == color[1] && color[2] == color[3] && color[4] == color[5]) {
        return (prefix + '#' + color[0] + color[2] + color[4]).toLowerCase();
      } else {
        return (prefix + '#' + color).toLowerCase();
      }
    })
    .replace(/(^|[^='"])#([0-9a-f]{3})/gi, function (match, prefix, color) {
      return prefix + '#' + color.toLowerCase();
    })
    .replace(/(rgb|rgba|hsl|hsla)\(([^\)]+)\)/gi, function (match, colorFunction, colorDef) {
      var tokens = colorDef.split(',');
      var colorFnLowercase = colorFunction && colorFunction.toLowerCase();
      var applies = (colorFnLowercase == 'hsl' && tokens.length == 3) ||
        (colorFnLowercase == 'hsla' && tokens.length == 4) ||
        (colorFnLowercase == 'rgb' && tokens.length === 3 && colorDef.indexOf('%') > 0) ||
        (colorFnLowercase == 'rgba' && tokens.length == 4 && colorDef.indexOf('%') > 0);

      if (!applies) {
        return match;
      }

      if (tokens[1].indexOf('%') == -1) {
        tokens[1] += '%';
      }

      if (tokens[2].indexOf('%') == -1) {
        tokens[2] += '%';
      }

      return colorFunction + '(' + tokens.join(',') + ')';
    });

  if (options.compatibility.colors.opacity && name.indexOf('background') == -1) {
    value = value.replace(/(?:rgba|hsla)\(0,0%?,0%?,0\)/g, function (match) {
      if (split(value, ',').pop().indexOf('gradient(') > -1) {
        return match;
      }

      return 'transparent';
    });
  }

  return shortenHex(value);
}

function degrees(_name, value, options) {
  if (!options.compatibility.properties.zeroUnits) {
    return value;
  }

  if (value.indexOf('0deg') == -1) {
    return value;
  }

  return value.replace(/\(0deg\)/g, '(0)');
}

function fraction(name, value, options) {
  if (!options.level[OptimizationLevel.One].replaceZeroUnits) {
    return value;
  }

  if (startsAsUrl(value)) {
    return value;
  }

  if (value.indexOf('0') == -1) {
    return value;
  }

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

function precision(_name, value, options) {
  if (!options.precision.enabled || value.indexOf('.') === -1) {
    return value;
  }

  return value
    .replace(options.precision.decimalPointMatcher, '$1$2$3')
    .replace(options.precision.zeroMatcher, function (match, integerPart, fractionPart, unit) {
      var multiplier = options.precision.units[unit].multiplier;
      var parsedInteger = parseInt(integerPart);
      var integer = isNaN(parsedInteger) ? 0 : parsedInteger;
      var fraction = parseFloat(fractionPart);

      return Math.round((integer + fraction) * multiplier) / multiplier + unit;
    });
}

function textQuotes(_name, value, options) {
  if (!options.level[OptimizationLevel.One].removeQuotes) {
    return value;
  }

  if (!QUOTED_PATTERN.test(value) && !LOCAL_PREFIX_PATTERN.test(value)) {
    return value;
  }

  return QUOTED_BUT_SAFE_PATTERN.test(value) ?
    value.substring(1, value.length - 1) :
    value;
}

function time(name, value, options) {
  if (!options.level[OptimizationLevel.One].replaceTimeUnits) {
    return value;
  }

  if (!TIME_VALUE.test(value)) {
    return value;
  }

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

function unit(_name, value, options) {
  if (!WHOLE_PIXEL_VALUE.test(value)) {
    return value;
  }

  return value.replace(WHOLE_PIXEL_VALUE, function (match, val) {
    var newValue;
    var intVal = parseInt(val);

    if (intVal === 0) {
      return match;
    }

    if (options.compatibility.properties.shorterLengthUnits && options.compatibility.units.pt && intVal * 3 % 4 === 0) {
      newValue = intVal * 3 / 4 + 'pt';
    }

    if (options.compatibility.properties.shorterLengthUnits && options.compatibility.units.pc && intVal % 16 === 0) {
      newValue = intVal / 16 + 'pc';
    }

    if (options.compatibility.properties.shorterLengthUnits && options.compatibility.units.in && intVal % 96 === 0) {
      newValue = intVal / 96 + 'in';
    }

    if (newValue) {
      newValue = match.substring(0, match.indexOf(val)) + newValue;
    }

    return newValue && newValue.length < match.length ? newValue : match;
  });
}

function urlPrefix(_name, value, options) {
  if (!options.level[OptimizationLevel.One].normalizeUrls) {
    return value;
  }

  if (!startsAsUrl(value)) {
    return value;
  }

  return value.replace(URL_PREFIX_PATTERN, 'url(');
}

function urlQuotes(_name, value, options) {
  if (options.compatibility.properties.urlQuotes) {
    return value;
  }

  return /^url\(['"].+['"]\)$/.test(value) && !/^url\(['"].*[\*\s\(\)'"].*['"]\)$/.test(value) && !/^url\(['"]data:[^;]+;charset/.test(value) ?
    value.replace(/["']/g, '') :
    value;
}

function urlWhiteSpace(_name, value) {
  if (!startsAsUrl(value)) {
    return value;
  }

  return value.replace(/\\?\n|\\?\r\n/g, '');
}

function whiteSpace(name, value, options) {
  if (!options.level[OptimizationLevel.One].removeWhitespace) {
    return value;
  }

  if (value.indexOf(' ') == -1 || value.indexOf('expression') === 0) {
    return value;
  }

  if (value.indexOf(Marker.SINGLE_QUOTE) > -1 || value.indexOf(Marker.DOUBLE_QUOTE) > -1) {
    return value;
  }

  value = value.replace(/\s+/g, ' ');

  if (value.indexOf('calc') > -1) {
    value = value.replace(/\) ?\/ ?/g, ')/ ');
  }

  return value
    .replace(/(\(;?)\s+/g, '$1')
    .replace(/\s+(;?\))/g, '$1')
    .replace(/, /g, ',');
}

function zero(name, value, options) {
  if (!options.compatibility.properties.zeroUnits) {
    return value;
  }

  if (/^(?:\-moz\-calc|\-webkit\-calc|calc|rgb|hsl|rgba|hsla)\(/.test(value)) {
    return value;
  }

  if (value.indexOf('%') > 0 && (name == 'height' || name == 'max-height' || name == 'width' || name == 'max-width')) {
    return value;
  }

  return value
    .replace(options.unitsRegexp, '$1' + '0' + '$2')
    .replace(options.unitsRegexp, '$1' + '0' + '$2');
}

module.exports = {
  color: color,
  degrees: degrees,
  fraction: fraction,
  precision: precision,
  textQuotes: textQuotes,
  time: time,
  unit: unit,
  urlPrefix: urlPrefix,
  urlQuotes: urlQuotes,
  urlWhiteSpace: urlWhiteSpace,
  whiteSpace: whiteSpace,
  zero: zero
};
