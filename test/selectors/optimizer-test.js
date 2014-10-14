var vows = require('vows');
var assert = require('assert');
var SelectorsOptimizer = require('../../lib/selectors/optimizer');
var Compatibility = require('../../lib/utils/compatibility');

function optimizerContext(group, specs, options) {
  var context = {};
  options = options || {};
  options.compatibility = new Compatibility(options.compatibility).toOptions();

  function optimized(target) {
    return function (source) {
      assert.equal(new SelectorsOptimizer(options).process(source), target);
    };
  }

  for (var name in specs) {
    context[group + ' - ' + name] = {
      topic: specs[name][0],
      optimized: optimized(specs[name][1])
    };
  }

  return context;
}

vows.describe(SelectorsOptimizer)
  .addBatch(
    optimizerContext('selectors', {
      'whitespace - heading & trailing': [
        ' a {color:red}',
        'a{color:red}'
      ],
      'whitespace - descendant selector': [
        'div > a{color:red}',
        'div>a{color:red}'
      ],
      'whitespace - next selector': [
        'div + a{color:red}',
        'div+a{color:red}'
      ],
      'whitespace - sibling selector': [
        'div  ~ a{color:red}',
        'div~a{color:red}'
      ],
      'whitespace - pseudo classes': [
        'div  :first-child{color:red}',
        'div :first-child{color:red}'
      ],
      'whitespace - line breaks': [
        '\r\ndiv\n{color:red}',
        'div{color:red}'
      ],
      'whitespace - tabs': [
        'div\t\t{color:red}',
        'div{color:red}'
      ],
      'universal selector - id, class, and property': [
        '* > *#id > *.class > *[property]{color:red}',
        '*>#id>.class>[property]{color:red}'
      ],
      'universal selector - pseudo': [
        '*:first-child{color:red}',
        ':first-child{color:red}'
      ],
      'universal selector - standalone': [
        'label ~ * + span{color:red}',
        'label~*+span{color:red}'
      ],
      'order': [
        'b,div,a{color:red}',
        'a,b,div{color:red}'
      ],
      'duplicates': [
        'a,div,.class,.class,a ,div > a{color:red}',
        '.class,a,div,div>a{color:red}'
      ],
      'mixed': [
        ' label   ~  \n*  +  span , div>*.class, section\n\n{color:red}',
        'div>.class,label~*+span,section{color:red}'
      ],
      'calc': [
        'a{width:-moz-calc(100% - 1em);width:calc(100% - 1em)}',
        'a{width:-moz-calc(100% - 1em);width:calc(100% - 1em)}'
      ]
    })
  )
  .addBatch(
    optimizerContext('properties', {
      'empty body': [
        'a{}',
        ''
      ],
      'whitespace body': [
        'a{   \n }',
        ''
      ],
    })
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
    optimizerContext('advanced on & aggressive merging on', {
      'repeated' : [
        'a{color:red;color:red}',
        'a{color:red}'
      ],
      'duplicates - same context': [
        'a{color:red}div{color:blue}a{color:red}',
        'div{color:#00f}a{color:red}'
      ],
      'duplicates - different contexts': [
        'a{color:red}div{color:blue}@media screen{a{color:red}}',
        'a{color:red}div{color:#00f}@media screen{a{color:red}}'
      ],
      'adjacent': [
        'a{color:red}a{display:block;width:100px}div{color:#fff}',
        'a{color:red;display:block;width:100px}div{color:#fff}'
      ],
      'non-adjacent': [
        'a{color:red;display:block}.one{font-size:12px}a{color:#fff;margin:2px}',
        'a{display:block}.one{font-size:12px}a{color:#fff;margin:2px}'
      ],
      'non-adjacent with multi selectors': [
        'a{padding:10px;margin:0;color:red}.one{color:red}a,p{color:red;padding:0}',
        'a{margin:0}.one{color:red}a,p{color:red;padding:0}'
      ]
    }, { advanced: true, aggressiveMerging: true })
  )
  .addBatch(
    optimizerContext('advanced on & aggressive merging off', {
      'repeated' : [
        'a{color:red;color:red}',
        'a{color:red}'
      ],
      'non-adjacent with multi selectors': [
        'a{padding:10px;margin:0;color:red}.one{color:red}a,p{color:red;padding:0}',
        'a{padding:10px;margin:0}.one{color:red}a,p{color:red;padding:0}'
      ]
    }, { advanced: true, aggressiveMerging: false })
  )
  .addBatch(
    optimizerContext('advanced off', {
      'repeated' : [
        'a{color:red;color:red}',
        'a{color:red;color:red}'
      ],
      'duplicates - same context': [
        'a{color:red}div{color:blue}a{color:red}',
        'a{color:red}div{color:#00f}a{color:red}'
      ],
      'duplicates - different contexts': [
        'a{color:red}div{color:blue}@media screen{a{color:red}}',
        'a{color:red}div{color:#00f}@media screen{a{color:red}}'
      ],
      'adjacent': [
        'a{color:red}a{display:block;width:100px}div{color:#fff}',
        'a{color:red}a{display:block;width:100px}div{color:#fff}'
      ],
      'non-adjacent': [
        'a{color:red;display:block}.one{font-size:12px}a{color:#fff;margin:2px}',
        'a{color:red;display:block}.one{font-size:12px}a{color:#fff;margin:2px}'
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('@charset', {
      'multiple': [
        '@charset \'utf-8\';a{color:red}@charset \'utf-8\';',
        '@charset \'utf-8\';a{color:red}'
      ],
      'not at beginning': [
        'a{color:red}@charset \'utf-8\';',
        '@charset \'utf-8\';a{color:red}'
      ],
      'different case': [
        'a{color:red}@ChArSeT \'utf-8\';',
        'a{color:red}'
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
