var override = require('../utils/override');
var roundingPrecisionFrom = require('../utils/rounding-precision').roundingPrecisionFrom;

var OptimizationLevel = {
  Zero: '0',
  One: '1',
  Two: '2'
};

var DEFAULTS = {};

DEFAULTS[OptimizationLevel.Zero] = {};
DEFAULTS[OptimizationLevel.One] = {
  roundingPrecision: roundingPrecisionFrom(undefined),
  specialComments: 'all'
};
DEFAULTS[OptimizationLevel.Two] = {
  mediaMerging: true,
  restructuring: true,
  semanticMerging: false,
  shorthandCompacting: true
};

var OPTION_SEPARATOR = ';';
var OPTION_VALUE_SEPARATOR = ':';

function optimizationLevelOptionsFrom(source) {
  var options = override(DEFAULTS, {});

  if (undefined === source) {
    return options;
  }

  if (typeof source == 'string') {
    source = parseInt(source);
  }

  if (typeof source == 'number' && source === 2) {
    return options;
  }

  if (typeof source == 'number' && source === 1) {
    delete options[OptimizationLevel.Two];
    return options;
  }

  if (typeof source == 'number' && source === 0) {
    delete options[OptimizationLevel.Two];
    delete options[OptimizationLevel.One];
    return options;
  }

  if (typeof source == 'object') {
    source = covertValuesToHashes(source);
  }

  if (OptimizationLevel.One in source && 'roundingPrecision' in source[OptimizationLevel.One]) {
    source[OptimizationLevel.One].roundingPrecision = roundingPrecisionFrom(source[OptimizationLevel.One].roundingPrecision);
  }

  if (OptimizationLevel.Zero in source || OptimizationLevel.One in source || OptimizationLevel.Two in source) {
    options[0] = override(options[0], source[0]);
  }

  if (OptimizationLevel.One in source || OptimizationLevel.Two in source) {
    options[1] = override(options[1], source[1]);
  } else {
    delete options[OptimizationLevel.One];
  }

  if (OptimizationLevel.Two in source) {
    options[2] = override(options[2], source[2]);
  } else {
    delete options[OptimizationLevel.Two];
  }

  return options;
}

function covertValuesToHashes(source) {
  var clonedSource = override(source, {});
  var key;
  var i;

  for (i = 0; i <= 2; i++) {
    key = '' + i;

    if (key in clonedSource && (clonedSource[key] === undefined || clonedSource[key] === false)) {
      delete clonedSource[key];
    }

    if (key in clonedSource && clonedSource[key] === true) {
      clonedSource[key] = {};
    }

    if (key in clonedSource && typeof clonedSource[key] == 'string') {
      clonedSource[key] = covertToHash(clonedSource[key]);
    }
  }

  return clonedSource;
}

function covertToHash(asString) {
  return asString
    .split(OPTION_SEPARATOR)
    .reduce(function (accumulator, directive) {
      var parts = directive.split(OPTION_VALUE_SEPARATOR);
      var name = parts[0];
      var value = parts[1];

      switch (value) {
        case 'false':
          accumulator[name] = false;
          break;
        case 'true':
          accumulator[name] = true;
          break;
        default:
          accumulator[name] = value;
      }

      return accumulator;
    }, {});
}

module.exports = {
  OptimizationLevel: OptimizationLevel,
  optimizationLevelOptionsFrom: optimizationLevelOptionsFrom,
};
