var vows = require('vows');
var assert = require('assert');
var CommaSplitter = require('../../lib/text/comma-splitter');

var split = function (value, expectedValue) {
  return function () {
    assert.deepEqual(new CommaSplitter(value).split(), expectedValue);
  };
};

vows.describe('comma-splitter').addBatch({
  'empty': split('', ['']),
  'simple': split('none', ['none']),
  'comma separated - level 0': split('#000,#fff,#0f0', ['#000', '#fff', '#0f0']),
  'comma separated - level 1': split('rgb(0,0,0),#fff', ['rgb(0,0,0)', '#fff']),
  'comma separated - level 2': split('linear-gradient(0,#fff,rgba(0,0,0)),red', ['linear-gradient(0,#fff,rgba(0,0,0))', 'red'])
}).export(module);
