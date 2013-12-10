var vows = require('vows');
var path = require('path');
var fs = require('fs');
var assert = require('assert');
var CleanCSS = require('../index');

var lineBreak = process.platform == 'win32' ? /\r\n/g : /\n/g;

var batchContexts = function() {
  var context = {};
  var dir = path.join(__dirname, 'data');
  fs.readdirSync(dir).forEach(function(filename) {
    if (/min.css$/.exec(filename) || !fs.statSync(path.join(dir, filename)).isFile())
      return;
    var testName = filename.split('.')[0];

    context[testName] = {
      topic: function() {
        var plainPath = path.join(__dirname, 'data', testName + '.css');
        var minPath = path.join(__dirname, 'data', testName + '-min.css');

        return {
          plain: fs.readFileSync(plainPath, 'utf-8'),
          preminified: fs.readFileSync(minPath, 'utf-8'),
          root: path.dirname(plainPath)
        };
      }
    };
    context[testName]['minimizing ' + testName + '.css'] = function(data) {
      new CleanCSS({
        keepBreaks: true,
        root: data.root
      }).minify(data.plain, function(errors, minified) {
        var minifiedTokens = minified.split(lineBreak);
        var preminifiedTokens = data.preminified.split(lineBreak);

        minifiedTokens.forEach(function(line, i) {
          assert.equal(line, preminifiedTokens[i]);
        });
      });
    };
  });

  return context;
};

vows.describe('clean-batch')
  .addBatch(batchContexts())
  .export(module);
