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
  }).addBatch({
    'local and !file without path':{
        'topic':'style.css',
        'is not allowed': function (topic) {
            assert.isFalse(isAllowedResource(topic, false, ['local', '!style.css']));
        }
    },
    'local and !file including path':{
      'topic':'../path/to/style.css',
      'is not allowed': function (topic) {
            assert.isFalse(isAllowedResource(topic, false, ['!style.css', 'local']));
        }
    },
    'remote and !file':{
        'topic':'http://example.com/path/to/styles.css',
        'is not allowed': function (topic) {
            assert.isFalse(isAllowedResource(topic, true, ['remote', 'local', '!http://example.com/path/to/styles.css']));
        }
    },
    'remote and !file v2':{
        'topic':'http://example.com/path/to/styles2.css',
        'is not allowed': function (topic) {
            assert.isTrue(isAllowedResource(topic, true, ['remote', 'local', '!http://example.com/path/to/styles.css']));
        }
    },
    'blacklisted domain':{
        'topic':'http://example.com/path/to/styles.css',
            'is not allowed': function (topic) {
            assert.isFalse(isAllowedResource(topic, true, ['remote', '!example.com']));
        }
    },
    'blacklisted domain with protocol':{
        'topic':'http://example.com/path/to/styles.css',
        'is not allowed': function (topic) {
            assert.isFalse(isAllowedResource(topic, true, ['remote', '!http://example.com']));
        }
    },
    'blacklisted domain3':{
        'topic':'http://example.com/path/to/styles.css',
        'is not allowed': function (topic) {
            assert.isTrue(isAllowedResource(topic, true, ['remote', '!http://example2.com']));
        }
    }
}).export(module);
