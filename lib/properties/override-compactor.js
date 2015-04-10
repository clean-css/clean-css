var canOverride = require('./can-override');
var compactable = require('./compactable');
var deepClone = require('./clone').deep;
var shallowClone = require('./clone').shallow;
var restoreShorthands = require('./restore-shorthands');

var stringifyProperty = require('../stringifier/one-time').property;

var MULTIPLEX_SEPARATOR = ',';

// Used when searching for a component that matches property
function nameMatchFilter(to) {
  return function (property) {
    return to.name === property.name;
  };
}

function wouldBreakCompatibility(property) {
  for (var i = 0; i < property.components.length; i++) {
    var component = property.components[i];
    var descriptor = compactable[component.name];
    var canOverride = descriptor && descriptor.canOverride || canOverride.sameValue;

    var _component = shallowClone(component);
    _component.value = [[descriptor.defaultValue]];

    if (!canOverride(_component, component))
      return true;
  }

  return false;
}

function isComponentOf(shorthand, longhand) {
  return compactable[shorthand.name].components.indexOf(longhand.name) > -1;
}

function overrideIntoMultiplex(property, by) {
  by.unused = true;

  for (var i = 0, l = property.value.length; i < l; i++) {
    property.value[i] = by.value;
  }
}

function overrideByMultiplex(property, by) {
  // FIXME: we store component multiplex values and normal multiplex property values' differently
  // e.g [[['no-repeat']], [['no-repeat']]]
  // vs
  // [['no-repeat'], [','], ['no-repeat']]
  // We should rather use the latter as it's the standard way

  by.unused = true;
  property.value = [];

  for (var i = 0, propertyIndex = 0, l = by.value.length; i < l; i++) {
    if (by.value[i] == MULTIPLEX_SEPARATOR) {
      propertyIndex++;
      continue;
    }

    property.value[propertyIndex] = property.value[propertyIndex] || [];
    property.value[propertyIndex].push(by.value[i]);
  }
}

function overrideSimple(property, by) {
  by.unused = true;
  property.value = by.value;
}

function override(property, by) {
  if (by.multiplex)
    overrideByMultiplex(property, by);
  else if (property.multiplex)
    overrideIntoMultiplex(property, by);
  else
    overrideSimple(property, by);
}

function overrideShorthand(property, by) {
  by.unused = true;

  for (var i = 0, l = property.components.length; i < l; i++) {
    override(property.components[i], by.components[i], property.multiplex);
  }
}

function hasInherits(property) {
  for (var i = property.value.length - 1; i >= 0; i--) {
    if (property.value[i] == 'inherit')
      return true;
  }

  return false;
}

function turnIntoMultiplex(property, size) {
  property.multiplex = true;

  for (var i = 0, l = property.components.length; i < l; i++) {
    var component = property.components[i];
    var value = component.value;
    component.value = [];

    for (var j = 0; j < size; j++) {
      component.value.push(value);
    }
  }
}

function multiplexSize(component) {
  var size = 0;

  for (var i = 0, l = component.value.length; i < l; i++) {
    if (component.value[i] == MULTIPLEX_SEPARATOR)
      size++;
  }

  return size + 1;
}

function lengthOf(property) {
  var fakeAsArray = [[property.name]].concat(property.value);
  return stringifyProperty([fakeAsArray], 0).length;
}

function wouldResultInLongerValue(left, right) {
  if (!left.multiplex && !right.multiplex || left.multiplex && right.multiplex)
    return false;

  var multiplex = left.multiplex ? left : right;
  var simple = left.multiplex ? right : left;
  var component;

  var multiplexClone = deepClone(multiplex);
  restoreShorthands([multiplexClone]);

  var simpleClone = deepClone(simple);
  restoreShorthands([simpleClone]);

  var lengthBefore = lengthOf(multiplexClone) + 1 + lengthOf(simpleClone);

  if (left.multiplex) {
    component = multiplexClone.components.filter(nameMatchFilter(simpleClone))[0];
    overrideIntoMultiplex(component, simpleClone);
  } else {
    component = simpleClone.components.filter(nameMatchFilter(multiplexClone))[0];
    turnIntoMultiplex(simpleClone, multiplexSize(multiplexClone));
    overrideByMultiplex(component, multiplexClone);
  }

  restoreShorthands([simpleClone]);

  var lengthAfter = lengthOf(simpleClone);

  return lengthBefore < lengthAfter;
}

function compactOverrides(properties, compatibility) {
  var mayOverride, right, left, component;
  var i, j, k;

  propertyLoop:
  for (i = properties.length - 1; i >= 0; i--) {
    right = properties[i];
    mayOverride = (compactable[right.name] && compactable[right.name].canOverride) || canOverride.sameValue;

    for (j = i - 1; j >= 0; j--) {
      left = properties[j];

      if (left.unused || right.unused)
        continue;

      if (hasInherits(right))
        continue;

      if (!left.shorthand && right.shorthand && isComponentOf(right, left)) {
        // maybe `left` can be overridden by `right` which is a shorthand?
        if (!right.important && left.important)
          continue;

        component = right.components.filter(nameMatchFilter(left))[0];
        mayOverride = (compactable[left.name] && compactable[left.name].canOverride) || canOverride.sameValue;
        if (mayOverride(left, component)) {
          left.unused = true;
        }
      } else if (left.shorthand && !right.shorthand && isComponentOf(left, right)) {
        // maybe `right` can be pulled into `left` which is a shorthand?
        if (right.important && !left.important)
          continue;

        component = left.components.filter(nameMatchFilter(right))[0];
        if (mayOverride(component, right)) {
          var disabledBackgroundSizeMerging = !compatibility.properties.backgroundSizeMerging && component.name.indexOf('background-size') > -1;
          var nonMergeableValue = compactable[right.name].nonMergeableValue === right.value[0][0];

          if (disabledBackgroundSizeMerging || nonMergeableValue)
            continue;

          if (!compatibility.properties.merging && wouldBreakCompatibility(left))
            continue;

          if (component.value[0][0] != right.value[0][0] && (hasInherits(left) || hasInherits(right)))
            continue;

          if (wouldResultInLongerValue(left, right))
            continue;

          if (!left.multiplex && right.multiplex)
            turnIntoMultiplex(left, multiplexSize(right));

          override(component, right);
          left.dirty = true;
        }
      } else if (left.shorthand && right.shorthand && left.name == right.name) {
        // merge if all components can be merged

        if (!right.important && left.important) {
          right.unused = true;
          continue propertyLoop;
        }

        if (right.important && !left.important) {
          left.unused = true;
          continue;
        }

        for (k = left.components.length - 1; k >= 0; k--) {
          var leftComponent = left.components[k];
          var rightComponent = right.components[k];

          mayOverride = compactable[leftComponent.name].canOverride || canOverride.sameValue;
          if (!mayOverride(leftComponent, rightComponent) || !canOverride.twoOptionalFunctions(leftComponent, rightComponent))
            continue propertyLoop;
        }

        overrideShorthand(left, right);
        left.dirty = true;
      } else if (left.shorthand && right.shorthand && isComponentOf(left, right)) {
        // border is a shorthand but any of its components is a shorthand too

        if (!left.important && right.important)
          continue;

        if (left.important && !right.important) {
          right.unused = true;
          continue;
        }

        var rightRestored = compactable[right.name].restore(right, compactable);
        if (rightRestored.length > 1)
          continue;

        component = left.components.filter(nameMatchFilter(right))[0];
        override(component, right);
        right.dirty = true;
      }
    }
  }
}

module.exports = compactOverrides;
