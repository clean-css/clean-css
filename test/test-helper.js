var assert = require('assert');

var CleanCSS = require('../lib/clean');
var tokenize = require('../lib/tokenizer/tokenize');
var SimpleOptimizer = require('../lib/selectors/simple');
var Compatibility = require('../lib/utils/compatibility');
var addOptimizationMetadata = require('../lib/selectors/optimization-metadata');

function optimizerContext(group, specs, options) {
  var context = {};
  options = options || {};
  options.shorthandCompacting = true;
  options.restructuring = true;

  function optimized(target) {
    return function (source) {
      assert.equal(new CleanCSS(options).minify(source).styles, target);
    };
  }

  for (var name in specs) {
    context[group + ' - ' + name] = {
      topic: specs[name][0],
      optimized: optimized(specs[name][1])
    };
  }

  return context;
}

function selectorContext(group, specs, options) {
  var context = {};
  options = options || {};
  options.compatibility = new Compatibility(options.compatibility).toOptions();

  function optimized(selectors) {
    return function (source) {
      var tokens = tokenize(source, { options: {} });
      new SimpleOptimizer(options).optimize(tokens);

      assert.deepEqual(tokens[0] ? tokens[0][1] : null, selectors);
    };
  }

  for (var name in specs) {
    context['selector - ' + group + ' - ' + name] = {
      topic: specs[name][0],
      optimized: optimized(specs[name][1])
    };
  }

  return context;
}

function propertyContext(group, specs, options) {
  var context = {};
  options = options || {};
  options.compatibility = new Compatibility(options.compatibility).toOptions();

  function optimized(selectors) {
    return function (source) {
      var tokens = tokenize(source, { options: {} });
      addOptimizationMetadata(tokens);
      new SimpleOptimizer(options).optimize(tokens);

      var value = tokens[0] ?
        tokens[0][2].map(function (property) {
          return typeof property == 'string' ?
            property :
            property.map(function (t) { return t[0]; });
        }) :
        null;

      assert.deepEqual(value, selectors);
    };
  }

  for (var name in specs) {
    context['property - ' + group + ' - ' + name] = {
      topic: specs[name][0],
      optimized: optimized(specs[name][1])
    };
  }

  return context;
}

module.exports = {
  optimizerContext: optimizerContext,
  selectorContext: selectorContext,
  propertyContext: propertyContext
};
