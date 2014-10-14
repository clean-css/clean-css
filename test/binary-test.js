var vows = require('vows');
var assert = require('assert');
var exec = require('child_process').exec;
var fs = require('fs');
var http = require('http');
var path = require('path');

var isWindows = process.platform == 'win32';
var lineBreakRegExp = new RegExp(require('os').EOL, 'g');

var binaryContext = function(options, context) {
  if (isWindows)
    return {};

  context.topic = function() {
    // We add __DIRECT__=1 to force binary into 'non-piped' mode
    exec('__DIRECT__=1 ./bin/cleancss ' + options, this.callback);
  };
  return context;
};

var pipedContext = function(css, options, context) {
  if (isWindows)
    return {};

  context.topic = function() {
    exec('echo "' + css + '" | ./bin/cleancss ' + options, this.callback);
  };
  return context;
};

var unixOnlyContext = function(context) {
  return isWindows ? {} : context;
};

var readFile = function(filename) {
  return fs.readFileSync(filename, { encoding: 'utf-8' }).replace(lineBreakRegExp, '');
};

var deleteFile = function(filename) {
  if (isWindows)
    exec('del /q /f ' + filename);
  else
    exec('rm ' + filename);
};

exports.commandsSuite = vows.describe('binary commands').addBatch({
  'no options': binaryContext('', {
    'should output help': function(stdout) {
      assert.equal(/Usage:/.test(stdout), true);
    }
  }),
  'help': binaryContext('-h', {
    'should output help': function(error, stdout) {
      assert.equal(/Usage:/.test(stdout), true);
    },
    'should output one file example': function(error, stdout) {
      assert.equal(stdout.indexOf('cleancss -o one-min.css one.css') > -1, true);
    },
    'should output multiple files example': function(error, stdout) {
      assert.equal(stdout.indexOf('cat one.css two.css three.css | cleancss -o merged-and-minified.css') > -1, true);
    },
    'should output gzipping multiple files example': function(error, stdout) {
      assert.equal(stdout.indexOf('cat one.css two.css three.css | cleancss | gzip -9 -c > merged-minified-and-gzipped.css.gz') > -1, true);
    }
  }),
  'version': binaryContext('-v', {
    'should output help': function(error, stdout) {
      var version = JSON.parse(fs.readFileSync('./package.json')).version;
      assert.equal(stdout, version + '\n');
    }
  }),
  'stdin': pipedContext('a{color: #f00}', '', {
    'should output data': function(error, stdout) {
      assert.equal(stdout, 'a{color:red}');
    }
  }),
  'strip all but first comment': pipedContext('/*!1st*//*! 2nd */a{display:block}', '--s1', {
    'should keep the 2nd comment': function(error, stdout) {
      assert.equal(stdout, '/*!1st*/a{display:block}');
    }
  }),
  'strip all comments': pipedContext('/*!1st*//*! 2nd */a{display:block}', '--s0', {
    'should keep the 2nd comment': function(error, stdout) {
      assert.equal(stdout, 'a{display:block}');
    }
  }),
  'piped with debug info': pipedContext('a{color: #f00;}', '-d', {
    'should output content to stdout and debug info to stderr': function(error, stdout, stderr) {
      assert.equal(stdout, 'a{color:red}');
      assert.notEqual(stderr, '');
      assert.include(stderr, 'Time spent:');
      assert.include(stderr, 'Original: 16 bytes');
      assert.include(stderr, 'Minified: 12 bytes');
      assert.include(stderr, 'Efficiency: 25%');
    }
  }),
  'piped with debug info on inlining': pipedContext('@import url(test/data/imports-min.css);', '-d', {
    'should output inlining info': function(error, stdout, stderr) {
      assert.include(stderr, path.join(process.cwd(), 'test/data/imports-min.css'));
    }
  }),
  'piped with correct debug info on inlining': pipedContext('@import url(test/data/imports.css);', '-d', {
    'should output correct info': function(error, stdout, stderr) {
      assert.include(stderr, 'Original: 120 bytes');
      assert.include(stderr, 'Minified: 86 bytes');
      assert.include(stderr, 'Efficiency: 28.33%');
    }
  }),
  'to output file with debug info': pipedContext('a{color: #f00;}', '-d -o debug.css', {
    'should output nothing to stdout and debug info to stderr': function(error, stdout, stderr) {
      assert.equal(stdout, '');
      assert.notEqual(stderr, '');
      assert.include(stderr, 'Time spent:');
      assert.include(stderr, 'Original: 16 bytes');
      assert.include(stderr, 'Minified: 12 bytes');
      assert.include(stderr, 'Efficiency: 25%');
    },
    'should output content to file': function() {
      var minimized = readFile('debug.css');
      assert.equal(minimized, 'a{color:red}');
    },
    teardown: function() {
      deleteFile('debug.css');
    }
  }),
  'skip advanced optimizations': pipedContext('a{color:red}p{color:red}', '--skip-advanced', {
    'should do basic optimizations only': function(error, stdout) {
      assert.equal(stdout, 'a{color:red}p{color:red}');
    }
  }),
  'no relative to path': binaryContext('./test/data/partials-absolute/base.css', {
    'should not be able to resolve it fully': function(error, stdout, stderr) {
      assert.equal(stdout, '');
      assert.notEqual(error, null);
      assert.notEqual(stderr, '');
    }
  }),
  'relative to path': binaryContext('-r ./test/data ./test/data/partials-absolute/base.css', {
    'should be able to resolve it': function(error, stdout) {
      assert.equal(stdout, '.base2{border-width:0}.sub{padding:0}.base{margin:0}');
    }
  }),
  'from source': binaryContext('./test/data/reset.css', {
    'should minimize': function(error, stdout) {
      var minimized = fs.readFileSync('./test/data/reset-min.css', 'utf-8').replace(lineBreakRegExp, '');
      assert.equal(stdout, minimized);
    }
  }),
  'from multiple sources': binaryContext('./test/data/partials/one.css ./test/data/partials/five.css', {
    'should minimize all': function(error, stdout) {
      assert.equal(stdout, '.one{color:red}.five{background:url(data:image/jpeg;base64,/9j/)}');
    }
  }),
  'to file': binaryContext('-o ./reset1-min.css ./test/data/reset.css', {
    'should give no output': function(error, stdout) {
      assert.equal(stdout, '');
    },
    'should minimize': function() {
      var minimized = readFile('./test/data/reset-min.css');
      var target = readFile('./reset1-min.css');
      assert.equal(minimized, target);
    },
    teardown: function() {
      deleteFile('./reset1-min.css');
    }
  }),
  'disable @import': binaryContext('-s ./test/data/imports.css', {
    'should disable the import processing': function(error, stdout) {
      assert.equal(stdout, '@import url(./partials/one.css);@import url(./partials/two.css);.imports{color:#000}');
    }
  }),
  'relative image paths': {
    'no root & output': binaryContext('./test/data/partials-relative/base.css', {
      'should leave paths': function(error, stdout) {
        assert.equal(stdout, 'a{background:url(../partials/extra/down.gif) no-repeat}');
      }
    }),
    'root but no output': binaryContext('-r ./test ./test/data/partials-relative/base.css', {
      'should rewrite path relative to ./test': function(error, stdout) {
        assert.equal(stdout, 'a{background:url(/data/partials/extra/down.gif) no-repeat}');
      }
    }),
    'no root but output': binaryContext('-o ./base1-min.css ./test/data/partials-relative/base.css', {
      'should rewrite path relative to current path': function() {
        var minimized = readFile('./base1-min.css');
        assert.equal(minimized, 'a{background:url(test/data/partials/extra/down.gif) no-repeat}');
      },
      teardown: function() {
        deleteFile('./base1-min.css');
      }
    }),
    'root and output': binaryContext('-r ./test/data -o ./base2-min.css ./test/data/partials-relative/base.css', {
      'should rewrite path relative to ./test/data/': function() {
        var minimized = readFile('./base2-min.css');
        assert.equal(minimized, 'a{background:url(/partials/extra/down.gif) no-repeat}');
      },
      teardown: function() {
        deleteFile('./base2-min.css');
      }
    }),
    'piped with output': pipedContext('a{background:url(test/data/partials/extra/down.gif)}', '-o base3-min.css', {
      'should keep paths as they are': function() {
        var minimized = readFile('base3-min.css');
        assert.equal(minimized, 'a{background:url(test/data/partials/extra/down.gif)}');
      },
      teardown: function() {
        deleteFile('base3-min.css');
      }
    })
  },
  'complex import and url rebasing': {
    absolute: binaryContext('-r ./test/data/129-assets ./test/data/129-assets/assets/ui.css', {
      'should rebase urls correctly': function(error, stdout) {
        assert.equal(error, null);
        assert.include(stdout, 'url(/components/bootstrap/images/glyphs.gif)');
        assert.include(stdout, 'url(/components/jquery-ui/images/prev.gif)');
        assert.include(stdout, 'url(/components/jquery-ui/images/next.gif)');
      }
    }),
    relative: binaryContext('-o ./test/data/129-assets/assets/ui.bundled.css ./test/data/129-assets/assets/ui.css', {
      'should rebase urls correctly': function() {
        var minimized = readFile('./test/data/129-assets/assets/ui.bundled.css');
        assert.include(minimized, 'url(../components/bootstrap/images/glyphs.gif)');
        assert.include(minimized, 'url(../components/jquery-ui/images/prev.gif)');
        assert.include(minimized, 'url(../components/jquery-ui/images/next.gif)');
      },
      teardown: function() {
        deleteFile('./test/data/129-assets/assets/ui.bundled.css');
      }
    })
  },
  'complex import and skipped url rebasing': {
    absolute: binaryContext('-r ./test/data/129-assets --skip-rebase ./test/data/129-assets/assets/ui.css', {
      'should rebase urls correctly': function(error, stdout) {
        assert.equal(error, null);
        assert.include(stdout, 'url(../components/bootstrap/images/glyphs.gif)');
        assert.include(stdout, 'url(../components/jquery-ui/images/prev.gif)');
        assert.include(stdout, 'url(../components/jquery-ui/images/next.gif)');
      }
    })
  },
  'remote import': {
    topic: function() {
      this.server = http.createServer(function (req, res) {
        res.writeHead(200);
        res.end('p{font-size:13px}');
      }).listen(31991, '127.0.0.1');

      this.callback(null);
    },
    'of a file': binaryContext('http://127.0.0.1:31991/present.css', {
      succeeds: function(error, stdout) {
        assert.equal(error, null);
        assert.equal(stdout, 'p{font-size:13px}');
      }
    }),
    teardown: function() {
      this.server.close();
    }
  },
  'timeout': unixOnlyContext({
    topic: function() {
      var self = this;
      var source = '@import url(http://localhost:24682/timeout.css);';

      this.server = http.createServer(function() {
        setTimeout(function() {}, 1000);
      });
      this.server.listen('24682', function() {
        exec('echo "' + source + '" | ./bin/cleancss --timeout 0.01', self.callback);
      });
    },
    'should raise warning': function(error, stdout, stderr) {
      assert.include(stderr, 'Broken @import declaration of "http://localhost:24682/timeout.css" - timeout');
    },
    'should output empty response': function(error, stdout) {
      assert.equal(stdout, '');
    },
    teardown: function() {
      this.server.close();
    }
  }),
  'ie7 compatibility': binaryContext('--compatibility ie7 ./test/data/unsupported/selectors-ie7.css', {
    'should not transform source': function(error, stdout) {
      assert.equal(stdout, readFile('./test/data/unsupported/selectors-ie7.css'));
    }
  }),
  'ie8 compatibility': binaryContext('--compatibility ie8 ./test/data/unsupported/selectors-ie8.css', {
    'should not transform source': function(error, stdout) {
      assert.equal(stdout, readFile('./test/data/unsupported/selectors-ie8.css'));
    }
  }),
  'custom compatibility': pipedContext('a{_color:red}', '--compatibility "+properties.iePrefixHack"', {
    'should not transform source': function(error, stdout) {
      assert.equal(stdout, 'a{_color:red}');
    }
  }),
  'rounding precision': {
    defaults: pipedContext('div{width:0.10051px}', '', {
      'should keep 2 decimal places': function(error, stdout) {
        assert.equal(stdout, 'div{width:.1px}');
      }
    }),
    custom: pipedContext('div{width:0.00051px}', '--rounding-precision 4', {
      'should keep 4 decimal places': function(error, stdout) {
        assert.equal(stdout, 'div{width:.0005px}');
      }
    }),
    zero: pipedContext('div{width:1.5051px}', '--rounding-precision 0', {
      'should keep 0 decimal places': function(error, stdout) {
        assert.equal(stdout, 'div{width:1px}');
      }
    })
  },
  'neighbour merging': {
    'of (yet) unmergeable properties': pipedContext('a{display:inline-block;color:red;display:-moz-block}', '--skip-aggressive-merging', {
      'gets right result': function(error, stdout) {
        assert.equal(stdout, 'a{display:inline-block;color:red;display:-moz-block}');
      }
    }),
    'of mergeable properties': pipedContext('a{background:red;display:block;background:white}', '--skip-aggressive-merging', {
      'gets right result': function(error, stdout) {
        assert.equal(stdout, 'a{display:block;background:#fff}');
      }
    })
  }
});
