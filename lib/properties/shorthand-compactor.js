var compactable = require('./compactable');
var deepClone = require('./clone').deep;
var populateComponents = require('./populate-components');
var wrapSingle = require('./wrap-for-optimizing').single;

function mixedImportance(components) {
  var important;

  for (var name in components) {
    if (undefined !== important && components[name].important != important)
      return true;

    important = components[name].important;
  }

  return false;
}

function replaceWithShorthand(properties, candidateComponents, name, validator) {
  var descriptor = compactable[name];
  var newValuePlaceholder = [[name, false, false], [descriptor.defaultValue]];
  var all;

  var newProperty = wrapSingle(newValuePlaceholder);
  newProperty.shorthand = true;
  newProperty.dirty = true;

  populateComponents([newProperty], validator);

  for (var i = 0, l = descriptor.components.length; i < l; i++) {
    var component = candidateComponents[descriptor.components[i]];
    var canOverride = compactable[component.name].canOverride;

    if (!canOverride(newProperty.components[i], component, validator))
      return;

    newProperty.components[i] = deepClone(component);
    newProperty.important = component.important;

    all = component.all;
  }

  for (var componentName in candidateComponents) {
    candidateComponents[componentName].unused = true;
  }

  newProperty.position = all.length;
  newProperty.all = all;
  newProperty.all.push(newValuePlaceholder);
  newValuePlaceholder[0][1] = newProperty.important;

  properties.push(newProperty);
}

function invalidateOrCompact(properties, position, candidates, validator) {
  var property = properties[position];

  for (var name in candidates) {
    if (undefined !== property && name == property.name)
      continue;

    var descriptor = compactable[name];
    var candidateComponents = candidates[name];
    if (descriptor.components.length > Object.keys(candidateComponents).length) {
      delete candidates[name];
      continue;
    }

    if (mixedImportance(candidateComponents))
      continue;

    replaceWithShorthand(properties, candidateComponents, name, validator);
  }
}

function compactShortands(properties, compatibility, validator) {
  var candidates = {};

  for (var i = 0, l = properties.length; i < l; i++) {
    var property = properties[i];
    if (property.unused)
      continue;

    var descriptor = compactable[property.name];
    if (!descriptor || !descriptor.componentOf)
      continue;

    if (property.shorthand) {
      invalidateOrCompact(properties, i, candidates, validator);
    } else {
      var componentOf = descriptor.componentOf;
      candidates[componentOf] = candidates[componentOf] || {};
      candidates[componentOf][property.name] = property;
    }
  }

  invalidateOrCompact(properties, i, candidates, validator);
}

module.exports = compactShortands;
