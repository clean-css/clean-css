var vows = require('vows');
var optimizerContext = require('../../test-helper').optimizerContext;

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
    }, { level: 2 })
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
        '@media screen{.block-1{color:red}}.block-2{color:#00f;display:inline}@media screen{.block-3{display:block}}',
        '@media screen{.block-1{color:red}}.block-2{color:#00f;display:inline}@media screen{.block-3{display:block}}'
      ],
      'same two with breaking @media in between': [
        '@media screen{.block-1{color:red}}@media (min-width:1024px){.block-2{color:#00f;display:inline}}@media screen{.block-3{display:block}}',
        '@media screen{.block-1{color:red}}@media (min-width:1024px){.block-2{color:#00f;display:inline}}@media screen{.block-3{display:block}}'
      ],
      'same two with breaking nested @media in between': [
        '@media screen{.block-1{color:red}}@media (min-width:1024px){@media screen{.block-2{color:#00f;display:inline}}}@media screen{.block-3{display:block}}',
        '@media screen{.block-1{color:red}}@media (min-width:1024px){@media screen{.block-2{color:#00f;display:inline}}}@media screen{.block-3{display:block}}'
      ],
      'intermixed': [
        '@media screen{a{color:red}}@media (min-width:1024px){p{width:100%}}@media screen{div{display:block}}@media (min-width:1024px){body{height:100%}}',
        '@media screen{a{color:red}div{display:block}}@media (min-width:1024px){p{width:100%}body{height:100%}}'
      ],
      'same two with overriding shorthand in between': [
        '@media screen{.block-1{font-size:10px}}@media (min-width:1024px){.block-2{font:13px Helvetica;display:inline}}@media screen{.block-3{display:block}}',
        '@media screen{.block-1{font-size:10px}}@media (min-width:1024px){.block-2{font:13px Helvetica;display:inline}}@media screen{.block-3{display:block}}'
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
        '@media screen{.block-1{font-size:10px}}@media (min-width:1024px){.block-1{font:13px Helvetica}}@media screen{.block-3{display:block}}',
        '@media screen{.block-1{font-size:10px}.block-3{display:block}}@media (min-width:1024px){.block-1{font:13px Helvetica}}'
      ],
      'with at sign in rule name': [
        '@media screen{.one{margin-left:-16px}}.two{margin-left:0}.three{width:50%!important}.four{width:25%!important}@media screen{.three\\\@m{width:50%!important}.four\\\@m{width:25%!important}}',
        '@media screen{.one{margin-left:-16px}}.two{margin-left:0}.three{width:50%!important}.four{width:25%!important}@media screen{.three\\\@m{width:50%!important}.four\\\@m{width:25%!important}}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('semantic merging mode', {
      'moves over an otherwise blocking property': [
        '@media (max-width:1px){.a{margin:1px}}.b{margin:2px}@media (max-width:1px){.c{margin:3px}}',
        '.b{margin:2px}@media (max-width:1px){.a{margin:1px}.c{margin:3px}}'
      ],
      'moves over an otherwise blocking longhand property': [
        '@media (max-width:1px){.a{margin:1px}}.a{margin-bottom:2px}@media (max-width:1px){.a{margin:3px}}',
        '@media (max-width:1px){.a{margin:1px}}.a{margin-bottom:2px}@media (max-width:1px){.a{margin:3px}}'
      ],
      'does not move if separating selector redefines a property': [
        '@media (max-width:1px){.a{margin:1px}}.a{margin:2px}@media (max-width:1px){.a{margin:3px}}',
        '@media (max-width:1px){.a{margin:1px}}.a{margin:2px}@media (max-width:1px){.a{margin:3px}}'
      ],
      'does not move over blocking BEM block rules': [
        '@media (max-width:1px){.block{margin:1px}}.block--modifier1{margin:2px}@media (max-width:1px){.block--modifier2{margin:3px}}',
        '@media (max-width:1px){.block{margin:1px}}.block--modifier1{margin:2px}@media (max-width:1px){.block--modifier2{margin:3px}}'
      ],
      'does not move over blocking BEM element rules': [
        '@media (max-width:1px){.block__element{margin:1px}}.block__element--modifier1{margin:2px}@media (max-width:1px){.block__element--modifier2{margin:3px}}',
        '@media (max-width:1px){.block__element{margin:1px}}.block__element--modifier1{margin:2px}@media (max-width:1px){.block__element--modifier2{margin:3px}}'
      ],
      'moves over non-blocking BEM rules': [
        '@media (max-width:1px){.block{margin:1px}}.block__element{margin:2px}@media (max-width:1px){.block--modifier{margin:3px}}',
        '.block__element{margin:2px}@media (max-width:1px){.block{margin:1px}.block--modifier{margin:3px}}'
      ],
      'moves multiple rules over fewer rules': [
        '@media (max-width:1px){.block{margin:1px;padding:1px}}.block__element{margin:2px}@media (max-width:1px){.block--modifier{margin:3px}}',
        '.block__element{margin:2px}@media (max-width:1px){.block{margin:1px;padding:1px}.block--modifier{margin:3px}}'
      ]
    }, { level: { 2: { mergeSemantically: true } } })
  )
  .addBatch(
    optimizerContext('with level 2 off', {
      'keeps content same': [
        '@media screen{a{color:red}}@media screen{a{display:block}}',
        '@media screen{a{color:red}}@media screen{a{display:block}}'
      ]
    }, { level: 1 })
  )
  .addBatch(
    optimizerContext('media merging off', {
      'keeps content same': [
        '@media screen{a{color:red}}@media screen{a{display:block}}',
        '@media screen{a{color:red}}@media screen{a{display:block}}'
      ]
    }, { level: { 2: { mergeMedia: false } } })
  )
  .export(module);
