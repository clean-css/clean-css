var vows = require('vows');
var optimizerContext = require('../test-helper').optimizerContext;

vows.describe('remove duplicate @font-face at-rules')
  .addBatch(
    optimizerContext('advanced on', {
      'adjacent': [
        '@font-face{font-family:test;src:url(fonts/test.woff2)}@font-face{font-family:test;src:url(fonts/test.woff2)}',
        '@font-face{font-family:test;src:url(fonts/test.woff2)}'
      ],
      'non-adjacent': [
        '@font-face{font-family:test;src:url(fonts/test.woff2)}.one{color:red}@font-face{font-family:test;src:url(fonts/test.woff2)}',
        '@font-face{font-family:test;src:url(fonts/test.woff2)}.one{color:red}'
      ],
      'non-mergeable': [
        '@font-face{font-family:test;src:url(fonts/test.woff2)}.one{color:#000}@font-face{font-family:test2;src:url(fonts/test.woff2)}',
        '@font-face{font-family:test;src:url(fonts/test.woff2)}.one{color:#000}@font-face{font-family:test2;src:url(fonts/test.woff2)}'
      ]
    })
  )
  .addBatch(
    optimizerContext('advanced off', {
      'keeps content same': [
        '@font-face{font-family:test;src:url(fonts/test.woff2)}@font-face{font-family:test;src:url(fonts/test.woff2)}',
        '@font-face{font-family:test;src:url(fonts/test.woff2)}@font-face{font-family:test;src:url(fonts/test.woff2)}'
      ]
    }, { advanced: false })
  )
  .export(module);
