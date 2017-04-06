var vows = require('vows');
var assert = require('assert');

var wrapForOptimizing = require('../../lib/optimizer/wrap-for-optimizing').all;

vows.describe(wrapForOptimizing)
  .addBatch({
    'one': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin'],
            ['property-value', '0'],
            ['property-value', '0']
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has name': function (wrapped) {
        assert.deepEqual(wrapped[0].name, 'margin');
      },
      'has value': function (wrapped) {
        assert.deepEqual(wrapped[0].value, [['property-value', '0'], ['property-value', '0']]);
      },
      'is not a block': function (wrapped) {
        assert.isFalse(wrapped[0].block);
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
        return wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin'],
            ['property-value', '0'],
            ['property-value', '0']
          ],
          [
            'property',
            ['property-name', 'color'],
            ['property-value', 'red']
          ]
        ], true);
      },
      'has two wraps': function (wrapped) {
        assert.lengthOf(wrapped, 2);
      }
    },
    'with comments': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'comment',
            '/* comment */'
          ],
          [
            'property',
            ['property-name', 'color'],
            ['property-value', 'red']
          ]
        ], true);
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
        return wrapForOptimizing([
          [
            'property',
            ['property-name', 'border-radius-top-left'],
            ['property-value', '1px'],
            ['property-value', '/'],
            ['property-value', '2px']
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has name': function (wrapped) {
        assert.deepEqual(wrapped[0].name, 'border-radius-top-left');
      },
      'has value': function (wrapped) {
        assert.deepEqual(wrapped[0].value, [['property-value', '1px'], ['property-value', '/'], ['property-value', '2px']]);
      },
      'is multiplex': function (wrapped) {
        assert.isTrue(wrapped[0].multiplex);
      }
    },
    'variable': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', '--color'],
            ['property-value', 'red']
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has name': function (wrapped) {
        assert.deepEqual(wrapped[0].name, '--color');
      },
      'is not a block': function (wrapped) {
        assert.isFalse(wrapped[0].block);
      }
    },
    'variable reference': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', 'color'],
            ['property-value', 'var(--red)']
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has name': function (wrapped) {
        assert.deepEqual(wrapped[0].name, 'color');
      },
      'has value': function (wrapped) {
        assert.deepEqual(wrapped[0].value, [['property-value', 'var(--red)']]);
      }
    },
    'variable reference when variables are ignored': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', 'color'],
            ['property-value', 'var(--red)']
          ]
        ], false);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 0);
      }
    },
    'variable block': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', '--color'],
            [
              'property-block',
              [
                [
                  'property',
                  ['property-name', 'color'],
                  ['property-value', 'red']
                ],
                [
                  'property',
                  ['property-name', 'text-color'],
                  ['property-value', 'red']
                ]
              ]
            ]
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has name': function (wrapped) {
        assert.deepEqual(wrapped[0].name, '--color');
      },
      'has value': function (wrapped) {
        assert.deepEqual(wrapped[0].value, [
          [
            'property-block',
            [
              [
                'property',
                ['property-name', 'color'],
                ['property-value', 'red']
              ],
              [
                'property',
                ['property-name', 'text-color'],
                ['property-value', 'red']
              ]
            ]
          ]
        ], true);
      },
      'is a block': function (wrapped) {
        assert.isTrue(wrapped[0].block);
      }
    },
    'without value': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin']
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has value': function (wrapped) {
        assert.isUndefined(wrapped.value);
      },
      'unused is not set': function (wrapped) {
        assert.isFalse(wrapped[0].unused);
      }
    },
    'important': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin'],
            ['property-value', '0!important']
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has right value': function (wrapped) {
        assert.deepEqual(wrapped[0].value, [['property-value', '0']]);
      },
      'has important set': function (wrapped) {
        assert.isTrue(wrapped[0].important);
      }
    },
    'important with prefix space': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin'],
            ['property-value', '0'],
            ['property-value', '!important']
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has right value': function (wrapped) {
        assert.deepEqual(wrapped[0].value, [['property-value', '0']]);
      },
      'has important set': function (wrapped) {
        assert.isTrue(wrapped[0].important);
      }
    },
    'important with suffix space': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin'],
            ['property-value', '0!'],
            ['property-value', 'important']
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has right value': function (wrapped) {
        assert.deepEqual(wrapped[0].value, [['property-value', '0']]);
      },
      'has important set': function (wrapped) {
        assert.isTrue(wrapped[0].important);
      }
    },
    'important with two spaces': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin'],
            ['property-value', '0'],
            ['property-value', '!'],
            ['property-value', 'important']
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has right value': function (wrapped) {
        assert.deepEqual(wrapped[0].value, [['property-value', '0']]);
      },
      'has important set': function (wrapped) {
        assert.isTrue(wrapped[0].important);
      },
      'is not a bang hack': function (wrapped) {
        assert.isFalse(wrapped[0].hack);
      }
    },
    'underscore hack': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', '_color'],
            ['property-value', 'red']
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has right name': function (wrapped) {
        assert.deepEqual(wrapped[0].name, 'color');
      },
      'is a hack': function (wrapped) {
        assert.deepEqual(wrapped[0].hack, ['underscore']);
      }
    },
    'star hack': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', '*color'],
            ['property-value', 'red']
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has right name': function (wrapped) {
        assert.deepEqual(wrapped[0].name, 'color');
      },
      'is a hack': function (wrapped) {
        assert.deepEqual(wrapped[0].hack, ['asterisk']);
      }
    },
    'backslash hack': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin'],
            ['property-value', '0\\9']
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has right value': function (wrapped) {
        assert.deepEqual(wrapped[0].value, [['property-value', '0']]);
      },
      'is a hack': function (wrapped) {
        assert.deepEqual(wrapped[0].hack, ['backslash', '9']);
      }
    },
    'backslash hack - single value': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin'],
            ['property-value', '0']
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has right value': function (wrapped) {
        assert.deepEqual(wrapped[0].value, [['property-value', '0']]);
      },
      'is a hack': function (wrapped) {
        assert.isFalse(wrapped[0].hack);
      }
    },
    'backslash hack - space between values': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin'],
            ['property-value', '0'],
            ['property-value', '\\9']
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has right value': function (wrapped) {
        assert.deepEqual(wrapped[0].value, [['property-value', '0']]);
      },
      'is a hack': function (wrapped) {
        assert.deepEqual(wrapped[0].hack, ['backslash', '9']);
      }
    },
    'bang hack': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin'],
            ['property-value', '0!ie']
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has right value': function (wrapped) {
        assert.deepEqual(wrapped[0].value, [['property-value', '0']]);
      },
      'is a hack': function (wrapped) {
        assert.deepEqual(wrapped[0].hack, ['bang']);
      },
      'is not important': function (wrapped) {
        assert.isFalse(wrapped[0].important);
      }
    },
    'bang hack with space': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin'],
            ['property-value', '0 !ie']
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has right value': function (wrapped) {
        assert.deepEqual(wrapped[0].value, [['property-value', '0']]);
      },
      'is a hack': function (wrapped) {
        assert.deepEqual(wrapped[0].hack, ['bang']);
      },
      'is not important': function (wrapped) {
        assert.isFalse(wrapped[0].important);
      }
    },
    'bang hack - space between values': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', 'margin'],
            ['property-value', '0'],
            ['property-value', '!ie']
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has right value': function (wrapped) {
        assert.deepEqual(wrapped[0].value, [['property-value', '0']]);
      },
      'is a hack': function (wrapped) {
        assert.deepEqual(wrapped[0].hack, ['bang']);
      },
      'is not important': function (wrapped) {
        assert.isFalse(wrapped[0].important);
      }
    },
    'two hacks': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', 'color'],
            ['property-value', 'red\\9!important']
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has right value': function (wrapped) {
        assert.deepEqual(wrapped[0].value, [['property-value', 'red']]);
      },
      'is important': function (wrapped) {
        assert.isTrue(wrapped[0].important);
      },
      'is a hack': function (wrapped) {
        assert.deepEqual(wrapped[0].hack, ['backslash', '9']);
      }
    },
    'source map': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', 'color', [[1, 2, undefined]]],
            ['property-value', 'red', [[1, 2, undefined]]]
          ]
        ], true);
      },
      'has one wrap': function (wrapped) {
        assert.lengthOf(wrapped, 1);
      },
      'has right value': function (wrapped) {
        assert.deepEqual(wrapped[0].value, [['property-value', 'red', [[1, 2, undefined]]]]);
      }
    },
    'skipping properties': {
      'topic': function () {
        return wrapForOptimizing([
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'red', [[1, 12, undefined]]]
          ]
        ], true, ['background']);
      },
      'has no wrap': function (wrapped) {
        assert.lengthOf(wrapped, 0);
      }
    }
  })
  .export(module);
