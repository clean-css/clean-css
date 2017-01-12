var assert = require('assert');

var vows = require('vows');

var beautifyFrom = require('../../lib/options/beautify').beautifyFrom;

vows.describe(beautifyFrom)
  .addBatch({
    'undefined': {
      'topic': function () {
        return beautifyFrom(undefined);
      },
      'is false': function (beautifyOptions) {
        assert.deepEqual(beautifyOptions, false);
      }
    },
    'false': {
      'topic': function () {
        return beautifyFrom(false);
      },
      'is false': function (beautifyOptions) {
        assert.deepEqual(beautifyOptions, false);
      }
    },
    'true': {
      'topic': function () {
        return beautifyFrom(true);
      },
      'is default': function (beautifyOptions) {
        assert.deepEqual(beautifyOptions, {
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
        return beautifyFrom({ breaks: { afterProperty: false }, indentBy: 1 });
      },
      'is merged with default': function (beautifyOptions) {
        assert.deepEqual(beautifyOptions, {
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
        return beautifyFrom({ indentBy: '2' });
      },
      'is merged with default': function (beautifyOptions) {
        assert.deepEqual(beautifyOptions, {
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
        return beautifyFrom({ indentWith: '\t' });
      },
      'is merged with default': function (beautifyOptions) {
        assert.deepEqual(beautifyOptions, {
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
        return beautifyFrom({ indentWith: 'tab' });
      },
      'is merged with default': function (beautifyOptions) {
        assert.deepEqual(beautifyOptions, {
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
        return beautifyFrom('breaks:afterProperty=off;indentBy:3');
      },
      'is merged with default': function (beautifyOptions) {
        assert.deepEqual(beautifyOptions, {
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
        return beautifyFrom('indentWith:tab');
      },
      'is merged with default': function (beautifyOptions) {
        assert.deepEqual(beautifyOptions, {
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
        return beautifyFrom('keep-breaks');
      },
      'resolves correctly': function (beautifyOptions) {
        assert.deepEqual(beautifyOptions, {
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
