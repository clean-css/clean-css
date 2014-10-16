var vows = require('vows');
var assert = require('assert');
var EscapeStore = require('../../lib/text/escape-store');

vows.describe(EscapeStore)
  .addBatch({
    'no metadata': {
      topic: new EscapeStore('TEST'),
      store: function (escapeStore) {
        var placeholder = escapeStore.store('data');
        assert.equal(placeholder, '__ESCAPED_TEST_CLEAN_CSS0__');
      },
      match: function (escapeStore) {
        var next = escapeStore.nextMatch('prefix__ESCAPED_TEST_CLEAN_CSS0__suffix');
        assert.equal(next.start, 6);
        assert.equal(next.end, 33);
        assert.equal(next.match, '__ESCAPED_TEST_CLEAN_CSS0__');
      },
      restore: function (escapeStore) {
        var data = escapeStore.restore('__ESCAPED_TEST_CLEAN_CSS0__');
        assert.equal(data, 'data');
      }
    },
    'with metadata': {
      topic: new EscapeStore('TEST'),
      store: function (escapeStore) {
        var placeholder = escapeStore.store('data', ['brown', 'fox', 'jumped', 'over']);
        assert.equal(placeholder, '__ESCAPED_TEST_CLEAN_CSS0(brown,fox,jumped,over)__');
      },
      match: function (escapeStore) {
        var next = escapeStore.nextMatch('prefix__ESCAPED_TEST_CLEAN_CSS0(brown,fox,jumped,over)__suffix');
        assert.equal(next.start, 6);
        assert.equal(next.end, 56);
        assert.equal(next.match, '__ESCAPED_TEST_CLEAN_CSS0(brown,fox,jumped,over)__');
      },
      restore: function (escapeStore) {
        var data = escapeStore.restore('__ESCAPED_TEST_CLEAN_CSS0(brown,fox,jumped,over)__');
        assert.equal(data, 'data');
      }
    },
    'same data with different metadata': {
      topic: new EscapeStore('TEST'),
      'store first': function (escapeStore) {
        escapeStore.store('data1', [0, 1, 2]);
        var placeholder = escapeStore.store('data1', [1, 2, 3]);

        assert.equal(placeholder, '__ESCAPED_TEST_CLEAN_CSS0(1,2,3)__');
      }
    },
    'with different metadata but same index': {
      topic: function () {
        var escapeStore = new EscapeStore('TEST');
        escapeStore.store('data', ['brown', 'fox']);
        escapeStore.store('data', ['jumped', 'over']);
        return escapeStore;
      },
      restore: function (escapeStore) {
        var data = escapeStore.restore('__ESCAPED_TEST_CLEAN_CSS0(a,lazy,dog)__');
        assert.equal(data, 'data');
      }
    }
  })
  .export(module);
