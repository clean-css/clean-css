var assert = require('assert');

var vows = require('vows');

var isMergeable = require('../../lib/optimizer/is-mergeable');
var mergeablePseudoClasses = [':after'];
var mergeablePseudoElements = ['::before'];

vows.describe(isMergeable)
  .addBatch({
    'tag name selector': {
      'topic': 'div',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'class selector': {
      'topic': '.class',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'id selector': {
      'topic': '#id',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'complex selector': {
      'topic': 'div ~ #id > .class',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'vendor-prefixed pseudo-class': {
      'topic': ':-moz-placeholder',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'vendor-prefixed pseudo-element': {
      'topic': '::-moz-placeholder',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'unsupported pseudo-class': {
      'topic': ':first-child',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'unsupported pseudo-element': {
      'topic': '::marker',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'supported pseudo-class': {
      'topic': ':after',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'supported pseudo-class with selector': {
      'topic': 'div:after',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'supported pseudo-class with arguments': {
      'topic': 'div:lang(en)',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, [':lang'], mergeablePseudoElements));
      }
    },
    'supported pseudo-class in the middle': {
      'topic': 'div :first-child > span',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, [':first-child'], mergeablePseudoElements));
      }
    },
    'supported pseudo-classes in the middle': {
      'topic': 'div :first-child > span:last-child > em',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, [':first-child', ':last-child'], mergeablePseudoElements));
      }
    },
    'supported pseudo-classes in the middle without spaces': {
      'topic': 'div :first-child>span:last-child>em',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, [':first-child', ':last-child'], mergeablePseudoElements));
      }
    },
    'double :not pseudo-class': {
      'topic': 'div:not(:first-child):not(.one)',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, [':first-child', ':not'], mergeablePseudoElements));
      }
    },
    'supported pseudo-class with unsupported arguments': {
      'topic': 'div:after(test)',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'supported pseudo-class repeated': {
      'topic': 'div:after:after',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'supported pseudo-element': {
      'topic': '::before',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'supported pseudo-element with selector': {
      'topic': 'div::before',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'supported pseudo-element with arguments': {
      'topic': '::before(test)',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'supported pseudo-element repeated': {
      'topic': '::before::before',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'supported pseudo-class and -element mixed': {
      'topic': ':after::before',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'supported pseudo-element and -class mixed': {
      'topic': '::before:after',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    '/deep/ selector': {
      'topic': '.wrapper /deep/ a',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'empty selector': {
      'topic': '',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'multi selector': {
      'topic': 'h1,div',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'multi selector with pseudo-class': {
      'topic': 'h1:first-child,div',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    },
    'multi selector with empty': {
      'topic': ',h1',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements));
      }
    }
  })
  .export(module);
