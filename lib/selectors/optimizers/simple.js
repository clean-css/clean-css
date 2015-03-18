var CleanUp = require('./clean-up');
var Splitter = require('../../utils/splitter');

var RGB = require('../../colors/rgb');
var HSL = require('../../colors/hsl');
var HexNameShortener = require('../../colors/hex-name-shortener');

var processable = require('../../properties/processable');

var DEFAULT_ROUNDING_PRECISION = 2;
var CHARSET_TOKEN = '@charset';
var CHARSET_REGEXP = new RegExp('^' + CHARSET_TOKEN, 'i');

function SimpleOptimizer(options) {
  this.options = options;

  var units = ['px', 'em', 'ex', 'cm', 'mm', 'in', 'pt', 'pc', '%'];
  if (options.compatibility.units.rem)
    units.push('rem');
  options.unitsRegexp = new RegExp('(^|\\s|\\(|,)0(?:' + units.join('|') + ')', 'g');

  options.precision = {};
  options.precision.value = options.roundingPrecision === undefined ?
    DEFAULT_ROUNDING_PRECISION :
    options.roundingPrecision;
  options.precision.multiplier = Math.pow(10, options.precision.value);
  options.precision.regexp = new RegExp('(\\d*\\.\\d{' + (options.precision.value + 1) + ',})px', 'g');
}

var valueMinifiers = {
  'background': function (value) {
    return value == 'none' || value == 'transparent' ? '0 0' : value;
  },
  'border-*-radius': function (value) {
    if (value.indexOf('/') == -1)
      return value;

    var parts = value.split(/\s*\/\s*/);
    if (parts[0] == parts[1])
      return parts[0];
    else
      return parts[0] + '/' + parts[1];
  },
  'filter': function (value) {
    if (value.indexOf('DXImageTransform') === value.lastIndexOf('DXImageTransform')) {
      value = value.replace(/progid:DXImageTransform\.Microsoft\.(Alpha|Chroma)(\W)/, function (match, filter, suffix) {
        return filter.toLowerCase() + suffix;
      });
    }

    return value
      .replace(/,(\S)/g, ', $1')
      .replace(/ ?= ?/g, '=');
  },
  'font': function (value) {
    var parts = value.split(' ');

    if (parts[1] != 'normal' && parts[1] != 'bold' && !/^[1-9]00/.test(parts[1]))
      parts[0] = this['font-weight'](parts[0]);

    return parts.join(' ');
  },
  'font-weight': function (value) {
    if (value == 'normal')
      return '400';
    else if (value == 'bold')
      return '700';
    else
      return value;
  },
  'outline': function (value) {
    return value == 'none' ? '0' : value;
  }
};

function isNegative(value) {
  var parts = new Splitter(',').split(value);
  for (var i = 0, l = parts.length; i < l; i++) {
    if (parts[i][0] == '-' && parseFloat(parts[i]) < 0)
      return true;
  }

  return false;
}

function zeroMinifier(_, value) {
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
    .replace(/\.([1-9]*)0+(\D|$)/g, function(match, nonZeroPart, suffix) {
      return (nonZeroPart.length > 0 ? '.' : '') + nonZeroPart + suffix;
    })
    .replace(/(^|\D)0\.(\d)/g, '$1.$2');
}

function zeroDegMinifier(_, value) {
  if (value.indexOf('0deg') == -1)
    return value;

  return value.replace(/\(0deg\)/g, '(0)');
}

function precisionMinifier(_, value, precisionOptions) {
  if (precisionOptions.value === -1 || value.indexOf('.') === -1)
    return value;

  return value
    .replace(precisionOptions.regexp, function(match, number) {
      return Math.round(parseFloat(number) * precisionOptions.multiplier) / precisionOptions.multiplier + 'px';
    })
    .replace(/(\d)\.($|\D)/g, '$1$2');
}

function unitMinifier(_, value, unitsRegexp) {
  return value.replace(unitsRegexp, '$1' + '0');
}

function multipleZerosMinifier(name, value) {
  if (value.indexOf('0 0 0 0') == -1)
    return value;

  if (name.indexOf('box-shadow') > -1)
    return value == '0 0 0 0' ? '0 0' : value;

  return value.replace(/^0 0 0 0$/, '0');
}

