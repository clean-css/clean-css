var vows = require('vows');
var optimizerContext = require('../test-helper').optimizerContext;

vows.describe('merge media queries')
  .addBatch(
    optimizerContext('different ones', {
      'different ones': [
        '@media screen{a{color:red}}@media print{div{display:block}}',
        '@media screen{a{color:red}}@media print{div{display:block}}'
      ],
      'other than @media': [
        '@font-face{font-family:A}@font-face{font-family:B}',
        '@font-face{font-family:A}@font-face{font-family:B}'
      ],
      'with empty selector': [
        '@media screen{a{color:red}div{}}',
        '@media screen{a{color:red}}'
      ]
    })
  )
  .addBatch(
    optimizerContext('adjacent', {
      'same two adjacent': [
        '@media screen{a{color:red}}@media screen{div{display:block}}',
        '@media screen{a{color:red}div{display:block}}'
      ],
      'same three adjacent': [
        '@media screen{a{color:red}}@media screen{div{display:block}}@media screen{body{width:100%}}',
        '@media screen{a{color:red}div{display:block}body{width:100%}}'
      ],
      'same two with selectors in between': [
        '@media screen{a{color:red}}body{width:100%}.one{height:75px}@media screen{div{display:block}}',
        'body{width:100%}.one{height:75px}@media screen{a{color:red}div{display:block}}'
      ],
      'same two with other @media in between': [
        '@media screen{a{color:red}}@media (min-width:1024px){body{width:100%}}@media screen{div{display:block}}',
        '@media (min-width:1024px){body{width:100%}}@media screen{a{color:red}div{display:block}}'
      ],
      'same two with breaking properties in between': [
        '@media screen{a{color:red}}.one{color:#00f;display:inline}@media screen{div{display:block}}',
        '@media screen{a{color:red}}.one{color:#00f;display:inline}@media screen{div{display:block}}'
      ],
      'same two with breaking @media in between': [
        '@media screen{a{color:red}}@media (min-width:1024px){.one{color:#00f;display:inline}}@media screen{div{display:block}}',
        '@media screen{a{color:red}}@media (min-width:1024px){.one{color:#00f;display:inline}}@media screen{div{display:block}}'
      ],
      'same two with breaking nested @media in between': [
        '@media screen{a{color:red}}@media (min-width:1024px){@media screen{.one{color:#00f;display:inline}}}@media screen{div{display:block}}',
        '@media screen{a{color:red}}@media (min-width:1024px){@media screen{.one{color:#00f;display:inline}}}@media screen{div{display:block}}'
      ],
      'intermixed': [
        '@media screen{a{color:red}}@media (min-width:1024px){p{width:100%}}@media screen{div{display:block}}@media (min-width:1024px){body{height:100%}}',
        '@media screen{a{color:red}div{display:block}}@media (min-width:1024px){p{width:100%}body{height:100%}}'
      ],
      'same two with overriding shorthand in between': [
        '@media screen{a{font-size:10px}}@media (min-width:1024px){.one{font:13px Helvetica;display:inline}}@media screen{div{display:block}}',
        '@media screen{a{font-size:10px}}@media (min-width:1024px){.one{font:13px Helvetica;display:inline}}@media screen{div{display:block}}'
      ],
      'same two with different component property in between': [
        '@media screen{a{font-size:10px}}@media (min-width:1024px){.one{font-weight:700}}@media screen{div{display:block}}',
        '@media (min-width:1024px){.one{font-weight:700}}@media screen{a{font-size:10px}div{display:block}}'
      ],
      'same two with same values as moved in between': [
        '@media screen{a{color:red}}@media (min-width:1024px){.one{color:red}}@media screen{div{display:block}}',
        '@media (min-width:1024px){.one{color:red}}@media screen{a{color:red}div{display:block}}'
      ],
      'further optimizations': [
        '@media screen{a{color:red}}@media screen{a{display:block}}',
        '@media screen{a{color:red;display:block}}'
      ],
      'with comments': [
        '@media screen{a{color:red}}/*! a comment */@media screen{a{display:block}}',
        '/*! a comment */@media screen{a{color:red;display:block}}'
      ],
      'with IDs mixed with type selectors': [
        '@media (max-width:768px){#id img{display:none}}#id span{display:inline-block;width:50%}@media (max-width:768px){#id span{width:100%}}',
        '#id span{display:inline-block;width:50%}@media (max-width:768px){#id img{display:none}#id span{width:100%}}'
      ],
      'backwards': [
        '@media (max-width:768px){.one{padding-right:0}}.one{padding:10px}@media (max-width:768px){.one{margin:0}}',
        '@media (max-width:768px){.one{padding-right:0;margin:0}}.one{padding:10px}'
      ],
      'backward of two with overriding shorthand in between': [
        '@media screen{a{font-size:10px}}@media (min-width:1024px){.one{font:13px Helvetica}}@media screen{div{display:block}}',
        '@media screen{a{font-size:10px}div{display:block}}@media (min-width:1024px){.one{font:13px Helvetica}}'
      ]
    })
  )
  .addBatch(
    optimizerContext('advanced off', {
      'keeps content same': [
        '@media screen{a{color:red}}@media screen{a{display:block}}',
        '@media screen{a{color:red}}@media screen{a{display:block}}'
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('media merging off', {
      'keeps content same': [
        '@media screen{a{color:red}}@media screen{a{display:block}}',
        '@media screen{a{color:red}}@media screen{a{display:block}}'
      ]
    }, { mediaMerging: false })
  )
  .export(module);
