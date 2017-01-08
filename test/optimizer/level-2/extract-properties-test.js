var assert = require('assert');
var vows = require('vows');

var extractProperties = require('../../../lib/optimizer/level-2/extract-properties');

var tokenize = require('../../../lib/tokenizer/tokenize');
var inputSourceMapTracker = require('../../../lib/reader/input-source-map-tracker');

function _tokenize(source) {
  return tokenize(source, {
    inputSourceMapTracker: inputSourceMapTracker()
  });
}

vows.describe(extractProperties)
  .addBatch({
    'no properties': {
      'topic': function () {
        return extractProperties(_tokenize('a{}')[0]);
      },
      'has no properties': function (tokens) {
        assert.deepEqual(tokens, []);
      }
    },
    'no valid properties': {
      'topic': function () {
        return extractProperties(_tokenize('a{:red}')[0]);
      },
      'has no properties': function (tokens) {
        assert.deepEqual(tokens, []);
      }
    },
    'one property': {
      'topic': function () {
        return extractProperties(_tokenize('a{color:red}')[0]);
      },
      'has no properties': function (tokens) {
        assert.deepEqual(tokens, [
          [
            'color',
            'red',
            'color',
            ['property', ['property-name', 'color', [[1, 2, undefined]]], ['property-value', 'red', [[1, 8, undefined]]]],
            'color:red',
            [['rule-scope', 'a', [[1, 0, undefined]]]],
            true
          ]
        ]);
      }
    },
    'one important property': {
      'topic': function () {
        return extractProperties(_tokenize('a{color:red!important}')[0]);
      },
      'has no properties': function (tokens) {
        assert.deepEqual(tokens, [
          [
            'color',
            'red!important',
            'color',
            ['property', ['property-name', 'color', [[1, 2, undefined]]], ['property-value', 'red!important', [[1, 8, undefined]]]],
            'color:red!important',
            [['rule-scope', 'a', [[1, 0, undefined]]]],
            true
          ]
        ]);
      }
    },
    'one property - simple selector': {
      'topic': function () {
        return extractProperties(_tokenize('#one span{color:red}')[0]);
      },
      'has no properties': function (tokens) {
        assert.deepEqual(tokens, [
          [
            'color',
            'red',
            'color',
            ['property', ['property-name', 'color', [[1, 10, undefined]]], ['property-value', 'red', [[1, 16, undefined]]]],
            'color:red',
            [['rule-scope', '#one span', [[1, 0, undefined]]]],
            true
          ]
        ]);
      }
    },
    'one property - variable': {
      'topic': function () {
        return extractProperties(_tokenize('#one span{--color:red}')[0]);
      },
      'has no properties': function (tokens) {
        assert.deepEqual(tokens, []);
      }
    },
    'one property - block variable': {
      'topic': function () {
        return extractProperties(_tokenize('#one span{--color:{color:red;display:block};}')[0]);
      },
      'has no properties': function (tokens) {
        assert.deepEqual(tokens, []);
      }
    },
    'one property - complex selector': {
      'topic': function () {
        return extractProperties(_tokenize('.one{color:red}')[0]);
      },
      'has no properties': function (tokens) {
        assert.deepEqual(tokens, [
          [
            'color',
            'red',
            'color',
            ['property', ['property-name', 'color', [[1, 5, undefined]]], ['property-value', 'red', [[1, 11, undefined]]]],
            'color:red',
            [['rule-scope', '.one', [[1, 0, undefined]]]],
            false
          ]
        ]);
      }
    },
    'two properties': {
      'topic': function () {
        return extractProperties(_tokenize('a{color:red;display:block}')[0]);
      },
      'has no properties': function (tokens) {
        assert.deepEqual(tokens, [
          [
            'color',
            'red',
            'color',
            ['property', ['property-name', 'color', [[1, 2, undefined]]], ['property-value', 'red', [[1, 8, undefined]]]],
            'color:red',
            [['rule-scope', 'a', [[1, 0, undefined]]]],
            true
          ],
          [
            'display',
            'block',
            'display',
            ['property', ['property-name', 'display', [[1, 12, undefined]]], ['property-value', 'block', [[1, 20, undefined]]]],
            'display:block',
            [['rule-scope', 'a', [[1, 0, undefined]]]],
            true
          ]
        ]);
      }
    },
    'from @media': {
      'topic': function () {
        return extractProperties(_tokenize('@media{a{color:red;display:block}p{color:red}}')[0]);
      },
      'has no properties': function (tokens) {
        assert.deepEqual(tokens, [
          [
            'color',
            'red',
            'color',
            ['property', ['property-name', 'color', [[1, 9, undefined]]], ['property-value', 'red', [[1, 15, undefined]]]],
            'color:red',
            [['rule-scope', 'a', [[1, 7, undefined]]]],
            true
          ],
          [
            'display',
            'block',
            'display',
            ['property', ['property-name', 'display', [[1, 19, undefined]]], ['property-value', 'block', [[1, 27, undefined]]]],
            'display:block',
            [['rule-scope', 'a', [[1, 7, undefined]]]],
            true
          ],
          [
            'color',
            'red',
            'color',
            ['property', ['property-name', 'color', [[1, 35, undefined]]], ['property-value', 'red', [[1, 41, undefined]]]],
            'color:red',
            [['rule-scope', 'p', [[1, 33, undefined]]]],
            true
          ]
        ]);
      }
    }
  })
  .addBatch({
    'name root special cases': {
      'vendor prefix': {
        'topic': function () {
          return extractProperties(_tokenize('a{-moz-transform:none}')[0]);
        },
        'has no properties': function (tokens) {
          assert.deepEqual(tokens, [
            [
              '-moz-transform',
              'none',
              'transform',
              ['property', ['property-name', '-moz-transform', [[1, 2, undefined]]], ['property-value', 'none', [[1, 17, undefined]]]],
              '-moz-transform:none',
              [['rule-scope', 'a', [[1, 0, undefined]]]],
              true
            ]
          ]);
        }
      },
      'list-style': {
        'topic': function () {
          return extractProperties(_tokenize('a{list-style:none}')[0]);
        },
        'has no properties': function (tokens) {
          assert.deepEqual(tokens, [
            [
              'list-style',
              'none',
              'list-style',
              ['property', ['property-name', 'list-style', [[1, 2, undefined]]], ['property-value', 'none', [[1, 13, undefined]]]],
              'list-style:none',
              [['rule-scope', 'a', [[1, 0, undefined]]]],
              true
            ]
          ]);
        }
      },
      'border-radius': {
        'topic': function () {
          return extractProperties(_tokenize('a{border-top-left-radius:none}')[0]);
        },
        'has no properties': function (tokens) {
          assert.deepEqual(tokens, [
            [
              'border-top-left-radius',
              'none',
              'border-radius',
              ['property', ['property-name', 'border-top-left-radius', [[1, 2, undefined]]], ['property-value', 'none', [[1, 25, undefined]]]],
              'border-top-left-radius:none',
              [['rule-scope', 'a', [[1, 0, undefined]]]],
              true
            ]
          ]);
        }
      },
      'vendor prefixed border-radius': {
        'topic': function () {
          return extractProperties(_tokenize('a{-webkit-border-top-left-radius:none}')[0]);
        },
        'has no properties': function (tokens) {
          assert.deepEqual(tokens, [
            [
              '-webkit-border-top-left-radius',
              'none',
              'border-radius',
              ['property', ['property-name', '-webkit-border-top-left-radius', [[1, 2, undefined]]], ['property-value', 'none', [[1, 33, undefined]]]],
              '-webkit-border-top-left-radius:none',
              [['rule-scope', 'a', [[1, 0, undefined]]]],
              true
            ]
          ]);
        }
      },
      'border-image-width': {
        'topic': function () {
          return extractProperties(_tokenize('a{border-image-width:2px}')[0]);
        },
        'has no properties': function (tokens) {
          assert.deepEqual(tokens, [
            [
              'border-image-width',
              '2px',
              'border-image',
              ['property', ['property-name', 'border-image-width', [[1, 2, undefined]]], ['property-value', '2px', [[1, 21, undefined]]]],
              'border-image-width:2px',
              [['rule-scope', 'a', [[1, 0, undefined]]]],
              true
            ]
          ]);
        }
      },
      'border-color': {
        'topic': function () {
          return extractProperties(_tokenize('a{border-color:red}')[0]);
        },
        'has no properties': function (tokens) {
          assert.deepEqual(tokens, [
            [
              'border-color',
              'red',
              'border',
              ['property', ['property-name', 'border-color', [[1, 2, undefined]]], ['property-value', 'red', [[1, 15, undefined]]]],
              'border-color:red',
              [['rule-scope', 'a', [[1, 0, undefined]]]],
              true
            ]
          ]);
        }
      },
      'border-top-style': {
        'topic': function () {
          return extractProperties(_tokenize('a{border-top-style:none}')[0]);
        },
        'has no properties': function (tokens) {
          assert.deepEqual(tokens, [
            [
              'border-top-style',
              'none',
              'border-top',
              ['property', ['property-name', 'border-top-style', [[1, 2, undefined]]], ['property-value', 'none', [[1, 19, undefined]]]],
              'border-top-style:none',
              [['rule-scope', 'a', [[1, 0, undefined]]]],
              true
            ]
          ]);
        }
      },
      'border-top': {
        'topic': function () {
          return extractProperties(_tokenize('a{border-top:none}')[0]);
        },
        'has no properties': function (tokens) {
          assert.deepEqual(tokens, [
            [
              'border-top',
              'none',
              'border',
              ['property', ['property-name', 'border-top', [[1, 2, undefined]]], ['property-value', 'none', [[1, 13, undefined]]]],
              'border-top:none',
              [['rule-scope', 'a', [[1, 0, undefined]]]],
              true
            ]
          ]);
        }
      },
      'border-collapse': {
        'topic': function () {
          return extractProperties(_tokenize('a{border-collapse:collapse}')[0]);
        },
        'has no properties': function (tokens) {
          assert.deepEqual(tokens, [
            [
              'border-collapse',
              'collapse',
              'border-collapse',
              ['property', ['property-name', 'border-collapse', [[1, 2, undefined]]], ['property-value', 'collapse', [[1, 18, undefined]]]],
              'border-collapse:collapse',
              [['rule-scope', 'a', [[1, 0, undefined]]]],
              true
            ]
          ]);
        }
      },
      'text-shadow': {
        'topic': function () {
          return extractProperties(_tokenize('a{text-shadow:none}')[0]);
        },
        'has no properties': function (tokens) {
          assert.deepEqual(tokens, [
            [
              'text-shadow',
              'none',
              'text-shadow',
              ['property', ['property-name', 'text-shadow', [[1, 2, undefined]]], ['property-value', 'none', [[1, 14, undefined]]]],
              'text-shadow:none',
              [['rule-scope', 'a', [[1, 0, undefined]]]],
              true
            ]
          ]);
        }
      }
    }
  })
  .export(module);
