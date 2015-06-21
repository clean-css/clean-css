var vows = require('vows');
var optimizerContext = require('../test-helper').optimizerContext;

vows.describe('advanced optimizer')
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
      'over shorthand - border': [
        '.one{border-color:red}.two{border:1px solid}.three{color:#fff;border-color:red}',
        '.one{border-color:red}.two{border:1px solid}.three{color:#fff;border-color:red}'
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
      'dropping longer content at a right place': [
        '.one,a:hover{color:red}a:hover{color:#000;display:block;border-color:#000}.longer-name{color:#000;border-color:#000}',
        '.one,a:hover{color:red}.longer-name,a:hover{color:#000;border-color:#000}a:hover{display:block}'
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
      'multiple granular - special': [
        'input:-ms-input-placeholder{color:red;text-align:center}input::placeholder{color:red;text-align:center}',
        'input:-ms-input-placeholder{color:red;text-align:center}input::placeholder{color:red;text-align:center}'
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
        '/*! comment */a{width:100px}div{color:red}.one{display:block}.two{display:inline;color:red}',
        '/*! comment */.two,div{color:red}a{width:100px}.one{display:block}.two{display:inline}'
      ],
      'with many important comments': [
        '/*! comment 1 *//*! comment 2 */a{width:100px}div{color:red}.one{display:block}.two{display:inline;color:red}',
        '/*! comment 1 *//*! comment 2 */.two,div{color:red}a{width:100px}.one{display:block}.two{display:inline}'
      ],
      'with important comment and charset': [
        '@charset "utf-8";/*! comment */a{width:100px}div{color:red}.one{display:block}.two{display:inline;color:red}',
        '@charset "utf-8";/*! comment */.two,div{color:red}a{width:100px}.one{display:block}.two{display:inline}'
      ],
      'with charset and import': [
        '@charset "UTF-8";@import url(http://fonts.googleapis.com/css?family=Lora:400,700);a{width:100px}div{color:red}.one{display:block}.two{display:inline;color:red}',
        '@charset "UTF-8";@import url(http://fonts.googleapis.com/css?family=Lora:400,700);.two,div{color:red}a{width:100px}.one{display:block}.two{display:inline}'
      ],
      'with charset and import and comments': [
        '@charset "UTF-8";@import url(http://fonts.googleapis.com/css?family=Lora:400,700);/*! comment */a{width:100px}div{color:red}.one{display:block}.two{display:inline;color:red}',
        '@charset "UTF-8";@import url(http://fonts.googleapis.com/css?family=Lora:400,700);/*! comment */.two,div{color:red}a{width:100px}.one{display:block}.two{display:inline}'
      ],
      'with vendor prefixed value group': [
        'a{-moz-box-sizing:content-box;box-sizing:content-box}div{color:red}p{-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box}',
        'a{box-sizing:content-box}a,p{-moz-box-sizing:content-box}div{color:red}p{-webkit-box-sizing:content-box;box-sizing:content-box}'
      ]
    }, { advanced: true })
  )
  .addBatch(
    optimizerContext('selectors - semantic merging mode', {
      'simple': [
        '.a{color:red}.b{color:#000}.c{color:red}',
        '.a,.c{color:red}.b{color:#000}'
      ],
      'BEM - modifiers #1': [
        '.block{color:red}.block__element{color:#000}.block__element--modifier{color:red}',
        '.block{color:red}.block__element{color:#000}.block__element--modifier{color:red}'
      ],
      'BEM - modifiers #2': [
        '.block1{color:red}.block1__element,.block2{color:#000}.block1__element--modifier{color:red}',
        '.block1{color:red}.block1__element,.block2{color:#000}.block1__element--modifier{color:red}'
      ],
      'BEM - modifiers #3': [
        '.block1{color:red}.block1--modifier,.block2{color:#000}.block1--another-modifier{color:red}',
        '.block1{color:red}.block1--modifier,.block2{color:#000}.block1--another-modifier{color:red}'
      ],
      'BEM - tail merging': [
        '.block1{color:red}.block1__element{color:#000}.block1__element--modifier{color:red}a{color:red}.block2__element--modifier{color:red}',
        '.block1{color:red}.block1__element{color:#000}.block1__element--modifier,.block2__element--modifier,a{color:red}'
      ],
      'BEM - two blocks #1': [
        '.block1__element{color:#000}.block2{color:red}.block2__element{color:#000}.block2__element--modifier{color:red}',
        '.block1__element,.block2__element{color:#000}.block2,.block2__element--modifier{color:red}'
      ],
      'BEM - two blocks #2': [
        '.block1__element{color:#000}.block1__element--modifier{color:red}.block2{color:red}.block2__element{color:#000}.block2__element--modifier{color:red}',
        '.block1__element,.block2__element{color:#000}.block1__element--modifier,.block2,.block2__element--modifier{color:red}'
      ],
      'BEM - complex traversing #1': [
        '.block1__element{color:#000}.block1__element--modifier{color:red}.block2{color:#000;display:block;width:100%}',
        '.block1__element{color:#000}.block1__element--modifier{color:red}.block2{color:#000;display:block;width:100%}'
        // '.block1__element,.block2{color:#000}.block1__element--modifier{color:red}.block2{display:block;width:100%}' - pending #588
      ]
    }, { advanced: true, semanticMerging: true })
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
    optimizerContext('@font-face', {
      'rebuilding': [
        '@font-face{font-family:PublicVintage;src:url(/PublicVintage.otf) format(\'opentype\')}',
        '@font-face{font-family:PublicVintage;src:url(/PublicVintage.otf) format(\'opentype\')}'
      ]
    })
  )
  .export(module);
