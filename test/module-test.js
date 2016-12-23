var vows = require('vows');
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var CleanCSS = require('../index');
var SourceMapGenerator = require('source-map').SourceMapGenerator;

function sourcesAsHash(sources, resolve) {
  var inputHash = {};

  sources.forEach(function (source) {
    source = resolve ? path.resolve(source) : source;

    inputHash[source] = {
      styles: fs.readFileSync(source, 'utf-8')
    };
  });

  return inputHash;
}

vows.describe('module tests').addBatch({
  'imported as a function': {
    topic: function () {
      var css = new CleanCSS();
      return css.minify.bind(css);
    },
    'should minify CSS correctly': function (minify) {
      assert.equal(minify('a{  color: #f00;  }').styles, 'a{color:red}');
    }
  },
  'extended via prototype': {
    topic: function () {
      CleanCSS.prototype.foo = function (data, callback) {
        callback(null, this.minify(data));
      };
      new CleanCSS().foo('a{  color: #f00;  }', this.callback);
    },
    'should minify CSS correctly': function (error, minified) {
      assert.equal(minified.styles, 'a{color:red}');
    },
    teardown: function () {
      delete CleanCSS.prototype.foo;
    }
  },
  'with callback passed and no errors': {
    topic: function () {
      new CleanCSS().minify('a{color:#f00}', this.callback);
    },
    'should not set context': function () {
      assert.equal(this instanceof CleanCSS, false);
    },
    'should yield no error': function (errors, minified) {
      /* jshint unused: false */
      assert.isNull(errors);
    },
    'should yield minified data': function (errors, minified) {
      assert.equal(minified.styles, 'a{color:red}');
    }
  },
  'with callback passed and one error': {
    topic: function () {
      new CleanCSS().minify('@import "missing.css";', this.callback);
    },
    'should yield no error and minify': function (errors, minified) {
      /* jshint unused: false */
      assert.lengthOf(errors, 1);
    }
  },
  'with callback passed to remote import': {
    topic: function () {
      new CleanCSS({ processImportFrom: ['local'] }).minify('@import url(https://fonts.googleapis.com/css?family=Open+Sans);', this.callback);
    },
    'should yield no error and minify': function (errors, minified) {
      assert.equal(minified.styles, '@import url(https://fonts.googleapis.com/css?family=Open+Sans);');
    }
  },
  'debug info': {
    'topic': function () {
      return new CleanCSS().minify('a{ color: #f00 }');
    },
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
    'topic': function () {
      return new CleanCSS().minify('a{ color: #f00 }');
    },
    'if no reasons given': function (error, minified) {
      assert.isEmpty(minified.warnings);
    }
  },
  'warnings on extra closing brace': {
    'topic': function () {
      return new CleanCSS().minify('a{display:block}}');
    },
    'should minify correctly': function (error, minified) {
      assert.equal(minified.styles, 'a{display:block}');
    },
    'should raise no errors': function (error, minified) {
      assert.isEmpty(minified.errors);
    },
    'should raise one warning': function (error, minified) {
      assert.lengthOf(minified.warnings, 2);
      assert.equal(minified.warnings[0], 'Unexpected \'}\' at 1:16.');
      assert.equal(minified.warnings[1], 'Invalid character(s) \'}\' at 1:16. Ignoring.');
    }
  },
  'warnings on unexpected body': {
    'topic': function () {
      return new CleanCSS().minify('a{display:block}color:#535353}p{color:red}');
    },
    'should minify correctly': function (error, minified) {
      assert.equal(minified.styles, 'a{display:block}');
    },
    'should raise no errors': function (error, minified) {
      assert.isEmpty(minified.errors);
    },
    'should raise one warning': function (error, minified) {
      assert.lengthOf(minified.warnings, 2);
      assert.equal(minified.warnings[0], 'Unexpected \'}\' at 1:29.');
      assert.equal(minified.warnings[1], 'Invalid selector \'color:#535353}p\' at 1:16. Ignoring.');
    }
  },
  'warning on invalid property': {
    'topic': function () {
      return new CleanCSS().minify('a{-webkit-:0px}');
    },
    'should minify correctly': function (error, minified) {
      assert.isEmpty(minified.styles);
    },
    'should raise no errors': function (error, minified) {
      assert.isEmpty(minified.errors);
    },
    'should raise one warning': function (error, minified) {
      assert.lengthOf(minified.warnings, 1);
      assert.equal(minified.warnings[0], 'Invalid property name \'-webkit-\' at 1:2. Ignoring.');
    }
  },
  'warnings on empty properties': {
    'topic': function () {
      return new CleanCSS().minify('a{color:}');
    },
    'should minify correctly': function (error, minified) {
      assert.isEmpty(minified.styles);
    },
    'should raise no errors': function (error, minified) {
      assert.isEmpty(minified.errors);
    },
    'should raise one warning': function (error, minified) {
      assert.lengthOf(minified.warnings, 1);
      assert.equal(minified.warnings[0], 'Empty property \'color\' at 1:2. Ignoring.');
    }
  },
  'warnings on broken urls': {
    'topic': function () {
      return new CleanCSS().minify('a{background:url(image/}');
    },
    'should output correct content': function (error, minified) {
      assert.equal(minified.styles, '');
    },
    'should raise no errors': function (error, minified) {
      assert.isEmpty(minified.errors.length);
    },
    'should raise one warning': function (error, minified) {
      assert.lengthOf(minified.warnings, 2);
      assert.equal(minified.warnings[0], 'Missing \'}\' at 1:24.');
      assert.equal(minified.warnings[1], 'Broken URL \'url(image/\' at 1:13. Ignoring.');
    }
  },
  'no errors': {
    'topic': function () {
      return new CleanCSS().minify('a{color:red}');
    },
    'if no reasons given': function (error, minified) {
      assert.isEmpty(minified.errors);
    }
  },
  'errors': {
    'topic': function () {
      return new CleanCSS();
    },
    'if a file is missing': function (minifier) {
      assert.doesNotThrow(function () {
        minifier.minify('@import url(/some/fake/file);', function (errors) {
          assert.isArray(errors);
          assert.lengthOf(errors, 1);
          assert.equal(errors[0], 'Ignoring local @import of "/some/fake/file" as resource is missing.');
        });
      });
    }
  },
  'errors when re-running minification': {
    'topic': function () {
      return new CleanCSS();
    },
    'if file is missing': function (minifier) {
      minifier.minify('@import url(/some/fake/file);');
      minifier.minify('@import url(/some/fake/file);', function (errors) {
        assert.lengthOf(errors, 1);
        assert.equal(errors[0], 'Ignoring local @import of "/some/fake/file" as resource is missing.');
      });
    }
  },
  'error on broken imports': {
    'topic': function () {
      return new CleanCSS().minify('@import test;');
    },
    'should output correct content': function (error, minified) {
      assert.isEmpty(minified.styles);
    },
    'should raise no warnings': function (error, minified) {
      assert.isEmpty(minified.warnings.length);
    },
    'should raise one error': function (error, minified) {
      assert.lengthOf(minified.errors, 1);
      assert.equal(minified.errors[0], 'Ignoring local @import of "test" as resource is missing.');
    }
  },
  'local imports': {
    'inside a comment preceding a quote': {
      'topic': function () {
        new CleanCSS().minify('@import "test/fixtures/partials/with-commented-import.css";', this.callback);
      },
      'has right output': function (errors, minified) {
        assert.equal(minified.styles, '@font-face{font-family:Font;src:url(/path/to/font)}');
      }
    }
  },
  'external imports and no callback': {
    'without content': {
      'topic': function () {
        return new CleanCSS().minify('@import url(http://jakubpawlowicz.com/styles.css);');
      },
      'has right output': function (minified) {
        assert.equal(minified.styles, '@import url(http://jakubpawlowicz.com/styles.css);');
      },
      'has no errors': function (minified) {
        assert.isEmpty(minified.errors);
      },
      'has a warning': function (minified) {
        assert.deepEqual(minified.warnings, ['Skipping remote @import of "http://jakubpawlowicz.com/styles.css" as no callback given.']);
      }
    },
    'after content': {
      'topic': function () {
        return new CleanCSS().minify('a{color:red}@import url(http://jakubpawlowicz.com/styles.css);');
      },
      'has right output': function (minified) {
        assert.equal(minified.styles, 'a{color:red}');
      },
      'has no errors': function (minified) {
        assert.isEmpty(minified.errors);
      },
      'has a warning': function (minified) {
        assert.deepEqual(minified.warnings, ['Ignoring remote @import of "http://jakubpawlowicz.com/styles.css" as no callback given and after other content.']);
      }
    },
    'after local import': {
      'topic': function () {
        return new CleanCSS().minify('@import url(test/fixtures/partials/one.css);@import url(http://jakubpawlowicz.com/styles.css);');
      },
      'has right output': function (minified) {
        assert.equal(minified.styles, '.one{color:red}');
      },
      'has no errors': function (minified) {
        assert.isEmpty(minified.errors);
      },
      'has a warning': function (minified) {
        assert.deepEqual(minified.warnings, ['Skipping remote @import of "http://jakubpawlowicz.com/styles.css" as no callback given.']);
      }
    },
    'after remote import': {
      'topic': function () {
        return new CleanCSS().minify('@import url(http://jakubpawlowicz.com/reset.css);@import url(http://jakubpawlowicz.com/styles.css);');
      },
      'has right output': function (minified) {
        assert.equal(minified.styles, '@import url(http://jakubpawlowicz.com/reset.css);@import url(http://jakubpawlowicz.com/styles.css);');
      },
      'has no errors': function (minified) {
        assert.isEmpty(minified.errors);
      },
      'has a warning': function (minified) {
        assert.deepEqual(minified.warnings, [
          'Skipping remote @import of "http://jakubpawlowicz.com/reset.css" as no callback given.',
          'Skipping remote @import of "http://jakubpawlowicz.com/styles.css" as no callback given.'
        ]);
      }
    }
  },
  'buffer passed in': {
    'topic': function () {
      return new CleanCSS().minify(new Buffer('@import url(test/fixtures/partials/one.css);'));
    },
    'should be processed correctly': function (minified) {
      assert.equal(minified.styles, '.one{color:red}');
    }
  },
  'options': {
    'advanced': {
      'topic': function () {
        return new CleanCSS({ advanced: true }).minify('a{color:red}a{color:#fff}');
      },
      'gets right output': function (minified) {
        assert.equal(minified.styles, 'a{color:#fff}');
      }
    },
    'aggressive merging': {
      'topic': function () {
        return new CleanCSS({ aggressiveMerging: true }).minify('a{display:block;color:red;display:inline-block}');
      },
      'gets right output': function (minified) {
        assert.equal(minified.styles, 'a{color:red;display:inline-block}');
      }
    },
    'process import': {
      'topic': function () {
        return new CleanCSS({ processImport: true }).minify('@import url(/test/fixtures/partials/one.css);');
      },
      'gets right output': function (minified) {
        assert.equal(minified.styles, '.one{color:red}');
      }
    },
    'rebase': {
      'topic': function () {
        return new CleanCSS({ rebase: true, rebaseTo: path.join('test') }).minify('div{background:url(dummy.png)}');
      },
      'gets right output': function (minified) {
        assert.include(minified.styles, 'url(../dummy.png)');
      }
    },
    'restructuring - on': {
      'topic': function () {
        new CleanCSS({ restructuring: true }).minify('div{margin-top:0}.one{margin:0}.two{display:block;margin-top:0}', this.callback);
      },
      'gets right output': function (minified) {
        assert.equal(minified.styles, '.two,div{margin-top:0}.one{margin:0}.two{display:block}');
      }
    },
    'restructuring - off': {
      'topic': function () {
        return new CleanCSS({ restructuring: false }).minify('div{margin-top:0}.one{margin:0}.two{display:block;margin-top:0}');
      },
      'gets right output': function (minified) {
        assert.equal(minified.styles, 'div{margin-top:0}.one{margin:0}.two{display:block;margin-top:0}');
      }
    },
    'semantic merging - off': {
      'topic': function () {
        return new CleanCSS().minify('.a{margin:0}.b{margin:10px;padding:0}.c{margin:0}');
      },
      'gets right output': function (minified) {
        assert.equal(minified.styles, '.a{margin:0}.b{margin:10px;padding:0}.c{margin:0}');
      }
    },
    'semantic merging - on': {
      'topic': function () {
        return new CleanCSS({ semanticMerging: true }).minify('.a{margin:0}.b{margin:10px;padding:0}.c{margin:0}');
      },
      'gets right output': function (minified) {
        assert.equal(minified.styles, '.a,.c{margin:0}.b{margin:10px;padding:0}');
      }
    }
  },
  'source map': {
    'topic': function () {
      return new CleanCSS({ sourceMap: true }).minify('/*! a */div[data-id=" abc "] { color:red; }');
    },
    'should minify correctly': function (minified) {
      assert.equal(minified.styles, '/*! a */div[data-id=" abc "]{color:red}');
    },
    'should include source map': function (minified) {
      assert.instanceOf(minified.sourceMap, SourceMapGenerator);
    }
  },
  'accepts a list of source files as array': {
    'relative': {
      'with rebase to the current directory': {
        'topic': function () {
          return new CleanCSS().minify([
            'test/fixtures/partials/one.css',
            'test/fixtures/partials/three.css'
          ]);
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{background-image:url(test/fixtures/partials/extra/down.gif)}');
        }
      },
      'with rebase to a custom directory': {
        'topic': function () {
          return new CleanCSS({ rebaseTo: path.join('test', 'fixtures') }).minify([
            'test/fixtures/partials/one.css',
            'test/fixtures/partials/three.css'
          ]);
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{background-image:url(partials/extra/down.gif)}');
        }
      },
      'without rebase': {
        'topic': function () {
          return new CleanCSS({ rebase: false }).minify([
            'test/fixtures/partials/one.css',
            'test/fixtures/partials/three.css'
          ]);
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{background-image:url(extra/down.gif)}');
        }
      }
    },
    'absolute': {
      'with rebase to the current directory': {
        'topic': function () {
          return new CleanCSS().minify([
            path.resolve('test/fixtures/partials/one.css'),
            path.resolve('test/fixtures/partials/three.css')
          ]);
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{background-image:url(test/fixtures/partials/extra/down.gif)}');
        }
      },
      'with rebase to a custom directory': {
        'topic': function () {
          return new CleanCSS({ rebaseTo: path.join('test', 'fixtures') }).minify([
            path.resolve('test/fixtures/partials/one.css'),
            path.resolve('test/fixtures/partials/three.css')
          ]);
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{background-image:url(partials/extra/down.gif)}');
        }
      },
      'without rebase': {
        'topic': function () {
          return new CleanCSS({ rebase: false }).minify([
            path.resolve('test/fixtures/partials/one.css'),
            path.resolve('test/fixtures/partials/three.css')
          ]);
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{background-image:url(extra/down.gif)}');
        }
      }
    },
    'with imports': {
      'off - one file': {
        'topic': function () {
          return new CleanCSS({ processImport: false }).minify(['./test/fixtures/partials/two.css']);
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '@import url(test/fixtures/partials/one.css);@import url(test/fixtures/partials/extra/three.css);@import url(test/fixtures/partials/extra/four.css);.two{color:#fff}');
        }
      },
      'off - many files': {
        'topic': function () {
          return new CleanCSS({ processImport: false }).minify(['./test/fixtures/partials/remote.css', './test/fixtures/partials-absolute/base.css']);
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '@import url(http://jakubpawlowicz.com/styles.css);@import url(test/fixtures/partials-absolute/extra/sub.css);.base{margin:0}');
        }
      },
      'off - many files with content': {
        'topic': function () {
          return new CleanCSS({ processImport: false }).minify(['./test/fixtures/partials/two.css', './test/fixtures/partials-absolute/base.css']);
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '@import url(test/fixtures/partials/one.css);@import url(test/fixtures/partials/extra/three.css);@import url(test/fixtures/partials/extra/four.css);.two{color:#fff}.base{margin:0}');
        }
      }
    }
  },
  'accepts a list of source files as hash': {
    'relative': {
      'with rebase to the current directory': {
        'topic': function () {
          return new CleanCSS().minify(
            sourcesAsHash([
              'test/fixtures/partials/one.css',
              'test/fixtures/partials/three.css'
            ])
          );
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{background-image:url(test/fixtures/partials/extra/down.gif)}');
        }
      },
      'with rebase to a custom directory': {
        'topic': function () {
          return new CleanCSS({ rebaseTo: path.join('test', 'fixtures') }).minify(
            sourcesAsHash([
              'test/fixtures/partials/one.css',
              'test/fixtures/partials/three.css'
            ])
          );
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{background-image:url(partials/extra/down.gif)}');
        }
      },
      'without rebase': {
        'topic': function () {
          return new CleanCSS({ rebase: false }).minify(
            sourcesAsHash([
              'test/fixtures/partials/one.css',
              'test/fixtures/partials/three.css'
            ])
          );
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{background-image:url(extra/down.gif)}');
        }
      }
    },
    'absolute': {
      'with rebase to the current directory': {
        'topic': function () {
          return new CleanCSS().minify(
            sourcesAsHash([
              'test/fixtures/partials/one.css',
              'test/fixtures/partials/three.css'
            ], true)
          );
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{background-image:url(test/fixtures/partials/extra/down.gif)}');
        }
      },
      'with rebase to a custom directory': {
        'topic': function () {
          return new CleanCSS({ rebaseTo: path.join('test', 'fixtures') }).minify(
            sourcesAsHash([
              'test/fixtures/partials/one.css',
              'test/fixtures/partials/three.css'
            ], true)
          );
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{background-image:url(partials/extra/down.gif)}');
        }
      },
      'without rebase': {
        'topic': function () {
          return new CleanCSS({ rebase: false }).minify(
            sourcesAsHash([
              'test/fixtures/partials/one.css',
              'test/fixtures/partials/three.css'
            ], true)
          );
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{background-image:url(extra/down.gif)}');
        }
      }
    },
    'with other imports': {
      'topic': function () {
        return new CleanCSS().minify(
          sourcesAsHash([
            'test/fixtures/partials/two.css'
          ])
        );
      },
      'should give right output': function (minified) {
        assert.equal(minified.styles, '.one{color:red}.three{color:#0f0}.four{color:#00f}.two{color:#fff}');
      }
    },
    'with other imports and rebasing off': {
      'topic': function () {
        return new CleanCSS({ rebase: false }).minify(
          sourcesAsHash([
            'test/fixtures/partials/two.css'
          ])
        );
      },
      'should give right output': function (minified) {
        assert.equal(minified.styles, '.one{color:red}.three{color:#0f0}.four{color:#00f}.two{color:#fff}');
      }
    },
    'with other imports and processing imports off': {
      'relative': {
        'topic': function () {
          return new CleanCSS({ processImport: false }).minify(
            sourcesAsHash([
              'test/fixtures/partials/two.css'
            ])
          );
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '@import url(test/fixtures/partials/one.css);@import url(test/fixtures/partials/extra/three.css);@import url(test/fixtures/partials/extra/four.css);.two{color:#fff}');
        }
      },
      'absolute': {
        'topic': function () {
          return new CleanCSS({ processImport: false }).minify(
            sourcesAsHash([
              'test/fixtures/partials/two.css'
            ], true)
          );
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '@import url(test/fixtures/partials/one.css);@import url(test/fixtures/partials/extra/three.css);@import url(test/fixtures/partials/extra/four.css);.two{color:#fff}');
        }
      }
    },
    'with a callback': {
      'topic': function () {
        new CleanCSS().minify({
          'main.css': {
            styles: '@import url(test/fixtures/partials/one.css);\n@import url(test/fixtures/partials/three.css);'
          }
        }, this.callback);
      },
      'should give right output': function (error, minified) {
        assert.equal(minified.styles, '.one{color:red}.three{background-image:url(test/fixtures/partials/extra/down.gif)}');
      }
    },
    'with remote paths': {
      'topic': new CleanCSS().minify({
        'http://127.0.0.1/styles.css': {
          styles: 'div{background-image:url(image.png)}'
        }
      }),
      'gives right output': function (minified) {
        assert.equal(minified.styles, 'div{background-image:url(http://127.0.0.1/image.png)}');
      }
    }
  }
}).export(module);
