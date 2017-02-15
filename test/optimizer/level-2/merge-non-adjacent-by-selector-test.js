var vows = require('vows');
var optimizerContext = require('../../test-helper').optimizerContext;

vows.describe('merge non djacent by selector')
  .addBatch(
    optimizerContext('level 2 on', {
      'up': [
        '.one{color:red}.two{color:#fff}.one{font-weight:400}',
        '.one{color:red;font-weight:400}.two{color:#fff}'
      ],
      'down': [
        '.one{color:red}.two{font-weight:700}.one{font-weight:400}',
        '.two{font-weight:700}.one{color:red;font-weight:400}'
      ],
      'specificity #1': [
        '.block{color:red}div{color:#00f}.block{font-weight:400}',
        '.block{color:red;font-weight:400}div{color:#00f}',
      ],
      'specificity #2': [
        '#id{background:red}.block{background-color:#00f}#id{height:1rem}#id{background-color:#fff}',
        '#id{background:#fff;height:1rem}.block{background-color:#00f}'
      ]
      // 'up - blocked': [
      //   '.one{color:red;with:100%}.two{display:inline-block;width:10px}.one{font-weight:400;display:block}',
      //   '.one{color:red;with:100%}.two{display:inline-block;width:10px}.one{font-weight:400;display:block}'
      // ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('with level 2 off but mergeNonAdjacentRules on', {
      'of element selectors': [
        '.one{color:red}.two{color:#fff}.one{font-weight:400}',
        '.one{color:red;font-weight:400}.two{color:#fff}.one{}'
      ]
    }, { level: { 2: { all: false, mergeNonAdjacentRules: true } } })
  )
  .addBatch(
    optimizerContext('with level 2 off but mergeNonAdjacentRules set to body', {
      'of element selectors': [
        '.one{color:red}.two{color:#fff}.one{font-weight:400}',
        '.one{color:red}.two{color:#fff}.one{font-weight:400}'
      ]
    }, { level: { 2: { all: false, mergeNonAdjacentRules: 'body' } } })
  )
  .addBatch(
    optimizerContext('level 2 off', {
      'up': [
        '.one{color:red}.two{color:#fff}.one{font-weight:400}',
        '.one{color:red}.two{color:#fff}.one{font-weight:400}'
      ],
      'down': [
        '.one{color:red}.two{font-weight:700}.one{font-weight:400}',
        '.one{color:red}.two{font-weight:700}.one{font-weight:400}'
      ]
    }, { level: 1 })
  )
  .export(module);
