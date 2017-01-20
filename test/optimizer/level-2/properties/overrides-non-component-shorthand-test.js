var assert = require('assert');
var vows = require('vows');

var wrapForOptimizing = require('../../../../lib/optimizer/wrap-for-optimizing').all;
var compatibilityFrom = require('../../../../lib/options/compatibility');
var populateComponents = require('../../../../lib/optimizer/level-2/properties/populate-components');
var validator = require('../../../../lib/optimizer/validator');

var overridesNonComponentShorthand = require('../../../../lib/optimizer/level-2/properties/overrides-non-component-shorthand');

vows.describe(overridesNonComponentShorthand)
  .addBatch({
    'not matching': {
      'topic': function () {
        var left = wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin'],
            ['property-value', '0px']
          ]
        ])[0];
        var right = wrapForOptimizing([
          [
            'property',
            ['property-name', 'padding-top'],
            ['property-value', '0px']
          ]
        ])[0];

        populateComponents([left], validator(compatibilityFrom({})), []);

        return [right, left];
      },
      'is false': function (topic) {
        assert.isFalse(overridesNonComponentShorthand.apply(null, topic));
      }
    },
    'border-color and border-<side>': {
      'topic': function () {
        var left = wrapForOptimizing([
          [
            'property',
            ['property-name', 'border-color'],
            ['property-value', 'red']
          ]
        ])[0];
        var right = wrapForOptimizing([
          [
            'property',
            ['property-name', 'border-top'],
            ['property-value', '1px'],
            ['property-value', 'solid'],
            ['property-value', 'red']
          ]
        ])[0];

        populateComponents([left], validator(compatibilityFrom({})), []);

        return [right, left];
      },
      'is false': function (topic) {
        assert.isFalse(overridesNonComponentShorthand.apply(null, topic));
      }
    },
    'border-<side> and border': {
      'topic': function () {
        var left = wrapForOptimizing([
          [
            'property',
            ['property-name', 'border-top'],
            ['property-value', '1px'],
            ['property-value', 'solid'],
            ['property-value', 'red']
          ]
        ])[0];
        var right = wrapForOptimizing([
          [
            'property',
            ['property-name', 'border'],
            ['property-value', '2px'],
            ['property-value', 'solid'],
            ['property-value', 'blue']
          ]
        ])[0];

        populateComponents([left], validator(compatibilityFrom({})), []);

        return [right, left];
      },
      'is true': function (topic) {
        assert.isTrue(overridesNonComponentShorthand.apply(null, topic));
      }
    }
  })
  .export(module);
