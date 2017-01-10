var assert = require('assert');
var vows = require('vows');

var optimize = require('../../../../lib/optimizer/level-2/compacting/optimize');

var tokenize = require('../../../../lib/tokenizer/tokenize');
var inputSourceMapTracker = require('../../../../lib/reader/input-source-map-tracker');
var compatibility = require('../../../../lib/utils/compatibility');
var Validator = require('../../../../lib/optimizer/level-2/compacting/validator');

function _optimize(source, compat, aggressiveMerging) {
  var tokens = tokenize(source, {
    inputSourceMapTracker: inputSourceMapTracker(),
    options: {},
    warnings: []
  });
  compat = compatibility(compat);

  var validator = new Validator(compat);
  var options = {
    aggressiveMerging: undefined === aggressiveMerging ? true : aggressiveMerging,
    compatibility: compat,
    level: {
      2: {
        compactShorthands: true
      }
    }
  };
  optimize(tokens[0][1], tokens[0][2], false, true, { options: options, validator: validator });

  return tokens[0][2];
}

vows.describe(optimize)
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
    'with aggressive off': {
      'topic': function () {
        return _optimize('a{background:white;color:red;background:red}', undefined, false);
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'red', [[1, 40, undefined]]]
          ],
          [
            'property',
            ['property-name', 'color', [[1, 19, undefined]]],
            ['property-value', 'red', [[1, 25, undefined]]]
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
    'shorthand multiplex then longhand': {
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
            ['property-value', 'left', [[1, 17, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-repeat', [[1, 22, undefined]]],
            ['property-value', 'no-repeat', [[1, 40, undefined]]],
            ['property-value', ',', [[1, 49, undefined]]],
            ['property-value', 'no-repeat', [[1, 50, undefined]]]
          ]
        ]);
      }
    },
    'too long into multiplex #1': {
      'topic': function () {
        return _optimize('p{background:url(/long/image/path.png);background-repeat:no-repeat,no-repeat}');
      },
      'into': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background', [[1, 2, undefined]]],
            ['property-value', 'url(/long/image/path.png)', [[1, 13, undefined]]]
          ],
          [
            'property',
            ['property-name', 'background-repeat', [[1, 39, undefined]]],
            ['property-value', 'no-repeat', [[1, 57, undefined]]],
            ['property-value', ',', [[1, 66, undefined]]],
            ['property-value', 'no-repeat', [[1, 67, undefined]]]
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
          ],
          [
            'property',
            ['property-name', '*color', [[1, 36, undefined]]],
            ['property-value', '#fff', [[1, 43, undefined]]]
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
          ],
          [
            'property',
            ['property-name', '_color', [[1, 36, undefined]]],
            ['property-value', '#fff', [[1, 43, undefined]]]
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
