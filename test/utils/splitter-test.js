var vows = require('vows');
var assert = require('assert');
var Splitter = require('../../lib/utils/splitter');

function split(value, expectedValue, separator, withSeparator) {
  return function () {
    assert.deepEqual(new Splitter(separator).split(value, withSeparator), expectedValue);
  };
}

vows.describe(Splitter)
  .addBatch({
    'empty': split('', [''], ','),
    'simple': split('none', ['none'], ','),
    'comma separated - level 0': split('#000,#fff,#0f0', ['#000', '#fff', '#0f0'], ','),
    'comma separated - level 1': split('rgb(0,0,0),#fff', ['rgb(0,0,0)', '#fff'], ','),
    'comma separated - level 2': split('linear-gradient(0,#fff,rgba(0,0,0)),red', ['linear-gradient(0,#fff,rgba(0,0,0))', 'red'], ','),
    'space separated - level 0': split('#000 #fff #0f0', ['#000', '#fff', '#0f0'], ' '),
    'space separated - level 1': split('rgb(0, 0, 0) #fff', ['rgb(0, 0, 0)', '#fff'], ' '),
    'space separated - level 2': split('linear-gradient(0, #fff, rgba(0, 0, 0)) red', ['linear-gradient(0, #fff, rgba(0, 0, 0))', 'red'], ' ')
  })
  .addBatch({
    'leading space and quote with separator': split(' "Font"', [' "Font"'], ' ', true),
    'comma separated - level 2 - with separator': split('linear-gradient(0,#fff,rgba(0,0,0)),red', ['linear-gradient(0,#fff,rgba(0,0,0)),', 'red'], ',', true),
    'space separated - level 2 - with separator': split('linear-gradient(0, #fff, rgba(0, 0, 0)) red', ['linear-gradient(0, #fff, rgba(0, 0, 0)) ', 'red'], ' ', true)
  })
  .export(module);
