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

  var compatibility = new Compatibility().toOptions();
  var validator = new Validator(compatibility);
  optimize(tokens[0][1], tokens[0][2], false, true, { compatibility: compatibility, aggressiveMerging: true, shorthandCompacting: true }, { validator: validator });

  return tokens[0][2];
}

function longhandFirst(prefixedLonghand, prefixedShorthand, zeroValue) {
  return {
    'topic': function () {
      return _optimize('a{' + prefixedLonghand + ':inherit;' + prefixedShorthand + ':' + zeroValue + '}');
    },
    'has one token': function (body) {
      assert.lengthOf(body, 1);
    },
    'has zero value only': function (body) {
      assert.deepEqual(body[0][0], [prefixedShorthand]);
      assert.deepEqual(body[0][1], [zeroValue]);
    }
  };
}

function shorthandFirst(prefixedLonghand, prefixedShorthand, zeroValue) {
  return {
    'topic': function () {
      return _optimize('a{' + prefixedShorthand + ':' + zeroValue + ';' + prefixedLonghand + ':inherit}');
    },
    'has two tokens': function (body) {
      assert.lengthOf(body, 2);
    },
    'first is shorthand': function (body) {
      assert.deepEqual(body[0][0], [prefixedShorthand]);
      assert.deepEqual(body[0][1], [zeroValue]);
    },
    'second is longhand': function (body) {
      assert.deepEqual(body[1][0], [prefixedLonghand]);
      assert.deepEqual(body[1][1], ['inherit']);
    }
  };
}

function overrideContext(longhands) {
  var context = {};
  var vendorPrefixes = ['', '-moz-', '-o-', '-webkit-']; // there is no -ms-animation nor -ms-transition.
  var vendorPrefixesFor = ['animation', 'transition'];
  var defaultValues = {
    'list-style-image': 'none',
    'background': '0 0'
  };

  for (var longhand in longhands) {
    for (var i = 0; i < longhands[longhand].length; i++) {
      var shorthand = longhands[longhand][i];
      var prefixes = vendorPrefixesFor.indexOf(shorthand) > -1 ? vendorPrefixes : [''];

      for (var j = 0, m = prefixes.length; j < m; j++) {
        var prefixedLonghand = prefixes[j] + longhand;
        var prefixedShorthand = prefixes[j] + shorthand;
        var zeroValue = defaultValues[prefixedShorthand] || '0';

        context['should override ' + prefixedLonghand + ' with ' + prefixedShorthand] = longhandFirst(prefixedLonghand, prefixedShorthand, zeroValue);
        context['should not override ' + prefixedShorthand + ' shorthand with ' + prefixedLonghand] = shorthandFirst(prefixedLonghand, prefixedShorthand, zeroValue);
      }
    }
  }

  return context;
}

vows.describe(optimize)
  .addBatch(
    overrideContext({
      'animation-delay': ['animation'],
      'animation-direction': ['animation'],
      'animation-duration': ['animation'],
      'animation-fill-mode': ['animation'],
      'animation-iteration-count': ['animation'],
      'animation-name': ['animation'],
      'animation-play-state': ['animation'],
      'animation-timing-function': ['animation'],
      'background-attachment': ['background'],
      'background-clip': ['background'],
      'background-color': ['background'],
      'background-image': ['background'],
      'background-origin': ['background'],
      'background-position': ['background'],
      'background-repeat': ['background'],
      'background-size': ['background'],
      'border-color': ['border'],
      'border-style': ['border'],
      'border-width': ['border'],
      'border-bottom': ['border'],
      'border-bottom-color': ['border-bottom', 'border-color', 'border'],
      'border-bottom-style': ['border-bottom', 'border-style', 'border'],
      'border-bottom-width': ['border-bottom', 'border-width', 'border'],
      'border-left': ['border'],
      'border-left-color': ['border-left', 'border-color', 'border'],
      'border-left-style': ['border-left', 'border-style', 'border'],
      'border-left-width': ['border-left', 'border-width', 'border'],
      'border-right': ['border'],
      'border-right-color': ['border-right', 'border-color', 'border'],
      'border-right-style': ['border-right', 'border-style', 'border'],
      'border-right-width': ['border-right', 'border-width', 'border'],
      'border-top': ['border'],
      'border-top-color': ['border-top', 'border-color', 'border'],
      'border-top-style': ['border-top', 'border-style', 'border'],
      'border-top-width': ['border-top', 'border-width', 'border'],
      'font-family': ['font'],
      'font-size': ['font'],
      'font-style': ['font'],
      'font-variant': ['font'],
      'font-weight': ['font'],
      'list-style-image': ['list-style'],
      'list-style-position': ['list-style'],
      'list-style-type': ['list-style'],
      'margin-bottom': ['margin'],
      'margin-left': ['margin'],
      'margin-right': ['margin'],
      'margin-top': ['margin'],
      'outline-color': ['outline'],
      'outline-style': ['outline'],
      'outline-width': ['outline'],
      'padding-bottom': ['padding'],
      'padding-left': ['padding'],
      'padding-right': ['padding'],
      'padding-top': ['padding'],
      'transition-delay': ['transition'],
      'transition-duration': ['transition'],
      'transition-property': ['transition'],
      'transition-timing-function': ['transition']
    })
  )
  .export(module);
