var vows = require('vows');
var assert = require('assert');

var wrapForOptimizing = require('../../lib/properties/wrap-for-optimizing').all;
var populateComponents = require('../../lib/properties/populate-components');
var Validator = require('../../lib/properties/validator');
var Compatibility = require('../../lib/utils/compatibility');

var breakUp = require('../../lib/properties/break-up');

function _breakUp(properties) {
  var validator = new Validator(new Compatibility().toOptions());
  var wrapped = wrapForOptimizing(properties);
  populateComponents(wrapped, validator, []);

  return wrapped[0].components;
}

vows.describe(breakUp)
  .addBatch({
    'background': {
      'inherit': {
        'topic': function () {
          return _breakUp([[['background'], ['inherit']]]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has background-image': function (components) {
          assert.deepEqual(components[0].name, 'background-image');
          assert.deepEqual(components[0].value, [['inherit']]);
        },
        'has background-position': function (components) {
          assert.deepEqual(components[1].name, 'background-position');
          assert.deepEqual(components[1].value, [['inherit']]);
        },
        'has background-size': function (components) {
          assert.deepEqual(components[2].name, 'background-size');
          assert.deepEqual(components[2].value, [['inherit']]);
        },
        'has background-repeat': function (components) {
          assert.deepEqual(components[3].name, 'background-repeat');
          assert.deepEqual(components[3].value, [['inherit']]);
        },
        'has background-attachment': function (components) {
          assert.deepEqual(components[4].name, 'background-attachment');
          assert.deepEqual(components[4].value, [['scroll']]);
        },
        'has background-origin': function (components) {
          assert.deepEqual(components[5].name, 'background-origin');
          assert.deepEqual(components[5].value, [['inherit']]);
        },
        'has background-clip': function (components) {
          assert.deepEqual(components[6].name, 'background-clip');
          assert.deepEqual(components[6].value, [['inherit']]);
        },
        'has background-color': function (components) {
          assert.deepEqual(components[7].name, 'background-color');
          assert.deepEqual(components[7].value, [['inherit']]);
        }
      },
      'all': {
        'topic': function () {
          return _breakUp([[['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['repeat'], ['no-repeat'], ['2px'], ['3px'], ['/'], ['50%'], ['60%'], ['fixed'], ['padding-box'], ['border-box'], ['red']]]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has background-image': function (components) {
          assert.deepEqual(components[0].name, 'background-image');
          assert.deepEqual(components[0].value, [['__ESCAPED_URL_CLEAN_CSS0__']]);
        },
        'has background-position': function (components) {
          assert.deepEqual(components[1].name, 'background-position');
          assert.deepEqual(components[1].value, [['2px'], ['3px']]);
        },
        'has background-size': function (components) {
          assert.deepEqual(components[2].name, 'background-size');
          assert.deepEqual(components[2].value, [['50%'], ['60%']]);
        },
        'has background-repeat': function (components) {
          assert.deepEqual(components[3].name, 'background-repeat');
          assert.deepEqual(components[3].value, [['repeat'], ['no-repeat']]);
        },
        'has background-attachment': function (components) {
          assert.deepEqual(components[4].name, 'background-attachment');
          assert.deepEqual(components[4].value, [['fixed']]);
        },
        'has background-origin': function (components) {
          assert.deepEqual(components[5].name, 'background-origin');
          assert.deepEqual(components[5].value, [['padding-box']]);
        },
        'has background-clip': function (components) {
          assert.deepEqual(components[6].name, 'background-clip');
          assert.deepEqual(components[6].value, [['border-box']]);
        },
        'has background-color': function (components) {
          assert.deepEqual(components[7].name, 'background-color');
          assert.deepEqual(components[7].value, [['red']]);
        }
      },
      'no size': {
        'topic': function () {
          return _breakUp([[['background'], ['bottom']]]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has background-position': function (components) {
          assert.deepEqual(components[1].name, 'background-position');
          assert.deepEqual(components[1].value, [['bottom']]);
        },
        'has background-size': function (components) {
          assert.deepEqual(components[2].name, 'background-size');
          assert.deepEqual(components[2].value, [['auto']]);
        }
      },
      'shorthand size & position': {
        'topic': function () {
          return _breakUp([[['background'], ['2px'], ['/'], ['50px']]]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has background-position': function (components) {
          assert.deepEqual(components[1].name, 'background-position');
          assert.deepEqual(components[1].value, [['2px']]);
        },
        'has background-size': function (components) {
          assert.deepEqual(components[2].name, 'background-size');
          assert.deepEqual(components[2].value, [['50px']]);
        }
      },
      'size & position joined together': {
        'topic': function () {
          return _breakUp([[['background'], ['2px/50px']]]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has background-position': function (components) {
          assert.deepEqual(components[1].name, 'background-position');
          assert.deepEqual(components[1].value, [['2px']]);
        },
        'has background-size': function (components) {
          assert.deepEqual(components[2].name, 'background-size');
          assert.deepEqual(components[2].value, [['50px']]);
        }
      },
      'size & position joined together with 4 values': {
        'topic': function () {
          return _breakUp([[['background'], ['5px'], ['2px/50px'], ['30px']]]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has background-position': function (components) {
          assert.deepEqual(components[1].name, 'background-position');
          assert.deepEqual(components[1].value, [['5px'], ['2px']]);
        },
        'has background-size': function (components) {
          assert.deepEqual(components[2].name, 'background-size');
          assert.deepEqual(components[2].value, [['50px'], ['30px']]);
        }
      },
      'clip to origin': {
        'topic': function () {
          return _breakUp([[['background'], ['padding-box']]]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has background-origin': function (components) {
          assert.deepEqual(components[5].name, 'background-origin');
          assert.deepEqual(components[5].value, [['padding-box']]);
        },
        'has background-clip': function (components) {
          assert.deepEqual(components[6].name, 'background-clip');
          assert.deepEqual(components[6].value, [['padding-box']]);
        }
      }
    },
    'border': {
      'inherit': {
        'topic': function () {
          return _breakUp([[['border'], ['inherit']]]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has border-width': function (components) {
          assert.deepEqual(components[0].name, 'border-width');
          assert.deepEqual(components[0].value, [['inherit']]);
        },
        'has border-style': function (components) {
          assert.deepEqual(components[1].name, 'border-style');
          assert.deepEqual(components[1].value, [['inherit']]);
        },
        'has border-color': function (components) {
          assert.deepEqual(components[2].name, 'border-color');
          assert.deepEqual(components[2].value, [['inherit']]);
        }
      },
      '3 inherits': {
        'topic': function () {
          return _breakUp([[['border'], ['inherit'], ['inherit'], ['inherit']]]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has border-width': function (components) {
          assert.deepEqual(components[0].name, 'border-width');
          assert.deepEqual(components[0].value, [['inherit']]);
        },
        'has border-style': function (components) {
          assert.deepEqual(components[1].name, 'border-style');
          assert.deepEqual(components[1].value, [['inherit']]);
        },
        'has border-color': function (components) {
          assert.deepEqual(components[2].name, 'border-color');
          assert.deepEqual(components[2].value, [['inherit']]);
        }
      },
      'all values in correct order': {
        'topic': function () {
          return _breakUp([[['border'], ['1px'], ['solid'], ['red']]]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has border-width': function (components) {
          assert.deepEqual(components[0].name, 'border-width');
          assert.deepEqual(components[0].value, [['1px']]);
        },
        'has border-style': function (components) {
          assert.deepEqual(components[1].name, 'border-style');
          assert.deepEqual(components[1].value, [['solid']]);
        },
        'has border-color': function (components) {
          assert.deepEqual(components[2].name, 'border-color');
          assert.deepEqual(components[2].value, [['red']]);
        }
      },
      'all values in wrong order': {
        'topic': function () {
          return _breakUp([[['border'], ['red'], ['solid'], ['1px']]]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has border-width': function (components) {
          assert.deepEqual(components[0].name, 'border-width');
          assert.deepEqual(components[0].value, [['1px']]);
        },
        'has border-style': function (components) {
          assert.deepEqual(components[1].name, 'border-style');
          assert.deepEqual(components[1].value, [['solid']]);
        },
        'has border-color': function (components) {
          assert.deepEqual(components[2].name, 'border-color');
          assert.deepEqual(components[2].value, [['red']]);
        }
      },
      'missing values': {
        'topic': function () {
          return _breakUp([[['border'], ['red']]]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has border-width': function (components) {
          assert.deepEqual(components[0].name, 'border-width');
          assert.deepEqual(components[0].value, [['medium']]);
        },
        'has border-style': function (components) {
          assert.deepEqual(components[1].name, 'border-style');
          assert.deepEqual(components[1].value, [['none']]);
        },
        'has border-color': function (components) {
          assert.deepEqual(components[2].name, 'border-color');
          assert.deepEqual(components[2].value, [['red']]);
        }
      },
      'missing width': {
        'topic': function () {
          return _breakUp([[['border'], ['solid'], ['rgba(0,0,0,0)']]]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has border-width': function (components) {
          assert.deepEqual(components[0].name, 'border-width');
          assert.deepEqual(components[0].value, [['medium']]);
        },
        'has border-style': function (components) {
          assert.deepEqual(components[1].name, 'border-style');
          assert.deepEqual(components[1].value, [['solid']]);
        },
        'has border-color': function (components) {
          assert.deepEqual(components[2].name, 'border-color');
          assert.deepEqual(components[2].value, [['rgba(0,0,0,0)']]);
        }
      }
    },
    'border radius': {
      'no horizontal vertical split': {
        'topic': function () {
          return _breakUp([[['border-radius'], ['0px'], ['1px'], ['2px'], ['3px']]]);
        },
        'has 4 components': function (components) {
          assert.lengthOf(components, 4);
        },
        'has border-top-left-radius': function (components) {
          assert.equal(components[0].name, 'border-top-left-radius');
          assert.deepEqual(components[0].value, [['0px'], ['0px']]);
        },
        'has border-top-right-radius': function (components) {
          assert.equal(components[1].name, 'border-top-right-radius');
          assert.deepEqual(components[1].value, [['1px'], ['1px']]);
        },
        'has border-bottom-right-radius': function (components) {
          assert.equal(components[2].name, 'border-bottom-right-radius');
          assert.deepEqual(components[2].value, [['2px'], ['2px']]);
        },
        'has border-bottom-left': function (components) {
          assert.equal(components[3].name, 'border-bottom-left-radius');
          assert.deepEqual(components[3].value, [['3px'], ['3px']]);
        }
      },
      'horizontal vertical split': {
        'topic': function () {
          return _breakUp([[['border-radius'], ['0px'], ['1px'], ['2px'], ['3px'], ['/'], ['1px'], ['2px'], ['3px'], ['4px']]]);
        },
        'has 4 components': function (components) {
          assert.lengthOf(components, 4);
        },
        'has border-top-left-radius': function (components) {
          assert.equal(components[0].name, 'border-top-left-radius');
          assert.deepEqual(components[0].value, [['0px'], ['1px']]);
        },
        'has border-top-right-radius': function (components) {
          assert.equal(components[1].name, 'border-top-right-radius');
          assert.deepEqual(components[1].value, [['1px'], ['2px']]);
        },
        'has border-bottom-right-radius': function (components) {
          assert.equal(components[2].name, 'border-bottom-right-radius');
          assert.deepEqual(components[2].value, [['2px'], ['3px']]);
        },
        'has border-bottom-left': function (components) {
          assert.equal(components[3].name, 'border-bottom-left-radius');
          assert.deepEqual(components[3].value, [['3px'], ['4px']]);
        }
      },
      'vendor prefix asymmetrical horizontal vertical split': {
        'topic': function () {
          return _breakUp([[['-webkit-border-radius'], ['0px'], ['1px'], ['2px'], ['/'], ['1px'], ['4px']]]);
        },
        'has 4 components': function (components) {
          assert.lengthOf(components, 4);
        },
        'has border-top-left-radius': function (components) {
          assert.equal(components[0].name, '-webkit-border-top-left-radius');
          assert.deepEqual(components[0].value, [['0px'], ['1px']]);
        },
        'has border-top-right-radius': function (components) {
          assert.equal(components[1].name, '-webkit-border-top-right-radius');
          assert.deepEqual(components[1].value, [['1px'], ['4px']]);
        },
        'has border-bottom-right-radius': function (components) {
          assert.equal(components[2].name, '-webkit-border-bottom-right-radius');
          assert.deepEqual(components[2].value, [['2px'], ['1px']]);
        },
        'has border-bottom-left': function (components) {
          assert.equal(components[3].name, '-webkit-border-bottom-left-radius');
          assert.deepEqual(components[3].value, [['1px'], ['4px']]);
        }
      },
      'with missing vertical value': {
        'topic': function () {
          return _breakUp([[['border-radius'], ['0px'], ['/']]]);
        },
        'has no components': function (components) {
          assert.lengthOf(components, 0);
        }
      },
      'with missing horizontal value': {
        'topic': function () {
          return _breakUp([[['border-radius'], ['/'], ['0px']]]);
        },
        'has no components': function (components) {
          assert.lengthOf(components, 0);
        }
      }
    },
    'four values': {
      'four given': {
        'topic': function () {
          return _breakUp([[['margin'], ['0px'], ['1px'], ['2px'], ['3px']]]);
        },
        'has 4 components': function (components) {
          assert.lengthOf(components, 4);
        },
        'has margin-top': function (components) {
          assert.equal(components[0].name, 'margin-top');
          assert.deepEqual(components[0].value, [['0px']]);
        },
        'has margin-right': function (components) {
          assert.equal(components[1].name, 'margin-right');
          assert.deepEqual(components[1].value, [['1px']]);
        },
        'has margin-bottom': function (components) {
          assert.equal(components[2].name, 'margin-bottom');
          assert.deepEqual(components[2].value, [['2px']]);
        },
        'has margin-left': function (components) {
          assert.equal(components[3].name, 'margin-left');
          assert.deepEqual(components[3].value, [['3px']]);
        }
      },
      'three given': {
        'topic': function () {
          return _breakUp([[['padding'], ['0px'], ['1px'], ['2px']]]);
        },
        'has 4 components': function (components) {
          assert.lengthOf(components, 4);
        },
        'has padding-top': function (components) {
          assert.equal(components[0].name, 'padding-top');
          assert.deepEqual(components[0].value, [['0px']]);
        },
        'has padding-right': function (components) {
          assert.equal(components[1].name, 'padding-right');
          assert.deepEqual(components[1].value, [['1px']]);
        },
        'has padding-bottom': function (components) {
          assert.equal(components[2].name, 'padding-bottom');
          assert.deepEqual(components[2].value, [['2px']]);
        },
        'has padding-left': function (components) {
          assert.equal(components[3].name, 'padding-left');
          assert.deepEqual(components[3].value, [['1px']]);
        }
      },
      'two given': {
        'topic': function () {
          return _breakUp([[['border-color'], ['red'], ['blue']]]);
        },
        'has 4 components': function (components) {
          assert.lengthOf(components, 4);
        },
        'has border-top-color': function (components) {
          assert.equal(components[0].name, 'border-top-color');
          assert.deepEqual(components[0].value, [['red']]);
        },
        'has border-right-color': function (components) {
          assert.equal(components[1].name, 'border-right-color');
          assert.deepEqual(components[1].value, [['blue']]);
        },
        'has border-bottom-color': function (components) {
          assert.equal(components[2].name, 'border-bottom-color');
          assert.deepEqual(components[2].value, [['red']]);
        },
        'has border-left-color': function (components) {
          assert.equal(components[3].name, 'border-left-color');
          assert.deepEqual(components[3].value, [['blue']]);
        }
      },
      'one given': {
        'topic': function () {
          return _breakUp([[['border-style'], ['solid']]]);
        },
        'has 4 components': function (components) {
          assert.lengthOf(components, 4);
        },
        'has border-top-style': function (components) {
          assert.equal(components[0].name, 'border-top-style');
          assert.deepEqual(components[0].value, [['solid']]);
        },
        'has border-right-style': function (components) {
          assert.equal(components[1].name, 'border-right-style');
          assert.deepEqual(components[1].value, [['solid']]);
        },
        'has border-bottom-style': function (components) {
          assert.equal(components[2].name, 'border-bottom-style');
          assert.deepEqual(components[2].value, [['solid']]);
        },
        'has border-left-style': function (components) {
          assert.equal(components[3].name, 'border-left-style');
          assert.deepEqual(components[3].value, [['solid']]);
        }
      },
      'none given': {
        'topic': function () {
          return _breakUp([[['border-style']]]);
        },
        'has 0 components': function (components) {
          assert.lengthOf(components, 0);
        }
      }
    },
    'list style': {
      'inherit': {
        'topic': function () {
          return _breakUp([[['list-style'], ['inherit']]]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has border-top-style': function (components) {
          assert.equal(components[0].name, 'list-style-type');
          assert.deepEqual(components[0].value, [['inherit']]);
        },
        'has border-right-style': function (components) {
          assert.equal(components[1].name, 'list-style-position');
          assert.deepEqual(components[1].value, [['inherit']]);
        },
        'has border-bottom-style': function (components) {
          assert.equal(components[2].name, 'list-style-image');
          assert.deepEqual(components[2].value, [['inherit']]);
        }
      },
      'all values': {
        'topic': function () {
          return _breakUp([[['list-style'], ['circle'], ['inside'], ['__ESCAPED_URL_CLEAN_CSS0__']]]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has border-top-style': function (components) {
          assert.equal(components[0].name, 'list-style-type');
          assert.deepEqual(components[0].value, [['circle']]);
        },
        'has border-right-style': function (components) {
          assert.equal(components[1].name, 'list-style-position');
          assert.deepEqual(components[1].value, [['inside']]);
        },
        'has border-bottom-style': function (components) {
          assert.equal(components[2].name, 'list-style-image');
          assert.deepEqual(components[2].value, [['__ESCAPED_URL_CLEAN_CSS0__']]);
        }
      },
      'some missing': {
        'topic': function () {
          return _breakUp([[['list-style'], ['inside']]]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has border-top-style': function (components) {
          assert.equal(components[0].name, 'list-style-type');
          assert.deepEqual(components[0].value, [['__hack']]);
        },
        'has border-right-style': function (components) {
          assert.equal(components[1].name, 'list-style-position');
          assert.deepEqual(components[1].value, [['inside']]);
        },
        'has border-bottom-style': function (components) {
          assert.equal(components[2].name, 'list-style-image');
          assert.deepEqual(components[2].value, [['none']]);
        }
      },
      'fuzzy matching': {
        'topic': function () {
          return _breakUp([[['list-style'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['outside'], ['none']]]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has list-style-type': function (components) {
          assert.equal(components[0].name, 'list-style-type');
          assert.deepEqual(components[0].value, [['none']]);
        },
        'has list-style-position': function (components) {
          assert.equal(components[1].name, 'list-style-position');
          assert.deepEqual(components[1].value, [['outside']]);
        },
        'has list-style-image': function (components) {
          assert.equal(components[2].name, 'list-style-image');
          assert.deepEqual(components[2].value, [['__ESCAPED_URL_CLEAN_CSS0__']]);
        }
      }
    },
    'multiple values': {
      'background': {
        'topic': function () {
          return _breakUp([[['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['#fff'], [','], ['url(image2.png)'], ['repeat'], ['no-repeat'], ['2px'], ['3px'], ['/'], ['50%'], ['60%'], ['fixed'], ['content-box'], ['content-box'], ['red']]]);
        },
        'has 8 components': function (components) {
          assert.lengthOf(components, 8);
        },
        'has background-image': function (components) {
          assert.deepEqual(components[0].name, 'background-image');
          assert.deepEqual(components[0].value, [['__ESCAPED_URL_CLEAN_CSS0__'], [','], ['url(image2.png)']]);
          assert.isTrue(components[0].multiplex);
        },
        'has background-position': function (components) {
          assert.deepEqual(components[1].name, 'background-position');
          assert.deepEqual(components[1].value, [['0'], ['0'], [','], ['2px'], ['3px']]);
          assert.isTrue(components[0].multiplex);
        },
        'has background-size': function (components) {
          assert.deepEqual(components[2].name, 'background-size');
          assert.deepEqual(components[2].value, [['auto'], [','], ['50%'], ['60%']]);
          assert.isTrue(components[0].multiplex);
        },
        'has background-repeat': function (components) {
          assert.deepEqual(components[3].name, 'background-repeat');
          assert.deepEqual(components[3].value, [['repeat'], [','], ['repeat'], ['no-repeat']]);
          assert.isTrue(components[0].multiplex);
        },
        'has background-attachment': function (components) {
          assert.deepEqual(components[4].name, 'background-attachment');
          assert.deepEqual(components[4].value, [['scroll'], [','], ['fixed']]);
          assert.isTrue(components[0].multiplex);
        },
        'has background-origin': function (components) {
          assert.deepEqual(components[5].name, 'background-origin');
          assert.deepEqual(components[5].value, [['padding-box'], [','], ['content-box']]);
          assert.isTrue(components[0].multiplex);
        },
        'has background-clip': function (components) {
          assert.deepEqual(components[6].name, 'background-clip');
          assert.deepEqual(components[6].value, [['border-box'], [','], ['content-box']]);
          assert.isTrue(components[0].multiplex);
        },
        'has background-color': function (components) {
          assert.deepEqual(components[7].name, 'background-color');
          assert.deepEqual(components[7].value, [['#fff'], [','], ['red']]);
          assert.isTrue(components[0].multiplex);
        }
      },
      'background - clip & origin': {
        'topic': function () {
          return _breakUp([[['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['no-repeat'], ['padding-box'], [','], ['repeat'], ['red']]]);
        },
        'has background-origin': function (components) {
          assert.deepEqual(components[5].value, [['padding-box'], [','], ['padding-box']]);
        },
        'has background-clip': function (components) {
          assert.deepEqual(components[6].value, [['padding-box'], [','], ['border-box']]);
        }
      }
    },
    'outline': {
      'inherit': {
        'topic': function () {
          return _breakUp([[['outline'], ['inherit']]]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has outline-color': function (components) {
          assert.deepEqual(components[0].name, 'outline-color');
          assert.deepEqual(components[0].value, [['inherit']]);
        },
        'has outline-style': function (components) {
          assert.deepEqual(components[1].name, 'outline-style');
          assert.deepEqual(components[1].value, [['inherit']]);
        },
        'has outline-width': function (components) {
          assert.deepEqual(components[2].name, 'outline-width');
          assert.deepEqual(components[2].value, [['inherit']]);
        }
      },
      '3 inherits': {
        'topic': function () {
          return _breakUp([[['outline'], ['inherit'], ['inherit'], ['inherit']]]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has outline-color': function (components) {
          assert.deepEqual(components[0].name, 'outline-color');
          assert.deepEqual(components[0].value, [['inherit']]);
        },
        'has outline-style': function (components) {
          assert.deepEqual(components[1].name, 'outline-style');
          assert.deepEqual(components[1].value, [['inherit']]);
        },
        'has outline-width': function (components) {
          assert.deepEqual(components[2].name, 'outline-width');
          assert.deepEqual(components[2].value, [['inherit']]);
        }
      },
      'all values in correct order': {
        'topic': function () {
          return _breakUp([[['outline'], ['red'], ['solid'], ['1px']]]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has outline-color': function (components) {
          assert.deepEqual(components[0].name, 'outline-color');
          assert.deepEqual(components[0].value, [['red']]);
        },
        'has outline-style': function (components) {
          assert.deepEqual(components[1].name, 'outline-style');
          assert.deepEqual(components[1].value, [['solid']]);
        },
        'has outline-width': function (components) {
          assert.deepEqual(components[2].name, 'outline-width');
          assert.deepEqual(components[2].value, [['1px']]);
        }
      },
      'all values in wrong order': {
        'topic': function () {
          return _breakUp([[['outline'], ['1px'], ['dotted'], ['#fff']]]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has outline-color': function (components) {
          assert.deepEqual(components[0].name, 'outline-color');
          assert.deepEqual(components[0].value, [['#fff']]);
        },
        'has outline-style': function (components) {
          assert.deepEqual(components[1].name, 'outline-style');
          assert.deepEqual(components[1].value, [['dotted']]);
        },
        'has outline-width': function (components) {
          assert.deepEqual(components[2].name, 'outline-width');
          assert.deepEqual(components[2].value, [['1px']]);
        }
      },
      'with auto style': {
        'topic': function () {
          return _breakUp([[['outline'], ['#fff'], ['auto'], ['1px']]]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has outline-color': function (components) {
          assert.deepEqual(components[0].name, 'outline-color');
          assert.deepEqual(components[0].value, [['#fff']]);
        },
        'has outline-style': function (components) {
          assert.deepEqual(components[1].name, 'outline-style');
          assert.deepEqual(components[1].value, [['auto']]);
        },
        'has outline-width': function (components) {
          assert.deepEqual(components[2].name, 'outline-width');
          assert.deepEqual(components[2].value, [['1px']]);
        }
      },
      'missing values': {
        'topic': function () {
          return _breakUp([[['outline'], ['solid']]]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has outline-color': function (components) {
          assert.deepEqual(components[0].name, 'outline-color');
          assert.deepEqual(components[0].value, [['invert']]);
        },
        'has outline-style': function (components) {
          assert.deepEqual(components[1].name, 'outline-style');
          assert.deepEqual(components[1].value, [['solid']]);
        },
        'has outline-width': function (components) {
          assert.deepEqual(components[2].name, 'outline-width');
          assert.deepEqual(components[2].value, [['medium']]);
        }
      },
      'default values': {
        'topic': function () {
          return _breakUp([[['outline'], ['invert'], ['none'], ['medium']]]);
        },
        'has 3 components': function (components) {
          assert.lengthOf(components, 3);
        },
        'has outline-color': function (components) {
          assert.deepEqual(components[0].name, 'outline-color');
          assert.deepEqual(components[0].value, [['invert']]);
        },
        'has outline-style': function (components) {
          assert.deepEqual(components[1].name, 'outline-style');
          assert.deepEqual(components[1].value, [['none']]);
        },
        'has outline-width': function (components) {
          assert.deepEqual(components[2].name, 'outline-width');
          assert.deepEqual(components[2].value, [['medium']]);
        }
      }
    }
  })
  .export(module);
