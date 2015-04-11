var vows = require('vows');
var assert = require('assert');

var wrapForOptimizing = require('../../lib/properties/wrap-for-optimizing').all;
var populateComponents = require('../../lib/properties/populate-components');
var shallowClone = require('../../lib/properties/clone').shallow;

var restoreShorthands = require('../../lib/properties/restore-shorthands');

var Compatibility = require('../../lib/utils/compatibility');
var Validator = require('../../lib/properties/validator');

var validator = new Validator(new Compatibility().toOptions());

vows.describe(restoreShorthands)
  .addBatch({
    'longhands': {
      'topic': function () {
        var properties = ['/*comment */', [['margin-top', false, false], ['0']]];
        var _properties = wrapForOptimizing(properties);
        populateComponents(_properties, validator);
        restoreShorthands(_properties);

        return properties;
      },
      'is same as source': function (properties) {
        assert.deepEqual(properties, ['/*comment */', [['margin-top', false, false], ['0']]]);
      }
    },
    'shorthands': {
      'topic': function () {
        var properties = ['/*comment */', [['background', false, false], ['url(image.png)']]];
        var _properties = wrapForOptimizing(properties);
        populateComponents(_properties, validator);

        properties[1].pop();
        _properties[0].dirty = true;

        restoreShorthands(_properties);
        return properties;
      },
      'is same as source': function (properties) {
        assert.deepEqual(properties, ['/*comment */', [['background', false, false], ['url(image.png)']]]);
      }
    },
    'values': {
      'topic': function () {
        var properties = [[['background', false, false], ['url(image.png)']]];
        var _properties = wrapForOptimizing(properties);
        populateComponents(_properties, validator);

        _properties[0].value = [];
        _properties[0].dirty = true;

        restoreShorthands(_properties);
        return _properties;
      },
      'updates value': function (_properties) {
        assert.deepEqual(_properties[0].value, [['url(image.png)']]);
      }
    },
    'in cloned without reference to `all`': {
      'topic': function () {
        var properties = [[['background', false, false], ['url(image.png)']]];
        var _properties = wrapForOptimizing(properties);
        populateComponents(_properties, validator);

        var cloned = shallowClone(_properties[0]);
        cloned.components = _properties[0].components;
        cloned.dirty = true;

        restoreShorthands([cloned]);
        return cloned;
      },
      'does not fail': function (cloned) {
        assert.deepEqual(cloned.value, [['url(image.png)']]);
      }
    }
  })
  .export(module);
