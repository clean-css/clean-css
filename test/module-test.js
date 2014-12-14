var vows = require('vows');
var assert = require('assert');
var path = require('path');
var CleanCSS = require('../index');
var SourceMapGenerator = require('source-map').SourceMapGenerator;

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
    'should not set context': function() {
      assert.equal(false, this instanceof CleanCSS);
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
    'topic': new CleanCSS().minify('a{ color: #f00 }'),
    'should not populate stats hash': function (error, minified) {
      assert.deepEqual({}, minified.stats);
    }
  },
  'debug': {
    'topic': new CleanCSS({ debug: true }).minify('a{ color: #f00 }'),
    'should give time taken': function (error, minified) {
      assert.isNumber(minified.stats.timeSpent);
    },
    'should give original size': function (error, minified) {
      assert.equal(minified.stats.originalSize, 16);
    },
    'should give minified size': function (error, minified) {
      assert.equal(minified.stats.minifiedSize, 12);
    },
    'should give efficiency': function (error, minified) {
      assert.equal(minified.stats.efficiency, 0.25);
    }
  },
  'no warnings': {
    'topic': new CleanCSS().minify('a{ color: #f00 }'),
    'if no reasons given': function (error, minified) {
      assert.deepEqual(minified.warnings, []);
    }
  },
  'warnings': {
    'topic': new CleanCSS({ root: 'test/data', target: 'custom-warnings.css' }).minify('a{color:red}'),
    'if both root and output used reasons given': function (error, minified) {
      assert.equal(minified.warnings.length, 1);
      assert.match(minified.warnings[0], /Both 'root' and output file given/);
    }
  },
  'warnings on extra closing brace': {
    'topic': new CleanCSS().minify('a{display:block}}'),
    'should minify correctly': function (error, minified) {
      assert.equal(minified.styles, 'a{display:block}');
    },
    'should raise no errors': function (error, minified) {
      assert.equal(minified.errors.length, 0);
    },
    'should raise one warning': function (error, minified) {
      assert.equal(minified.warnings.length, 1);
      assert.equal(minified.warnings[0], 'Unexpected \'}\' in \'a{display:block}}\'. Ignoring.');
    }
  },
  'warnings on unexpected body': {
    'topic': new CleanCSS().minify('a{display:block}color:#535353}p{color:red}'),
    'should minify correctly': function (error, minified) {
      assert.equal(minified.styles, 'a{display:block}p{color:red}');
    },
    'should raise no errors': function (error, minified) {
      assert.equal(minified.errors.length, 0);
    },
    'should raise one warning': function (error, minified) {
      assert.equal(minified.warnings.length, 1);
      assert.equal(minified.warnings[0], 'Unexpected content: \'color:#535353}\'. Ignoring.');
    }
  },
  'warnings on invalid properties': {
    'topic': new CleanCSS().minify('a{color:}'),
    'should minify correctly': function (error, minified) {
      assert.equal(minified.styles, '');
    },
    'should raise no errors': function (error, minified) {
      assert.equal(minified.errors.length, 0);
    },
    'should raise one warning': function (error, minified) {
      assert.equal(minified.warnings.length, 1);
      assert.equal(minified.warnings[0], 'Empty property \'color\' inside \'a\' selector. Ignoring.');
    }
  },
  'warnings on broken urls': {
    'topic': new CleanCSS().minify('a{background:url(image/}'),
    'should output correct content': function (error, minified) {
      assert.equal(minified.styles, 'a{background:url(image/}');
    },
    'should raise no errors': function (error, minified) {
      assert.equal(minified.errors.length, 0);
    },
    'should raise one warning': function (error, minified) {
      assert.equal(minified.warnings.length, 1);
      assert.equal(minified.warnings[0], 'Broken URL declaration: \'url(image/\'.');
    }
  },
  'warnings on broken imports': {
    'topic': new CleanCSS().minify('@impor'),
    'should output correct content': function (error, minified) {
      assert.equal(minified.styles, '');
    },
    'should raise no errors': function (error, minified) {
      assert.equal(minified.errors.length, 0);
    },
    'should raise one warning': function (error, minified) {
      assert.equal(minified.warnings.length, 1);
      assert.equal(minified.warnings[0], 'Broken declaration: \'@impor\'.');
    }
  },
  'warnings on broken comments': {
    'topic': new CleanCSS().minify('a{}/* '),
    'should output correct content': function (error, minified) {
      assert.equal(minified.styles, '');
    },
    'should raise no errors': function (error, minified) {
      assert.equal(minified.errors.length, 0);
    },
    'should raise one warning': function (error, minified) {
      assert.equal(minified.warnings.length, 1);
      assert.equal(minified.warnings[0], 'Broken comment: \'/* \'.');
    }
  },
  'no errors': {
    'topic': new CleanCSS().minify('a{color:red}'),
    'if no reasons given': function (error, minified) {
      assert.deepEqual(minified.errors, []);
    }
  },
  'errors': {
    'topic': new CleanCSS(),
    'if both root and output used reasons given': function(minifier) {
      assert.doesNotThrow(function() {
        minifier.minify('@import url(/some/fake/file);', function(errors) {
          assert.equal(errors.length, 1);
          assert.equal(errors[0], 'Broken @import declaration of "/some/fake/file"');
        });
      });
    }
  },
  'errors when re-running minification': {
    'topic': new CleanCSS(),
    'if both root and output used reasons given': function (minifier) {
      minifier.minify('@import url(/some/fake/file);');
      minifier.minify('@import url(/some/fake/file);', function(errors) {
        assert.equal(errors.length, 1);
        assert.equal(errors[0], 'Broken @import declaration of "/some/fake/file"');
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
  },
  'source map': {
    'topic': new CleanCSS({ sourceMap: true }).minify('/*! a */div[data-id=" abc "] { color:red; }'),
    'should minify correctly': function (minified) {
      assert.equal('/*! a */div[data-id=" abc "]{color:red}', minified.styles);
    },
    'should include source map': function (minified) {
      assert.instanceOf(minified.sourceMap, SourceMapGenerator);
    }
  },
  'accepts a list of source files as array': {
    'rebased to the current dir': {
      'relative': {
        'topic': new CleanCSS().minify(['test/data/partials/one.css', 'test/data/partials/three.css']),
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{background-image:url(test/data/partials/extra/down.gif)}');
        }
      },
      'absolute': {
        'topic': new CleanCSS({ relativeTo: process.cwd() }).minify([path.resolve('test/data/partials/one.css'), path.resolve('test/data/partials/three.css')]),
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{background-image:url(test/data/partials/extra/down.gif)}');
        }
      }
    },
    'rebased to a path': {
      'relative': {
        'topic': new CleanCSS({ relativeTo: 'test/data' }).minify(['test/data/partials/one.css', 'test/data/partials/three.css']),
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{background-image:url(partials/extra/down.gif)}');
        }
      },
      'absolute': {
        'topic': new CleanCSS({ relativeTo: 'test/data' }).minify([path.resolve('test/data/partials/one.css'), path.resolve('test/data/partials/three.css')]),
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{background-image:url(partials/extra/down.gif)}');
        }
      }
    },
    'rebased to root': {
      'relative': {
        'topic': new CleanCSS({ root: 'test/data', relativeTo: 'test/data' }).minify(['test/data/partials/one.css', 'test/data/partials/three.css']),
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{background-image:url(/partials/extra/down.gif)}');
        }
      },
      'absolute': {
        'topic': new CleanCSS({ root: 'test/data', relativeTo: 'test/data' }).minify([path.resolve('test/data/partials/one.css'), path.resolve('test/data/partials/three.css')]),
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{background-image:url(/partials/extra/down.gif)}');
        }
      }
    },
    'with imports off': {
      'topic': new CleanCSS({ processImport: false }).minify(['./test/data/partials/two.css']),
      'should give right output': function (minified) {
        assert.equal(minified.styles, '@import url(one.css);@import url(extra/three.css);@import url(./extra/four.css);.two{color:#fff}');
      }
    }
  }
}).export(module);
