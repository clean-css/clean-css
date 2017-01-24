var assert = require('assert');

var vows = require('vows');

var isAllowedResource = require('../../lib/reader/is-allowed-resource');

vows.describe(isAllowedResource)
  .addBatch({
    'local and remote': {
      'topic': 'http://127.0.0.1/remote.css',
      'is allowed': function (topic) {
        assert.isTrue(isAllowedResource(topic, true, ['local', 'remote']));
      }
    },
    'remote and local': {
      'topic': 'http://127.0.0.1/remote.css',
      'is allowed': function (topic) {
        assert.isTrue(isAllowedResource(topic, true, ['remote', 'local']));
      }
    }
  })
  .addBatch({
    'local URI': {
      'topic': 'test/fixtures/partials/one.css',
      'is allowed': function (topic) {
        assert.isTrue(isAllowedResource(topic, false, [topic]));
      }
    },
    'local matching URI prefix': {
      'topic': 'test/fixtures/partials/one.css',
      'is allowed': function (topic) {
        assert.isTrue(isAllowedResource(topic, false, ['test/fixtures/partials']));
      }
    },
    'local not matching URI prefix': {
      'topic': 'test/fixtures/partials/one.css',
      'is not allowed': function (topic) {
        assert.isFalse(isAllowedResource(topic, false, ['test/fixtures/partials-relative']));
      }
    },
    'remote URI': {
      'topic': 'http://127.0.0.1/styles.css',
      'is allowed': function (topic) {
        assert.isTrue(isAllowedResource(topic, true, [topic]));
      }
    },
    'remote matching URI prefix': {
      'topic': 'http://127.0.0.1/path/to/styles.css',
      'is allowed': function (topic) {
        assert.isTrue(isAllowedResource(topic, true, ['http://127.0.0.1/path/to']));
      }
    },
    'remote not matching URI prefix': {
      'topic': 'http://127.0.0.1/path/to/styles.css',
      'is not allowed': function (topic) {
        assert.isFalse(isAllowedResource(topic, true, ['http://127.0.0.1/another/path/to']));
      }
    }
  })
  .addBatch({
    'negated rule': {
      'topic': 'http://127.0.0.1/path/to/styles.css',
      'is not allowed': function (topic) {
        assert.isFalse(isAllowedResource(topic, true, ['!127.0.0.1']));
      }
    },
    'negated rules': {
      'topic': 'http://127.0.0.1/path/to/styles.css',
      'is not allowed': function (topic) {
        assert.isFalse(isAllowedResource(topic, true, ['!127.0.0.1', '!assets.127.0.0.1']));
      }
    },
    'negated remote then local rules': {
      'topic': 'http://127.0.0.1/path/to/styles.css',
      'is not allowed': function (topic) {
        assert.isFalse(isAllowedResource(topic, true, ['!127.0.0.1', '!assets.127.0.0.1', '!path/to/styles.css']));
      }
    }
  })
  .export(module);
