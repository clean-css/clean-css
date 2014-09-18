var vows = require('vows');
var assert = require('assert');
var EscapeStore = require('../../lib/text/escape-store');

vows.describe('escape-store')
  .addBatch({
    'data': {
      topic: new EscapeStore('TEST'),
      store: function (escapeStore) {
        var placeholder = escapeStore.store('data');
        assert.equal(placeholder, '__ESCAPED_TEST_CLEAN_CSS0__');
      },
      restore: function (escapeStore) {
        var data = escapeStore.restore('__ESCAPED_TEST_CLEAN_CSS0__');
        assert.equal(data, 'data');
      }
    }
  })
  .export(module);
