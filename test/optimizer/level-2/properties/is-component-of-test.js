var assert = require('assert');
var vows = require('vows');

var wrapForOptimizing = require('../../../../lib/optimizer/wrap-for-optimizing').all;
var compatibilityFrom = require('../../../../lib/options/compatibility');
var populateComponents = require('../../../../lib/optimizer/level-2/properties/populate-components');
var validator = require('../../../../lib/optimizer/validator');

var isComponentOf = require('../../../../lib/optimizer/level-2/properties/is-component-of');

vows.describe(isComponentOf)
  .addBatch({
    'not matching': {
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
      'longhand is not a component of shorthand': function (topic) {
        assert.isFalse(isComponentOf.apply(null, topic));
      },
      'shorthand is not a component of longhand': function (topic) {
        assert.isFalse(isComponentOf.apply(null, topic.reverse()));
      }
    },
   'matching': {
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
            ['property-value', '0px']
          ]
        ])[0];

        populateComponents([shorthand], validator(compatibilityFrom({})), []);

        return [shorthand, longhand];
      },
      'longhand is a component of shorthand': function (topic) {
        assert.isTrue(isComponentOf.apply(null, topic));
      },
      'shorthand is not a component of longhand': function (topic) {
        assert.isFalse(isComponentOf.apply(null, topic.reverse()));
      }
    },
   'subcomponents': {
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
            ['property-name', 'border-left-color'],
            ['property-value', 'blue']
          ]
        ])[0];

        populateComponents([shorthand], validator(compatibilityFrom({})), []);

        return [shorthand, longhand];
      },
      'longhand is a component of shorthand': function (topic) {
        assert.isTrue(isComponentOf.apply(null, topic));
      },
      'shorthand is not a component of longhand': function (topic) {
        assert.isFalse(isComponentOf.apply(null, topic.reverse()));
      }
    },
   'subcomponents in shallow mode': {
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
            ['property-name', 'border-left-color'],
            ['property-value', 'blue']
          ]
        ])[0];

        populateComponents([shorthand], validator(compatibilityFrom({})), []);

        return [shorthand, longhand, true];
      },
      'longhand is not a component of shorthand': function (topic) {
        assert.isFalse(isComponentOf.apply(null, topic));
      }
    }
  })
  .export(module);