function colorMininifier(_, value, compatibility) {
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
      if (color[0] == color[1] && color[2] == color[3] && color[4] == color[5])
        return prefix + '#' + color[0] + color[2] + color[4];
      else
        return prefix + '#' + color;
    })
    .replace(/(rgb|rgba|hsl|hsla)\(([^\)]+)\)/g, function(match, colorFunction, colorDef) {
      var tokens = colorDef.split(',');
      var applies = colorFunction == 'hsl' || colorFunction == 'hsla' || tokens[0].indexOf('%') > -1;
      if (!applies)
        return match;

      if (tokens[1].indexOf('%') == -1)
        tokens[1] += '%';
      if (tokens[2].indexOf('%') == -1)
        tokens[2] += '%';
      return colorFunction + '(' + tokens.join(',') + ')';
    });

  if (compatibility.colors.opacity) {
    value = value.replace(/(?:rgba|hsla)\(0,0%?,0%?,0\)/g, function (match) {
      if (new Splitter(',').split(value).pop().indexOf('gradient(') > -1)
        return match;

      return 'transparent';
    });
  }

  return HexNameShortener.shorten(value);
}

function spaceMinifier(name, value) {
  if (name == 'filter' || value.indexOf(') ') == -1 || processable.implementedFor.test(name))
    return value;

  return value.replace(/\) ((?![\+\-] )|$)/g, ')$1');
}

function optimizeBody(properties, options) {
  var property, firstColon, name, value, important;

  for (var i = 0, l = properties.length; i < l; i++) {
    property = properties[i];

    // FIXME: the check should be gone with #407
    if (property[0].indexOf('__ESCAPED_') === 0)
      continue;

    firstColon = property[0].indexOf(':');
    name = property[0].substring(0, firstColon);
    value = property[0].substring(firstColon + 1);
    important = false;

    if ((!options.compatibility.properties.iePrefixHack && (name[0] == '_' || name[0] == '*')) ||
        (name.indexOf('padding') === 0 && isNegative(value))) {
      properties.splice(i, 1);
      i--;
      l--;
      continue;
    }

    if (value.indexOf('!important') > 0 || value.indexOf('! important') > 0) {
      value = value.substring(0, value.indexOf('!')).trim();
      important = true;
    }

    if (name.indexOf('border') === 0 && name.indexOf('radius') > 0)
      value = valueMinifiers['border-*-radius'](value);

    if (valueMinifiers[name])
      value = valueMinifiers[name](value);

    value = precisionMinifier(name, value, options.precision);
    value = zeroMinifier(name, value);
    if (options.compatibility.properties.zeroUnits) {
      value = zeroDegMinifier(name, value);
      value = unitMinifier(name, value, options.unitsRegexp);
    }
    value = multipleZerosMinifier(name, value);
    value = colorMininifier(name, value, options.compatibility);

    if (!options.compatibility.properties.spaceAfterClosingBrace)
      value = spaceMinifier(name, value);

    property[0] = name + ':' + value + (important ? '!important' : '');
  }
}

SimpleOptimizer.prototype.optimize = function(tokens) {
  var self = this;
  var hasCharset = false;
  var options = this.options;
  var ie7Hack = options.compatibility.selectors.ie7Hack;
  var adjacentSpace = options.compatibility.selectors.adjacentSpace;
  var token;

  function _cleanupCharsets(tokens) {
    for (var i = 0, l = tokens.length; i < l; i++) {
      token = tokens[i];

      if (token[0] != 'at-rule')
        continue;

      if (CHARSET_REGEXP.test(token[1][0])) {
        if (hasCharset || token[1][0].indexOf(CHARSET_TOKEN) == -1) {
          tokens.splice(i, 1);
          i--;
          l--;
        } else {
          hasCharset = true;
          tokens.splice(i, 1);
          tokens.unshift(['at-rule', [token[1][0].replace(CHARSET_REGEXP, CHARSET_TOKEN)]]);
        }
      }
    }
  }

  function _optimize(tokens) {
    var mayHaveCharset = false;

    for (var i = 0, l = tokens.length; i < l; i++) {
      token = tokens[i];

      switch (token[0]) {
        case 'selector':
          token[1] = CleanUp.selectors(token[1], !ie7Hack, adjacentSpace);
          optimizeBody(token[2], self.options);
          break;
        case 'block':
          CleanUp.block(token[1]);
          _optimize(token[2]);
          break;
        case 'flat-block':
          CleanUp.block(token[1]);
          optimizeBody(token[2], self.options);
          break;
        case 'at-rule':
          CleanUp.atRule(token[1]);
          mayHaveCharset = true;
      }

      if (token[1].length === 0 || (token[2] && token[2].length === 0)) {
        tokens.splice(i, 1);
        i--;
        l--;
      }
    }

    if (mayHaveCharset)
      _cleanupCharsets(tokens);
  }

  _optimize(tokens);
};

module.exports = SimpleOptimizer;
