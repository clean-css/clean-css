var vows = require('vows');
var optimizerContext = require('../test-helper').optimizerContext;

vows.describe('advanced optimizer')
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
      ]
    }, { advanced: true })
  )
  .addBatch(
    optimizerContext('advanced on & aggressive merging on', {
      'repeated' : [
        'a{color:red;color:red}',
        'a{color:red}'
      ]
    }, { advanced: true, aggressiveMerging: true })
  )
  .addBatch(
    optimizerContext('advanced on & aggressive merging on - IE8 mode', {
      'units': [
        '.one{width:1px;width:1rem;display:block}.two{color:red}.one{width:2px;width:1.1rem}',
        '.one{display:block;width:2px;width:1.1rem}.two{color:red}'
      ]
    }, { advanced: true, aggressiveMerging: true, compatibility: 'ie8' })
  )
  .addBatch(
    optimizerContext('advanced on & aggressive merging off', {
      'repeated' : [
        'a{color:red;color:red}',
        'a{color:red}'
      ]
    }, { advanced: true, aggressiveMerging: false })
  )
  .addBatch(
    optimizerContext('advanced off', {
      'repeated' : [
        'a{color:red;color:red}',
        'a{color:red;color:red}'
      ]
    }, { advanced: false })
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
    })
  )
  .addBatch(
    optimizerContext('@font-face', {
      'rebuilding': [
        '@font-face{font-family:PublicVintage;src:url(/PublicVintage.otf) format(\'opentype\')}',
        '@font-face{font-family:PublicVintage;src:url(/PublicVintage.otf) format(\'opentype\')}'
      ]
    })
  )
  .addBatch(
    optimizerContext('unit compacting', {
      'height': [
        'div{height:1rem;height:16px}',
        'div{height:16px}'
      ],
      'width': [
        'div{width:1rem;width:16px}',
        'div{width:16px}'
      ]
    })
  )
  .export(module);
