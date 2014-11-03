var vows = require('vows');
var assert = require('assert');
var path = require('path');
var CleanCSS = require('../index');

vows.describe('module tests').addBatch({
  'imported as a function': {
    topic: function() {
      var css = new CleanCSS();
      return css.minify.bind(css);
    },
    'should minify CSS correctly': function(minify) {
      assert.equal(minify('a{  color: #f00;  }').styles, 'a{color:red}');
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
      assert.equal(minified.styles, 'a{color:red}');
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
      assert.equal(minified.styles, 'a{color:red}');
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
      assert.equal(minified.styles, 'a{display:block}');
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
      assert.equal(minified.styles, 'a{display:block}p{color:red}');
    },
    'should raise no errors': function(error, minified, minifier) {
      assert.equal(minifier.errors.length, 0);
    },
    'should raise one warning': function(error, minified, minifier) {
      assert.equal(minifier.warnings.length, 1);
      assert.equal(minifier.warnings[0], 'Unexpected content: \'color:#535353}\'. Ignoring.');
    }
  },
  'warnings on invalid properties': {
    topic: function() {
      var minifier = new CleanCSS();
      var minified = minifier.minify('a{color:}');
      this.callback(null, minified, minifier);
    },
    'should minify correctly': function(error, minified) {
      assert.equal(minified.styles, '');
    },
    'should raise no errors': function(error, minified, minifier) {
      assert.equal(minifier.errors.length, 0);
    },
    'should raise one warning': function(error, minified, minifier) {
      assert.equal(minifier.warnings.length, 1);
      assert.equal(minifier.warnings[0], 'Empty property \'color\' inside \'a\' selector. Ignoring.');
    }
  },
  'warnings on broken urls': {
    topic: function () {
      var minifier = new CleanCSS();
      var minified = minifier.minify('a{background:url(image/}');
      this.callback(null, minified, minifier);
    },
    'should output correct content': function(error, minified) {
      assert.equal(minified, 'a{background:url(image/}');
    },
    'should raise no errors': function(error, minified, minifier) {
      assert.equal(minifier.errors.length, 0);
    },
    'should raise one warning': function(error, minified, minifier) {
      assert.equal(minifier.warnings.length, 1);
      assert.equal(minifier.warnings[0], 'Broken URL declaration: \'url(image/\'.');
    }
  },
  'warnings on broken imports': {
    topic: function () {
      var minifier = new CleanCSS();
      var minified = minifier.minify('@impor');
      this.callback(null, minified, minifier);
    },
    'should output correct content': function(error, minified) {
      assert.equal(minified, '');
    },
    'should raise no errors': function(error, minified, minifier) {
      assert.equal(minifier.errors.length, 0);
    },
    'should raise one warning': function(error, minified, minifier) {
      assert.equal(minifier.warnings.length, 1);
      assert.equal(minifier.warnings[0], 'Broken declaration: \'@impor\'.');
    }
  },
  'warnings on broken comments': {
    topic: function () {
      var minifier = new CleanCSS();
      var minified = minifier.minify('a{}/* ');
      this.callback(null, minified, minifier);
    },
    'should output correct content': function(error, minified) {
      assert.equal(minified, '');
    },
    'should raise no errors': function(error, minified, minifier) {
      assert.equal(minifier.errors.length, 0);
    },
    'should raise one warning': function(error, minified, minifier) {
      assert.equal(minifier.warnings.length, 1);
      assert.equal(minifier.warnings[0], 'Broken comment: \'/* \'.');
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
      assert.equal('.one{color:red}', minified.styles);
    }
  },
  'options': {
    'advanced': {
      'topic': new CleanCSS({ advanced: true }).minify('a{color:red}a{color:#fff}'),
      'gets right output': function (minified) {
        assert.equal('a{color:#fff}', minified.styles);
      }
    },
    'aggressive merging': {
      'topic': new CleanCSS({ aggressiveMerging: true }).minify('a{display:block;color:red;display:inline-block}'),
      'gets right output': function (minified) {
        assert.equal('a{color:red;display:inline-block}', minified.styles);
      }
    },
    'process import': {
      'topic': new CleanCSS({ processImport: true }).minify('@import url(/test/data/partials/one.css);'),
      'gets right output': function (minified) {
        assert.equal('.one{color:red}', minified.styles);
      }
    },
    'rebase': {
      'topic': new CleanCSS({ rebase: true, relativeTo: path.join(process.cwd(), 'test', 'data'), root: process.cwd() }).minify('div{background:url(./dummy.png)}'),
      'gets right output': function (minified) {
        assert.include(minified.styles, 'url(/test/data/dummy.png)');
      }
    }
  }
}).export(module);
