var vows = require('vows');
var assert = require('assert');

var addOptimizationMetadata = require('../../lib/selectors/optimization-metadata');

vows.describe(addOptimizationMetadata)
  .addBatch({
    'comment': {
      'topic': [['selector', ['a'], ['/* comment */']]],
      'metadata': function (tokens) {
        addOptimizationMetadata(tokens);
        assert.deepEqual(tokens, [['selector', ['a'], ['/* comment */']]]);
      }
    },
    'normal': {
      'topic': [['selector', ['a'], [[['color'], ['red']]] ]],
      'metadata': function (tokens) {
        addOptimizationMetadata(tokens);
        assert.deepEqual(tokens, [['selector', ['a'], [[['color', false, false], ['red']]] ]]);
      }
    },
    'important': {
      'topic': [['selector', ['a'], [[['color'], ['red!important']]] ]],
      'metadata': function (tokens) {
        addOptimizationMetadata(tokens);
        assert.deepEqual(tokens, [['selector', ['a'], [[['color', true, false], ['red']]] ]]);
      }
    },
    'flat block': {
      'topic': [['flat-block', ['@font-face'], [[['font-family'], ['x']]] ]],
      'metadata': function (tokens) {
        addOptimizationMetadata(tokens);
        assert.deepEqual(tokens, [['flat-block', ['@font-face'], [[['font-family', false, false], ['x']]] ]]);
      }
    },
    'underscore hack': {
      'topic': [['selector', ['a'], [[['_color'], ['red']]] ]],
      'metadata': function (tokens) {
        addOptimizationMetadata(tokens);
        assert.deepEqual(tokens, [['selector', ['a'], [[['color', false, 'underscore'], ['red']]] ]]);
      }
    },
    'star hack': {
      'topic': [['selector', ['a'], [[['*color'], ['red']]] ]],
      'metadata': function (tokens) {
        addOptimizationMetadata(tokens);
        assert.deepEqual(tokens, [['selector', ['a'], [[['color', false, 'star'], ['red']]] ]]);
      }
    },
    'backslash hack': {
      'topic': [['selector', ['a'], [[['color'], ['red\\9']]] ]],
      'metadata': function (tokens) {
        addOptimizationMetadata(tokens);
        assert.deepEqual(tokens, [['selector', ['a'], [[['color', false, 'suffix'], ['red']]] ]]);
      }
    },
    'backslash hack - value of length 1': {
      'topic': [['selector', ['a'], [[['width'], ['0']]] ]],
      'metadata': function (tokens) {
        addOptimizationMetadata(tokens);
        assert.deepEqual(tokens, [['selector', ['a'], [[['width', false, false], ['0']]] ]]);
      }
    },
    'backslash hack - space between values123': {
      'topic': [['selector', ['a'], [[['width'], ['0'], ['\\9']]] ]],
      'metadata': function (tokens) {
        addOptimizationMetadata(tokens);
        assert.deepEqual(tokens, [['selector', ['a'], [[['width', false, 'suffix'], ['0']]] ]]);
      }
    }
  })
  .addBatch({
    'source map': {
      'topic': [['selector', ['a', 1, 0, undefined], [[['color', 1, 2, undefined], ['red', 1, 2, undefined]]] ]],
      'metadata': function (tokens) {
        addOptimizationMetadata(tokens);
        assert.deepEqual(tokens, [['selector', ['a', 1, 0, undefined], [[['color', false, false, 1, 2, undefined], ['red', 1, 2, undefined]]] ]]);
      }
    }
  })
  .export(module);
