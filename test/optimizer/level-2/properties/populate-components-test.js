var assert = require('assert');
var vows = require('vows');

var wrapForOptimizing = require('../../../../lib/optimizer/wrap-for-optimizing').all;
var compatibilityFrom = require('../../../../lib/options/compatibility');
var validator = require('../../../../lib/optimizer/validator');

var populateComponents = require('../../../../lib/optimizer/level-2/properties/populate-components');

vows.describe(populateComponents)
  .addBatch({
    'shorthand': {
      'topic': function () {
        var wrapped = wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin'],
            ['property-value', '0px'],
            ['property-value', '1px'],
            ['property-value', '2px'],
            ['property-value', '3px']
          ]
        ]);

        populateComponents(wrapped, validator(compatibilityFrom({})), []);
        return wrapped;
      },
      'has one': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'becomes shorthand': function (wrapped) {
        assert.isTrue(wrapped[0].shorthand);
      },
      'is dirty': function (wrapped) {
        assert.isTrue(wrapped[0].dirty);
      },
      'gets 4 components': function (wrapped) {
        assert.lengthOf(wrapped[0].components, 4);
      },
      'gets a margin-top': function (wrapped) {
        assert.deepEqual(wrapped[0].components[0].name, 'margin-top');
        assert.deepEqual(wrapped[0].components[0].value, [['property-value', '0px']]);
      },
      'gets a margin-right': function (wrapped) {
        assert.deepEqual(wrapped[0].components[1].name, 'margin-right');
        assert.deepEqual(wrapped[0].components[1].value, [['property-value', '1px']]);
      },
      'gets a margin-bottom': function (wrapped) {
        assert.deepEqual(wrapped[0].components[2].name, 'margin-bottom');
        assert.deepEqual(wrapped[0].components[2].value, [['property-value', '2px']]);
      },
      'gets a margin-left': function (wrapped) {
        assert.deepEqual(wrapped[0].components[3].name, 'margin-left');
        assert.deepEqual(wrapped[0].components[3].value, [['property-value', '3px']]);
      }
    },
    'shorthand with shorthand components': {
      'topic': function () {
        var wrapped = wrapForOptimizing([
          [
            'property',
            ['property-name', 'border'],
            ['property-value', '1px'],
            ['property-value', 'solid'],
            ['property-value', 'red']
          ]
        ]);

        populateComponents(wrapped, validator(compatibilityFrom({})), []);
        return wrapped;
      },
      'has one': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'becomes shorthand': function (wrapped) {
        assert.isTrue(wrapped[0].shorthand);
      },
      'is dirty': function (wrapped) {
        assert.isTrue(wrapped[0].dirty);
      },
      'gets 3 components': function (wrapped) {
        assert.lengthOf(wrapped[0].components, 3);
      },
      'gets a border-width with subcomponents': function (wrapped) {
        assert.deepEqual(wrapped[0].components[0].name, 'border-width');
        assert.deepEqual(wrapped[0].components[0].value, [
          ['property-value', '1px'],
          ['property-value', '1px'],
          ['property-value', '1px'],
          ['property-value', '1px']
        ]);

        assert.lengthOf(wrapped[0].components[0].components, 4);
        assert.deepEqual(wrapped[0].components[0].components.map(function (c) { return c.name; }), [
          'border-top-width',
          'border-right-width',
          'border-bottom-width',
          'border-left-width'
        ]);
      },
      'gets a border-style': function (wrapped) {
        assert.deepEqual(wrapped[0].components[1].name, 'border-style');
        assert.deepEqual(wrapped[0].components[1].value, [
          ['property-value', 'solid'],
          ['property-value', 'solid'],
          ['property-value', 'solid'],
          ['property-value', 'solid']
        ]);

        assert.lengthOf(wrapped[0].components[1].components, 4);
        assert.deepEqual(wrapped[0].components[1].components.map(function (c) { return c.name; }), [
          'border-top-style',
          'border-right-style',
          'border-bottom-style',
          'border-left-style'
        ]);
      },
      'gets a border-color': function (wrapped) {
        assert.deepEqual(wrapped[0].components[2].name, 'border-color');
        assert.deepEqual(wrapped[0].components[2].value, [
          ['property-value', 'red'],
          ['property-value', 'red'],
          ['property-value', 'red'],
          ['property-value', 'red']
        ]);

        assert.lengthOf(wrapped[0].components[2].components, 4);
        assert.deepEqual(wrapped[0].components[2].components.map(function (c) { return c.name; }), [
          'border-top-color',
          'border-right-color',
          'border-bottom-color',
          'border-left-color'
        ]);
      }
    },
    'longhand': {
      'topic': function () {
        var wrapped = wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin-top'],
            ['property-value', '0px']
          ]
        ]);

        populateComponents(wrapped, validator(compatibilityFrom({})), []);
        return wrapped;
      },
      'has one': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'gets no components': function (wrapped) {
        assert.isEmpty(wrapped[0].components);
      }
    },
    'no value': {
      'topic': function () {
        var wrapped = wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin']
          ]
        ]);

        populateComponents(wrapped, validator(compatibilityFrom({})), []);
        return wrapped;
      },
      'has one': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'is unused': function (wrapped) {
        assert.isTrue(wrapped[0].unused);
      }
    }
  })
  .export(module);
