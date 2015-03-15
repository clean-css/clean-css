var vows = require('vows');
var assert = require('assert');
var Chunker = require('../../lib/utils/chunker');

vows.describe(Chunker)
  .addBatch({
    'empty string': {
      'topic': function () {
        return new Chunker('', '', 128);
      },
      'is empty': function (chunker) {
        assert.isTrue(chunker.isEmpty());
      },
      'has no next': function (chunker) {
        assert.isUndefined(chunker.next());
      }
    },
    'css': {
      'topic': function () {
        return new Chunker('a{color:red}p{}', '}', 3);
      },
      'is not empty': function (chunker) {
        assert.isFalse(chunker.isEmpty());
      },
      'breaks at first brace': function (chunker) {
        assert.equal(chunker.next(), 'a{color:red}');
      },
      'breaks at second brace': function (chunker) {
        assert.equal(chunker.next(), 'p{}');
      }
    },
    'comments': {
      'topic': function () {
        return new Chunker('/* one */ /* two */', '*/', 3);
      },
      'is not empty': function (chunker) {
        assert.isFalse(chunker.isEmpty());
      },
      'breaks at first brace': function (chunker) {
        assert.equal(chunker.next(), '/* one */');
      },
      'breaks at second brace': function (chunker) {
        assert.equal(chunker.next(), ' /* two */');
      }
    }
  })
  .export(module);
