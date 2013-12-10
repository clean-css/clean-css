var vows = require('vows');
var assert = require('assert');
var CleanCSS = require('../index');

vows.describe('module tests').addBatch({
  'imported as a function': {
    topic: function() {
      var css = new CleanCSS();
      return css.minify.bind(css);
    },
    'should minify CSS correctly': function(minify) {
      assert.equal(minify('a{  color: #f00;  }'), 'a{color:red}');
    }
  },
  'initialization without new (back-compat)': {
    topic: function() {
      return CleanCSS();
    },
    'should have stats, errors, etc.': function(css) {
      assert.isObject(css.stats);
      assert.isArray(css.errors);
      assert.isArray(css.warnings);
      assert.isString(css.lineBreak);
    },
    'should minify CSS correctly': function(css) {
      assert.equal(css.minify('a{  color: #f00;  }'), 'a{color:red}');
    }
  },
  'extended via prototype': {
    topic: function() {
      CleanCSS.prototype.foo = function(data, callback) {
        callback(null, this.minify(data));
      };
      new CleanCSS().foo('a{  color: #f00;  }', this.callback);
    },
    'should minify CSS correctly': function(error, minified) {
      assert.equal(minified, 'a{color:red}');
    },
    teardown: function() {
      delete CleanCSS.prototype.foo;
    }
  },
  'with callback passed and no errors': {
    topic: function() {
      new CleanCSS().minify('a{color:#f00}', this.callback);
    },
    'should correctly set context': function() {
      assert.equal(true, this instanceof CleanCSS);
    },
    'should yield no error': function(errors, minified) {
      /* jshint unused: false */
      assert.equal(errors, null);
    },
    'should yield minified data': function(errors, minified) {
      assert.equal(minified, 'a{color:red}');
    }
  },
  'with callback passed and one error': {
    topic: function() {
      new CleanCSS().minify('@import "missing.css";', this.callback);
    },
    'should yield no error and minify': function(errors, minified) {
      /* jshint unused: false */
      assert.equal(errors.length, 1);
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
      var minifier = new CleanCSS({
          root: 'test/data',
          target: 'custom-warnings.css'
        });
      minifier.minify('a{color:red}');
      return minifier;
    },
    'if both root and output used reasons given': function(minifier) {
      assert.equal(minifier.warnings.length, 1);
      assert.match(minifier.warnings[0], /Both 'root' and output file given/);
    }
  },
  'warnings on extra closing brace': {
    topic: function() {
      var minifier = new CleanCSS();
      var minified = minifier.minify('a{display:block}}');
      this.callback(null, minified, minifier);
    },
    'should minify correctly': function(error, minified) {
      assert.equal(minified, 'a{display:block}');
    },
    'should raise no errors': function(error, minified, minifier) {
      assert.equal(minifier.errors.length, 0);
    },
    'should raise one warning': function(error, minified, minifier) {
      assert.equal(minifier.warnings.length, 1);
      assert.equal(minifier.warnings[0], 'Unexpected \'}\' in \'a{display:block}}\'. Ignoring.');
    }
  },
  'warnings on unexpected body': {
    topic: function() {
      var minifier = new CleanCSS();
      var minified = minifier.minify('a{display:block}color:#535353}p{color:red}');
      this.callback(null, minified, minifier);
    },
    'should minify correctly': function(error, minified) {
      assert.equal(minified, 'a{display:block}p{color:red}');
    },
    'should raise no errors': function(error, minified, minifier) {
      assert.equal(minifier.errors.length, 0);
    },
    'should raise one warning': function(error, minified, minifier) {
      assert.equal(minifier.warnings.length, 1);
      assert.equal(minifier.warnings[0], 'Unexpected content: \'color:#535353}\'. Ignoring.');
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
        minifier.minify('@import url(/some/fake/file);', function(errors) {
          assert.equal(errors.length, 1);
          assert.equal(errors[0], 'Broken @import declaration of "/some/fake/file"');
        });
      });
    }
  },
  'buffer passed in': {
    'topic': function() {
      return new CleanCSS().minify(new Buffer('@import url(test/data/partials/one.css);'));
    },
    'should be processed correctly': function(minified) {
      assert.equal('.one{color:red}', minified);
    }
  }
}).export(module);
