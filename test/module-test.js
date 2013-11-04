var vows = require('vows');
var assert = require('assert');
var CleanCSS = require('../index');

vows.describe('module tests').addBatch({
  'imported as a function': {
    topic: function() {
      return new CleanCSS().minify;
    },
    'should minify CSS correctly': function(minify) {
      assert.equal(minify('a{  color: #f00;  }'), 'a{color:red}');
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
  },
  'no warnings': {
    topic: function() {
      var minifier = new CleanCSS();
      minifier.minify('a{color:red}');
      return minifier;
    },
    'if no reasons given': function(minifier) {
      assert.deepEqual(minifier.warnings, []);
    }
  },
  'warnings': {
    topic: function() {
      var minifier = new CleanCSS({ root: 'test/data', target: 'custom-warnings.css' });
      minifier.minify('a{color:red}');
      return minifier;
    },
    'if both root and output used reasons given': function(minifier) {
      assert.equal(minifier.warnings.length, 1);
      assert.match(minifier.warnings[0], /Both 'root' and output file given/);
    }
  },
  'no errors': {
    topic: function() {
      var minifier = new CleanCSS();
      minifier.minify('a{color:red}');
      return minifier;
    },
    'if no reasons given': function(minifier) {
      assert.deepEqual(minifier.errors, []);
    }
  },
  'errors': {
    topic: function() {
      return new CleanCSS();
    },
    'if both root and output used reasons given': function(minifier) {
      assert.doesNotThrow(function() {
        minifier.minify('@import url(/some/fake/file);');
      });
      assert.equal(minifier.errors.length, 1);
      assert.equal(minifier.errors[0], 'Broken @import declaration of "/some/fake/file"');
    }
  },
}).export(module);
