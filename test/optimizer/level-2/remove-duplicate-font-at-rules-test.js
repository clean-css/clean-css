var vows = require('vows');
var optimizerContext = require('../../test-helper').optimizerContext;

vows.describe('remove duplicate @font-face at-rules')
  .addBatch(
    optimizerContext('level 2 on', {
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
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('level 2 off but removeDuplicateFontRules on', {
      'non-adjacent': [
        '@font-face{font-family:test;src:url(fonts/test.woff2)}.one{color:red}@font-face{font-family:test;src:url(fonts/test.woff2)}',
        '@font-face{font-family:test;src:url(fonts/test.woff2)}.one{color:red}@font-face{}'
      ]
    }, { level: { 2: { all: false, removeDuplicateFontRules: true } } })
  )
  .addBatch(
    optimizerContext('level 2 off', {
      'keeps content same': [
        '@font-face{font-family:test;src:url(fonts/test.woff2)}@font-face{font-family:test;src:url(fonts/test.woff2)}',
        '@font-face{font-family:test;src:url(fonts/test.woff2)}@font-face{font-family:test;src:url(fonts/test.woff2)}'
      ]
    }, { level: 1 })
  )
  .export(module);
