var vows = require('vows');
var assert = require('assert');
var FreeTextProcessor = require('../../lib/text/free-text-processor');

function processorContext(context) {
  var vowContext = {};

  function escaped (targetCSS) {
    return function (sourceCSS) {
      var result = new FreeTextProcessor().escape(sourceCSS);
      assert.equal(result, targetCSS);
    };
  }

  function restored (targetCSS) {
    return function (sourceCSS) {
      var processor = new FreeTextProcessor();
      var result = processor.restore(processor.escape(sourceCSS));
      assert.equal(result, targetCSS);
    };
  }

  for (var key in context) {
    vowContext[key] = {
      topic: context[key][0],
      escaped: escaped(context[key][1]),
      restored: restored(context[key][2])
    };
  }

  return vowContext;
}

vows.describe(FreeTextProcessor)
  .addBatch(
    processorContext({
      'no quotes': [
        'a{color:red;display:block}',
        'a{color:red;display:block}',
        'a{color:red;display:block}'
      ],
      'single quoted': [
        'a{color:red;content:\'1234\';display:block}',
        'a{color:red;content:__ESCAPED_FREE_TEXT_CLEAN_CSS0__;display:block}',
        'a{color:red;content:\'1234\';display:block}'
      ],
      'double quoted': [
        'a{color:red;content:"1234";display:block}',
        'a{color:red;content:__ESCAPED_FREE_TEXT_CLEAN_CSS0__;display:block}',
        'a{color:red;content:"1234";display:block}'
      ],
      'inside format': [
        '@font-face{font-family:X;src:X.ttf format(\'opentype\')}',
        '@font-face{font-family:X;src:X.ttf format(__ESCAPED_FREE_TEXT_CLEAN_CSS0__)}',
        '@font-face{font-family:X;src:X.ttf format(\'opentype\')}'
      ],
      'attribute': [
        'a[data-type="search"]{}',
        'a[data-type=__ESCAPED_FREE_TEXT_CLEAN_CSS0__]{}',
        'a[data-type=search]{}'
      ],
      'font name': [
        'a{font-family:"Times","Times New Roman",serif}',
        'a{font-family:__ESCAPED_FREE_TEXT_CLEAN_CSS0__,__ESCAPED_FREE_TEXT_CLEAN_CSS1__,serif}',
        'a{font-family:Times,"Times New Roman",serif}'
      ]
    })
  )
  .export(module);
