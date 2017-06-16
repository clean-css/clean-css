var assert = require('assert');
var vows = require('vows');

var optimizeProperties = require('../../../../lib/optimizer/level-2/properties/optimize');

var tokenize = require('../../../../lib/tokenizer/tokenize');
var inputSourceMapTracker = require('../../../../lib/reader/input-source-map-tracker');
var compatibilityFrom = require('../../../../lib/options/compatibility');
var validator = require('../../../../lib/optimizer/validator');

function _optimize(source) {
  var tokens = tokenize(source, {
    inputSourceMapTracker: inputSourceMapTracker(),
    options: {},
    warnings: []
  });

  var compat = compatibilityFrom(compat);
  var options = {
    compatibility: compat,
    level: {
      2: {
        mergeIntoShorthands: true,
        overrideProperties: true
      }
    }
  };
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
    'shorthand background #1': {
      'topic': function () {
        return _optimize('p{background-color:#111;background-image:url(image.png);background-repeat:repeat;background-position:0 0;background-attachment:scroll;background-size:auto;background-origin:padding-box;background-clip:border-box}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [
              [1, 2, undefined],
              [1, 24, undefined],
              [1, 56, undefined],
              [1, 81, undefined],
              [1, 105, undefined],
              [1, 134, undefined],
              [1, 155, undefined],
              [1, 185, undefined]
            ]],
            ['property-value', 'url(image.png)', [[1, 41, undefined]]],
            ['property-value', '#111', [[1, 19, undefined]]]
          ]
        ]);
      }
    },
    'shorthand background #2': {
      'topic': function () {
        return _optimize('p{background-color:#111;background-image:url(image.png);background-repeat:no-repeat;background-position:0 0;background-attachment:scroll;background-size:auto;background-origin:padding-box;background-clip:border-box}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [
              [1, 2, undefined],
              [1, 24, undefined],
              [1, 56, undefined],
              [1, 84, undefined],
              [1, 108, undefined],
              [1, 137, undefined],
              [1, 158, undefined],
              [1, 188, undefined]
            ]],
            ['property-value', 'url(image.png)', [[1, 41, undefined]]],
            ['property-value', 'no-repeat', [[1, 74, undefined]]],
            ['property-value', '#111', [[1, 19, undefined]]]
          ]
        ]);
      }
    },
    'shorthand important background': {
      'topic': function () {
        return _optimize('p{background-color:#111!important;background-image:url(image.png)!important;background-repeat:repeat!important;background-position:0 0!important;background-attachment:scroll!important;background-size:auto!important;background-origin:padding-box!important;background-clip:border-box!important}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [
              [1, 2, undefined],
              [1, 34, undefined],
              [1, 76, undefined],
              [1, 111, undefined],
              [1, 145, undefined],
              [1, 184, undefined],
              [1, 215, undefined],
              [1, 255, undefined]
            ]],
            ['property-value', 'url(image.png)', [[1, 51, undefined]]],
            ['property-value', '#111!important', [[1, 19, undefined]]]
          ]
        ]);
      }
    },
    'shorthand border': {
      'topic': function () {
        return _optimize('.block{border-width:1px;border-color:red;border-style:dotted}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border', [
              [1, 7, undefined],
              [1, 24, undefined],
              [1, 41, undefined]
            ]],
            ['property-value', '1px', [[1, 20, undefined]]],
            ['property-value', 'dotted', [[1, 54, undefined]]],
            ['property-value', 'red', [[1, 37, undefined]]]
          ]
        ]);
      }
    },
    'shorthand border - mixed shorthands': {
      'topic': function () {
        return _optimize('.block{border-width:1px;border-color:red;border-bottom:2px solid;border-style:dotted}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border-width', [[1, 7, undefined]]],
            ['property-value', '1px', [[1, 20, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border-color', [[1, 24, undefined]]],
            ['property-value', 'red', [[1, 37, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border-bottom', [[1, 41, undefined]]],
            ['property-value', '2px', [[1, 55, undefined]]],
            ['property-value', 'solid', [[1, 59, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border-style', [[1, 65, undefined]]],
            ['property-value', 'dotted', [[1, 78, undefined]]]
          ]
        ]);
      }
    },
    'shorthand border - mixed shorthand and longhands': {
      'topic': function () {
        return _optimize('.block{border-width:1px;border-bottom-width:2px;border-color:red;border-style:dotted}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border-width', [[1, 7, undefined]]],
            ['property-value', '1px', [[1, 20, undefined]]],
            ['property-value', '1px', [[1, 20, undefined]]],
            ['property-value', '2px', [[1, 44, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border-color', [[1, 48, undefined]]],
            ['property-value', 'red', [[1, 61, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border-style', [[1, 65, undefined]]],
            ['property-value', 'dotted', [[1, 78, undefined]]]
          ]
        ]);
      }
    },
    'shorthand border-width': {
      'topic': function () {
        return _optimize('p{border-top-width:7px;border-bottom-width:7px;border-left-width:4px;border-right-width:4px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border-width', [
              [1, 2, undefined],
              [1, 23, undefined],
              [1, 47, undefined],
              [1, 69, undefined]
            ]],
            ['property-value', '7px', [[1, 19, undefined]]],
            ['property-value', '4px', [[1, 88, undefined]]]
          ]
        ]);
      }
    },
    'shorthand border-width - multi-valued': {
      'topic': function () {
        return _optimize('.block{border-width:0 0 0 1px;border-color:red;border-style:dotted}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border-width', [[1, 7, undefined]]],
            ['property-value', '0', [[1, 20, undefined]]],
            ['property-value', '0', [[1, 22, undefined]]],
            ['property-value', '0', [[1, 24, undefined]]],
            ['property-value', '1px', [[1, 26, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border-color', [[1, 30, undefined]]],
            ['property-value', 'red', [[1, 43, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border-style', [[1, 47, undefined]]],
            ['property-value', 'dotted', [[1, 60, undefined]]]
          ]
        ]);
      }
    },
    'shorthand border-color #1': {
      'topic': function () {
        return _optimize('p{border-top-color:#9fce00;border-bottom-color:#9fce00;border-left-color:#9fce00;border-right-color:#9fce00}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border-color', [
              [1, 2, undefined],
              [1, 27, undefined],
              [1, 55, undefined],
              [1, 81, undefined]
            ]],
            ['property-value', '#9fce00', [[1, 19, undefined]]]
          ]
        ]);
      }
    },
    'shorthand border-color #2': {
      'topic': function () {
        return _optimize('p{border-right-color:#002;border-bottom-color:#003;border-top-color:#001;border-left-color:#004}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border-color', [
              [1, 2, undefined],
              [1, 26, undefined],
              [1, 51, undefined],
              [1, 73, undefined]
            ]],
            ['property-value', '#001', [[1, 68, undefined]]],
            ['property-value', '#002', [[1, 21, undefined]]],
            ['property-value', '#003', [[1, 46, undefined]]],
            ['property-value', '#004', [[1, 91, undefined]]]
          ]
        ]);
      }
    },
    'shorthand border-radius': {
      'topic': function () {
        return _optimize('p{border-top-left-radius:7px;border-bottom-right-radius:6px;border-bottom-left-radius:5px;border-top-right-radius:3px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border-radius', [
              [1, 2, undefined],
              [1, 29, undefined],
              [1, 60, undefined],
              [1, 90, undefined]
            ]],
            ['property-value', '7px', [[1, 25, undefined]]],
            ['property-value', '3px', [[1, 114, undefined]]],
            ['property-value', '6px', [[1, 56, undefined]]],
            ['property-value', '5px', [[1, 86, undefined]]]
          ]
        ]);
      }
    },
    'shorthand multiplexed border-radius': {
      'topic': function () {
        return _optimize('p{border-radius:7px/3px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border-radius', [[1, 2, undefined]]],
            ['property-value', '7px', [[1, 16, undefined]]],
            ['property-value', '/'],
            ['property-value', '3px', [[1, 20, undefined]]]
          ]
        ]);
      }
    },
    'shorthand asymmetric border-radius with same values': {
      'topic': function () {
        return _optimize('p{border-top-left-radius:7px 3px;border-top-right-radius:7px 3px;border-bottom-right-radius:7px 3px;border-bottom-left-radius:7px 3px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border-radius', [
              [1, 2, undefined],
              [1, 33, undefined],
              [1, 65, undefined],
              [1, 100, undefined]
            ]],
            ['property-value', '7px', [[1, 25, undefined]]],
            ['property-value', '/'],
            ['property-value', '3px', [[1, 29, undefined]]]
          ]
        ]);
      }
    },
    'shorthand asymmetric border-radius': {
      'topic': function () {
        return _optimize('p{border-top-left-radius:7px 3px;border-top-right-radius:6px 2px;border-bottom-right-radius:5px 1px;border-bottom-left-radius:4px 0}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border-radius', [
              [1, 2, undefined],
              [1, 33, undefined],
              [1, 65, undefined],
              [1, 100, undefined]
            ]],
            ['property-value', '7px', [[1, 25, undefined]]],
            ['property-value', '6px', [[1, 57, undefined]]],
            ['property-value', '5px', [[1, 92, undefined]]],
            ['property-value', '4px', [[1, 126, undefined]]],
            ['property-value', '/'],
            ['property-value', '3px', [[1, 29, undefined]]],
            ['property-value', '2px', [[1, 61, undefined]]],
            ['property-value', '1px', [[1, 96, undefined]]],
            ['property-value', '0', [[1, 130, undefined]]]
          ]
        ]);
      }
    },
    'skipping -webkit-border-radius optimizations': {
      'topic': function () {
        return _optimize('p{-webkit-border-radius:7px 3px 7px 3px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', '-webkit-border-radius', [[1, 2, undefined]]],
            ['property-value', '7px', [[1, 24, undefined]]],
            ['property-value', '3px', [[1, 28, undefined]]],
            ['property-value', '7px', [[1, 32, undefined]]],
            ['property-value', '3px', [[1, 36, undefined]]]
          ]
        ]);
      }
    },
    'shorthand multiple !important': {
      'topic': function () {
        return _optimize('a{border-color:#123 !important;border-top-color: #456 !important}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border-color', [[1, 2, undefined]]],
            ['property-value', '#456', [[1, 49, undefined]]],
            ['property-value', '#123', [[1, 15, undefined]]],
            ['property-value', '#123!important', [[1, 15, undefined]]]
          ]
        ]);
      }
    },
    'shorthand list-style #1': {
      'topic': function () {
        return _optimize('a{list-style-type:circle;list-style-position:outside;list-style-image:url(image.png)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'list-style', [
              [1, 2, undefined],
              [1, 25, undefined],
              [1, 53, undefined]
            ]],
            ['property-value', 'circle', [[1, 18, undefined]]],
            ['property-value', 'url(image.png)', [[1, 70, undefined]]]
          ]
        ]);
      }
    },
    'shorthand list-style #2': {
      'topic': function () {
        return _optimize('a{list-style-image:url(image.png);list-style-type:circle;list-style-position:inside}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'list-style', [
              [1, 2, undefined],
              [1, 34, undefined],
              [1, 57, undefined]
            ]],
            ['property-value', 'circle', [[1, 50, undefined]]],
            ['property-value', 'inside', [[1, 77, undefined]]],
            ['property-value', 'url(image.png)', [[1, 19, undefined]]]
          ]
        ]);
      }
    },
    'shorthand margin': {
      'topic': function () {
        return _optimize('a{margin-top:10px;margin-right:5px;margin-bottom:3px;margin-left:2px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'margin', [
              [1, 2, undefined],
              [1, 18, undefined],
              [1, 35, undefined],
              [1, 53, undefined]
            ]],
            ['property-value', '10px', [[1, 13, undefined]]],
            ['property-value', '5px', [[1, 31, undefined]]],
            ['property-value', '3px', [[1, 49, undefined]]],
            ['property-value', '2px', [[1, 65, undefined]]]
          ]
        ]);
      }
    },
    'shorthand padding': {
      'topic': function () {
        return _optimize('a{padding-top:10px;padding-left:5px;padding-bottom:3px;padding-right:2px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'padding', [
              [1, 2, undefined],
              [1, 19, undefined],
              [1, 36, undefined],
              [1, 55, undefined]
            ]],
            ['property-value', '10px', [[1, 14, undefined]]],
            ['property-value', '2px', [[1, 69, undefined]]],
            ['property-value', '3px', [[1, 51, undefined]]],
            ['property-value', '5px', [[1, 32, undefined]]]
          ]
        ]);
      }
    },
    'mixed': {
      'topic': function () {
        return _optimize('a{padding-top:10px;margin-top:3px;padding-left:5px;margin-left:3px;padding-bottom:3px;margin-bottom:3px;padding-right:2px;margin-right:3px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'padding', [
              [1, 2, undefined],
              [1, 34, undefined],
              [1, 67, undefined],
              [1, 104, undefined]
            ]],
            ['property-value', '10px', [[1, 14, undefined]]],
            ['property-value', '2px', [[1, 118, undefined]]],
            ['property-value', '3px', [[1, 82, undefined]]],
            ['property-value', '5px', [[1, 47, undefined]]]
          ],
          [
            'property',
            ['property-name', 'margin', [
              [1, 19, undefined],
              [1, 51, undefined],
              [1, 86, undefined],
              [1, 122, undefined]
            ]],
            ['property-value', '3px', [[1, 30, undefined]]]
          ]
        ]);
      }
    },
    'with other properties': {
      'topic': function () {
        return _optimize('a{padding-top:10px;padding-left:5px;padding-bottom:3px;color:red;padding-right:2px;width:100px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'color', [[1, 55, undefined]]],
            ['property-value', 'red', [[1, 61, undefined]]]
          ],
          [
            'property',
            ['property-name', 'width', [[1, 83, undefined]]],
            ['property-value', '100px', [[1, 89, undefined]]]
          ],
          [
            'property',
            ['property-name', 'padding', [
              [1, 2, undefined],
              [1, 19, undefined],
              [1, 36, undefined],
              [1, 65, undefined]
            ]],
            ['property-value', '10px', [[1, 14, undefined]]],
            ['property-value', '2px', [[1, 79, undefined]]],
            ['property-value', '3px', [[1, 51, undefined]]],
            ['property-value', '5px', [[1, 32, undefined]]]
          ]
        ]);
      }
    },
    'with hacks': {
      'topic': function () {
        return _optimize('a{padding-top:10px;padding-left:5px;padding-bottom:3px;_padding-right:2px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'padding-top', [[1, 2, undefined]]],
            ['property-value', '10px', [[1, 14, undefined]]]
          ],
          [
            'property',
            ['property-name', 'padding-left', [[1, 19, undefined]]],
            ['property-value', '5px', [[1, 32, undefined]]]
          ],
          [
            'property',
            ['property-name', 'padding-bottom', [[1, 36, undefined]]],
            ['property-value', '3px', [[1, 51, undefined]]]
          ],
          [
            'property',
            ['property-name', '_padding-right', [[1, 55, undefined]]],
            ['property-value', '2px', [[1, 70, undefined]]]
          ]
        ]);
      }
    },
    'just inherit': {
      'topic': function () {
        return _optimize('a{background:inherit}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'inherit', [[1, 13, undefined]]]
          ]
        ]);
      }
    }
  })
  .addBatch({
    'not enough components': {
      'topic': function () {
        return _optimize('a{padding-top:10px;padding-left:5px;padding-bottom:3px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'padding-top', [[1, 2, undefined]]],
            ['property-value', '10px', [[1, 14, undefined]]]
          ],
          [
            'property',
            ['property-name', 'padding-left', [[1, 19, undefined]]],
            ['property-value', '5px', [[1, 32, undefined]]]
          ],
          [
            'property',
            ['property-name', 'padding-bottom', [[1, 36, undefined]]],
            ['property-value', '3px', [[1, 51, undefined]]]
          ]
        ]);
      }
    },
    'with inherit - one': {
      'topic': function () {
        return _optimize('a{padding-top:10px;padding-left:5px;padding-bottom:3px;padding-right:inherit}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'padding', [[1, 2, undefined], [1, 19, undefined], [1, 36, undefined]]],
            ['property-value', '10px', [[1, 14, undefined]]],
            ['property-value', '5px', [[1, 32, undefined]]],
            ['property-value', '3px', [[1, 51, undefined]]]
          ],
          [
            'property',
            ['property-name', 'padding-right', [[1, 55, undefined]]],
            ['property-value', 'inherit', [[1, 69, undefined]]]
          ]
        ]);
      }
    },
    'with inherit - two': {
      'topic': function () {
        return _optimize('a{padding-top:10px;padding-left:5px;padding-bottom:inherit;padding-right:inherit}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'padding', [[1, 36, undefined], [1, 59, undefined]]],
            ['property-value', 'inherit', [[1, 51, undefined], [1, 73, undefined]]]
          ],
          [
            'property',
            ['property-name', 'padding-top', [[1, 2, undefined]]],
            ['property-value', '10px', [[1, 14, undefined]]]
          ],
          [
            'property',
            ['property-name', 'padding-left', [[1, 19, undefined]]],
            ['property-value', '5px', [[1, 32, undefined]]]
          ]
        ]);
      }
    },
    'with inherit - three': {
      'topic': function () {
        return _optimize('a{padding-top:inherit;padding-left:5px;padding-bottom:inherit;padding-right:inherit}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'padding', [[1, 2, undefined], [1, 39, undefined], [1, 62, undefined]]],
            ['property-value', 'inherit', [[1, 14, undefined], [1, 54, undefined], [1, 76, undefined]]]
          ],
          [
            'property',
            ['property-name', 'padding-left', [[1, 22, undefined]]],
            ['property-value', '5px', [[1, 35, undefined]]]
          ]
        ]);
      }
    },
    'with inherit - four': {
      'topic': function () {
        return _optimize('a{padding-top:inherit;padding-left:inherit;padding-bottom:inherit;padding-right:inherit}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'padding', [[1, 2, undefined], [1, 22, undefined], [1, 43, undefined], [1, 66, undefined]]],
            ['property-value', 'inherit', [[1, 14, undefined]]]
          ]
        ]);
      }
    },
    'with inherit - outline': {
      'topic': function () {
        return _optimize('.block{outline-width:inherit;outline-style:solid;outline-color:red}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'outline', [[1, 29, undefined], [1, 49, undefined]]],
            ['property-value', 'red', [[1, 63, undefined]]],
            ['property-value', 'solid', [[1, 43, undefined]]]
          ],
          [
            'property',
            ['property-name', 'outline-width', [[1, 7, undefined]]],
            ['property-value', 'inherit', [[1, 21, undefined]]],
          ]
        ]);
      }
    },
    'mixed importance': {
      'topic': function () {
        return _optimize('a{padding-top:10px;padding-left:5px;padding-bottom:3px;padding-right:2px!important}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'padding-top', [[1, 2, undefined]]],
            ['property-value', '10px', [[1, 14, undefined]]]
          ],
          [
            'property',
            ['property-name', 'padding-left', [[1, 19, undefined]]],
            ['property-value', '5px', [[1, 32, undefined]]]
          ],
          [
            'property',
            ['property-name', 'padding-bottom', [[1, 36, undefined]]],
            ['property-value', '3px', [[1, 51, undefined]]]
          ],
          [
            'property',
            ['property-name', 'padding-right', [[1, 55, undefined]]],
            ['property-value', '2px!important', [[1, 69, undefined]]]
          ]
        ]);
      }
    },
    'mixed understandability of units': {
      'topic': function () {
        return _optimize('a{padding-top:10px;padding-left:5px;padding-bottom:3px;padding-right:-moz-calc(100% - 20px)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'padding-top', [[1, 2, undefined]]],
            ['property-value', '10px', [[1, 14, undefined]]]
          ],
          [
            'property',
            ['property-name', 'padding-left', [[1, 19, undefined]]],
            ['property-value', '5px', [[1, 32, undefined]]]
          ],
          [
            'property',
            ['property-name', 'padding-bottom', [[1, 36, undefined]]],
            ['property-value', '3px', [[1, 51, undefined]]]
          ],
          [
            'property',
            ['property-name', 'padding-right', [[1, 55, undefined]]],
            ['property-value', '-moz-calc(100% - 20px)', [[1, 69, undefined]]]
          ]
        ]);
      }
    },
    'mixed understandability of images': {
      'topic': function () {
        return _optimize('p{background-color:#111;background-image:linear-gradient(sth);background-repeat:repeat;background-position:0 0;background-attachment:scroll;background-size:auto;background-origin:padding-box;background-clip:border-box}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background-color', [[1, 2, undefined]]],
            ['property-value', '#111', [[1, 19, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-image', [[1, 24, undefined]]],
            ['property-value', 'linear-gradient(sth)', [[1, 41, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-repeat', [[1, 62, undefined]]],
            ['property-value', 'repeat', [[1, 80, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-position', [[1, 87, undefined]]],
            ['property-value', '0', [[1, 107, undefined]]],
            ['property-value', '0', [[1, 109, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-attachment', [[1, 111, undefined]]],
            ['property-value', 'scroll', [[1, 133, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-size', [[1, 140, undefined]]],
            ['property-value', 'auto', [[1, 156, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-origin', [[1, 161, undefined]]],
            ['property-value', 'padding-box', [[1, 179, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-clip', [[1, 191, undefined]]],
            ['property-value', 'border-box', [[1, 207, undefined]]]
          ]
        ]);
      }
    }
  })
  .addBatch({
    'transition': {
      'topic': function () {
        return _optimize('.block{transition-property:width;transition-duration:5s;transition-timing-function:ease-in;transition-delay:2s}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'transition', [
              [1, 7, undefined],
              [1, 33, undefined],
              [1, 56, undefined],
              [1, 91, undefined]
            ]],
            ['property-value', 'width', [[1, 27, undefined]]],
            ['property-value', '5s', [[1, 53, undefined]]],
            ['property-value', 'ease-in', [[1, 83, undefined]]],
            ['property-value', '2s', [[1, 108, undefined]]]
          ]
        ]);
      }
    }
  })
  .export(module);
