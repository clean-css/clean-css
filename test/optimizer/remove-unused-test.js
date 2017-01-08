var vows = require('vows');
var assert = require('assert');

var removeUnused = require('../../lib/optimizer/remove-unused');
var wrapForOptimizing = require('../../lib/optimizer/wrap-for-optimizing').all;

vows.describe(removeUnused)
  .addBatch({
    'it removes unused only': {
      'topic': function () {
        var properties = [
          [
            'property',
            ['property-name', 'background'],
            ['property-value', 'none']
          ],
          [
            'property',
            ['property-name', 'color'],
            ['property-value', 'red']
          ]
        ];
        var _properties = wrapForOptimizing(properties);
        _properties[0].unused = true;

        removeUnused(_properties);
        return properties;
      },
      'it has one property left': function (properties) {
        assert.lengthOf(properties, 1);
        assert.equal(properties[0][1][1], 'color');
      }
    },
    'it respects comments': {
      'topic': function () {
        var properties = [
          [
            'property',
            ['property-name', 'background'],
            ['property-value', 'none']
          ],
          [
            'comment',
            ['/* comment */']
          ],
          [
            'property',
            ['property-name', 'color'],
            ['property-value', 'red']
          ]
        ];
        var _properties = wrapForOptimizing(properties);
        _properties[1].unused = true;

        removeUnused(_properties);
        return properties;
      },
      'it has one property left': function (properties) {
        assert.lengthOf(properties, 2);
        assert.equal(properties[0][1][1], 'background');
        assert.equal(properties[1][1][0], '/* comment */');
      }
    }
  })
  .export(module);
