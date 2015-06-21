var vows = require('vows');
var optimizerContext = require('../test-helper').optimizerContext;

vows.describe('remove duplicate media queries')
  .addBatch(
    optimizerContext('advanced on', {
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
    })
  )
  .addBatch(
    optimizerContext('advanced off', {
      'keeps content same': [
        '@media screen{a{color:red}}@media screen{a{color:red}}',
        '@media screen{a{color:red}}@media screen{a{color:red}}'
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('media merging off', {
      'keeps content same': [
        '@media screen{a{color:red}}@media screen{a{color:red}}',
        '@media screen{a{color:red}}@media screen{a{color:red}}'
      ]
    }, { mediaMerging: false })
  )
  .export(module);
