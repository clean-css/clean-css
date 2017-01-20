var assert = require('assert');
var vows = require('vows');

var optimizeProperties = require('../../../../lib/optimizer/level-2/properties/optimize');

var tokenize = require('../../../../lib/tokenizer/tokenize');
var inputSourceMapTracker = require('../../../../lib/reader/input-source-map-tracker');
var compatibilityFrom = require('../../../../lib/options/compatibility');
var validator = require('../../../../lib/optimizer/validator');

function _optimize(source) {
  var tokens = tokenize(source, {
    inputSourceMapTracker: inputSourceMapTracker(),
    options: {},
    warnings: []
  });

  var compat = compatibilityFrom();
  var options = {
    compatibility: compat,
    level: {
      2: {
        mergeIntoShorthands: true,
        mergeMedia: true,
        mergeSemantically: false,
        overrideProperties: true,
        restructureRules: true
      }
    }
  };
  optimizeProperties(
    tokens[0][2],
    true,
    true,
    { options: options, validator: validator(compat) }
  );

  return tokens[0][2];
}

function longhandFirst(prefixedLonghand, prefixedShorthand, zeroValue) {
  return {
    'topic': function () {
      return _optimize('a{' + prefixedLonghand + ':inherit;' + prefixedShorthand + ':' + zeroValue + '}');
    },
    'has one token': function (properties) {
      assert.lengthOf(properties, 1);
    },
    'has zero value only': function (properties) {
      assert.deepEqual(properties[0][1][1], prefixedShorthand);
      assert.deepEqual(properties[0][2][1], zeroValue);
    }
  };
}

function shorthandFirst(prefixedLonghand, prefixedShorthand, zeroValue) {
  return {
    'topic': function () {
      return _optimize('a{' + prefixedShorthand + ':' + zeroValue + ';' + prefixedLonghand + ':inherit}');
    },
    'has two tokens': function (properties) {
      assert.lengthOf(properties, 2);
    },
    'first is shorthand': function (properties) {
      assert.deepEqual(properties[0][1][1], prefixedShorthand);
      assert.deepEqual(properties[0][2][1], zeroValue);
    },
    'second is longhand': function (properties) {
      assert.deepEqual(properties[1][1][1], prefixedLonghand);
      assert.deepEqual(properties[1][2][1], 'inherit');
    }
  };
}

function overrideContext(longhands) {
  var context = {};
  var vendorPrefixes = ['', '-moz-', '-o-', '-webkit-']; // there is no -ms-animation nor -ms-transition.
  var vendorPrefixesFor = ['animation', 'transition'];
  var defaultValues = {
    'list-style-image': 'none',
    'background': '0 0',
    'border-color': 'red',
    'border-style': 'none',
    'list-style': 'none'
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

vows.describe(optimizeProperties)
  .addBatch(
    overrideContext({
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
      'padding-top': ['padding']
    })
  )
  .export(module);
