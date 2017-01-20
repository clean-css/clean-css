var assert = require('assert');
var vows = require('vows');

var compatibilityFrom = require('../../../../lib/options/compatibility');
var validator = require('../../../../lib/optimizer/validator');

var understandable = require('../../../../lib/optimizer/level-2/properties/understandable');

vows.describe(understandable)
  .addBatch({
    'same vendor prefixes': {
      'topic': function () {
        return [validator(compatibilityFrom({})), '-moz-calc(100% / 2)', '-moz-calc(50% / 2)', 0, true];
      },
      'is understandable': function (topic) {
        assert.isTrue(understandable.apply(null, topic));
      }
    },
    'different vendor prefixes': {
      'topic': function () {
        return [validator(compatibilityFrom({})), '-moz-calc(100% / 2)', 'calc(50% / 2)', 0, true];
      },
      'is not understandable': function (topic) {
        assert.isFalse(understandable.apply(null, topic));
      }
    },
    'different vendor prefixes when comparing non-pair values': {
      'topic': function () {
        return [validator(compatibilityFrom({})), '-moz-calc(100% / 2)', 'calc(50% / 2)', 0, false];
      },
      'is not understandable': function (topic) {
        assert.isFalse(understandable.apply(null, topic));
      }
    },
    'variables': {
      'topic': function () {
        return [validator(compatibilityFrom({})), 'var(--x)', 'var(--y)', 0, true];
      },
      'is understandable': function (topic) {
        assert.isTrue(understandable.apply(null, topic));
      }
    },
    'variable and value': {
      'topic': function () {
        return [validator(compatibilityFrom({})), 'var(--x)', 'block', 0, true];
      },
      'is not understandable': function (topic) {
        assert.isFalse(understandable.apply(null, topic));
      }
    },
    'variable and value when comparing non-pair values': {
      'topic': function () {
        return [validator(compatibilityFrom({})), 'var(--x)', 'block', 0, false];
      },
      'is understandable': function (topic) {
        assert.isTrue(understandable.apply(null, topic));
      }
    }
  })
  .export(module);
