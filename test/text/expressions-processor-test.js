var vows = require('vows');
var assert = require('assert');
var ExpressionsProcessor = require('../../lib/text/expressions-processor');

function processorContext(context) {
  var vowContext = {};

  function escaped (targetCSS) {
    return function (sourceCSS) {
      var result = new ExpressionsProcessor().escape(sourceCSS);
      assert.equal(result, targetCSS);
    };
  }

  function restored (targetCSS) {
    return function (sourceCSS) {
      var processor = new ExpressionsProcessor();
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

vows.describe(ExpressionsProcessor)
  .addBatch(
    processorContext({
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
  .export(module);
