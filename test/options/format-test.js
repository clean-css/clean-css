var assert = require('assert');
var systemLineBreak = require('os').EOL;

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
            afterAtRule: '',
            afterBlockBegins: '',
            afterBlockEnds: '',
            afterComment: '',
            afterProperty: '',
            afterRuleBegins: '',
            afterRuleEnds: '',
            beforeBlockEnds: '',
            betweenSelectors: ''
          },
          breakWith: systemLineBreak,
          indentBy: 0,
          indentWith: ' ',
          spaces: {
            aroundSelectorRelation: false,
            beforeBlockBegins: false,
            beforeValue: false
          },
          wrapAt: false,
          semicolonAfterLastProperty: false
        });
      }
    },
    'hash': {
      'topic': function () {
        return formatFrom({ breaks: { afterProperty: true }, breakWith: '\r\n', indentBy: 1 });
      },
      'is merged with default': function (formatOptions) {
        assert.deepEqual(formatOptions, {
          breaks: {
            afterAtRule: '',
            afterBlockBegins: '',
            afterBlockEnds: '',
            afterComment: '',
            afterProperty: '\r\n',
            afterRuleBegins: '',
            afterRuleEnds: '',
            beforeBlockEnds: '',
            betweenSelectors: ''
          },
          breakWith: '\r\n',
          indentBy: 1,
          indentWith: ' ',
          spaces: {
            aroundSelectorRelation: false,
            beforeBlockBegins: false,
            beforeValue: false
          },
          wrapAt: false,
          semicolonAfterLastProperty: false
        });
      }
    },
    'hash with breaks as numbers': {
      'topic': function () {
        return formatFrom({ breaks: { afterProperty: 2, beforeBlockEnds: 1 }, breakWith: '\r\n', indentBy: 1 });
      },
      'is merged with default': function (formatOptions) {
        assert.deepEqual(formatOptions, {
          breaks: {
            afterAtRule: '',
            afterBlockBegins: '',
            afterBlockEnds: '',
            afterComment: '',
            afterProperty: '\r\n\r\n',
            afterRuleBegins: '',
            afterRuleEnds: '',
            beforeBlockEnds: '\r\n',
            betweenSelectors: ''
          },
          breakWith: '\r\n',
          indentBy: 1,
          indentWith: ' ',
          spaces: {
            aroundSelectorRelation: false,
            beforeBlockBegins: false,
            beforeValue: false
          },
          wrapAt: false,
          semicolonAfterLastProperty: false
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
            afterAtRule: '',
            afterBlockBegins: '',
            afterBlockEnds: '',
            afterComment: '',
            afterProperty: '',
            afterRuleBegins: '',
            afterRuleEnds: '',
            beforeBlockEnds: '',
            betweenSelectors: ''
          },
          breakWith: systemLineBreak,
          indentBy: 2,
          indentWith: ' ',
          spaces: {
            aroundSelectorRelation: false,
            beforeBlockBegins: false,
            beforeValue: false
          },
          wrapAt: false,
          semicolonAfterLastProperty: false
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
            afterAtRule: '',
            afterBlockBegins: '',
            afterBlockEnds: '',
            afterComment: '',
            afterProperty: '',
            afterRuleBegins: '',
            afterRuleEnds: '',
            beforeBlockEnds: '',
            betweenSelectors: ''
          },
          breakWith: systemLineBreak,
          indentBy: 0,
          indentWith: '\t',
          spaces: {
            aroundSelectorRelation: false,
            beforeBlockBegins: false,
            beforeValue: false
          },
          wrapAt: false,
          semicolonAfterLastProperty: false
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
            afterAtRule: '',
            afterBlockBegins: '',
            afterBlockEnds: '',
            afterComment: '',
            afterProperty: '',
            afterRuleBegins: '',
            afterRuleEnds: '',
            beforeBlockEnds: '',
            betweenSelectors: ''
          },
          breakWith: systemLineBreak,
          indentBy: 0,
          indentWith: '\t',
          spaces: {
            aroundSelectorRelation: false,
            beforeBlockBegins: false,
            beforeValue: false
          },
          wrapAt: false,
          semicolonAfterLastProperty: false
        });
      }
    },
    'string': {
      'topic': function () {
        return formatFrom('breaks:afterProperty=on;indentBy:3;wrapAt:25');
      },
      'is merged with default': function (formatOptions) {
        assert.deepEqual(formatOptions, {
          breaks: {
            afterAtRule: '',
            afterBlockBegins: '',
            afterBlockEnds: '',
            afterComment: '',
            afterProperty: systemLineBreak,
            afterRuleBegins: '',
            afterRuleEnds: '',
            beforeBlockEnds: '',
            betweenSelectors: ''
          },
          breakWith: systemLineBreak,
          indentBy: 3,
          indentWith: ' ',
          spaces: {
            aroundSelectorRelation: false,
            beforeBlockBegins: false,
            beforeValue: false
          },
          wrapAt: 25,
          semicolonAfterLastProperty: false
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
            afterAtRule: '',
            afterBlockBegins: '',
            afterBlockEnds: '',
            afterComment: '',
            afterProperty: '',
            afterRuleBegins: '',
            afterRuleEnds: '',
            beforeBlockEnds: '',
            betweenSelectors: ''
          },
          breakWith: systemLineBreak,
          indentBy: 0,
          indentWith: '\t',
          spaces: {
            aroundSelectorRelation: false,
            beforeBlockBegins: false,
            beforeValue: false
          },
          wrapAt: false,
          semicolonAfterLastProperty: false
        });
      }
    },
    'beautify keyword': {
      'topic': function () {
        return formatFrom('beautify');
      },
      'resolves correctly': function (formatOptions) {
        assert.deepEqual(formatOptions, {
          breaks: {
            afterAtRule: systemLineBreak,
            afterBlockBegins: systemLineBreak,
            afterBlockEnds: systemLineBreak,
            afterComment: systemLineBreak,
            afterProperty: systemLineBreak,
            afterRuleBegins: systemLineBreak,
            afterRuleEnds: systemLineBreak,
            beforeBlockEnds: systemLineBreak,
            betweenSelectors: systemLineBreak
          },
          breakWith: systemLineBreak,
          indentBy: 2,
          indentWith: ' ',
          spaces: {
            aroundSelectorRelation: true,
            beforeBlockBegins: true,
            beforeValue: true
          },
          wrapAt: false,
          semicolonAfterLastProperty: false
        });
      }
    },
    'keep-breaks keyword': {
      'topic': function () {
        return formatFrom('keep-breaks');
      },
      'resolves correctly': function (formatOptions) {
        assert.deepEqual(formatOptions, {
          breaks: {
            afterAtRule: systemLineBreak,
            afterBlockBegins: systemLineBreak,
            afterBlockEnds: systemLineBreak,
            afterComment: systemLineBreak,
            afterProperty: '',
            afterRuleBegins: '',
            afterRuleEnds: systemLineBreak,
            beforeBlockEnds: systemLineBreak,
            betweenSelectors: ''
          },
          breakWith: systemLineBreak,
          indentBy: 0,
          indentWith: ' ',
          spaces: {
            aroundSelectorRelation: false,
            beforeBlockBegins: false,
            beforeValue: false
          },
          wrapAt: false,
          semicolonAfterLastProperty: false
        });
      }
    }
  })
  .export(module);
