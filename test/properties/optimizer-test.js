var vows = require('vows');
var assert = require('assert');

var optimize = require('../../lib/properties/optimizer');

var tokenize = require('../../lib/tokenizer/tokenize');
var SourceTracker = require('../../lib/utils/source-tracker');
var Compatibility = require('../../lib/utils/compatibility');
var Validator = require('../../lib/properties/validator');

function _optimize(source, mergeAdjacent, aggressiveMerging, compatibilityOptions) {
  var compatibility = new Compatibility(compatibilityOptions).toOptions();
  var validator = new Validator(compatibility);

  var tokens = tokenize(source, {
    options: {},
    sourceTracker: new SourceTracker(),
    warnings: []
  });

  optimize(tokens[0][1], tokens[0][2], mergeAdjacent, true, { compatibility: compatibility, aggressiveMerging: aggressiveMerging }, { validator: validator });

  return tokens[0][2];
}

vows.describe(optimize)
  .addBatch({
    'of two adjacent properties': {
      'topic': 'a{display:-moz-inline-box;display:inline-block}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['display'], ['-moz-inline-box']],
          [['display'], ['inline-block']]
        ]);
      }
    },
    'of two properties ': {
      'topic': 'a{display:inline-block;color:red;display:block}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['color'], ['red']],
          [['display'], ['block']]
        ]);
      }
    },
    'of two same properties with same value where latter is a hack': {
      'topic': 'a{margin:0;_margin:0}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['margin'], ['0']],
          [['_margin'], ['0']]
        ]);
      }
    },
    'of two same properties with same value where latter is !important': {
      'topic': 'a{margin:0;margin:0 !important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['margin'], ['0']],
          [['margin'], ['0!important']]
        ]);
      }
    },
    'of two properties where former is !important': {
      'topic': 'a{display:inline-block!important;color:red;display:block}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['display'], ['inline-block!important']],
          [['color'], ['red']]
        ]);
      }
    },
    'of two properties  where latter is !important': {
      'topic': 'a{display:inline-block;color:red;display:block!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['color'], ['red']],
          [['display'], ['block!important']]
        ]);
      }
    },
    'of two properties  where both are !important': {
      'topic': 'a{display:inline-block!important;color:red;display:block!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['color'], ['red']],
          [['display'], ['block!important']]
        ]);
      }
    },
    'of many properties': {
      'topic': 'a{display:inline-block;color:red;font-weight:bolder;font-weight:700;display:block!important;color:#fff}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['font-weight'], ['bolder']],
          [['font-weight'], ['700']],
          [['display'], ['block!important']],
          [['color'], ['#fff']]
        ]);
      }
    },
    'both redefined': {
      'topic': 'p{display:block;display:-moz-inline-box;color:red;display:table-cell}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['color'], ['red']],
          [['display'], ['table-cell']]
        ]);
      }
    },
    'filter treated as background': {
      'topic': 'p{background:-moz-linear-gradient();background:-webkit-linear-gradient();filter:"progid:DXImageTransform";background:linear-gradient()}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['background'], ['-moz-linear-gradient()']],
          [['background'], ['-webkit-linear-gradient()']],
          [['filter'], ['"progid:DXImageTransform"']],
          [['background'], ['linear-gradient()']]
        ]);
      }
    },
    'filter treated as background-image': {
      'topic': 'p{background-image:-moz-linear-gradient();background-image:-webkit-linear-gradient();filter:"progid:DXImageTransform";background-image:linear-gradient()}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['background-image'], ['-moz-linear-gradient()']],
          [['background-image'], ['-webkit-linear-gradient()']],
          [['filter'], ['"progid:DXImageTransform"']],
          [['background-image'], ['linear-gradient()']]
        ]);
      }
    },
    '-ms-filter treated as background': {
      'topic': 'p{background:-moz-linear-gradient();background:-webkit-linear-gradient();-ms-filter:"progid:DXImageTransform";background:linear-gradient()}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['background'], ['-moz-linear-gradient()']],
          [['background'], ['-webkit-linear-gradient()']],
          [['-ms-filter'], ['"progid:DXImageTransform"']],
          [['background'], ['linear-gradient()']]
        ]);
      }
    },
    '-ms-filter treated as background-image': {
      'topic': 'p{background-image:-moz-linear-gradient();background-image:-webkit-linear-gradient();-ms-filter:"progid:DXImageTransform";background-image:linear-gradient()}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['background-image'], ['-moz-linear-gradient()']],
          [['background-image'], ['-webkit-linear-gradient()']],
          [['-ms-filter'], ['"progid:DXImageTransform"']],
          [['background-image'], ['linear-gradient()']]
        ]);
      }
    },
    'longhand then shorthand': {
      'topic': 'p{border-left-style:solid;border:1px dotted red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['border'], ['1px'], ['dotted'], ['red']]
        ]);
      }
    },
    'longhand then shorthand with important': {
      'topic': 'p{border-left-style:solid!important;border:1px dotted red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['border-left-style'], ['solid!important']],
          [['border'], ['1px'], ['dotted'], ['red']]
        ]);
      }
    },
    'shorthand then longhand': {
      'topic': 'p{background:url(image.png);background-image:#fff}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['background'], ['url(image.png)']],
          [['background-image'], ['#fff']]
        ]);
      }
    }
  })
  .addBatch({
    'list-style fuzzy matching': {
      'topic': 'p{list-style:inside none}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['list-style'], ['none'], ['inside']]
        ]);
      }
    }
  })
  .addBatch({
    'ie hacks - normal before hack': {
      'topic': 'p{color:red;display:none;color:#fff\\9}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['color'], ['red']],
          [['display'], ['none']],
          [['color'], ['#fff\\9']]
        ]);
      }
    },
    'ie hacks - normal after hack': {
      'topic': 'p{color:red\\9;display:none;color:#fff}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['color'], ['red\\9']],
          [['display'], ['none']],
          [['color'], ['#fff']]
        ]);
      }
    },
    'ie hacks - hack after hack': {
      'topic': 'p{color:red\\9;display:none;color:#fff\\9}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['display'], ['none']],
          [['color'], ['#fff\\9']]
        ]);
      }
    }
  })
  .addBatch({
    'mergeAdjacent is true': {
      'topic': 'p{display:block;display:inline-block}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, true, true), [
          [['display'], ['inline-block']]
        ]);
      }
    },
    'mergeAdjacent is false': {
      'topic': 'p{display:block;display:inline-block}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['display'], ['block']],
          [['display'], ['inline-block']]
        ]);
      }
    },
    'mergeAdjacent is an array with irrelevant join positions': {
      'topic': 'p{display:block;display:inline-block;color:red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, [2], true), [
          [['display'], ['block']],
          [['display'], ['inline-block']],
          [['color'], ['red']]
        ]);
      }
    },
    'mergeAdjacent is an array with relevant join positions': {
      'topic': 'p{display:block;display:inline-block;color:red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, [1], true), [
          [['display'], ['inline-block']],
          [['color'], ['red']]
        ]);
      }
    }
  })
  .addBatch({
    'aggressive off - (yet) not overriddable': {
      'topic': 'a{display:inline-block;color:red;display:-moz-block}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false), [
          [['display'], ['inline-block']],
          [['color'], ['red']],
          [['display'], ['-moz-block']]
        ]);
      }
    }
  })
  .addBatch({
    'understandable - 2 properties, both !important, 2nd less understandable': {
      'topic': 'a{color:red!important;display:block;color:rgba(0,255,0,.5)!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['color'], ['red!important']],
          [['display'], ['block']],
          [['color'], ['rgba(0,255,0,.5)!important']]
        ]);
      }
    },
    'understandable - 2 properties, both !important, 2nd more understandable': {
      'topic': 'a{color:rgba(0,255,0,.5)!important;display:block;color:red!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['display'], ['block']],
          [['color'], ['red!important']]
        ]);
      }
    },
    'understandable - 2 adjacent properties, both !important, 2nd less understandable': {
      'topic': 'a{background:red!important;background:rgba(0,255,0,.5)!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['background'], ['red!important']],
          [['background'], ['rgba(0,255,0,.5)!important']]
        ]);
      }
    },
    'understandable - 2 adjacent properties, both !important, 2nd more understandable': {
      'topic': 'a{background:rgba(0,255,0,.5)!important;background:red!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['background'], ['rgba(0,255,0,.5)!important']],
          [['background'], ['red!important']]
        ]);
      }
    },
    'understandable - 2 adjacent -ms-transform with different values': {
      'topic': 'div{-ms-transform:translate(0,0);-ms-transform:translate3d(0,0,0)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['-ms-transform'], ['translate(0,0)']],
          [['-ms-transform'], ['translate3d(0,0,0)']]
        ]);
      }
    },
    'understandable - 2 non-adjacent -ms-transform with different values': {
      'topic': 'div{-ms-transform:translate(0,0);-webkit-transform:translate3d(0,0,0);-ms-transform:translate3d(0,0,0)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['-ms-transform'], ['translate(0,0)']],
          [['-webkit-transform'], ['translate3d(0,0,0)']],
          [['-ms-transform'], ['translate3d(0,0,0)']]
        ]);
      }
    },
    'understandable - 2 adjacent transform with different values': {
      'topic': 'div{transform:translate(0,0);transform:translate3d(0,0,0)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['transform'], ['translate(0,0)']],
          [['transform'], ['translate3d(0,0,0)']]
        ]);
      }
    },
    'understandable - 2 non-adjacent transform with different values': {
      'topic': 'div{transform:translate(0,0);-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['transform'], ['translate(0,0)']],
          [['-webkit-transform'], ['translate3d(0,0,0)']],
          [['transform'], ['translate3d(0,0,0)']]
        ]);
      }
    },
    'understandable - border(hex) with border(rgba)': {
      'topic': 'a{border:1px solid #fff;border:1px solid rgba(1,0,0,.5)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['border'], ['1px'], ['solid'], ['#fff']],
          [['border'], ['1px'], ['solid'], ['rgba(1,0,0,.5)']]
        ]);
      }
    },
    'understandable - border(hex) with border(rgba !important)': {
      'topic': 'a{border:1px solid #fff;border:1px solid rgba(1,0,0,.5)!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['border'], ['1px'], ['solid'], ['#fff']],
          [['border'], ['1px'], ['solid'], ['rgba(1,0,0,.5)!important']]
        ]);
      }
    },
    'understandable - border(hex !important) with border(hex)': {
      'topic': 'a{border:1px solid #fff!important;display:block;border:1px solid #fff}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['border'], ['1px'], ['solid'], ['#fff!important']],
          [['display'], ['block']]
        ]);
      }
    },
    'understandable - border(hex) with border(hex !important)': {
      'topic': 'a{border:1px solid #fff;display:block;border:1px solid #fff!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['display'], ['block']],
          [['border'], ['1px'], ['solid'], ['#fff!important']]
        ]);
      }
    },
    'understandable - unit with function with unit without one': {
      'topic': 'a{border-top-width:calc(100%);display:block;border-top-width:1px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['display'], ['block']],
          [['border-top-width'], ['1px']]
        ]);
      }
    },
    'understandable - unit without function with unit with one': {
      'topic': 'a{border-top-width:1px;display:block;border-top-width:calc(100%)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['border-top-width'], ['1px']],
          [['display'], ['block']],
          [['border-top-width'], ['calc(100%)']]
        ]);
      }
    },
    'understandable - non adjacent units': {
      'topic': 'a{margin-top:100px;padding-top:30px;margin-top:10vmin}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['padding-top'], ['30px']],
          [['margin-top'], ['10vmin']]
        ]);
      }
    }
  })
  .addBatch({
    'understandable - non adjacent units in IE8 mode': {
      'topic': 'a{margin-top:80px;padding-top:30px;margin-top:10vmin}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true, 'ie8'), [
          [['margin-top'], ['80px']],
          [['padding-top'], ['30px']],
          [['margin-top'], ['10vmin']]
        ]);
      }
    }
  })
  .export(module);
