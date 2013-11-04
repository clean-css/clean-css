var vows = require('vows');
var assert = require('assert');
var CleanCSS = require('../index');

vows.describe('clean-custom').addBatch({
  'imported as a function': {
    topic: function() {
      return new CleanCSS().minify;
    },
    'should process CSS correctly': function(process) {
      assert.equal(process('a{  color: #f00;  }'), 'a{color:red}');
    }
  },
  'no debug': {
    topic: function() {
      var minifier = new CleanCSS();
      minifier.minify('a{ color: #f00 }');
      return minifier;
    },
    'should not populate stats hash': function(minifier) {
      assert.deepEqual({}, minifier.stats);
    }
  },
  'debug': {
    topic: function() {
      var minifier = new CleanCSS({ debug: true });
      minifier.minify('a{ color: #f00 }');
      return minifier;
    },
    'should give time taken': function(minifier) {
      assert.isNumber(minifier.stats.timeSpent);
    },
    'should give original size': function(minifier) {
      assert.equal(minifier.stats.originalSize, 16);
    },
    'should give minified size': function(minifier) {
      assert.equal(minifier.stats.minifiedSize, 12);
    },
    'should give efficiency': function(minifier) {
      assert.equal(minifier.stats.efficiency, 0.25);
    }
  }
}).export(module);
