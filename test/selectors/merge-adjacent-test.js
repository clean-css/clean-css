var vows = require('vows');
var optimizerContext = require('../test-helper').optimizerContext;

vows.describe('remove duplicates')
  .addBatch(
    optimizerContext('advanced on', {
      'same context': [
        'a{color:red}a{display:block;width:75px}div{color:#fff}',
        'a{color:red;display:block;width:75px}div{color:#fff}'
      ],
      'of two non-adjacent selectors': [
        '.one{color:red}.two{color:#00f}.one{font-weight:700}',
        '.one{color:red;font-weight:700}.two{color:#00f}'
      ],
      'of two adjacent single selectors': [
        '.one{color:red}.one{font-weight:700}',
        '.one{color:red;font-weight:700}'
      ],
      'of three adjacent single selectors': [
        '.one{color:red}.one{font-weight:700}.one{font-size:13px}',
        '.one{color:red;font-weight:700;font-size:13px}'
      ],
      'of three adjacent complex, multiple selectors': [
        '.one{color:red}#two.three{color:red}.four>.five{color:red}',
        '#two.three,.four>.five,.one{color:red}'
      ],
      'of two adjacent single, complex selectors': [
        '#box>.one{color:red}#box>.one{font-weight:700}',
        '#box>.one{color:red;font-weight:700}'
      ],
      'of two adjacent multiple, complex selectors': [
        '#box>.one,.zero{color:red}#box>.one,.zero{font-weight:700}',
        '#box>.one,.zero{color:red;font-weight:700}'
      ],
      'of two adjacent selectors with duplicate properties #1': [
        '.one{color:red}.one{color:#fff}',
        '.one{color:#fff}'
      ],
      'of two adjacent selectors with duplicate properties #2': [
        '.one{color:red;font-weight:bold}.one{color:#fff;font-weight:400}',
        '.one{color:#fff;font-weight:400}'
      ],
      'of two adjacent complex selectors with different selector order': [
        '.one,.two{color:red}.two,.one{line-height:1em}',
        '.one,.two{color:red;line-height:1em}'
      ],
      'two adjacent with hex color definitions': [
        'a:link,a:visited{color:#fff}.one{display:block}a:link,a:visited{color:red}',
        '.one{display:block}a:link,a:visited{color:red}'
      ],
      'in two passes': [
        'a{color:red}a{background:red}b{color:red}b{background:red}',
        'a,b{color:red;background:red}'
      ],
      'when overriden with a browser specific selector': [
        'a{color:red}::-webkit-scrollbar,a{color:#fff}',
        'a{color:red}::-webkit-scrollbar,a{color:#fff}'
      ],
      'two same selectors over a block': [
        '.one{color:red}@media print{.two{display:block}}.one{display:none}',
        '@media print{.two{display:block}}.one{color:red;display:none}'
      ],
      'two same bodies over a block': [
        '.one{color:red}@media print{.two{display:block}}.three{color:red}',
        '.one,.three{color:red}@media print{.two{display:block}}'
      ],
      'two rules with latter with suffix properties': [
        'a{display:none}a{display:none;visibility:hidden}',
        'a{display:none;visibility:hidden}'
      ],
      'no rule after comma': [
        'h1{color:#000},h2{color:#000}',
        'h1{color:#000},h2{color:#000}'
      ],
      'no rule after comma with comma last': [
        'h1{color:#000}h2,{color:#000}',
        'h1{color:#000},h2{color:#000}'
      ]
    })
  )
  .addBatch(
    optimizerContext('advanced off', {
      'same context': [
        'a{color:red}a{display:block;width:75px}div{color:#fff}',
        'a{color:red}a{display:block;width:75px}div{color:#fff}'
      ],
    }, { advanced: false })
  )
  .export(module);
