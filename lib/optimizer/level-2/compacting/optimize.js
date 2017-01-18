var populateComponents = require('./populate-components');
var compactOverrides = require('./override-compactor');
var compactShorthands = require('./shorthand-compactor');

var restoreWithComponents = require('../restore-with-components');

var wrapForOptimizing = require('../../wrap-for-optimizing').all;
var removeUnused = require('../../remove-unused');
var restoreFromOptimizing = require('../../restore-from-optimizing');

var OptimizationLevel = require('../../../options/optimization-level').OptimizationLevel;

function compactorOptimize(selector, properties, withCompacting, overrideOptions, context) {
  var validator = context.validator;
  var warnings = context.warnings;
  var _properties = wrapForOptimizing(properties, false);
  var _property;

  populateComponents(_properties, validator, warnings);

  for (var i = 0, l = _properties.length; i < l; i++) {
    _property = _properties[i];
    if (_property.block) {
      compactorOptimize(selector, _property.value[0][1], withCompacting, overrideOptions, context);
    }
  }

  if (overrideOptions.enabled && context.options.level[OptimizationLevel.Two].compactShorthands) {
    compactOverrides(_properties, context.options.compatibility, overrideOptions.merging, validator);
  }

  if (withCompacting && context.options.level[OptimizationLevel.Two].compactShorthands) {
    compactShorthands(_properties, validator);
  }

  restoreFromOptimizing(_properties, restoreWithComponents);
  removeUnused(_properties);
}

module.exports = compactorOptimize;
