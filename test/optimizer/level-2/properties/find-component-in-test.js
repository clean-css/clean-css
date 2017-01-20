var assert = require('assert');
var vows = require('vows');

var wrapForOptimizing = require('../../../../lib/optimizer/wrap-for-optimizing').all;
var compatibilityFrom = require('../../../../lib/options/compatibility');
var populateComponents = require('../../../../lib/optimizer/level-2/properties/populate-components');
var validator = require('../../../../lib/optimizer/validator');

var findComponentIn = require('../../../../lib/optimizer/level-2/properties/find-component-in');

vows.describe(findComponentIn)
  .addBatch({
    'missing': {
      'topic': function () {
        var shorthand = wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin'],
            ['property-value', '0px']
          ]
        ])[0];
        var longhand = wrapForOptimizing([
          [
            'property',
            ['property-name', 'padding-top'],
            ['property-value', '0px']
          ]
        ])[0];

        populateComponents([shorthand], validator(compatibilityFrom({})), []);

        return [shorthand, longhand];
      },
      'is null': function (topic) {
        assert.isUndefined(findComponentIn.apply(null, topic));
      }
    },
    'present': {
      'topic': function () {
        var shorthand = wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin'],
            ['property-value', '0px']
          ]
        ])[0];
        var longhand = wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin-top'],
            ['property-value', '1px']
          ]
        ])[0];

        populateComponents([shorthand], validator(compatibilityFrom({})), []);

        return [shorthand, longhand];
      },
      'is null': function (topic) {
        assert.equal(findComponentIn.apply(null, topic).name, 'margin-top');
        assert.deepEqual(findComponentIn.apply(null, topic).value, [['property-value', '0px']]);
      }
    },
    'subcomponent': {
      'topic': function () {
        var shorthand = wrapForOptimizing([
          [
            'property',
            ['property-name', 'border'],
            ['property-value', '1px'],
            ['property-value', 'solid'],
            ['property-value', 'red']
          ]
        ])[0];
        var longhand = wrapForOptimizing([
          [
            'property',
            ['property-name', 'border-left-style'],
            ['property-value', 'dotted']
          ]
        ])[0];

        populateComponents([shorthand], validator(compatibilityFrom({})), []);

        return [shorthand, longhand];
      },
      'is null': function (topic) {
        assert.equal(findComponentIn.apply(null, topic).name, 'border-left-style');
        assert.deepEqual(findComponentIn.apply(null, topic).value, [['property-value', 'solid']]);
      }
    }
  })
  .export(module);
