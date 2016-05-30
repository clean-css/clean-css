var vows = require('vows');
var assert = require('assert');

var optimize = require('../../lib/properties/optimizer');

var tokenize = require('../../lib/tokenizer/tokenize');
var SourceTracker = require('../../lib/utils/source-tracker');
var Compatibility = require('../../lib/utils/compatibility');
var Validator = require('../../lib/properties/validator');

function _optimize(source) {
  var tokens = tokenize(source, {
    options: {},
    sourceTracker: new SourceTracker(),
    warnings: []
  });

  var compatibility = new Compatibility(compatibility).toOptions();
  var validator = new Validator(compatibility);
  var options = {
    aggressiveMerging: true,
    compatibility: compatibility,
    shorthandCompacting: true
  };
  optimize(tokens[0][1], tokens[0][2], false, true, options, validator);

  return tokens[0][2];
}

vows.describe(optimize)
  .addBatch({
    'shorthand background #1': {
      'topic': 'p{background-color:#111;background-image:__ESCAPED_URL_CLEAN_CSS0__;background-repeat:repeat;background-position:0 0;background-attachment:scroll;background-size:auto;background-origin:padding-box;background-clip:border-box}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['#111']]
        ]);
      }
    },
    'shorthand background #2': {
      'topic': 'p{background-color:#111;background-image:__ESCAPED_URL_CLEAN_CSS0__;background-repeat:no-repeat;background-position:0 0;background-attachment:scroll;background-size:auto;background-origin:padding-box;background-clip:border-box}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['no-repeat'], ['#111']]
        ]);
      }
    },
    'shorthand important background': {
      'topic': 'p{background-color:#111!important;background-image:__ESCAPED_URL_CLEAN_CSS0__!important;background-repeat:repeat!important;background-position:0 0!important;background-attachment:scroll!important;background-size:auto!important;background-origin:padding-box!important;background-clip:border-box!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['#111!important']]
        ]);
      }
    },
    'shorthand border-width': {
      'topic': 'p{border-top-width:7px;border-bottom-width:7px;border-left-width:4px;border-right-width:4px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border-width'], ['7px'], ['4px']]
        ]);
      }
    },
    'shorthand border-color #1': {
      'topic': 'p{border-top-color:#9fce00;border-bottom-color:#9fce00;border-left-color:#9fce00;border-right-color:#9fce00}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border-color'], ['#9fce00']]
        ]);
      }
    },
    'shorthand border-color #2': {
      'topic': 'p{border-right-color:#002;border-bottom-color:#003;border-top-color:#001;border-left-color:#004}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border-color'], ['#001'], ['#002'], ['#003'], ['#004']]
        ]);
      }
    },
    'shorthand border-radius': {
      'topic': 'p{border-top-left-radius:7px;border-bottom-right-radius:6px;border-bottom-left-radius:5px;border-top-right-radius:3px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border-radius'], ['7px'], ['3px'], ['6px'], ['5px']]
        ]);
      }
    },
    'shorthand multiplexed border-radius': {
      'topic': 'p{border-radius:7px/3px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border-radius'], ['7px'], ['/'], ['3px']]
        ]);
      }
    },
    'shorthand asymmetric border-radius with same values': {
      'topic': 'p{border-top-left-radius:7px 3px;border-top-right-radius:7px 3px;border-bottom-right-radius:7px 3px;border-bottom-left-radius:7px 3px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border-radius'], ['7px'], ['/'], ['3px']]
        ]);
      }
    },
    'shorthand asymmetric border-radius': {
      'topic': 'p{border-top-left-radius:7px 3px;border-top-right-radius:6px 2px;border-bottom-right-radius:5px 1px;border-bottom-left-radius:4px 0}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border-radius'], ['7px'], ['6px'], ['5px'], ['4px'], ['/'], ['3px'], ['2px'], ['1px'], ['0']]
        ]);
      }
    },
    'shorthand multiple !important': {
      'topic': 'a{border-color:#123 !important;border-top-color: #456 !important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border-color'], ['#456'], ['#123'], ['#123!important']]
        ]);
      }
    },
    'shorthand list-style #1': {
      'topic': 'a{list-style-type:circle;list-style-position:outside;list-style-image:__ESCAPED_URL_CLEAN_CSS0__}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['list-style'], ['circle'], ['__ESCAPED_URL_CLEAN_CSS0__']]
        ]);
      }
    },
    'shorthand list-style #2': {
      'topic': 'a{list-style-image:__ESCAPED_URL_CLEAN_CSS0__;list-style-type:circle;list-style-position:inside}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['list-style'], ['circle'], ['inside'], ['__ESCAPED_URL_CLEAN_CSS0__']]
        ]);
      }
    },
    'shorthand margin': {
      'topic': 'a{margin-top:10px;margin-right:5px;margin-bottom:3px;margin-left:2px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['margin'], ['10px'], ['5px'], ['3px'], ['2px']]
        ]);
      }
    },
    'shorthand padding': {
      'topic': 'a{padding-top:10px;padding-left:5px;padding-bottom:3px;padding-right:2px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['padding'], ['10px'], ['2px'], ['3px'], ['5px']]
        ]);
      }
    },
    'mixed': {
      'topic': 'a{padding-top:10px;margin-top:3px;padding-left:5px;margin-left:3px;padding-bottom:3px;margin-bottom:3px;padding-right:2px;margin-right:3px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['padding'], ['10px'], ['2px'], ['3px'], ['5px']],
          [['margin'], ['3px']]
        ]);
      }
    },
    'with other properties': {
      'topic': 'a{padding-top:10px;padding-left:5px;padding-bottom:3px;color:red;padding-right:2px;width:100px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['color'], ['red']],
          [['width'], ['100px']],
          [['padding'], ['10px'], ['2px'], ['3px'], ['5px']]
        ]);
      }
    },
    'with hacks': {
      'topic': 'a{padding-top:10px;padding-left:5px;padding-bottom:3px;_padding-right:2px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['padding-top'], ['10px']],
          [['padding-left'], ['5px']],
          [['padding-bottom'], ['3px']],
          [['_padding-right'], ['2px']]
        ]);
      }
    },
    'just inherit': {
      'topic': 'a{background:inherit}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background'], ['inherit']]
        ]);
      }
    }
  })
  .addBatch({
    'not enough components': {
      'topic': 'a{padding-top:10px;padding-left:5px;padding-bottom:3px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['padding-top'], ['10px']],
          [['padding-left'], ['5px']],
          [['padding-bottom'], ['3px']]
        ]);
      }
    },
    'with inherit - pending #525': {
      'topic': 'a{padding-top:10px;padding-left:5px;padding-bottom:3px;padding-right:inherit}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['padding-top'], ['10px']],
          [['padding-left'], ['5px']],
          [['padding-bottom'], ['3px']],
          [['padding-right'], ['inherit']]
        ]);
      }
    },
    'mixed importance': {
      'topic': 'a{padding-top:10px;padding-left:5px;padding-bottom:3px;padding-right:2px!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['padding-top'], ['10px']],
          [['padding-left'], ['5px']],
          [['padding-bottom'], ['3px']],
          [['padding-right'], ['2px!important']]
        ]);
      }
    },
    'mixed understandability of units': {
      'topic': 'a{padding-top:10px;padding-left:5px;padding-bottom:3px;padding-right:calc(100% - 20px)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['padding-top'], ['10px']],
          [['padding-left'], ['5px']],
          [['padding-bottom'], ['3px']],
          [['padding-right'], ['calc(100% - 20px)']]
        ]);
      }
    },
    'mixed understandability of images': {
      'topic': 'p{background-color:#111;background-image:linear-gradient(sth);background-repeat:repeat;background-position:0 0;background-attachment:scroll;background-size:auto;background-origin:padding-box;background-clip:border-box}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background-color'], ['#111']],
          [['background-image'], ['linear-gradient(sth)']],
          [['background-repeat'], ['repeat']],
          [['background-position'], ['0'], ['0']],
          [['background-attachment'], ['scroll']],
          [['background-size'], ['auto']],
          [['background-origin'], ['padding-box']],
          [['background-clip'], ['border-box']]
        ]);
      }
    }
  })
  .export(module);
