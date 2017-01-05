var assert = require('assert');

var CleanCSS = require('../lib/clean');

function optimizerContext(group, specs, options) {
  var context = {};
  options = options || {};

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

module.exports = {
  optimizerContext: optimizerContext
};
