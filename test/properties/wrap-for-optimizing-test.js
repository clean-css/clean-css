var vows = require('vows');
var assert = require('assert');

var wrapForOptimizing = require('../../lib/properties/wrap-for-optimizing').all;

vows.describe(wrapForOptimizing)
  .addBatch({
    'one': {
      'topic': function () {
        return wrapForOptimizing([[['margin', false, false], ['0'], ['0']]]);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has name': function (wrapped) {
        assert.deepEqual(wrapped[0].name, 'margin');
      },
      'has value': function (wrapped) {
        assert.deepEqual(wrapped[0].value, [['0'], ['0']]);
      },
      'has no components': function (wrapped) {
        assert.lengthOf(wrapped[0].components, 0);
      },
      'is not important': function (wrapped) {
        assert.isFalse(wrapped[0].important);
      },
      'is not dirty': function (wrapped) {
        assert.isFalse(wrapped[0].dirty);
      },
      'is not a shorthand': function (wrapped) {
        assert.isFalse(wrapped[0].shorthand);
      },
      'is unused': function (wrapped) {
        assert.isFalse(wrapped[0].unused);
      },
      'is hack': function (wrapped) {
        assert.isFalse(wrapped[0].hack);
      },
      'is multiplex': function (wrapped) {
        assert.isFalse(wrapped[0].multiplex);
      }
    },
    'two': {
      'topic': function () {
        return wrapForOptimizing([[['margin', false, false], ['0'], ['0']], [['color', true, true], ['red']]]);
      },
      'has two wraps': function (wrapped) {
        assert.lengthOf(wrapped, 2);
      },
      'marks second as important': function (wrapped) {
        assert.isTrue(wrapped[1].important);
      },
      'marks second as a hack': function (wrapped) {
        assert.isTrue(wrapped[1].hack);
      }
    },
    'with comments': {
      'topic': function () {
        return wrapForOptimizing([['/* comment */'], [['color', true, true], ['red']]]);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'sets position correctly': function (wrapped) {
        assert.equal(wrapped[0].position, 1);
      }
    },
    'longhand': {
      'topic': function () {
        return wrapForOptimizing([[['border-radius-top-left', false, false], ['1px'], ['/'], ['2px']]]);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has name': function (wrapped) {
        assert.deepEqual(wrapped[0].name, 'border-radius-top-left');
      },
      'has value': function (wrapped) {
        assert.deepEqual(wrapped[0].value, [['1px'], ['/'], ['2px']]);
      },
      'is multiplex': function (wrapped) {
        assert.isTrue(wrapped[0].multiplex);
      }
    },
    'without value': {
      'topic': function () {
        return wrapForOptimizing([[['margin', false, false]]]);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'is unused': function (wrapped) {
        assert.isTrue(wrapped[0].unused);
      }
    },
    'hack': {
      'topic': function () {
        return wrapForOptimizing([[['margin', false, 'suffix']]]);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'is a hack': function (wrapped) {
        assert.equal(wrapped[0].hack, 'suffix');
      }
    }
  })
  .export(module);
