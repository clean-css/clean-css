var vows = require('vows');
var assert = require('assert');

var removeUnused = require('../../lib/properties/remove-unused');
var wrapForOptimizing = require('../../lib/properties/wrap-for-optimizing').all;

vows.describe(removeUnused)
  .addBatch({
    'it removes unused only': {
      'topic': function () {
        var properties = [
          [['background'], ['none']],
          [['color'], ['red']]
        ];
        var _properties = wrapForOptimizing(properties);
        _properties[0].unused = true;

        removeUnused(_properties);
        return properties;
      },
      'it has one property left': function (properties) {
        assert.lengthOf(properties, 1);
        assert.equal(properties[0][0], 'color');
      }
    }
  })
  .export(module);
