var assert = require('assert');
var vows = require('vows');

var optimizeProperties = require('../../../../lib/optimizer/level-2/properties/optimize');

var tokenize = require('../../../../lib/tokenizer/tokenize');
var inputSourceMapTracker = require('../../../../lib/reader/input-source-map-tracker');
var compatibilityFrom = require('../../../../lib/options/compatibility');
var validator = require('../../../../lib/optimizer/validator');

function _optimize(source, compat) {
  var tokens = tokenize(source, {
    inputSourceMapTracker: inputSourceMapTracker(),
    options: {},
    warnings: []
  });
  compat = compatibilityFrom(compat);

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
    'animation shorthand and longhand': {
      'topic': function () {
        return _optimize('.block{animation:1s ease-in;animation-name:slidein}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'animation', [[1, 7, undefined]]],
            ['property-value', '1s', [[1, 17, undefined]]],
            ['property-value', 'ease-in', [[1, 20, undefined]]],
            ['property-value', 'slidein', [[1, 43, undefined]]]
          ]
        ]);
      }
    },
    'animation longhand and shorthand': {
      'topic': function () {
        return _optimize('.block{animation-fill-mode:both;animation:ease-in}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'animation', [[1, 32, undefined]]],
            ['property-value', 'ease-in', [[1, 42, undefined]]],
          ]
        ]);
      }
    },
    'animation shorthand with overriddable shorthand': {
      'topic': function () {
        return _optimize('.block{animation:1s infinite slidein;animation:ease-in 2}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'animation', [[1, 7, undefined]]],
            ['property-value', 'ease-in', [[1, 47, undefined]]],
            ['property-value', '2', [[1, 55, undefined]]]
          ]
        ]);
      }
    },
    'animation shorthand and multiplex longhand': {
      'topic': function () {
        return _optimize('.block{animation:1s infinite slidein;animation-timing-function:ease-in,ease-out}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'animation', [[1, 7, undefined]]],
            ['property-value', '1s', [[1, 17, undefined]]],
            ['property-value', 'ease-in', [[1, 63, undefined]]],
            ['property-value', 'infinite', [[1, 20, undefined]]],
            ['property-value', 'slidein', [[1, 29, undefined]]],
            ['property-value', ','],
            ['property-value', '1s', [[1, 17, undefined]]],
            ['property-value', 'ease-out', [[1, 71, undefined]]],
            ['property-value', 'infinite', [[1, 20, undefined]]],
            ['property-value', 'slidein', [[1, 29, undefined]]]
          ]
        ]);
      }
    },
    'animation multiplex shorthand and longhand': {
      'topic': function () {
        return _optimize('.block{animation:ease-in,ease-out;animation-duration:1s}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'animation', [[1, 7, undefined]]],
            ['property-value', '1s', [[1, 53, undefined]]],
            ['property-value', 'ease-in', [[1, 17, undefined]]],
            ['property-value', ','],
            ['property-value', '1s', [[1, 53, undefined]]],
            ['property-value', 'ease-out', [[1, 25, undefined]]]
          ]
        ]);
      }
    },
    'animation shorthand and multiplex longhand - too long to merge': {
      'topic': function () {
        return _optimize('.block{animation:ease-in;animation-name:longname1,longname2,longname3}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'animation', [[1, 7, undefined]]],
            ['property-value', 'ease-in', [[1, 17, undefined]]],
          ],
          [
            'property',
            ['property-name', 'animation-name', [[1, 25, undefined]]],
            ['property-value', 'longname1', [[1, 40, undefined]]],
            ['property-value', ',', [[1, 49, undefined]]],
            ['property-value', 'longname2', [[1, 50, undefined]]],
            ['property-value', ',', [[1, 59, undefined]]],
            ['property-value', 'longname3', [[1, 60, undefined]]]
          ]
        ]);
      }
    },
    'animation shorthand and inherit longhand': {
      'topic': function () {
        return _optimize('.block{animation:1s infinite slidein;animation-timing-function:inherit}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'animation', [[1, 7, undefined]]],
            ['property-value', '1s', [[1, 17, undefined]]],
            ['property-value', 'infinite', [[1, 20, undefined]]],
            ['property-value', 'slidein', [[1, 29, undefined]]]
          ],
          [
            'property',
            ['property-name', 'animation-timing-function', [[1, 37, undefined]]],
            ['property-value', 'inherit', [[1, 63, undefined]]]
          ]
        ]);
      }
    },
    'vendor prefixed animation shorthand and longhand': {
      'topic': function () {
        return _optimize('.block{-webkit-animation:1s infinite slidein;-webkit-animation-timing-function:ease-in}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', '-webkit-animation', [[1, 7, undefined]]],
            ['property-value', '1s', [[1, 25, undefined]]],
            ['property-value', 'ease-in', [[1, 79, undefined]]],
            ['property-value', 'infinite', [[1, 28, undefined]]],
            ['property-value', 'slidein', [[1, 37, undefined]]]
          ]
        ]);
      }
    }
  })
  .addBatch({
    'longhand then longhand - background colors as functions': {
      'topic': function () {
        return _optimize('p{background-color:-ms-linear-gradient(top,red,#000);background-color:linear-gradient(top,red,#000)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background-color', [[1, 2, undefined]]],
            ['property-value', '-ms-linear-gradient(top,red,#000)', [[1, 19, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-color', [[1, 53, undefined]]],
            ['property-value', 'linear-gradient(top,red,#000)', [[1, 70, undefined]]]
          ]
        ]);
      }
    },
    'longhand then longhand - background position as function': {
      'topic': function () {
        return _optimize('p{background-position:-moz-calc(100% - 1em) 0;background-position:calc(100% - 1em) 0}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background-position', [[1, 2, undefined]]],
            ['property-value', '-moz-calc(100% - 1em)', [[1, 22, undefined]]],
            ['property-value', '0', [[1, 44, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-position', [[1, 46, undefined]]],
            ['property-value', 'calc(100% - 1em)', [[1, 66, undefined]]],
            ['property-value', '0', [[1, 83, undefined]]]
          ]
        ]);
      }
    },
    'longhand then longhand - background position as same function': {
      'topic': function () {
        return _optimize('p{background-position:calc(100% - 1em) 0;background-position:calc(100% - 1em) 1em}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background-position', [[1, 41, undefined]]],
            ['property-value', 'calc(100% - 1em)', [[1, 61, undefined]]],
            ['property-value', '1em', [[1, 78, undefined]]]
          ]
        ]);
      }
    },
    'longhand then longhand - background position as function by value': {
      'topic': function () {
        return _optimize('p{background-position:calc(100% - 1em) 0;background-position:1em 1em}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background-position', [[1, 41, undefined]]],
            ['property-value', '1em', [[1, 61, undefined]]],
            ['property-value', '1em', [[1, 65, undefined]]]
          ]
        ]);
      }
    },
    'longhand then longhand - background position as value by function': {
      'topic': function () {
        return _optimize('p{background-position:1em 0;background-position:calc(100% - 1em) 1em}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background-position', [[1, 2, undefined]]],
            ['property-value', '1em', [[1, 22, undefined]]],
            ['property-value', '0', [[1, 26, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-position', [[1, 28, undefined]]],
            ['property-value', 'calc(100% - 1em)', [[1, 48, undefined]]],
            ['property-value', '1em', [[1, 65, undefined]]]
          ]
        ]);
      }
    },
    'longhand then longhand - background size as function': {
      'topic': function () {
        return _optimize('p{background-size:-moz-calc(100% - 1em) 0;background-size:calc(100% - 1em) 0}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background-size', [[1, 2, undefined]]],
            ['property-value', '-moz-calc(100% - 1em)', [[1, 18, undefined]]],
            ['property-value', '0', [[1, 40, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-size', [[1, 42, undefined]]],
            ['property-value', 'calc(100% - 1em)', [[1, 58, undefined]]],
            ['property-value', '0', [[1, 75, undefined]]]
          ]
        ]);
      }
    },
    'longhand then shorthand': {
      'topic': function () {
        return _optimize('p{background-image:none;background:url(image.png)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 24, undefined]]],
            ['property-value', 'url(image.png)', [[1, 35, undefined]]]
          ]
        ]);
      }
    },
    'longhand then shorthand - important then non-important': {
      'topic': function () {
        return _optimize('p{background-image:none!important;background:url(image.png)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background-image', [[1, 2, undefined]]],
            ['property-value', 'none!important', [[1, 19, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background', [[1, 34, undefined]]],
            ['property-value', 'url(image.png)', [[1, 45, undefined]]]
          ]
        ]);
      }
    },
    'longhand then shorthand - with vendor prefixed function': {
      'topic': function () {
        return _optimize('p{background-color:red;background:-ms-linear-gradient(top,red,#000)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background-color', [[1, 2, undefined]]],
            ['property-value', 'red', [[1, 19, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background', [[1, 23, undefined]]],
            ['property-value', '-ms-linear-gradient(top,red,#000)', [[1, 34, undefined]]]
          ]
        ]);
      }
    },
    'longhand then shorthand - with same vendor prefixed function': {
      'topic': function () {
        return _optimize('p{background-image:-ms-linear-gradient(bottom,black,white);background:-ms-linear-gradient(top,red,#000)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 59, undefined]]],
            ['property-value', '-ms-linear-gradient(top,red,#000)', [[1, 70, undefined]]]
          ]
        ]);
      }
    },
    'longhand then shorthand - with different vendor prefixed function': {
      'topic': function () {
        return _optimize('p{background-image:linear-gradient(bottom,black,white);background:-ms-linear-gradient(top,red,#000)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background-image', [[1, 2, undefined]]],
            ['property-value', 'linear-gradient(bottom,black,white)', [[1, 19, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background', [[1, 55, undefined]]],
            ['property-value', '-ms-linear-gradient(top,red,#000)', [[1, 66, undefined]]]
          ]
        ]);
      }
    },
    'longhand then shorthand - with unprefixed function': {
      'topic': function () {
        return _optimize('p{background-color:red;background:linear-gradient(red,blue)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background-color', [[1, 2, undefined]]],
            ['property-value', 'red', [[1, 19, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background', [[1, 23, undefined]]],
            ['property-value', 'linear-gradient(red,blue)', [[1, 34, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then longhand': {
      'topic': function () {
        return _optimize('p{background:url(image.png) repeat;background-repeat:no-repeat}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'url(image.png)', [[1, 13, undefined]]],
            ['property-value', 'no-repeat', [[1, 53, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then longhand - important then non-important': {
      'topic': function () {
        return _optimize('p{background:url(image.png) repeat-x!important;background-repeat:no-repeat}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'url(image.png)', [[1, 13, undefined]]],
            ['property-value', 'repeat-x!important', [[1, 28, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then longhand - non-important then important': {
      'topic': function () {
        return _optimize('p{background:url(image.png) repeat;background-repeat:no-repeat!important}');
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
            ['property-name', 'background-repeat', [[1, 35, undefined]]],
            ['property-value', 'no-repeat!important', [[1, 53, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then longhand - disabled background size merging': {
      'topic': function () {
        return _optimize('p{background:url(image.png);background-size:50%}', { properties: { backgroundSizeMerging: false } });
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
            ['property-name', 'background-size', [[1, 28, undefined]]],
            ['property-value', '50%', [[1, 44, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then longhand - disabled background clip merging': {
      'topic': function () {
        return _optimize('p{background:url(image.png);background-clip:padding-box}', { properties: { backgroundClipMerging: false } });
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
            ['property-name', 'background-clip', [[1, 28, undefined]]],
            ['property-value', 'padding-box', [[1, 44, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then longhand - enabled background clip merging': {
      'topic': function () {
        return _optimize('p{background:url(image.png);background-clip:padding-box}', { properties: { backgroundClipMerging: true } });
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'url(image.png)', [[1, 13, undefined]]],
            ['property-value', 'padding-box']
          ]
        ]);
      }
    },
    'shorthand then longhand - disabled background origin merging': {
      'topic': function () {
        return _optimize('p{background:url(image.png);background-origin:border-box}', { properties: { backgroundOriginMerging: false } });
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
            ['property-name', 'background-origin', [[1, 28, undefined]]],
            ['property-value', 'border-box', [[1, 46, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then longhand - enabled background origin merging': {
      'topic': function () {
        return _optimize('p{background:url(image.png);background-origin:border-box}', { properties: { backgroundOriginMerging: true } });
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'url(image.png)', [[1, 13, undefined]]],
            ['property-value', 'border-box', [[1, 46, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then longhand - non mergeable value': {
      'topic': function () {
        return _optimize('p{background:url(image.png);background-color:none}');
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
            ['property-name', 'background-color', [[1, 28, undefined]]],
            ['property-value', 'none', [[1, 45, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then multiplex longhand - non mergeable value': {
      'topic': function () {
        return _optimize('p{background:#fff;background-image:url(image.png),linear-gradient()}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', '#fff', [[1, 13, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-image', [[1, 18, undefined]]],
            ['property-value', 'url(image.png)', [[1, 35, undefined]]],
            ['property-value', ',', [[1, 49, undefined]]],
            ['property-value', 'linear-gradient()', [[1, 50, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then longhand - border with rgba() and color opacity on': {
      'topic': function () {
        return _optimize('p{border:solid rgba(0,0,0,0);border-color:transparent}', { colors: { opacity: true } });
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border', [[1, 2, undefined]]],
            ['property-value', 'solid', [[1, 9, undefined]]],
            ['property-value', 'transparent', [[1, 42, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then longhand - border with rgba() and color opacity off': {
      'topic': function () {
        return _optimize('p{border:solid rgba(0,0,0,0);border-color:transparent}', { colors: { opacity: false } });
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border', [[1, 2, undefined]]],
            ['property-value', 'solid', [[1, 9, undefined]]],
            ['property-value', 'rgba(0,0,0,0)', [[1, 15, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border-color', [[1, 29, undefined]]],
            ['property-value', 'transparent', [[1, 42, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then longhand - color into a color - with merging off': {
      'topic': function () {
        return _optimize('p{background:white;background-color:red}', { properties: { merging: false } });
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'red', [[1, 36, undefined]]]
          ],
        ]);
      }
    },
    'shorthand then longhand - color into a function - with merging off': {
      'topic': function () {
        return _optimize('p{background:linear-gradient();background-color:red}', { properties: { merging: false } });
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'linear-gradient()', [[1, 13, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-color', [[1, 31, undefined]]],
            ['property-value', 'red', [[1, 48, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then longhand - two shorthands - pending #527': {
      'topic': function () {
        return _optimize('p{background:-webkit-linear-gradient();background:linear-gradient();background-repeat:repeat-x}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', '-webkit-linear-gradient()', [[1, 13, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background', [[1, 39, undefined]]],
            ['property-value', 'linear-gradient()', [[1, 50, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-repeat', [[1, 68, undefined]]],
            ['property-value', 'repeat-x', [[1, 86, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then longhand - two shorthands and default - pending #527': {
      'topic': function () {
        return _optimize('p{background:-webkit-linear-gradient();background:linear-gradient();background-repeat:repeat}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', '-webkit-linear-gradient()', [[1, 13, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background', [[1, 39, undefined]]],
            ['property-value', 'linear-gradient()', [[1, 50, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-repeat', [[1, 68, undefined]]],
            ['property-value', 'repeat', [[1, 86, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then longhand - two mergeable shorthands and default - pending #527': {
      'topic': function () {
        return _optimize('p{background:url(image.png);background:url(image.jpg);background-repeat:repeat-x}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'url(image.jpg)', [[1, 39, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-repeat', [[1, 54, undefined]]],
            ['property-value', 'repeat-x', [[1, 72, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then longhand - non-function into a function': {
      'topic': function () {
        return _optimize('p{background:linear-gradient();background-color:red}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'linear-gradient()', [[1, 13, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-color', [[1, 31, undefined]]],
            ['property-value', 'red', [[1, 48, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then longhand - function into a non-function': {
      'topic': function () {
        return _optimize('p{background:repeat-x;background-image:-webkit-linear-gradient()}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'repeat-x', [[1, 13, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-image', [[1, 22, undefined]]],
            ['property-value', '-webkit-linear-gradient()', [[1, 39, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then shorthand - same values': {
      'topic': function () {
        return _optimize('p{background:red;background:red}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'red', [[1, 28, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then shorthand - same values with defaults': {
      'topic': function () {
        return _optimize('p{background:repeat red;background:red}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'red', [[1, 35, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then shorthand - with different functions': {
      'topic': function () {
        return _optimize('p{background:linear-gradient();background:-webkit-gradient()}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'linear-gradient()', [[1, 13, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background', [[1, 31, undefined]]],
            ['property-value', '-webkit-gradient()', [[1, 42, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then shorthand - with function then url': {
      'topic': function () {
        return _optimize('p{background:linear-gradient();background:url(image.png)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'url(image.png)', [[1, 42, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then shorthand - with url then function': {
      'topic': function () {
        return _optimize('p{background:url(image.png);background:linear-gradient()}');
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
            ['property-name', 'background', [[1, 28, undefined]]],
            ['property-value', 'linear-gradient()', [[1, 39, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then shorthand - important then non-important': {
      'topic': function () {
        return _optimize('p{background:url(image.png) no-repeat!important;background:url(image.jpg) repeat red}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'url(image.png)', [[1, 13, undefined]]],
            ['property-value', 'no-repeat!important', [[1, 28, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then shorthand - non-important then important': {
      'topic': function () {
        return _optimize('p{background:url(image.png) no-repeat;background:url(image.jpg) repeat red!important}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 38, undefined]]],
            ['property-value', 'url(image.jpg)', [[1, 49, undefined]]],
            ['property-value', 'red!important', [[1, 71, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then shorthand - same value and latter important': {
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
    'background-clip, -origin, and -size': {
      'topic': function () {
        return _optimize('a{background:url(/image.png);background-size:10px;background-origin:border-box;background-clip:padding-box}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'url(/image.png)', [[1, 13, undefined]]],
            ['property-value', 0],
            ['property-value', 0],
            ['property-value', '/'],
            ['property-value', '10px', [[1, 45, undefined]]],
            ['property-value', 'border-box', [[1, 68, undefined]]],
            ['property-value', 'padding-box', [[1, 95, undefined]]]
          ]
        ]);
      }
    },
    'background-clip, -origin, and -size - IE8 compatibility mode': {
      'topic': function () {
        return _optimize('a{background:url(/image.png);background-size:10px;background-origin:border-box;background-clip:padding-box}', 'ie8');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'url(/image.png)', [[1, 13, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-size', [[1, 29, undefined]]],
            ['property-value', '10px', [[1, 45, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-origin', [[1, 50, undefined]]],
            ['property-value', 'border-box', [[1, 68, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-clip', [[1, 79, undefined]]],
            ['property-value', 'padding-box', [[1, 95, undefined]]]
          ]
        ]);
      }
    }
  })
  .addBatch({
    'border': {
      'topic': function () {
        return _optimize('a{border:1px solid red;border-style:dotted}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border', [[1, 2, undefined]]],
            ['property-value', '1px', [[1, 9, undefined]]],
            ['property-value', 'dotted', [[1, 36, undefined]]],
            ['property-value', 'red', [[1, 19, undefined]]]
          ]
        ]);
      }
    },
    'border - multivalue righthand': {
      'topic': function () {
        return _optimize('a{border:1px solid red;border-style:dotted solid}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border', [[1, 2, undefined]]],
            ['property-value', '1px', [[1, 9, undefined]]],
            ['property-value', 'solid', [[1, 13, undefined]]],
            ['property-value', 'red', [[1, 19, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border-style', [[1, 23, undefined]]],
            ['property-value', 'dotted', [[1, 36, undefined]]],
            ['property-value', 'solid', [[1, 43, undefined]]]
          ]
        ]);
      }
    },
    'border - important righthand': {
      'topic': function () {
        return _optimize('a{border:1px solid red;border-style:dotted!important}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border', [[1, 2, undefined]]],
            ['property-value', '1px', [[1, 9, undefined]]],
            ['property-value', 'solid', [[1, 13, undefined]]],
            ['property-value', 'red', [[1, 19, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border-style', [[1, 23, undefined]]],
            ['property-value', 'dotted!important', [[1, 36, undefined]]],
          ]
        ]);
      }
    },
    'border - important lefthand': {
      'topic': function () {
        return _optimize('a{border:1px solid red!important;border-style:dotted}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border', [[1, 2, undefined]]],
            ['property-value', '1px', [[1, 9, undefined]]],
            ['property-value', 'solid', [[1, 13, undefined]]],
            ['property-value', 'red!important', [[1, 19, undefined]]]
          ]
        ]);
      }
    },
    'border - both important': {
      'topic': function () {
        return _optimize('a{border:1px solid red!important;border-style:dotted!important}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border', [[1, 2, undefined]]],
            ['property-value', '1px', [[1, 9, undefined]]],
            ['property-value', 'dotted', [[1, 46, undefined]]],
            ['property-value', 'red!important', [[1, 19, undefined]]]
          ]
        ]);
      }
    },
    'border - hex and rgb colors': {
      'topic': function () {
        return _optimize('a{border:1px solid #000;border-color:rgba(255,0,0,.5)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border', [[1, 2, undefined]]],
            ['property-value', '1px', [[1, 9, undefined]]],
            ['property-value', 'solid', [[1, 13, undefined]]],
            ['property-value', 'rgba(255,0,0,.5)', [[1, 37, undefined]]],
          ]
        ]);
      }
    },
    'border - hex and rgb colors - IE8 mode': {
      'topic': function () {
        return _optimize('a{border:1px solid #000;border-color:rgba(255,0,0,.5)}', 'ie8');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border', [[1, 2, undefined]]],
            ['property-value', '1px', [[1, 9, undefined]]],
            ['property-value', 'solid', [[1, 13, undefined]]],
            ['property-value', '#000', [[1, 19, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border-color', [[1, 24, undefined]]],
            ['property-value', 'rgba(255,0,0,.5)', [[1, 37, undefined]]],
          ]
        ]);
      }
    },
    'border-color - hex then rgb': {
      'topic': function () {
        return _optimize('a{border-color:#000;border-color:rgba(255,0,0,.5)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border-color', [[1, 2, undefined]]],
            ['property-value', 'rgba(255,0,0,.5)', [[1, 33, undefined]]],
          ]
        ]);
      }
    },
    'border-color - hex then rgb - IE8 mode': {
      'topic': function () {
        return _optimize('a{border-color:#000;border-color:rgba(255,0,0,.5)}', 'ie8');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border-color', [[1, 2, undefined]]],
            ['property-value', '#000', [[1, 15, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border-color', [[1, 20, undefined]]],
            ['property-value', 'rgba(255,0,0,.5)', [[1, 33, undefined]]],
          ]
        ]);
      }
    },
    'border-color - rgb then hex': {
      'topic': function () {
        return _optimize('a{border-color:rgba(255,0,0,.5);border-color:#000}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border-color', [[1, 2, undefined]]],
            ['property-value', '#000', [[1, 45, undefined]]]
          ]
        ]);
      }
    },
    'border-color - hex then rgb with multiple values': {
      'topic': function () {
        return _optimize('a{border-color:red;border-color:#000 rgba(255,0,0,.5)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border-color', [[1, 2, undefined]]],
            ['property-value', '#000', [[1, 32, undefined]]],
            ['property-value', 'rgba(255,0,0,.5)', [[1, 37, undefined]]],
          ]
        ]);
      }
    },
    'border-color - hex then rgb with multiple values - IE8 mode': {
      'topic': function () {
        return _optimize('a{border-color:red;border-color:#000 rgba(255,0,0,.5)}', 'ie8');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border-color', [[1, 2, undefined]]],
            ['property-value', 'red', [[1, 15, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border-color', [[1, 19, undefined]]],
            ['property-value', '#000', [[1, 32, undefined]]],
            ['property-value', 'rgba(255,0,0,.5)', [[1, 37, undefined]]],
          ]
        ]);
      }
    }
  })
  .addBatch({
    'border radius': {
      'topic': function () {
        return _optimize('a{-moz-border-radius:2px;-moz-border-top-left-radius:3px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', '-moz-border-radius', [[1, 2, undefined]]],
            ['property-value', '3px', [[1, 53, undefined]]],
            ['property-value', '2px', [[1, 21, undefined]]],
            ['property-value', '2px', [[1, 21, undefined]]]
          ]
        ]);
      }
    },
    'border radius prefixed and unprefixed': {
      'topic': function () {
        return _optimize('a{-moz-border-radius:2px;border-top-left-radius:3px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', '-moz-border-radius', [[1, 2, undefined]]],
            ['property-value', '2px', [[1, 21, undefined]]]
          ],
          [
            'property',
            ['property-name', 'border-top-left-radius', [[1, 25, undefined]]],
            ['property-value', '3px', [[1, 48, undefined]]]
          ]
        ]);
      }
    },
    'border width': {
      'topic': function () {
        return _optimize('a{border-width:2px 3px 2px 1px;border-left-width:3px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'border-width', [[1, 2, undefined]]],
            ['property-value', '2px', [[1, 15, undefined]]],
            ['property-value', '3px', [[1, 19, undefined]]]
          ]
        ]);
      }
    },
    'list style': {
      'topic': function () {
        return _optimize('a{list-style:circle inside;list-style-image:url(image.png)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'list-style', [[1, 2, undefined]]],
            ['property-value', 'circle', [[1, 13, undefined]]],
            ['property-value', 'inside', [[1, 20, undefined]]],
            ['property-value', 'url(image.png)', [[1, 44, undefined]]]
          ]
        ]);
      }
    },
    'margin': {
      'topic': function () {
        return _optimize('a{margin:10px 20px;margin-left:25px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'margin', [[1, 2, undefined]]],
            ['property-value', '10px', [[1, 9, undefined]]],
            ['property-value', '20px', [[1, 14, undefined]]],
            ['property-value', '10px', [[1, 9, undefined]]],
            ['property-value', '25px', [[1, 31, undefined]]]
          ]
        ]);
      }
    },
    'outline': {
      'topic': function () {
        return _optimize('a{outline:red solid 1px;outline-width:3px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'outline', [[1, 2, undefined]]],
            ['property-value', 'red', [[1, 10, undefined]]],
            ['property-value', 'solid', [[1, 14, undefined]]],
            ['property-value', '3px', [[1, 38, undefined]]]
          ]
        ]);
      }
    },
    'outline with vendor prefixed color 1234': {
      'topic': function () {
        return _optimize('a{outline:red solid 1px;outline:-webkit-focus-ring-color auto 5px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'outline', [[1, 2, undefined]]],
            ['property-value', 'red', [[1, 10, undefined]]],
            ['property-value', 'solid', [[1, 14, undefined]]],
            ['property-value', '1px', [[1, 20, undefined]]]
          ],
          [
            'property',
            ['property-name', 'outline', [[1, 24, undefined]]],
            ['property-value', '-webkit-focus-ring-color', [[1, 32, undefined]]],
            ['property-value', 'auto', [[1, 57, undefined]]],
            ['property-value', '5px', [[1, 62, undefined]]]
          ]
        ]);
      }
    },
    'padding': {
      'topic': function () {
        return _optimize('a{padding:10px;padding-right:20px;padding-left:20px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'padding', [[1, 2, undefined]]],
            ['property-value', '10px', [[1, 10, undefined]]],
            ['property-value', '20px', [[1, 29, undefined]]],
          ]
        ]);
      }
    }
  })
  .addBatch({
    'colors with same understandability': {
      'topic': function () {
        return _optimize('a{color:red;color:#fff;color:blue}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'color', [[1, 23, undefined]]],
            ['property-value', 'blue', [[1, 29, undefined]]],
          ]
        ]);
      }
    },
    'colors with different understandability': {
      'topic': function () {
        return _optimize('a{color:red;color:#fff;color:blue;color:rgba(1,2,3,.4)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'color', [[1, 34, undefined]]],
            ['property-value', 'rgba(1,2,3,.4)', [[1, 40, undefined]]],
          ]
        ]);
      }
    },
    'colors with different understandability - IE8 mode': {
      'topic': function () {
        return _optimize('a{color:red;color:#fff;color:blue;color:rgba(1,2,3,.4)}', 'ie8');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'color', [[1, 23, undefined]]],
            ['property-value', 'blue', [[1, 29, undefined]]],
          ],
          [
            'property',
            ['property-name', 'color', [[1, 34, undefined]]],
            ['property-value', 'rgba(1,2,3,.4)', [[1, 40, undefined]]],
          ]
        ]);
      }
    },
    'colors with different understandability overridden by high understandability': {
      'topic': function () {
        return _optimize('a{color:red;color:#fff;color:blue;color:rgba(1,2,3,.4);color:red}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'color', [[1, 55, undefined]]],
            ['property-value', 'red', [[1, 61, undefined]]],
          ]
        ]);
      }
    },
    'colors with different understandability and importance #1': {
      'topic': function () {
        return _optimize('a{color:#fff!important;color:rgba(1,2,3,.4)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'color', [[1, 2, undefined]]],
            ['property-value', '#fff!important', [[1, 8, undefined]]],
          ]
        ]);
      }
    },
    'colors with different understandability and importance #2': {
      'topic': function () {
        return _optimize('a{color:#fff;color:rgba(1,2,3,.4)!important}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'color', [[1, 13, undefined]]],
            ['property-value', 'rgba(1,2,3,.4)!important', [[1, 19, undefined]]],
          ]
        ]);
      }
    },
    'colors with different understandability and importance #2 - IE8 mode': {
      'topic': function () {
        return _optimize('a{color:#fff;color:rgba(1,2,3,.4)!important}', 'ie8');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'color', [[1, 2, undefined]]],
            ['property-value', '#fff', [[1, 8, undefined]]],
          ],
          [
            'property',
            ['property-name', 'color', [[1, 13, undefined]]],
            ['property-value', 'rgba(1,2,3,.4)!important', [[1, 19, undefined]]],
          ]
        ]);
      }
    }
  })
  .addBatch({
    'shorthand then shorthand multiplex': {
      'topic': function () {
        return _optimize('p{background:url(one.png);background:url(two.png) center 1px,url(three.png) center 2px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'url(one.png)', [[1, 13, undefined]]],
          ],
          [
            'property',
            ['property-name', 'background', [[1, 26, undefined]]],
            ['property-value', 'url(two.png)', [[1, 37, undefined]]],
            ['property-value', 'center', [[1, 50, undefined]]],
            ['property-value', '1px', [[1, 57, undefined]]],
            ['property-value', ','],
            ['property-value', 'url(three.png)', [[1, 61, undefined]]],
            ['property-value', 'center', [[1, 76, undefined]]],
            ['property-value', '2px', [[1, 83, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then longhand multiplex': {
      'topic': function () {
        return _optimize('p{background:top left;background-repeat:no-repeat,no-repeat}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'top', [[1, 13, undefined]]],
            ['property-value', 'left', [[1, 17, undefined]]],
            ['property-value', 'no-repeat', [[1, 40, undefined]]],
            ['property-value', ','],
            ['property-value', 'top', [[1, 13, undefined]]],
            ['property-value', 'left', [[1, 17, undefined]]],
            ['property-value', 'no-repeat', [[1, 50, undefined]]]
          ]
        ]);
      }
    },
    'shorthand then longhand multiplex - background-image': {
      'topic': function () {
        return _optimize('p{background:url(one.png);background-repeat:no-repeat,repeat-x}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'url(one.png)', [[1, 13, undefined]]],
            ['property-value', 'no-repeat', [[1, 44, undefined]]],
            ['property-value', ','],
            ['property-value', 'repeat-x', [[1, 54, undefined]]]
          ]
        ]);
      }
    },
    'shorthand multiplex then longhand repeat': {
      'topic': function () {
        return _optimize('p{background:url(image.png),url(image.jpg);background-repeat:no-repeat}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'url(image.png)', [[1, 13, undefined]]],
            ['property-value', 'no-repeat', [[1, 61, undefined]]],
            ['property-value', ','],
            ['property-value', 'url(image.jpg)', [[1, 28, undefined]]],
            ['property-value', 'no-repeat', [[1, 61, undefined]]]
          ]
        ]);
      }
    },
    'shorthand multiplex then longhand image': {
      'topic': function () {
        return _optimize('p{background:no-repeat,no-repeat;background-image:url(image.png)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'url(image.png)', [[1, 50, undefined]]],
            ['property-value', 'no-repeat', [[1, 13, undefined]]],
            ['property-value', ','],
            ['property-value', 'no-repeat', [[1, 23, undefined]]]
          ]
        ]);
      }
    },
    'longhand then shorthand multiplex': {
      'topic': function () {
        return _optimize('p{background-repeat:no-repeat;background:url(image.png),url(image.jpg)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 30, undefined]]],
            ['property-value', 'url(image.png)', [[1, 41, undefined]]],
            ['property-value', ','],
            ['property-value', 'url(image.jpg)', [[1, 56, undefined]]],
          ]
        ]);
      }
    },
    'longhand multiplex then shorthand': {
      'topic': function () {
        return _optimize('p{background-repeat:no-repeat,no-repeat;background:url(image.png)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 40, undefined]]],
            ['property-value', 'url(image.png)', [[1, 51, undefined]]],
          ]
        ]);
      }
    },
    'multiplex longhand into multiplex shorthand': {
      'topic': function () {
        return _optimize('p{background:no-repeat,no-repeat;background-position:top left,bottom left}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'top', [[1, 53, undefined]]],
            ['property-value', 'left', [[1, 57, undefined]]],
            ['property-value', 'no-repeat', [[1, 13, undefined]]],
            ['property-value', ','],
            ['property-value', 'bottom', [[1, 62, undefined]]],
            ['property-value', 'left', [[1, 69, undefined]]],
            ['property-value', 'no-repeat', [[1, 23, undefined]]]
          ]
        ]);
      }
    },
    'two multiplex shorthands with vendor specific functions': {
      'topic': function () {
        return _optimize('p{background:url(1.png),-webkit-linear-gradient();background:url(1.png),linear-gradient()}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'url(1.png)', [[1, 13, undefined]]],
            ['property-value', ','],
            ['property-value', '-webkit-linear-gradient()', [[1, 24, undefined]]],
          ],
          [
            'property',
            ['property-name', 'background', [[1, 50, undefined]]],
            ['property-value', 'url(1.png)', [[1, 61, undefined]]],
            ['property-value', ','],
            ['property-value', 'linear-gradient()', [[1, 72, undefined]]],
          ]
        ]);
      }
    },
    'not too long into multiplex #1': {
      'topic': function () {
        return _optimize('p{background:top left;background-repeat:no-repeat,no-repeat}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'top', [[1, 13, undefined]]],
            ['property-value', 'left', [[1, 17, undefined]]],
            ['property-value', 'no-repeat', [[1, 40, undefined]]],
            ['property-value', ','],
            ['property-value', 'top', [[1, 13, undefined]]],
            ['property-value', 'left', [[1, 17, undefined]]],
            ['property-value', 'no-repeat', [[1, 50, undefined]]]
          ]
        ]);
      }
    },
    'not too long into multiplex #2': {
      'topic': function () {
        return _optimize('p{background:repeat content-box;background-repeat:no-repeat,no-repeat}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'no-repeat', [[1, 50, undefined]]],
            ['property-value', 'content-box', [[1, 20, undefined]]],
            ['property-value', ','],
            ['property-value', 'no-repeat', [[1, 60, undefined]]],
            ['property-value', 'content-box', [[1, 20, undefined]]]
          ]
        ]);
      }
    },
    'not too long into multiplex - twice': {
      'topic': function () {
        return _optimize('p{background:top left;background-repeat:no-repeat,no-repeat;background-image:url(image.png),url(image.jpg)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'url(image.png)', [[1, 77, undefined]]],
            ['property-value', 'top', [[1, 13, undefined]]],
            ['property-value', 'left', [[1, 17, undefined]]],
            ['property-value', 'no-repeat', [[1, 40, undefined]]],
            ['property-value', ','],
            ['property-value', 'url(image.jpg)', [[1, 92, undefined]]],
            ['property-value', 'top', [[1, 13, undefined]]],
            ['property-value', 'left', [[1, 17, undefined]]],
            ['property-value', 'no-repeat', [[1, 50, undefined]]]
          ]
        ]);
      }
    },
    'not too long into multiplex - over a property': {
      'topic': function () {
        return _optimize('p{background:top left;background-repeat:no-repeat,no-repeat;background-image:url(image.png)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'url(image.png)', [[1, 77, undefined]]],
            ['property-value', 'top', [[1, 13, undefined]]],
            ['property-value', 'left', [[1, 17, undefined]]],
            ['property-value', 'no-repeat', [[1, 40, undefined]]],
            ['property-value', ','],
            ['property-value', 'top', [[1, 13, undefined]]],
            ['property-value', 'left', [[1, 17, undefined]]],
            ['property-value', 'no-repeat', [[1, 50, undefined]]]
          ]
        ]);
      }
    },
    'too long into multiplex #1': {
      'topic': function () {
        return _optimize('p{background:top left / 100px 20px;background-repeat:no-repeat,no-repeat}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'top', [[1, 13, undefined]]],
            ['property-value', 'left', [[1, 17, undefined]]],
            ['property-value', '/'],
            ['property-value', '100px', [[1, 24, undefined]]],
            ['property-value', '20px', [[1, 30, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-repeat', [[1, 35, undefined]]],
            ['property-value', 'no-repeat', [[1, 53, undefined]]],
            ['property-value', ',', [[1, 62, undefined]]],
            ['property-value', 'no-repeat', [[1, 63, undefined]]]
          ]
        ]);
      }
    },
    'too long into multiplex #2': {
      'topic': function () {
        return _optimize('p{background:content-box padding-box;background-repeat:no-repeat,no-repeat}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'content-box', [[1, 13, undefined]]],
            ['property-value', 'padding-box', [[1, 25, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-repeat', [[1, 37, undefined]]],
            ['property-value', 'no-repeat', [[1, 55, undefined]]],
            ['property-value', ',', [[1, 64, undefined]]],
            ['property-value', 'no-repeat', [[1, 65, undefined]]]
          ]
        ]);
      }
    },
    'too long into multiplex #3 - equal size': {
      'topic': function () {
        return _optimize('p{background:top left / 20px 20px;background-repeat:no-repeat,no-repeat}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'top', [[1, 13, undefined]]],
            ['property-value', 'left', [[1, 17, undefined]]],
            ['property-value', '/'],
            ['property-value', '20px', [[1, 24, undefined]]],
            ['property-value', '20px', [[1, 29, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-repeat', [[1, 34, undefined]]],
            ['property-value', 'no-repeat', [[1, 52, undefined]]],
            ['property-value', ',', [[1, 61, undefined]]],
            ['property-value', 'no-repeat', [[1, 62, undefined]]]
          ]
        ]);
      }
    },
    'background color into background': {
      'topic': function () {
        return _optimize('p{background:red;background-image:url(image.png),url(image.jpg)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'url(image.png)', [[1, 34, undefined]]],
            ['property-value', ','],
            ['property-value', 'url(image.jpg)', [[1, 49, undefined]]],
            ['property-value', 'red', [[1, 13, undefined]]]
          ]
        ]);
      }
    },
    'background then background - svg hack': {
      'topic': function () {
        return _optimize('p{background:url(image.png);background:url(image.svg),none}');
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
            ['property-name', 'background', [[1, 28, undefined]]],
            ['property-value', 'url(image.svg)', [[1, 39, undefined]]],
            ['property-value', ','],
            ['property-value', 'none', [[1, 54, undefined]]]
          ]
        ]);
      }
    },
    'background then background - inverted svg hack': {
      'topic': function () {
        return _optimize('p{background:url(image.png);background:none,url(image.svg)}');
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
            ['property-name', 'background', [[1, 28, undefined]]],
            ['property-value', '0 0'],
            ['property-value', ','],
            ['property-value', 'url(image.svg)', [[1, 44, undefined]]]
          ]
        ]);
      }
    },
    'background-image then background-image - svg hack': {
      'topic': function () {
        return _optimize('p{background-image:url(image.png);background-image:url(image.svg),none}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background-image', [[1, 2, undefined]]],
            ['property-value', 'url(image.png)', [[1, 19, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-image', [[1, 34, undefined]]],
            ['property-value', 'url(image.svg)', [[1, 51, undefined]]],
            ['property-value', ',', [[1, 65, undefined]]],
            ['property-value', 'none', [[1, 66, undefined]]]
          ]
        ]);
      }
    }
  })
  .addBatch({
    'font shorthand and longhand': {
      'topic': function () {
        return _optimize('.block{font:12px sans-serif;font-weight:bold}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'font', [[1, 7, undefined]]],
            ['property-value', 'bold', [[1, 40, undefined]]],
            ['property-value', '12px', [[1, 12, undefined]]],
            ['property-value', 'sans-serif', [[1, 17, undefined]]]
          ]
        ]);
      }
    },
    'font shorthand and line-height': {
      'topic': function () {
        return _optimize('.block{font:12px sans-serif;line-height:16px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'font', [[1, 7, undefined]]],
            ['property-value', '12px', [[1, 12, undefined]]],
            ['property-value', '/'],
            ['property-value', '16px', [[1, 40, undefined]]],
            ['property-value', 'sans-serif', [[1, 17, undefined]]]
          ]
        ]);
      }
    },
    'font longhand and shorthand': {
      'topic': function () {
        return _optimize('.block{font-stretch:extra-condensed;font:12px sans-serif}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'font', [[1, 36, undefined]]],
            ['property-value', '12px', [[1, 41, undefined]]],
            ['property-value', 'sans-serif', [[1, 46, undefined]]]
          ]
        ]);
      }
    },
    'font shorthand with overriddable shorthand': {
      'topic': function () {
        return _optimize('.block{font:bold 14px serif;font:12px sans-serif}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'font', [[1, 7, undefined]]],
            ['property-value', '12px', [[1, 33, undefined]]],
            ['property-value', 'sans-serif', [[1, 38, undefined]]]
          ]
        ]);
      }
    },
    'font shorthand with non-overriddable shorthand': {
      'topic': function () {
        return _optimize('.block{font:bold 14px serif;font:16px -moz-sans-serif}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'font', [[1, 7, undefined]]],
            ['property-value', 'bold', [[1, 12, undefined]]],
            ['property-value', '14px', [[1, 17, undefined]]],
            ['property-value', 'serif', [[1, 22, undefined]]]
          ],
          [
            'property',
            ['property-name', 'font', [[1, 28, undefined]]],
            ['property-value', '16px', [[1, 33, undefined]]],
            ['property-value', '-moz-sans-serif', [[1, 38, undefined]]]
          ]
        ]);
      }
    },
    'font shorthand after non-component longhands': {
      'topic': function () {
        return _optimize('.block{font-kerning:none;font-synthesis:none;font:14px serif}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'font-kerning', [[1, 7, undefined]]],
            ['property-value', 'none', [[1, 20, undefined]]]
          ],
          [
            'property',
            ['property-name', 'font-synthesis', [[1, 25, undefined]]],
            ['property-value', 'none', [[1, 40, undefined]]]
          ],
          [
            'property',
            ['property-name', 'font', [[1, 45, undefined]]],
            ['property-value', '14px', [[1, 50, undefined]]],
            ['property-value', 'serif', [[1, 55, undefined]]]
          ]
        ]);
      }
    },
    'system font shorthand before longhand': {
      'topic': function () {
        return _optimize('.block{font:icon;font-weight:bold}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'font', [[1, 7, undefined]]],
            ['property-value', 'icon', [[1, 12, undefined]]]
          ],
          [
            'property',
            ['property-name', 'font-weight', [[1, 17, undefined]]],
            ['property-value', 'bold', [[1, 29, undefined]]]
          ]
        ]);
      }
    },
    'system font shorthand after longhand': {
      'topic': function () {
        return _optimize('.block{font-weight:bold;font:icon}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'font', [[1, 24, undefined]]],
            ['property-value', 'icon', [[1, 29, undefined]]]
          ]
        ]);
      }
    },
    'two system font shorthands': {
      'topic': function () {
        return _optimize('.block{font:status-bar;font:icon}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'font', [[1, 23, undefined]]],
            ['property-value', 'icon', [[1, 28, undefined]]]
          ]
        ]);
      }
    }
  })
  .addBatch({
    'padding !important then not !important': {
      'topic': function () {
        return _optimize('a{padding:0!important;padding-left:3px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'padding', [[1, 2, undefined]]],
            ['property-value', '0!important', [[1, 10, undefined]]]
          ]
        ]);
      }
    }
  })
  .addBatch({
    'bottom': {
      'topic': function () {
        return _optimize('.block{bottom:0;bottom:2rem}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'bottom', [[1, 16, undefined]]],
            ['property-value', '2rem', [[1, 23, undefined]]]
          ]
        ]);
      }
    },
    'bottom - non overriddable': {
      'topic': function () {
        return _optimize('.block{bottom:2rem;bottom:calc(1vm + 1px)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'bottom', [[1, 7, undefined]]],
            ['property-value', '2rem', [[1, 14, undefined]]]
          ],
          [
            'property',
            ['property-name', 'bottom', [[1, 19, undefined]]],
            ['property-value', 'calc(1vm + 1px)', [[1, 26, undefined]]]
          ]
        ]);
      }
    },
    'cursor': {
      'topic': function () {
        return _optimize('.block{cursor:auto;cursor:pointer}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'cursor', [[1, 19, undefined]]],
            ['property-value', 'pointer', [[1, 26, undefined]]]
          ]
        ]);
      }
    },
    'cursor - non overriddable': {
      'topic': function () {
        return _optimize('.block{cursor:pointer;cursor:url(image.png)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'cursor', [[1, 7, undefined]]],
            ['property-value', 'pointer', [[1, 14, undefined]]]
          ],
          [
            'property',
            ['property-name', 'cursor', [[1, 22, undefined]]],
            ['property-value', 'url(image.png)', [[1, 29, undefined]]]
          ]
        ]);
      }
    },
    'left': {
      'topic': function () {
        return _optimize('.block{left:0;left:2rem}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'left', [[1, 14, undefined]]],
            ['property-value', '2rem', [[1, 19, undefined]]]
          ]
        ]);
      }
    },
    'left - non overriddable': {
      'topic': function () {
        return _optimize('.block{left:2rem;left:calc(1vm + 1px)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'left', [[1, 7, undefined]]],
            ['property-value', '2rem', [[1, 12, undefined]]]
          ],
          [
            'property',
            ['property-name', 'left', [[1, 17, undefined]]],
            ['property-value', 'calc(1vm + 1px)', [[1, 22, undefined]]]
          ]
        ]);
      }
    },
    'position': {
      'topic': function () {
        return _optimize('.block{position:static;position:relative}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'position', [[1, 23, undefined]]],
            ['property-value', 'relative', [[1, 32, undefined]]]
          ]
        ]);
      }
    },
    'position - non overriddable': {
      'topic': function () {
        return _optimize('.block{position:fixed;position:sticky}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'position', [[1, 7, undefined]]],
            ['property-value', 'fixed', [[1, 16, undefined]]]
          ],
          [
            'property',
            ['property-name', 'position', [[1, 22, undefined]]],
            ['property-value', 'sticky', [[1, 31, undefined]]]
          ]
        ]);
      }
    },
    'overflow': {
      'topic': function () {
        return _optimize('.block{overflow:hidden;overflow:visible}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'overflow', [[1, 23, undefined]]],
            ['property-value', 'visible', [[1, 32, undefined]]]
          ]
        ]);
      }
    },
    'overflow - non overriddable': {
      'topic': function () {
        return _optimize('.block{overflow:hidden;overflow:-moz-scrollbars-none }');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'overflow', [[1, 7, undefined]]],
            ['property-value', 'hidden', [[1, 16, undefined]]]
          ],
          [
            'property',
            ['property-name', 'overflow', [[1, 23, undefined]]],
            ['property-value', '-moz-scrollbars-none', [[1, 32, undefined]]]
          ]
        ]);
      }
    },
    'right': {
      'topic': function () {
        return _optimize('.block{right:0;right:2rem}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'right', [[1, 15, undefined]]],
            ['property-value', '2rem', [[1, 21, undefined]]]
          ]
        ]);
      }
    },
    'right - non overriddable': {
      'topic': function () {
        return _optimize('.block{right:2rem;right:calc(1vm + 1px)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'right', [[1, 7, undefined]]],
            ['property-value', '2rem', [[1, 13, undefined]]]
          ],
          [
            'property',
            ['property-name', 'right', [[1, 18, undefined]]],
            ['property-value', 'calc(1vm + 1px)', [[1, 24, undefined]]]
          ]
        ]);
      }
    },
    'top': {
      'topic': function () {
        return _optimize('.block{top:0;top:2rem}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'top', [[1, 13, undefined]]],
            ['property-value', '2rem', [[1, 17, undefined]]]
          ]
        ]);
      }
    },
    'top - non overriddable': {
      'topic': function () {
        return _optimize('.block{top:2rem;top:calc(1vm + 1px)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'top', [[1, 7, undefined]]],
            ['property-value', '2rem', [[1, 11, undefined]]]
          ],
          [
            'property',
            ['property-name', 'top', [[1, 16, undefined]]],
            ['property-value', 'calc(1vm + 1px)', [[1, 20, undefined]]]
          ]
        ]);
      }
    },
    'text-align': {
      'topic': function () {
        return _optimize('.block{text-align:center;text-align:justify}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'text-align', [[1, 25, undefined]]],
            ['property-value', 'justify', [[1, 36, undefined]]]
          ]
        ]);
      }
    },
    'text-align - non overriddable': {
      'topic': function () {
        return _optimize('.block{text-align:center;text-align:start}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'text-align', [[1, 7, undefined]]],
            ['property-value', 'center', [[1, 18, undefined]]]
          ],
          [
            'property',
            ['property-name', 'text-align', [[1, 25, undefined]]],
            ['property-value', 'start', [[1, 36, undefined]]]
          ]
        ]);
      }
    },
    'text-decoration': {
      'topic': function () {
        return _optimize('.block{text-decoration:none;text-decoration:underline}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'text-decoration', [[1, 28, undefined]]],
            ['property-value', 'underline', [[1, 44, undefined]]]
          ]
        ]);
      }
    },
    'text-decoration - non overriddable': {
      'topic': function () {
        return _optimize('.block{text-decoration:none;text-decoration:blink}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'text-decoration', [[1, 7, undefined]]],
            ['property-value', 'none', [[1, 23, undefined]]]
          ],
          [
            'property',
            ['property-name', 'text-decoration', [[1, 28, undefined]]],
            ['property-value', 'blink', [[1, 44, undefined]]]
          ]
        ]);
      }
    },
    'text-overflow': {
      'topic': function () {
        return _optimize('.block{text-overflow:clip;text-overflow:ellipsis}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'text-overflow', [[1, 26, undefined]]],
            ['property-value', 'ellipsis', [[1, 40, undefined]]]
          ]
        ]);
      }
    },
    'text-overflow - non overriddable': {
      'topic': function () {
        return _optimize('.block{text-overflow:clip;text-overflow:"..."}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'text-overflow', [[1, 7, undefined]]],
            ['property-value', 'clip', [[1, 21, undefined]]]
          ],
          [
            'property',
            ['property-name', 'text-overflow', [[1, 26, undefined]]],
            ['property-value', '"..."', [[1, 40, undefined]]]
          ]
        ]);
      }
    },
    'vertical-align': {
      'topic': function () {
        return _optimize('.block{vertical-align:sub;vertical-align:middle}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'vertical-align', [[1, 26, undefined]]],
            ['property-value', 'middle', [[1, 41, undefined]]]
          ]
        ]);
      }
    },
    'vertical-align - non overriddable': {
      'topic': function () {
        return _optimize('.block{vertical-align:sub;vertical-align:-webkit-funky-align}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'vertical-align', [[1, 7, undefined]]],
            ['property-value', 'sub', [[1, 22, undefined]]]
          ],
          [
            'property',
            ['property-name', 'vertical-align', [[1, 26, undefined]]],
            ['property-value', '-webkit-funky-align', [[1, 41, undefined]]]
          ]
        ]);
      }
    },
    'visibility': {
      'topic': function () {
        return _optimize('.block{visibility:collapse;visibility:visible}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'visibility', [[1, 27, undefined]]],
            ['property-value', 'visible', [[1, 38, undefined]]]
          ]
        ]);
      }
    },
    'visibility - non overriddable': {
      'topic': function () {
        return _optimize('.block{visibility:collapse;visibility:var(--visibility)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'visibility', [[1, 7, undefined]]],
            ['property-value', 'collapse', [[1, 18, undefined]]]
          ],
          [
            'property',
            ['property-name', 'visibility', [[1, 27, undefined]]],
            ['property-value', 'var(--visibility)', [[1, 38, undefined]]]
          ]
        ]);
      }
    },
    'white-space': {
      'topic': function () {
        return _optimize('.block{white-space:normal;white-space:nowrap}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'white-space', [[1, 26, undefined]]],
            ['property-value', 'nowrap', [[1, 38, undefined]]]
          ]
        ]);
      }
    },
    'white-space - non overriddable': {
      'topic': function () {
        return _optimize('.block{white-space:normal;white-space:var(--white-space)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'white-space', [[1, 7, undefined]]],
            ['property-value', 'normal', [[1, 19, undefined]]]
          ],
          [
            'property',
            ['property-name', 'white-space', [[1, 26, undefined]]],
            ['property-value', 'var(--white-space)', [[1, 38, undefined]]]
          ]
        ]);
      }
    },
    'z-index': {
      'topic': function () {
        return _optimize('.block{z-index:auto;z-index:-1}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'z-index', [[1, 20, undefined]]],
            ['property-value', '-1', [[1, 28, undefined]]]
          ]
        ]);
      }
    },
    'z-index - non overriddable': {
      'topic': function () {
        return _optimize('.block{z-index:auto;z-index:"15"}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'z-index', [[1, 7, undefined]]],
            ['property-value', 'auto', [[1, 15, undefined]]]
          ],
          [
            'property',
            ['property-name', 'z-index', [[1, 20, undefined]]],
            ['property-value', '"15"', [[1, 28, undefined]]]
          ]
        ]);
      }
    }
  })
  .addBatch({
    'transition shorthand and longhand': {
      'topic': function () {
        return _optimize('.block{transition:1s ease-in;transition-property:opacity}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'transition', [[1, 7, undefined]]],
            ['property-value', 'opacity', [[1, 49, undefined]]],
            ['property-value', '1s', [[1, 18, undefined]]],
            ['property-value', 'ease-in', [[1, 21, undefined]]]
          ]
        ]);
      }
    },
    'transition longhand and shorthand': {
      'topic': function () {
        return _optimize('.block{transition-duration:2s;transition:ease-in}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'transition', [[1, 30, undefined]]],
            ['property-value', 'ease-in', [[1, 41, undefined]]],
          ]
        ]);
      }
    },
    'transition shorthand with overriddable shorthand': {
      'topic': function () {
        return _optimize('.block{transition:opacity 1s;transition:margin 1s ease-in}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'transition', [[1, 7, undefined]]],
            ['property-value', 'margin', [[1, 40, undefined]]],
            ['property-value', '1s', [[1, 47, undefined]]],
            ['property-value', 'ease-in', [[1, 50, undefined]]]
          ]
        ]);
      }
    },
    'transition shorthand and multiplex longhand': {
      'topic': function () {
        return _optimize('.block{transition:margin 1s;transition-timing-function:ease-in,ease-out}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'transition', [[1, 7, undefined]]],
            ['property-value', 'margin', [[1, 18, undefined]]],
            ['property-value', '1s', [[1, 25, undefined]]],
            ['property-value', 'ease-in', [[1, 55, undefined]]],
            ['property-value', ','],
            ['property-value', '_'],
            ['property-value', '1s', [[1, 25, undefined]]],
            ['property-value', 'ease-out', [[1, 63, undefined]]]
          ]
        ]);
      }
    },
    'transition multiplex shorthand and longhand': {
      'topic': function () {
        return _optimize('.block{transition:ease-in,ease-out;transition-duration:1s}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'transition', [[1, 7, undefined]]],
            ['property-value', '1s', [[1, 55, undefined]]],
            ['property-value', 'ease-in', [[1, 18, undefined]]],
            ['property-value', ','],
            ['property-value', '1s', [[1, 55, undefined]]],
            ['property-value', 'ease-out', [[1, 26, undefined]]]
          ]
        ]);
      }
    },
    'transition shorthand and multiplex longhand - too long to merge': {
      'topic': function () {
        return _optimize('.block{transition:2s ease-in 1s;transition-property:margin,opacity,padding}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'transition', [[1, 7, undefined]]],
            ['property-value', '2s', [[1, 18, undefined]]],
            ['property-value', 'ease-in', [[1, 21, undefined]]],
            ['property-value', '1s', [[1, 29, undefined]]]
          ],
          [
            'property',
            ['property-name', 'transition-property', [[1, 32, undefined]]],
            ['property-value', 'margin', [[1, 52, undefined]]],
            ['property-value', ',', [[1, 58, undefined]]],
            ['property-value', 'opacity', [[1, 59, undefined]]],
            ['property-value', ',', [[1, 66, undefined]]],
            ['property-value', 'padding', [[1, 67, undefined]]]
          ]
        ]);
      }
    },
    'transition shorthand and inherit longhand': {
      'topic': function () {
        return _optimize('.block{transition:1s;transition-timing-function:inherit}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'transition', [[1, 7, undefined]]],
            ['property-value', '1s', [[1, 18, undefined]]],
          ],
          [
            'property',
            ['property-name', 'transition-timing-function', [[1, 21, undefined]]],
            ['property-value', 'inherit', [[1, 48, undefined]]]
          ]
        ]);
      }
    },
    'vendor prefixed transition shorthand and longhand': {
      'topic': function () {
        return _optimize('.block{-webkit-transition:1s;-webkit-transition-timing-function:ease-in}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', '-webkit-transition', [[1, 7, undefined]]],
            ['property-value', '1s', [[1, 26, undefined]]],
            ['property-value', 'ease-in', [[1, 64, undefined]]]
          ]
        ]);
      }
    }
  })
  .addBatch({
    'overriding !important by a star hack': {
      'topic': function () {
        return _optimize('a{color:red!important;display:block;*color:#fff}');
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
          ]
        ]);
      }
    },
    'overriding !important by an !important star hack': {
      'topic': function () {
        return _optimize('a{color:red!important;display:block;*color:#fff!important}');
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
            ['property-name', '*color', [[1, 36, undefined]]],
            ['property-value', '#fff!important', [[1, 43, undefined]]]
          ]
        ]);
      }
    },
    'overriding !important by an underscore hack': {
      'topic': function () {
        return _optimize('a{color:red!important;display:block;_color:#fff}');
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
          ]
        ]);
      }
    },
    'overriding !important by an !important underscore hack': {
      'topic': function () {
        return _optimize('a{color:red!important;display:block;_color:#fff!important}');
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
            ['property-name', '_color', [[1, 36, undefined]]],
            ['property-value', '#fff!important', [[1, 43, undefined]]]
          ]
        ]);
      }
    },
    'overriding !important by an backslash hack': {
      'topic': function () {
        return _optimize('a{color:red!important;display:block;color:#fff\\0}');
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
          ]
        ]);
      }
    }
  })
  .addBatch({
    'one unit value': {
      'topic': function () {
        return _optimize('a{width:3px;width:4px}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'width', [[1, 12, undefined]]],
            ['property-value', '4px', [[1, 18, undefined]]]
          ]
        ]);
      }
    },
    'incompatible unit values': {
      'topic': function () {
        return _optimize('a{width:4px;width:calc(5rem / 2)}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'width', [[1, 2, undefined]]],
            ['property-value', '4px', [[1, 8, undefined]]]
          ],
          [
            'property',
            ['property-name', 'width', [[1, 12, undefined]]],
            ['property-value', 'calc(5rem / 2)', [[1, 18, undefined]]]
          ]
        ]);
      }
    }
  })
  .export(module);
