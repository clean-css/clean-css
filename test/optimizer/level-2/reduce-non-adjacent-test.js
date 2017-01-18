var vows = require('vows');
var optimizerContext = require('../../test-helper').optimizerContext;

vows.describe('remove duplicates')
  .addBatch(
    optimizerContext('level 2 on', {
      'single selectors': [
        '.block-1{color:red;display:block}.block-2{margin:13px}.block-1{color:#fff;margin:2px}',
        '.block-2{margin:13px}.block-1{display:block;color:#fff;margin:2px}'
      ],
      'multiple selectors': [
        'a{padding:10px;margin:0;color:red}.one{color:red}a,p{color:red;padding:0}',
        'a{margin:0}.one{color:red}a,p{color:red;padding:0}'
      ],
      'with one redefined property': [
        '.block-1{color:red;display:block}.block-2{color:red}.block-1{color:#fff;margin:2px}',
        '.block-2{color:red}.block-1{display:block;color:#fff;margin:2px}'
      ],
      'with intentionally redefined properties on joins': [
        '.block-1{display:inline-block;display:-moz-inline-box;color:red}.block-2{margin:13px}.block-1{color:#fff;margin:2px}',
        '.block-2{margin:13px}.block-1{display:inline-block;display:-moz-inline-box;color:#fff;margin:2px}'
      ],
      'with intentionally redefined properties on multiple joins': [
        '.block-1{color:red}.block-2{font-size:13px}.block-1{color:#fff;margin:2px}.block-3{margin:10px}.block-1{margin:0}',
        '.block-2{font-size:13px}.block-3{margin:10px}.block-1{color:#fff;margin:0}'
      ],
      'with all redefined properties': [
        'a{color:red;display:block}.one{font-size:13px}a{color:#fff;display:inline-block;margin:2px}',
        '.one{font-size:13px}a{color:#fff;display:inline-block;margin:2px}'
      ],
      'many with all redefined properties': [
        '.block-1{padding:10px}.block-2{color:transparent}.block-1{color:red;display:block}.block-3{font-size:13px}.block-1{color:#fff;display:inline-block;margin:2px}',
        '.block-2{color:transparent}.block-3{font-size:13px}.block-1{padding:10px;color:#fff;display:inline-block;margin:2px}'
      ],
      'when overriden by an empty selector': [
        'a{padding:10px}.one{color:red}a{}',
        'a{padding:10px}.one{color:red}'
      ],
      'when overriden by a complex selectors': [
        'a{padding:10px;margin:0;color:red}.one{color:red}a,p{color:red;padding:0}.one,a{color:#fff}',
        'a{margin:0}a,p{color:red;padding:0}.one,a{color:#fff}'
      ],
      'when complex selector overriden by simple selectors': [
        'a,p{margin:0;color:red}a{color:#fff}',
        'a,p{margin:0;color:red}a{color:#fff}'
      ],
      'when complex selector overriden by complex and simple selectors': [
        'a,p{margin:0;color:red}a{color:#fff}a,p{color:#00f}p{color:#0f0}',
        'a,p{margin:0;color:#00f}p{color:#0f0}'
      ],
      'when complex selector overriden by complex selectors': [
        '.one>.two,.three{color:red;line-height:1rem}#zero,.one>.two,.three,.www{color:#fff;margin:0}a{color:red}.one>.two,.three{line-height:2rem;font-size:1.5rem}',
        '#zero,.one>.two,.three,.www{color:#fff;margin:0}a{color:red}.one>.two,.three{line-height:2rem;font-size:1.5rem}'
      ],
      'when undefined is used as a value': [
        '.block-1{text-shadow:undefined}.block-2{font-size:14px}.block-1{font-size:13px}',
        '.block-2{font-size:14px}.block-1{text-shadow:undefined;font-size:13px}'
      ],
      'when undefined is used as a value with reduction': [
        '.one{text-shadow:undefined}p{color:red}.one{font-size:13px;text-shadow:none}',
        'p{color:red}.one{font-size:13px;text-shadow:none}'
      ],
      'when overriden with a browser specific selector': [
        'a{color:red}p{display:block}::-moz-selection,a{color:#fff}',
        'a{color:red}p{display:block}::-moz-selection,a{color:#fff}'
      ],
      'when same browser specific selector more than once': [
        'a,::-moz-selection{color:red}p{display:block}a,::-moz-selection{color:#fff}',
        'p{display:block}::-moz-selection,a{color:#fff}'
      ],
      'with full property comparison': [
        '.one{height:7rem}.two{color:#fff}.one{line-height:7rem;color:red}',
        '.two{color:#fff}.one{height:7rem;line-height:7rem;color:red}'
      ],
      'with two intermediate, non-overriding selectors': [
        '.one{color:red;margin:0}.two{color:#fff}.one{font-size:13px}',
        '.one{color:red;margin:0;font-size:13px}.two{color:#fff}'
      ],
      'with two intermediate, overriding more specific selectors': [
        '.one{color:red;margin:0}.two{font:13px serif}.one{font-size:13px}',
        '.two{font:13px serif}.one{color:red;margin:0;font-size:13px}'
      ],
      'with granular selectors from the same shorthand': [
        '.one{color:red;margin:0}.two{font-weight:700}.one{font-size:13px}',
        '.one{color:red;margin:0;font-size:13px}.two{font-weight:700}'
      ],
      'with three intermediate, non-overriding selectors': [
        '.one{color:red;margin:0}.two{color:#fff}.one{font-size:13px}.three{color:#000}.one{padding:0}',
        '.one{color:red;margin:0;font-size:13px;padding:0}.two{color:#fff}.three{color:#000}'
      ],
      'successive selectors': [
        'footer,header{top:1.25em;bottom:1.25em}header{top:2.5em}footer{bottom:2.5em}',
        'footer,header{top:1.25em;bottom:1.25em}header{top:2.5em}footer{bottom:2.5em}'
      ],
      'over a @media block': [
        '.one{color:red;margin:0}@media{.two{font-weight:700}}.one{font-size:13px}',
        '.one{color:red;margin:0;font-size:13px}@media{.two{font-weight:700}}'
      ],
      '!important values': [
        '.one,.two{margin:0!important}.one{margin:1px!important}',
        '.one,.two{margin:0!important}.one{margin:1px!important}'
      ],
      'multiple backgrounds': [
        '.two{background-color:#000}.one,.two{background-color:#fff;background-image:url(x),-moz-linear-gradient(top,#aaa,#aaa);background-image:url(x),linear-gradient(to bottom,#aaa,#aaa)}.two{background-image:url(x),-moz-linear-gradient(top,#bbb,#bbb);background-image:url(x),linear-gradient(to bottom,#bbb,#bbb)}.one,.two{display:block}',
        '.one,.two{background-color:#fff;background-image:url(x),-moz-linear-gradient(top,#aaa,#aaa);background-image:url(x),linear-gradient(to bottom,#aaa,#aaa);display:block}.two{background-image:url(x),-moz-linear-gradient(top,#bbb,#bbb);background-image:url(x),linear-gradient(to bottom,#bbb,#bbb)}'
      ],
      'border-top shorthand': [
        '.block1{border-top-width:3px;border-top-style:solid}.block1,.block2{border-top:3px solid red}',
        '.block1,.block2{border-top:3px solid red}'
      ],
      'non-reducible incomplete border shorthand': [
        '.block1{border:3px solid}.block1,.block2{border-color:red}',
        '.block1{border:3px solid}.block1,.block2{border-color:red}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('level 2 on and restructuring on', {
      'multiple selectors': [
        'a{padding:10px;margin:0;color:red}.one{color:red}a,p{color:red;padding:0}',
        '.one,a,p{color:red}a{margin:0}a,p{padding:0}'
      ],
      'when overriden by a complex selectors': [
        'a{padding:10px;margin:0;color:red}.one{color:red}a,p{color:red;padding:0}.one,a{color:#fff}',
        'a{margin:0}a,p{color:red;padding:0}.one,a{color:#fff}'
      ]
    }, { level: { 2: { restructureRules: true } } })
  )
  .addBatch(
    optimizerContext('level 2 off but reduceNonAdjacentRules and merging on', {
      'non-adjacent with multi selectors': [
        'a{padding:10px;margin:0;color:red}.one{color:red}a,p{color:red;padding:0}',
        'a{margin:0}.one{color:red}a,p{color:red;padding:0}'
      ]
    }, { level: { 2: { all: false, reduceNonAdjacentRules: true, mergeIntoShorthands: true, overrideProperties: true } } })
  )
  .addBatch(
    optimizerContext('level 2 off', {
      'non-adjacent': [
        'a{color:red;display:block}.one{font-size:13px}a{color:#fff;margin:2px}',
        'a{color:red;display:block}.one{font-size:13px}a{color:#fff;margin:2px}'
      ]
    }, { level: 1 })
  )
  .export(module);
