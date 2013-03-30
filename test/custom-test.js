var vows = require('vows');
var assert = require('assert');
var CleanCSS = require('../index');

vows.describe('clean-custom')
  .addBatch({
    'imported as function': {
      topic: function() {
        return CleanCSS.process;
      },
      'should process CSS correctly': function(process) {
        assert.equal(process('a{  color: #f00;  }'), 'a{color:red}');
      }
    }
  })
  .export(module);
