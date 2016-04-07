var vows = require('vows');
var assert = require('assert');
var FreeTextProcessor = require('../../lib/text/free-text-processor');

var lineBreak = require('os').EOL;

function processorContext(name, context, saveWaypoints) {
  var vowContext = {};

  function escaped (expected) {
    return function (source) {
      var escaped = new FreeTextProcessor(saveWaypoints).escape(source);
      assert.equal(escaped, expected);
    };
  }

  function restored (expected) {
    return function (source) {
      var processor = new FreeTextProcessor(saveWaypoints);
      var restored = processor.restore(processor.escape(source));
      assert.equal(restored, expected);
    };
  }

  for (var key in context) {
    vowContext[name + ' - ' + key] = {
      topic: context[key][0],
      escaped: escaped(context[key][1]),
      restored: restored(context[key][2])
    };
  }

  return vowContext;
}

vows.describe(FreeTextProcessor)
  .addBatch(
    processorContext('basic', {
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
      'inside local': [
        '@font-face{font-family:X;src:local(\'Pacifico\') format(\'opentype\')}',
        '@font-face{font-family:X;src:local(__ESCAPED_FREE_TEXT_CLEAN_CSS0__) format(__ESCAPED_FREE_TEXT_CLEAN_CSS1__)}',
        '@font-face{font-family:X;src:local(\'Pacifico\') format(\'opentype\')}'
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
  .addBatch(
    processorContext('waypoints', {
      'no quotes': [
        'a{color:red;display:block}',
        'a{color:red;display:block}',
        'a{color:red;display:block}'
      ],
      'single quoted': [
        'a{color:red;content:\'1234\';display:block}',
        'a{color:red;content:__ESCAPED_FREE_TEXT_CLEAN_CSS0(0,6)__;display:block}',
        'a{color:red;content:\'1234\';display:block}'
      ],
      'double quoted': [
        'a{color:red;content:"1234";display:block}',
        'a{color:red;content:__ESCAPED_FREE_TEXT_CLEAN_CSS0(0,6)__;display:block}',
        'a{color:red;content:"1234";display:block}'
      ],
      'with breaks': [
        'a{color:red;content:"1234' + lineBreak + '56";display:block}',
        'a{color:red;content:__ESCAPED_FREE_TEXT_CLEAN_CSS0(1,3)__;display:block}',
        'a{color:red;content:"1234' + lineBreak + '56";display:block}'
      ]
    }, true)
  )
  .export(module);
