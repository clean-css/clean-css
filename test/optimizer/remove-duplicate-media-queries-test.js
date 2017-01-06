var vows = require('vows');
var optimizerContext = require('../test-helper').optimizerContext;

vows.describe('remove duplicate media queries')
  .addBatch(
    optimizerContext('level 2 on', {
      'adjacent': [
        '@media screen{a{color:red}}@media screen{a{color:red}}',
        '@media screen{a{color:red}}'
      ],
      'non-adjacent': [
        '@media screen{a{color:red}}@media print{a{color:#fff}}@media screen{a{color:red}}',
        '@media print{a{color:#fff}}@media screen{a{color:red}}'
      ],
      'single non-mergeable': [
        '@media screen{a{color:red}}.one{color:#000}@media screen{a{color:red}}',
        '.one{color:#000}@media screen{a{color:red}}'
      ],
      'many non-mergeable': [
        '@media print{a{color:#fff}}@media screen{a{color:red}}.one{color:#000}@media screen{a{color:red}}@media print{a{display:block}}@media print{a{color:#fff}}',
        '.one{color:#000}@media screen{a{color:red}}@media print{a{display:block;color:#fff}}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('level 2 off', {
      'keeps content same': [
        '@media screen{a{color:red}}@media screen{a{color:red}}',
        '@media screen{a{color:red}}@media screen{a{color:red}}'
      ]
    }, { level: 1 })
  )
  .addBatch(
    optimizerContext('media merging off', {
      'keeps content same': [
        '@media screen{a{color:red}}@media screen{a{color:red}}',
        '@media screen{a{color:red}}@media screen{a{color:red}}'
      ]
    }, { level: { 2: { mediaMerging: false } } })
  )
  .export(module);
