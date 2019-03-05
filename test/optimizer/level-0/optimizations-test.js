var vows = require('vows');

var optimizerContext = require('../../test-helper').optimizerContext;

vows.describe('level 0')
  .addBatch(
    optimizerContext('optimizations', {
      'are off': [
        'a{color:#f00;font-weight:bold}p{color:#f00}',
        'a{color:#f00;font-weight:bold}p{color:#f00}'
      ]
    }, { level: 0 })
  )
  .addBatch(
    optimizerContext('empty properties', {
      'are written': [
        'a{color:#f00;font-weight:;background:red}',
        'a{color:#f00;font-weight:;background:red}'
      ]
    }, { level: 0 })
  )
  .export(module);
