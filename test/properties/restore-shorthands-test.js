var vows = require('vows');
var assert = require('assert');

var wrapForOptimizing = require('../../lib/properties/wrap-for-optimizing').all;
var populateComponents = require('../../lib/properties/populate-components');

var restoreShorthands = require('../../lib/properties/restore-shorthands');

vows.describe(restoreShorthands)
  .addBatch({
    'longhands': {
      'topic': function () {
        var properties = ['/*comment */', [['margin-top', false, false], ['0']]];
        var _properties = wrapForOptimizing(properties);
        populateComponents(_properties);
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
        populateComponents(_properties);

        properties[1].pop();
        _properties[0].dirty = true;

        restoreShorthands(_properties);
        return properties;
      },
      'is same as source': function (properties) {
        assert.deepEqual(properties, ['/*comment */', [['background', false, false], ['url(image.png)']]]);
      }
    }
  })
  .export(module);
