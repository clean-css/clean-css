var vows = require('vows');
var assert = require('assert');

var Tokenizer = require('../../../lib/selectors/tokenizer');
var SimpleOptimizer = require('../../../lib/selectors/optimizers/simple');

function selectorContext(specs) {
  var context = {};

  function optimized(selectors) {
    return function (source) {
      var tokens = new Tokenizer().toTokens(source);
      new SimpleOptimizer({}).optimize(tokens);

      assert.deepEqual(tokens[0].selector, selectors);
    };
  }

  for (var name in specs) {
    context['selector - ' + name] = {
      topic: specs[name][0],
      optimized: optimized(specs[name][1])
    };
  }

  return context;
}

vows.describe(SimpleOptimizer)
  .addBatch(
    selectorContext({
      'optimized': [
        'a{}',
        ['a']
      ],
      'whitespace': [
        ' div  > span{}',
        ['div>span']
      ],
      'line breaks': [
        ' div  >\n\r\n span{}',
        ['div>span']
      ]
    })
  )
  .export(module);
