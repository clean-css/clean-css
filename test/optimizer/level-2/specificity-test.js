var assert = require('assert');

var vows = require('vows');

var specificity = require('../../../lib/optimizer/level-2/specificity');

vows.describe(specificity)
  .addBatch({
    'id selector': {
      'topic': '#id',
      'must be correct': function (selector) {
        assert.deepEqual(specificity(selector), [1, 0, 0]);
      }
    },
    'class selector': {
      'topic': '.block',
      'must be correct': function (selector) {
        assert.deepEqual(specificity(selector), [0, 1, 0]);
      }
    },
    'type selector': {
      'topic': 'div',
      'must be correct': function (selector) {
        assert.deepEqual(specificity(selector), [0, 0, 1]);
      }
    },
    'mixed': {
      'topic': 'div#id .block',
      'must be correct': function (selector) {
        assert.deepEqual(specificity(selector), [1, 1, 1]);
      }
    },
    'descendant rule': {
      'topic': 'div>span',
      'must be correct': function (selector) {
        assert.deepEqual(specificity(selector), [0, 0, 2]);
      }
    },
    'adjacent sibling rule': {
      'topic': 'div+span',
      'must be correct': function (selector) {
        assert.deepEqual(specificity(selector), [0, 0, 2]);
      }
    },
    'non-adjacent sibling rule': {
      'topic': 'div~span',
      'must be correct': function (selector) {
        assert.deepEqual(specificity(selector), [0, 0, 2]);
      }
    },
    'escaped': {
      'topic': 'div\\#id',
      'must be correct': function (selector) {
        assert.deepEqual(specificity(selector), [0, 0, 1]);
      }
    },
    'attributes': {
      'topic': 'div[data-id]',
      'must be correct': function (selector) {
        assert.deepEqual(specificity(selector), [0, 1, 1]);
      }
    },
    'quoted': {
      'topic': 'div[data-query="[#id]"]',
      'must be correct': function (selector) {
        assert.deepEqual(specificity(selector), [0, 1, 1]);
      }
    },
    'quoted relation': {
      'topic': 'div[data-query=">id"]',
      'must be correct': function (selector) {
        assert.deepEqual(specificity(selector), [0, 1, 1]);
      }
    },
    'pseudo class': {
      'topic': '.block:before:hover',
      'must be correct': function (selector) {
        assert.deepEqual(specificity(selector), [0, 3, 0]);
      }
    },
    'pseudo element': {
      'topic': '.block::before',
      'must be correct': function (selector) {
        assert.deepEqual(specificity(selector), [0, 2, 0]);
      }
    },
    ':not': {
      'topic': '.block:not()',
      'must be correct': function (selector) {
        assert.deepEqual(specificity(selector), [0, 1, 0]);
      }
    },
    ':not with type selector': {
      'topic': '.block:not(h1)',
      'must be correct': function (selector) {
        assert.deepEqual(specificity(selector), [0, 1, 1]);
      }
    },
    ':not with class selector': {
      'topic': '.block-1:not(.block-2)',
      'must be correct': function (selector) {
        assert.deepEqual(specificity(selector), [0, 2, 0]);
      }
    },
    ':not with id selector': {
      'topic': '.block-1:not(#id)',
      'must be correct': function (selector) {
        assert.deepEqual(specificity(selector), [1, 1, 0]);
      }
    },
    ':not with many selectors': {
      'topic': '.block-1:not(#id,.block,h1)',
      'must be correct': function (selector) {
        assert.deepEqual(specificity(selector), [1, 2, 1]);
      }
    },
    ':nth-child': {
      'topic': '.block-1:nth-child(odd)',
      'must be correct': function (selector) {
        assert.deepEqual(specificity(selector), [0, 2, 0]);
      }
    }
  })
  .export(module);
