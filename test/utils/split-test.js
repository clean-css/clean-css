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
    'with regex': {
      topic: 'no-repeat,0/0',
      split: function (input) {
        assert.deepEqual(split(input, /[ ,\/]/), ['no-repeat', '0', '0']);
      }
    }
  })
  .addBatch({
    'including separator - leading space and quote': {
      topic: ' "Font"',
      split: function (input) {
        assert.deepEqual(split(input, ' ', true), [' "Font"']);
      }
    },
    'including separator - comma separated - level 2': {
      topic: 'linear-gradient(0,#fff,rgba(0,0,0)),red',
      split: function (input) {
        assert.deepEqual(split(input, ',', true), ['linear-gradient(0,#fff,rgba(0,0,0)),', 'red']);
      }
    },
    'including separator - space separated - level 2 with spaces': {
      topic: 'linear-gradient(0, #fff, rgba(0, 0, 0)) red',
      split: function (input) {
        assert.deepEqual(split(input, ' ', true), ['linear-gradient(0, #fff, rgba(0, 0, 0)) ', 'red']);
      }
    },
    'including separator - with regex': {
      topic: 'no-repeat,0/0',
      split: function (input) {
        assert.deepEqual(split(input, /[ ,\/]/, true), ['no-repeat,', '0/', '0']);
      }
    }
  })
  .addBatch({
    'with custom wrappers - level 1': {
      topic: 'a{ color:red; width:100% } p{ color:red }',
      split: function (input) {
        assert.deepEqual(split(input, ' ', true, '{', '}'), [ 'a{ color:red; width:100% } ', 'p{ color:red }' ]);
      }
    },
    'with custom wrappers - level 2': {
      topic: 'a{ color:red; --var { color:red; display: none } } p{ color:red }',
      split: function (input) {
        assert.deepEqual(split(input, ' ', true, '{', '}'), [ 'a{ color:red; --var { color:red; display: none } } ', 'p{ color:red }' ]);
      }
    },
    'semicolon separated - variable list': {
      topic: '--my-toolbar:{color:red;width:100%}',
      split: function (input) {
        assert.deepEqual(split(input, ';', false, '{', '}'), ['--my-toolbar:{color:red;width:100%}']);
      }
    },
    'with custom wrappers - on close brace': {
      topic: 'a{ color:red; --var { color:red; display: none } } p{ color:red }',
      split: function (input) {
        assert.deepEqual(split(input, '}', true, '{', '}'), [ 'a{ color:red; --var { color:red; display: none } }', ' p{ color:red }', '' ]);
      }
    }
  })
  .export(module);
