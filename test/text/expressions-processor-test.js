var vows = require('vows');
var assert = require('assert');
var ExpressionsProcessor = require('../../lib/text/expressions-processor');

var lineBreak = require('os').EOL;

function processorContext(name, context, saveWaypoints) {
  var vowContext = {};

  function escaped (targetCSS) {
    return function (sourceCSS) {
      var result = new ExpressionsProcessor(saveWaypoints).escape(sourceCSS);
      assert.equal(result, targetCSS);
    };
  }

  function restored (targetCSS) {
    return function (sourceCSS) {
      var processor = new ExpressionsProcessor(saveWaypoints);
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

vows.describe(ExpressionsProcessor)
  .addBatch(
    processorContext('basic', {
      'empty': [
        'a{color:expression()}',
        'a{color:__ESCAPED_EXPRESSION_CLEAN_CSS0__}',
        'a{color:expression()}'
      ],
      'method call': [
        'a{color:expression(this.parentNode.currentStyle.color)}',
        'a{color:__ESCAPED_EXPRESSION_CLEAN_CSS0__}',
        'a{color:expression(this.parentNode.currentStyle.color)}'
      ],
      'multiple calls': [
        'a{color:expression(x = 0 , this.parentNode.currentStyle.color)}',
        'a{color:__ESCAPED_EXPRESSION_CLEAN_CSS0__}',
        'a{color:expression(x = 0 , this.parentNode.currentStyle.color)}'
      ],
      'mixed content': [
        'a{zoom:expression(this.runtimeStyle[\"zoom\"] = \'1\', this.innerHTML = \'&#xf187;\')}',
        'a{zoom:__ESCAPED_EXPRESSION_CLEAN_CSS0__}',
        'a{zoom:expression(this.runtimeStyle[\"zoom\"] = \'1\', this.innerHTML = \'&#xf187;\')}'
      ],
      'complex': [
        'a{width:expression((this.parentNode.innerWidth + this.parentNode.innerHeight) / 2 )}',
        'a{width:__ESCAPED_EXPRESSION_CLEAN_CSS0__}',
        'a{width:expression((this.parentNode.innerWidth + this.parentNode.innerHeight) / 2 )}'
      ],
      'with parentheses': [
        'a{width:expression(this.parentNode.innerText == \')\' ? \'5px\' : \'10px\' )}',
        'a{width:__ESCAPED_EXPRESSION_CLEAN_CSS0__}',
        'a{width:expression(this.parentNode.innerText == \')\' ? \'5px\' : \'10px\' )}'
      ],
      'open ended (broken)': [
        'a{width:expression(this.parentNode.innerText == }',
        'a{width:__ESCAPED_EXPRESSION_CLEAN_CSS0__}',
        'a{width:expression(this.parentNode.innerText == }'
      ],
      'function call & advanced': [
        'a{zoom:expression(function(el){el.style.zoom="1"}(this))}',
        'a{zoom:__ESCAPED_EXPRESSION_CLEAN_CSS0__}',
        'a{zoom:expression(function(el){el.style.zoom="1"}(this))}'
      ],
      'with more properties': [
        'a{color:red;zoom:expression(function(el){el.style.zoom="1"}(this));display:block}',
        'a{color:red;zoom:__ESCAPED_EXPRESSION_CLEAN_CSS0__;display:block}',
        'a{color:red;zoom:expression(function(el){el.style.zoom="1"}(this));display:block}'
      ]
    })
  )
  .addBatch(
    processorContext('waypoints', {
      'empty': [
        'a{color:expression()}',
        'a{color:__ESCAPED_EXPRESSION_CLEAN_CSS0(0,12)__}',
        'a{color:expression()}'
      ],
      'method call': [
        'a{color:expression(this.parentNode.currentStyle.color)}',
        'a{color:__ESCAPED_EXPRESSION_CLEAN_CSS0(0,46)__}',
        'a{color:expression(this.parentNode.currentStyle.color)}'
      ],
      'line break call': [
        'a{color:expression(' + lineBreak + 'this.parentNode.currentStyle.color)}',
        'a{color:__ESCAPED_EXPRESSION_CLEAN_CSS0(1,35)__}',
        'a{color:expression(' + lineBreak + 'this.parentNode.currentStyle.color)}'
      ]
    }, true)
  )
  .export(module);
