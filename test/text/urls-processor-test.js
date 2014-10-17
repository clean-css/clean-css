var vows = require('vows');
var assert = require('assert');
var UrlsProcessor = require('../../lib/text/urls-processor');

var lineBreak = require('os').EOL;

function processorContext(name, context, saveWaypoints) {
  var vowContext = {};

  function escaped (targetCSS) {
    return function (sourceCSS) {
      var result = new UrlsProcessor(null, saveWaypoints).escape(sourceCSS);
      assert.equal(result, targetCSS);
    };
  }

  function restored (targetCSS) {
    return function (sourceCSS) {
      var processor = new UrlsProcessor(null, saveWaypoints);
      var result = processor.restore(processor.escape(sourceCSS));
      assert.equal(result, targetCSS);
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

vows.describe(UrlsProcessor)
  .addBatch(
    processorContext('basic', {
      'no urls': [
        'a{color:red}',
        'a{color:red}',
        'a{color:red}'
      ],
      'unquoted': [
        'div{background:url(some/file.png) repeat}',
        'div{background:__ESCAPED_URL_CLEAN_CSS0__ repeat}',
        'div{background:url(some/file.png) repeat}'
      ],
      'single quoted': [
        'div{background:url(\'some/file.png\') repeat}',
        'div{background:__ESCAPED_URL_CLEAN_CSS0__ repeat}',
        'div{background:url(some/file.png) repeat}'
      ],
      'single quoted with whitespace': [
        'div{background:url(\'some/file name.png\') repeat}',
        'div{background:__ESCAPED_URL_CLEAN_CSS0__ repeat}',
        'div{background:url(\'some/file name.png\') repeat}'
      ],
      'double quoted': [
        'div{background:url("some/file.png") repeat}',
        'div{background:__ESCAPED_URL_CLEAN_CSS0__ repeat}',
        'div{background:url(some/file.png) repeat}'
      ],
      'double quoted with whitespace': [
        'div{background:url("some/file name.png") repeat}',
        'div{background:__ESCAPED_URL_CLEAN_CSS0__ repeat}',
        'div{background:url("some/file name.png") repeat}'
      ],
      'multiple': [
        'div{background:url(one/file.png) repeat}p{background:url(second/file.png)}',
        'div{background:__ESCAPED_URL_CLEAN_CSS0__ repeat}p{background:__ESCAPED_URL_CLEAN_CSS1__}',
        'div{background:url(one/file.png) repeat}p{background:url(second/file.png)}'
      ],
      'whitespace': [
        'div{background:url(\'  some/\nfile.png  \') repeat}',
        'div{background:__ESCAPED_URL_CLEAN_CSS0__ repeat}',
        'div{background:url(some/file.png) repeat}'
      ],
      'unescaped closing brackets': [
        'div{background:url("some/).png") repeat}',
        'div{background:__ESCAPED_URL_CLEAN_CSS0__ repeat}',
        'div{background:url("some/).png") repeat}'
      ]
    })
  )
  .addBatch(
    processorContext('waypoints', {
      'no urls': [
        'a{color:red}',
        'a{color:red}',
        'a{color:red}'
      ],
      'unquoted': [
        'div{background:url(some/file.png) repeat}',
        'div{background:__ESCAPED_URL_CLEAN_CSS0(0,18)__ repeat}',
        'div{background:url(some/file.png) repeat}'
      ],
      'single quoted': [
        'div{background:url(\'some/file.png\') repeat}',
        'div{background:__ESCAPED_URL_CLEAN_CSS0(0,20)__ repeat}',
        'div{background:url(some/file.png) repeat}'
      ],
      'double quoted': [
        'div{background:url("some/file.png") repeat}',
        'div{background:__ESCAPED_URL_CLEAN_CSS0(0,20)__ repeat}',
        'div{background:url(some/file.png) repeat}'
      ],
      'with line breaks': [
        'div{background:url("' + lineBreak + 'some/' + lineBreak + 'file.png") repeat}',
        'div{background:__ESCAPED_URL_CLEAN_CSS0(2,10)__ repeat}',
        'div{background:url(some/file.png) repeat}'
      ],
      'multiple': [
        'div{background:url(one/file.png) repeat}p{background:url(second/file.png)}',
        'div{background:__ESCAPED_URL_CLEAN_CSS0(0,17)__ repeat}p{background:__ESCAPED_URL_CLEAN_CSS1(0,20)__}',
        'div{background:url(one/file.png) repeat}p{background:url(second/file.png)}'
      ]
    }, true)
  )
  .export(module);
