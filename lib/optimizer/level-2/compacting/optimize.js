var populateComponents = require('./populate-components');
var compactOverrides = require('./override-compactor');
var compactShorthands = require('./shorthand-compactor');

var compactable = require('../compactable');
var restoreWithComponents = require('../restore-with-components');

var wrapForOptimizing = require('../../wrap-for-optimizing').all;
var removeUnused = require('../../remove-unused');
var restoreFromOptimizing = require('../../restore-from-optimizing');

var OptimizationLevel = require('../../../options/optimization-level').OptimizationLevel;

var serializeProperty = require('../../../writer/one-time').property;

function _optimize(properties, mergeAdjacent, aggressiveMerging, validator) {
  var overrideMapping = {};
  var lastName = null;
  var lastProperty;
  var j;

  function mergeablePosition(position) {
    if (mergeAdjacent === false || mergeAdjacent === true)
      return mergeAdjacent;

    return mergeAdjacent.indexOf(position) > -1;
  }

  function sameValue(position) {
    var left = properties[position - 1];
    var right = properties[position];

    return serializeProperty(left.all, left.position) == serializeProperty(right.all, right.position);
  }

  propertyLoop:
  for (var position = 0, total = properties.length; position < total; position++) {
    var property = properties[position];
    var _name = (property.name == '-ms-filter' || property.name == 'filter') ?
      (lastName == 'background' || lastName == 'background-image' ? lastName : property.name) :
      property.name;
    var isImportant = property.important;
    var isHack = property.hack;

    if (property.unused)
      continue;

    if (position > 0 && lastProperty && _name == lastName && isImportant == lastProperty.important && isHack == lastProperty.hack && sameValue(position) && !lastProperty.unused) {
      property.unused = true;
      continue;
    }

    // comment is necessary - we assume that if two properties are one after another
    // then it is intentional way of redefining property which may not be widely supported
    // e.g. a{display:inline-block;display:-moz-inline-box}
    // however if `mergeablePosition` yields true then the rule does not apply
    // (e.g merging two adjacent selectors: `a{display:block}a{display:block}`)
    if (_name in overrideMapping && (aggressiveMerging && _name != lastName || mergeablePosition(position))) {
      var toOverridePositions = overrideMapping[_name];
      var canOverride = compactable[_name] && compactable[_name].canOverride;
      var anyRemoved = false;

      for (j = toOverridePositions.length - 1; j >= 0; j--) {
        var toRemove = properties[toOverridePositions[j]];
        var longhandToShorthand = toRemove.name != _name;
        var wasImportant = toRemove.important;
        var wasHack = toRemove.hack;

        if (toRemove.unused)
          continue;

        if (longhandToShorthand && wasImportant)
          continue;

        if (!wasImportant && (wasHack && !isHack || !wasHack && isHack))
          continue;

        if (wasImportant && (isHack == 'star' || isHack == 'underscore'))
          continue;

        if (!wasHack && !isHack && !longhandToShorthand && canOverride && !canOverride(toRemove, property, validator))
          continue;

        if (wasImportant && !isImportant || wasImportant && isHack) {
          property.unused = true;
          lastProperty = property;
          continue propertyLoop;
        } else {
          anyRemoved = true;
          toRemove.unused = true;
        }
      }

      if (anyRemoved) {
        position = -1;
        lastProperty = null;
        lastName = null;
        overrideMapping = {};
        continue;
      }
    } else {
      overrideMapping[_name] = overrideMapping[_name] || [];
      overrideMapping[_name].push(position);
    }

    lastName = _name;
    lastProperty = property;
  }
}

function compactorOptimize(selector, properties, mergeAdjacent, withCompacting, overrideOptions, context) {
  var validator = context.validator;
  var warnings = context.warnings;

  var _properties = wrapForOptimizing(properties, false);
  populateComponents(_properties, validator, warnings);
  _optimize(_properties, mergeAdjacent, context.options.aggressiveMerging, validator);

  for (var i = 0, l = _properties.length; i < l; i++) {
    var _property = _properties[i];
    if (_property.block) {
      compactorOptimize(selector, _property.value[0][1], mergeAdjacent, withCompacting, overrideOptions, context);
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
