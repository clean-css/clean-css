var vows = require('vows');
var assert = require('assert');

var optimize = require('../../lib/properties/optimizer');

var Tokenizer = require('../../lib/selectors/tokenizer');
var SourceTracker = require('../../lib/utils/source-tracker');
var Compatibility = require('../../lib/utils/compatibility');
var addOptimizationMetadata = require('../../lib/selectors/optimization-metadata');

function _optimize(source, compatibility) {
  var tokens = new Tokenizer({
    options: {},
    sourceTracker: new SourceTracker(),
    warnings: []
  }).toTokens(source);
  compatibility = new Compatibility(compatibility).toOptions();

  addOptimizationMetadata(tokens);
  optimize(tokens[0][1], tokens[0][2], false, { compatibility: compatibility, shorthandCompacting: true });

  return tokens[0][2];
}

vows.describe(optimize)
  .addBatch({
    'longhand then shorthand': {
      'topic': 'p{background-image:none;background:__ESCAPED_URL_CLEAN_CSS0__}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background', false , false], ['__ESCAPED_URL_CLEAN_CSS0__']]
        ]);
      }
    },
    'longhand then shorthand - important then non-important': {
      'topic': 'p{background-image:none!important;background:__ESCAPED_URL_CLEAN_CSS0__}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background-image', true , false], ['none']],
          [['background', false , false], ['__ESCAPED_URL_CLEAN_CSS0__']]
        ]);
      }
    },
    'longhand then shorthand - multiplex then simple': {
      'topic': 'p{background-repeat:no-repeat,no-repeat;background:__ESCAPED_URL_CLEAN_CSS0__}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background-repeat', false , false], ['no-repeat'], [','], ['no-repeat']],
          [['background', false , false], ['__ESCAPED_URL_CLEAN_CSS0__']]
        ]);
      }
    },
    'longhand then shorthand - simple then multiplex': {
      'topic': 'p{background-repeat:no-repeat;background:__ESCAPED_URL_CLEAN_CSS0__,__ESCAPED_URL_CLEAN_CSS1__}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background', false , false], ['__ESCAPED_URL_CLEAN_CSS0__'], [','], ['__ESCAPED_URL_CLEAN_CSS1__']]
        ]);
      }
    },
    'shorthand then longhand': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__ repeat;background-repeat:no-repeat}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background', false , false], ['__ESCAPED_URL_CLEAN_CSS0__'], ['no-repeat']]
        ]);
      }
    },
    'shorthand then longhand - important then non-important': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__ repeat!important;background-repeat:no-repeat}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background', true , false], ['__ESCAPED_URL_CLEAN_CSS0__'], ['no-repeat']]
        ]);
      }
    },
    'shorthand then longhand - non-important then important': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__ repeat;background-repeat:no-repeat!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background', false , false], ['__ESCAPED_URL_CLEAN_CSS0__']],
          [['background-repeat', true , false], ['no-repeat']]
        ]);
      }
    },
    'shorthand then longhand - multiple values': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__,__ESCAPED_URL_CLEAN_CSS1__;background-repeat:no-repeat}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background', false , false], ['__ESCAPED_URL_CLEAN_CSS0__'], ['no-repeat'], [','], ['__ESCAPED_URL_CLEAN_CSS1__'], ['no-repeat']]
        ]);
      }
    },
    'shorthand then longhand - single value then multi value': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__;background-repeat:no-repeat,no-repeat}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background', false , false], ['__ESCAPED_URL_CLEAN_CSS0__']],
          [['background-repeat', false , false], ['no-repeat'], [','], ['no-repeat']]
        ]);
      }
    },
    'shorthand then longhand - disabled background size merging': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__;background-size:50%}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, { properties: { backgroundSizeMerging: false } }), [
          [['background', false , false], ['__ESCAPED_URL_CLEAN_CSS0__']],
          [['background-size', false , false], ['50%']]
        ]);
      }
    },
    'shorthand then longhand - non mergeable value': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__;background-color:none}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, { properties: { backgroundSizeMerging: false } }), [
          [['background', false , false], ['__ESCAPED_URL_CLEAN_CSS0__']],
          [['background-color', false , false], ['none']]
        ]);
      }
    },
    'shorthand then longhand - color into a function': {
      'topic': 'p{background:linear-gradient();background-color:red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, { properties: { backgroundSizeMerging: false } }), [
          [['background', false , false], ['linear-gradient()'], ['red']]
        ]);
      }
    },
    'shorthand then longhand - color into a color - with merging off': {
      'topic': 'p{background:white;background-color:red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, { properties: { merging: false } }), [
          [['background', false , false], ['red']]
        ]);
      }
    },
    'shorthand then longhand - color into a function - with merging off': {
      'topic': 'p{background:linear-gradient();background-color:red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic, { properties: { merging: false } }), [
          [['background', false , false], ['linear-gradient()']],
          [['background-color', false , false], ['red']]
        ]);
      }
    },
    'shorthand then shorthand - same values': {
      'topic': 'p{background:red;background:red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background', false , false], ['red']]
        ]);
      }
    },
    'shorthand then shorthand - same values with defaults': {
      'topic': 'p{background:repeat red;background:red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background', false , false], ['red']]
        ]);
      }
    },
    'shorthand then shorthand - with different functions': {
      'topic': 'p{background:linear-gradient();background:-webkit-gradient()}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background', false , false], ['linear-gradient()']],
          [['background', false , false], ['-webkit-gradient()']]
        ]);
      }
    },
    'shorthand then shorthand - with function and url': {
      'topic': 'p{background:linear-gradient();background:__ESCAPED_URL_CLEAN_CSS0__}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background', false , false], ['linear-gradient()']],
          [['background', false , false], ['__ESCAPED_URL_CLEAN_CSS0__']]
        ]);
      }
    },
    'shorthand then shorthand - important then non-important': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__ no-repeat!important;background:__ESCAPED_URL_CLEAN_CSS1__ repeat red}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background', true , false], ['__ESCAPED_URL_CLEAN_CSS0__'], ['no-repeat']]
        ]);
      }
    },
    'shorthand then shorthand - non-important then important': {
      'topic': 'p{background:__ESCAPED_URL_CLEAN_CSS0__ no-repeat;background:__ESCAPED_URL_CLEAN_CSS1__ repeat red!important}',
      'into': function (topic) {
        assert.deepEqual(_optimize(topic), [
          [['background', true , false], ['__ESCAPED_URL_CLEAN_CSS1__'], ['red']]
        ]);
      }
    }

      // 'aggressive off - overriddable': {
      //   'topic': 'a{background:white;color:red;background:red}',
      //   'into': function (topic) {
      //     assert.deepEqual(optimize(topic, false, false), [
      //       [['color', false , false], ['red']],
      //       [['background', false , false], ['red']]
      //     ]);
      //   }
      // }
  })
  .export(module);
