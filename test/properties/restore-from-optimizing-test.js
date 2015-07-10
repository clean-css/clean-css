var vows = require('vows');
var assert = require('assert');

var wrapForOptimizing = require('../../lib/properties/wrap-for-optimizing').all;
var populateComponents = require('../../lib/properties/populate-components');
var shallowClone = require('../../lib/properties/clone').shallow;

var restoreFromOptimizing = require('../../lib/properties/restore-from-optimizing');

var Compatibility = require('../../lib/utils/compatibility');
var Validator = require('../../lib/properties/validator');

var validator = new Validator(new Compatibility().toOptions());

vows.describe(restoreFromOptimizing)
  .addBatch({
    'without descriptor': {
      'topic': function () {
        var properties = [[['margin-top'], ['0']]];
        var _properties = wrapForOptimizing(properties);
        restoreFromOptimizing(_properties);

        return properties;
      },
      'is same as source': function (properties) {
        assert.deepEqual(properties, [[['margin-top'], ['0']]]);
      }
    },
    'with changed value but without descriptor': {
      'topic': function () {
        var properties = [[['margin-top'], ['0']]];
        var _properties = wrapForOptimizing(properties);
        _properties[0].value = [['1px']];
        _properties[0].dirty = true;
        restoreFromOptimizing(_properties);

        return properties;
      },
      'has right output': function (properties) {
        assert.deepEqual(properties, [[['margin-top'], ['1px']]]);
      }
    },
    'longhands': {
      'topic': function () {
        var properties = ['/*comment */', [['margin-top'], ['0']]];
        var _properties = wrapForOptimizing(properties);
        populateComponents(_properties, validator);
        restoreFromOptimizing(_properties);

        return properties;
      },
      'is same as source': function (properties) {
        assert.deepEqual(properties, ['/*comment */', [['margin-top'], ['0']]]);
      }
    },
    'shorthands': {
      'topic': function () {
        var properties = ['/*comment */', [['background'], ['url(image.png)']]];
        var _properties = wrapForOptimizing(properties);
        populateComponents(_properties, validator);

        properties[1].pop();
        _properties[0].dirty = true;

        restoreFromOptimizing(_properties);
        return properties;
      },
      'is same as source': function (properties) {
        assert.deepEqual(properties, ['/*comment */', [['background'], ['url(image.png)']]]);
      }
    },
    'shorthands in simple mode': {
      'topic': function () {
        var properties = [[['margin'], ['1px'], ['2px']]];
        var _properties = wrapForOptimizing(properties);

        _properties[0].dirty = true;

        restoreFromOptimizing(_properties, true);
        return properties;
      },
      'is same as source': function (properties) {
        assert.deepEqual(properties, [[['margin'], ['1px'], ['2px']]]);
      }
    },
    'values': {
      'topic': function () {
        var properties = [[['background'], ['url(image.png)']]];
        var _properties = wrapForOptimizing(properties);
        populateComponents(_properties, validator);

        _properties[0].value = [];
        _properties[0].dirty = true;

        restoreFromOptimizing(_properties);
        return _properties;
      },
      'updates value': function (_properties) {
        assert.deepEqual(_properties[0].value, [['url(image.png)']]);
      }
    },
    'in cloned without reference to `all`': {
      'topic': function () {
        var properties = [[['background'], ['url(image.png)']]];
        var _properties = wrapForOptimizing(properties);
        populateComponents(_properties, validator);

        var cloned = shallowClone(_properties[0]);
        cloned.components = _properties[0].components;
        cloned.dirty = true;

        restoreFromOptimizing([cloned]);
        return cloned;
      },
      'does not fail': function (cloned) {
        assert.deepEqual(cloned.value, [['url(image.png)']]);
      }
    }
  })
  .addBatch({
    'important': {
      'topic': function () {
        var properties = [[['color'], ['red!important']]];
        var _properties = wrapForOptimizing(properties);

        restoreFromOptimizing(_properties, true);
        return properties;
      },
      'restores important': function (properties) {
        assert.deepEqual(properties, [[['color'], ['red!important']]]);
      }
    },
    'underscore hack': {
      'topic': function () {
        var properties = [[['_color'], ['red']]];
        var _properties = wrapForOptimizing(properties);

        restoreFromOptimizing(_properties, true);
        return properties;
      },
      'restores hack': function (properties) {
        assert.deepEqual(properties, [[['_color'], ['red']]]);
      }
    },
    'star hack': {
      'topic': function () {
        var properties = [[['*color'], ['red']]];
        var _properties = wrapForOptimizing(properties);

        restoreFromOptimizing(_properties, true);
        return properties;
      },
      'restores hack': function (properties) {
        assert.deepEqual(properties, [[['*color'], ['red']]]);
      }
    },
    'suffix hack': {
      'topic': function () {
        var properties = [[['color'], ['red\\9']]];
        var _properties = wrapForOptimizing(properties);

        restoreFromOptimizing(_properties, true);
        return properties;
      },
      'restores hack': function (properties) {
        assert.deepEqual(properties, [[['color'], ['red\\9']]]);
      }
    }
  })
  .export(module);
