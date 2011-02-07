var vows = require('vows'),
  fs = require('fs'),
  assert = require('assert');

var CleanCSS = require('../lib/clean').CleanCSS;

var batchContexts = function() {
  var context = {};
  fs.readdirSync('./test/data/').forEach(function(filename) {
    if (/min.css$/.exec(filename)) return;
    var testName = filename.split('.')[0];
    
    context[testName] = {
      topic: function() {
        return {
          plain: fs.readFileSync('./test/data/' + testName + '.css').toString('utf-8'),
          minimized: fs.readFileSync('./test/data/' + testName + '-min.css').toString('utf-8').replace(/\n/g, '')
        };
      }
    }
    context[testName]['minimizing ' + testName + '.css'] = function(data) {
      assert.equal(CleanCSS.process(data.plain), data.minimized)
    };
  });

  return context;
};

vows.describe('clean-batch')
  .addBatch(batchContexts())
  .export(module);