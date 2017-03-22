var vows = require('vows');
var optimizerContext = require('../../test-helper').optimizerContext;

vows.describe('level 2 optimizer')
  .addBatch(
    optimizerContext('all optimizations', {
      'adjacent': [
        'a{display:none}a{display:none;visibility:hidden}',
        'a{display:none;visibility:hidden}'
      ],
      'overriding by !important': [
        'a{margin:0}a{margin:0!important}',
        'a{margin:0!important}'
      ],
      'shorthands and no space after closing brace': [
        '.a{background:rgba(0,0,0,0)url(//example.com/a.jpg)}',
        '.a{background:url(//example.com/a.jpg) rgba(0,0,0,0)}'
      ],
      'repeated': [
        'a{color:red;color:red}',
        'a{color:red}'
      ],
      'units': [
        '.one{width:1px;width:1rem;display:block}.two{color:red}.one{width:2px;width:1.1rem}',
        '.one{display:block;width:1.1rem}.two{color:red}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('limit rule merging', {
      'adjacent with as many rules as limit': [
        '.block--1{color:red}.block--2{color:red}.block--3{color:red}',
        '.block--1,.block--2,.block--3{color:red}'
      ],
      'adjacent with extra rule': [
        '.block--1{color:red}.block--2{color:red}.block--3{color:red}.block--4{color:red}',
        '.block--1,.block--2,.block--3{color:red}.block--4{color:red}'
      ],
      'adjacent with extra two rules': [
        '.block--1{color:red}.block--2{color:red}.block--3{color:red}.block--4{color:red}.block--5{color:red}',
        '.block--1,.block--2,.block--3{color:red}.block--4,.block--5{color:red}'
      ],
      'adjacent with extra three rules': [
        '.block--1{color:red}.block--2{color:red}.block--3{color:red}.block--4{color:red}.block--5{color:red}.block--6{color:red}',
        '.block--1,.block--2,.block--3{color:red}.block--4,.block--5,.block--6{color:red}'
      ],
      'non-adjacent': [
        '.block--1{color:red}.other-block--1{width:0}.block--2{color:red}.other-block--2{height:0}.block--3{color:red}.other-block--3{opacity:0}.block--4{color:red}',
        '.block--1{color:red}.other-block--1{width:0}.block--2,.block--3,.block--4{color:red}.other-block--2{height:0}.other-block--3{opacity:0}'
      ]
    }, { compatibility: { selectors: { mergeLimit: 3 } }, level: { 2: { all: true } } })
  )
  .addBatch(
    optimizerContext('level 2 off', {
      'repeated' : [
        'a{color:red;color:red}',
        'a{color:red;color:red}'
      ]
    }, { level: 1 })
  )
  .addBatch(
    optimizerContext('@media', {
      'empty': [
        '@media (min-width:980px){}',
        ''
      ],
      'whitespace': [
        ' @media   ( min-width:  980px ){}',
        ''
      ],
      'body': [
        '@media (min-width:980px){\na\n{color:red}}',
        '@media (min-width:980px){a{color:red}}'
      ],
      'multiple': [
        '@media screen, print, (min-width:980px){a{color:red}}',
        '@media screen,print,(min-width:980px){a{color:red}}'
      ],
      'nested once': [
        '@media screen { @media print { a{color:red} } }',
        '@media screen{@media print{a{color:red}}}'
      ],
      'nested twice': [
        '@media screen { @media print { @media (min-width:980px) { a{color:red} } } }',
        '@media screen{@media print{@media (min-width:980px){a{color:red}}}}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('@font-face', {
      'rebuilding': [
        '@font-face{font-family:PublicVintage;src:url(/PublicVintage.otf) format(\'opentype\')}',
        '@font-face{font-family:PublicVintage;src:url(/PublicVintage.otf) format(\'opentype\')}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('unit merging', {
      'font-size': [
        'div{font-size:1rem;font-size:16px}',
        'div{font-size:16px}'
      ],
      'height': [
        'div{height:1rem;height:16px}',
        'div{height:16px}'
      ],
      'width': [
        'div{width:1rem;width:16px}',
        'div{width:16px}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('variables', {
      'skip processing properties with variable values - border - 1st value': [
        '.one{border:var(--color) solid 1px}',
        '.one{border:var(--color) solid 1px}'
      ],
      'skip processing properties with variable values - border - 2nd value': [
        '.one{border:red var(--style) 1px}',
        '.one{border:red var(--style) 1px}'
      ],
      'skip processing properties with variable values - border - 3rd value': [
        '.one{border:red solid var(--width)}',
        '.one{border:red solid var(--width)}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('disabled removal of empty elements', {
      'no body': [
        'a{}',
        'a{}'
      ],
      'body with whitespace': [
        'a{\n}',
        'a{}'
      ],
      'body with comment': [
        'a{/* a comment */}',
        'a{}'
      ],
      '@media query': [
        '@media screen{}',
        '@media screen{}'
      ],
      'optimization result': [
        'a{color:red}div{color:red}',
        'a,div{color:red}div{}'
      ]
    }, { level: { 1: { removeEmpty: false }, 2: { removeEmpty: false } } })
  )
  .export(module);
