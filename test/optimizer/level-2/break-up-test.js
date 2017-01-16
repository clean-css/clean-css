var assert = require('assert');
var vows = require('vows');

var wrapForOptimizing = require('../../../lib/optimizer/wrap-for-optimizing').all;
var populateComponents = require('../../../lib/optimizer/level-2/properties/populate-components');
var validator = require('../../../lib/optimizer/validator');
var compatibility = require('../../../lib/utils/compatibility');

var breakUp = require('../../../lib/optimizer/level-2/break-up');

function _breakUp(properties) {
  var wrapped = wrapForOptimizing(properties);
  populateComponents(wrapped, validator(compatibility()), []);

  return wrapped[0].components;
}

vows.describe(breakUp)
  .addBatch({
    'background': {
      'inherit': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'background'],
              ['property-value', 'inherit']
            ]
          ]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has background-image': function (components) {
          assert.deepEqual(components[0].name, 'background-image');
          assert.deepEqual(components[0].value, [['property-value', 'inherit']]);
        },
        'has background-position': function (components) {
          assert.deepEqual(components[1].name, 'background-position');
          assert.deepEqual(components[1].value, [['property-value', 'inherit']]);
        },
        'has background-size': function (components) {
          assert.deepEqual(components[2].name, 'background-size');
          assert.deepEqual(components[2].value, [['property-value', 'inherit']]);
        },
        'has background-repeat': function (components) {
          assert.deepEqual(components[3].name, 'background-repeat');
          assert.deepEqual(components[3].value, [['property-value', 'inherit']]);
        },
        'has background-attachment': function (components) {
          assert.deepEqual(components[4].name, 'background-attachment');
          assert.deepEqual(components[4].value, [['property-value', 'scroll']]);
        },
        'has background-origin': function (components) {
          assert.deepEqual(components[5].name, 'background-origin');
          assert.deepEqual(components[5].value, [['property-value', 'inherit']]);
        },
        'has background-clip': function (components) {
          assert.deepEqual(components[6].name, 'background-clip');
          assert.deepEqual(components[6].value, [['property-value', 'inherit']]);
        },
        'has background-color': function (components) {
          assert.deepEqual(components[7].name, 'background-color');
          assert.deepEqual(components[7].value, [['property-value', 'inherit']]);
        }
      },
      'all': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'background'],
              ['property-value', 'url(image.png)'],
              ['property-value', 'repeat'],
              ['property-value', 'no-repeat'],
              ['property-value', '2px'],
              ['property-value', '3px'],
              ['property-value', '/'],
              ['property-value', '50%'],
              ['property-value', '60%'],
              ['property-value', 'fixed'],
              ['property-value', 'padding-box'],
              ['property-value', 'border-box'],
              ['property-value', 'red']
            ]
          ]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has background-image': function (components) {
          assert.deepEqual(components[0].name, 'background-image');
          assert.deepEqual(components[0].value, [['property-value', 'url(image.png)']]);
        },
        'has background-position': function (components) {
          assert.deepEqual(components[1].name, 'background-position');
          assert.deepEqual(components[1].value, [['property-value', '2px'], ['property-value', '3px']]);
        },
        'has background-size': function (components) {
          assert.deepEqual(components[2].name, 'background-size');
          assert.deepEqual(components[2].value, [['property-value', '50%'], ['property-value', '60%']]);
        },
        'has background-repeat': function (components) {
          assert.deepEqual(components[3].name, 'background-repeat');
          assert.deepEqual(components[3].value, [['property-value', 'repeat'], ['property-value', 'no-repeat']]);
        },
        'has background-attachment': function (components) {
          assert.deepEqual(components[4].name, 'background-attachment');
          assert.deepEqual(components[4].value, [['property-value', 'fixed']]);
        },
        'has background-origin': function (components) {
          assert.deepEqual(components[5].name, 'background-origin');
          assert.deepEqual(components[5].value, [['property-value', 'padding-box']]);
        },
        'has background-clip': function (components) {
          assert.deepEqual(components[6].name, 'background-clip');
          assert.deepEqual(components[6].value, [['property-value', 'border-box']]);
        },
        'has background-color': function (components) {
          assert.deepEqual(components[7].name, 'background-color');
          assert.deepEqual(components[7].value, [['property-value', 'red']]);
        }
      },
      'no size': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'background'],
              ['property-value', 'bottom']
            ]
          ]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has background-position': function (components) {
          assert.deepEqual(components[1].name, 'background-position');
          assert.deepEqual(components[1].value, [['property-value', 'bottom']]);
        },
        'has background-size': function (components) {
          assert.deepEqual(components[2].name, 'background-size');
          assert.deepEqual(components[2].value, [['property-value', 'auto']]);
        }
      },
      'shorthand size & position': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'background'],
              ['property-value', '2px'],
              ['property-value', '/'],
              ['property-value', '50px']
            ]
          ]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has background-position': function (components) {
          assert.deepEqual(components[1].name, 'background-position');
          assert.deepEqual(components[1].value, [['property-value', '2px']]);
        },
        'has background-size': function (components) {
          assert.deepEqual(components[2].name, 'background-size');
          assert.deepEqual(components[2].value, [['property-value', '50px']]);
        }
      },
      'size & position joined together': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'background'],
              ['property-value', '2px'],
              ['property-value', '/'],
              ['property-value', '50px']
            ]
          ]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has background-position': function (components) {
          assert.deepEqual(components[1].name, 'background-position');
          assert.deepEqual(components[1].value, [['property-value', '2px']]);
        },
        'has background-size': function (components) {
          assert.deepEqual(components[2].name, 'background-size');
          assert.deepEqual(components[2].value, [['property-value', '50px']]);
        }
      },
      'size & position joined together with 4 values': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'background'],
              ['property-value', '5px'],
              ['property-value', '2px'],
              ['property-value', '/'],
              ['property-value', '50px'],
              ['property-value', '30px']
            ]
          ]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has background-position': function (components) {
          assert.deepEqual(components[1].name, 'background-position');
          assert.deepEqual(components[1].value, [['property-value', '5px'], ['property-value', '2px']]);
        },
        'has background-size': function (components) {
          assert.deepEqual(components[2].name, 'background-size');
          assert.deepEqual(components[2].value, [['property-value', '50px'], ['property-value', '30px']]);
        }
      },
      'clip to origin': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'background'],
              ['property-value', 'padding-box']
            ]
          ]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has background-origin': function (components) {
          assert.deepEqual(components[5].name, 'background-origin');
          assert.deepEqual(components[5].value, [['property-value', 'padding-box']]);
        },
        'has background-clip': function (components) {
          assert.deepEqual(components[6].name, 'background-clip');
          assert.deepEqual(components[6].value, [['property-value', 'padding-box']]);
        }
      }
    },
    'border': {
      'inherit': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'border'],
              ['property-value', 'inherit']
            ]
          ]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has border-width': function (components) {
          assert.deepEqual(components[0].name, 'border-width');
          assert.deepEqual(components[0].value, [
            ['property-value', 'inherit'],
            ['property-value', 'inherit'],
            ['property-value', 'inherit'],
            ['property-value', 'inherit']
          ]);
        },
        'has border-style': function (components) {
          assert.deepEqual(components[1].name, 'border-style');
          assert.deepEqual(components[1].value, [
            ['property-value', 'inherit'],
            ['property-value', 'inherit'],
            ['property-value', 'inherit'],
            ['property-value', 'inherit']
          ]);
        },
        'has border-color': function (components) {
          assert.deepEqual(components[2].name, 'border-color');
          assert.deepEqual(components[2].value, [
            ['property-value', 'inherit'],
            ['property-value', 'inherit'],
            ['property-value', 'inherit'],
            ['property-value', 'inherit']
          ]);
        }
      },
      '3 inherits': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'border'],
              ['property-value', 'inherit'],
              ['property-value', 'inherit'],
              ['property-value', 'inherit']
            ]
          ]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has border-width': function (components) {
          assert.deepEqual(components[0].name, 'border-width');
          assert.deepEqual(components[0].value, [
            ['property-value', 'inherit'],
            ['property-value', 'inherit'],
            ['property-value', 'inherit'],
            ['property-value', 'inherit']
          ]);
        },
        'has border-style': function (components) {
          assert.deepEqual(components[1].name, 'border-style');
          assert.deepEqual(components[1].value, [
            ['property-value', 'inherit'],
            ['property-value', 'inherit'],
            ['property-value', 'inherit'],
            ['property-value', 'inherit']
          ]);
        },
        'has border-color': function (components) {
          assert.deepEqual(components[2].name, 'border-color');
          assert.deepEqual(components[2].value, [
            ['property-value', 'inherit'],
            ['property-value', 'inherit'],
            ['property-value', 'inherit'],
            ['property-value', 'inherit']
          ]);
        }
      },
      'all values in correct order': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'border'],
              ['property-value', '1px'],
              ['property-value', 'solid'],
              ['property-value', 'red']
            ]
          ]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has border-width': function (components) {
          assert.deepEqual(components[0].name, 'border-width');
          assert.deepEqual(components[0].value, [
            ['property-value', '1px'],
            ['property-value', '1px'],
            ['property-value', '1px'],
            ['property-value', '1px']
          ]);
        },
        'has border-style': function (components) {
          assert.deepEqual(components[1].name, 'border-style');
          assert.deepEqual(components[1].value, [
            ['property-value', 'solid'],
            ['property-value', 'solid'],
            ['property-value', 'solid'],
            ['property-value', 'solid']
          ]);
        },
        'has border-color': function (components) {
          assert.deepEqual(components[2].name, 'border-color');
          assert.deepEqual(components[2].value, [
            ['property-value', 'red'],
            ['property-value', 'red'],
            ['property-value', 'red'],
            ['property-value', 'red']
          ]);
        }
      },
      'all values in wrong order': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'border'],
              ['property-value', 'red'],
              ['property-value', 'solid'],
              ['property-value', '1px']
            ]
          ]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has border-width': function (components) {
          assert.deepEqual(components[0].name, 'border-width');
          assert.deepEqual(components[0].value, [
            ['property-value', '1px'],
            ['property-value', '1px'],
            ['property-value', '1px'],
            ['property-value', '1px']
          ]);
        },
        'has border-style': function (components) {
          assert.deepEqual(components[1].name, 'border-style');
          assert.deepEqual(components[1].value, [
            ['property-value', 'solid'],
            ['property-value', 'solid'],
            ['property-value', 'solid'],
            ['property-value', 'solid']
          ]);
        },
        'has border-color': function (components) {
          assert.deepEqual(components[2].name, 'border-color');
          assert.deepEqual(components[2].value, [
            ['property-value', 'red'],
            ['property-value', 'red'],
            ['property-value', 'red'],
            ['property-value', 'red']
          ]);
        }
      },
      'missing values': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'border'],
              ['property-value', 'red']
            ]
          ]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has border-width': function (components) {
          assert.deepEqual(components[0].name, 'border-width');
          assert.deepEqual(components[0].value, [
            ['property-value', 'medium'],
            ['property-value', 'medium'],
            ['property-value', 'medium'],
            ['property-value', 'medium']
          ]);
        },
        'has border-style': function (components) {
          assert.deepEqual(components[1].name, 'border-style');
          assert.deepEqual(components[1].value, [
            ['property-value', 'none'],
            ['property-value', 'none'],
            ['property-value', 'none'],
            ['property-value', 'none']
          ]);
        },
        'has border-color': function (components) {
          assert.deepEqual(components[2].name, 'border-color');
          assert.deepEqual(components[2].value, [
            ['property-value', 'red'],
            ['property-value', 'red'],
            ['property-value', 'red'],
            ['property-value', 'red']
          ]);
        }
      },
      'missing width': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'border'],
              ['property-value', 'solid'],
              ['property-value', 'rgba(0,0,0,0)']
            ]
          ]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has border-width': function (components) {
          assert.deepEqual(components[0].name, 'border-width');
          assert.deepEqual(components[0].value, [
            ['property-value', 'medium'],
            ['property-value', 'medium'],
            ['property-value', 'medium'],
            ['property-value', 'medium']
          ]);
        },
        'has border-style': function (components) {
          assert.deepEqual(components[1].name, 'border-style');
          assert.deepEqual(components[1].value, [
            ['property-value', 'solid'],
            ['property-value', 'solid'],
            ['property-value', 'solid'],
            ['property-value', 'solid']
          ]);
        },
        'has border-color': function (components) {
          assert.deepEqual(components[2].name, 'border-color');
          assert.deepEqual(components[2].value, [
            ['property-value', 'rgba(0,0,0,0)'],
            ['property-value', 'rgba(0,0,0,0)'],
            ['property-value', 'rgba(0,0,0,0)'],
            ['property-value', 'rgba(0,0,0,0)']
          ]);
        }
      }
    },
    'border radius': {
      'no horizontal vertical split': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'border-radius'],
              ['property-value', '0px'],
              ['property-value', '1px'],
              ['property-value', '2px'],
              ['property-value', '3px']
            ]
          ]);
        },
        'has 4 components': function (components) {
          assert.lengthOf(components, 4);
        },
        'has border-top-left-radius': function (components) {
          assert.equal(components[0].name, 'border-top-left-radius');
          assert.deepEqual(components[0].value, [['property-value', '0px'], ['property-value', '0px']]);
        },
        'has border-top-right-radius': function (components) {
          assert.equal(components[1].name, 'border-top-right-radius');
          assert.deepEqual(components[1].value, [['property-value', '1px'], ['property-value', '1px']]);
        },
        'has border-bottom-right-radius': function (components) {
          assert.equal(components[2].name, 'border-bottom-right-radius');
          assert.deepEqual(components[2].value, [['property-value', '2px'], ['property-value', '2px']]);
        },
        'has border-bottom-left': function (components) {
          assert.equal(components[3].name, 'border-bottom-left-radius');
          assert.deepEqual(components[3].value, [['property-value', '3px'], ['property-value', '3px']]);
        }
      },
      'horizontal vertical split': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'border-radius'],
              ['property-value', '0px'],
              ['property-value', '1px'],
              ['property-value', '2px'],
              ['property-value', '3px'],
              ['property-value', '/'],
              ['property-value', '1px'],
              ['property-value', '2px'],
              ['property-value', '3px'],
              ['property-value', '4px']
            ]
          ]);
        },
        'has 4 components': function (components) {
          assert.lengthOf(components, 4);
        },
        'has border-top-left-radius': function (components) {
          assert.equal(components[0].name, 'border-top-left-radius');
          assert.deepEqual(components[0].value, [['property-value', '0px'], ['property-value', '1px']]);
        },
        'has border-top-right-radius': function (components) {
          assert.equal(components[1].name, 'border-top-right-radius');
          assert.deepEqual(components[1].value, [['property-value', '1px'], ['property-value', '2px']]);
        },
        'has border-bottom-right-radius': function (components) {
          assert.equal(components[2].name, 'border-bottom-right-radius');
          assert.deepEqual(components[2].value, [['property-value', '2px'], ['property-value', '3px']]);
        },
        'has border-bottom-left': function (components) {
          assert.equal(components[3].name, 'border-bottom-left-radius');
          assert.deepEqual(components[3].value, [['property-value', '3px'], ['property-value', '4px']]);
        }
      },
      'vendor prefix asymmetrical horizontal vertical split': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', '-moz-border-radius'],
              ['property-value', '0px'],
              ['property-value', '1px'],
              ['property-value', '2px'],
              ['property-value', '/'],
              ['property-value', '1px'],
              ['property-value', '4px']
            ]
          ]);
        },
        'has 4 components': function (components) {
          assert.lengthOf(components, 4);
        },
        'has border-top-left-radius': function (components) {
          assert.equal(components[0].name, '-moz-border-top-left-radius');
          assert.deepEqual(components[0].value, [['property-value', '0px'], ['property-value', '1px']]);
        },
        'has border-top-right-radius': function (components) {
          assert.equal(components[1].name, '-moz-border-top-right-radius');
          assert.deepEqual(components[1].value, [['property-value', '1px'], ['property-value', '4px']]);
        },
        'has border-bottom-right-radius': function (components) {
          assert.equal(components[2].name, '-moz-border-bottom-right-radius');
          assert.deepEqual(components[2].value, [['property-value', '2px'], ['property-value', '1px']]);
        },
        'has border-bottom-left': function (components) {
          assert.equal(components[3].name, '-moz-border-bottom-left-radius');
          assert.deepEqual(components[3].value, [['property-value', '1px'], ['property-value', '4px']]);
        }
      },
      'with missing vertical value': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'border-radius'],
              ['property-value', '0px', [[1, 20, undefined]]],
              ['property-value', '/']
            ]
          ]);
        },
        'has no components': function (components) {
          assert.lengthOf(components, 0);
        }
      },
      'with missing horizontal value': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'border-radius'],
              ['property-value', '/', [[1, 20, undefined]]],
              ['property-value', '0px']
            ]
          ]);
        },
        'has no components': function (components) {
          assert.lengthOf(components, 0);
        }
      }
    },
    'four values': {
      'four given': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'margin'],
              ['property-value', '0px'],
              ['property-value', '1px'],
              ['property-value', '2px'],
              ['property-value', '3px']
            ]
          ]);
        },
        'has 4 components': function (components) {
          assert.lengthOf(components, 4);
        },
        'has margin-top': function (components) {
          assert.equal(components[0].name, 'margin-top');
          assert.deepEqual(components[0].value, [['property-value', '0px']]);
        },
        'has margin-right': function (components) {
          assert.equal(components[1].name, 'margin-right');
          assert.deepEqual(components[1].value, [['property-value', '1px']]);
        },
        'has margin-bottom': function (components) {
          assert.equal(components[2].name, 'margin-bottom');
          assert.deepEqual(components[2].value, [['property-value', '2px']]);
        },
        'has margin-left': function (components) {
          assert.equal(components[3].name, 'margin-left');
          assert.deepEqual(components[3].value, [['property-value', '3px']]);
        }
      },
      'three given': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'padding'],
              ['property-value', '0px'],
              ['property-value', '1px'],
              ['property-value', '2px']
            ]
          ]);
        },
        'has 4 components': function (components) {
          assert.lengthOf(components, 4);
        },
        'has padding-top': function (components) {
          assert.equal(components[0].name, 'padding-top');
          assert.deepEqual(components[0].value, [['property-value', '0px']]);
        },
        'has padding-right': function (components) {
          assert.equal(components[1].name, 'padding-right');
          assert.deepEqual(components[1].value, [['property-value', '1px']]);
        },
        'has padding-bottom': function (components) {
          assert.equal(components[2].name, 'padding-bottom');
          assert.deepEqual(components[2].value, [['property-value', '2px']]);
        },
        'has padding-left': function (components) {
          assert.equal(components[3].name, 'padding-left');
          assert.deepEqual(components[3].value, [['property-value', '1px']]);
        }
      },
      'two given': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'border-color'],
              ['property-value', 'red'],
              ['property-value', 'blue']
            ]
          ]);
        },
        'has 4 components': function (components) {
          assert.lengthOf(components, 4);
        },
        'has border-top-color': function (components) {
          assert.equal(components[0].name, 'border-top-color');
          assert.deepEqual(components[0].value, [['property-value', 'red']]);
        },
        'has border-right-color': function (components) {
          assert.equal(components[1].name, 'border-right-color');
          assert.deepEqual(components[1].value, [['property-value', 'blue']]);
        },
        'has border-bottom-color': function (components) {
          assert.equal(components[2].name, 'border-bottom-color');
          assert.deepEqual(components[2].value, [['property-value', 'red']]);
        },
        'has border-left-color': function (components) {
          assert.equal(components[3].name, 'border-left-color');
          assert.deepEqual(components[3].value, [['property-value', 'blue']]);
        }
      },
      'one given': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'border-style'],
              ['property-value', 'solid']
            ]
          ]);
        },
        'has 4 components': function (components) {
          assert.lengthOf(components, 4);
        },
        'has border-top-style': function (components) {
          assert.equal(components[0].name, 'border-top-style');
          assert.deepEqual(components[0].value, [['property-value', 'solid']]);
        },
        'has border-right-style': function (components) {
          assert.equal(components[1].name, 'border-right-style');
          assert.deepEqual(components[1].value, [['property-value', 'solid']]);
        },
        'has border-bottom-style': function (components) {
          assert.equal(components[2].name, 'border-bottom-style');
          assert.deepEqual(components[2].value, [['property-value', 'solid']]);
        },
        'has border-left-style': function (components) {
          assert.equal(components[3].name, 'border-left-style');
          assert.deepEqual(components[3].value, [['property-value', 'solid']]);
        }
      },
      'none given': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'border-style']
            ]
          ]);
        },
        'has 0 components': function (components) {
          assert.lengthOf(components, 0);
        }
      }
    },
    'list style': {
      'inherit': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'list-style'],
              ['property-value', 'inherit']
            ]
          ]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has border-top-style': function (components) {
          assert.equal(components[0].name, 'list-style-type');
          assert.deepEqual(components[0].value, [['property-value', 'inherit']]);
        },
        'has border-right-style': function (components) {
          assert.equal(components[1].name, 'list-style-position');
          assert.deepEqual(components[1].value, [['property-value', 'inherit']]);
        },
        'has border-bottom-style': function (components) {
          assert.equal(components[2].name, 'list-style-image');
          assert.deepEqual(components[2].value, [['property-value', 'inherit']]);
        }
      },
      'all values': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'list-style'],
              ['property-value', 'circle'],
              ['property-value', 'inside'],
              ['property-value', 'url(image.png)']
            ]
          ]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has border-top-style': function (components) {
          assert.equal(components[0].name, 'list-style-type');
          assert.deepEqual(components[0].value, [['property-value', 'circle']]);
        },
        'has border-right-style': function (components) {
          assert.equal(components[1].name, 'list-style-position');
          assert.deepEqual(components[1].value, [['property-value', 'inside']]);
        },
        'has border-bottom-style': function (components) {
          assert.equal(components[2].name, 'list-style-image');
          assert.deepEqual(components[2].value, [['property-value', 'url(image.png)']]);
        }
      },
      'some missing': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'list-style'],
              ['property-value', 'inside']
            ]
          ]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has border-top-style': function (components) {
          assert.equal(components[0].name, 'list-style-type');
          assert.deepEqual(components[0].value, [['property-value', 'decimal|disc']]);
        },
        'has border-right-style': function (components) {
          assert.equal(components[1].name, 'list-style-position');
          assert.deepEqual(components[1].value, [['property-value', 'inside']]);
        },
        'has border-bottom-style': function (components) {
          assert.equal(components[2].name, 'list-style-image');
          assert.deepEqual(components[2].value, [['property-value', 'none']]);
        }
      },
      'fuzzy matching': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'list-style'],
              ['property-value', 'url(image.png)'],
              ['property-value', 'outside'],
              ['property-value', 'none']
            ]
          ]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has list-style-type': function (components) {
          assert.equal(components[0].name, 'list-style-type');
          assert.deepEqual(components[0].value, [['property-value', 'none']]);
        },
        'has list-style-position': function (components) {
          assert.equal(components[1].name, 'list-style-position');
          assert.deepEqual(components[1].value, [['property-value', 'outside']]);
        },
        'has list-style-image': function (components) {
          assert.equal(components[2].name, 'list-style-image');
          assert.deepEqual(components[2].value, [['property-value', 'url(image.png)']]);
        }
      }
    },
    'multiple values 123': {
      'background': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'background'],
              ['property-value', 'url(image.png)'],
              ['property-value', '#fff'],
              ['property-value', ','],
              ['property-value', 'url(image2.png)'],
              ['property-value', 'repeat'],
              ['property-value', 'no-repeat'],
              ['property-value', '2px'],
              ['property-value', '3px'],
              ['property-value', '/'],
              ['property-value', '50%'],
              ['property-value', '60%'],
              ['property-value', 'fixed'],
              ['property-value', 'content-box'],
              ['property-value', 'content-box'],
              ['property-value', 'red']
            ]
          ]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has background-image': function (components) {
          assert.deepEqual(components[0].name, 'background-image');
          assert.deepEqual(components[0].value, [['property-value', 'url(image.png)'], ['property-value', ','], ['property-value', 'url(image2.png)']]);
          assert.isTrue(components[0].multiplex);
        },
        'has background-position': function (components) {
          assert.deepEqual(components[1].name, 'background-position');
          assert.deepEqual(components[1].value, [['property-value', '0'], ['property-value', '0'], ['property-value', ','], ['property-value', '2px'], ['property-value', '3px']]);
          assert.isTrue(components[0].multiplex);
        },
        'has background-size': function (components) {
          assert.deepEqual(components[2].name, 'background-size');
          assert.deepEqual(components[2].value, [['property-value', 'auto'], ['property-value', ','], ['property-value', '50%'], ['property-value', '60%']]);
          assert.isTrue(components[0].multiplex);
        },
        'has background-repeat': function (components) {
          assert.deepEqual(components[3].name, 'background-repeat');
          assert.deepEqual(components[3].value, [['property-value', 'repeat'], ['property-value', ','], ['property-value', 'repeat'], ['property-value', 'no-repeat']]);
          assert.isTrue(components[0].multiplex);
        },
        'has background-attachment': function (components) {
          assert.deepEqual(components[4].name, 'background-attachment');
          assert.deepEqual(components[4].value, [['property-value', 'scroll'], ['property-value', ','], ['property-value', 'fixed']]);
          assert.isTrue(components[0].multiplex);
        },
        'has background-origin': function (components) {
          assert.deepEqual(components[5].name, 'background-origin');
          assert.deepEqual(components[5].value, [['property-value', 'padding-box'], ['property-value', ','], ['property-value', 'content-box']]);
          assert.isTrue(components[0].multiplex);
        },
        'has background-clip': function (components) {
          assert.deepEqual(components[6].name, 'background-clip');
          assert.deepEqual(components[6].value, [['property-value', 'border-box'], ['property-value', ','], ['property-value', 'content-box']]);
          assert.isTrue(components[0].multiplex);
        },
        'has background-color': function (components) {
          assert.deepEqual(components[7].name, 'background-color');
          assert.deepEqual(components[7].value, [['property-value', '#fff'], ['property-value', ','], ['property-value', 'red']]);
          assert.isTrue(components[0].multiplex);
        }
      },
      'background - clip & origin': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'background'],
              ['property-value', 'url(image.png)'],
              ['property-value', 'no-repeat'],
              ['property-value', 'padding-box'],
              ['property-value', ','],
              ['property-value', 'repeat'],
              ['property-value', 'red']
            ]
          ]);
        },
        'has background-origin': function (components) {
          assert.deepEqual(components[5].value, [['property-value', 'padding-box'], ['property-value', ','], ['property-value', 'padding-box']]);
        },
        'has background-clip': function (components) {
          assert.deepEqual(components[6].value, [['property-value', 'padding-box'], ['property-value', ','], ['property-value', 'border-box']]);
        }
      }
    },
    'outline': {
      'inherit': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'outline'],
              ['property-value', 'inherit']
            ]
          ]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has outline-color': function (components) {
          assert.deepEqual(components[0].name, 'outline-color');
          assert.deepEqual(components[0].value, [['property-value', 'inherit']]);
        },
        'has outline-style': function (components) {
          assert.deepEqual(components[1].name, 'outline-style');
          assert.deepEqual(components[1].value, [['property-value', 'inherit']]);
        },
        'has outline-width': function (components) {
          assert.deepEqual(components[2].name, 'outline-width');
          assert.deepEqual(components[2].value, [['property-value', 'inherit']]);
        }
      },
      '3 inherits': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'outline'],
              ['property-value', 'inherit'],
              ['property-value', 'inherit'],
              ['property-value', 'inherit']
            ]
          ]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has outline-color': function (components) {
          assert.deepEqual(components[0].name, 'outline-color');
          assert.deepEqual(components[0].value, [['property-value', 'inherit']]);
        },
        'has outline-style': function (components) {
          assert.deepEqual(components[1].name, 'outline-style');
          assert.deepEqual(components[1].value, [['property-value', 'inherit']]);
        },
        'has outline-width': function (components) {
          assert.deepEqual(components[2].name, 'outline-width');
          assert.deepEqual(components[2].value, [['property-value', 'inherit']]);
        }
      },
      'all values in correct order': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'outline'],
              ['property-value', 'red'],
              ['property-value', 'solid'],
              ['property-value', '1px']
            ]
          ]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has outline-color': function (components) {
          assert.deepEqual(components[0].name, 'outline-color');
          assert.deepEqual(components[0].value, [['property-value', 'red']]);
        },
        'has outline-style': function (components) {
          assert.deepEqual(components[1].name, 'outline-style');
          assert.deepEqual(components[1].value, [['property-value', 'solid']]);
        },
        'has outline-width': function (components) {
          assert.deepEqual(components[2].name, 'outline-width');
          assert.deepEqual(components[2].value, [['property-value', '1px']]);
        }
      },
      'all values in wrong order': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'outline'],
              ['property-value', '1px'],
              ['property-value', 'dotted'],
              ['property-value', '#fff']
            ]
          ]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has outline-color': function (components) {
          assert.deepEqual(components[0].name, 'outline-color');
          assert.deepEqual(components[0].value, [['property-value', '#fff']]);
        },
        'has outline-style': function (components) {
          assert.deepEqual(components[1].name, 'outline-style');
          assert.deepEqual(components[1].value, [['property-value', 'dotted']]);
        },
        'has outline-width': function (components) {
          assert.deepEqual(components[2].name, 'outline-width');
          assert.deepEqual(components[2].value, [['property-value', '1px']]);
        }
      },
      'with auto style': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'outline'],
              ['property-value', '#fff'],
              ['property-value', 'auto'],
              ['property-value', '1px']
            ]
          ]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has outline-color': function (components) {
          assert.deepEqual(components[0].name, 'outline-color');
          assert.deepEqual(components[0].value, [['property-value', '#fff']]);
        },
        'has outline-style': function (components) {
          assert.deepEqual(components[1].name, 'outline-style');
          assert.deepEqual(components[1].value, [['property-value', 'auto']]);
        },
        'has outline-width': function (components) {
          assert.deepEqual(components[2].name, 'outline-width');
          assert.deepEqual(components[2].value, [['property-value', '1px']]);
        }
      },
      'missing values': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'outline'],
              ['property-value', 'solid']
            ]
          ]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has outline-color': function (components) {
          assert.deepEqual(components[0].name, 'outline-color');
          assert.deepEqual(components[0].value, [['property-value', 'invert']]);
        },
        'has outline-style': function (components) {
          assert.deepEqual(components[1].name, 'outline-style');
          assert.deepEqual(components[1].value, [['property-value', 'solid']]);
        },
        'has outline-width': function (components) {
          assert.deepEqual(components[2].name, 'outline-width');
          assert.deepEqual(components[2].value, [['property-value', 'medium']]);
        }
      },
      'default values': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'outline'],
              ['property-value', 'invert'],
              ['property-value', 'none'],
              ['property-value', 'medium']
            ]
          ]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has outline-color': function (components) {
          assert.deepEqual(components[0].name, 'outline-color');
          assert.deepEqual(components[0].value, [['property-value', 'invert']]);
        },
        'has outline-style': function (components) {
          assert.deepEqual(components[1].name, 'outline-style');
          assert.deepEqual(components[1].value, [['property-value', 'none']]);
        },
        'has outline-width': function (components) {
          assert.deepEqual(components[2].name, 'outline-width');
          assert.deepEqual(components[2].value, [['property-value', 'medium']]);
        }
      }
    }
  })
  .export(module);
