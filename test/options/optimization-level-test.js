var assert = require('assert');

var vows = require('vows');

var optimizationLevelFrom = require('../../lib/options/optimization-level').optimizationLevelFrom;
var roundingPrecisionFrom = require('../../lib/options/rounding-precision').roundingPrecisionFrom;

vows.describe(optimizationLevelFrom)
  .addBatch({
    'undefined': {
      'topic': function () {
        return optimizationLevelFrom(undefined);
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.isTrue(typeof levelOptions['1'].transform == 'function');
        delete levelOptions['1'].transform;

        assert.deepEqual(levelOptions['1'], {
          cleanupCharsets: true,
          normalizeUrls: true,
          optimizeBackground: true,
          optimizeBorderRadius: true,
          optimizeFilter: true,
          optimizeFontWeight: true,
          optimizeOutline: true,
          removeEmpty: true,
          removeNegativePaddings: true,
          removeQuotes: true,
          removeWhitespace: true,
          replaceMultipleZeros: true,
          replaceTimeUnits: true,
          replaceZeroUnits: true,
          roundingPrecision: roundingPrecisionFrom(undefined),
          selectorsSortingMethod: 'standard',
          specialComments: 'all',
          tidyAtRules: true,
          tidyBlockScopes: true,
          tidySelectors: true
        });
      }
    },
    'number - level 0': {
      'topic': function () {
        return optimizationLevelFrom(0);
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      }
    },
    'number - level 1': {
      'topic': function () {
        return optimizationLevelFrom(1);
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.isTrue(typeof levelOptions['1'].transform == 'function');
        delete levelOptions['1'].transform;

        assert.deepEqual(levelOptions['1'], {
          cleanupCharsets: true,
          normalizeUrls: true,
          optimizeBackground: true,
          optimizeBorderRadius: true,
          optimizeFilter: true,
          optimizeFontWeight: true,
          optimizeOutline: true,
          removeEmpty: true,
          removeNegativePaddings: true,
          removeQuotes: true,
          removeWhitespace: true,
          replaceMultipleZeros: true,
          replaceTimeUnits: true,
          replaceZeroUnits: true,
          roundingPrecision: roundingPrecisionFrom(undefined),
          selectorsSortingMethod: 'standard',
          specialComments: 'all',
          tidyAtRules: true,
          tidyBlockScopes: true,
          tidySelectors: true
        });
      }
    },
    'number - level 2': {
      'topic': function () {
        return optimizationLevelFrom(2);
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1', '2']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.isTrue(typeof levelOptions['1'].transform == 'function');
        delete levelOptions['1'].transform;

        assert.deepEqual(levelOptions['1'], {
          cleanupCharsets: true,
          normalizeUrls: true,
          optimizeBackground: true,
          optimizeBorderRadius: true,
          optimizeFilter: true,
          optimizeFontWeight: true,
          optimizeOutline: true,
          removeEmpty: true,
          removeNegativePaddings: true,
          removeQuotes: true,
          removeWhitespace: true,
          replaceMultipleZeros: true,
          replaceTimeUnits: true,
          replaceZeroUnits: true,
          roundingPrecision: roundingPrecisionFrom(undefined),
          selectorsSortingMethod: 'standard',
          specialComments: 'all',
          tidyAtRules: true,
          tidyBlockScopes: true,
          tidySelectors: true
        });
      },
      'has level 2 options': function (levelOptions) {
        assert.deepEqual(levelOptions['2'], {
          mergeAdjacentRules: true,
          mergeIntoShorthands: true,
          mergeMedia: true,
          mergeNonAdjacentRules: true,
          mergeSemantically: false,
          overrideProperties: true,
          removeEmpty: true,
          reduceNonAdjacentRules: true,
          removeDuplicateFontRules: true,
          removeDuplicateMediaBlocks: true,
          removeDuplicateRules: true,
          removeUnusedAtRules: false,
          restructureRules: false,
          skipProperties: []
        });
      }
    },
    'string with value': {
      'topic': function () {
        return optimizationLevelFrom('0');
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      }
    },
    'a hash': {
      'topic': function () {
        return optimizationLevelFrom({ 1: { specialComments: 0 }, 2: true });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1', '2']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.isTrue(typeof levelOptions['1'].transform == 'function');
        delete levelOptions['1'].transform;

        assert.deepEqual(levelOptions['1'], {
          cleanupCharsets: true,
          normalizeUrls: true,
          optimizeBackground: true,
          optimizeBorderRadius: true,
          optimizeFilter: true,
          optimizeFontWeight: true,
          optimizeOutline: true,
          removeEmpty: true,
          removeNegativePaddings: true,
          removeQuotes: true,
          removeWhitespace: true,
          replaceMultipleZeros: true,
          replaceTimeUnits: true,
          replaceZeroUnits: true,
          roundingPrecision: roundingPrecisionFrom(undefined),
          selectorsSortingMethod: 'standard',
          specialComments: 0,
          tidyAtRules: true,
          tidyBlockScopes: true,
          tidySelectors: true
        });
      },
      'has level 2 options': function (levelOptions) {
        assert.deepEqual(levelOptions['2'], {
          mergeAdjacentRules: true,
          mergeIntoShorthands: true,
          mergeMedia: true,
          mergeNonAdjacentRules: true,
          mergeSemantically: false,
          overrideProperties: true,
          removeEmpty: true,
          reduceNonAdjacentRules: true,
          removeDuplicateFontRules: true,
          removeDuplicateMediaBlocks: true,
          removeDuplicateRules: true,
          removeUnusedAtRules: false,
          restructureRules: false,
          skipProperties: []
        });
      }
    },
    'a hash with all keyword for level 1': {
      'topic': function () {
        return optimizationLevelFrom({ 1: { all: false, cleanupCharsets: true } });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.isTrue(typeof levelOptions['1'].transform == 'function');
        delete levelOptions['1'].transform;

        assert.deepEqual(levelOptions['1'], {
          cleanupCharsets: true,
          normalizeUrls: false,
          optimizeBackground: false,
          optimizeBorderRadius: false,
          optimizeFilter: false,
          optimizeFontWeight: false,
          optimizeOutline: false,
          removeEmpty: false,
          removeNegativePaddings: false,
          removeQuotes: false,
          removeWhitespace: false,
          replaceMultipleZeros: false,
          replaceTimeUnits: false,
          replaceZeroUnits: false,
          roundingPrecision: roundingPrecisionFrom(undefined),
          selectorsSortingMethod: 'standard',
          specialComments: 'all',
          tidyAtRules: false,
          tidyBlockScopes: false,
          tidySelectors: false
        });
      }
    },
    'a hash with * keyword for level 1': {
      'topic': function () {
        return optimizationLevelFrom({ 1: { '*': false, cleanupCharsets: true } });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.isTrue(typeof levelOptions['1'].transform == 'function');
        delete levelOptions['1'].transform;

        assert.deepEqual(levelOptions['1'], {
          cleanupCharsets: true,
          normalizeUrls: false,
          optimizeBackground: false,
          optimizeBorderRadius: false,
          optimizeFilter: false,
          optimizeFontWeight: false,
          optimizeOutline: false,
          removeEmpty: false,
          removeNegativePaddings: false,
          removeQuotes: false,
          removeWhitespace: false,
          replaceMultipleZeros: false,
          replaceTimeUnits: false,
          replaceZeroUnits: false,
          roundingPrecision: roundingPrecisionFrom(undefined),
          selectorsSortingMethod: 'standard',
          specialComments: 'all',
          tidyAtRules: false,
          tidyBlockScopes: false,
          tidySelectors: false
        });
      }
    },
    'a hash with all keyword for level 2': {
      'topic': function () {
        return optimizationLevelFrom({ 1: { specialComments: 0 }, 2: { all: false, mergeMedia: true } });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1', '2']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.isTrue(typeof levelOptions['1'].transform == 'function');
        delete levelOptions['1'].transform;

        assert.deepEqual(levelOptions['1'], {
          cleanupCharsets: true,
          normalizeUrls: true,
          optimizeBackground: true,
          optimizeBorderRadius: true,
          optimizeFilter: true,
          optimizeFontWeight: true,
          optimizeOutline: true,
          removeEmpty: true,
          removeNegativePaddings: true,
          removeQuotes: true,
          removeWhitespace: true,
          replaceMultipleZeros: true,
          replaceTimeUnits: true,
          replaceZeroUnits: true,
          roundingPrecision: roundingPrecisionFrom(undefined),
          selectorsSortingMethod: 'standard',
          specialComments: 0,
          tidyAtRules: true,
          tidyBlockScopes: true,
          tidySelectors: true
        });
      },
      'has level 2 options': function (levelOptions) {
        assert.deepEqual(levelOptions['2'], {
          mergeAdjacentRules: false,
          mergeIntoShorthands: false,
          mergeMedia: true,
          mergeNonAdjacentRules: false,
          mergeSemantically: false,
          overrideProperties: false,
          removeEmpty: false,
          reduceNonAdjacentRules: false,
          removeDuplicateFontRules: false,
          removeDuplicateMediaBlocks: false,
          removeDuplicateRules: false,
          removeUnusedAtRules: false,
          restructureRules: false,
          skipProperties: []
        });
      }
    },
    'a hash with * keyword for level 2': {
      'topic': function () {
        return optimizationLevelFrom({ 1: { specialComments: 0 }, 2: { '*': false, mergeMedia: true } });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1', '2']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.isTrue(typeof levelOptions['1'].transform == 'function');
        delete levelOptions['1'].transform;

        assert.deepEqual(levelOptions['1'], {
          cleanupCharsets: true,
          normalizeUrls: true,
          optimizeBackground: true,
          optimizeBorderRadius: true,
          optimizeFilter: true,
          optimizeFontWeight: true,
          optimizeOutline: true,
          removeEmpty: true,
          removeNegativePaddings: true,
          removeQuotes: true,
          removeWhitespace: true,
          replaceMultipleZeros: true,
          replaceTimeUnits: true,
          replaceZeroUnits: true,
          roundingPrecision: roundingPrecisionFrom(undefined),
          selectorsSortingMethod: 'standard',
          specialComments: 0,
          tidyAtRules: true,
          tidyBlockScopes: true,
          tidySelectors: true
        });
      },
      'has level 2 options': function (levelOptions) {
        assert.deepEqual(levelOptions['2'], {
          mergeAdjacentRules: false,
          mergeIntoShorthands: false,
          mergeMedia: true,
          mergeNonAdjacentRules: false,
          mergeSemantically: false,
          overrideProperties: false,
          removeEmpty: false,
          reduceNonAdjacentRules: false,
          removeDuplicateFontRules: false,
          removeDuplicateMediaBlocks: false,
          removeDuplicateRules: false,
          removeUnusedAtRules: false,
          restructureRules: false,
          skipProperties: []
        });
      }
    },
    'a hash with options as strings': {
      'topic': function () {
        return optimizationLevelFrom({ 1: 'roundingPrecision:3;specialComments:0' });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.isTrue(typeof levelOptions['1'].transform == 'function');
        delete levelOptions['1'].transform;

        assert.deepEqual(levelOptions['1'], {
          cleanupCharsets: true,
          normalizeUrls: true,
          optimizeBackground: true,
          optimizeBorderRadius: true,
          optimizeFilter: true,
          optimizeFontWeight: true,
          optimizeOutline: true,
          removeEmpty: true,
          removeNegativePaddings: true,
          removeQuotes: true,
          removeWhitespace: true,
          replaceMultipleZeros: true,
          replaceTimeUnits: true,
          replaceZeroUnits: true,
          roundingPrecision: roundingPrecisionFrom(3),
          selectorsSortingMethod: 'standard',
          specialComments: 0,
          tidyAtRules: true,
          tidyBlockScopes: true,
          tidySelectors: true
        });
      }
    },
    'a hash with options as strings with boolean values': {
      'topic': function () {
        return optimizationLevelFrom({ 2: 'mergeMedia:false;mergeSemantically:true' });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1', '2']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.isTrue(typeof levelOptions['1'].transform == 'function');
        delete levelOptions['1'].transform;

        assert.deepEqual(levelOptions['1'], {
          cleanupCharsets: true,
          normalizeUrls: true,
          optimizeBackground: true,
          optimizeBorderRadius: true,
          optimizeFilter: true,
          optimizeFontWeight: true,
          optimizeOutline: true,
          removeEmpty: true,
          removeNegativePaddings: true,
          removeQuotes: true,
          removeWhitespace: true,
          replaceMultipleZeros: true,
          replaceTimeUnits: true,
          replaceZeroUnits: true,
          roundingPrecision: roundingPrecisionFrom(undefined),
          selectorsSortingMethod: 'standard',
          specialComments: 'all',
          tidyAtRules: true,
          tidyBlockScopes: true,
          tidySelectors: true
        });
      },
      'has level 2 options': function (levelOptions) {
        assert.deepEqual(levelOptions['2'], {
          mergeAdjacentRules: true,
          mergeIntoShorthands: true,
          mergeMedia: false,
          mergeNonAdjacentRules: true,
          mergeSemantically: true,
          overrideProperties: true,
          removeEmpty: true,
          reduceNonAdjacentRules: true,
          removeDuplicateFontRules: true,
          removeDuplicateMediaBlocks: true,
          removeDuplicateRules: true,
          removeUnusedAtRules: false,
          restructureRules: false,
          skipProperties: []
        });
      }
    },
    'a hash with options as strings with boolean values as on/off': {
      'topic': function () {
        return optimizationLevelFrom({ 2: 'mergeMedia:off;mergeSemantically:on' });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1', '2']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.isTrue(typeof levelOptions['1'].transform == 'function');
        delete levelOptions['1'].transform;

        assert.deepEqual(levelOptions['1'], {
          cleanupCharsets: true,
          normalizeUrls: true,
          optimizeBackground: true,
          optimizeBorderRadius: true,
          optimizeFilter: true,
          optimizeFontWeight: true,
          optimizeOutline: true,
          removeEmpty: true,
          removeNegativePaddings: true,
          removeQuotes: true,
          removeWhitespace: true,
          replaceMultipleZeros: true,
          replaceTimeUnits: true,
          replaceZeroUnits: true,
          roundingPrecision: roundingPrecisionFrom(undefined),
          selectorsSortingMethod: 'standard',
          specialComments: 'all',
          tidyAtRules: true,
          tidyBlockScopes: true,
          tidySelectors: true
        });
      },
      'has level 2 options': function (levelOptions) {
        assert.deepEqual(levelOptions['2'], {
          mergeAdjacentRules: true,
          mergeIntoShorthands: true,
          mergeMedia: false,
          mergeNonAdjacentRules: true,
          mergeSemantically: true,
          overrideProperties: true,
          removeEmpty: true,
          reduceNonAdjacentRules: true,
          removeDuplicateFontRules: true,
          removeDuplicateMediaBlocks: true,
          removeDuplicateRules: true,
          removeUnusedAtRules: false,
          restructureRules: false,
          skipProperties: []
        });
      }
    },
    'a hash with options as strings with all keyword': {
      'topic': function () {
        return optimizationLevelFrom({ 2: 'all:false;mergeMedia:true;mergeSemantically:true' });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1', '2']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.isTrue(typeof levelOptions['1'].transform == 'function');
        delete levelOptions['1'].transform;

        assert.deepEqual(levelOptions['1'], {
          cleanupCharsets: true,
          normalizeUrls: true,
          optimizeBackground: true,
          optimizeBorderRadius: true,
          optimizeFilter: true,
          optimizeFontWeight: true,
          optimizeOutline: true,
          removeEmpty: true,
          removeNegativePaddings: true,
          removeQuotes: true,
          removeWhitespace: true,
          replaceMultipleZeros: true,
          replaceTimeUnits: true,
          replaceZeroUnits: true,
          roundingPrecision: roundingPrecisionFrom(undefined),
          selectorsSortingMethod: 'standard',
          specialComments: 'all',
          tidyAtRules: true,
          tidyBlockScopes: true,
          tidySelectors: true
        });
      },
      'has level 2 options': function (levelOptions) {
        assert.deepEqual(levelOptions['2'], {
          mergeAdjacentRules: false,
          mergeIntoShorthands: false,
          mergeMedia: true,
          mergeNonAdjacentRules: false,
          mergeSemantically: true,
          overrideProperties: false,
          removeEmpty: false,
          reduceNonAdjacentRules: false,
          removeDuplicateFontRules: false,
          removeDuplicateMediaBlocks: false,
          removeDuplicateRules: false,
          removeUnusedAtRules: false,
          restructureRules: false,
          skipProperties: []
        });
      }
    },
    'a hash with options as strings with * keyword': {
      'topic': function () {
        return optimizationLevelFrom({ 2: '*:false;mergeMedia:true;mergeSemantically:true' });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1', '2']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.isTrue(typeof levelOptions['1'].transform == 'function');
        delete levelOptions['1'].transform;

        assert.deepEqual(levelOptions['1'], {
          cleanupCharsets: true,
          normalizeUrls: true,
          optimizeBackground: true,
          optimizeBorderRadius: true,
          optimizeFilter: true,
          optimizeFontWeight: true,
          optimizeOutline: true,
          removeEmpty: true,
          removeNegativePaddings: true,
          removeQuotes: true,
          removeWhitespace: true,
          replaceMultipleZeros: true,
          replaceTimeUnits: true,
          replaceZeroUnits: true,
          roundingPrecision: roundingPrecisionFrom(undefined),
          selectorsSortingMethod: 'standard',
          specialComments: 'all',
          tidyAtRules: true,
          tidyBlockScopes: true,
          tidySelectors: true
        });
      },
      'has level 2 options': function (levelOptions) {
        assert.deepEqual(levelOptions['2'], {
          mergeAdjacentRules: false,
          mergeIntoShorthands: false,
          mergeMedia: true,
          mergeNonAdjacentRules: false,
          mergeSemantically: true,
          overrideProperties: false,
          removeEmpty: false,
          reduceNonAdjacentRules: false,
          removeDuplicateFontRules: false,
          removeDuplicateMediaBlocks: false,
          removeDuplicateRules: false,
          removeUnusedAtRules: false,
          restructureRules: false,
          skipProperties: []
        });
      }
    },
    'a hash with options as undefined/boolean': {
      'topic': function () {
        return optimizationLevelFrom({ 0: undefined, 1: true, 2: undefined });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.isTrue(typeof levelOptions['1'].transform == 'function');
        delete levelOptions['1'].transform;

        assert.deepEqual(levelOptions['1'], {
          cleanupCharsets: true,
          normalizeUrls: true,
          optimizeBackground: true,
          optimizeBorderRadius: true,
          optimizeFilter: true,
          optimizeFontWeight: true,
          optimizeOutline: true,
          removeEmpty: true,
          removeNegativePaddings: true,
          removeQuotes: true,
          removeWhitespace: true,
          replaceMultipleZeros: true,
          replaceTimeUnits: true,
          replaceZeroUnits: true,
          roundingPrecision: roundingPrecisionFrom(undefined),
          selectorsSortingMethod: 'standard',
          specialComments: 'all',
          tidyAtRules: true,
          tidyBlockScopes: true,
          tidySelectors: true
        });
      }
    },
    'a hash with roundingPrecision as number': {
      'topic': function () {
        return optimizationLevelFrom({ 1: { roundingPrecision: 4 } });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.isTrue(typeof levelOptions['1'].transform == 'function');
        delete levelOptions['1'].transform;

        assert.deepEqual(levelOptions['1'], {
          cleanupCharsets: true,
          normalizeUrls: true,
          optimizeBackground: true,
          optimizeBorderRadius: true,
          optimizeFilter: true,
          optimizeFontWeight: true,
          optimizeOutline: true,
          removeEmpty: true,
          removeNegativePaddings: true,
          removeQuotes: true,
          removeWhitespace: true,
          replaceMultipleZeros: true,
          replaceTimeUnits: true,
          replaceZeroUnits: true,
          roundingPrecision: {
            'ch': 4,
            'cm': 4,
            'em': 4,
            'ex': 4,
            'in': 4,
            'mm': 4,
            'pc': 4,
            'pt': 4,
            'px': 4,
            'q': 4,
            'rem': 4,
            'vh': 4,
            'vmax': 4,
            'vmin': 4,
            'vw': 4,
            '%': 4
          },
          selectorsSortingMethod: 'standard',
          specialComments: 'all',
          tidyAtRules: true,
          tidyBlockScopes: true,
          tidySelectors: true
        });
      }
    },
    'a hash with complex roundingPrecision': {
      'topic': function () {
        return optimizationLevelFrom({ 1: 'roundingPrecision:all=5,rem=off,%=1' });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.isTrue(typeof levelOptions['1'].transform == 'function');
        delete levelOptions['1'].transform;

        assert.deepEqual(levelOptions['1'], {
          cleanupCharsets: true,
          normalizeUrls: true,
          optimizeBackground: true,
          optimizeBorderRadius: true,
          optimizeFilter: true,
          optimizeFontWeight: true,
          optimizeOutline: true,
          removeEmpty: true,
          removeNegativePaddings: true,
          removeQuotes: true,
          removeWhitespace: true,
          replaceMultipleZeros: true,
          replaceTimeUnits: true,
          replaceZeroUnits: true,
          roundingPrecision: {
            'ch': 5,
            'cm': 5,
            'em': 5,
            'ex': 5,
            'in': 5,
            'mm': 5,
            'pc': 5,
            'pt': 5,
            'px': 5,
            'q': 5,
            'rem': 'off',
            'vh': 5,
            'vmax': 5,
            'vmin': 5,
            'vw': 5,
            '%': 1
          },
          selectorsSortingMethod: 'standard',
          specialComments: 'all',
          tidyAtRules: true,
          tidyBlockScopes: true,
          tidySelectors: true
        });
      }
    },
    'a hash with skipProperties as a string': {
      'topic': function () {
        return optimizationLevelFrom({ 2: 'skipProperties:background,font,transform' });
      },
      'has correct skipProperties level 2 option': function (levelOptions) {
        assert.deepEqual(levelOptions['2'].skipProperties, ['background', 'font', 'transform']);
      }
    }
  })
  .export(module);
