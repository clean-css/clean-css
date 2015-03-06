var vows = require('vows');
var assert = require('assert');
var SelectorsOptimizer = require('../../lib/selectors/optimizer');
var Stringifier = require('../../lib/selectors/stringifier');
var Compatibility = require('../../lib/utils/compatibility');
var SourceTracker = require('../../lib/utils/source-tracker');

function optimizerContext(group, specs, options) {
  var stringifier = new Stringifier(false, function (data) { return data; });

  var context = {};
  options = options || {};
  options.shorthandCompacting = true;
  options.restructuring = true;
  options.compatibility = new Compatibility(options.compatibility).toOptions();
  var outerContext = {
    options: {},
    sourceTracker: new SourceTracker()
  };

  function optimized(target) {
    return function (source) {
      assert.equal(new SelectorsOptimizer(options, outerContext).process(source, stringifier).styles, target);
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
    optimizerContext('selectors - restructuring', {
      'up until changed': [
        'a{color:#000}div{color:red}.one{display:block}.two{display:inline;color:red}',
        'a{color:#000}.two,div{color:red}.one{display:block}.two{display:inline}'
      ],
      'up until top': [
        'a{width:100px}div{color:red}.one{display:block}.two{display:inline;color:red}',
        '.two,div{color:red}a{width:100px}.one{display:block}.two{display:inline}'
      ],
      'up until top with charset': [
        '@charset "utf-8";a{width:100px}div{color:red}.one{display:block}.two{display:inline;color:red}',
        '@charset "utf-8";.two,div{color:red}a{width:100px}.one{display:block}.two{display:inline}'
      ],
      'two at once': [
        '.one,.two,.three{color:red;display:block}div{margin:0}.four,.five,.six{color:red;display:block}',
        '.five,.four,.one,.six,.three,.two{color:red;display:block}div{margin:0}'
      ],
      'down until changed': [
        '.one{padding:0}.two{margin:0}.one{margin-bottom:3px}',
        '.two{margin:0}.one{padding:0;margin-bottom:3px}'
      ],
      'over shorthands': [
        'div{margin-top:0}.one{margin:0}.two{display:block;margin-top:0}',
        '.two,div{margin-top:0}.one{margin:0}.two{display:block}'
      ],
      'over shorthands with flush': [
        'div{margin-top:0}.one{margin:5px}.two{display:block;margin-top:0}.three{color:red}.four{margin-top:0}',
        'div{margin-top:0}.one{margin:5px}.four,.two{margin-top:0}.two{display:block}.three{color:red}'
      ],
      'granuar over granular': [
        'div{margin-top:0}.one{margin-bottom:2px}.two{display:block;margin-top:0}',
        '.two,div{margin-top:0}.one{margin-bottom:2px}.two{display:block}'
      ],
      'shorthand over granular with different value': [
        'div{margin:0}.one{margin-bottom:1px}.two{display:block;margin:0}',
        'div{margin:0}.one{margin-bottom:1px}.two{display:block;margin:0}'
      ],
      'shorthand over granular with different value for simple tags': [
        'div{margin:0}body{margin-bottom:1px}p{display:block;margin:0}',
        'div,p{margin:0}body{margin-bottom:1px}p{display:block}'
      ],
      'shorthand over granular with different value for simple tags when tag match': [
        'div{margin:0}body,p{margin-bottom:1px}p{display:block;margin:0}',
        'div{margin:0}body,p{margin-bottom:1px}p{display:block;margin:0}'
      ],
      'shorthand over granular with same value': [
        'div{margin:0}.one{margin-bottom:0}.two{display:block;margin:0}',
        '.two,div{margin:0}.one{margin-bottom:0}.two{display:block}'
      ],
      'over media without overriding': [
        'div{margin:0}@media{.one{color:red}}.two{display:block;margin:0}',
        '.two,div{margin:0}@media{.one{color:red}}.two{display:block}'
      ],
      'over media with overriding by different value': [
        'div{margin:0}@media{.one{margin:10px}}.two{display:block;margin:0}',
        'div{margin:0}@media{.one{margin:10px}}.two{display:block;margin:0}'
      ],
      'over media with overriding by same value': [
        'div{margin:0}@media{.one{margin:0}}.two{display:block;margin:0}',
        '.two,div{margin:0}@media{.one{margin:0}}.two{display:block}'
      ],
      'over media with overriding by a granular': [
        'div{margin:0}@media{.one{margin-bottom:0}}.two{display:block;margin:0}',
        '.two,div{margin:0}@media{.one{margin-bottom:0}}.two{display:block}'
      ],
      'over media with overriding by a different granular': [
        'div{margin-top:0}@media{.one{margin-bottom:0}}.two{display:block;margin-top:0}',
        '.two,div{margin-top:0}@media{.one{margin-bottom:0}}.two{display:block}'
      ],
      'over media with a new property': [
        'div{margin-top:0}@media{.one{margin-top:0}}.two{display:block;margin:0}',
        'div{margin-top:0}@media{.one{margin-top:0}}.two{display:block;margin:0}'
      ],
      'over a property in the same selector': [
        'div{background-size:100%}a{background:no-repeat;background-size:100%}',
        'div{background-size:100%}a{background:no-repeat;background-size:100%}'
      ],
      'multiple granular up to a shorthand': [
        '.one{border:1px solid #bbb}.two{border-color:#666}.three{border-width:1px;border-style:solid}',
        '.one{border:1px solid #bbb}.two{border-color:#666}.three{border-width:1px;border-style:solid}'
      ],
      'multiple granular - complex case': [
        '.one{background:red;padding:8px 16px}.two{padding-left:16px;padding-right:16px}.three{padding-top:20px}.four{border-left:1px solid #000;border-right:1px solid #000;border-bottom:1px solid #000}.five{background-color:#fff;background-image:-moz-linear-gradient();background-image:-ms-linear-gradient();background-image:-webkit-gradient();background-image:-webkit-linear-gradient()}',
        '.one{background:red;padding:8px 16px}.two{padding-left:16px;padding-right:16px}.three{padding-top:20px}.four{border-left:1px solid #000;border-right:1px solid #000;border-bottom:1px solid #000}.five{background-color:#fff;background-image:-moz-linear-gradient();background-image:-ms-linear-gradient();background-image:-webkit-gradient();background-image:-webkit-linear-gradient()}'
      ],
      'moving one already being moved with different value': [
        '.one{color:red}.two{display:block}.three{color:red;display:inline}.four{display:inline-block}.five{color:#000}',
        '.one,.three{color:red}.two{display:block}.three{display:inline}.four{display:inline-block}.five{color:#000}'
      ],
      'not in keyframes': [
        '@keyframes test{0%{transform:scale3d(1,1,1);opacity:1}100%{transform:scale3d(.5,.5,.5);opacity:1}}',
        '@keyframes test{0%{transform:scale3d(1,1,1);opacity:1}100%{transform:scale3d(.5,.5,.5);opacity:1}}'
      ],
      'not in vendored keyframes': [
        '@-moz-keyframes test{0%{transform:scale3d(1,1,1);opacity:1}100%{transform:scale3d(.5,.5,.5);opacity:1}}',
        '@-moz-keyframes test{0%{transform:scale3d(1,1,1);opacity:1}100%{transform:scale3d(.5,.5,.5);opacity:1}}'
      ],
      'with one important comment': [
        '__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0__a{width:100px}div{color:red}.one{display:block}.two{display:inline;color:red}',
        '__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0__.two,div{color:red}a{width:100px}.one{display:block}.two{display:inline}'
      ],
      'with many important comments': [
        '__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0____ESCAPED_COMMENT_SPECIAL_CLEAN_CSS1__a{width:100px}div{color:red}.one{display:block}.two{display:inline;color:red}',
        '__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0____ESCAPED_COMMENT_SPECIAL_CLEAN_CSS1__.two,div{color:red}a{width:100px}.one{display:block}.two{display:inline}'
      ],
      'with important comment and charset': [
        '@charset "utf-8";__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0__a{width:100px}div{color:red}.one{display:block}.two{display:inline;color:red}',
        '@charset "utf-8";__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0__.two,div{color:red}a{width:100px}.one{display:block}.two{display:inline}'
      ],
      'with charset and import': [
        '@charset "UTF-8";@import url(http://fonts.googleapis.com/css?family=Lora:400,700);a{width:100px}div{color:red}.one{display:block}.two{display:inline;color:red}',
        '@charset "UTF-8";@import url(http://fonts.googleapis.com/css?family=Lora:400,700);.two,div{color:red}a{width:100px}.one{display:block}.two{display:inline}'
      ],
      'with charset and import and comments': [
        '@charset "UTF-8";@import url(http://fonts.googleapis.com/css?family=Lora:400,700);__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0__a{width:100px}div{color:red}.one{display:block}.two{display:inline;color:red}',
        '@charset "UTF-8";@import url(http://fonts.googleapis.com/css?family=Lora:400,700);__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0__.two,div{color:red}a{width:100px}.one{display:block}.two{display:inline}'
      ]
    }, { advanced: true })
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
      ]
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
        'a{color:red;display:block}.one{margin:12px}a{color:#fff;margin:2px}',
        '.one{margin:12px}a{display:block;color:#fff;margin:2px}'
      ],
      'non-adjacent with multi selectors': [
        'a{padding:10px;margin:0;color:red}.one{color:red}a,p{color:red;padding:0}',
        '.one,a,p{color:red}a{margin:0}a,p{padding:0}'
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
        '.one,a,p{color:red}a{padding:10px;margin:0}a,p{padding:0}'
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
        '@font-face{font-family:PublicVintage;src:url(/PublicVintage.otf)format(\'opentype\')}'
      ]
    })
  )
  .export(module);
