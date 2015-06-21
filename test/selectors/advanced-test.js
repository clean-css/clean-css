var vows = require('vows');
var optimizerContext = require('../test-helper').optimizerContext;

vows.describe('advanced optimizer')
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
  .export(module);
