var everyCombination = require('./every-combination');
var hasInherit = require('./has-inherit');
var populateComponents = require('./populate-components');

var compactable = require('../compactable');
var deepClone = require('../clone').deep;

var wrapSingle = require('../../wrap-for-optimizing').single;

var Token = require('../../../tokenizer/token');

function mixedImportance(components) {
  var important;

  for (var name in components) {
    if (undefined !== important && components[name].important != important)
      return true;

    important = components[name].important;
  }

  return false;
}

function joinMetadata(components, at) {
  var metadata = [];
  var component;
  var originalValue;
  var componentMetadata;
  var name;

  for (name in components) {
    component = components[name];
    originalValue = component.all[component.position];
    componentMetadata = originalValue[at][originalValue[at].length - 1];

    Array.prototype.push.apply(metadata, componentMetadata);
  }

  return metadata;
}

function replaceWithShorthand(properties, candidateComponents, name, validator) {
  var descriptor = compactable[name];
  var nameMetadata;
  var valueMetadata;
  var newValuePlaceholder = [
    Token.PROPERTY,
    [Token.PROPERTY_NAME, name],
    [Token.PROPERTY_VALUE, descriptor.defaultValue]
  ];
  var all;

  var newProperty = wrapSingle(newValuePlaceholder);
  newProperty.shorthand = true;
  newProperty.dirty = true;

  populateComponents([newProperty], validator, []);

  for (var i = 0, l = descriptor.components.length; i < l; i++) {
    var component = candidateComponents[descriptor.components[i]];
    var canOverride = compactable[component.name].canOverride;

    if (hasInherit(component))
      return;

    if (!everyCombination(canOverride, newProperty.components[i], component, validator))
      return;

    newProperty.components[i] = deepClone(component);
    newProperty.important = component.important;

    all = component.all;
  }

  for (var componentName in candidateComponents) {
    candidateComponents[componentName].unused = true;
  }

  nameMetadata = joinMetadata(candidateComponents, 1);
  newValuePlaceholder[1].push(nameMetadata);

  valueMetadata = joinMetadata(candidateComponents, 2);
  newValuePlaceholder[2].push(valueMetadata);

  newProperty.position = all.length;
  newProperty.all = all;
  newProperty.all.push(newValuePlaceholder);

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

function compactShortands(properties, validator) {
  var candidates = {};

  if (properties.length < 3)
    return;

  for (var i = 0, l = properties.length; i < l; i++) {
    var property = properties[i];
    if (property.unused)
      continue;

    if (property.hack)
      continue;

    if (property.block)
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
