var vows = require('vows');
var assert = require('assert');

var optimize = require('../../lib/properties/optimizer');

var tokenize = require('../../lib/tokenizer/tokenize');
var SourceTracker = require('../../lib/utils/source-tracker');
var Compatibility = require('../../lib/utils/compatibility');
var Validator = require('../../lib/properties/validator');

function _optimize(source, compatibility, aggressiveMerging) {
  var tokens = tokenize(source, {
    options: {},
    sourceTracker: new SourceTracker(),
    warnings: []
  });
  compatibility = new Compatibility(compatibility).toOptions();

  var validator = new Validator(compatibility);
  var options = {
    aggressiveMerging: undefined === aggressiveMerging ? true : aggressiveMerging,
    compatibility: compatibility,
    shorthandCompacting: true
  };
  optimize(tokens[0][1], tokens[0][2], false, true, options, { validator: validator });

  return tokens[0][2];
}

vows.describe(optimize)
  .addBatch({
    'longhand then longhand - background colors as functions': {
      'topic': 'p{background-color:-ms-linear-gradient(top,red,#000);background-color:linear-gradient(top,red,#000)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background-color'], ['-ms-linear-gradient(top,red,#000)']],
          [['background-color'], ['linear-gradient(top,red,#000)']]
        ]);
      }
    },
    'longhand then shorthand': {
      'topic': 'p{background-image:none;background:__ESCAPED_URL_CLEAN_CSS0__}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__']]
        ]);
      }
    },
    'longhand then shorthand - important then non-important': {
      'topic': 'p{background-image:none!important;background:__ESCAPED_URL_CLEAN_CSS0__}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background-image'], ['none!important']],
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__']]
        ]);
      }
    },
    'longhand then shorthand - with vendor prefixed function': {
      'topic': 'p{background-color:red;background:-ms-linear-gradient(top,red,#000)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background-color'], ['red']],
          [['background'], ['-ms-linear-gradient(top,red,#000)']],
        ]);
      }
    },
    'longhand then shorthand - with same vendor prefixed function': {
      'topic': 'p{background-image:-ms-linear-gradient(bottom,black,white);background:-ms-linear-gradient(top,red,#000)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['-ms-linear-gradient(top,red,#000)']],
        ]);
      }
    },
    'longhand then shorthand - with different vendor prefixed function': {
      'topic': 'p{background-image:linear-gradient(bottom,black,white);background:-ms-linear-gradient(top,red,#000)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background-image'], ['linear-gradient(bottom,black,white)']],
          [['background'], ['-ms-linear-gradient(top,red,#000)']],
        ]);
      }
    },
    'longhand then shorthand - with unprefixed function': {
      'topic': 'p{background-color:red;background:linear-gradient(red,blue)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background-color'], ['red']],
          [['background'], ['linear-gradient(red,blue)']]
        ]);
      }
    },
    'shorthand then longhand': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__ repeat;background-repeat:no-repeat}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['no-repeat']]
        ]);
      }
    },
    'shorthand then longhand - important then non-important': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__ repeat!important;background-repeat:no-repeat}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['no-repeat!important']]
        ]);
      }
    },
    'shorthand then longhand - non-important then important': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__ repeat;background-repeat:no-repeat!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__']],
          [['background-repeat'], ['no-repeat!important']]
        ]);
      }
    },
    'shorthand then longhand - disabled background size merging': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__;background-size:50%}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, { properties: { backgroundSizeMerging: false } }), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__']],
          [['background-size'], ['50%']]
        ]);
      }
    },
    'shorthand then longhand - disabled background clip merging': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__;background-clip:padding-box}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, { properties: { backgroundClipMerging: false } }), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__']],
          [['background-clip'], ['padding-box']]
        ]);
      }
    },
    'shorthand then longhand - enabled background clip merging': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__;background-clip:padding-box}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, { properties: { backgroundClipMerging: true } }), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['padding-box']]
        ]);
      }
    },
    'shorthand then longhand - disabled background origin merging': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__;background-origin:border-box}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, { properties: { backgroundOriginMerging: false } }), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__']],
          [['background-origin'], ['border-box']]
        ]);
      }
    },
    'shorthand then longhand - enabled background origin merging': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__;background-origin:border-box}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, { properties: { backgroundOriginMerging: true } }), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['border-box']]
        ]);
      }
    },
    'shorthand then longhand - non mergeable value': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__;background-color:none}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__']],
          [['background-color'], ['none']]
        ]);
      }
    },
    'shorthand then longhand - border with rgba() and color opacity on': {
      'topic': 'p{border:solid rgba(0,0,0,0);border-color:transparent}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, { colors: { opacity: true } }), [
          [['border'], ['solid'], ['transparent']]
        ]);
      }
    },
    'shorthand then longhand - border with rgba() and color opacity off': {
      'topic': 'p{border:solid rgba(0,0,0,0);border-color:transparent}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, { colors: { opacity: false } }), [
          [['border'], ['solid'], ['rgba(0,0,0,0)']],
          [['border-color'], ['transparent']]
        ]);
      }
    },
    'shorthand then longhand - color into a color - with merging off': {
      'topic': 'p{background:white;background-color:red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, { properties: { merging: false } }), [
          [['background'], ['red']]
        ]);
      }
    },
    'shorthand then longhand - color into a function - with merging off': {
      'topic': 'p{background:linear-gradient();background-color:red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, { properties: { merging: false } }), [
          [['background'], ['linear-gradient()']],
          [['background-color'], ['red']]
        ]);
      }
    },
    'shorthand then longhand - two shorthands - pending #527': {
      'topic': 'p{background:-webkit-linear-gradient();background:linear-gradient();background-repeat:repeat-x}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['-webkit-linear-gradient()']],
          [['background'], ['linear-gradient()']],
          [['background-repeat'], ['repeat-x']]
        ]);
      }
    },
    'shorthand then longhand - two shorthands and default - pending #527': {
      'topic': 'p{background:-webkit-linear-gradient();background:linear-gradient();background-repeat:repeat}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['-webkit-linear-gradient()']],
          [['background'], ['linear-gradient()']],
          [['background-repeat'], ['repeat']]
        ]);
      }
    },
    'shorthand then longhand - two mergeable shorthands and default - pending #527': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__;background:__ESCAPED_URL_CLEAN_CSS1__;background-repeat:repeat-x}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS1__']],
          [['background-repeat'], ['repeat-x']]
        ]);
      }
    },
    'shorthand then longhand - non-function into a function': {
      'topic': 'p{background:linear-gradient();background-color:red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['linear-gradient()']],
          [['background-color'], ['red']]
        ]);
      }
    },
    'shorthand then longhand - function into a non-function': {
      'topic': 'p{background:repeat-x;background-image:-webkit-linear-gradient()}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['repeat-x']],
          [['background-image'], ['-webkit-linear-gradient()']]
        ]);
      }
    },
    'shorthand then shorthand - same values': {
      'topic': 'p{background:red;background:red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['red']]
        ]);
      }
    },
    'shorthand then shorthand - same values with defaults': {
      'topic': 'p{background:repeat red;background:red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['red']]
        ]);
      }
    },
    'shorthand then shorthand - with different functions': {
      'topic': 'p{background:linear-gradient();background:-webkit-gradient()}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['linear-gradient()']],
          [['background'], ['-webkit-gradient()']]
        ]);
      }
    },
    'shorthand then shorthand - with function then url': {
      'topic': 'p{background:linear-gradient();background:__ESCAPED_URL_CLEAN_CSS0__}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__']]
        ]);
      }
    },
    'shorthand then shorthand - with url then function': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__;background:linear-gradient()}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__']],
          [['background'], ['linear-gradient()']]
        ]);
      }
    },
    'shorthand then shorthand - important then non-important': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__ no-repeat!important;background:__ESCAPED_URL_CLEAN_CSS1__ repeat red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['no-repeat!important']]
        ]);
      }
    },
    'shorthand then shorthand - non-important then important': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__ no-repeat;background:__ESCAPED_URL_CLEAN_CSS1__ repeat red!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS1__'], ['red!important']]
        ]);
      }
    },
    'shorthand then shorthand - same value and latter important': {
      'topic': 'a{margin:0;margin:0 !important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['margin'], ['0!important']]
        ]);
      }
    },
    'with aggressive off': {
      'topic': 'a{background:white;color:red;background:red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, null, false), [
          [['background'], ['red']],
          [['color'], ['red']]
        ]);
      }
    }
  })
  .addBatch({
    'border': {
      'topic': 'a{border:1px solid red;border-style:dotted}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border'], ['1px'], ['dotted'], ['red']]
        ]);
      }
    },
    'border - multivalue righthand': {
      'topic': 'a{border:1px solid red;border-style:dotted solid}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border'], ['1px'], ['solid'], ['red']],
          [['border-style'], ['dotted'], ['solid']]
        ]);
      }
    },
    'border - important righthand': {
      'topic': 'a{border:1px solid red;border-style:dotted!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border'], ['1px'], ['solid'], ['red']],
          [['border-style'], ['dotted!important']]
        ]);
      }
    },
    'border - important lefthand': {
      'topic': 'a{border:1px solid red!important;border-style:dotted}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border'], ['1px'], ['solid'], ['red!important']]
        ]);
      }
    },
    'border - both important': {
      'topic': 'a{border:1px solid red!important;border-style:dotted!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border'], ['1px'], ['dotted'], ['red!important']]
        ]);
      }
    },
    'border - hex and rgb colors': {
      'topic': 'a{border:1px solid #000;border-color:rgba(255,0,0,.5)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border'], ['1px'], ['solid'], ['#000']],
          [['border-color'], ['rgba(255,0,0,.5)']]
        ]);
      }
    },
    'border-color - hex then rgb': {
      'topic': 'a{border-color:#000;border-color:rgba(255,0,0,.5)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border-color'], ['#000']],
          [['border-color'], ['rgba(255,0,0,.5)']]
        ]);
      }
    },
    'border-color - rgb then hex': {
      'topic': 'a{border-color:rgba(255,0,0,.5);border-color:#000}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border-color'], ['#000']]
        ]);
      }
    },
    'border-color - hex then rgb with multiple values': {
      'topic': 'a{border-color:red;border-color:#000 rgba(255,0,0,.5)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border-color'], ['red']],
          [['border-color'], ['#000'], ['rgba(255,0,0,.5)']]
        ]);
      }
    }
  })
  .addBatch({
    'border radius': {
      'topic': 'a{-moz-border-radius:2px;-moz-border-top-left-radius:3px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['-moz-border-radius'], ['3px'], ['2px'], ['2px']]
        ]);
      }
    },
    'border radius prefixed and unprefixed': {
      'topic': 'a{-moz-border-radius:2px;border-top-left-radius:3px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['-moz-border-radius'], ['2px']],
          [['border-top-left-radius'], ['3px']]
        ]);
      }
    },
    'border width': {
      'topic': 'a{border-width:2px 3px 2px 1px;border-left-width:3px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border-width'], ['2px'], ['3px']]
        ]);
      }
    },
    'list style': {
      'topic': 'a{list-style:circle inside;list-style-image:__ESCAPED_URL_CLEAN_CSS0__}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['list-style'], ['circle'], ['inside'], ['__ESCAPED_URL_CLEAN_CSS0__']]
        ]);
      }
    },
    'margin': {
      'topic': 'a{margin:10px 20px;margin-left:25px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['margin'], ['10px'], ['20px'], ['10px'], ['25px']]
        ]);
      }
    },
    'outline': {
      'topic': 'a{outline:red solid 1px;outline-width:3px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['outline'], ['red'], ['solid'], ['3px']]
        ]);
      }
    },
    'padding': {
      'topic': 'a{padding:10px;padding-right:20px;padding-left:20px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['padding'], ['10px'], ['20px']]
        ]);
      }
    }
  })
  .addBatch({
    'colors with same understandability': {
      'topic': 'a{color:red;color:#fff;color:blue}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['color'], ['blue']]
        ]);
      }
    },
    'colors with different understandability': {
      'topic': 'a{color:red;color:#fff;color:blue;color:rgba(1,2,3,.4)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['color'], ['blue']],
          [['color'], ['rgba(1,2,3,.4)']]
        ]);
      }
    },
    'colors with different understandability overridden by high understandability': {
      'topic': 'a{color:red;color:#fff;color:blue;color:rgba(1,2,3,.4);color:red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['color'], ['red']]
        ]);
      }
    },
    'colors with different understandability and importance #1': {
      'topic': 'a{color:#fff!important;color:rgba(1,2,3,.4)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['color'], ['#fff!important']]
        ]);
      }
    },
    'colors with different understandability and importance #2': {
      'topic': 'a{color:#fff;color:rgba(1,2,3,.4)!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['color'], ['#fff']],
          [['color'], ['rgba(1,2,3,.4)!important']]
        ]);
      }
    }
  })
  .addBatch({
    'shorthand then shorthand multiplex': {
      'topic': 'p{background:url(one.png);background:url(two.png) center 1px,url(three.png) center 2px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['url(one.png)']],
          [['background'], ['url(two.png)'], ['center'], ['1px'], [','], ['url(three.png)'], ['center'], ['2px']]
        ]);
      }
    },
    'shorthand then longhand multiplex': {
      'topic': 'p{background:top left;background-repeat:no-repeat,no-repeat}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['top'], ['left'], ['no-repeat'], [','], ['top'], ['left'], ['no-repeat']]
        ]);
      }
    },
    'shorthand multiplex then longhand': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__,__ESCAPED_URL_CLEAN_CSS1__;background-repeat:no-repeat}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['no-repeat'], [','], ['__ESCAPED_URL_CLEAN_CSS1__'], ['no-repeat']]
        ]);
      }
    },
    'longhand then shorthand multiplex': {
      'topic': 'p{background-repeat:no-repeat;background:__ESCAPED_URL_CLEAN_CSS0__,__ESCAPED_URL_CLEAN_CSS1__}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], [','], ['__ESCAPED_URL_CLEAN_CSS1__']]
        ]);
      }
    },
    'longhand multiplex then shorthand': {
      'topic': 'p{background-repeat:no-repeat,no-repeat;background:__ESCAPED_URL_CLEAN_CSS0__}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__']]
        ]);
      }
    },
    'multiplex longhand into multiplex shorthand': {
      'topic': 'p{background:no-repeat,no-repeat;background-position:top left,bottom left}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['top'], ['left'], ['no-repeat'], [','], ['bottom'], ['left'], ['no-repeat']]
        ]);
      }
    },
    'two multiplex shorthands with vendor specific functions': {
      'topic': 'p{background:url(1.png),-webkit-linear-gradient();background:url(1.png),linear-gradient()}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['url(1.png)'], [','], ['-webkit-linear-gradient()']],
          [['background'], ['url(1.png)'], [','], ['linear-gradient()']]
        ]);
      }
    },
    'not too long into multiplex #1': {
      'topic': 'p{background:top left;background-repeat:no-repeat,no-repeat}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['top'], ['left'], ['no-repeat'], [','], ['top'], ['left'], ['no-repeat']]
        ]);
      }
    },
    'not too long into multiplex #2': {
      'topic': 'p{background:repeat content-box;background-repeat:no-repeat,no-repeat}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['no-repeat'], ['content-box'], [','], ['no-repeat'], ['content-box']]
        ]);
      }
    },
    'not too long into multiplex - twice': {
      'topic': 'p{background:top left;background-repeat:no-repeat,no-repeat;background-image:__ESCAPED_URL_CLEAN_CSS0__,__ESCAPED_URL_CLEAN_CSS1__}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['top'], ['left'], ['no-repeat'], [','], ['__ESCAPED_URL_CLEAN_CSS1__'], ['top'], ['left'], ['no-repeat']]
        ]);
      }
    },
    'not too long into multiplex - over a property': {
      'topic': 'p{background:top left;background-repeat:no-repeat,no-repeat;background-image:__ESCAPED_URL_CLEAN_CSS0__}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['top'], ['left']],
          [['background-repeat'], ['no-repeat'], [','], ['no-repeat']]
        ]);
      }
    },
    'too long into multiplex #1': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__;background-repeat:no-repeat,no-repeat}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__']],
          [['background-repeat'], ['no-repeat'], [','], ['no-repeat']]
        ]);
      }
    },
    'too long into multiplex #2': {
      'topic': 'p{background:content-box padding-box;background-repeat:no-repeat,no-repeat}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['content-box'], ['padding-box']],
          [['background-repeat'], ['no-repeat'], [','], ['no-repeat']]
        ]);
      }
    },
    'too long into multiplex #3': {
      'topic': 'p{background:top left / 20px 20px;background-repeat:no-repeat,no-repeat}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['top'], ['left'], ['/'], ['20px'], ['20px']],
          [['background-repeat'], ['no-repeat'], [','], ['no-repeat']]
        ]);
      }
    },
    'background color into background': {
      'topic': 'p{background:red;background-repeat:__ESCAPED_URL_CLEAN_CSS0__,__ESCAPED_URL_CLEAN_CSS1__}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], [','], ['__ESCAPED_URL_CLEAN_CSS1__'], ['red']],
        ]);
      }
    },
    'background then background - svg hack': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__;background:__ESCAPED_URL_CLEAN_CSS1__,none}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__']],
          [['background'], ['__ESCAPED_URL_CLEAN_CSS1__'], [','], ['none']]
        ]);
      }
    },
    'background then background - inverted svg hack': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__;background:none,__ESCAPED_URL_CLEAN_CSS1__}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__']],
          [['background'], ['0 0'], [','], ['__ESCAPED_URL_CLEAN_CSS1__']]
        ]);
      }
    },
    'background-image then background-image - svg hack': {
      'topic': 'p{background-image:__ESCAPED_URL_CLEAN_CSS0__;background-image: __ESCAPED_URL_CLEAN_CSS1__,none}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background-image'], ['__ESCAPED_URL_CLEAN_CSS0__']],
          [['background-image'], ['__ESCAPED_URL_CLEAN_CSS1__'], [','], ['none']]
        ]);
      }
    }
  })
  .addBatch({
    'overriding !important by a star hack': {
      'topic': 'a{color:red!important;display:block;*color:#fff}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['color'], ['red!important']],
          [['display'], ['block']],
          [['*color'], ['#fff']]
        ]);
      }
    },
    'overriding !important by an underscore hack': {
      'topic': 'a{color:red!important;display:block;_color:#fff}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['color'], ['red!important']],
          [['display'], ['block']],
          [['_color'], ['#fff']]
        ]);
      }
    },
    'overriding !important by an backslash hack': {
      'topic': 'a{color:red!important;display:block;color:#fff\\0}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['color'], ['red!important']],
          [['display'], ['block']]
        ]);
      }
    }
  })
  .export(module);
