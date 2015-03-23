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
    'underscore hack': {
      'topic': [['selector', ['a'], [[['_color'], ['red']]] ]],
      'metadata': function (tokens) {
        addOptimizationMetadata(tokens);
        assert.deepEqual(tokens, [['selector', ['a'], [[['_color', false, true], ['red']]] ]]);
      }
    },
    'star hack': {
      'topic': [['selector', ['a'], [[['_color'], ['red']]] ]],
      'metadata': function (tokens) {
        addOptimizationMetadata(tokens);
        assert.deepEqual(tokens, [['selector', ['a'], [[['_color', false, true], ['red']]] ]]);
      }
    },
    'backslash hack': {
      'topic': [['selector', ['a'], [[['color'], ['red\\9']]] ]],
      'metadata': function (tokens) {
        addOptimizationMetadata(tokens);
        assert.deepEqual(tokens, [['selector', ['a'], [[['color', false, true], ['red\\9']]] ]]);
      }
    },
    'backslash hack - value of length 1': {
      'topic': [['selector', ['a'], [[['width'], ['0']]] ]],
      'metadata': function (tokens) {
        addOptimizationMetadata(tokens);
        assert.deepEqual(tokens, [['selector', ['a'], [[['width', false, false], ['0']]] ]]);
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
