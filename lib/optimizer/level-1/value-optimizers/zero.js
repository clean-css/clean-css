var FUNCTION_PATTERN = /^(?:\-moz\-calc|\-webkit\-calc|calc|rgb|hsl|rgba|hsla|min|max|clamp)\(/;

var plugin = {
  level1: {
    value: function zero(name, value, options) {
      if (!options.compatibility.properties.zeroUnits) {
        return value;
      }

      if (FUNCTION_PATTERN.test(value)) {
        return value;
      }

      if (value.indexOf('%') > 0 && (name == 'height' || name == 'max-height' || name == 'width' || name == 'max-width')) {
        return value;
      }

      return value
        .replace(options.unitsRegexp, '$1' + '0' + '$2')
        .replace(options.unitsRegexp, '$1' + '0' + '$2');
    }
  }
};

module.exports = plugin;
