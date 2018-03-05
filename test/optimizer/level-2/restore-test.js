var vows = require('vows');
var assert = require('assert');

var wrapForOptimizing = require('../../../lib/optimizer/wrap-for-optimizing').single;
var compactable = require('../../../lib/optimizer/level-2/compactable');
var compatibilityFrom = require('../../../lib/options/compatibility');
var validator = require('../../../lib/optimizer/validator');

var restore = require('../../../lib/optimizer/level-2/restore');

function _breakUp(property) {
  var descriptor = compactable[property[1][1]];
  var _property = wrapForOptimizing(property);
  _property.components = descriptor.breakUp(_property, compactable, validator(compatibilityFrom()));
  _property.multiplex = _property.components[0].multiplex;
  return _property;
}

function _restore(_property) {
  var descriptor = compactable[_property.name];
  return descriptor.restore(_property, compactable);
}

vows.describe(restore)
  .addBatch({
    'background': {
      'background with some values': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'background'],
              ['property-value', 'url(image.png)'],
              ['property-value', 'no-repeat'],
              ['property-value', 'padding-box']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'url(image.png)'],
            ['property-value', 'no-repeat'],
            ['property-value', 'padding-box']
          ]);
        }
      },
      'background with some default values': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'background'],
              ['property-value', 'url(image.png)'],
              ['property-value', 'repeat'],
              ['property-value', 'padding-box'],
              ['property-value', 'border-box']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'url(image.png)']
          ]);
        }
      },
      'background with all default values': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'background'],
              ['property-value', 'transparent'],
              ['property-value', 'none'],
              ['property-value', 'repeat'],
              ['property-value', 'scroll'],
              ['property-value', '0'],
              ['property-value', '0'],
              ['property-value', 'padding-box'],
              ['property-value', 'border-box']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '0 0']
          ]);
        }
      },
      'background with some double values': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'background'],
              ['property-value', 'url(image.png)'],
              ['property-value', 'repeat'],
              ['property-value', 'no-repeat'],
              ['property-value', '2px'],
              ['property-value', '3px'],
              ['property-value', '/'],
              ['property-value', 'auto'],
              ['property-value', 'padding-box']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'url(image.png)'],
            ['property-value', '2px'],
            ['property-value', '3px'],
            ['property-value', 'repeat'],
            ['property-value', 'no-repeat'],
            ['property-value', 'padding-box']
          ]);
        }
      },
      'background with default background origin and background clip': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'background'],
              ['property-value', 'url(image.png)'],
              ['property-value', 'padding-box'],
              ['property-value', 'border-box']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'url(image.png)']
          ]);
        }
      },
      'background with same background origin and background clip': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'background'],
              ['property-value', 'url(image.png)'],
              ['property-value', 'padding-box'],
              ['property-value', 'padding-box']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'url(image.png)'],
            ['property-value', 'padding-box']
          ]);
        }
      },
      'background with default background position and background size': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'background'],
              ['property-value', 'url(image.png)'],
              ['property-value', '0'],
              ['property-value', '0'],
              ['property-value', '/'],
              ['property-value', '50%'],
              ['property-value', '25%']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'url(image.png)'],
            ['property-value', '0'],
            ['property-value', '0'],
            ['property-value', '/'],
            ['property-value', '50%'],
            ['property-value', '25%']
          ]);
        }
      },
      'background with default background position and single background size': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'background'],
              ['property-value', 'url(image.png)'],
              ['property-value', '0'],
              ['property-value', '0'],
              ['property-value', '/'],
              ['property-value', '50%']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'url(image.png)'],
            ['property-value', '0'],
            ['property-value', '0'],
            ['property-value', '/'],
            ['property-value', '50%']
          ]);
        }
      },
      'background with default background position and background size differing by 2nd value': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'background'],
              ['property-value', 'url(image.png)'],
              ['property-value', '0'],
              ['property-value', '50px'],
              ['property-value', '/'],
              ['property-value', '0'],
              ['property-value', '30px']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'url(image.png)'],
            ['property-value', '0'],
            ['property-value', '50px'],
            ['property-value', '/'],
            ['property-value', '0'],
            ['property-value', '30px']
          ]);
        }
      },
      'background 0 to background 0': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'background'],
              ['property-value', '0']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '0']
          ]);
        }
      },
      'background color in multiplex': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'background'],
              ['property-value', 'url(image.png)'],
              ['property-value', 'blue'],
              ['property-value', ','],
              ['property-value', 'url(image.jpg)'],
              ['property-value', 'red']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'url(image.png)'],
            ['property-value', ','],
            ['property-value', 'url(image.jpg)'],
            ['property-value', 'red']
          ]);
        }
      }
    },
    'border radius': {
      '4 values': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'border-radius'],
              ['property-value', '0px'],
              ['property-value', '1px'],
              ['property-value', '2px'],
              ['property-value', '3px']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '0px'],
            ['property-value', '1px'],
            ['property-value', '2px'],
            ['property-value', '3px']
          ]);
        }
      },
      '3 values': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'border-radius'],
              ['property-value', '0px'],
              ['property-value', '1px'],
              ['property-value', '2px'],
              ['property-value', '1px']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '0px'],
            ['property-value', '1px'],
            ['property-value', '2px']
          ]);
        }
      },
      '2 values': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'border-radius'],
              ['property-value', '0px'],
              ['property-value', '1px'],
              ['property-value', '0px'],
              ['property-value', '1px']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '0px'],
            ['property-value', '1px']
          ]);
        }
      },
      '1 value': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'border-radius'],
              ['property-value', '0px'],
              ['property-value', '0px'],
              ['property-value', '0px'],
              ['property-value', '0px']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '0px']
          ]);
        }
      },
      'horizontal + vertical - different values': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'border-radius'],
              ['property-value', '0px'],
              ['property-value', '1px'],
              ['property-value', '2px'],
              ['property-value', '3px'],
              ['property-value', '/'],
              ['property-value', '2px'],
              ['property-value', '1px'],
              ['property-value', '2px'],
              ['property-value', '1px']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '0px'],
            ['property-value', '1px'],
            ['property-value', '2px'],
            ['property-value', '3px'],
            ['property-value', '/'],
            ['property-value', '2px'],
            ['property-value', '1px']
          ]);
        }
      },
      'horizontal + vertical - same values': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'border-radius'],
              ['property-value', '0px'],
              ['property-value', '1px'],
              ['property-value', '2px'],
              ['property-value', '3px'],
              ['property-value', '/'],
              ['property-value', '0px'],
              ['property-value', '1px'],
              ['property-value', '2px'],
              ['property-value', '3px']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '0px'],
            ['property-value', '1px'],
            ['property-value', '2px'],
            ['property-value', '3px']
          ]);
        }
      },
      'horizontal + vertical - asymetrical': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'border-radius'],
              ['property-value', '0px'],
              ['property-value', '1px'],
              ['property-value', '2px'],
              ['property-value', '3px'],
              ['property-value', '/'],
              ['property-value', '0px'],
              ['property-value', '1px']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '0px'],
            ['property-value', '1px'],
            ['property-value', '2px'],
            ['property-value', '3px'],
            ['property-value', '/'],
            ['property-value', '0px'],
            ['property-value', '1px']
          ]);
        }
      },
      'inherit': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'border-radius'],
              ['property-value', 'inherit']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'inherit']
          ]);
        }
      }
    },
    'four values': {
      '4 different': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'padding'],
              ['property-value', '0px'],
              ['property-value', '1px'],
              ['property-value', '2px'],
              ['property-value', '3px']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '0px'],
            ['property-value', '1px'],
            ['property-value', '2px'],
            ['property-value', '3px']
          ]);
        }
      },
      '3 different': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'padding'],
              ['property-value', '0px'],
              ['property-value', '1px'],
              ['property-value', '2px'],
              ['property-value', '1px']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '0px'],
            ['property-value', '1px'],
            ['property-value', '2px']
          ]);
        }
      },
      '2 different': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'padding'],
              ['property-value', '0px'],
              ['property-value', '1px'],
              ['property-value', '0px'],
              ['property-value', '1px']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '0px'],
            ['property-value', '1px']
          ]);
        }
      },
      'all same': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'padding'],
              ['property-value', '0px'],
              ['property-value', '0px'],
              ['property-value', '0px'],
              ['property-value', '0px']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '0px']
          ]);
        }
      },
      'inherit': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'padding'],
              ['property-value', 'inherit']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'inherit']
          ]);
        }
      }
    },
    'repeated values': {
      'background with some values': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'background'],
              ['property-value', 'url(image.png)'],
              ['property-value', 'no-repeat'],
              ['property-value', 'padding-box'],
              ['property-value', ','],
              ['property-value', 'repeat'],
              ['property-value', 'red']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'url(image.png)'],
            ['property-value', 'no-repeat'],
            ['property-value', 'padding-box'],
            ['property-value', ','],
            ['property-value', 'red']
          ]);
        }
      },
      'background with background origin and size': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'background'],
              ['property-value', 'no-repeat'],
              ['property-value', 'padding-box'],
              ['property-value', ','],
              ['property-value', 'repeat'],
              ['property-value', '10px'],
              ['property-value', '10px'],
              ['property-value', '/'],
              ['property-value', 'auto'],
              ['property-value', 'red'],
              ['property-value', ','],
              ['property-value', 'top'],
              ['property-value', 'left'],
              ['property-value', '/'],
              ['property-value', '30%']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'no-repeat'],
            ['property-value', 'padding-box'],
            ['property-value', ','],
            ['property-value', '10px'],
            ['property-value', '10px'],
            ['property-value', ','],
            ['property-value', 'top'],
            ['property-value', 'left'],
            ['property-value', '/'],
            ['property-value', '30%']
          ]);
        }
      }
    },
    'without defaults': {
      'border with some values': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'border'],
              ['property-value', 'solid']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'solid']
          ]);
        }
      },
      'border with all values': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'border'],
              ['property-value', '1px'],
              ['property-value', 'solid'],
              ['property-value', 'red']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '1px'],
            ['property-value', 'solid'],
            ['property-value', 'red']
          ]);
        }
      },
      'border with all defaults': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'border'],
              ['property-value', 'medium'],
              ['property-value', 'none'],
              ['property-value', 'none']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'none']
          ]);
        }
      },
      'border with inherit': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'border'],
              ['property-value', 'inherit']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'inherit']
          ]);
        }
      },
      'font with all non-default values': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'font'],
              ['property-value', 'italic'],
              ['property-value', 'small-caps'],
              ['property-value', 'bold'],
              ['property-value', 'ultra-condensed'],
              ['property-value', '12px'],
              ['property-value', '/'],
              ['property-value', '16px'],
              ['property-value', 'sans-serif']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'italic'],
            ['property-value', 'small-caps'],
            ['property-value', 'bold'],
            ['property-value', 'ultra-condensed'],
            ['property-value', '12px'],
            ['property-value', '/'],
            ['property-value', '16px'],
            ['property-value', 'sans-serif']
          ]);
        }
      },
      'font with some default values': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'font'],
              ['property-value', 'normal'],
              ['property-value', 'small-caps'],
              ['property-value', 'normal'],
              ['property-value', 'ultra-condensed'],
              ['property-value', '12px'],
              ['property-value', '/'],
              ['property-value', '16px'],
              ['property-value', 'sans-serif']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'small-caps'],
            ['property-value', 'ultra-condensed'],
            ['property-value', '12px'],
            ['property-value', '/'],
            ['property-value', '16px'],
            ['property-value', 'sans-serif']
          ]);
        }
      },
      'font without line height': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'font'],
              ['property-value', '12px'],
              ['property-value', 'sans-serif']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '12px'],
            ['property-value', 'sans-serif']
          ]);
        }
      },
      'font with multiple font family values': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'font'],
              ['property-value', '12px'],
              ['property-value', '"Helvetica Neue"'],
              ['property-value', ','],
              ['property-value', 'Helvetica'],
              ['property-value', ','],
              ['property-value', 'sans-serif']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '12px'],
            ['property-value', '"Helvetica Neue"'],
            ['property-value', ','],
            ['property-value', 'Helvetica'],
            ['property-value', ','],
            ['property-value', 'sans-serif']
          ]);
        }
      },
      'font with inherit': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'font'],
              ['property-value', 'inherit']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'inherit']
          ]);
        }
      },
      'system font with standard value': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'font'],
              ['property-value', 'icon']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'icon']
          ]);
        }
      },
      'system font with vendor-prefixed value': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'font'],
              ['property-value', '-moz-status']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '-moz-status']
          ]);
        }
      },
      'list with some values': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'list-style'],
              ['property-value', 'circle']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'circle']
          ]);
        }
      },
      'list with all values': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'list-style'],
              ['property-value', 'circle'],
              ['property-value', 'inside'],
              ['property-value', 'url(image.png)']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'circle'],
            ['property-value', 'inside'],
            ['property-value', 'url(image.png)']
          ]);
        }
      },
      'list with some defaults': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'list-style'],
              ['property-value', 'circle'],
              ['property-value', 'outside'],
              ['property-value', 'url(image.png)']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'circle'],
            ['property-value', 'url(image.png)']
          ]);
        }
      },
      'list with inherit': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'list-style'],
              ['property-value', 'inherit']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'inherit']
          ]);
        }
      },
      'outline with some values': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'outline'],
              ['property-value', 'dotted']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'dotted']
          ]);
        }
      },
      'outline with all values': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'outline'],
              ['property-value', '#fff'],
              ['property-value', 'dotted'],
              ['property-value', '1px']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '#fff'],
            ['property-value', 'dotted'],
            ['property-value', '1px']
          ]);
        }
      },
      'outline with all defaults': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'outline'],
              ['property-value', 'invert'],
              ['property-value', 'none'],
              ['property-value', 'medium']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '0']
          ]);
        }
      },
      'outline with inherit': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'outline'],
              ['property-value', 'inherit']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'inherit']
          ]);
        }
      }
    },
    'animation': {
      'with two time units where both are default': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'animation'],
              ['property-value', '0s'],
              ['property-value', 'ease-out'],
              ['property-value', '0s'],
              ['property-value', 'forwards'],
              ['property-value', 'test-name']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', 'ease-out'],
            ['property-value', 'forwards'],
            ['property-value', 'test-name']
          ]);
        }
      },
      'with two time units where first is default': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', 'animation'],
              ['property-value', '0s'],
              ['property-value', 'ease-out'],
              ['property-value', '5s'],
              ['property-value', 'forwards'],
              ['property-value', 'test-name']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '0s'],
            ['property-value', 'ease-out'],
            ['property-value', '5s'],
            ['property-value', 'forwards'],
            ['property-value', 'test-name']
          ]);
        }
      },
      'with two vendor-prefixed time units where first is default': {
        'topic': function () {
          return _restore(
            _breakUp([
              'property',
              ['property-name', '-webkit-animation'],
              ['property-value', '0s'],
              ['property-value', 'ease-out'],
              ['property-value', '5s'],
              ['property-value', 'forwards'],
              ['property-value', 'test-name']
            ])
          );
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [
            ['property-value', '0s'],
            ['property-value', 'ease-out'],
            ['property-value', '5s'],
            ['property-value', 'forwards'],
            ['property-value', 'test-name']
          ]);
        }
      }
    }
  })
  .export(module);
