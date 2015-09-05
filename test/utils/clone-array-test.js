var vows = require('vows');
var assert = require('assert');
var cloneArray = require('../../lib/utils/clone-array');

vows.describe(cloneArray)
  .addBatch({
    'one level': {
      'topic': [1, 2, 3],
      'not equal': function (topic) {
        assert.notEqual(topic, cloneArray(topic));
      },
      'deep equal': function (topic) {
        assert.deepEqual(topic, cloneArray(topic));
      }
    },
    'two levels': {
      'topic': [[1], [2], [3]],
      'not equal': function (topic) {
        assert.notEqual(topic[0], cloneArray(topic)[0]);
        assert.notEqual(topic[1], cloneArray(topic)[1]);
        assert.notEqual(topic[2], cloneArray(topic)[2]);
      },
      'deep equal': function (topic) {
        assert.deepEqual(topic, cloneArray(topic));
      }
    },
    'mixed levels': {
      'topic': [[1], 2, 3],
      'not equal': function (topic) {
        assert.notEqual(topic[0], cloneArray(topic)[0]);
        assert.equal(topic[1], cloneArray(topic)[1]);
        assert.equal(topic[2], cloneArray(topic)[2]);
      },
      'deep equal': function (topic) {
        assert.deepEqual(topic, cloneArray(topic));
      }
    }
  })
  .export(module);
