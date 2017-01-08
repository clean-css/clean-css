var assert = require('assert');

var vows = require('vows');

var rulesOverlap = require('../../../lib/optimizer/level-2/rules-overlap');

vows.describe(rulesOverlap)
  .addBatch({
    'single non-overlapping scopes': {
      'topic': function () {
        return rulesOverlap(
          [['rule-scope', '.one']],
          [['rule-scope', '.two']]
        );
      },
      'do not overlap': function (result) {
        assert.isFalse(result);
      }
    },
    'single overlapping scopes': {
      'topic': function () {
        return rulesOverlap(
          [['rule-scope', '.one']],
          [['rule-scope', '.one']]
        );
      },
      'do overlap': function (result) {
        assert.isTrue(result);
      }
    },
    'multiple non-overlapping scopes': {
      'topic': function () {
        return rulesOverlap(
          [['rule-scope', '.one'], ['rule-scope', '.two .three']],
          [['rule-scope', '.two'], ['rule-scope', '.four']]
        );
      },
      'do not overlap': function (result) {
        assert.isFalse(result);
      }
    },
    'multiple overlapping scopes': {
      'topic': function () {
        return rulesOverlap(
          [['rule-scope', '.one'], ['rule-scope', '.four']],
          [['rule-scope', '.one'], ['rule-scope', '.four']]
        );
      },
      'do overlap': function (result) {
        assert.isTrue(result);
      }
    }
  })
  .addBatch({
    'single non-overlapping BEM scopes in BEM mode': {
      'topic': function () {
        return rulesOverlap(
          [['rule-scope', '.one']],
          [['rule-scope', '.two--modifier']],
          true
        );
      },
      'do overlap': function (result) {
        assert.isFalse(result);
      }
    },
    'single overlapping BEM scopes in BEM mode': {
      'topic': function () {
        return rulesOverlap(
          [['rule-scope', '.one']],
          [['rule-scope', '.one--modifier']],
          true
        );
      },
      'do overlap': function (result) {
        assert.isTrue(result);
      }
    },
    'single overlapping BEM scopes with modifiers in BEM mode': {
      'topic': function () {
        return rulesOverlap(
          [['rule-scope', '.one--modifier1']],
          [['rule-scope', '.one--modifier2']],
          true
        );
      },
      'do overlap': function (result) {
        assert.isTrue(result);
      }
    },
  })
  .export(module);
