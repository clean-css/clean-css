var canOverride = require('./can-override');
var compactable = require('./compactable');
var shallowClone = require('./shallow-clone');

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

function overrideSimple(property, by) {
  by.unused = true;
  property.value = by.value;
}

function overrideMultiplex(property, by) {
  by.unused = true;

  for (var i = 0; i < property.value.length; i++) {
    property.value[i] = by.value;
  }
}

function override(property, by) {
  if (property.multiplex)
    overrideMultiplex(property, by);
  else
    overrideSimple(property, by);
}

function overrideShorthand(property, by) {
  by.unused = true;

  for (var i = 0, l = property.components.length; i < l; i++) {
    override(property.components[i], by.components[i]);
  }
}

function hasInherits(property) {
  for (var i = property.value.length - 1; i >= 0; i--) {
    if (property.value[i] == 'inherit')
      return true;
  }

  return false;
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

      if (!left.shorthand && right.shorthand && isComponentOf(right, left)) {
        // maybe `left` can be overridden by `right` which is a shorthand?
        // TODO: this is actually more complex, as in some cases it's better to incorporate the value, e.g.
        // background:url(...); background-repeat:no-repeat,no-repeat;
        // background:url(...) no-repeat,no-repeat;
        if (!right.multiplex && left.multiplex)
          continue;

        if (!right.important && left.important)
          continue;

        component = right.components.filter(nameMatchFilter(left))[0];
        mayOverride = (compactable[left.name] && compactable[left.name].canOverride) || canOverride.sameValue;
        if (mayOverride(left, component)) {
          left.unused = true;
        }
      } else if (left.shorthand && !right.shorthand && isComponentOf(left, right)) {
        // maybe `right` can be pulled into `left` which is a shorthand?
        // TODO - see above
        if (right.multiplex && !left.multiplex)
          continue;

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
      }
    }
  }
}

module.exports = compactOverrides;
