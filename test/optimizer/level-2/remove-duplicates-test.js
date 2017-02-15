var vows = require('vows');
var optimizerContext = require('../../test-helper').optimizerContext;

vows.describe('remove duplicates')
  .addBatch(
    optimizerContext('level 2 on', {
      'same context': [
        'a{color:red}div{color:blue}a{color:red}',
        'div{color:#00f}a{color:red}'
      ],
      'different contexts': [
        'a{color:red}div{color:blue}@media screen{a{color:red}}',
        'a{color:red}div{color:#00f}@media screen{a{color:red}}'
      ],
      'of two successive selectors': [
        'a{color:red}a{color:red}',
        'a{color:red}'
      ],
      'of two successive selectors with different body': [
        'a{color:red}a{display:block}',
        'a{color:red;display:block}'
      ],
      'of many successive selectors': [
        'a{color:red}a{color:red}a{color:red}a{color:red}',
        'a{color:red}'
      ],
      'of two non-successive selectors': [
        'a{color:red}p{color:#fff}a{color:red}',
        'p{color:#fff}a{color:red}'
      ],
      'of many non-successive selectors': [
        'div{width:100%}a{color:red}a{color:red}p{color:#fff}div{width:100%}ol{margin:0}p{color:#fff}',
        'a{color:red}div{width:100%}ol{margin:0}p{color:#fff}'
      ],
      'with global and media scope': [
        'a{color:red}@media screen{a{color:red}p{width:75px}a{color:red}}',
        'a{color:red}@media screen{p{width:75px}a{color:red}}'
      ],
      'with two media scopes': [
        '@media (min-width:75px){a{color:red}}@media screen{a{color:red}p{width:75px}a{color:red}}',
        '@media (min-width:75px){a{color:red}}@media screen{p{width:75px}a{color:red}}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('level 2 off but removing duplicates on', {
      'same context': [
        'a{color:red}div{color:blue}a{color:red}',
        'a{}div{color:#00f}a{color:red}'
      ]
    }, { level: { 2: { all: false, removeDuplicateRules: true } } })
  )
  .addBatch(
    optimizerContext('level 2 off', {
      'same context': [
        'a{color:red}div{color:blue}a{color:red}',
        'a{color:red}div{color:#00f}a{color:red}'
      ],
      'different contexts': [
        'a{color:red}div{color:blue}@media screen{a{color:red}}',
        'a{color:red}div{color:#00f}@media screen{a{color:red}}'
      ],
    }, { level: 1 })
  )
  .export(module);
