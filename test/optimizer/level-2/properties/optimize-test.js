var assert = require('assert');
var vows = require('vows');

var optimizeProperties = require('../../../../lib/optimizer/level-2/properties/optimize');

var tokenize = require('../../../../lib/tokenizer/tokenize');
var inputSourceMapTracker = require('../../../../lib/reader/input-source-map-tracker');
var compatibilityFrom = require('../../../../lib/options/compatibility');
var validator = require('../../../../lib/optimizer/validator');

function _optimize(source, compatibilityOptions) {
  var compat = compatibilityFrom(compatibilityOptions);
  var options = {
    compatibility: compat,
    level: {
      2: {
        mergeIntoShorthands: true,
        mergeMedia: false,
        mergeSemantically: false,
        overrideProperties: true,
        restructureRules: false
      }
    }
  };
  var tokens = tokenize(source, {
    inputSourceMapTracker: inputSourceMapTracker(),
    options: {},
    warnings: []
  });

  optimizeProperties(
    tokens[0][2],
    true,
    true,
    { options: options, validator: validator(compat) }
  );

  return tokens[0][2];
}

vows.describe(optimizeProperties)
  .addBatch({
    'of two properties': {
      'topic': function () {
        return _optimize('a{display:inline-block;color:red;display:block}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'color', [[1, 23, undefined]]],
            ['property-value', 'red', [[1, 29, undefined]]]
          ],
          [
            'property',
            ['property-name', 'display', [[1, 33, undefined]]],
            ['property-value', 'block', [[1, 41, undefined]]]
          ]
        ]);
      }
    },
    'of two adjacent properties': {
      'topic': function () {
        return _optimize('a{display:-moz-inline-box;display:inline-block}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'display', [[1, 26, undefined]]],
            ['property-value', 'inline-block', [[1, 34, undefined]]]
          ]
        ]);
      }
    },
    'of two same properties with same value where latter is a hack': {
      'topic': function () {
        return _optimize('a{margin:0;_margin:0}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'margin', [[1, 2, undefined]]],
            ['property-value', '0', [[1, 9, undefined]]]
          ],
          [
            'property',
            ['property-name', '_margin', [[1, 11, undefined]]],
            ['property-value', '0', [[1, 19, undefined]]]
          ]
        ]);
      }
    },
    'of two same properties with same value where latter is !important': {
      'topic': function () {
        return _optimize('a{margin:0;margin:0 !important}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'margin', [[1, 11, undefined]]],
            ['property-value', '0!important', [[1, 18, undefined]]]
          ]
        ]);
      }
    },
    'of two properties where former is !important': {
      'topic': function () {
        return _optimize('a{display:inline-block!important;color:red;display:block}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'display', [[1, 2, undefined]]],
            ['property-value', 'inline-block!important', [[1, 10, undefined]]]
          ],
          [
            'property',
            ['property-name', 'color', [[1, 33, undefined]]],
            ['property-value', 'red', [[1, 39, undefined]]]
          ]
        ]);
      }
    },
    'of two properties where latter is !important': {
      'topic': function () {
        return _optimize('a{display:inline-block;color:red;display:block!important}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'color', [[1, 23, undefined]]],
            ['property-value', 'red', [[1, 29, undefined]]]
          ],
          [
            'property',
            ['property-name', 'display', [[1, 33, undefined]]],
            ['property-value', 'block!important', [[1, 41, undefined]]]
          ]
        ]);
      }
    },
    'of two properties where both are !important': {
      'topic': function () {
        return _optimize('a{display:inline-block!important;color:red;display:block!important}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'color', [[1, 33, undefined]]],
            ['property-value', 'red', [[1, 39, undefined]]]
          ],
          [
            'property',
            ['property-name', 'display', [[1, 43, undefined]]],
            ['property-value', 'block!important', [[1, 51, undefined]]]
          ]
        ]);
      }
    },
    'of many properties': {
      'topic': function () {
        return _optimize('a{display:inline-block;color:red;font-weight:bolder;font-weight:700;display:block!important;color:#fff}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'font-weight', [[1, 52, undefined]]],
            ['property-value', '700', [[1, 64, undefined]]]
          ],
          [
            'property',
            ['property-name', 'display', [[1, 68, undefined]]],
            ['property-value', 'block!important', [[1, 76, undefined]]]
          ],
          [
            'property',
            ['property-name', 'color', [[1, 92, undefined]]],
            ['property-value', '#fff', [[1, 98, undefined]]]
          ]
        ]);
      }
    },
    'both redefined': {
      'topic': function () {
        return _optimize('p{display:block;display:-moz-inline-box;color:red;display:table-cell}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'color', [[1, 40, undefined]]],
            ['property-value', 'red', [[1, 46, undefined]]]
          ],
          [
            'property',
            ['property-name', 'display', [[1, 50, undefined]]],
            ['property-value', 'table-cell', [[1, 58, undefined]]]
          ]
        ]);
      }
    },
    'filter treated as background': {
      'topic': function () {
        return _optimize('p{background:-moz-linear-gradient();background:-webkit-linear-gradient();filter:"progid:DXImageTransform";background:linear-gradient()}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', '-moz-linear-gradient()', [[1, 13, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background', [[1, 36, undefined]]],
            ['property-value', '-webkit-linear-gradient()', [[1, 47, undefined]]]
          ],
          [
            'property',
            ['property-name', 'filter', [[1, 73, undefined]]],
            ['property-value', '"progid:DXImageTransform"', [[1, 80, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background', [[1, 106, undefined]]],
            ['property-value', 'linear-gradient()', [[1, 117, undefined]]]
          ]
        ]);
      }
    },
    'filter treated as background-image': {
      'topic': function () {
        return _optimize('p{background-image:-moz-linear-gradient();background-image:-webkit-linear-gradient();filter:"progid:DXImageTransform";background-image:linear-gradient()}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background-image', [[1, 2, undefined]]],
            ['property-value', '-moz-linear-gradient()', [[1, 19, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-image', [[1, 42, undefined]]],
            ['property-value', '-webkit-linear-gradient()', [[1, 59, undefined]]]
          ],
          [
            'property',
            ['property-name', 'filter', [[1, 85, undefined]]],
            ['property-value', '"progid:DXImageTransform"', [[1, 92, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-image', [[1, 118, undefined]]],
            ['property-value', 'linear-gradient()', [[1, 135, undefined]]]
          ]
        ]);
      }
    },
    '-ms-filter treated as background': {
      'topic': function () {
        return _optimize('p{background:-moz-linear-gradient();background:-webkit-linear-gradient();-ms-filter:"progid:DXImageTransform";background:linear-gradient()}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', '-moz-linear-gradient()', [[1, 13, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background', [[1, 36, undefined]]],
            ['property-value', '-webkit-linear-gradient()', [[1, 47, undefined]]]
          ],
          [
            'property',
            ['property-name', '-ms-filter', [[1, 73, undefined]]],
            ['property-value', '"progid:DXImageTransform"', [[1, 84, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background', [[1, 110, undefined]]],
            ['property-value', 'linear-gradient()', [[1, 121, undefined]]]
          ]
        ]);
      }
    },
    '-ms-filter treated as background-image': {
      'topic': function () {
        return _optimize('p{background-image:-moz-linear-gradient();background-image:-webkit-linear-gradient();-ms-filter:"progid:DXImageTransform";background-image:linear-gradient()}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background-image', [[1, 2, undefined]]],
            ['property-value', '-moz-linear-gradient()', [[1, 19, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-image', [[1, 42, undefined]]],
            ['property-value', '-webkit-linear-gradient()', [[1, 59, undefined]]]
          ],
          [
            'property',
            ['property-name', '-ms-filter', [[1, 85, undefined]]],
            ['property-value', '"progid:DXImageTransform"', [[1, 96, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-image', [[1, 122, undefined]]],
            ['property-value', 'linear-gradient()', [[1, 139, undefined]]]
          ]
        ]);
      }
    },
    'longhand then shorthand 123': {
      'topic': function () {
        return _optimize('p{border-left-style:solid;border:1px dotted red}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border', [[1, 26, undefined]]],
            ['property-value', '1px', [[1, 33, undefined]]],
            ['property-value', 'dotted', [[1, 37, undefined]]],
            ['property-value', 'red', [[1, 44, undefined]]]
          ]
        ]);
      }
    },
    'longhand then shorthand with important': {
      'topic': function () {
        return _optimize('p{border-left-style:solid!important;border:1px dotted red}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border-left-style', [[1, 2, undefined]]],
            ['property-value', 'solid!important', [[1, 20, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border', [[1, 36, undefined]]],
            ['property-value', '1px', [[1, 43, undefined]]],
            ['property-value', 'dotted', [[1, 47, undefined]]],
            ['property-value', 'red', [[1, 54, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then longhand': {
      'topic': function () {
        return _optimize('p{background:url(image.png);background-image:#fff}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'url(image.png)', [[1, 13, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-image', [[1, 28, undefined]]],
            ['property-value', '#fff', [[1, 45, undefined]]]
          ]
        ]);
      }
    }
  })
  .addBatch({
    'list-style fuzzy matching': {
      'topic': function () {
        return _optimize('p{list-style:inside none}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'list-style', [[1, 2, undefined]]],
            ['property-value', 'none', [[1, 20, undefined]]],
            ['property-value', 'inside', [[1, 13, undefined]]]
          ]
        ]);
      }
    }
  })
  .addBatch({
    'ie hacks - normal before hack': {
      'topic': function () {
        return _optimize('p{color:red;display:none;color:#fff\\9}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'color', [[1, 2, undefined]]],
            ['property-value', 'red', [[1, 8, undefined]]]
          ],
          [
            'property',
            ['property-name', 'display', [[1, 12, undefined]]],
            ['property-value', 'none', [[1, 20, undefined]]]
          ],
          [
            'property',
            ['property-name', 'color', [[1, 25, undefined]]],
            ['property-value', '#fff\\9', [[1, 31, undefined]]]
          ]
        ]);
      }
    },
    'ie hacks - normal after hack': {
      'topic': function () {
        return _optimize('p{color:red\\9;display:none;color:#fff}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'color', [[1, 2, undefined]]],
            ['property-value', 'red\\9', [[1, 8, undefined]]]
          ],
          [
            'property',
            ['property-name', 'display', [[1, 14, undefined]]],
            ['property-value', 'none', [[1, 22, undefined]]]
          ],
          [
            'property',
            ['property-name', 'color', [[1, 27, undefined]]],
            ['property-value', '#fff', [[1, 33, undefined]]]
          ]
        ]);
      }
    },
    'ie hacks - hack after hack': {
      'topic': function () {
        return _optimize('p{color:red\\9;display:none;color:#fff\\9}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'display', [[1, 14, undefined]]],
            ['property-value', 'none', [[1, 22, undefined]]]
          ],
          [
            'property',
            ['property-name', 'color', [[1, 27, undefined]]],
            ['property-value', '#fff\\9', [[1, 33, undefined]]]
          ]
        ]);
      }
    },
    'not overriddable': {
      'topic': function () {
        return _optimize('a{display:inline-block;color:red;display:-moz-block}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'display', [[1, 2, undefined]]],
            ['property-value', 'inline-block', [[1, 10, undefined]]]
          ],
          [
            'property',
            ['property-name', 'color', [[1, 23, undefined]]],
            ['property-value', 'red', [[1, 29, undefined]]]
          ],
          [
            'property',
            ['property-name', 'display', [[1, 33, undefined]]],
            ['property-value', '-moz-block', [[1, 41, undefined]]]
          ]
        ]);
      }
    }
  })
  .addBatch({
    'understandable - 2 properties, both !important, 2nd less understandable': {
      'topic': function () {
        return _optimize('a{color:red!important;display:block;color:rgba(0,255,0,.5)!important}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'display', [[1, 22, undefined]]],
            ['property-value', 'block', [[1, 30, undefined]]]
          ],
          [
            'property',
            ['property-name', 'color', [[1, 36, undefined]]],
            ['property-value', 'rgba(0,255,0,.5)!important', [[1, 42, undefined]]]
          ]
        ]);
      }
    },
    'understandable - 2 properties, both !important, 2nd less understandable - IE8 mode': {
      'topic': function () {
        return _optimize('a{color:red!important;display:block;color:rgba(0,255,0,.5)!important}', 'ie8');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'color', [[1, 2, undefined]]],
            ['property-value', 'red!important', [[1, 8, undefined]]]
          ],
          [
            'property',
            ['property-name', 'display', [[1, 22, undefined]]],
            ['property-value', 'block', [[1, 30, undefined]]]
          ],
          [
            'property',
            ['property-name', 'color', [[1, 36, undefined]]],
            ['property-value', 'rgba(0,255,0,.5)!important', [[1, 42, undefined]]]
          ]
        ]);
      }
    },
    'understandable - 2 properties, both !important, 2nd more understandable': {
      'topic': function () {
        return _optimize('a{color:rgba(0,255,0,.5)!important;display:block;color:red!important}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'display', [[1, 35, undefined]]],
            ['property-value', 'block', [[1, 43, undefined]]]
          ],
          [
            'property',
            ['property-name', 'color', [[1, 49, undefined]]],
            ['property-value', 'red!important', [[1, 55, undefined]]]
          ]
        ]);
      }
    },
    'understandable - 2 adjacent properties, both !important, 2nd less understandable': {
      'topic': function () {
        return _optimize('a{background:red!important;background:rgba(0,255,0,.5)!important}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'rgba(0,255,0,.5)!important', [[1, 38, undefined]]]
          ]
        ]);
      }
    },
    'understandable - 2 adjacent properties, both !important, 2nd less understandable - IE8 mode': {
      'topic': function () {
        return _optimize('a{background:red!important;background:rgba(0,255,0,.5)!important}', 'ie8');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'red!important', [[1, 13, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background', [[1, 27, undefined]]],
            ['property-value', 'rgba(0,255,0,.5)!important', [[1, 38, undefined]]]
          ]
        ]);
      }
    },
    'understandable - 2 adjacent properties, both !important and understandable': {
      'topic': function () {
        return _optimize('a{background:rgba(0,255,0,.5)!important;background:red!important}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'red!important', [[1, 51, undefined]]]
          ]
        ]);
      }
    },
    'understandable - 2 adjacent -ms-transform with different values': {
      'topic': function () {
        return _optimize('div{-ms-transform:translate(0,0);-ms-transform:translate3d(0,0,0)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', '-ms-transform', [[1, 4, undefined]]],
            ['property-value', 'translate(0,0)', [[1, 18, undefined]]]
          ],
          [
            'property',
            ['property-name', '-ms-transform', [[1, 33, undefined]]],
            ['property-value', 'translate3d(0,0,0)', [[1, 47, undefined]]]
          ]
        ]);
      }
    },
    'understandable - 2 non-adjacent -ms-transform with different values': {
      'topic': function () {
        return _optimize('div{-ms-transform:translate(0,0);-webkit-transform:translate3d(0,0,0);-ms-transform:translate3d(0,0,0)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', '-ms-transform', [[1, 4, undefined]]],
            ['property-value', 'translate(0,0)', [[1, 18, undefined]]]
          ],
          [
            'property',
            ['property-name', '-webkit-transform', [[1, 33, undefined]]],
            ['property-value', 'translate3d(0,0,0)', [[1, 51, undefined]]]
          ],
          [
            'property',
            ['property-name', '-ms-transform', [[1, 70, undefined]]],
            ['property-value', 'translate3d(0,0,0)', [[1, 84, undefined]]]
          ]
        ]);
      }
    },
    'understandable - 2 adjacent transform with different values': {
      'topic': function () {
        return _optimize('div{transform:translate(0,0);transform:translate3d(0,0,0)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'transform', [[1, 4, undefined]]],
            ['property-value', 'translate(0,0)', [[1, 14, undefined]]]
          ],
          [
            'property',
            ['property-name', 'transform', [[1, 29, undefined]]],
            ['property-value', 'translate3d(0,0,0)', [[1, 39, undefined]]]
          ]
        ]);
      }
    },
    'understandable - 2 non-adjacent transform with different values': {
      'topic': function () {
        return _optimize('div{transform:translate(0,0);-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'transform', [[1, 4, undefined]]],
            ['property-value', 'translate(0,0)', [[1, 14, undefined]]]
          ],
          [
            'property',
            ['property-name', '-webkit-transform', [[1, 29, undefined]]],
            ['property-value', 'translate3d(0,0,0)', [[1, 47, undefined]]]
          ],
          [
            'property',
            ['property-name', 'transform', [[1, 66, undefined]]],
            ['property-value', 'translate3d(0,0,0)', [[1, 76, undefined]]]
          ]
        ]);
      }
    },
    'understandable - border(hex) with border(rgba)': {
      'topic': function () {
        return _optimize('a{border:1px solid #fff;border:1px solid rgba(1,0,0,.5)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border', [[1, 2, undefined]]],
            ['property-value', '1px', [[1, 31, undefined]]],
            ['property-value', 'solid', [[1, 35, undefined]]],
            ['property-value', 'rgba(1,0,0,.5)', [[1, 41, undefined]]]
          ]
        ]);
      }
    },
    'understandable - border(hex) with border(rgba) - IE8 mode': {
      'topic': function () {
        return _optimize('a{border:1px solid #fff;border:1px solid rgba(1,0,0,.5)}', 'ie8');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border', [[1, 2, undefined]]],
            ['property-value', '1px', [[1, 9, undefined]]],
            ['property-value', 'solid', [[1, 13, undefined]]],
            ['property-value', '#fff', [[1, 19, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border', [[1, 24, undefined]]],
            ['property-value', '1px', [[1, 31, undefined]]],
            ['property-value', 'solid', [[1, 35, undefined]]],
            ['property-value', 'rgba(1,0,0,.5)', [[1, 41, undefined]]]
          ]
        ]);
      }
    },
    'understandable - border(hex) with border(rgba !important)': {
      'topic': function () {
        return _optimize('a{border:1px solid #fff;border:1px solid rgba(1,0,0,.5)!important}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border', [[1, 24, undefined]]],
            ['property-value', '1px', [[1, 31, undefined]]],
            ['property-value', 'solid', [[1, 35, undefined]]],
            ['property-value', 'rgba(1,0,0,.5)!important', [[1, 41, undefined]]]
          ]
        ]);
      }
    },
    'understandable - border(hex !important) with border(hex)': {
      'topic': function () {
        return _optimize('a{border:1px solid #fff!important;display:block;border:1px solid #fff}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border', [[1, 2, undefined]]],
            ['property-value', '1px', [[1, 9, undefined]]],
            ['property-value', 'solid', [[1, 13, undefined]]],
            ['property-value', '#fff!important', [[1, 19, undefined]]]
          ],
          [
            'property',
            ['property-name', 'display', [[1, 34, undefined]]],
            ['property-value', 'block', [[1, 42, undefined]]]
          ]
        ]);
      }
    },
    'understandable - border(hex) with border(hex !important)': {
      'topic': function () {
        return _optimize('a{border:1px solid #fff;display:block;border:1px solid #fff!important}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'display', [[1, 24, undefined]]],
            ['property-value', 'block', [[1, 32, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border', [[1, 38, undefined]]],
            ['property-value', '1px', [[1, 45, undefined]]],
            ['property-value', 'solid', [[1, 49, undefined]]],
            ['property-value', '#fff!important', [[1, 55, undefined]]]
          ]
        ]);
      }
    },
    'understandable - unit with function with unit without one': {
      'topic': function () {
        return _optimize('a{border-top-width:calc(100%);display:block;border-top-width:1px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'display', [[1, 30, undefined]]],
            ['property-value', 'block', [[1, 38, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border-top-width', [[1, 44, undefined]]],
            ['property-value', '1px', [[1, 61, undefined]]]
          ]
        ]);
      }
    },
    'understandable - unit without function with unit with one': {
      'topic': function () {
        return _optimize('a{border-top-width:1px;display:block;border-top-width:calc(100%)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border-top-width', [[1, 2, undefined]]],
            ['property-value', '1px', [[1, 19, undefined]]]
          ],
          [
            'property',
            ['property-name', 'display', [[1, 23, undefined]]],
            ['property-value', 'block', [[1, 31, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border-top-width', [[1, 37, undefined]]],
            ['property-value', 'calc(100%)', [[1, 54, undefined]]]
          ]
        ]);
      }
    },
    'understandable - non adjacent units': {
      'topic': function () {
        return _optimize('a{margin-top:80px;padding-top:30px;margin-top:10vmin}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'padding-top', [[1, 18, undefined]]],
            ['property-value', '30px', [[1, 30, undefined]]]
          ],
          [
            'property',
            ['property-name', 'margin-top', [[1, 35, undefined]]],
            ['property-value', '10vmin', [[1, 46, undefined]]]
          ]
        ]);
      }
    }
  })
  .addBatch({
    'understandable - non adjacent units in IE8 mode': {
      'topic': function () {
        return _optimize('a{margin-top:80px;padding-top:30px;margin-top:10vmin}', 'ie8');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'margin-top', [[1, 2, undefined]]],
            ['property-value', '80px', [[1, 13, undefined]]]
          ],
          [
            'property',
            ['property-name', 'padding-top', [[1, 18, undefined]]],
            ['property-value', '30px', [[1, 30, undefined]]]
          ],
          [
            'property',
            ['property-name', 'margin-top', [[1, 35, undefined]]],
            ['property-value', '10vmin', [[1, 46, undefined]]]
          ]
        ]);
      }
    },
    'understandable - 2 adjacent properties, both !important, 2nd more understandable in IE8 mode': {
      'topic': function () {
        return _optimize('a{background:rgba(0,255,0,.5)!important;background:red!important}', 'ie8');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'rgba(0,255,0,.5)!important', [[1, 13, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background', [[1, 40, undefined]]],
            ['property-value', 'red!important', [[1, 51, undefined]]]
          ]
        ]);
      }
    },
    'understandable - border(hex) with border(rgba !important) in IE8 mode': {
      'topic': function () {
        return _optimize('a{border:1px solid #fff!important;border:1px solid rgba(1,0,0,.5)!important}', 'ie8');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border', [[1, 2, undefined]]],
            ['property-value', '1px', [[1, 9, undefined]]],
            ['property-value', 'solid', [[1, 13, undefined]]],
            ['property-value', '#fff!important', [[1, 19, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border', [[1, 34, undefined]]],
            ['property-value', '1px', [[1, 41, undefined]]],
            ['property-value', 'solid', [[1, 45, undefined]]],
            ['property-value', 'rgba(1,0,0,.5)!important', [[1, 51, undefined]]]
          ]
        ]);
      }
    }
  })
  .export(module);
