var CleanUp = require('./clean-up');
var Splitter = require('../../utils/splitter');

var RGB = require('../../colors/rgb');
var HSL = require('../../colors/hsl');
var HexNameShortener = require('../../colors/hex-name-shortener');

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
  options.precision.regexp = new RegExp('\\.(\\d{' + (options.precision.value + 1) + ',})px', 'g');
}

function removeUnsupported(token, compatibility) {
  if (compatibility.selectors.ie7Hack)
    return;

  var supported = [];
  for (var i = 0, l = token.selector.length; i < l; i++) {
    var selector = token.selector[i];

    if (selector.indexOf('*+html ') === -1 && selector.indexOf('*:first-child+html ') === -1)
      supported.push(selector);
  }

  token.selector = supported;
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
      value = value.replace(/progid:DXImageTransform\.Microsoft\.(Alpha|Chroma)/, function (match, filter) {
        return filter.toLowerCase();
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

function zeroMinifier(_, value) {
  if (value.indexOf('0') == -1)
    return value;

  return value
    .replace(/\-0$/g, '0')
    .replace(/\-0([^\.])/g, '0$1')
    .replace(/(^|\s)0+([1-9])/g, '$1$2')
    .replace(/(^|\D)\.0+(\D|$)/g, '$10$2')
    .replace(/(^|\D)\.0+(\D|$)/g, '$10$2')
    .replace(/\.([1-9]*)0+(\D|$)/g, function(match, nonZeroPart, suffix) {
      return (nonZeroPart.length > 0 ? '.' : '') + nonZeroPart + suffix;
    })
    .replace(/(^|\D)0\.(\d)/g, '$1.$2');
}

function precisionMinifier(_, value, precisionOptions) {
  if (value.indexOf('.') === -1)
    return value;

  return value
    .replace(precisionOptions.regexp, function(match, decimalPlaces) {
      var newFraction = Math.round(parseFloat('.' + decimalPlaces) * precisionOptions.multiplier) / precisionOptions.multiplier;
      return precisionOptions.value === 0 || newFraction === 0 ?
        'px' :
        '.' + ('' + newFraction).substring('0.'.length) + 'px';
    })
    .replace(/(\d)\.($|\D)/g, '$1$2');
}

function unitMinifier(_, value, unitsRegexp) {
  return value.replace(unitsRegexp, '$1' + '0');
}

function multipleZerosMinifier(property, value) {
  if (value.indexOf('0 0 0 0') == -1)
    return value;

  if (property.indexOf('box-shadow') > -1)
    return value == '0 0 0 0' ? '0 0' : value;

  return value.replace(/^0 0 0 0$/, '0');
}

function colorMininifier(property, value, compatibility) {
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

function reduce(body, options) {
  var reduced = [];

  for (var i = 0, l = body.length; i < l; i++) {
    var token = body[i];
    var firstColon = token.indexOf(':');
    var property = token.substring(0, firstColon);
    var value = token.substring(firstColon + 1);
    var important = false;

    if (!options.compatibility.properties.iePrefixHack && (property[0] == '_' || property[0] == '*'))
      continue;

    if (value.indexOf('!important') > 0 || value.indexOf('! important') > 0) {
      value = value.substring(0, value.indexOf('!')).trim();
      important = true;
    }

    if (property.indexOf('border') === 0 && property.indexOf('radius') > 0)
      value = valueMinifiers['border-*-radius'](value);

    if (valueMinifiers[property])
      value = valueMinifiers[property](value);

    value = zeroMinifier(property, value);
    value = precisionMinifier(property, value, options.precision);
    value = unitMinifier(property, value, options.unitsRegexp);
    value = multipleZerosMinifier(property, value);
    value = colorMininifier(property, value, options.compatibility);

    reduced.push(property + ':' + value + (important ? '!important' : ''));
  }

  return reduced;
}

SimpleOptimizer.prototype.optimize = function(tokens) {
  var self = this;
  var hasCharset = false;

  function _optimize(tokens) {
    for (var i = 0, l = tokens.length; i < l; i++) {
      var token = tokens[i];
      // FIXME: why it's so?
      if (!token)
        break;

      if (token.selector) {
        token.selector = CleanUp.selectors(token.selector);

        removeUnsupported(token, self.options.compatibility);
        if (token.selector.length === 0) {
          tokens.splice(i, 1);
          i--;
          continue;
        }

        token.body = reduce(token.body, self.options);
      } else if (token.block) {
        token.block = CleanUp.block(token.block);
        if (token.isFlatBlock)
          token.body = reduce(token.body, self.options);
        else
          _optimize(token.body);
      } else if (typeof token === 'string') {
        if (CHARSET_REGEXP.test(token)) {
          if (hasCharset || token.indexOf(CHARSET_TOKEN) == -1) {
            tokens.splice(i, 1);
            i++;
          } else {
            hasCharset = true;
            tokens.splice(i, 1);
            tokens.unshift(token.replace(CHARSET_REGEXP, CHARSET_TOKEN));
          }
        }
      }
    }
  }

  _optimize(tokens);
};

module.exports = SimpleOptimizer;
