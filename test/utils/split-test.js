var vows = require('vows');
var assert = require('assert');
var split = require('../../lib/utils/split');

vows.describe(split)
  .addBatch({
    'empty': {
      topic: '',
      split: function (input) {
        assert.deepEqual(split(input, ','), ['']);
      }
    },
    'simple': {
      topic: 'none',
      split: function (input) {
        assert.deepEqual(split(input, ','), ['none']);
      }
    },
    'comma separated - level 0': {
      topic: '#000,#fff,#0f0',
      split: function (input) {
        assert.deepEqual(split(input, ','), ['#000', '#fff', '#0f0']);
      }
    },
    'comma separated - level 1': {
      topic: 'rgb(0,0,0),#fff',
      split: function (input) {
        assert.deepEqual(split(input, ','), ['rgb(0,0,0)', '#fff']);
      }
    },
    'comma separated - level 2': {
      topic: 'linear-gradient(0,#fff,rgba(0,0,0)),red',
      split: function (input) {
        assert.deepEqual(split(input, ','), ['linear-gradient(0,#fff,rgba(0,0,0))', 'red']);
      }
    },
    'space separated - level 0': {
      topic: '#000 #fff #0f0',
      split: function (input) {
        assert.deepEqual(split(input, ' '), ['#000', '#fff', '#0f0']);
      }
    },
    'space separated - level 1': {
      topic: 'rgb(0, 0, 0) #fff',
      split: function (input) {
        assert.deepEqual(split(input, ' '), ['rgb(0, 0, 0)', '#fff']);
      }
    },
    'space separated - level 2': {
      topic: 'linear-gradient(0, #fff, rgba(0, 0, 0)) red',
      split: function (input) {
        assert.deepEqual(split(input, ' '), ['linear-gradient(0, #fff, rgba(0, 0, 0))', 'red']);
      }
    },
    'semicolon separated - single': {
      topic: 'apply(--var);',
      split: function (input) {
        assert.deepEqual(split(input, ';'), ['apply(--var)']);
      }
    },
    'semicolon separated - double': {
      topic: 'apply(--var);color:red;',
      split: function (input) {
        assert.deepEqual(split(input, ';'), ['apply(--var)', 'color:red']);
      }
    }
  })
  .export(module);
