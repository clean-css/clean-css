var vows = require('vows');
var optimizerContext = require('../../test-helper').optimizerContext;

vows.describe('merge non djacent by body')
  .addBatch(
    optimizerContext('with level 2 on', {
      'of two non-adjacent selectors': [
        '.one{color:red}.two{color:#00f}.three{color:red}',
        '.one{color:red}.two{color:#00f}.three{color:red}'
      ],
      'with repeated selectors': [
        '#zero>p,.one,.two{color:red}.two,#zero>p,.three{color:red}',
        '#zero>p,.one,.three,.two{color:red}'
      ],
      'of element selectors': [
        'p{color:red}a{color:#000}div{color:red}',
        'div,p{color:red}a{color:#000}'
      ],
      'of element selectors inside @media': [
        '@media screen{p{color:red}a{color:#000}div{color:red}}',
        '@media screen{div,p{color:red}a{color:#000}}'
      ],
      'of element selectors with a class selector in between': [
        'p{color:red}.a{color:#000}div{color:red}',
        'p{color:red}.a{color:#000}div{color:red}'
      ],
      'of element selectors with an empty class selector in between': [
        'p{color:red}.a{}div{color:red}',
        'div,p{color:red}'
      ],
      'no rule after comma': [
        'h1{color:#000}div{color:red},h2{color:#000}',
        'h1{color:#000}div{color:red},h2{color:#000}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('with level 2 off but mergeNonAdjacentRules on', {
      'of element selectors': [
        'p{color:red}div{display:block}span{color:red}',
        'p,span{color:red}div{display:block}span{}'
      ]
    }, { level: { 2: { all: false, mergeNonAdjacentRules: true } } })
  )
  .addBatch(
    optimizerContext('with level 2 off but mergeNonAdjacentRules set to selector', {
      'of element selectors': [
        'p{color:red}div{display:block}span{color:red}',
        'p{color:red}div{display:block}span{color:red}'
      ]
    }, { level: { 2: { all: false, mergeNonAdjacentRules: 'selector' } } })
  )
  .addBatch(
    optimizerContext('with level 2 off', {
      'with repeated selectors': [
        '#zero>p,.one,.two{color:red}#zero>p,.three,.two{color:red}',
        '#zero>p,.one,.two{color:red}#zero>p,.three,.two{color:red}'
      ],
      'of element selectors': [
        'p{color:red}a{color:#000}div{color:red}',
        'p{color:red}a{color:#000}div{color:red}'
      ],
      'of element selectors inside @media': [
        '@media screen{p{color:red}a{color:#000}div{color:red}}',
        '@media screen{p{color:red}a{color:#000}div{color:red}}'
      ]
    }, { level: 1 })
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
    }, { level: { 2: { restructureRules: true, mergeSemantically: true } } })
  )
  .addBatch(
    optimizerContext('IE8 compatibility', {
      'of two supported selectors': [
        '.one:first-child{color:red}.two>.three{color:red}',
        '.one:first-child,.two>.three{color:red}'
      ],
      'of supported and unsupported selector': [
        '.one:first-child{color:red}.two:last-child{color:red}',
        '.one:first-child{color:red}.two:last-child{color:red}'
      ],
      'of two unsupported selectors': [
        '.one:nth-child(5){color:red}.two:last-child{color:red}',
        '.one:nth-child(5){color:red}.two:last-child{color:red}'
      ]
    }, { compatibility: 'ie8', level: 2 })
  )
  .addBatch(
    optimizerContext('IE7 compatibility', {
      'of two supported selectors': [
        '.one{color:red}.two>.three{color:red}',
        '.one,.two>.three{color:red}'
      ],
      'of supported and unsupported selector': [
        '.one{color:red}.two:last-child{color:red}',
        '.one{color:red}.two:last-child{color:red}'
      ],
      'of two unsupported selectors': [
        '.one:before{color:red}.two:last-child{color:red}',
        '.one:before{color:red}.two:last-child{color:red}'
      ]
    }, { compatibility: 'ie7', level: 2 })
  )
  .addBatch(
    optimizerContext('+adjacentSpace', {
      'of two supported selectors': [
        '.one{color:red}.two + nav{color:red}',
        '.one,.two+ nav{color:red}'
      ]
    }, { compatibility: { selectors: { adjacentSpace: true } }, level: 2 })
  )
  .export(module);
