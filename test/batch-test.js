var assert = require('assert');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');

var CleanCSS = require('../index');
var vows = require('vows');

var lineBreak = require('os').EOL;

if (process.platform == 'win32') {
  return;
}

function assertEqualLineByLine(expected, actual) {
  var expectedLines = expected.split(lineBreak);
  var actualLines = actual.split(lineBreak);

  expectedLines.forEach(function (line, i) {
    assert.equal(line, actualLines[i]);
  });
}

function batchContexts() {
  var context = {};
  var dir = path.join(__dirname, 'fixtures');

  fs.readdirSync(dir).forEach(function (filename) {
    var testName = filename.split('.')[0];
    var isIE7Mode = filename.indexOf('ie7') > 0;

    if (filename.indexOf('.css') == -1 || /min.css$/.exec(filename) || !fs.statSync(path.join(dir, filename)).isFile()) {
      return;
    }

    context[testName] = {
      topic: function () {
        var inputPath = path.join('test', 'fixtures', testName + '.css');
        var minPath = path.join(__dirname, 'fixtures', testName + '-min.css');

        return {
          input: '@import "' + inputPath + '";',
          preoptimized: fs.readFileSync(minPath, 'utf8').trim()
        };
      },
      'minifying': {
        topic: function (data) {
          new CleanCSS({
            compatibility: isIE7Mode ? 'ie7' : '*',
            keepBreaks: true,
            level: {
              2: {
                restructureRules: true
              }
            }
          }).minify(data.input, this.callback.bind(null, data));
        },
        'outputs right content': function (data, error, output) {
          assertEqualLineByLine(data.preoptimized, output.styles);
        }
      },
      'minifying with source maps': {
        topic: function (data) {
          new CleanCSS({
            compatibility: isIE7Mode ? 'ie7' : '*',
            keepBreaks: true,
            level: {
              2: {
                restructureRules: true
              }
            },
            sourceMap: true
          }).minify(data.input, this.callback.bind(null, data));
        },
        'outputs right content': function (data, error, output) {
          assertEqualLineByLine(data.preoptimized, output.styles);
        }
      },
      'minifying via CLI': {
        'topic': function (data) {
          exec(
            '__DIRECT__=1 ./bin/cleancss -b -O2 restructureRules:on ' + (isIE7Mode ? '-c ie7 ' : '') + path.join(dir, filename),
            { maxBuffer: 500 * 1024 },
            this.callback.bind(null, data)
          );
        },
        'outputs right content': function (data, error, stdout) {
          assertEqualLineByLine(data.preoptimized, stdout);
        }
      }
    };
  });

  return context;
}

vows.describe('clean-batch')
  .addBatch(batchContexts())
  .export(module);
