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
      new CleanCSS({ inline: 'local' }).minify('@import url(https://fonts.googleapis.com/css?family=Open+Sans);', this.callback);
    },
    'should yield no error and minify': function (errors, minified) {
      assert.equal(minified.styles, '@import url(https://fonts.googleapis.com/css?family=Open+Sans);');
    }
  },
  'with promise returned and no callback': {
    'topic': function () {
      new CleanCSS({ returnPromise: true })
        .minify('.block{color:#f00}')
        .then(this.callback.bind(null, null));
    },
    'should yield output': function (errors, output) {
      assert.equal(output.styles, '.block{color:red}');
    }
  },
  'with promise returned and callback': {
    'topic': function () {
      new CleanCSS({ returnPromise: true })
        .minify('.block{color:#f00}', function () { throw new Error('should not get here!'); })
        .then(this.callback.bind(null, null));
    },
    'should yield output': function (errors, output) {
      assert.equal(output.styles, '.block{color:red}');
    }
  },
  'with promise and error': {
    'topic': function () {
      var vow = this;

      new CleanCSS({ returnPromise: true })
        .minify('@import "missing.css";')
        .then(function (output) { vow.callback(null, output); })
        .catch(function (errors) { vow.callback(errors, null); });
    },
    'should catch error': function (errors, result) {
      /* jshint unused: false */
      assert.lengthOf(errors, 1);
      assert.equal(errors[0], 'Ignoring local @import of "missing.css" as resource is missing.');
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
  'warnings on missing explicit `rebaseTo`': {
    'topic': function () {
      return new CleanCSS({rebase: true}).minify('@import url(test/fixtures/partials/with-commented-import.css);');
    },
    'should minify correctly': function (error, minified) {
      assert.equal(minified.styles, '@font-face{font-family:Font;src:url("/path/to/font")}');
    },
    'should raise no errors': function (error, minified) {
      assert.isEmpty(minified.errors);
    },
    'should raise one warning': function (error, minified) {
      assert.lengthOf(minified.warnings, 1);
      assert.isTrue(minified.warnings[0].indexOf('`rebaseTo: process.cwd()`') > -1);
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
        assert.equal(minified.styles, '@font-face{font-family:Font;src:url("/path/to/font")}');
      }
    }
  },
  'external imports and no callback': {
    'without content': {
      'topic': function () {
        return new CleanCSS().minify('@import url(http://clean-css.github.io/styles.css);');
      },
      'has right output': function (minified) {
        assert.equal(minified.styles, '@import url(http://clean-css.github.io/styles.css);');
      },
      'has no errors': function (minified) {
        assert.isEmpty(minified.errors);
      },
      'has a warning': function (minified) {
        assert.deepEqual(minified.warnings, ['Skipping remote @import of "http://clean-css.github.io/styles.css" as no callback given.']);
      }
    },
    'after content': {
      'topic': function () {
        return new CleanCSS().minify('a{color:red}@import url(http://clean-css.github.io/styles.css);');
      },
      'has right output': function (minified) {
        assert.equal(minified.styles, 'a{color:red}');
      },
      'has no errors': function (minified) {
        assert.isEmpty(minified.errors);
      },
      'has a warning': function (minified) {
        assert.deepEqual(minified.warnings, ['Ignoring remote @import of "http://clean-css.github.io/styles.css" as no callback given and after other content.']);
      }
    },
    'after local import': {
      'topic': function () {
        return new CleanCSS().minify('@import url(test/fixtures/partials/one.css);@import url(http://clean-css.github.io/styles.css);');
      },
      'has right output': function (minified) {
        assert.equal(minified.styles, '.one{color:red}');
      },
      'has no errors': function (minified) {
        assert.isEmpty(minified.errors);
      },
      'has a warning': function (minified) {
        assert.deepEqual(minified.warnings, ['Skipping remote @import of "http://clean-css.github.io/styles.css" as no callback given.']);
      }
    },
    'after remote import': {
      'topic': function () {
        return new CleanCSS().minify('@import url(http://clean-css.github.io/reset.css);@import url(http://clean-css.github.io/styles.css);');
      },
      'has right output': function (minified) {
        assert.equal(minified.styles, '@import url(http://clean-css.github.io/reset.css);@import url(http://clean-css.github.io/styles.css);');
      },
      'has no errors': function (minified) {
        assert.isEmpty(minified.errors);
      },
      'has a warning': function (minified) {
        assert.deepEqual(minified.warnings, [
          'Skipping remote @import of "http://clean-css.github.io/reset.css" as no callback given.',
          'Skipping remote @import of "http://clean-css.github.io/styles.css" as no callback given.'
        ]);
      }
    }
  },
  'buffer passed in': {
    'topic': function () {
      return new CleanCSS().minify(Buffer.from('@import url(test/fixtures/partials/one.css);'));
    },
    'should be processed correctly': function (minified) {
      assert.equal(minified.styles, '.one{color:red}');
    }
  },
  'options': {
    'level 2': {
      'topic': function () {
        return new CleanCSS({ level: 2 }).minify('a{color:red}a{color:#fff}');
      },
      'gets right output': function (minified) {
        assert.equal(minified.styles, 'a{color:#fff}');
      }
    },
    'process import': {
      'topic': function () {
        return new CleanCSS({ inline: 'all' }).minify('@import url(/test/fixtures/partials/one.css);');
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
        new CleanCSS({ level: { 2: { restructureRules: true } } }).minify('div{margin-top:0}.one{margin:0}.two{display:block;margin-top:0}', this.callback);
      },
      'gets right output': function (minified) {
        assert.equal(minified.styles, '.two,div{margin-top:0}.one{margin:0}.two{display:block}');
      }
    },
    'restructuring - off': {
      'topic': function () {
        return new CleanCSS({ level: { 2: { restructureRules: false } } }).minify('div{margin-top:0}.one{margin:0}.two{display:block;margin-top:0}');
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
        return new CleanCSS({ level: { 2: { mergeSemantically: true } } }).minify('.a{margin:0}.b{margin:10px;padding:0}.c{margin:0}');
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
  'arbitrary property transformations now via plugins (since 5.0)': {
    'allows changing property value': {
      'topic': function () {
        return new CleanCSS({
          plugins: [
            {
              level1: {
                value: function (propertyName, propertyValue) {
                  if (propertyName == 'background-image' && propertyValue.indexOf('/path/to') > -1) {
                    return propertyValue.replace('/path/to', '../valid/path/to');
                  } else {
                    return propertyValue;
                  }
                }
              }
            }
          ]
        }).minify('.block{background-image:url(/path/to/image.png);border-image:url(image.png)}');
      },
      'gives right output': function (error, output) {
        assert.equal(output.styles, '.block{background-image:url(../valid/path/to/image.png);border-image:url(image.png)}');
      }
    },
    'allows dropping properties': {
      'topic': function () {
        return new CleanCSS({
          plugins: [
            {
              level1: {
                property: function (_rule, property) {
                  if (property.name.indexOf('-o-') === 0) {
                    property.unused = true;
                  }
                }
              }
            }
          ]
        }).minify('.block{-o-border-radius:2px;border-image:url(image.png)}');
      },
      'gives right output': function (error, output) {
        assert.equal(output.styles, '.block{border-image:url(image.png)}');
      }
    },
    'allows dropping properties based on selector': {
      'topic': function () {
        return new CleanCSS({
          plugins: [
            {
              level1: {
                property: function (rule, property) {
                  if (rule == '.block-2' && property.name.indexOf('-o-') === 0) {
                    property.unused = true;
                  }
                }
              }
            }
          ]
        }).minify('.block-1{-o-border-radius:2px}.block-2{-o-border-radius:5px;width:1rem}');
      },
      'gives right output': function (error, output) {
        assert.equal(output.styles, '.block-1{-o-border-radius:2px}.block-2{width:1rem}');
      }
    },
    'combined with level 2 optimization': {
      'topic': function () {
        return new CleanCSS({
          plugins: [
            {
              level1: {
                property: function (_rule, property) {
                if (property.name == 'margin-bottom') {
                    property.unused = true;
                  }
                }
              }
            }
          ],
          level: {
            2: true
          }
        }).minify('.block{-o-border-radius:2px;margin:0 12px;margin-bottom:5px}');
      },
      'drops property before level 2 optimizations': function (error, output) {
        assert.equal(output.styles, '.block{-o-border-radius:2px;margin:0 12px}');
      }
    }
  },
  'accepts a list of source files as array': {
    'relative': {
      'with rebase to the current directory': {
        'topic': function () {
          return new CleanCSS({ rebase: true }).minify([
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
          return new CleanCSS().minify([
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
          return new CleanCSS({ rebase: true }).minify([
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
          return new CleanCSS().minify([
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
          return new CleanCSS({ inline: 'none' }).minify(['./test/fixtures/partials/two.css']);
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '@import url(test/fixtures/partials/one.css);@import url(test/fixtures/partials/extra/three.css);@import url(test/fixtures/partials/extra/four.css);.two{color:#fff}');
        }
      },
      'off - with false alias': {
        'topic': function () {
          return new CleanCSS({ inline: false }).minify(['./test/fixtures/partials/two.css']);
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '@import url(test/fixtures/partials/one.css);@import url(test/fixtures/partials/extra/three.css);@import url(test/fixtures/partials/extra/four.css);.two{color:#fff}');
        }
      },
      'off - many files': {
        'topic': function () {
          return new CleanCSS({ inline: 'none' }).minify(['./test/fixtures/partials/remote.css', './test/fixtures/partials-absolute/base.css']);
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '@import url(http://clean-css.github.io/styles.css);@import url(test/fixtures/partials-absolute/extra/sub.css);.base{margin:0}');
        }
      },
      'off - many files with content': {
        'topic': function () {
          return new CleanCSS({ inline: 'none' }).minify(['./test/fixtures/partials/two.css', './test/fixtures/partials-absolute/base.css']);
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '@import url(test/fixtures/partials/one.css);@import url(test/fixtures/partials/extra/three.css);@import url(test/fixtures/partials/extra/four.css);.two{color:#fff}.base{margin:0}');
        }
      },
      'and rules after': {
        'topic': function () {
          return new CleanCSS().minify(['./test/fixtures/partials/two.css', './test/fixtures/partials-absolute/base.css']);
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{color:#0f0}.four{color:#00f}.two{color:#fff}.base2{border-width:0}.sub{padding:0}.base{margin:0}');
        }
      }
    },
    'with spaces in filename': {
      'topic': function () {
        return new CleanCSS().minify(['./test/fixtures/partials/with spaces in filename.css']);
      },
      'gives right output': function (minified) {
        assert.equal(minified.styles, '.block{color:red}');
      }
    },
    'absolute of missing resource': {
      'topic': function () {
        return new CleanCSS().minify(['z:\\missing.css']);
      },
      'gives right error': function (minified) {
        if (process.platform == 'win32') {
          assert.deepEqual(minified.errors, ['Ignoring local @import of "z:/missing.css" as resource is missing.']);
        }
      }
    }
  },
  'accepts a list of source files as array in batch mode': {
    'with rebase to the current directory': {
      'topic': function () {
        return new CleanCSS({ batch: true, rebase: true, rebaseTo: process.cwd() }).minify([
          'test/fixtures/partials/one.css',
          'test/fixtures/partials/three.css'
        ]);
      },
      'output should be a hash': function (minified) {
        assert.equal(typeof minified, 'object');
      },
      'output should have input files as keys': function (minified) {
        assert.isTrue('test/fixtures/partials/one.css' in minified);
        assert.isTrue('test/fixtures/partials/three.css' in minified);
      },
      'output of first file should be in the first item': function (minified) {
        assert.equal(minified['test/fixtures/partials/one.css'].styles, '.one{color:red}');
        assert.deepEqual(minified['test/fixtures/partials/one.css'].errors, []);
        assert.deepEqual(minified['test/fixtures/partials/one.css'].warnings, []);
      },
      'output of second file should be in the second item': function (minified) {
        assert.equal(minified['test/fixtures/partials/three.css'].styles, '.three{background-image:url(test/fixtures/partials/extra/down.gif)}');
        assert.deepEqual(minified['test/fixtures/partials/three.css'].errors, []);
        assert.deepEqual(minified['test/fixtures/partials/three.css'].warnings, []);
      }
    }
  },
  'accepts a list of source files as hash': {
    'relative': {
      'with rebase to the current directory': {
        'topic': function () {
          return new CleanCSS({ rebase: true }).minify(
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
          return new CleanCSS().minify(
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
          return new CleanCSS({ rebase: true }).minify(
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
          return new CleanCSS().minify(
            sourcesAsHash([
              'test/fixtures/partials/one.css',
              'test/fixtures/partials/three.css'
            ], true)
          );
        },
        'should give right output': function (minified) {
          assert.equal(minified.styles, '.one{color:red}.three{background-image:url(extra/down.gif)}');
        }
      },
      'without reading from disk': {
        'topic': function () {
          var inputHash = {};
          var currentPath = path.resolve('.');

          // intentionally different from real files to figure out if files are read off disk
          inputHash[currentPath + '/test/fixtures/partials/one.css'] = { styles: '.block{color:#f00}' };
          inputHash[currentPath + '/test/fixtures/partials/three.css'] = { styles: '@import url(one.css);' };

          return new CleanCSS().minify(inputHash);
        },
        'gives right output': function (output) {
          assert.equal(output.styles, '.block{color:red}');
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
    'with other imports and processing imports off': {
      'relative': {
        'topic': function () {
          return new CleanCSS({ inline: 'none' }).minify(
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
          return new CleanCSS({ inline: 'none' }).minify(
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
        new CleanCSS({ rebase: true }).minify({
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
      'topic': function() {
        return new CleanCSS({rebase: true}).minify({
          'http://127.0.0.1/styles.css': {
            styles: 'div{background-image:url(image.png)}'
          }
        });
      },
      'gives right output': function (minified) {
        assert.equal(minified.styles, 'div{background-image:url(http://127.0.0.1/image.png)}');
      }
    },
    'with already resolved imports': {
      'topic': function () {
        new CleanCSS({ level: 1, inline: 'all' }).minify({
          'main.css': {
            styles: '@import url(test/fixtures/partials/one.css);\n@import url(http://127.0.0.1/test.css);'
          },
          'test/fixtures/partials/one.css': {
            styles: '.one { background-color:#f00; }'
          },
          'http://127.0.0.1/test.css': {
            styles: '.test { color: #000 }'
          }
        }, this.callback);
      },
      'gives right output without reading resources': function (minified) {
        assert.equal(minified.styles, '.one{background-color:red}.test{color:#000}');
      }
    },
    'with mixed-style paths': {
      'topic': function () {
        new CleanCSS({ level: 1, inline: 'all' }).minify({
          'main.css': {
            styles: '@import url(test/fixtures/partials/one.css);\n@import url(http://127.0.0.1/test.css);'
          },
          'test\\fixtures\\partials\\one.css': {
            styles: '.one { background-color:#f00; }'
          },
          'http://127.0.0.1/test.css': {
            styles: '.test { color: #000 }'
          }
        }, this.callback);
      },
      'gives right output without reading resources': function (minified) {
        assert.equal(minified.styles, '.one{background-color:red}.test{color:#000}');
      }
    },
    'with @import and rules after': {
      'topic': function () {
        return new CleanCSS().minify(sourcesAsHash(['./test/fixtures/partials/two.css', './test/fixtures/partials-absolute/base.css']));
      },
      'should give right output': function (minified) {
        assert.equal(minified.styles, '.one{color:red}.three{color:#0f0}.four{color:#00f}.two{color:#fff}.base2{border-width:0}.sub{padding:0}.base{margin:0}');
      }
    },
    'with source map and absolute paths on Windows': {
      'topic': function () {
        return new CleanCSS({ sourceMap: true }).minify({
          'z:\\missing.css': {
            styles: '.block{color:red}'
          }
        });
      },
      'gives right sources': function (minified) {
        if (process.platform == 'win32') {
          assert.deepEqual(minified.sourceMap._sources._array, ['z:\\missing.css']);
        }
      }
    }
  },
  'accepts a list of source files as hash in batch mode': {
    'with rebase to the current directory': {
      'topic': function () {
        return new CleanCSS({ batch: true, rebase: true, rebaseTo: process.cwd() }).minify(
          sourcesAsHash([
            'test/fixtures/partials/one.css',
            'test/fixtures/partials/three.css'
          ])
        );
      },
      'output should be a hash': function (minified) {
        assert.equal(typeof minified, 'object');
      },
      'output should have input files as keys': function (minified) {
        assert.isTrue('test/fixtures/partials/one.css' in minified);
        assert.isTrue('test/fixtures/partials/three.css' in minified);
      },
      'output of first file should be in the first item': function (minified) {
        assert.equal(minified['test/fixtures/partials/one.css'].styles, '.one{color:red}');
        assert.deepEqual(minified['test/fixtures/partials/one.css'].errors, []);
        assert.deepEqual(minified['test/fixtures/partials/one.css'].warnings, []);
      },
      'output of second file should be in the second item': function (minified) {
        assert.equal(minified['test/fixtures/partials/three.css'].styles, '.three{background-image:url(extra/down.gif)}');
        assert.deepEqual(minified['test/fixtures/partials/three.css'].errors, []);
        assert.deepEqual(minified['test/fixtures/partials/three.css'].warnings, []);
      }
    }
  },
  'sources list as a hash in batch + promise mode': {
    'with rebase to the current directory': {
      'topic': function () {
        var vow = this;

        async function doTopic() {
          return await new CleanCSS({ batch: true, returnPromise: true }).minify([
            {'path/to/file/one': {styles: 'html { color: #000000; }'}},
            {'path/to/file/two': {styles: 'body { background: #ffffff; }'}}
          ]);
        }

        doTopic()
          .then(function (output) { vow.callback(null, output); })
          .catch(function (errors) { vow.callback(errors, null); });
      },
      'output should be a hash': function (minified) {
        assert.equal(typeof minified, 'object');
      },
      'output should be correct': function (minified) {
        assert.equal(minified['path/to/file/one'].styles, 'html{color:#000}');
        assert.equal(minified['path/to/file/two'].styles, 'body{background:#fff}');
      }
    }
  },
  'accepts a list of source files as array of hashes': {
    'topic': function () {
      return new CleanCSS({rebase: true}).minify([
        sourcesAsHash(['test/fixtures/partials/one.css']),
        sourcesAsHash(['test/fixtures/partials/three.css'])
      ]);
    },
    'should give right output': function (minified) {
      assert.equal(minified.styles, '.one{color:red}.three{background-image:url(test/fixtures/partials/extra/down.gif)}');
    }
  },
  'accepts a list of source files as array of hashes in batch mode': {
    'topic': function () {
      return new CleanCSS({ batch: true, rebase: true, rebaseTo: process.cwd() }).minify([
        sourcesAsHash(['test/fixtures/partials/one.css']),
        sourcesAsHash(['test/fixtures/partials/three.css'])
      ]);
    },
    'output should be a hash': function (minified) {
      assert.equal(typeof minified, 'object');
    },
    'output should have input files as keys': function (minified) {
      assert.isTrue('test/fixtures/partials/one.css' in minified);
      assert.isTrue('test/fixtures/partials/three.css' in minified);
    },
    'output of first file should be in the first item': function (minified) {
      assert.equal(minified['test/fixtures/partials/one.css'].styles, '.one{color:red}');
      assert.deepEqual(minified['test/fixtures/partials/one.css'].errors, []);
      assert.deepEqual(minified['test/fixtures/partials/one.css'].warnings, []);
    },
    'output of second file should be in the second item': function (minified) {
      assert.equal(minified['test/fixtures/partials/three.css'].styles, '.three{background-image:url(extra/down.gif)}');
      assert.deepEqual(minified['test/fixtures/partials/three.css'].errors, []);
      assert.deepEqual(minified['test/fixtures/partials/three.css'].warnings, []);
    }
  },
  'keeps trailing semicolons if option is set': {
    'topic': function() {
      return new CleanCSS({format: { semicolonAfterLastProperty: true }}).minify('*{ font-size:12px; color:#ea7500; }');
    },
    'should minify correctly': function (error, minified) {
      assert.equal(minified.styles, '*{font-size:12px;color:#ea7500;}');
    },
    'should raise no errors': function (error, minified) {
      assert.isEmpty(minified.errors);
    }
  },
  'vulnerabilities': {
    'ReDOS in time units': {
      'topic': function () {
        var prefix = '-+.0';
        var pump = [];
        var suffix = '-0';
        var input;
        var i;

        for (i = 0; i < 10000; i++) {
          pump.push('0000000000');
        }

        input = '.block{animation:1s test;animation-duration:' + prefix + pump.join('') + suffix + 's}';

        return new CleanCSS({ level: { 1: { replaceZeroUnits: false }, 2: true } }).minify(input);
      },
      'finishes in less than a second': function (error, minified) {
        assert.isTrue(minified.stats.timeSpent < 1000);
      }
    }
  },
  'plugins': {
    'level 1 - opacity range as value plugin': {
      'topic': function () {
        var opacityRangePlugin = {
          level1: {
            value: function (propertyName, propertyValue) {
              if (propertyName == 'opacity' && parseFloat(propertyValue) < 0) {
                return '0';
              }

              if (propertyName == 'opacity' && parseFloat(propertyValue) > 1) {
                return '1';
              }

              return propertyValue;
            }
          }
        };

        return new CleanCSS({ plugins: [opacityRangePlugin]}).minify('.block-1{opacity:-1.5}.block-2{opacity:1.5}');
      },
      'normalizes opacity to standard boundaries': function (error, minified) {
        assert.equal(minified.styles, '.block-1{opacity:0}.block-2{opacity:1}');
      }
    },
    'level 1 - opacity range as property plugin': {
      'topic': function () {
        var opacityRangePlugin = {
          level1: {
            property: function (_rule, property) {
              if (property.name == 'opacity' && parseFloat(property.value[0][1]) < 0) {
                property.value[0][1] = '0';
              }

              if (property.name == 'opacity' && parseFloat(property.value[0][1]) > 1) {
                property.value[0][1] = '1';
              }
            }
          }
        };

        return new CleanCSS({ plugins: [opacityRangePlugin]}).minify('.block-1{opacity:-1.5}.block-2{opacity:1.5}');
      },
      'normalizes opacity to standard boundaries': function (error, minified) {
        assert.equal(minified.styles, '.block-1{opacity:0}.block-2{opacity:1}');
      }
    },
    'level 1 - background repeat plugin': {
      'topic': function () {
        var backgroundRepeatPlugin = {
          level1: {
            property: function(_rule, property) {
              if (property.name == 'background-repeat' && property.value.length == 2 && property.value[0][1] == property.value[1][1]) {
                property.value.pop();
                property.dirty = true;
              }
            }
          }
        };

        return new CleanCSS({ plugins: [backgroundRepeatPlugin]}).minify('.block-1{background-repeat:no-repeat}.block-2{background-repeat:repeat repeat}');
      },
      'normalizes opacity to standard boundaries': function (error, minified) {
        assert.equal(minified.styles, '.block-1{background-repeat:no-repeat}.block-2{background-repeat:repeat}');
      }
    },
    'level 1 - drop certain properties via a property plugin': {
      'topic': function () {
        // Let's say you bundle external CSS into yours and want to get rid of some properties programatically
        // e.g. Bootstrap uses `-webkit-linear-gradient()`, `-o-linear-gradient()`, and `-webkit-gradient()` fallbacks and you want to get rid of them
        var getRidOfBackgroundImageVendorFallbacks = {
          level1: {
            property: function (_rule, property) {
              var value;

              if (property.name == 'background-image') {
                value = property.value[0][1];

                if (value.indexOf('-webkit-linear-gradient') == 0 || value.indexOf('-o-linear-gradient') == 0 || value.indexOf('-webkit-gradient') == 0) {
                  property.unused = true;
                }
              }
            }
          }
        };

        var input = '\
          .block-1 {\
            background-image: -webkit-linear-gradient(left, rgba(0, 0, 0, .0001) 0%, rgba(0, 0, 0, .5) 100%);\
            background-image:      -o-linear-gradient(left, rgba(0, 0, 0, .0001) 0%, rgba(0, 0, 0, .5) 100%);\
            background-image: -webkit-gradient(linear, left top, right top, from(rgba(0, 0, 0, .0001)), to(rgba(0, 0, 0, .5)));\
            background-image:         linear-gradient(to right, rgba(0, 0, 0, .0001) 0%, rgba(0, 0, 0, .5) 100%);\
          } \
        ';

        return new CleanCSS({ plugins: [getRidOfBackgroundImageVendorFallbacks]}).minify(input);
      },
      'normalizes opacity to standard boundaries': function (error, minified) {
        assert.equal(minified.styles, '.block-1{background-image:linear-gradient(to right,rgba(0,0,0,.0001) 0,rgba(0,0,0,.5) 100%)}');
      }
    },
    'level 2 - drop certain rules via level 2 plugin': {
      'topic': function () {
        // Let's say you bundle external CSS into yours and want to get rid of some rules programatically
        // e.g. Bootstrap uses `glyphicon` classes and you don't need them at all
        var getRidOfGlyphiconsPlugin = {
          level2: {
            block: function (tokens) {
              // at this point you get full access to serialized CSS, do `console.log(tokens)` to see what you get
              var tokenType;
              var tokenNames;
              var tokenValues;
              var i, l;

              for (i = 0, l = tokens.length; i < l; i++) {
                tokenType = tokens[i][0];
                tokenNames = tokens[i][1];
                tokenValues = tokens[i][2];

                if (tokenType == 'rule' && tokenNames[0][1].indexOf('.glyphicon') == 0) {
                  tokens[i][2] = [];
                }

                if (tokenType == 'at-rule-block' && tokenNames[0][1] == '@font-face' && tokenValues.length > 0 && tokenValues[0][1][1] == 'font-family' && tokenValues[0][2][1].indexOf('Glyphicons') > -1) {
                  tokens[i][2] = [];
                }
              }
            }
          }
        };

        var input = '\
          td,\
          th {\
            padding: 0;\
          }\
          @font-face {\
            font-family: \'Glyphicons Halflings\';\
            src: url(\'../fonts/glyphicons-halflings-regular.eot\');\
            src: url(\'../fonts/glyphicons-halflings-regular.eot?#iefix\') format(\'embedded-opentype\'), url(\'../fonts/glyphicons-halflings-regular.woff2\') format(\'woff2\'), url(\'../fonts/glyphicons-halflings-regular.woff\') format(\'woff\'), url(\'../fonts/glyphicons-halflings-regular.ttf\') format(\'truetype\'), url(\'../fonts/glyphicons-halflings-regular.svg#glyphicons_halflingsregular\') format(\'svg\');\
          }\
          .glyphicon {\
            position: relative;\
            top: 1px;\
            display: inline-block;\
            font-family: \'Glyphicons Halflings\';\
            font-style: normal;\
            font-weight: normal;\
            line-height: 1;\
            -webkit-font-smoothing: antialiased;\
            -moz-osx-font-smoothing: grayscale;\
          }\
          .glyphicon-asterisk:before {\
            content: "\\2a";\
          }\
          .glyphicon-plus:before {\
            content: "\\2b";\
          }\
        ';

        return new CleanCSS({ level: 2, plugins: [getRidOfGlyphiconsPlugin]}).minify(input);
      },
      'normalizes opacity to standard boundaries': function (error, minified) {
        assert.equal(minified.styles, 'td,th{padding:0}');
      }
    }
  }
}).export(module);
