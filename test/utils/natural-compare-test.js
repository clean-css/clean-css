var assert = require('assert');

var vows = require('vows');

var naturalCompare = require('../../lib/utils/natural-compare');

vows.describe(naturalCompare)
  .addBatch({
    'numbers': {
      'topic': [2, 3, 1, 5, 4, 11, 22],
      'are sorted': function (list) {
        assert.deepEqual(list.sort(naturalCompare), [1, 2, 3, 4, 5, 11, 22]);
      }
    },
    'numbers and strings': {
      'topic': ['2', 3, 1, 5, '4', '11', '22'],
      'are sorted': function (list) {
        assert.deepEqual(list.sort(naturalCompare), [1, '2', 3, '4', 5, '11', '22']);
      }
    },
    'strings': {
      'topic': ['2', '3', '1', '5', '4', '11', '22'],
      'are sorted': function (list) {
        assert.deepEqual(list.sort(naturalCompare), ['1', '2', '3', '4', '5', '11', '22']);
      }
    },
    'strings with same prefix': {
      'topic': ['x2', 'x3', 'x1', 'x5', 'x4', 'x11', 'x22'],
      'are sorted': function (list) {
        assert.deepEqual(list.sort(naturalCompare), ['x1', 'x2', 'x3', 'x4', 'x5', 'x11', 'x22']);
      }
    },
    'strings with different prefixes': {
      'topic': ['x2', 'x3', 'x1', 'y5', 'y4', 'y11', 'y22'],
      'are sorted': function (list) {
        assert.deepEqual(list.sort(naturalCompare), ['x1', 'x2', 'x3', 'y4', 'y5', 'y11', 'y22']);
      }
    },
    'strings with different prefixes and suffixes of different length': {
      'topic': ['x2a1', 'x3', 'x1b2', 'x2a2', 'x3a1', 'x33', 'x1b21'],
      'are sorted': function (list) {
        assert.deepEqual(list.sort(naturalCompare), ['x1b2', 'x1b21', 'x2a1', 'x2a2', 'x3', 'x3a1', 'x33']);
      }
    }
  })
  .addBatch({
    'objects': {
      'topic': [['a', 1], ['a0', 2], ['a0', 3], ['a1', 5], ['a0', 4], ['a0', 5], ['a0', 1]],
      'are sorted': function (list) {
        var sortedList = list.sort(function (o1, o2) {
          return naturalCompare(o1[0], o2[0]);
        });

        assert.deepEqual(sortedList, [['a', 1], ['a0', 2], ['a0', 3], ['a0', 4], ['a0', 5], ['a0', 1], ['a1', 5]]);
      }
    }
  })
  .export(module);
