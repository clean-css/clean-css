var vows = require('vows');
var assert = require('assert');

var optimize = require('../../lib/properties/optimizer');

var Tokenizer = require('../../lib/selectors/tokenizer');
var SourceTracker = require('../../lib/utils/source-tracker');
var Compatibility = require('../../lib/utils/compatibility');
var addOptimizationMetadata = require('../../lib/selectors/optimization-metadata');

var compatibility = new Compatibility().toOptions();

function _optimize(source, mergeAdjacent, aggressiveMerging) {
  var tokens = new Tokenizer({
    options: {},
    sourceTracker: new SourceTracker(),
    warnings: []
  }).toTokens(source);

  addOptimizationMetadata(tokens);
  optimize(tokens[0][1], tokens[0][2], mergeAdjacent, true, { compatibility: compatibility, aggressiveMerging: aggressiveMerging });

  return tokens[0][2];
}

vows.describe(optimize)
  .addBatch({
    'of two adjacent properties': {
      'topic': 'a{display:-moz-inline-box;display:inline-block}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['display', false, false], ['-moz-inline-box']],
          [['display', false, false], ['inline-block']]
        ]);
      }
    },
    'of two properties ': {
      'topic': 'a{display:inline-block;color:red;display:block}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['color', false , false], ['red']],
          [['display', false , false], ['block']]
        ]);
      }
    },
    'of two properties  where former is !important': {
      'topic': 'a{display:inline-block!important;color:red;display:block}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['display', true , false], ['inline-block']],
          [['color', false , false], ['red']]
        ]);
      }
    },
    'of two properties  where latter is !important': {
      'topic': 'a{display:inline-block;color:red;display:block!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['color', false , false], ['red']],
          [['display', true , false], ['block']]
        ]);
      }
    },
    'of two properties  where both are !important': {
      'topic': 'a{display:inline-block!important;color:red;display:block!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['color', false , false], ['red']],
          [['display', true , false], ['block']]
        ]);
      }
    },
    'of many properties': {
      'topic': 'a{display:inline-block;color:red;font-weight:bolder;font-weight:700;display:block!important;color:#fff}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['font-weight', false , false], ['bolder']],
          [['font-weight', false , false], ['700']],
          [['display', true , false], ['block']],
          [['color', false , false], ['#fff']]
        ]);
      }
    },
    'both redefined': {
      'topic': 'p{display:block;display:-moz-inline-box;color:red;display:table-cell}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['color', false , false], ['red']],
          [['display', false , false], ['table-cell']]
        ]);
      }
    },
    'filter treated as background': {
      'topic': 'p{background:-moz-linear-gradient();background:-webkit-linear-gradient();filter:"progid:DXImageTransform";background:linear-gradient()}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['background', false , false], ['-moz-linear-gradient()']],
          [['background', false , false], ['-webkit-linear-gradient()']],
          [['filter', false , false], ['"progid:DXImageTransform"']],
          [['background', false , false], ['linear-gradient()']]
        ]);
      }
    },
    'filter treated as background-image': {
      'topic': 'p{background-image:-moz-linear-gradient();background-image:-webkit-linear-gradient();filter:"progid:DXImageTransform";background-image:linear-gradient()}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['background-image', false , false], ['-moz-linear-gradient()']],
          [['background-image', false , false], ['-webkit-linear-gradient()']],
          [['filter', false , false], ['"progid:DXImageTransform"']],
          [['background-image', false , false], ['linear-gradient()']]
        ]);
      }
    },
    '-ms-filter treated as background': {
      'topic': 'p{background:-moz-linear-gradient();background:-webkit-linear-gradient();-ms-filter:"progid:DXImageTransform";background:linear-gradient()}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['background', false , false], ['-moz-linear-gradient()']],
          [['background', false , false], ['-webkit-linear-gradient()']],
          [['-ms-filter', false , false], ['"progid:DXImageTransform"']],
          [['background', false , false], ['linear-gradient()']]
        ]);
      }
    },
    '-ms-filter treated as background-image': {
      'topic': 'p{background-image:-moz-linear-gradient();background-image:-webkit-linear-gradient();-ms-filter:"progid:DXImageTransform";background-image:linear-gradient()}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['background-image', false , false], ['-moz-linear-gradient()']],
          [['background-image', false , false], ['-webkit-linear-gradient()']],
          [['-ms-filter', false , false], ['"progid:DXImageTransform"']],
          [['background-image', false , false], ['linear-gradient()']]
        ]);
      }
    },
    'longhand then shorthand': {
      'topic': 'p{border-left-style:solid;border:1px dotted red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['border', false , false], ['1px'], ['dotted'], ['red']]
        ]);
      }
    },
    'longhand then shorthand with important': {
      'topic': 'p{border-left-style:solid!important;border:1px dotted red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['border-left-style', true, false], ['solid']],
          [['border', false , false], ['1px'], ['dotted'], ['red']]
        ]);
      }
    },
    'shorthand then longhand': {
      'topic': 'p{background:url(image.png);background-image:#fff}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['background', false , false], ['url(image.png)']],
          [['background-image', false , false], ['#fff']]
        ]);
      }
    }
  })
  .addBatch({
    'ie hacks - normal before hack': {
      'topic': 'p{color:red;display:none;color:#fff\\9}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['color', false , false], ['red']],
          [['display', false , false], ['none']],
          [['color', false , true], ['#fff\\9']]
        ]);
      }
    },
    'ie hacks - normal after hack': {
      'topic': 'p{color:red\\9;display:none;color:#fff}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['color', false , true], ['red\\9']],
          [['display', false , false], ['none']],
          [['color', false , false], ['#fff']]
        ]);
      }
    },
    'ie hacks - hack after hack': {
      'topic': 'p{color:red\\9;display:none;color:#fff\\9}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['display', false , false], ['none']],
          [['color', false , true], ['#fff\\9']]
        ]);
      }
    }
  })
  .addBatch({
    'mergeAdjacent is true': {
      'topic': 'p{display:block;display:inline-block}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, true, true), [
          [['display', false , false], ['inline-block']]
        ]);
      }
    },
    'mergeAdjacent is false': {
      'topic': 'p{display:block;display:inline-block}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['display', false , false], ['block']],
          [['display', false , false], ['inline-block']]
        ]);
      }
    },
    'mergeAdjacent is an array with irrelevant join positions': {
      'topic': 'p{display:block;display:inline-block;color:red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, [2], true), [
          [['display', false , false], ['block']],
          [['display', false , false], ['inline-block']],
          [['color', false , false], ['red']]
        ]);
      }
    },
    'mergeAdjacent is an array with relevant join positions': {
      'topic': 'p{display:block;display:inline-block;color:red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, [1], true), [
          [['display', false , false], ['inline-block']],
          [['color', false , false], ['red']]
        ]);
      }
    }
  })
  .addBatch({
    'aggressive off - (yet) not overriddable': {
      'topic': 'a{display:inline-block;color:red;display:-moz-block}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, false), [
          [['display', false , false], ['inline-block']],
          [['color', false , false], ['red']],
          [['display', false , false], ['-moz-block']]
        ]);
      }
    }
  })
  .addBatch({
    'understandable - 2 properties, both !important, 2nd less understandable': {
      'topic': 'a{color:red!important;display:block;color:rgba(0,255,0,.5)!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['color', true , false], ['red']],
          [['display', false , false], ['block']],
          [['color', true , false], ['rgba(0,255,0,.5)']]
        ]);
      }
    },
    'understandable - 2 properties, both !important, 2nd more understandable': {
      'topic': 'a{color:rgba(0,255,0,.5)!important;display:block;color:red!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['display', false , false], ['block']],
          [['color', true , false], ['red']]
        ]);
      }
    },
    'understandable - 2 adjacent properties, both !important, 2nd less understandable': {
      'topic': 'a{background:red!important;background:rgba(0,255,0,.5)!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['background', true , false], ['red']],
          [['background', true , false], ['rgba(0,255,0,.5)']]
        ]);
      }
    },
    'understandable - 2 adjacent properties, both !important, 2nd more understandable': {
      'topic': 'a{background:rgba(0,255,0,.5)!important;background:red!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['background', true , false], ['rgba(0,255,0,.5)']],
          [['background', true , false], ['red']]
        ]);
      }
    },
    'understandable - 2 adjacent -ms-transform with different values': {
      'topic': 'div{-ms-transform:translate(0,0);-ms-transform:translate3d(0,0,0)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['-ms-transform', false , false], ['translate(0,0)']],
          [['-ms-transform', false , false], ['translate3d(0,0,0)']]
        ]);
      }
    },
    'understandable - 2 non-adjacent -ms-transform with different values': {
      'topic': 'div{-ms-transform:translate(0,0);-webkit-transform:translate3d(0,0,0);-ms-transform:translate3d(0,0,0)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['-ms-transform', false , false], ['translate(0,0)']],
          [['-webkit-transform', false , false], ['translate3d(0,0,0)']],
          [['-ms-transform', false , false], ['translate3d(0,0,0)']]
        ]);
      }
    },
    'understandable - 2 adjacent transform with different values': {
      'topic': 'div{transform:translate(0,0);transform:translate3d(0,0,0)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['transform', false , false], ['translate(0,0)']],
          [['transform', false , false], ['translate3d(0,0,0)']]
        ]);
      }
    },
    'understandable - 2 non-adjacent transform with different values': {
      'topic': 'div{transform:translate(0,0);-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['transform', false , false], ['translate(0,0)']],
          [['-webkit-transform', false , false], ['translate3d(0,0,0)']],
          [['transform', false , false], ['translate3d(0,0,0)']]
        ]);
      }
    },
    'understandable - border(hex) with border(rgba)': {
      'topic': 'a{border:1px solid #fff;border:1px solid rgba(1,0,0,.5)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['border', false , false], ['1px'], ['solid'], ['#fff']],
          [['border', false , false], ['1px'], ['solid'], ['rgba(1,0,0,.5)']]
        ]);
      }
    },
    'understandable - border(hex) with border(rgba !important)': {
      'topic': 'a{border:1px solid #fff;border:1px solid rgba(1,0,0,.5)!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['border', false , false], ['1px'], ['solid'], ['#fff']],
          [['border', true , false], ['1px'], ['solid'], ['rgba(1,0,0,.5)']]
        ]);
      }
    },
    'understandable - border(hex !important) with border(hex)': {
      'topic': 'a{border:1px solid #fff!important;display:block;border:1px solid #fff}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['border', true , false], ['1px'], ['solid'], ['#fff']],
          [['display', false , false], ['block']]
        ]);
      }
    },
    'understandable - border(hex) with border(hex !important)': {
      'topic': 'a{border:1px solid #fff;display:block;border:1px solid #fff!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['display', false , false], ['block']],
          [['border', true , false], ['1px'], ['solid'], ['#fff']]
        ]);
      }
    },
    'understandable - unit with function with unit without one': {
      'topic': 'a{border-top-width:calc(100%);display:block;border-top-width:1px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['display', false , false], ['block']],
          [['border-top-width', false , false], ['1px']]
        ]);
      }
    },
    'understandable - unit without function with unit with one': {
      'topic': 'a{border-top-width:1px;display:block;border-top-width:calc(100%)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, false, true), [
          [['border-top-width', false , false], ['1px']],
          [['display', false , false], ['block']],
          [['border-top-width', false , false], ['calc(100%)']]
        ]);
      }
    }
  })
  .export(module);
