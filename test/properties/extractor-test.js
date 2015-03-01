var vows = require('vows');
var assert = require('assert');
var SelectorTokenizer = require('../../lib/selectors/tokenizer');
var extractor = require('../../lib/properties/extractor');

function buildToken(source) {
  return new SelectorTokenizer({ options: {} }, true, false).toTokens(source)[0];
}

vows.describe(extractor)
  .addBatch({
    'no properties': {
      'topic': extractor(buildToken('a{}')),
      'has no properties': function (tokens) {
        assert.deepEqual(tokens, []);
      }
    },
    'no valid properties': {
      'topic': extractor(buildToken('a{:red}')),
      'has no properties': function (tokens) {
        assert.deepEqual(tokens, []);
      }
    },
    'one property': {
      'topic': extractor(buildToken('a{color:red}')),
      'has no properties': function (tokens) {
        assert.deepEqual(tokens, [['color', 'red', 'color', 'color:red', ['a'], true]]);
      }
    },
    'one property - complex selector': {
      'topic': extractor(buildToken('.one{color:red}')),
      'has no properties': function (tokens) {
        assert.deepEqual(tokens, [['color', 'red', 'color', 'color:red', ['.one'], false]]);
      }
    },
    'two properties': {
      'topic': extractor(buildToken('a{color:red;display:block}')),
      'has no properties': function (tokens) {
        assert.deepEqual(tokens, [
          ['color', 'red', 'color', 'color:red', ['a'], true],
          ['display', 'block', 'display', 'display:block', ['a'], true]
        ]);
      }
    },
    'from @media': {
      'topic': extractor(buildToken('@media{a{color:red;display:block}p{color:red}}')),
      'has no properties': function (tokens) {
        assert.deepEqual(tokens, [
          ['color', 'red', 'color', 'color:red', ['a'], true],
          ['display', 'block', 'display', 'display:block', ['a'], true],
          ['color', 'red', 'color', 'color:red', ['p'], true]
        ]);
      }
    }
  })
  .addBatch({
    'name root special cases': {
      'vendor prefix': {
        'topic': extractor(buildToken('a{-moz-transform:none}')),
        'has no properties': function (tokens) {
          assert.deepEqual(tokens, [['-moz-transform', 'none', 'transform', '-moz-transform:none', ['a'], true]]);
        }
      },
      'list-style': {
        'topic': extractor(buildToken('a{list-style:none}')),
        'has no properties': function (tokens) {
          assert.deepEqual(tokens, [['list-style', 'none', 'list-style', 'list-style:none', ['a'], true]]);
        }
      },
      'border-radius': {
        'topic': extractor(buildToken('a{border-top-left-radius:none}')),
        'has no properties': function (tokens) {
          assert.deepEqual(tokens, [['border-top-left-radius', 'none', 'border-radius', 'border-top-left-radius:none', ['a'], true]]);
        }
      },
      'vendor prefixed border-radius': {
        'topic': extractor(buildToken('a{-webkit-border-top-left-radius:none}')),
        'has no properties': function (tokens) {
          assert.deepEqual(tokens, [['-webkit-border-top-left-radius', 'none', 'border-radius', '-webkit-border-top-left-radius:none', ['a'], true]]);
        }
      },
      'border-image': {
        'topic': extractor(buildToken('a{border-image-width:2px}')),
        'has no properties': function (tokens) {
          assert.deepEqual(tokens, [['border-image-width', '2px', 'border-image', 'border-image-width:2px', ['a'], true]]);
        }
      },
      'border-top': {
        'topic': extractor(buildToken('a{border-top-style:none}')),
        'has no properties': function (tokens) {
          assert.deepEqual(tokens, [['border-top-style', 'none', 'border-top', 'border-top-style:none', ['a'], true]]);
        }
      },
      'text-shadow': {
        'topic': extractor(buildToken('a{text-shadow:none}')),
        'has no properties': function (tokens) {
          assert.deepEqual(tokens, [['text-shadow', 'none', 'text-shadow', 'text-shadow:none', ['a'], true]]);
        }
      }
    }
  })
  .export(module);
