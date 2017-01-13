var assert = require('assert');

var vows = require('vows');

var formatFrom = require('../../lib/options/format').formatFrom;

vows.describe(formatFrom)
  .addBatch({
    'undefined': {
      'topic': function () {
        return formatFrom(undefined);
      },
      'is false': function (formatOptions) {
        assert.deepEqual(formatOptions, false);
      }
    },
    'false': {
      'topic': function () {
        return formatFrom(false);
      },
      'is false': function (formatOptions) {
        assert.deepEqual(formatOptions, false);
      }
    },
    'true': {
      'topic': function () {
        return formatFrom(true);
      },
      'is default': function (formatOptions) {
        assert.deepEqual(formatOptions, {
          breaks: {
            afterAtRule: true,
            afterBlockBegins: true,
            afterBlockEnds: true,
            afterComment: true,
            afterProperty: true,
            afterRuleBegins: true,
            afterRuleEnds: true,
            beforeBlockEnds: true,
            betweenSelectors: true
          },
          indentBy: 2,
          indentWith: ' ',
          spaces: {
            aroundSelectorRelation: true,
            beforeBlockBegins: true,
            beforeValue: true
          }
        });
      }
    },
    'hash': {
      'topic': function () {
        return formatFrom({ breaks: { afterProperty: false }, indentBy: 1 });
      },
      'is merged with default': function (formatOptions) {
        assert.deepEqual(formatOptions, {
          breaks: {
            afterAtRule: true,
            afterBlockBegins: true,
            afterBlockEnds: true,
            afterComment: true,
            afterProperty: false,
            afterRuleBegins: true,
            afterRuleEnds: true,
            beforeBlockEnds: true,
            betweenSelectors: true
          },
          indentBy: 1,
          indentWith: ' ',
          spaces: {
            aroundSelectorRelation: true,
            beforeBlockBegins: true,
            beforeValue: true
          }
        });
      }
    },
    'hash with indentBy as string': {
      'topic': function () {
        return formatFrom({ indentBy: '2' });
      },
      'is merged with default': function (formatOptions) {
        assert.deepEqual(formatOptions, {
          breaks: {
            afterAtRule: true,
            afterBlockBegins: true,
            afterBlockEnds: true,
            afterComment: true,
            afterProperty: true,
            afterRuleBegins: true,
            afterRuleEnds: true,
            beforeBlockEnds: true,
            betweenSelectors: true
          },
          indentBy: 2,
          indentWith: ' ',
          spaces: {
            aroundSelectorRelation: true,
            beforeBlockBegins: true,
            beforeValue: true
          }
        });
      }
    },
    'hash with explicit indentWith': {
      'topic': function () {
        return formatFrom({ indentWith: '\t' });
      },
      'is merged with default': function (formatOptions) {
        assert.deepEqual(formatOptions, {
          breaks: {
            afterAtRule: true,
            afterBlockBegins: true,
            afterBlockEnds: true,
            afterComment: true,
            afterProperty: true,
            afterRuleBegins: true,
            afterRuleEnds: true,
            beforeBlockEnds: true,
            betweenSelectors: true
          },
          indentBy: 2,
          indentWith: '\t',
          spaces: {
            aroundSelectorRelation: true,
            beforeBlockBegins: true,
            beforeValue: true
          }
        });
      }
    },
    'hash with implicit indentWith': {
      'topic': function () {
        return formatFrom({ indentWith: 'tab' });
      },
      'is merged with default': function (formatOptions) {
        assert.deepEqual(formatOptions, {
          breaks: {
            afterAtRule: true,
            afterBlockBegins: true,
            afterBlockEnds: true,
            afterComment: true,
            afterProperty: true,
            afterRuleBegins: true,
            afterRuleEnds: true,
            beforeBlockEnds: true,
            betweenSelectors: true
          },
          indentBy: 2,
          indentWith: '\t',
          spaces: {
            aroundSelectorRelation: true,
            beforeBlockBegins: true,
            beforeValue: true
          }
        });
      }
    },
    'string': {
      'topic': function () {
        return formatFrom('breaks:afterProperty=off;indentBy:3');
      },
      'is merged with default': function (formatOptions) {
        assert.deepEqual(formatOptions, {
          breaks: {
            afterAtRule: true,
            afterBlockBegins: true,
            afterBlockEnds: true,
            afterComment: true,
            afterProperty: false,
            afterRuleBegins: true,
            afterRuleEnds: true,
            beforeBlockEnds: true,
            betweenSelectors: true
          },
          indentBy: 3,
          indentWith: ' ',
          spaces: {
            aroundSelectorRelation: true,
            beforeBlockBegins: true,
            beforeValue: true
          }
        });
      }
    },
    'string with indentWith': {
      'topic': function () {
        return formatFrom('indentWith:tab');
      },
      'is merged with default': function (formatOptions) {
        assert.deepEqual(formatOptions, {
          breaks: {
            afterAtRule: true,
            afterBlockBegins: true,
            afterBlockEnds: true,
            afterComment: true,
            afterProperty: true,
            afterRuleBegins: true,
            afterRuleEnds: true,
            beforeBlockEnds: true,
            betweenSelectors: true
          },
          indentBy: 2,
          indentWith: '\t',
          spaces: {
            aroundSelectorRelation: true,
            beforeBlockBegins: true,
            beforeValue: true
          }
        });
      }
    },
    'string keyword': {
      'topic': function () {
        return formatFrom('keep-breaks');
      },
      'resolves correctly': function (formatOptions) {
        assert.deepEqual(formatOptions, {
          breaks: {
            afterAtRule: true,
            afterBlockBegins: true,
            afterBlockEnds: true,
            afterComment: true,
            afterProperty: false,
            afterRuleBegins: false,
            afterRuleEnds: true,
            beforeBlockEnds: true,
            betweenSelectors: false
          },
          indentBy: 0,
          indentWith: ' ',
          spaces: {
            aroundSelectorRelation: false,
            beforeBlockBegins: false,
            beforeValue: false
          }
        });
      }
    }
  })
  .export(module);
