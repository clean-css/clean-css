var vows = require('vows');
var assert = require('assert');

var optimize = require('../../lib/properties/optimizer');

var Tokenizer = require('../../lib/selectors/tokenizer');
var SourceTracker = require('../../lib/utils/source-tracker');
var Compatibility = require('../../lib/utils/compatibility');
var Validator = require('../../lib/properties/validator');
var addOptimizationMetadata = require('../../lib/selectors/optimization-metadata');

function _optimize(source) {
  var tokens = new Tokenizer({
    options: {},
    sourceTracker: new SourceTracker(),
    warnings: []
  }).toTokens(source);

  var compatibility = new Compatibility(compatibility).toOptions();
  var validator = new Validator(compatibility);
  var options = {
    aggressiveMerging: true,
    compatibility: compatibility,
    shorthandCompacting: true
  };
  addOptimizationMetadata(tokens);
  optimize(tokens[0][1], tokens[0][2], false, true, options, validator);

  return tokens[0][2];
}

vows.describe(optimize)
  .addBatch({
    'shorthand background #1': {
      'topic': 'p{background-color:#111;background-image:__ESCAPED_URL_CLEAN_CSS0__;background-repeat:repeat;background-position:0 0;background-attachment:scroll;background-size:auto;background-origin:padding-box;background-clip:border-box}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background', false, false], ['__ESCAPED_URL_CLEAN_CSS0__'], ['#111']]
        ]);
      }
    },
    'shorthand background #2': {
      'topic': 'p{background-color:#111;background-image:__ESCAPED_URL_CLEAN_CSS0__;background-repeat:no-repeat;background-position:0 0;background-attachment:scroll;background-size:auto;background-origin:padding-box;background-clip:border-box}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background', false, false], ['__ESCAPED_URL_CLEAN_CSS0__'], ['no-repeat'], ['#111']]
        ]);
      }
    },
    'shorthand important background': {
      'topic': 'p{background-color:#111!important;background-image:__ESCAPED_URL_CLEAN_CSS0__!important;background-repeat:repeat!important;background-position:0 0!important;background-attachment:scroll!important;background-size:auto!important;background-origin:padding-box!important;background-clip:border-box!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background', true, false], ['__ESCAPED_URL_CLEAN_CSS0__'], ['#111']]
        ]);
      }
    },
    'shorthand border-width': {
      'topic': 'p{border-top-width:7px;border-bottom-width:7px;border-left-width:4px;border-right-width:4px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border-width', false, false], ['7px'], ['4px']]
        ]);
      }
    },
    'shorthand border-color #1': {
      'topic': 'p{border-top-color:#9fce00;border-bottom-color:#9fce00;border-left-color:#9fce00;border-right-color:#9fce00}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border-color', false, false], ['#9fce00']]
        ]);
      }
    },
    'shorthand border-color #2': {
      'topic': 'p{border-right-color:#002;border-bottom-color:#003;border-top-color:#001;border-left-color:#004}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border-color', false, false], ['#001'], ['#002'], ['#003'], ['#004']]
        ]);
      }
    },
    'shorthand border-radius': {
      'topic': 'p{border-top-left-radius:7px;border-bottom-right-radius:6px;border-bottom-left-radius:5px;border-top-right-radius:3px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['border-radius', false, false], ['7px'], ['3px'], ['6px'], ['5px']]
        ]);
      }
    },
    'shorthand list-style #1': {
      'topic': 'a{list-style-type:circle;list-style-position:outside;list-style-image:__ESCAPED_URL_CLEAN_CSS0__}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['list-style', false, false], ['circle'], ['__ESCAPED_URL_CLEAN_CSS0__']]
        ]);
      }
    },
    'shorthand list-style #2': {
      'topic': 'a{list-style-image:__ESCAPED_URL_CLEAN_CSS0__;list-style-type:circle;list-style-position:inside}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['list-style', false, false], ['circle'], ['inside'], ['__ESCAPED_URL_CLEAN_CSS0__']]
        ]);
      }
    },
    'shorthand margin': {
      'topic': 'a{margin-top:10px;margin-right:5px;margin-bottom:3px;margin-left:2px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['margin', false, false], ['10px'], ['5px'], ['3px'], ['2px']]
        ]);
      }
    },
    'shorthand padding': {
      'topic': 'a{padding-top:10px;padding-left:5px;padding-bottom:3px;padding-right:2px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['padding', false, false], ['10px'], ['2px'], ['3px'], ['5px']]
        ]);
      }
    },
    'mixed': {
      'topic': 'a{padding-top:10px;margin-top:3px;padding-left:5px;margin-left:3px;padding-bottom:3px;margin-bottom:3px;padding-right:2px;margin-right:3px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['padding', false, false], ['10px'], ['2px'], ['3px'], ['5px']],
          [['margin', false, false], ['3px']]
        ]);
      }
    },
    'with other properties': {
      'topic': 'a{padding-top:10px;padding-left:5px;padding-bottom:3px;color:red;padding-right:2px;width:100px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['color', false, false], ['red']],
          [['width', false, false], ['100px']],
          [['padding', false, false], ['10px'], ['2px'], ['3px'], ['5px']]
        ]);
      }
    }
  })
  .addBatch({
    'not enough components': {
      'topic': 'a{padding-top:10px;padding-left:5px;padding-bottom:3px}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['padding-top', false, false], ['10px']],
          [['padding-left', false, false], ['5px']],
          [['padding-bottom', false, false], ['3px']]
        ]);
      }
    },
    'with inherit - pending #525': {
      'topic': 'a{padding-top:10px;padding-left:5px;padding-bottom:3px;padding-right:inherit}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['padding-top', false, false], ['10px']],
          [['padding-left', false, false], ['5px']],
          [['padding-bottom', false, false], ['3px']],
          [['padding-right', false, false], ['inherit']]
        ]);
      }
    },
    'mixed importance': {
      'topic': 'a{padding-top:10px;padding-left:5px;padding-bottom:3px;padding-right:2px!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['padding-top', false, false], ['10px']],
          [['padding-left', false, false], ['5px']],
          [['padding-bottom', false, false], ['3px']],
          [['padding-right', true, false], ['2px']]
        ]);
      }
    },
    'mixed understandability of units': {
      'topic': 'a{padding-top:10px;padding-left:5px;padding-bottom:3px;padding-right:calc(100% - 20px)}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['padding-top', false, false], ['10px']],
          [['padding-left', false, false], ['5px']],
          [['padding-bottom', false, false], ['3px']],
          [['padding-right', false, false], ['calc(100% - 20px)']]
        ]);
      }
    },
    'mixed understandability of images': {
      'topic': 'p{background-color:#111;background-image:linear-gradient(sth);background-repeat:repeat;background-position:0 0;background-attachment:scroll;background-size:auto;background-origin:padding-box;background-clip:border-box}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background-color', false, false], ['#111']],
          [['background-image', false, false], ['linear-gradient(sth)']],
          [['background-repeat', false, false], ['repeat']],
          [['background-position', false, false], ['0'], ['0']],
          [['background-attachment', false, false], ['scroll']],
          [['background-size', false, false], ['auto']],
          [['background-origin', false, false], ['padding-box']],
          [['background-clip', false, false], ['border-box']]
        ]);
      }
    }
  })
  .export(module);
