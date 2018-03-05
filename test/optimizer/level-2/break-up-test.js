var assert = require('assert');
var vows = require('vows');

var wrapForOptimizing = require('../../../lib/optimizer/wrap-for-optimizing').all;
var populateComponents = require('../../../lib/optimizer/level-2/properties/populate-components');
var validator = require('../../../lib/optimizer/validator');
var compatibilityFrom = require('../../../lib/options/compatibility');

var breakUp = require('../../../lib/optimizer/level-2/break-up');

function _breakUp(properties) {
  var wrapped = wrapForOptimizing(properties);
  populateComponents(wrapped, validator(compatibilityFrom()), []);

  return wrapped[0].components;
}

vows.describe(breakUp)
  .addBatch({
    'animation': {
      'all': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'animation'],
              ['property-value', '3s'],
              ['property-value', 'ease-in'],
              ['property-value', '1s'],
              ['property-value', '2'],
              ['property-value', 'reverse'],
              ['property-value', 'both'],
              ['property-value', 'paused'],
              ['property-value', 'slidein']
            ]
          ]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has animation-duration': function (components) {
          assert.deepEqual(components[0].name, 'animation-duration');
          assert.deepEqual(components[0].value, [['property-value', '3s']]);
        },
        'has animation-timing-function': function (components) {
          assert.deepEqual(components[1].name, 'animation-timing-function');
          assert.deepEqual(components[1].value, [['property-value', 'ease-in']]);
        },
        'has animation-delay': function (components) {
          assert.deepEqual(components[2].name, 'animation-delay');
          assert.deepEqual(components[2].value, [['property-value', '1s']]);
        },
        'has animation-iteration-count': function (components) {
          assert.deepEqual(components[3].name, 'animation-iteration-count');
          assert.deepEqual(components[3].value, [['property-value', '2']]);
        },
        'has animation-direction': function (components) {
          assert.deepEqual(components[4].name, 'animation-direction');
          assert.deepEqual(components[4].value, [['property-value', 'reverse']]);
        },
        'has animation-fill-mode': function (components) {
          assert.deepEqual(components[5].name, 'animation-fill-mode');
          assert.deepEqual(components[5].value, [['property-value', 'both']]);
        },
        'has animation-play-state': function (components) {
          assert.deepEqual(components[6].name, 'animation-play-state');
          assert.deepEqual(components[6].value, [['property-value', 'paused']]);
        },
        'has animation-name': function (components) {
          assert.deepEqual(components[7].name, 'animation-name');
          assert.deepEqual(components[7].value, [['property-value', 'slidein']]);
        }
      },
      'all with reversed order': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'animation'],
              ['property-value', 'slidein'],
              ['property-value', 'paused'],
              ['property-value', 'both'],
              ['property-value', 'reverse'],
              ['property-value', '2'],
              ['property-value', '1s'],
              ['property-value', 'ease-in'],
              ['property-value', '3s']
            ]
          ]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has animation-duration': function (components) {
          assert.deepEqual(components[0].name, 'animation-duration');
          assert.deepEqual(components[0].value, [['property-value', '1s']]);
        },
        'has animation-timing-function': function (components) {
          assert.deepEqual(components[1].name, 'animation-timing-function');
          assert.deepEqual(components[1].value, [['property-value', 'ease-in']]);
        },
        'has animation-delay': function (components) {
          assert.deepEqual(components[2].name, 'animation-delay');
          assert.deepEqual(components[2].value, [['property-value', '3s']]);
        },
        'has animation-iteration-count': function (components) {
          assert.deepEqual(components[3].name, 'animation-iteration-count');
          assert.deepEqual(components[3].value, [['property-value', '2']]);
        },
        'has animation-direction': function (components) {
          assert.deepEqual(components[4].name, 'animation-direction');
          assert.deepEqual(components[4].value, [['property-value', 'reverse']]);
        },
        'has animation-fill-mode': function (components) {
          assert.deepEqual(components[5].name, 'animation-fill-mode');
          assert.deepEqual(components[5].value, [['property-value', 'both']]);
        },
        'has animation-play-state': function (components) {
          assert.deepEqual(components[6].name, 'animation-play-state');
          assert.deepEqual(components[6].value, [['property-value', 'paused']]);
        },
        'has animation-name': function (components) {
          assert.deepEqual(components[7].name, 'animation-name');
          assert.deepEqual(components[7].value, [['property-value', 'slidein']]);
        }
      },
      'some': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'animation'],
              ['property-value', '3s'],
              ['property-value', 'reverse'],
              ['property-value', 'ease-in']
            ]
          ]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has animation-duration': function (components) {
          assert.deepEqual(components[0].name, 'animation-duration');
          assert.deepEqual(components[0].value, [['property-value', '3s']]);
        },
        'has animation-timing-function': function (components) {
          assert.deepEqual(components[1].name, 'animation-timing-function');
          assert.deepEqual(components[1].value, [['property-value', 'ease-in']]);
        },
        'has animation-delay': function (components) {
          assert.deepEqual(components[2].name, 'animation-delay');
          assert.deepEqual(components[2].value, [['property-value', '0s']]);
        },
        'has animation-iteration-count': function (components) {
          assert.deepEqual(components[3].name, 'animation-iteration-count');
          assert.deepEqual(components[3].value, [['property-value', '1']]);
        },
        'has animation-direction': function (components) {
          assert.deepEqual(components[4].name, 'animation-direction');
          assert.deepEqual(components[4].value, [['property-value', 'reverse']]);
        },
        'has animation-fill-mode': function (components) {
          assert.deepEqual(components[5].name, 'animation-fill-mode');
          assert.deepEqual(components[5].value, [['property-value', 'none']]);
        },
        'has animation-play-state': function (components) {
          assert.deepEqual(components[6].name, 'animation-play-state');
          assert.deepEqual(components[6].value, [['property-value', 'running']]);
        },
        'has animation-name': function (components) {
          assert.deepEqual(components[7].name, 'animation-name');
          assert.deepEqual(components[7].value, [['property-value', 'none']]);
        }
      },
      'custom timing function': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'animation'],
              ['property-value', 'cubic-bezier(0.1, 0.7, 1.0, 0.1)']
            ]
          ]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has animation-timing-function': function (components) {
          assert.deepEqual(components[1].name, 'animation-timing-function');
          assert.deepEqual(components[1].value, [['property-value', 'cubic-bezier(0.1, 0.7, 1.0, 0.1)']]);
        }
      },
      'invalid timing function': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'animation'],
              ['property-value', 'custom-bezier(0.1, 0.7, 1.0, 0.1)', [[1, 12, undefined]]]
            ]
          ]);
        },
        'has no components': function (components) {
          assert.lengthOf(components, 0);
        }
      },
      'custom animation name': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'animation'],
              ['property-value', 'custom-animation']
            ]
          ]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has animation-name': function (components) {
          assert.deepEqual(components[7].name, 'animation-name');
          assert.deepEqual(components[7].value, [['property-value', 'custom-animation']]);
        }
      },
      'three time units': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'animation'],
              ['property-value', '1s'],
              ['property-value', 'ease-in'],
              ['property-value', '2s'],
              ['property-value', '3s', [[1, 20, undefined]]]
            ]
          ]);
        },
        'has no components': function (components) {
          assert.lengthOf(components, 0);
        }
      },
      'repeated values': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'animation'],
              ['property-value', '1s'],
              ['property-value', 'reverse'],
              ['property-value', 'reverse']
            ]
          ]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has animation-name': function (components) {
          assert.deepEqual(components[7].name, 'animation-name');
          assert.deepEqual(components[7].value, [['property-value', 'reverse']]);
        }
      },
      'inherit': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'animation'],
              ['property-value', 'inherit']
            ]
          ]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has animation-duration': function (components) {
          assert.deepEqual(components[0].name, 'animation-duration');
          assert.deepEqual(components[0].value, [['property-value', 'inherit']]);
        },
        'has animation-timing-function': function (components) {
          assert.deepEqual(components[1].name, 'animation-timing-function');
          assert.deepEqual(components[1].value, [['property-value', 'inherit']]);
        },
        'has animation-delay': function (components) {
          assert.deepEqual(components[2].name, 'animation-delay');
          assert.deepEqual(components[2].value, [['property-value', 'inherit']]);
        },
        'has animation-iteration-count': function (components) {
          assert.deepEqual(components[3].name, 'animation-iteration-count');
          assert.deepEqual(components[3].value, [['property-value', 'inherit']]);
        },
        'has animation-direction': function (components) {
          assert.deepEqual(components[4].name, 'animation-direction');
          assert.deepEqual(components[4].value, [['property-value', 'inherit']]);
        },
        'has animation-fill-mode': function (components) {
          assert.deepEqual(components[5].name, 'animation-fill-mode');
          assert.deepEqual(components[5].value, [['property-value', 'inherit']]);
        },
        'has animation-play-state': function (components) {
          assert.deepEqual(components[6].name, 'animation-play-state');
          assert.deepEqual(components[6].value, [['property-value', 'inherit']]);
        },
        'has animation-name': function (components) {
          assert.deepEqual(components[7].name, 'animation-name');
          assert.deepEqual(components[7].value, [['property-value', 'inherit']]);
        }
      },
      'inherit mixed in': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'animation'],
              ['property-value', '1s', [[1, 12, undefined]]],
              ['property-value', 'inherit']
            ]
          ]);
        },
        'has no components': function (components) {
          assert.lengthOf(components, 0);
        }
      },
      'multiplex': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'animation'],
              ['property-value', '3s'],
              ['property-value', 'ease-in'],
              ['property-value', '1s'],
              ['property-value', '2'],
              ['property-value', 'reverse'],
              ['property-value', 'both'],
              ['property-value', 'paused'],
              ['property-value', 'slidein'],
              ['property-value', ','],
              ['property-value', '2s'],
              ['property-value', 'ease-out'],
              ['property-value', 'slideout']
            ]
          ]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has animation-duration': function (components) {
          assert.deepEqual(components[0].name, 'animation-duration');
          assert.deepEqual(components[0].value, [['property-value', '3s'], ['property-value', ','], ['property-value', '2s']]);
        },
        'has animation-timing-function': function (components) {
          assert.deepEqual(components[1].name, 'animation-timing-function');
          assert.deepEqual(components[1].value, [['property-value', 'ease-in'], ['property-value', ','], ['property-value', 'ease-out']]);
        },
        'has animation-delay': function (components) {
          assert.deepEqual(components[2].name, 'animation-delay');
          assert.deepEqual(components[2].value, [['property-value', '1s'], ['property-value', ','], ['property-value', '0s']]);
        },
        'has animation-iteration-count': function (components) {
          assert.deepEqual(components[3].name, 'animation-iteration-count');
          assert.deepEqual(components[3].value, [['property-value', '2'], ['property-value', ','], ['property-value', '1']]);
        },
        'has animation-direction': function (components) {
          assert.deepEqual(components[4].name, 'animation-direction');
          assert.deepEqual(components[4].value, [['property-value', 'reverse'], ['property-value', ','], ['property-value', 'normal']]);
        },
        'has animation-fill-mode': function (components) {
          assert.deepEqual(components[5].name, 'animation-fill-mode');
          assert.deepEqual(components[5].value, [['property-value', 'both'], ['property-value', ','], ['property-value', 'none']]);
        },
        'has animation-play-state': function (components) {
          assert.deepEqual(components[6].name, 'animation-play-state');
          assert.deepEqual(components[6].value, [['property-value', 'paused'], ['property-value', ','], ['property-value', 'running']]);
        },
        'has animation-name': function (components) {
          assert.deepEqual(components[7].name, 'animation-name');
          assert.deepEqual(components[7].value, [['property-value', 'slidein'], ['property-value', ','], ['property-value', 'slideout']]);
        }
      },
      'vendor prefixed': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', '-moz-animation'],
              ['property-value', '3s'],
              ['property-value', 'ease-in'],
              ['property-value', '1s'],
              ['property-value', '2'],
              ['property-value', 'reverse'],
              ['property-value', 'both'],
              ['property-value', 'paused'],
              ['property-value', 'slidein']
            ]
          ]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has animation-duration': function (components) {
          assert.deepEqual(components[0].name, '-moz-animation-duration');
          assert.deepEqual(components[0].value, [['property-value', '3s']]);
        },
        'has animation-timing-function': function (components) {
          assert.deepEqual(components[1].name, '-moz-animation-timing-function');
          assert.deepEqual(components[1].value, [['property-value', 'ease-in']]);
        },
        'has animation-delay': function (components) {
          assert.deepEqual(components[2].name, '-moz-animation-delay');
          assert.deepEqual(components[2].value, [['property-value', '1s']]);
        },
        'has animation-iteration-count': function (components) {
          assert.deepEqual(components[3].name, '-moz-animation-iteration-count');
          assert.deepEqual(components[3].value, [['property-value', '2']]);
        },
        'has animation-direction': function (components) {
          assert.deepEqual(components[4].name, '-moz-animation-direction');
          assert.deepEqual(components[4].value, [['property-value', 'reverse']]);
        },
        'has animation-fill-mode': function (components) {
          assert.deepEqual(components[5].name, '-moz-animation-fill-mode');
          assert.deepEqual(components[5].value, [['property-value', 'both']]);
        },
        'has animation-play-state': function (components) {
          assert.deepEqual(components[6].name, '-moz-animation-play-state');
          assert.deepEqual(components[6].value, [['property-value', 'paused']]);
        },
        'has animation-name': function (components) {
          assert.deepEqual(components[7].name, '-moz-animation-name');
          assert.deepEqual(components[7].value, [['property-value', 'slidein']]);
        }
      }
    },
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
    'font': {
      'all values': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font'],
              ['property-value', 'italic'],
              ['property-value', 'small-caps'],
              ['property-value', 'bold'],
              ['property-value', 'normal'],
              ['property-value', '18px'],
              ['property-value', '/'],
              ['property-value', '16px'],
              ['property-value', 'sans-serif']
            ]
          ]);
        },
        'has 7 components': function (components) {
          assert.lengthOf(components, 7);
        },
        'has font-style': function (components) {
          assert.equal(components[0].name, 'font-style');
          assert.deepEqual(components[0].value, [['property-value', 'italic']]);
        },
        'has font-variant': function (components) {
          assert.equal(components[1].name, 'font-variant');
          assert.deepEqual(components[1].value, [['property-value', 'small-caps']]);
        },
        'has font-weight': function (components) {
          assert.equal(components[2].name, 'font-weight');
          assert.deepEqual(components[2].value, [['property-value', 'bold']]);
        },
        'has font-stretch': function (components) {
          assert.equal(components[3].name, 'font-stretch');
          assert.deepEqual(components[3].value, [['property-value', 'normal']]);
        },
        'has font-size': function (components) {
          assert.equal(components[4].name, 'font-size');
          assert.deepEqual(components[4].value, [['property-value', '18px']]);
        },
        'has line-height': function (components) {
          assert.equal(components[5].name, 'line-height');
          assert.deepEqual(components[5].value, [['property-value', '16px']]);
        },
        'has font-family': function (components) {
          assert.equal(components[6].name, 'font-family');
          assert.deepEqual(components[6].value, [['property-value', 'sans-serif']]);
        }
      },
      'multiple font-family': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font'],
              ['property-value', 'italic'],
              ['property-value', 'small-caps'],
              ['property-value', 'bold'],
              ['property-value', 'normal'],
              ['property-value', '18px'],
              ['property-value', '/'],
              ['property-value', '16px'],
              ['property-value', 'Helvetica'],
              ['property-value', ','],
              ['property-value', 'Arial'],
              ['property-value', ','],
              ['property-value', 'sans-serif']
            ]
          ]);
        },
        'has all font-family': function (components) {
          assert.equal(components[6].name, 'font-family');
          assert.deepEqual(components[6].value, [['property-value', 'Helvetica'], ['property-value', 'Arial'], ['property-value', 'sans-serif']]);
        }
      },
      'no line-height': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font'],
              ['property-value', 'italic'],
              ['property-value', 'small-caps'],
              ['property-value', 'bold'],
              ['property-value', 'normal'],
              ['property-value', '18px'],
              ['property-value', 'sans-serif']
            ]
          ]);
        },
        'has 7 components': function (components) {
          assert.lengthOf(components, 7);
        },
        'has font-size': function (components) {
          assert.equal(components[4].name, 'font-size');
          assert.deepEqual(components[4].value, [['property-value', '18px']]);
        },
        'has line-height': function (components) {
          assert.equal(components[5].name, 'line-height');
          assert.deepEqual(components[5].value, [['property-value', 'normal']]);
        },
        'has font-family': function (components) {
          assert.equal(components[6].name, 'font-family');
          assert.deepEqual(components[6].value, [['property-value', 'sans-serif']]);
        }
      },
      'no line-height or fuzzy matched properties': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font'],
              ['property-value', '18px'],
              ['property-value', 'sans-serif']
            ]
          ]);
        },
        'has 7 components': function (components) {
          assert.lengthOf(components, 7);
        },
        'has font-style': function (components) {
          assert.equal(components[0].name, 'font-style');
          assert.deepEqual(components[0].value, [['property-value', 'normal']]);
        },
        'has font-variant': function (components) {
          assert.equal(components[1].name, 'font-variant');
          assert.deepEqual(components[1].value, [['property-value', 'normal']]);
        },
        'has font-weight': function (components) {
          assert.equal(components[2].name, 'font-weight');
          assert.deepEqual(components[2].value, [['property-value', 'normal']]);
        },
        'has font-stretch': function (components) {
          assert.equal(components[3].name, 'font-stretch');
          assert.deepEqual(components[3].value, [['property-value', 'normal']]);
        },
        'has font-size': function (components) {
          assert.equal(components[4].name, 'font-size');
          assert.deepEqual(components[4].value, [['property-value', '18px']]);
        },
        'has line-height': function (components) {
          assert.equal(components[5].name, 'line-height');
          assert.deepEqual(components[5].value, [['property-value', 'normal']]);
        },
        'has font-family': function (components) {
          assert.equal(components[6].name, 'font-family');
          assert.deepEqual(components[6].value, [['property-value', 'sans-serif']]);
        }
      },
      'some fuzzy matched properties #1': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font'],
              ['property-value', 'bold'],
              ['property-value', 'small-caps'],
              ['property-value', '18px'],
              ['property-value', 'sans-serif']
            ]
          ]);
        },
        'has 7 components': function (components) {
          assert.lengthOf(components, 7);
        },
        'has font-style': function (components) {
          assert.equal(components[0].name, 'font-style');
          assert.deepEqual(components[0].value, [['property-value', 'normal']]);
        },
        'has font-variant': function (components) {
          assert.equal(components[1].name, 'font-variant');
          assert.deepEqual(components[1].value, [['property-value', 'small-caps']]);
        },
        'has font-weight': function (components) {
          assert.equal(components[2].name, 'font-weight');
          assert.deepEqual(components[2].value, [['property-value', 'bold']]);
        },
        'has font-stretch': function (components) {
          assert.equal(components[3].name, 'font-stretch');
          assert.deepEqual(components[3].value, [['property-value', 'normal']]);
        }
      },
      'some fuzzy matched properties #2': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font'],
              ['property-value', 'ultra-condensed'],
              ['property-value', 'italic'],
              ['property-value', '18px'],
              ['property-value', 'sans-serif']
            ]
          ]);
        },
        'has 7 components': function (components) {
          assert.lengthOf(components, 7);
        },
        'has font-style': function (components) {
          assert.equal(components[0].name, 'font-style');
          assert.deepEqual(components[0].value, [['property-value', 'italic']]);
        },
        'has font-variant': function (components) {
          assert.equal(components[1].name, 'font-variant');
          assert.deepEqual(components[1].value, [['property-value', 'normal']]);
        },
        'has font-weight': function (components) {
          assert.equal(components[2].name, 'font-weight');
          assert.deepEqual(components[2].value, [['property-value', 'normal']]);
        },
        'has font-stretch': function (components) {
          assert.equal(components[3].name, 'font-stretch');
          assert.deepEqual(components[3].value, [['property-value', 'ultra-condensed']]);
        }
      },
      'repeated fuzzy matched value': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font'],
              ['property-value', 'italic', [[0, 13, undefined]]],
              ['property-value', 'italic'],
              ['property-value', '18px'],
              ['property-value', 'sans-serif']
            ]
          ]);
        },
        'has 0 components': function (components) {
          assert.lengthOf(components, 0);
        }
      },
      'line-height and font-size as functions': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font'],
              ['property-value', 'calc(27px / 2)', [[0, 13, undefined]]],
              ['property-value', '/'],
              ['property-value', 'calc(31px / 2)'],
              ['property-value', 'sans-serif']
            ]
          ]);
        },
        'has 0 components': function (components) {
          assert.lengthOf(components, 0);
        }
      },
      'missing font size value': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font', [[0, 13, undefined]]],
              ['property-value', 'italic'],
              ['property-value', 'sans-serif']
            ]
          ]);
        },
        'has 0 components': function (components) {
          assert.lengthOf(components, 0);
        }
      },
      'missing font family value': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font'],
              ['property-value', 'italic', [[0, 13, undefined]]],
              ['property-value', '12px']
            ]
          ]);
        },
        'has 0 components': function (components) {
          assert.lengthOf(components, 0);
        }
      },
      'missing font family value after line height': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font'],
              ['property-value', 'italic', [[0, 13, undefined]]],
              ['property-value', '12px'],
              ['property-value', '/'],
              ['property-value', '12px']
            ]
          ]);
        },
        'has 0 components': function (components) {
          assert.lengthOf(components, 0);
        }
      },
      'missing font family when only commas given': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font'],
              ['property-value', 'italic', [[0, 13, undefined]]],
              ['property-value', '12px'],
              ['property-value', ','],
              ['property-value', ',']
            ]
          ]);
        },
        'has 0 components': function (components) {
          assert.lengthOf(components, 0);
        }
      },
      'missing all values': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font', [[0, 13, undefined]]]
            ]
          ]);
        },
        'has 0 components': function (components) {
          assert.lengthOf(components, 0);
        }
      },
      'values after font family': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font'],
              ['property-value', '12px'],
              ['property-value', 'Helvetica'],
              ['property-value', ','],
              ['property-value', 'sans-serif'],
              ['property-value', 'italic']
            ]
          ]);
        },
        'has 7 components': function (components) {
          assert.lengthOf(components, 7);
        },
        'has font-family': function (components) {
          assert.equal(components[6].name, 'font-family');
          assert.deepEqual(components[6].value, [['property-value', 'Helvetica'], ['property-value', 'sans-serif italic']]);
        }
      },
      'single inherit': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font'],
              ['property-value', 'inherit']
            ]
          ]);
        },
        'has 7 components': function (components) {
          assert.lengthOf(components, 7);
        },
        'has font-style': function (components) {
          assert.equal(components[0].name, 'font-style');
          assert.deepEqual(components[0].value, [['property-value', 'inherit']]);
        },
        'has font-variant': function (components) {
          assert.equal(components[1].name, 'font-variant');
          assert.deepEqual(components[1].value, [['property-value', 'inherit']]);
        },
        'has font-weight': function (components) {
          assert.equal(components[2].name, 'font-weight');
          assert.deepEqual(components[2].value, [['property-value', 'inherit']]);
        },
        'has font-stretch': function (components) {
          assert.equal(components[3].name, 'font-stretch');
          assert.deepEqual(components[3].value, [['property-value', 'inherit']]);
        },
        'has font-size': function (components) {
          assert.equal(components[4].name, 'font-size');
          assert.deepEqual(components[4].value, [['property-value', 'inherit']]);
        },
        'has line-height': function (components) {
          assert.equal(components[5].name, 'line-height');
          assert.deepEqual(components[5].value, [['property-value', 'inherit']]);
        },
        'has font-family': function (components) {
          assert.equal(components[6].name, 'font-family');
          assert.deepEqual(components[6].value, [['property-value', 'inherit']]);
        }
      },
      'multiple inherit': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font'],
              ['property-value', 'inherit', [[0, 13, undefined]]],
              ['property-value', 'inherit']
            ]
          ]);
        },
        'has 0 components': function (components) {
          assert.lengthOf(components, 0);
        }
      },
      'mixed inherit #1': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font'],
              ['property-value', 'inherit', [[0, 13, undefined]]],
              ['property-value', '12px'],
              ['property-value', 'sans-serif']
            ]
          ]);
        },
        'has 0 components': function (components) {
          assert.lengthOf(components, 0);
        }
      },
      'mixed inherit #2': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font'],
              ['property-value', 'bold', [[0, 13, undefined]]],
              ['property-value', 'inherit'],
              ['property-value', '12px'],
              ['property-value', 'sans-serif']
            ]
          ]);
        },
        'has 0 components': function (components) {
          assert.lengthOf(components, 0);
        }
      },
      'system font': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font'],
              ['property-value', 'icon']
            ]
          ]);
        },
        'has 7 components': function (components) {
          assert.lengthOf(components, 7);
        },
        'has font-style': function (components) {
          assert.equal(components[0].name, 'font-style');
          assert.deepEqual(components[0].value, [['property-value', '-clean-css-icon']]);
        },
        'has font-variant': function (components) {
          assert.equal(components[1].name, 'font-variant');
          assert.deepEqual(components[1].value, [['property-value', '-clean-css-icon']]);
        },
        'has font-weight': function (components) {
          assert.equal(components[2].name, 'font-weight');
          assert.deepEqual(components[2].value, [['property-value', '-clean-css-icon']]);
        },
        'has font-stretch': function (components) {
          assert.equal(components[3].name, 'font-stretch');
          assert.deepEqual(components[3].value, [['property-value', '-clean-css-icon']]);
        },
        'has font-size': function (components) {
          assert.equal(components[4].name, 'font-size');
          assert.deepEqual(components[4].value, [['property-value', '-clean-css-icon']]);
        },
        'has line-height': function (components) {
          assert.equal(components[5].name, 'line-height');
          assert.deepEqual(components[5].value, [['property-value', '-clean-css-icon']]);
        },
        'has font-family': function (components) {
          assert.equal(components[6].name, 'font-family');
          assert.deepEqual(components[6].value, [['property-value', '-clean-css-icon']]);
        }
      },
      'normal as font': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font', [[0, 6, undefined]]],
              ['property-value', 'normal']
            ]
          ]);
        },
        'has 0 components': function (components) {
          assert.lengthOf(components, 0);
        }
      },
      'non-identifier as font family': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font', [[0, 6, undefined]]],
              ['property-value', '16px'],
              ['property-value', '123']
            ]
          ]);
        },
        'has 0 components': function (components) {
          assert.lengthOf(components, 0);
        }
      },
      'unset font': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font'],
              ['property-value', 'unset']
            ]
          ]);
        },
        'has 7 components': function (components) {
          assert.lengthOf(components, 7);
        },
        'has font-style': function (components) {
          assert.equal(components[0].name, 'font-style');
          assert.deepEqual(components[0].value, [['property-value', '-clean-css-unset']]);
        },
        'has font-variant': function (components) {
          assert.equal(components[1].name, 'font-variant');
          assert.deepEqual(components[1].value, [['property-value', '-clean-css-unset']]);
        },
        'has font-weight': function (components) {
          assert.equal(components[2].name, 'font-weight');
          assert.deepEqual(components[2].value, [['property-value', '-clean-css-unset']]);
        },
        'has font-stretch': function (components) {
          assert.equal(components[3].name, 'font-stretch');
          assert.deepEqual(components[3].value, [['property-value', '-clean-css-unset']]);
        },
        'has font-size': function (components) {
          assert.equal(components[4].name, 'font-size');
          assert.deepEqual(components[4].value, [['property-value', '-clean-css-unset']]);
        },
        'has line-height': function (components) {
          assert.equal(components[5].name, 'line-height');
          assert.deepEqual(components[5].value, [['property-value', '-clean-css-unset']]);
        },
        'has font-family': function (components) {
          assert.equal(components[6].name, 'font-family');
          assert.deepEqual(components[6].value, [['property-value', '-clean-css-unset']]);
        }
      },
      'system font with vendor prefix': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'font'],
              ['property-value', '-moz-window']
            ]
          ]);
        },
        'has 7 components': function (components) {
          assert.lengthOf(components, 7);
        },
        'has font-style': function (components) {
          assert.equal(components[0].name, 'font-style');
          assert.deepEqual(components[0].value, [['property-value', '-clean-css--moz-window']]);
        },
        'has font-variant': function (components) {
          assert.equal(components[1].name, 'font-variant');
          assert.deepEqual(components[1].value, [['property-value', '-clean-css--moz-window']]);
        },
        'has font-weight': function (components) {
          assert.equal(components[2].name, 'font-weight');
          assert.deepEqual(components[2].value, [['property-value', '-clean-css--moz-window']]);
        },
        'has font-stretch': function (components) {
          assert.equal(components[3].name, 'font-stretch');
          assert.deepEqual(components[3].value, [['property-value', '-clean-css--moz-window']]);
        },
        'has font-size': function (components) {
          assert.equal(components[4].name, 'font-size');
          assert.deepEqual(components[4].value, [['property-value', '-clean-css--moz-window']]);
        },
        'has line-height': function (components) {
          assert.equal(components[5].name, 'line-height');
          assert.deepEqual(components[5].value, [['property-value', '-clean-css--moz-window']]);
        },
        'has font-family': function (components) {
          assert.equal(components[6].name, 'font-family');
          assert.deepEqual(components[6].value, [['property-value', '-clean-css--moz-window']]);
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
      },
      'non-standard type': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'list-style'],
              ['property-value', 'test']
            ]
          ]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has list-style-type': function (components) {
          assert.equal(components[0].name, 'list-style-type');
          assert.deepEqual(components[0].value, [['property-value', 'test']]);
        },
        'has list-style-position': function (components) {
          assert.equal(components[1].name, 'list-style-position');
          assert.deepEqual(components[1].value, [['property-value', 'outside']]);
        },
        'has list-style-image': function (components) {
          assert.equal(components[2].name, 'list-style-image');
          assert.deepEqual(components[2].value, [['property-value', 'none']]);
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
  .addBatch({
    'transition': {
      'all': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'transition'],
              ['property-value', 'all'],
              ['property-value', '1s'],
              ['property-value', 'ease-in'],
              ['property-value', '2s']
            ]
          ]);
        },
        'has 4 components': function (components) {
          assert.lengthOf(components, 4);
        },
        'has transition-property': function (components) {
          assert.deepEqual(components[0].name, 'transition-property');
          assert.deepEqual(components[0].value, [['property-value', 'all']]);
        },
        'has transition-duration': function (components) {
          assert.deepEqual(components[1].name, 'transition-duration');
          assert.deepEqual(components[1].value, [['property-value', '1s']]);
        },
        'has transition-timing-function': function (components) {
          assert.deepEqual(components[2].name, 'transition-timing-function');
          assert.deepEqual(components[2].value, [['property-value', 'ease-in']]);
        },
        'has transition-delay': function (components) {
          assert.deepEqual(components[3].name, 'transition-delay');
          assert.deepEqual(components[3].value, [['property-value', '2s']]);
        }
      },
      'all vendor prefixed': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', '-moz-transition'],
              ['property-value', 'all'],
              ['property-value', '1s'],
              ['property-value', 'ease-in'],
              ['property-value', '2s']
            ]
          ]);
        },
        'has 4 components': function (components) {
          assert.lengthOf(components, 4);
        },
        'has -moz-transition-property': function (components) {
          assert.deepEqual(components[0].name, '-moz-transition-property');
          assert.deepEqual(components[0].value, [['property-value', 'all']]);
        },
        'has -moz-transition-duration': function (components) {
          assert.deepEqual(components[1].name, '-moz-transition-duration');
          assert.deepEqual(components[1].value, [['property-value', '1s']]);
        },
        'has -moz-transition-timing-function': function (components) {
          assert.deepEqual(components[2].name, '-moz-transition-timing-function');
          assert.deepEqual(components[2].value, [['property-value', 'ease-in']]);
        },
        'has -moz-transition-delay': function (components) {
          assert.deepEqual(components[3].name, '-moz-transition-delay');
          assert.deepEqual(components[3].value, [['property-value', '2s']]);
        }
      },
      'all with reversed order': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'transition'],
              ['property-value', '2s'],
              ['property-value', 'ease-in'],
              ['property-value', '1s'],
              ['property-value', 'all']
            ]
          ]);
        },
        'has transition-property': function (components) {
          assert.deepEqual(components[0].name, 'transition-property');
          assert.deepEqual(components[0].value, [['property-value', 'all']]);
        },
        'has transition-duration': function (components) {
          assert.deepEqual(components[1].name, 'transition-duration');
          assert.deepEqual(components[1].value, [['property-value', '2s']]);
        },
        'has transition-timing-function': function (components) {
          assert.deepEqual(components[2].name, 'transition-timing-function');
          assert.deepEqual(components[2].value, [['property-value', 'ease-in']]);
        },
        'has transition-delay': function (components) {
          assert.deepEqual(components[3].name, 'transition-delay');
          assert.deepEqual(components[3].value, [['property-value', '1s']]);
        }
      },
      'some': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'transition'],
              ['property-value', 'margin'],
              ['property-value', '1s']
            ]
          ]);
        },
        'has transition-property': function (components) {
          assert.deepEqual(components[0].name, 'transition-property');
          assert.deepEqual(components[0].value, [['property-value', 'margin']]);
        },
        'has transition-duration': function (components) {
          assert.deepEqual(components[1].name, 'transition-duration');
          assert.deepEqual(components[1].value, [['property-value', '1s']]);
        },
        'has transition-timing-function': function (components) {
          assert.deepEqual(components[2].name, 'transition-timing-function');
          assert.deepEqual(components[2].value, [['property-value', 'ease']]);
        },
        'has transition-delay': function (components) {
          assert.deepEqual(components[3].name, 'transition-delay');
          assert.deepEqual(components[3].value, [['property-value', '0s']]);
        }
      },
      'only property': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'transition'],
              ['property-value', 'margin']
            ]
          ]);
        },
        'has transition-property': function (components) {
          assert.deepEqual(components[0].name, 'transition-property');
          assert.deepEqual(components[0].value, [['property-value', 'margin']]);
        },
        'has transition-duration': function (components) {
          assert.deepEqual(components[1].name, 'transition-duration');
          assert.deepEqual(components[1].value, [['property-value', '0s']]);
        },
        'has transition-timing-function': function (components) {
          assert.deepEqual(components[2].name, 'transition-timing-function');
          assert.deepEqual(components[2].value, [['property-value', 'ease']]);
        },
        'has transition-delay': function (components) {
          assert.deepEqual(components[3].name, 'transition-delay');
          assert.deepEqual(components[3].value, [['property-value', '0s']]);
        }
      },
      'only one `time`': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'transition'],
              ['property-value', '1s']
            ]
          ]);
        },
        'has transition-property': function (components) {
          assert.deepEqual(components[0].name, 'transition-property');
          assert.deepEqual(components[0].value, [['property-value', 'all']]);
        },
        'has transition-duration': function (components) {
          assert.deepEqual(components[1].name, 'transition-duration');
          assert.deepEqual(components[1].value, [['property-value', '1s']]);
        },
        'has transition-timing-function': function (components) {
          assert.deepEqual(components[2].name, 'transition-timing-function');
          assert.deepEqual(components[2].value, [['property-value', 'ease']]);
        },
        'has transition-delay': function (components) {
          assert.deepEqual(components[3].name, 'transition-delay');
          assert.deepEqual(components[3].value, [['property-value', '0s']]);
        }
      },
      'only two `time`s': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'transition'],
              ['property-value', '1s'],
              ['property-value', '2s']
            ]
          ]);
        },
        'has transition-property': function (components) {
          assert.deepEqual(components[0].name, 'transition-property');
          assert.deepEqual(components[0].value, [['property-value', 'all']]);
        },
        'has transition-duration': function (components) {
          assert.deepEqual(components[1].name, 'transition-duration');
          assert.deepEqual(components[1].value, [['property-value', '1s']]);
        },
        'has transition-timing-function': function (components) {
          assert.deepEqual(components[2].name, 'transition-timing-function');
          assert.deepEqual(components[2].value, [['property-value', 'ease']]);
        },
        'has transition-delay': function (components) {
          assert.deepEqual(components[3].name, 'transition-delay');
          assert.deepEqual(components[3].value, [['property-value', '2s']]);
        }
      },
      'only timing function': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'transition'],
              ['property-value', 'ease-out']
            ]
          ]);
        },
        'has transition-property': function (components) {
          assert.deepEqual(components[0].name, 'transition-property');
          assert.deepEqual(components[0].value, [['property-value', 'all']]);
        },
        'has transition-duration': function (components) {
          assert.deepEqual(components[1].name, 'transition-duration');
          assert.deepEqual(components[1].value, [['property-value', '0s']]);
        },
        'has transition-timing-function': function (components) {
          assert.deepEqual(components[2].name, 'transition-timing-function');
          assert.deepEqual(components[2].value, [['property-value', 'ease-out']]);
        },
        'has transition-delay': function (components) {
          assert.deepEqual(components[3].name, 'transition-delay');
          assert.deepEqual(components[3].value, [['property-value', '0s']]);
        }
      },
      '`inherit`': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'transition'],
              ['property-value', 'inherit']
            ]
          ]);
        },
        'has transition-property': function (components) {
          assert.deepEqual(components[0].name, 'transition-property');
          assert.deepEqual(components[0].value, [['property-value', 'inherit']]);
        },
        'has transition-duration': function (components) {
          assert.deepEqual(components[1].name, 'transition-duration');
          assert.deepEqual(components[1].value, [['property-value', 'inherit']]);
        },
        'has transition-timing-function': function (components) {
          assert.deepEqual(components[2].name, 'transition-timing-function');
          assert.deepEqual(components[2].value, [['property-value', 'inherit']]);
        },
        'has transition-delay': function (components) {
          assert.deepEqual(components[3].name, 'transition-delay');
          assert.deepEqual(components[3].value, [['property-value', 'inherit']]);
        }
      },
      'multiplex': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'transition'],
              ['property-value', 'background-color'],
              ['property-value', '1s'],
              ['property-value', 'ease-in'],
              ['property-value', '1s'],
              ['property-value', ','],
              ['property-value', 'opacity'],
              ['property-value', '2s']
            ]
          ]);
        },
        'has transition-property': function (components) {
          assert.deepEqual(components[0].name, 'transition-property');
          assert.deepEqual(components[0].value, [['property-value', 'background-color'], ['property-value', ','], ['property-value', 'opacity']]);
        },
        'has transition-duration': function (components) {
          assert.deepEqual(components[1].name, 'transition-duration');
          assert.deepEqual(components[1].value, [['property-value', '1s'], ['property-value', ','], ['property-value', '2s']]);
        },
        'has transition-timing-function': function (components) {
          assert.deepEqual(components[2].name, 'transition-timing-function');
          assert.deepEqual(components[2].value, [['property-value', 'ease-in'], ['property-value', ','], ['property-value', 'ease']]);
        },
        'has transition-delay': function (components) {
          assert.deepEqual(components[3].name, 'transition-delay');
          assert.deepEqual(components[3].value, [['property-value', '1s'], ['property-value', ','], ['property-value', '0s']]);
        }
      },
      'three `time`s': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'transition'],
              ['property-value', '1s'],
              ['property-value', '2s'],
              ['property-value', '3s', [[1, 30, undefined]]]
            ]
          ]);
        },
        'has no components': function (components) {
          assert.lengthOf(components, 0);
        }
      },
      'extra value': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'transition'],
              ['property-value', 'all'],
              ['property-value', '1s'],
              ['property-value', 'ease-in'],
              ['property-value', '3s'],
              ['property-value', 'extra', [[1, 30, undefined]]]
            ]
          ]);
        },
        'has no components': function (components) {
          assert.lengthOf(components, 0);
        }
      },
      'mixed-in inherit': {
        'topic': function () {
          return _breakUp([
            [
              'property',
              ['property-name', 'transition'],
              ['property-value', 'all', [[1, 30, undefined]]],
              ['property-value', 'inherit']
            ]
          ]);
        },
        'has no components': function (components) {
          assert.lengthOf(components, 0);
        }
      }
    }
  })
  .export(module);
