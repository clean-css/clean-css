var vows = require('vows');
var assert = require('assert');

var wrapForOptimizing = require('../../lib/properties/wrap-for-optimizing').single;
var compactable = require('../../lib/properties/compactable');
var Compatibility = require('../../lib/utils/compatibility');
var Validator = require('../../lib/properties/validator');

var restore = require('../../lib/properties/restore');

function _breakUp(property) {
  var validator = new Validator(new Compatibility().toOptions());
  var descriptor = compactable[property[0][0]];
  var _property = wrapForOptimizing(property);
  _property.components = descriptor.breakUp(_property, compactable, validator);
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
          return _restore(_breakUp([['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['no-repeat'], ['padding-box']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['__ESCAPED_URL_CLEAN_CSS0__'], ['no-repeat'], ['padding-box']]);
        }
      },
      'background with some default values': {
        'topic': function () {
          return _restore(_breakUp([['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['repeat'], ['padding-box'], ['border-box']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['__ESCAPED_URL_CLEAN_CSS0__']]);
        }
      },
      'background with all default values': {
        'topic': function () {
          return _restore(_breakUp([['background'], ['transparent'], ['none'], ['repeat'], ['scroll'], ['0'], ['0'], ['padding-box'], ['border-box']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['0 0']]);
        }
      },
      'background with some double values': {
        'topic': function () {
          return _restore(_breakUp([['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['repeat'], ['no-repeat'], ['2px'], ['3px'], ['/'], ['auto'], ['padding-box']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['__ESCAPED_URL_CLEAN_CSS0__'], ['2px'], ['3px'], ['repeat'], ['no-repeat'], ['padding-box']]);
        }
      },
      'background with default background origin and background clip': {
        'topic': function () {
          return _restore(_breakUp([['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['padding-box'], ['border-box']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['__ESCAPED_URL_CLEAN_CSS0__']]);
        }
      },
      'background with same background origin and background clip': {
        'topic': function () {
          return _restore(_breakUp([['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['padding-box'], ['padding-box']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['__ESCAPED_URL_CLEAN_CSS0__'], ['padding-box']]);
        }
      },
      'background with default background position and background size': {
        'topic': function () {
          return _restore(_breakUp([['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['0'], ['0'], ['/'], ['50%'], ['25%']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['__ESCAPED_URL_CLEAN_CSS0__'], ['0'], ['0'], ['/'], ['50%'], ['25%']]);
        }
      },
      'background with default background position and single background size': {
        'topic': function () {
          return _restore(_breakUp([['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['0'], ['0'], ['/'], ['50%']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['__ESCAPED_URL_CLEAN_CSS0__'], ['0'], ['0'], ['/'], ['50%']]);
        }
      },
      'background with default background position and background size differing by 2nd value': {
        'topic': function () {
          return _restore(_breakUp([['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['0'], ['50px'], ['/'], ['0'], ['30px']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['__ESCAPED_URL_CLEAN_CSS0__'], ['0'], ['50px'], ['/'], ['0'], ['30px']]);
        }
      },
      'background 0 to background 0': {
        'topic': function () {
          return _restore(_breakUp([['background'], ['0']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['0']]);
        }
      },
      'background color in multiplex': {
        'topic': function () {
          return _restore(_breakUp([['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['blue'], [','], ['__ESCAPED_URL_CLEAN_CSS1__'], ['red']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['__ESCAPED_URL_CLEAN_CSS0__'], [','], ['__ESCAPED_URL_CLEAN_CSS1__'], ['red']]);
        }
      }
    },
    'border radius': {
      '4 values': {
        'topic': function () {
          return _restore(_breakUp([['border-radius'], ['0px'], ['1px'], ['2px'], ['3px']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['0px'], ['1px'], ['2px'], ['3px']]);
        }
      },
      '3 values': {
        'topic': function () {
          return _restore(_breakUp([['border-radius'], ['0px'], ['1px'], ['2px'], ['1px']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['0px'], ['1px'], ['2px']]);
        }
      },
      '2 values': {
        'topic': function () {
          return _restore(_breakUp([['border-radius'], ['0px'], ['1px'], ['0px'], ['1px']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['0px'], ['1px']]);
        }
      },
      '1 value': {
        'topic': function () {
          return _restore(_breakUp([['border-radius'], ['0px'], ['0px'], ['0px'], ['0px']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['0px']]);
        }
      },
      'horizontal + vertical - different values': {
        'topic': function () {
          return _restore(_breakUp([['border-radius'], ['0px'], ['1px'], ['2px'], ['3px'], ['/'], ['2px'], ['1px'], ['2px'], ['1px']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['0px'], ['1px'], ['2px'], ['3px'], ['/'], ['2px'], ['1px']]);
        }
      },
      'horizontal + vertical - same values': {
        'topic': function () {
          return _restore(_breakUp([['border-radius'], ['0px'], ['1px'], ['2px'], ['3px'], ['/'], ['0px'], ['1px'], ['2px'], ['3px']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['0px'], ['1px'], ['2px'], ['3px']]);
        }
      },
      'horizontal + vertical - asymetrical': {
        'topic': function () {
          return _restore(_breakUp([['border-radius'], ['0px'], ['1px'], ['2px'], ['3px'], ['/'], ['0px'], ['1px']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['0px'], ['1px'], ['2px'], ['3px'], ['/'], ['0px'], ['1px']]);
        }
      },
      'inherit': {
        'topic': function () {
          return _restore(_breakUp([['border'], ['inherit']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['inherit']]);
        }
      }
    },
    'four values': {
      '4 different': {
        'topic': function () {
          return _restore(_breakUp([['padding'], ['0px'], ['1px'], ['2px'], ['3px']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['0px'], ['1px'], ['2px'], ['3px']]);
        }
      },
      '3 different': {
        'topic': function () {
          return _restore(_breakUp([['padding'], ['0px'], ['1px'], ['2px'], ['1px']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['0px'], ['1px'], ['2px']]);
        }
      },
      '2 different': {
        'topic': function () {
          return _restore(_breakUp([['padding'], ['0px'], ['1px'], ['0px'], ['1px']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['0px'], ['1px']]);
        }
      },
      'all same': {
        'topic': function () {
          return _restore(_breakUp([['padding'], ['0px'], ['0px'], ['0px'], ['0px']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['0px']]);
        }
      }
    },
    'repeated values': {
      'background with some values': {
        'topic': function () {
          return _restore(_breakUp([['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['no-repeat'], ['padding-box'], [','], ['repeat'], ['red']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['__ESCAPED_URL_CLEAN_CSS0__'], ['no-repeat'], ['padding-box'], [','], ['red']]);
        }
      },
      'background with background origin and size': {
        'topic': function () {
          return _restore(_breakUp([['background'], ['no-repeat'], ['padding-box'], [','], ['repeat'], ['10px'], ['10px'], ['/'], ['auto'], ['red'], [','], ['top'], ['left'], ['/'], ['30%']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['no-repeat'], ['padding-box'], [','], ['10px'], ['10px'], [','], ['top'], ['left'], ['/'], ['30%']]);
        }
      }
    },
    'without defaults': {
      'border with some values': {
        'topic': function () {
          return _restore(_breakUp([['border'], ['solid']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['solid']]);
        }
      },
      'border with all values': {
        'topic': function () {
          return _restore(_breakUp([['border'], ['1px'], ['solid'], ['red']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['1px'], ['solid'], ['red']]);
        }
      },
      'border with all defaults': {
        'topic': function () {
          return _restore(_breakUp([['border'], ['medium'], ['none'], ['none']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['none']]);
        }
      },
      'list with some values': {
        'topic': function () {
          return _restore(_breakUp([['list-style'], ['circle']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['circle']]);
        }
      },
      'list with all values': {
        'topic': function () {
          return _restore(_breakUp([['list-style'], ['circle'], ['inside'], ['__ESCAPED_URL_CLEAN_CSS1__']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['circle'], ['inside'], ['__ESCAPED_URL_CLEAN_CSS1__']]);
        }
      },
      'list with some defaults': {
        'topic': function () {
          return _restore(_breakUp([['list-style'], ['circle'], ['outside'], ['__ESCAPED_URL_CLEAN_CSS0__']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['circle'], ['__ESCAPED_URL_CLEAN_CSS0__']]);
        }
      },
      'outline with some values': {
        'topic': function () {
          return _restore(_breakUp([['outline'], ['dotted']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['dotted']]);
        }
      },
      'outline with all values': {
        'topic': function () {
          return _restore(_breakUp([['outline'], ['#fff'], ['dotted'], ['1px']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['#fff'], ['dotted'], ['1px']]);
        }
      },
      'outline with all defaults': {
        'topic': function () {
          return _restore(_breakUp([['outline'], ['invert'], ['none'], ['medium']]));
        },
        'gives right value back': function (restoredValue) {
          assert.deepEqual(restoredValue, [['0']]);
        }
      }
    }
  })
  .export(module);
