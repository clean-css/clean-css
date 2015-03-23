var shallowClone = require('./shallow-clone');

function background(property, compactable) {
  var components = property.components;
  var restored = [];
  var needsOne, needsBoth;

  function restoreValue(component) {
    Array.prototype.unshift.apply(restored, component.value);
  }

  function isDefaultValue(component) {
    var descriptor = compactable[component.name];
    if (descriptor.doubleValues) {
      if (descriptor.defaultValue.length == 1)
        return component.value[0][0] == descriptor.defaultValue[0] && (component.value[1] ? component.value[1][0] == descriptor.defaultValue[0] : true);
      else
        return component.value[0][0] == descriptor.defaultValue[0] && (component.value[1] ? component.value[1][0] : component.value[0][0]) == descriptor.defaultValue[1];
    } else {
      return component.value[0][0] == descriptor.defaultValue;
    }
  }

  for (var i = components.length - 1; i >= 0; i--) {
    var component = components[i];
    var isDefault = isDefaultValue(component);

    if (component.name == 'background-clip') {
      var originComponent = components[i - 1];
      var isOriginDefault = isDefaultValue(originComponent);

      needsOne = component.value[0][0] == originComponent.value[0][0];

      needsBoth = !needsOne && (
        (isOriginDefault && !isDefault) ||
        (!isOriginDefault && !isDefault) ||
        (!isOriginDefault && isDefault && component.value[0][0] != originComponent.value[0][0]));

      if (needsOne) {
        restoreValue(originComponent);
      } else if (needsBoth) {
        restoreValue(component);
        restoreValue(originComponent);
      }

      i--;
    } else if (component.name == 'background-size') {
      var positionComponent = components[i - 1];
      var isPositionDefault = isDefaultValue(positionComponent);

      needsOne = !isPositionDefault && isDefault;

      needsBoth = !needsOne &&
        (isPositionDefault && !isDefault || !isPositionDefault && !isDefault);

      if (needsOne) {
        restoreValue(positionComponent);
      } else if (needsBoth) {
        restoreValue(component);
        restored.unshift(['/']);
        restoreValue(positionComponent);
      } else if (positionComponent.value.length == 1) {
        restoreValue(positionComponent);
      }

      i--;
    } else {
      if (!isDefault)
        restoreValue(component);
    }
  }

  if (restored.length === 0 && property.value.length == 1 && property.value[0][0] == '0')
    restored.push(property.value[0]);

  if (restored.length === 0)
    restored.push([compactable[property.name].defaultValue]);

  return restored;
}

function borderRadius(property, compactable) {
  if (property.multiplex) {
    var horizontal = shallowClone(property);
    var vertical = shallowClone(property);

    for (var i = 0; i < 4; i++) {
      var component = property.components[i];

      var horizontalComponent = shallowClone(property);
      horizontalComponent.value = component.value[0];
      horizontal.components.push(horizontalComponent);

      var verticalComponent = shallowClone(property);
      verticalComponent.value = component.value[1];
      vertical.components.push(verticalComponent);
    }

    var horizontalValues = fourValues(horizontal, compactable);
    var verticalValues = fourValues(vertical, compactable);

    if (horizontalValues.length == verticalValues.length &&
        horizontalValues[0][0] == verticalValues[0][0] &&
        (horizontalValues.length > 1 ? horizontalValues[1][0] == verticalValues[1][0] : true) &&
        (horizontalValues.length > 2 ? horizontalValues[2][0] == verticalValues[2][0] : true) &&
        (horizontalValues.length > 3 ? horizontalValues[3][0] == verticalValues[3][0] : true)) {
      return horizontalValues;
    } else {
      return horizontalValues.concat([['/']]).concat(verticalValues);
    }
  } else {
    return fourValues(property, compactable);
  }
}

function fourValues(property) {
  var components = property.components;
  var value1 = components[0].value[0];
  var value2 = components[1].value[0];
  var value3 = components[2].value[0];
  var value4 = components[3].value[0];

  if (value1[0] == value2[0] && value1[0] == value3[0] && value1[0] == value4[0]) {
    return [value1];
  } else if (value1[0] == value3[0] && value2[0] == value4[0]) {
    return [value1, value2];
  } else if (value2[0] == value4[0]) {
    return [value1, value2, value3];
  } else {
    return [value1, value2, value3, value4];
  }
}

function multipleValues(restoreWith) {
  return function (property, compactable) {
    if (!property.multiplex)
      return restoreWith(property, compactable);

    var repeatCounts = property.components[0].value.length;
    var restored = [];

    for (var i = 0; i < repeatCounts; i++) {
      var _property = shallowClone(property);

      for (var j = 0, m = property.components.length; j < m; j++) {
        var _component = shallowClone(property.components[j]);
        _component.value = property.components[j].value[i];
        _property.components.push(_component);
      }

      var _restored = restoreWith(_property, compactable);
      Array.prototype.push.apply(restored, _restored);

      if (i < repeatCounts - 1)
        restored.push([',']);
    }

    return restored;
  };
}

function withoutDefaults(property, compactable) {
  var components = property.components;
  var restored = [];

  for (var i = components.length - 1; i >= 0; i--) {
    var component = components[i];
    var descriptor = compactable[component.name];

    if (component.value[0][0] != descriptor.defaultValue)
      restored.unshift(component.value[0]);
  }

  if (restored.length === 0)
    restored.push([compactable[property.name].defaultValue]);

  return restored;
}

module.exports = {
  background: background,
  borderRadius: borderRadius,
  fourValues: fourValues,
  multipleValues: multipleValues,
  withoutDefaults: withoutDefaults
};
