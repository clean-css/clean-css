var vows = require('vows');
var assert = require('assert');
var Chunker = require('../../lib/utils/chunker');

vows.describe(Chunker)
  .addBatch({
    'empty string': {
      topic: new Chunker('', '', 128),
      'is empty': function (chunker) {
        assert.isTrue(chunker.isEmpty());
      },
      'has no next': function (chunker) {
        assert.isUndefined(chunker.next());
      }
    },
    'css': {
      topic: new Chunker('a{color:red}p{}', '}', 3),
      'is not empty': function (chunker) {
        assert.isFalse(chunker.isEmpty());
      },
      'breaks at first brace': function (chunker) {
        assert.equal('a{color:red}', chunker.next());
      },
      'breaks at second brace': function (chunker) {
        assert.equal('p{}', chunker.next());
      }
    },
    'comments': {
      topic: new Chunker('/* one */ /* two */', '*/', 3),
      'is not empty': function (chunker) {
        assert.isFalse(chunker.isEmpty());
      },
      'breaks at first brace': function (chunker) {
        assert.equal('/* one */', chunker.next());
      },
      'breaks at second brace': function (chunker) {
        assert.equal(' /* two */', chunker.next());
      }
    }
  })
  .export(module);
