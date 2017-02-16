var assert = require('assert');

var vows = require('vows');

var isMergeable = require('../../../lib/optimizer/level-2/is-mergeable');

var mergeablePseudoClasses = [':after'];
var mergeablePseudoElements = ['::before'];

vows.describe(isMergeable)
  .addBatch({
    'tag name selector': {
      'topic': 'div',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'class selector': {
      'topic': '.class',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'id selector': {
      'topic': '#id',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'complex selector': {
      'topic': 'div ~ #id > .class',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'vendor-prefixed pseudo-class': {
      'topic': ':-moz-placeholder',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'vendor-prefixed pseudo-element': {
      'topic': '::-moz-placeholder',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'vendor-prefixed pseudo-class as descendant of attribute rule': {
      'topic': '[data-x="y"] :-moz-placeholder',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'vendor-prefixed pseudo-element as descendant of attribute rule': {
      'topic': '[data-x="y"] ::-moz-placeholder',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'unsupported pseudo-class': {
      'topic': ':first-child',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'unsupported pseudo-element': {
      'topic': '::marker',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'supported pseudo-class': {
      'topic': ':after',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'supported pseudo-class with selector': {
      'topic': 'div:after',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'supported pseudo-class with arguments': {
      'topic': 'div:lang(en)',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, [':lang'], mergeablePseudoElements, true));
      }
    },
    'supported pseudo-class in the middle': {
      'topic': 'div :first-child > span',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, [':first-child'], mergeablePseudoElements, true));
      }
    },
    'supported pseudo-classes in the middle': {
      'topic': 'div :first-child > span:last-child > em',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, [':first-child', ':last-child'], mergeablePseudoElements, true));
      }
    },
    'supported pseudo-classes in the middle without spaces': {
      'topic': 'div :first-child>span:last-child>em',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, [':first-child', ':last-child'], mergeablePseudoElements, true));
      }
    },
    'double :not pseudo-class': {
      'topic': 'div:not(:first-child):not(.one)',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, [':first-child', ':not'], mergeablePseudoElements, true));
      }
    },
    'supported pseudo-class with unsupported arguments': {
      'topic': 'div:after(test)',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'supported pseudo-class repeated': {
      'topic': 'div:after:after',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'supported pseudo-element': {
      'topic': '::before',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'supported pseudo-element with selector': {
      'topic': 'div::before',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'supported pseudo-element with arguments': {
      'topic': '::before(test)',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'supported pseudo-element repeated': {
      'topic': '::before::before',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'supported pseudo-class and -element mixed': {
      'topic': ':after::before',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'supported pseudo-element and -class mixed': {
      'topic': '::before:after',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'supported mixable pseudo classes / elements': {
      'topic': ':hover::after',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, [':hover'], ['::after'], true));
      }
    },
    'supported unmixable pseudo classes': {
      'topic': ':first-line:before',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, [':before', ':first-line'], [], true));
      }
    },
    'supported unmixable pseudo elements': {
      'topic': '::first-line::before',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, [], ['::before', '::first-line'], true));
      }
    },
    '/deep/ selector': {
      'topic': '.wrapper /deep/ a',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'empty selector': {
      'topic': '',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'multi selector': {
      'topic': 'h1,div',
      'is mergeable': function (selector) {
        assert.isTrue(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'multi selector with pseudo-class': {
      'topic': 'h1:first-child,div',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    },
    'multi selector with empty': {
      'topic': ',h1',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, mergeablePseudoClasses, mergeablePseudoElements, true));
      }
    }
  })
  .addBatch({
    'pseudo-classes with disabled mixed merging': {
      'topic': ':first-child:before',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, [':before', ':first-child'], [], false));
      }
    },
    'pseudo-classes and -elements with disabled mixed merging': {
      'topic': ':hover::before',
      'is not mergeable': function (selector) {
        assert.isFalse(isMergeable(selector, [':hover'], ['::before'], false));
      }
    }
  })
  .export(module);
