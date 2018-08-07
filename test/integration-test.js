var vows = require('vows');
var path = require('path');

var optimizerContext = require('./test-helper').optimizerContext;
var lineBreak = require('os').EOL;

function generateComments(count) {
  var output = [];
  var i;

  for (i = 0; i < count; i++) {
    output.push('/* */');
  }

  return output.join('');
}

vows.describe('integration tests')
  .addBatch(
    optimizerContext('identity', {
      'preserve minified content': [
        'a{color:#f10}',
        'a{color:#f10}'
      ]
    })
  )
  .addBatch(
    optimizerContext('semicolons', {
      'multiple semicolons': [
        'a{color:#fff;;;width:0; ;}',
        'a{color:#fff;width:0}'
      ],
      'trailing semicolon': [
        'a{color:#fff;}',
        'a{color:#fff}'
      ],
      'trailing semicolon and space': [
        'a{color:#fff ; }',
        'a{color:#fff}'
      ],
      'comma and space': [
        'a{color:rgba(0, 0,  5, .5)}',
        'a{color:rgba(0,0,5,.5)}'
      ]
    })
  )
  .addBatch(
    optimizerContext('whitespace', {
      'one argument': [
        'div  a  { color:#fff  }',
        'div a{color:#fff}'
      ],
      'tabs': [
        'div\t\ta{display:block}\tp{color:red}',
        'div a{display:block}p{color:red}'
      ],
      'line breaks #1': [
        'div \na\r\n { width:500px }',
        'div a{width:500px}'
      ],
      'line breaks #2': [
        'div \na\r\n, p { width:500px }',
        'div a,p{width:500px}'
      ],
      'line breaks with whitespace lines': [
        'div \n \t\n \na\r\n, p { width:500px }',
        'div a,p{width:500px}'
      ],
      'multiple arguments': [
        'a{color:#fff ;  font-weight:  bolder }',
        'a{color:#fff;font-weight:bolder}'
      ],
      'space delimited arguments': [
        'a {border: 1px solid #f10; margin: 0 auto }',
        'a{border:1px solid #f10;margin:0 auto}'
      ],
      'at beginning': [
        ' a {color:#fff}',
        'a{color:#fff}'
      ],
      'at end': [
        'a{color:#fff } ',
        'a{color:#fff}'
      ],
      'not inside calc method #1': [
        'a{width:-moz-calc(100% - 1em);width:calc(100% - 1em)}',
        'a{width:-moz-calc(100% - 1em);width:calc(100% - 1em)}'
      ],
      'not inside calc method #2': [
        'div{margin:-moz-calc(50% + 15px) -moz-calc(50% + 15px);margin:calc(50% + .5rem) calc(50% + .5rem)}',
        'div{margin:-moz-calc(50% + 15px);margin:calc(50% + .5rem)}'
      ],
      'not inside calc method with more parentheses': [
        'div{height:-moz-calc((10% + 13px)/ 2 + 10em)}',
        'div{height:-moz-calc((10% + 13px)/ 2 + 10em)}'
      ],
      'not inside calc method with multiplication': [
        'div{height:-moz-calc(3 * 2em + 10px)}',
        'div{height:-moz-calc(3 * 2em + 10px)}'
      ],
      'not inside calc method with brackets': [
        'body{margin-left:calc(50vw + (1024px/2))}',
        'body{margin-left:calc(50vw + (1024px/2))}'
      ],
      'not inside calc method with brackets #2': [
        'body{width:calc((978px * 2/3) - 30px)}',
        'body{width:calc((978px * 2/3) - 30px)}'
      ],
      'not inside calc method with brackets #3': [
        'body{margin:calc(99.99% * 1/3 - (30px - 30px * 1/3) + 30px)}',
        'body{margin:calc(99.99% * 1/3 - (30px - 30px * 1/3) + 30px)}'
      ],
      'with space between braces': [
        'body{width:calc( ( 100% - 13px) / 3 )}',
        'body{width:calc((100% - 13px)/ 3)}'
      ],
      'before colon': [
        '#test{padding-left :0}',
        '#test{padding-left:0}'
      ],
      'before colon but not selectors #1': [
        'div :before{display:block}',
        'div :before{display:block}'
      ],
      'before colon but not selectors #2': [
        'div ::-webkit-search-decoration{display:block}',
        'div ::-webkit-search-decoration{display:block}'
      ],
      'before colon but not selectors #3': [
        'div :after{color:red}',
        'div :after{color:red}'
      ],
      'windows breaks': [
        'div>a{color:red\r\n }',
        'div>a{color:red}'
      ],
      'whitespace in media queries': [
        '@media (   min-width: 980px ) {\n#page .span4 {\nwidth: 250px;\n}\n\n.row {\nmargin-left: -10px;\n}\n}',
        '@media (min-width:980px){#page .span4{width:250px}.row{margin-left:-10px}}'
      ],
      'line breaks in media queries': [
        '@media\nonly screen and (max-width: 1319px) and (min--moz-device-pixel-ratio: 1.5),\nonly screen and (max-width: 1319px) and (-moz-min-device-pixel-ratio: 1.5)\n{ a { color:#000 } }',
        '@media only screen and (max-width:1319px) and (min--moz-device-pixel-ratio:1.5),only screen and (max-width:1319px) and (-moz-min-device-pixel-ratio:1.5){a{color:#000}}'
      ],
      'in content preceded by #content': [
        '#content{display:block}#foo{content:"\0BB  "}',
        '#content{display:block}#foo{content:"\0BB  "}'
      ],
      'in content preceded by .content': [
        '.content{display:block}#foo{content:"\0BB  "}',
        '.content{display:block}#foo{content:"\0BB  "}'
      ],
      'in content preceded by line break': [
        '.content{display:block}#foo{' + lineBreak + 'content:"x"}',
        '.content{display:block}#foo{content:"x"}'
      ],
      'after rgb': [
        'a{text-shadow:rgb(255,0,1) 1px 1px}',
        'a{text-shadow:#ff0001 1px 1px}'
      ],
      'after rgba': [
        'a{text-shadow:rgba(255,0,0,1) 0 1px}',
        'a{text-shadow:rgba(255,0,0,1) 0 1px}'
      ],
      'after hsl': [
        'a{text-shadow:hsl(240,100%,40%) -1px 1px}',
        'a{text-shadow:#00c -1px 1px}'
      ],
      'after hsla': [
        'a{text-shadow:hsla(240,100%,40%,.5) -1px 1px}',
        'a{text-shadow:hsla(240,100%,40%,.5) -1px 1px}'
      ],
      'inside background': [
        'a{background:calc(100% - 2px) 10px no-repeat}',
        'a{background:calc(100% - 2px) 10px no-repeat}'
      ],
      'inside background with fraction unit': [
        'a{background:calc(100% - 2px) .5em no-repeat}',
        'a{background:calc(100% - 2px) .5em no-repeat}'
      ],
      'inside background with urls': [
        'a{background:url(image.png) no-repeat}',
        'a{background:url(image.png) no-repeat}'
      ],
      'inside background with rgba': [
        'a{background:calc(100% - 10px) no-repeat}',
        'a{background:calc(100% - 10px) no-repeat}'
      ],
      'inside margin': [
        'a{margin:calc(100% - 2px) calc(100% - 5px)}',
        'a{margin:calc(100% - 2px) calc(100% - 5px)}'
      ],
      'inside transform': [
        'a{transform:translateX(10px) translateY(10px)}',
        'a{transform:translateX(10px) translateY(10px)}'
      ],
      'after :not #1': [
        'li:not(.foo).bar{color:red}',
        'li:not(.foo).bar{color:red}'
      ],
      'after :not #2': [
        'li:not(.foo)[data-type=none]{color:red}',
        'li:not(.foo)[data-type=none]{color:red}'
      ],
      'after :not #3': [
        'li:not(.foo)#id{color:red}',
        'li:not(.foo)#id{color:red}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('whitespace with spaceAfterClosingBrace', {
      'after rgb': [
        'a{text-shadow:rgb(255,0,1) 1px 1px}',
        'a{text-shadow:#ff0001 1px 1px}'
      ],
      'after rgba': [
        'a{text-shadow:rgba(255,0,0,1) 0 1px}',
        'a{text-shadow:rgba(255,0,0,1) 0 1px}'
      ],
      'after hsl': [
        'a{text-shadow:hsl(240,100%,40%) -1px 1px}',
        'a{text-shadow:#00c -1px 1px}'
      ],
      'after hsla': [
        'a{text-shadow:hsla(240,100%,40%,.5) -1px 1px}',
        'a{text-shadow:hsla(240,100%,40%,.5) -1px 1px}'
      ],
      'inside background': [
        'a{background:calc(100% - 2px) 10px no-repeat}',
        'a{background:calc(100% - 2px)10px no-repeat}'
      ],
      'inside background with fraction unit': [
        'a{background:calc(100% - 2px) .5em no-repeat}',
        'a{background:calc(100% - 2px).5em no-repeat}'
      ],
      'inside background with urls': [
        'a{background:url(image.png) no-repeat}',
        'a{background:url(image.png)no-repeat}'
      ],
      'inside background with rgba': [
        'a{background:calc(100% - 10px) no-repeat}',
        'a{background:calc(100% - 10px)no-repeat}'
      ],
      'inside margin': [
        'a{margin:calc(100% - 2px) calc(100% - 5px)}',
        'a{margin:calc(100% - 2px) calc(100% - 5px)}'
      ],
      'inside transform': [
        'a{transform:translateX(10px) translateY(10px)}',
        'a{transform:translateX(10px)translateY(10px)}'
      ],
      'inside @media': [
        '@media only screen and (max-width:1319px) and (min--moz-device-pixel-ratio:1.5){a{color:red}}',
        '@media only screen and (max-width:1319px)and (min--moz-device-pixel-ratio:1.5){a{color:red}}'
      ]
    }, { compatibility: { properties: { spaceAfterClosingBrace: false } } })
  )
  .addBatch(
    optimizerContext('line breaks', {
      'line breaks #1': [
        'div\na\r\n{width:500px}',
        'div a{width:500px}'
      ],
      'line breaks #2': [
        'div\na\r\n,p{width:500px}',
        'div a,p{width:500px}'
      ],
      'multiple line breaks #2': [
        'div \r\n\r\na\r\n,p{width:500px}',
        'div a,p{width:500px}'
      ],
      'line breaks with whitespace lines': [
        'div \n \t\n \na\r\n, p { width:500px }',
        'div a,p{width:500px}'
      ],
      'line breaks with multiple selectors': [
        'p{width:500px}a{color:red}span{font-style:italic}',
        'p{width:500px}' + lineBreak + 'a{color:red}' + lineBreak + 'span{font-style:italic}'
      ],
      'charset not at beginning': [
        'a{ color: #f10; }\n@charset \'utf-8\';\nb { font-weight: bolder}',
        '@charset \'utf-8\';' + lineBreak + 'a{color:#f10}' + lineBreak + 'b{font-weight:bolder}'
      ],
      'charset multiple charsets': [
        '@charset \'utf-8\';\ndiv :before { display: block }\n@charset \'utf-8\';\na { color: #f10 }',
        '@charset \'utf-8\';' + lineBreak + 'div :before{display:block}' + lineBreak + 'a{color:#f10}'
      ],
      'charset with double line break': [
        '@charset \'utf-8\';' + lineBreak + lineBreak + 'a{display:block}',
        '@charset \'utf-8\';' + lineBreak + 'a{display:block}'
      ],
      'uppercase charset': [
        '@CHARSET \'utf-8\';h1{color:red}',
        'h1{color:red}'
      ],
      'mixed case charset': [
        '@chArSET \'utf-8\';h1{color:red}',
        'h1{color:red}'
      ]
    }, { format: 'keep-breaks' })
  )
  .addBatch(
    optimizerContext('line breaks and important comments', {
      'charset to beginning with comment removal': [
        '/*! some comment */' + lineBreak + lineBreak + '@charset \'utf-8\';' + lineBreak + lineBreak + 'a{display:block}',
        '@charset \'utf-8\';' + lineBreak + 'a{display:block}'
      ]
    }, { format: 'keep-breaks', level: { 1: { specialComments: 0 } } })
  )
  .addBatch(
    optimizerContext('CRLF line breaks', {
      'uses specified one': [
        '.block{color:red;display:block}',
        '.block{color:red;\r\ndisplay:block\r\n}'
      ]
    }, { format: { breaks: { afterProperty: true }, breakWith: 'crlf' } })
  )
  .addBatch(
    optimizerContext('CRLF line with format as string', {
      'uses specified one': [
        '.block{color:red;display:block}',
        '.block{color:red;\r\ndisplay:block\r\n}'
      ]
    }, { format: 'breaks:afterProperty=on;breakWith:crlf' })
  )
  .addBatch(
    optimizerContext('LF line breaks', {
      'uses specified one': [
        '.block{color:red;display:block}',
        '.block{color:red;\ndisplay:block\n}'
      ]
    }, { format: { breaks: { afterProperty: true }, breakWith: 'lf' } })
  )
  .addBatch(
    optimizerContext('selectors', {
      'not expand + in selectors mixed with calc methods': [
        'div{width:calc(50% + 3em)}div + div{width:100%}div:hover{width:calc(50% + 4em)}* > div {border:1px solid #f0f}',
        'div{width:calc(50% + 3em)}div+div{width:100%}div:hover{width:calc(50% + 4em)}*>div{border:1px solid #f0f}'
      ],
      'process selectors ending with -0 correctly': [
        '.selector-0,a{display:block}',
        '.selector-0,a{display:block}'
      ],
      'process selectors ending with -1 correctly': [
        '.selector-1,a{display:block}',
        '.selector-1,a{display:block}'
      ]
    })
  )
  .addBatch(
    optimizerContext('universal selector in ie8 compatibility mode', {
      '+html': [
        '*+html .foo{display:inline}',
        ''
      ],
      '+html:first-child': [
        '*:first-child+html .foo{display:inline}',
        ''
      ],
      'complex': [
        '*:first-child+html .foo,.bar{display:inline}',
        '.bar{display:inline}'
      ]
    }, { compatibility: 'ie8' })
  )
  .addBatch(
    optimizerContext('universal selector in ie7 compatibility mode', {
      '+html': [
        '*+html .foo{display:inline}',
        '*+html .foo{display:inline}'
      ],
      ':first-child+html': [
        '*:first-child+html .foo{display:inline}',
        '*:first-child+html .foo{display:inline}'
      ],
      'complex': [
        '*:first-child+html .foo,.bar{display:inline}',
        '*:first-child+html .foo,.bar{display:inline}'
      ]
    }, { compatibility: 'ie7' })
  )
  .addBatch(
    optimizerContext('comments', {
      'single line': [
        'a{color:#fff}/* some comment*/p{height:10px/* other comment */}',
        'a{color:#fff}p{height:10px}'
      ],
      'multiline': [
        '/* \r\n multiline \n comment */a{color:rgba(0,0,0,0.8)}',
        'a{color:rgba(0,0,0,.8)}'
      ],
      'comment chars in comments': [
        '/* \r\n comment chars * inside / comments */a{color:#fff}',
        'a{color:#fff}'
      ],
      'comment inside block': [
        'a{/* \r\n some comments */color:#fff}',
        'a{color:#fff}'
      ],
      'special comments': [
        '/*! special comment */a{color:#f10} /* normal comment */',
        '/*! special comment */a{color:#f10}'
      ],
      'should keep exact structure': [
        '/*!  \n  a > span { } with some content */',
        '/*!  \n  a > span { } with some content */'
      ],
      'should remove comments with forward slashes inside': [
        '/*////*/a{color:red}',
        'a{color:red}'
      ],
      'should properly handle line breaks and ** characters inside comments': [
        '/**====**\\\n/**2nd comment line/**===**/a{color:red}',
        'a{color:red}'
      ],
      'selector between comments': [
        '/*comment*/*/*comment*/{color:red}',
        '*{color:red}'
      ],
      'inside url': [
        'p{background-image:url(\'/*\')}/* */',
        'p{background-image:url(\'/*\')}'
      ],
      'inside url twice': [
        'p{background-image:url(\'/* */\" /*\')}/* */',
        'p{background-image:url(\'/* */\" /*\')}'
      ],
      'inside url with more quotation': [
        'p{background-image:url(\'/*\');content:""/* */}',
        'p{background-image:url(\'/*\');content:""}'
      ],
      'with quote marks': [
        '/*"*//* */',
        ''
      ],
      'important after value': [
        'div{color:red;/*!comment*/}',
        'div{color:red/*!comment*/}'
      ],
      'important between values': [
        'div{color:red;/*!comment*/display:block}',
        'div{color:red;/*!comment*/display:block}'
      ],
      'important between and after values': [
        'div{color:red;/*!comment1*/display:block;/*!comment2*/}',
        'div{color:red;/*!comment1*/display:block/*!comment2*/}'
      ],
      'two important after value': [
        'div{color:red;/*!1*//*!2*/}',
        'div{color:red/*!1*//*!2*/}'
      ],
      'two comments, general selector right after first, and quotes': [
        '/*! comment */*{box-sizing:border-box}div:before{content:" "}/*! @comment */div{display:inline-block}',
        '/*! comment */*{box-sizing:border-box}div:before{content:" "}/*! @comment */div{display:inline-block}'
      ],
      'clean-css ignore comments on top level': [
        '/* clean-css ignore:start */\n .block { color:transparent } \n/* clean-css ignore:end */',
        '\n .block { color:transparent } \n'
      ],
      'clean-css ignore comments on nested block level': [
        '@media print { /* clean-css ignore:start */\n .block { color:transparent } \n/* clean-css ignore:end */ }',
        '@media print{\n .block { color:transparent } \n}'
      ],
      'clean-css ignore comments on rule level': [
        '.block { /* clean-css ignore:start */ *!color:transparent /* clean-css ignore:end */ }',
        '.block{ *!color:transparent }'
      ],
      'clean-css ignore comments with nested block': [
        '/* clean-css ignore:start */ @media print { a { *!color:transparent } } /* clean-css ignore:end */',
        ' @media print { a { *!color:transparent } } '
      ]
    })
  )
  .addBatch(
    optimizerContext('escaping', {
      'escaped @ symbol in class name': [
        '.pad--all0\\@sm{padding:0}',
        '.pad--all0\\@sm{padding:0}'
      ],
      'escaped @ symbol in id': [
        '#id\\@sm{padding:0}',
        '#id\\@sm{padding:0}'
      ],
      'escaped slash': [
        'a{content:"\\\\"}',
        'a{content:"\\\\"}'
      ],
      'escaped quote': [
        'a{content:"\\\""}',
        'a{content:"\\\""}'
      ],
      'escaped quote in selector name': [
        '.this-class\\\'s-got-an-apostrophe{color:red}a{color:#f00}',
        '.this-class\\\'s-got-an-apostrophe,a{color:red}'
      ],
      'escaped quotes in selector name': [
        '.this-class\\\"s-got-an-apostrophes\\\'{color:red}a{color:#f00}',
        '.this-class\\\"s-got-an-apostrophes\\\',a{color:red}'
      ],
      'escaped tab': [
        'a{content:"\\\t"}',
        'a{content:"\\\t"}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('important comments - one', {
      'strip all but first': [
        '/*! important comment */a{color:red}/* some comment *//*! important comment */',
        '/*! important comment */a{color:red}'
      ]
    }, { level: { 1: { specialComments: 1 } } })
  )
  .addBatch(
    optimizerContext('important comments - none', {
      'strip all': [
        '/*! important comment */a{color:red}/* some comment *//*! important comment */',
        'a{color:red}'
      ],
      'move charset before': [
        '/*! some comment */' + lineBreak + lineBreak + '@charset \'utf-8\';' + lineBreak + lineBreak + 'a{display:block}',
        '@charset \'utf-8\';a{display:block}'
      ]
    }, { level: { 1: { specialComments: 0 } } })
  )
  .addBatch(
    optimizerContext('important comments - specialComments when a string', {
      'strip all': [
        '/*! important comment */a{color:red}/* some comment *//*! important comment */',
        'a{color:red}'
      ]
    }, { level: { 1: { specialComments: '0' } } })
  )
  .addBatch(
    optimizerContext('expressions', {
      'empty': [
        'a{color:expression()}',
        'a{color:expression()}'
      ],
      'method call': [
        'a{color:expression(this.parentNode.currentStyle.color)}',
        'a{color:expression(this.parentNode.currentStyle.color)}'
      ],
      'multiple call': [
        'a{color:expression(x = 0 , this.parentNode.currentStyle.color)}',
        'a{color:expression(x = 0 , this.parentNode.currentStyle.color)}'
      ],
      'mixed content': [
        'a{zoom:expression(this.runtimeStyle["zoom"] = "1", this.innerHTML = "&#xf187;")}',
        'a{zoom:expression(this.runtimeStyle["zoom"] = "1", this.innerHTML = "&#xf187;")}'
      ],
      'in comment': [
        '/*! expression(this.runtimeStyle["zoom"]) */',
        '/*! expression(this.runtimeStyle["zoom"]) */'
      ],
      'complex': [
        'a{width:expression((this.parentNode.innerWidth + this.parentNode.innerHeight) / 2 )}',
        'a{width:expression((this.parentNode.innerWidth + this.parentNode.innerHeight) / 2 )}'
      ],
      'with parentheses': [
        'a{width:expression(this.parentNode.innerText == ")" ? "5px" : "10px" )}',
        'a{width:expression(this.parentNode.innerText == ")" ? "5px" : "10px" )}'
      ],
      'open ended (broken)': [
        'a{width:expression(this.parentNode.innerText == }',
        'a{width:expression(this.parentNode.innerText ==}'
      ],
      'function call & level 2': [
        'a{zoom:expression(function (el){el.style.zoom="1"}(this))}',
        'a{zoom:expression(function (el){el.style.zoom="1"}(this))}'
      ]
    })
  )
  .addBatch(
    optimizerContext('text content', {
      'normal #1': [
        'a{content:"."}',
        'a{content:"."}'
      ],
      'normal #2': [
        'a:before{content : "test\'s test"; }',
        'a:before{content:"test\'s test"}'
      ],
      'open quote': [
        'a{content : open-quote;opacity:1}',
        'a{content:open-quote;opacity:1}'
      ],
      'close quote': [
        'a{content:  close-quote;clear:left}',
        'a{content:close-quote;clear:left}'
      ],
      'special characters': [
        'a{content : "  a > div { }  "}',
        'a{content:"  a > div { }  "}'
      ],
      'with JSON': [
        'body::before{content:\'{ "current" : "small", "all" : ["small"], "position" : 0 }\'}',
        'body::before{content:\'{ "current" : "small", "all" : ["small"], "position" : 0 }\'}'
      ]
    })
  )
  .addBatch(
    optimizerContext('zero values', {
      'with units': [
        'a{margin:0px 0pt 0em 0%;padding: 0in 0cm 0mm 0pc;border-top-width:0ex}',
        'a{margin:0;padding:0;border-top-width:0}'
      ],
      'multiple into one': [
        'a{margin:0 0 0 0;padding:0 0 0 0;border-width:0 0 0 0}',
        'a{margin:0;padding:0;border-width:0}'
      ],
      'background\'s none to zero': [
        'a{background:none}',
        'a{background:0 0}'
      ],
      'border\'s none to none': [
        'a{border:none}p{border-top:none}',
        'a{border:none}p{border-top:none}'
      ],
      'background:transparent to zero': [
        'a{background:transparent}p{background:transparent url(logo.png)}',
        'a{background:0 0}p{background:url(logo.png)}'
      ],
      'outline:none to outline:0': [
        'a{outline:none}',
        'a{outline:0}'
      ],
      'display:none not changed': [
        'a{display:none}',
        'a{display:none}'
      ],
      'mixed zeros not changed': [
        'div{margin:0 0 1px 2px}',
        'div{margin:0 0 1px 2px}'
      ],
      'mixed zeros not changed #2': [
        'div{padding:0 1px 0 3px}',
        'div{padding:0 1px 0 3px}'
      ],
      'mixed zeros not changed #3': [
        'div{padding:10px 0 0 1px}',
        'div{padding:10px 0 0 1px}'
      ],
      'multiple zeros with fractions #1': [
        'div{padding:0 0 0 0.5em}',
        'div{padding:0 0 0 .5em}'
      ],
      'multiple zeros with fractions #2': [
        'div{padding:0 0 0 .5em}',
        'div{padding:0 0 0 .5em}'
      ],
      'rect zeros #1': [
        'div{clip:rect(0 0 0 0)}',
        'div{clip:rect(0 0 0 0)}'
      ],
      'rect zeros #2': [
        'div{clip:rect(0px 0px 0px 0px)}',
        'div{clip:rect(0 0 0 0)}'
      ],
      'rect zeros #3': [
        'div{clip:rect( 0px 0px 0px 0px )}',
        'div{clip:rect(0 0 0 0)}'
      ],
      'rect zeros #4': [
        'div{clip:rect(0px, 0px, 0px, 0px)}',
        'div{clip:rect(0,0,0,0)}'
      ],
      'rect zeros #5': [
        'div{clip:rect(0.5% 0px 0px 0px)}',
        'div{clip:rect(.5% 0 0 0)}'
      ],
      'rect zeros #6': [
        'div{clip:rect(0px 0px 0px 10px)}',
        'div{clip:rect(0 0 0 10px)}'
      ],
      'box shadow zeros with four zeros': [
        'a{box-shadow:0 0 0 0}',
        'a{box-shadow:0 0}'
      ],
      'box shadow with two zeros': [
        'a{box-shadow:0 0}',
        'a{box-shadow:0 0}'
      ],
      'box shadow with three zeros and a fraction': [
        'a{box-shadow:0 0 0 0.15em #ebebeb}',
        'a{box-shadow:0 0 0 .15em #ebebeb}'
      ],
      'box shadow with three zeros and a value': [
        'a{box-shadow:0 0 0 15px #ebebeb}',
        'a{box-shadow:0 0 0 15px #ebebeb}'
      ],
      'prefixed box shadow zeros': [
        'a{-webkit-box-shadow:0 0 0 0; -moz-box-shadow:0 0 0 0}',
        'a{-webkit-box-shadow:0 0;-moz-box-shadow:0 0}'
      ],
      'zero as .0 #1': [
        'a{color:rgba(0,0,.0,1)}',
        'a{color:rgba(0,0,0,1)}'
      ],
      'zero as .0 #2': [
        'body{margin:.0}',
        'body{margin:0}'
      ],
      'zero as .0 #3': [
        'body{margin:.0em}',
        'body{margin:0}'
      ],
      'zero as .0 #4': [
        'body{margin:.0 1em .0 .0}',
        'body{margin:0 1em 0 0}'
      ],
      'missing #1': [
        'body{margin:2.em}',
        'body{margin:2.em}'
      ],
      'missing #2': [
        'p{opacity:1.}',
        'p{opacity:1.}'
      ],
      'missing #3': [
        'p{opacity:11.px}',
        'p{opacity:11.px}'
      ],
      'minus zero as value to zero': [
        'body{margin:-0}',
        'body{margin:0}'
      ],
      'minus zero in function to zero': [
        'body{color:rgba(-0,-0,-0,-0)}',
        'body{color:transparent}'
      ],
      'minus zero px to zero': [
        'body{margin:-0px}',
        'body{margin:0}'
      ],
      'zero em to zero': [
        'body{margin:0.0em}',
        'body{margin:0}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('zero values in ie8 compatibility mode', {
      'rems': [
        'div{width:0rem;height:0rem}',
        'div{width:0rem;height:0rem}'
      ]
    }, { compatibility: 'ie8' })
  )
  .addBatch(
    optimizerContext('zero values in any other compatibility mode', {
      'rems': [
        'div{width:0rem;height:0rem}',
        'div{width:0;height:0}'
      ]
    }, { compatibility: '*' })
  )
  .addBatch(
    optimizerContext('shorthands', {
      'padding - same 4 values': [
        'div{padding:1px 1px 1px 1px}',
        'div{padding:1px}'
      ],
      'margin - same 4 values': [
        'div{margin:1% 1% 1% 1%}',
        'div{margin:1%}'
      ],
      'border-width - same 4 values': [
        'div{border-width:1em 1em 1em 1em}',
        'div{border-width:1em}'
      ],
      'border-style - same 4 values': [
        'div{border-style:solid solid solid solid}',
        'div{border-style:solid}'
      ],
      'border-color - same 4 values': [
        'div{border-color:red red red red}',
        'div{border-color:red}'
      ],
      'border-color - same 4 values as hex': [
        'div{border-color:#f0f #f0f #f0f #f0f}',
        'div{border-color:#f0f}'
      ],
      'border-color - same 4 values as rgb': [
        'div{border-color:rgb(0,0,0) rgb(0,0,0) rgb(0,0,0) rgb(0,0,0)}',
        'div{border-color:#000}'
      ],
      'border-color - same 4 values as rgba': [
        'div{border-color:rgba(0,0,0,.5) rgba(0,0,0,.5) rgba(0,0,0,.5) rgba(0,0,0,.5)}',
        'div{border-color:rgba(0,0,0,.5)}'
      ],
      'border-radius - same 4 values': [
        'div{border-radius:3px 3px 3px 3px}',
        'div{border-radius:3px}'
      ],
      'border-radius - same 4 values with vendor prefixes': [
        'div{-moz-border-radius:3px 3px 3px 3px;-o-border-radius:3px 3px 3px 3px;-webkit-border-radius:3px 3px 3px 3px;border-radius:3px 3px 3px 3px}',
        'div{-moz-border-radius:3px;-o-border-radius:3px;-webkit-border-radius:3px 3px 3px 3px;border-radius:3px}'
      ],
      'padding - same pairs': [
        'div{padding:15.5em 10.5em 15.5em 10.5em}',
        'div{padding:15.5em 10.5em}'
      ],
      'margin - same 2nd and 4th value': [
        'div{margin:1px 2px 3px 2px}',
        'div{margin:1px 2px 3px}'
      ],
      'padding - same 3 values': [
        'div{padding:1px 1px 1px}',
        'div{padding:1px}'
      ],
      'padding - different 3 values': [
        'div{padding:1px 1em 1%}',
        'div{padding:1px 1em 1%}'
      ],
      'margin - 3 callapsible values': [
        'div{margin:1ex 2ex 1ex}',
        'div{margin:1ex 2ex}'
      ],
      'border-radius - same 3 values with one vendor prefixe': [
        'div{-webkit-border-radius:3px 3px 3px;border-radius:3px 3px 3px}',
        'div{-webkit-border-radius:3px 3px 3px;border-radius:3px}'
      ],
      'border-color - same 2nd and 4th value as rgb': [
        'div{border-color:rgb(0,0,0) rgb(34,0,0) rgb(255,0,0) rgb(34,0,0)}',
        'div{border-color:#000 #200 red}'
      ],
      'margin - 3 different values': [
        'div{margin:1px 1px 3px}',
        'div{margin:1px 1px 3px}'
      ],
      'border width - 3 different values': [
        'div{border-width:1px 2px 3px}',
        'div{border-width:1px 2px 3px}'
      ],
      'padding - same 2 values': [
        'div{padding:1px 1px}',
        'div{padding:1px}'
      ],
      'margin - same 2 values': [
        'div{margin:5% 5%}',
        'div{margin:5%}'
      ],
      'border-width - same 2 values': [
        'div{border-width:.5em .5em}',
        'div{border-width:.5em}'
      ],
      'different units': [
        'div{padding:1px 1em 1% 1rem}',
        'div{padding:1px 1em 1% 1rem}'
      ],
      'fractions': [
        'div{margin:.1em .1em .1em .1em}',
        'div{margin:.1em}'
      ],
      'preceding value': [
        'div{padding:010px 00015px}',
        'div{padding:10px 15px}'
      ],
      'preceding value with fraction zeros': [
        'div{padding:010.0em .05rem}',
        'div{padding:10em .05rem}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('units', {
      'negative padding': [
        'div{padding-left:2px;padding-top:-2px;padding-right:5px;padding-bottom:0}',
        'div{padding-left:2px;padding-right:5px;padding-bottom:0}'
      ],
      'negative padding after negative shorthand': [
        'div{padding:-5px 0 0 0;padding-left:2px;padding-top:-2px;padding-right:5px;padding-bottom:0}',
        'div{padding-left:2px;padding-right:5px;padding-bottom:0}'
      ],
      'negative padding in calculations': [
        'div{padding:calc(100% - 5px) 0 0}',
        'div{padding:calc(100% - 5px) 0 0}'
      ]
    })
  )
  .addBatch(
    optimizerContext('floats', {
      'strips zero in fractions': [
        'a{ margin-bottom: 0.5em}',
        'a{margin-bottom:.5em}'
      ],
      'not strips zero in fractions of numbers greater than zero': [
        'a{ margin-bottom: 20.5em}',
        'a{margin-bottom:20.5em}'
      ],
      'strip fraction zero #1': [
        'a{opacity:1.0}',
        'a{opacity:1}'
      ],
      'strip fraction zero #2': [
        'a{opacity:15.000%}',
        'a{opacity:15%}'
      ],
      'strip fraction zero #3': [
        'a{padding:15.55000em}',
        'a{padding:15.55em}'
      ],
      'strip fraction zero #4': [
        'a{padding:15.101em}',
        'a{padding:15.101em}'
      ],
      'strip fraction zero #5': [
        'a{border-width:0.20em 20.30em}',
        'a{border-width:.2em 20.3em}'
      ],
      'strip fraction zeros': [
        'div{margin:1.000em 2.00em 3.100em 4.01em}',
        'div{margin:1em 2em 3.1em 4.01em}'
      ],
      'leave pixels as is': [
        'div{transform:translateY(-418.505123px)}',
        'div{transform:translateY(-418.505123px)}'
      ],
      'do not round percentages': [
        'div{left:20.505%}',
        'div{left:20.505%}'
      ],
      'do not round ems': [
        'div{font-size:1.505em}',
        'div{font-size:1.505em}'
      ]
    })
  )
  .addBatch(
    optimizerContext('floats - rounding to 4', {
      'gives value correctly rounded': [
        'div{transform:translateY(-418.505123px)}',
        'div{transform:translateY(-418.5051px)}'
      ]
    }, { level: { 1: { roundingPrecision: 4 } } })
  )
  .addBatch(
    optimizerContext('floats - rounding to 2', {
      'gives value correctly rounded': [
        'div{transform:translateY(-418.505123px)}',
        'div{transform:translateY(-418.51px)}'
      ],
      'rounds .9999 correctly': [
        'a{stroke-width:.99999px}',
        'a{stroke-width:1px}'
      ],
      'rounds 9.995 correctly': [
        'a{stroke-width:9.995px}',
        'a{stroke-width:9.99px}'
      ]
    }, { level: { 1: { roundingPrecision: 2 } } })
  )
  .addBatch(
    optimizerContext('floats - rounding disabled via -1', {
      'does not round': [
        'div{transform:translateY(-418.505123px)}',
        'div{transform:translateY(-418.505123px)}'
      ]
    }, { level: { 1: { roundingPrecision: -1 } } })
  )
  .addBatch(
    optimizerContext('floats - rounding disabled', {
      'does not round': [
        'div{transform:translateY(-418.505123px)}',
        'div{transform:translateY(-418.505123px)}'
      ]
    }, { level: { 1: { roundingPrecision: 'off' } } })
  )
  .addBatch(
    optimizerContext('colors', {
      'shorten rgb to standard hexadecimal format': [
        'a{ color:rgb(5, 10, 15) }',
        'a{color:#050a0f}'
      ],
      'skip rgba shortening': [
        'a{ color:rgba(5, 10, 15, 0.5)}',
        'a{color:rgba(5,10,15,.5)}'
      ],
      'shorten colors to 3 digit hex instead of 6 digit': [
        'a{ background-color: #aa0000; color:rgb(0, 17, 255)}',
        'a{background-color:#a00;color:#01f}'
      ],
      'color names to hex values': [
        'a{color:white;border-color:black;background-color:fuchsia}p{background:yellow}',
        'a{color:#fff;border-color:#000;background-color:#f0f}p{background:#ff0}'
      ],
      'keep selectors with color name #1': [
        '.black-and-white .foo{color:#fff;background-color:#000}',
        '.black-and-white .foo{color:#fff;background-color:#000}'
      ],
      'keep selectors with color name #2': [
        '.go-blues{background:#000}',
        '.go-blues{background:#000}'
      ],
      'keep selectors with color name #3': [
        '#top_white{background:#000}',
        '#top_white{background:#000}'
      ],
      'keep selectors with color name #4': [
        'a[data-sth=white]{background:#000}',
        'a[data-sth=white]{background:#000}'
      ],
      'color names to hex values with important': [
        'a{color:white !important}',
        'a{color:#fff!important}'
      ],
      'color names to hex values in gradients': [
        'p{background:linear-gradient(-90deg,black,white)}',
        'p{background:linear-gradient(-90deg,#000,#fff)}'
      ],
      'hex value to color name if shorter': [
        'p{color:#f00}',
        'p{color:red}'
      ],
      'upper case hex value to color name if shorter': [
        'p{color:#F00}',
        'p{color:red}'
      ],
      'upper case long hex value to color name if shorter': [
        'p{color:#FF0000}',
        'p{color:red}'
      ],
      'hex value to color name in borders': [
        'p{border:1px solid #f00}',
        'p{border:1px solid red}'
      ],
      'hex value to color name in gradients': [
        'p{background:-moz-linear-gradient(-90deg,#000,#f00)}',
        'p{background:-moz-linear-gradient(-90deg,#000,red)}'
      ],
      'hex value to color name in gradients #2': [
        'p{background:-webkit-gradient(linear, left top, left bottom, from(#000), to(#f00))}',
        'p{background:-webkit-gradient(linear,left top,left bottom,from(#000),to(red))}'
      ],
      'border color - keep unchanged': [
        'p{border:1px solid #f94311}',
        'p{border:1px solid #f94311}'
      ],
      'border color - hex to name': [
        'p{border:1em dotted #f00}',
        'p{border:1em dotted red}'
      ],
      'border color - name to hex': [
        'p{border:1em dotted white}',
        'p{border:1em dotted #fff}'
      ],
      'border color - rgb': [
        'p{border:1em dotted rgb(255,0,0)}',
        'p{border:1em dotted red}'
      ],
      'colors and colons': [
        'a{background-image:linear-gradient(top,red,#e6e6e6)}',
        'a{background-image:linear-gradient(top,red,#e6e6e6)}'
      ],
      'colors and parentheses': [
        'a{background-image:-webkit-gradient(linear,0 0,0 100%,from(#fff),to(#e6e6e6))}',
        'a{background-image:-webkit-gradient(linear,0 0,0 100%,from(#fff),to(#e6e6e6))}'
      ],
      'rgb percents': [
        'a{color:rgb(100%,0%,0%)}',
        'a{color:rgb(100%,0%,0%)}'
      ],
      'rgba percents': [
        'a{color:rgba(100%,0%,0%,.5)}',
        'a{color:rgba(100%,0%,0%,.5)}'
      ],
      'hsla percents': [
        'a{color:hsla(1,0%,0%,.5)}',
        'a{color:hsla(1,0%,0%,.5)}'
      ],
      'hsla custom ': [
        'a{color:hsl(80,30%,50%,.5)}',
        'a{color:hsl(80,30%,50%,.5)}'
      ],
      'hsl to hex #1': [
        'a{color:hsl(0,0%,0%)}',
        'a{color:#000}'
      ],
      'hsl to hex #2': [
        'a{color:hsl(0,100%,100%)}',
        'a{color:#fff}'
      ],
      'hsl to hex #3': [
        'a{color:hsl(240,100%,50%)}',
        'a{color:#00f}'
      ],
      'hsl to hex #4': [
        'a{color:hsl(240,100%,50%)}',
        'a{color:#00f}'
      ],
      'hsl to hex #5': [
        'a{color:hsl(120,100%,25%)}',
        'a{color:#007f00}'
      ],
      'hsl to hex #6': [
        'a{color:hsl(99,66%,33%)}',
        'a{color:#438b1c}'
      ],
      'hsl to hex #7': [
        'a{color:hsl(360,100%,50%)}',
        'a{color:red}'
      ],
      'hsla not to hex': [
        'a{color:hsl(99,66%,33%,.5)}',
        'a{color:hsl(99,66%,33%,.5)}'
      ],
      'hsl out of bounds #1': [
        'a{color:hsl(120,200%,50%)}',
        'a{color:#0f0}'
      ],
      'hsl out of bounds #2': [
        'a{color:hsl(120,-100%,50%)}',
        'a{color:#7f7f7f}'
      ],
      'hsl out of bounds #3': [
        'a{color:hsl(480,100%,25%)}',
        'a{color:#007f00}'
      ],
      'hsl out of bounds #4': [
        'a{color:hsl(-240,100%,75%)}',
        'a{color:#7fff7f}'
      ],
      'hsl out of bounds #5': [
        'a{color:hsl(-600,100%,75%)}',
        'a{color:#7fff7f}'
      ],
      'hsl out of bounds #6': [
        'a{color:hsl(0,0%,122%)}',
        'a{color:#fff}'
      ],
      'hsl out of bounds #7': [
        'a{color:hsl(0,0%,-10%)}',
        'a{color:#000}'
      ],
      'rgb out of a lower bound': [
        'a{color:rgb(-1,-1,-1)}',
        'a{color:#000}'
      ],
      'rgb out of an upper bound': [
        'a{color:rgb(256,256,256)}',
        'a{color:#fff}'
      ],
      'turns rgba(0,0,0,0) to transparent': [
        'a{color:rgba(0,0,0,0)}',
        'a{color:transparent}'
      ],
      'turns rgba(0.0,0.0,0.0,0) to transparent': [
        'a{color:rgba(0.0,0.0,0.0,0)}',
        'a{color:transparent}'
      ],
      'turns hsla(0,0%,0%,0) to transparent': [
        'a{color:hsla(0,0%,0%,0)}',
        'a{color:transparent}'
      ],
      'turns hsla(0,0,0,0) to transparent': [
        'a{color:hsla(0,0,0,0)}',
        'a{color:transparent}'
      ],
      'turns hsla(0.0,0.0%,0.0%,0) to transparent': [
        'a{color:hsla(0.0,0.0%,0.0%,0)}',
        'a{color:transparent}'
      ],
      'turns hsla(0.0,0.0,0.0,0) to transparent': [
        'a{color:hsla(0.0,0.0,0.0,0)}',
        'a{color:transparent}'
      ],
      'keeps rgba(0,0,0,0) for background': [
        'a{background:rgba(0,0,0,0)}',
        'a{background:rgba(0,0,0,0)}'
      ],
      'keeps rgba(0,0,0,0) for background-color': [
        'a{background-color:rgba(0,0,0,0)}',
        'a{background-color:rgba(0,0,0,0)}'
      ],
      'keeps rgba(255,255,255,0)': [
        'a{color:rgba(255,255,255,0)}',
        'a{color:rgba(255,255,255,0)}'
      ],
      'keeps rgba(255,0,255,0)': [
        'a{color:rgba(255,0,255,0)}',
        'a{color:rgba(255,0,255,0)}'
      ],
      'keeps hsla(120,100%,50%,0)': [
        'a{color:hsla(120,100%,50%,0)}',
        'a{color:hsla(120,100%,50%,0)}'
      ],
      'keeps rgba(0,0,0,.5)': [
        'a{color:rgba(0,0,0,.5)}',
        'a{color:rgba(0,0,0,.5)}'
      ],
      'keeps rgba(0,255,0,.5)': [
        'a{color:rgba(0,255,0,.5)}',
        'a{color:rgba(0,255,0,.5)}'
      ],
      'keeps hsla(120,100%,50%,.5)': [
        'a{color:hsla(120,100%,50%,.5)}',
        'a{color:hsla(120,100%,50%,.5)}'
      ],
      'keeps rgba(0,0,0,0) when inside a gradient': [
        'a{background:linear-gradient(0,#000,rgba(0,0,0,0))}',
        'a{background:linear-gradient(0,#000,rgba(0,0,0,0))}'
      ],
      'keeps hsla(120,100%,50%,0) when inside a gradient': [
        'a{background:linear-gradient(0,#000,hsla(120,100%,50%,0))}',
        'a{background:linear-gradient(0,#000,hsla(120,100%,50%,0))}'
      ],
      'keeps transparent color in layered background': [
        'a{background:linear-gradient(0,#000,hsla(120,100%,50%,0)),rgba(0,0,0,0)}',
        'a{background:linear-gradient(0,#000,hsla(120,100%,50%,0)),rgba(0,0,0,0)}'
      ]
    })
  )
  .addBatch(
    optimizerContext('border-radius', {
      'border radius H+V 0/0': [
        'a{border-radius:0 / 0}',
        'a{border-radius:0}'
      ],
      'border radius side H+V 0/0': [
        'a{border-top-left-radius:0 / 0}',
        'a{border-top-left-radius:0}'
      ],
      'border radius H+V same values': [
        'a{border-radius:5px / 5px}',
        'a{border-radius:5px}'
      ],
      'border radius side H+V same values': [
        'a{border-top-left-radius:1em / 1em}',
        'a{border-top-left-radius:1em}'
      ]
    })
  )
  .addBatch(
    optimizerContext('font weights', {
      'font weight in font declarations': [
        'body{font:normal 13px/20px "Helvetica Neue",Helvetica,Arial,sans-serif}',
        'body{font:normal 13px/20px "Helvetica Neue",Helvetica,Arial,sans-serif}'
      ],
      'font weight in extended font declarations': [
        'a{font:normal normal normal 13px/20px Helvetica}',
        'a{font:normal normal normal 13px/20px Helvetica}'
      ],
      'font weight where style and weight are declared': [
        'a{font:normal 300 100%/1.5 sans-serif}',
        'a{font:normal 300 100%/1.5 sans-serif}'
      ]
    })
  )
  .addBatch(
    optimizerContext('unicode', {
      'font-names': [
        'body{font-family:\\5FAE\\8F6F\\96C5\\9ED1,\\5B8B\\4F53,sans-serif}',
        'body{font-family:\\5FAE\\8F6F\\96C5\\9ED1,\\5B8B\\4F53,sans-serif}'
      ]
    })
  )
  .addBatch(
    optimizerContext('urls', {
      'keep urls without parentheses unchanged': [
        'a{background:url(/images/blank.png)}',
        'a{background:url(/images/blank.png)}'
      ],
      'strip quotes from base64 encoded PNG data URI': [
        '.icon-logo{background-image:url(\'data:image/png;base64,iVBORw0\')}',
        '.icon-logo{background-image:url(data:image/png;base64,iVBORw0)}'
      ],
      'strip quotes from base64 encoded ICO data URI': [
        '.icon-logo{background-image:url("data:image/x-icon;base64,AAABAAEAEBA")}',
        '.icon-logo{background-image:url(data:image/x-icon;base64,AAABAAEAEBA)}'
      ],
      'cut off url content on selector level': [
        'a{background:url(image/}',
        ''
      ],
      'cut off url content on block level': [
        '@font-face{src:url(data:application/x-font-woff;base64,d09GRk9UVE8AAENAAA0AAAAA}',
        ''
      ],
      'cut off url content on top level': [
        '@font-face{src:url(data:application/x-font-woff;base64,d09GRk9UVE8AAENAAA0AAAAA',
        ''
      ],
      'strip single parentheses': [
        'a{background:url(\'/images/blank.png\')}',
        'a{background:url(/images/blank.png)}'
      ],
      'strip double parentheses': [
        'a{background:url("/images/blank.png")}',
        'a{background:url(/images/blank.png)}'
      ],
      'keep quoting if whitespace': [
        'a{background:url("/images/blank image.png")}',
        'a{background:url("/images/blank image.png")}'
      ],
      'keep quoting if whitespace inside @font-face': [
        '@font-face{src:url("Helvetica Neue.eot")}',
        '@font-face{src:url("Helvetica Neue.eot")}'
      ],
      'strip more': [
        'p{background:url("/images/blank.png")}b{display:block}a{background:url("/images/blank2.png")}',
        'p{background:url(/images/blank.png)}b{display:block}a{background:url(/images/blank2.png)}'
      ],
      'not strip comments if spaces inside': [
        'p{background:url("/images/long image name.png")}b{display:block}a{background:url("/images/no-spaces.png")}',
        'p{background:url("/images/long image name.png")}b{display:block}a{background:url(/images/no-spaces.png)}'
      ],
      'not add a space before url\'s hash': [
        'a{background:url(/fonts/d90b3358-e1e2-4abb-ba96-356983a54c22.svg#d90b3358-e1e2-4abb-ba96-356983a54c22)}',
        'a{background:url(/fonts/d90b3358-e1e2-4abb-ba96-356983a54c22.svg#d90b3358-e1e2-4abb-ba96-356983a54c22)}'
      ],
      'keep urls from being stripped down #1': [
        'a{background:url(/image-1.0.png)}',
        'a{background:url(/image-1.0.png)}'
      ],
      'keep urls from being stripped down #2': [
        'a{background:url(/image-white.png)}',
        'a{background:url(/image-white.png)}'
      ],
      'keep urls from being stripped down #3': [
        'a{background:url(/libraries/jquery-ui-1.10.1.custom/images/ui-bg_highlight-soft_100_eeeeee_1x100.png) 50% top #eee}',
        'a{background:url(/libraries/jquery-ui-1.10.1.custom/images/ui-bg_highlight-soft_100_eeeeee_1x100.png) 50% top #eee}'
      ],
      'keep special markers in comments (so order is important)': [
        '/*! __ESCAPED_URL_CLEAN_CSS0__ */a{display:block}',
        '/*! __ESCAPED_URL_CLEAN_CSS0__ */a{display:block}'
      ],
      'strip new line in urls': [
        'a{background:url(/very/long/' + lineBreak + 'path)}',
        'a{background:url(/very/long/path)}'
      ],
      'strip new line in urls which could be unquoted': [
        'a{background:url("/very/long/' + lineBreak + 'path")}',
        'a{background:url(/very/long/path)}'
      ],
      'uppercase': [
        'a{background-image: URL("images/image.png");}',
        'a{background-image:url(images/image.png)}'
      ],
      'image-set': [
        'a{background:url(one.png);background:-webkit-image-set(url(one.png) 1x,url(two.png) 2x)}',
        'a{background:url(one.png);background:-webkit-image-set(url(one.png) 1x,url(two.png) 2x)}'
      ]
    })
  )
  .addBatch(
    optimizerContext('urls custom protocol and url rewriting', {
      'simple': [
        'a{background:url(app://abc.png)}',
        'a{background:url(app://abc.png)}'
      ],
      'complex': [
        'a{background:url(git+ssh2://abc.png)}',
        'a{background:url(git+ssh2://abc.png)}'
      ]
    })
  )
  .addBatch(
    optimizerContext('urls whitespace in compatibility mode', {
      'keeps spaces as they are': [
        '*{background:url(test.png) no-repeat}',
        '*{background:url(test.png) no-repeat}'
      ]
    }, { compatibility: 'ie8' })
  )
  .addBatch(
    optimizerContext('urls whitespace with url rewriting', {
      'strip single parentheses': [
        'a{background:url("/images/blank.png")}',
        'a{background:url(/images/blank.png)}'
      ],
      'strip double parentheses': [
        'a{background:url("/images/blank.png")}',
        'a{background:url(/images/blank.png)}'
      ],
      'keep quoting if whitespace': [
        'a{background:url("/images/blank image.png")}',
        'a{background:url("/images/blank image.png")}'
      ],
      'keep quoting if whitespace inside @font-face': [
        '@font-face{src:url("/Helvetica Neue.eot")}',
        '@font-face{src:url("/Helvetica Neue.eot")}'
      ],
      'keep SVG data URI unchanged': [
        'div{background:url(data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2018%2018%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2214%22%20height%3D%2214%22%2Fsvg%3E)}',
        'div{background:url(data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2018%2018%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2214%22%20height%3D%2214%22%2Fsvg%3E)}'
      ],
      'quotes SVG data URI if with parentheses': [
        'div{background:url(data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2018%2018%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2214%22%20height%3D%2214%22%20transform%3D%22translate(2%202)%22%2F%3E%3C%2Fsvg%3E) bottom left}',
        'div{background:url(\'data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2018%2018%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2214%22%20height%3D%2214%22%20transform%3D%22translate(2%202)%22%2F%3E%3C%2Fsvg%3E\') bottom left}'
      ],
      'quotes SVG data URI trailed with !important': [
        'div{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHOSURBVEhLrZa/SgNBEMZzh0WKCClSCKaIYOED+AAKeQQLG8HWztLCImBrYadgIdY+gIKNYkBFSwu7CAoqCgkkoGBI/E28PdbLZmeDLgzZzcx83/zZ2SSXC1j9fr+I1Hq93g2yxH4iwM1vkoBWAdxCmpzTxfkN2RcyZNaHFIkSo10+8kgxkXIURV5HGxTmFuc75B2RfQkpxHG8aAgaAFa0tAHqYFfQ7Iwe2yhODk8+J4C7yAoRTWI3w/4klGRgR4lO7Rpn9+gvMyWp+uxFh8+H+ARlgN1nJuJuQAYvNkEnwGFck18Er4q3egEc/oO+mhLdKgRyhdNFiacC0rlOCbhNVz4H9FnAYgDBvU3QIioZlJFLJtsoHYRDfiZoUyIxqCtRpVlANq0EU4dApjrtgezPFad5S19Wgjkc0hNVnuF4HjVA6C7QrSIbylB+oZe3aHgBsqlNqKYH48jXyJKMuAbiyVJ8KzaB3eRc0pg9VwQ4niFryI68qiOi3AbjwdsfnAtk0bCjTLJKr6mrD9g8iq/S/B81hguOMlQTnVyG40wAcjnmgsCNESDrjme7wfftP4P7SP4N3CJZdvzoNyGq2c/HWOXJGsvVg+RA/k2MC/wN6I2YA2Pt8GkAAAAASUVORK5CYII=")!important}',
        'div{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHOSURBVEhLrZa/SgNBEMZzh0WKCClSCKaIYOED+AAKeQQLG8HWztLCImBrYadgIdY+gIKNYkBFSwu7CAoqCgkkoGBI/E28PdbLZmeDLgzZzcx83/zZ2SSXC1j9fr+I1Hq93g2yxH4iwM1vkoBWAdxCmpzTxfkN2RcyZNaHFIkSo10+8kgxkXIURV5HGxTmFuc75B2RfQkpxHG8aAgaAFa0tAHqYFfQ7Iwe2yhODk8+J4C7yAoRTWI3w/4klGRgR4lO7Rpn9+gvMyWp+uxFh8+H+ARlgN1nJuJuQAYvNkEnwGFck18Er4q3egEc/oO+mhLdKgRyhdNFiacC0rlOCbhNVz4H9FnAYgDBvU3QIioZlJFLJtsoHYRDfiZoUyIxqCtRpVlANq0EU4dApjrtgezPFad5S19Wgjkc0hNVnuF4HjVA6C7QrSIbylB+oZe3aHgBsqlNqKYH48jXyJKMuAbiyVJ8KzaB3eRc0pg9VwQ4niFryI68qiOi3AbjwdsfnAtk0bCjTLJKr6mrD9g8iq/S/B81hguOMlQTnVyG40wAcjnmgsCNESDrjme7wfftP4P7SP4N3CJZdvzoNyGq2c/HWOXJGsvVg+RA/k2MC/wN6I2YA2Pt8GkAAAAASUVORK5CYII=)!important}'
      ],
      'quotes SVG data URI trailed with !important without quotes': [
        'div{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHOSURBVEhLrZa/SgNBEMZzh0WKCClSCKaIYOED+AAKeQQLG8HWztLCImBrYadgIdY+gIKNYkBFSwu7CAoqCgkkoGBI/E28PdbLZmeDLgzZzcx83/zZ2SSXC1j9fr+I1Hq93g2yxH4iwM1vkoBWAdxCmpzTxfkN2RcyZNaHFIkSo10+8kgxkXIURV5HGxTmFuc75B2RfQkpxHG8aAgaAFa0tAHqYFfQ7Iwe2yhODk8+J4C7yAoRTWI3w/4klGRgR4lO7Rpn9+gvMyWp+uxFh8+H+ARlgN1nJuJuQAYvNkEnwGFck18Er4q3egEc/oO+mhLdKgRyhdNFiacC0rlOCbhNVz4H9FnAYgDBvU3QIioZlJFLJtsoHYRDfiZoUyIxqCtRpVlANq0EU4dApjrtgezPFad5S19Wgjkc0hNVnuF4HjVA6C7QrSIbylB+oZe3aHgBsqlNqKYH48jXyJKMuAbiyVJ8KzaB3eRc0pg9VwQ4niFryI68qiOi3AbjwdsfnAtk0bCjTLJKr6mrD9g8iq/S/B81hguOMlQTnVyG40wAcjnmgsCNESDrjme7wfftP4P7SP4N3CJZdvzoNyGq2c/HWOXJGsvVg+RA/k2MC/wN6I2YA2Pt8GkAAAAASUVORK5CYII=)!important}',
        'div{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHOSURBVEhLrZa/SgNBEMZzh0WKCClSCKaIYOED+AAKeQQLG8HWztLCImBrYadgIdY+gIKNYkBFSwu7CAoqCgkkoGBI/E28PdbLZmeDLgzZzcx83/zZ2SSXC1j9fr+I1Hq93g2yxH4iwM1vkoBWAdxCmpzTxfkN2RcyZNaHFIkSo10+8kgxkXIURV5HGxTmFuc75B2RfQkpxHG8aAgaAFa0tAHqYFfQ7Iwe2yhODk8+J4C7yAoRTWI3w/4klGRgR4lO7Rpn9+gvMyWp+uxFh8+H+ARlgN1nJuJuQAYvNkEnwGFck18Er4q3egEc/oO+mhLdKgRyhdNFiacC0rlOCbhNVz4H9FnAYgDBvU3QIioZlJFLJtsoHYRDfiZoUyIxqCtRpVlANq0EU4dApjrtgezPFad5S19Wgjkc0hNVnuF4HjVA6C7QrSIbylB+oZe3aHgBsqlNqKYH48jXyJKMuAbiyVJ8KzaB3eRc0pg9VwQ4niFryI68qiOi3AbjwdsfnAtk0bCjTLJKr6mrD9g8iq/S/B81hguOMlQTnVyG40wAcjnmgsCNESDrjme7wfftP4P7SP4N3CJZdvzoNyGq2c/HWOXJGsvVg+RA/k2MC/wN6I2YA2Pt8GkAAAAASUVORK5CYII=)!important}'
      ],
      'do not unquote double quoted URI with unescaped single quotes inside': [
        'a{background:url("data:image/svg+xml,%3csvg%20xmlns%3d\'http://www.w3.org/2000/svg\'/%3e")}',
        'a{background:url("data:image/svg+xml,%3csvg%20xmlns%3d\'http://www.w3.org/2000/svg\'/%3e")}'
      ],
      'do not unquote single quoted URI with unescaped double quotes inside': [
        'a{background:url(\'data:image/svg+xml,%3csvg%20xmlns%3d"http://www.w3.org/2000/svg"/%3e\')}',
        'a{background:url(\'data:image/svg+xml,%3csvg%20xmlns%3d"http://www.w3.org/2000/svg"/%3e\')}'
      ]
    })
  )
  .addBatch(
    optimizerContext('urls quotes in compatibility mode', {
      'keeps quotes as they are': [
        'div{background:url("test.png")}',
        'div{background:url("test.png")}'
      ],
      'keeps quotes as they are when minify hash data': [
        {'temp/file.css': {
          styles: 'div{background:url("test.png")}'
        }},
        'div{background:url("temp/test.png")}'
      ],
      'no quotes added when minify hash data': [
        {'temp/file.css': {
          styles: 'div{background:url(test.png)}'
        }},
        'div{background:url(temp/test.png)}'
      ]
    }, { compatibility: { properties: { urlQuotes: true } } })
  )
  .addBatch(
    optimizerContext('urls rewriting - rebaseTo', {
      'no @import': [
        'a{background:url(test/fixtures/partials/extra/down.gif) 0 0 no-repeat}',
        'a{background:url(partials/extra/down.gif) 0 0 no-repeat}'
      ],
      'relative @import': [
        '@import url(test/fixtures/partials-relative/base.css);',
        'a{background:url(partials/extra/down.gif) 0 0 no-repeat}'
      ],
      'relative @import twice': [
        '@import url(test/fixtures/partials-relative/extra/included.css);',
        'a{background:url(partials/extra/down.gif) 0 0 no-repeat}'
      ],
      'absolute @import': [
        '@import url(/test/fixtures/partials-relative/base.css);',
        'a{background:url(partials/extra/down.gif) 0 0 no-repeat}'
      ],
      'document-local reference': [
        'svg{marker-end:url(#arrow)}',
        'svg{marker-end:url(#arrow)}'
      ],
      'chrome extension': [
        'a{background-image:url("chrome-extension://__MSG_@@extension_id__/someFile.png")}',
        'a{background-image:url(chrome-extension://__MSG_@@extension_id__/someFile.png)}'
      ]
    }, { rebaseTo: path.join('test', 'fixtures') })
  )
  .addBatch(
    optimizerContext('urls rewriting - rebaseTo as a missing directory', {
      'url': [
        'a{background:url(test/partials/extra/down.gif) no-repeat}',
        'a{background:url(../partials/extra/down.gif) no-repeat}'
      ],
      'relative @import': [
        '@import url(test/fixtures/partials-relative/base.css);',
        'a{background:url(../fixtures/partials/extra/down.gif) 0 0 no-repeat}'
      ],
      'absolute @import': [
        '@import url(/test/fixtures/partials-relative/base.css);',
        'a{background:url(../fixtures/partials/extra/down.gif) 0 0 no-repeat}'
      ]
    }, { rebaseTo: path.join('test', 'fixtures2') })
  )
  .addBatch(
    optimizerContext('urls rewriting - rebase off', {
      'keeps urls the same': [
        '@import url(test/fixtures/partials-relative/base.css);',
        'a{background:url(../partials/extra/down.gif) 0 0 no-repeat}'
      ]
    }, {
      rebase: false
    })
  )
  .addBatch(
    optimizerContext('fonts', {
      'keep format quotation': [
        '@font-face{font-family:PublicVintage;src:url(/PublicVintage.otf) format("opentype")}',
        '@font-face{font-family:PublicVintage;src:url(/PublicVintage.otf) format("opentype")}'
      ],
      'keep local quotation': [
        '@font-face{font-family:X;src:local("Pacifico") format("opentype")}',
        '@font-face{font-family:X;src:local("Pacifico") format("opentype")}'
      ],
      'remove font family quotation': [
        'a{font-family:"Helvetica",\'Arial\'}',
        'a{font-family:Helvetica,Arial}'
      ],
      'do not remove font family double quotation if space inside': [
        'a{font-family:"Courier New"}',
        'a{font-family:"Courier New"}'
      ],
      'do not remove font quotation if starts with a number': [
        'a{font:\'123font\'}',
        'a{font:\'123font\'}'
      ],
      'do not remove font family quotation if starts with a number': [
        'a{font-family:\'123font\'}',
        'a{font-family:\'123font\'}'
      ],
      'remove font quotation': [
        'a{font:13px/15px "Helvetica",\'Arial\'}',
        'a{font:13px/15px Helvetica,Arial}'
      ],
      'remove font quotation #2': [
        'a{font:13px/15px "Helvetica1_12",\'Arial_1451\'}',
        'a{font:13px/15px Helvetica1_12,Arial_1451}'
      ],
      'remove font quotation #3': [
        'a{font:13px/15px "Helvetica-Regular",\'Arial-Bold\'}',
        'a{font:13px/15px Helvetica-Regular,Arial-Bold}'
      ],
      'do not remove quotation from enclosed JSON (weird, I know)': [
        'p{font-family:\'{ "current" : "large", "all" : ["small", "medium", "large"], "position" : 2 }\'}',
        'p{font-family:\'{ "current" : "large", "all" : ["small", "medium", "large"], "position" : 2 }\'}'
      ]
    })
  )
  .addBatch(
    optimizerContext('IE 8 hacks', {
      'asterisk': [
        'a{*color:#fff}',
        'a{*color:#fff}'
      ],
      'unserscore': [
        'a{_color:#fff}',
        'a{_color:#fff}'
      ],
      'backslash': [
        'a{color:#fff\\9}',
        'a{color:#fff\\9}'
      ],
      'overriding by an asterisk': [
        'a{color:red;display:block;*color:#fff}',
        'a{color:red;display:block;*color:#fff}'
      ],
      'overriding by an underscore': [
        'a{color:red;display:block;_color:#fff}',
        'a{color:red;display:block;_color:#fff}'
      ],
      'overriding by an backslash': [
        'a{color:red;display:block;color:#fff\\9}',
        'a{color:red;display:block;color:#fff\\9}'
      ],
      'overriding an asterisk': [
        'a{*color:red;display:block;*color:#fff}',
        'a{display:block;*color:#fff}'
      ],
      'overriding an underscore': [
        'a{_color:red;display:block;_color:#fff}',
        'a{display:block;_color:#fff}'
      ],
      'overriding a backslash': [
        'a{color:red\\9;display:block;color:#fff\\9}',
        'a{display:block;color:#fff\\9}'
      ],
      'overriding a star by a non-ajacent selector': [
        '.block-1{color:red}.block-2{color:#000}.block-1{*color:#fff}',
        '.block-1{color:red}.block-2{color:#000}.block-1{*color:#fff}'
      ],
      'overriding an underscore by a non-ajacent selector': [
        '.block-1{color:red}.block-2{color:#000}.block-1{_color:#fff}',
        '.block-1{color:red}.block-2{color:#000}.block-1{_color:#fff}'
      ],
      'overriding a backslash by a non-ajacent selector': [
        '.block-1{color:red}.block-2{color:#fff}.block-1{color:#fff\\9}',
        '.block-1{color:red}.block-2{color:#fff}.block-1{color:#fff\\9}'
      ],
      'preserving backslash in overriddable': [
        'a{border:1px solid #ccc\\9}',
        'a{border:1px solid #ccc\\9}'
      ],
      'keeps rgba(0,0,0,0)': [
        'a{color:rgba(0,0,0,0)}',
        'a{color:rgba(0,0,0,0)}'
      ],
      'keeps rgba(255,255,255,0)': [
        'a{color:rgba(255,255,255,0)}',
        'a{color:rgba(255,255,255,0)}'
      ],
      'keeps hsla(120,100%,50%,0)': [
        'a{color:hsla(120,100%,50%,0)}',
        'a{color:hsla(120,100%,50%,0)}'
      ]
    }, { compatibility: 'ie8', level: 2 })
  )
  .addBatch(
    optimizerContext('IE 7 hacks', {
      'keeps !ie hack': [
        'a{list-style-type:none;list-style-type:decimal !ie}',
        'a{list-style-type:none;list-style-type:decimal !ie}'
      ]
    }, { compatibility: 'ie7' })
  )
  .addBatch(
    optimizerContext('IE hacks without IE compatibility', {
      'star': [
        'a{*color:#fff}',
        ''
      ],
      'unserscore': [
        'a{_color:#fff}',
        ''
      ],
      'two in a row': [
        'a{padding:0;*height:13px;*width:13px}',
        'a{padding:0}'
      ],
      'two in a row mixed': [
        'a{padding:0;*height:13px;_width:13px}',
        'a{padding:0}'
      ],
      'backslash': [
        'a{color:#fff\\9}',
        ''
      ]
    })
  )
  .addBatch(
    optimizerContext('animations', {
      'shorten': [
        '@keyframes test\n{ from\n { width:90px; }\n to { width:200px; }\n}',
        '@keyframes test{from{width:90px}to{width:200px}}'
      ],
      'remove name quotes': [
        '@keyframes "test1"{a{display:block}}@keyframes \'test2\'{a{display:block}}',
        '@keyframes test1{a{display:block}}@keyframes test2{a{display:block}}'
      ],
      'not remove name quotes if whitespace inside': [
        '@keyframes "test 1"{a{display:block}}@keyframes \'test 2\'{a{display:block}}',
        '@keyframes "test 1"{a{display:block}}@keyframes \'test 2\'{a{display:block}}'
      ],
      'remove name quotes for vendor prefixes': [
        '@-moz-keyframes \'test\'{a{display:block}}@-o-keyframes \'test\'{a{display:block}}@-webkit-keyframes \'test\'{a{display:block}}',
        '@-moz-keyframes test{a{display:block}}@-o-keyframes test{a{display:block}}@-webkit-keyframes test{a{display:block}}'
      ],
      'remove quotes in animation': [
        'div{animation:\'test\' 2s ease-in .5s 3}',
        'div{animation:test 2s ease-in .5s 3}'
      ],
      'not remove quotes in animation when name with space inside': [
        'div{animation:\'test 1\' 2s ease-in .5s 3}',
        'div{animation:\'test 1\' 2s ease-in .5s 3}'
      ],
      'remove quotes in vendor prefixed animation': [
        'div{-moz-animation:\'test\' 2s ease-in;-o-animation:\'test\' 2s ease-in;-webkit-animation:\'test\' 2s ease-in}',
        'div{-moz-animation:test 2s ease-in;-o-animation:test 2s ease-in;-webkit-animation:test 2s ease-in}'
      ],
      'remove quotes in animation-name': [
        'div{animation-name:\'test\'}',
        'div{animation-name:test}'
      ],
      'not remove quotes in animation-name when name with space inside': [
        'div{animation-name:\'test 1\'}',
        'div{animation-name:\'test 1\'}'
      ],
      'remove quotes in vendor prefixed animation-name': [
        'div{-moz-animation-name:\'test\';-o-animation-name:\'test\';-webkit-animation-name:\'test\'}',
        'div{-moz-animation-name:test;-o-animation-name:test;-webkit-animation-name:test}'
      ]
    })
  )
  .addBatch(
    optimizerContext('attributes', {
      'should keep selector if no value': [
        'div[data-type]{border-color:red}',
        'div[data-type]{border-color:red}'
      ],
      'should keep selector if no quotation': [
        'div[data-type=something]{border-color:red}',
        'div[data-type=something]{border-color:red}'
      ],
      'should keep selector if equals in value': [
        'div[data-type="stupid=value"]{border-color:red}',
        'div[data-type="stupid=value"]{border-color:red}'
      ],
      'should keep quotation if whitespace inside': [
        'div[data-type^=\'object 1\']{border-color:red}',
        'div[data-type^=\'object 1\']{border-color:red}'
      ],
      'should keep quotations if special characters inside': [
        'a[data-type="object+1"]{color:red}p[data-target="#some-place"]{color:#0f0}',
        'a[data-type="object+1"]{color:red}p[data-target="#some-place"]{color:#0f0}'
      ],
      'should keep quotation if is a number': [
        'div[data-number=\'1\']{border-color:red}',
        'div[data-number=\'1\']{border-color:red}'
      ],
      'should keep quotation if starts with a number': [
        'div[data-type^=\'1something\']{border-color:red}',
        'div[data-type^=\'1something\']{border-color:red}'
      ],
      'should keep quotation if starts with a hyphen': [
        'div[data-type$=\'-something\']{border-color:red}',
        'div[data-type$=\'-something\']{border-color:red}'
      ],
      'should keep quotation if key only (which is invalid)': [
        'div["data-type"]{color:red}',
        'div["data-type"]{color:red}'
      ],
      'should strip quotation if is a word': [
        'a[data-href=\'object\']{border-color:red}',
        'a[data-href=object]{border-color:red}'
      ],
      'should strip quotation if is a hyphen separated words': [
        'a[data-href=\'object-1-two\']{border-color:red}',
        'a[data-href=object-1-two]{border-color:red}'
      ],
      'should strip quotations if is less specific selectors': [
        'a[data-href*=\'object1\']{border-color:red}a[data-href|=\'object2\']{border-color:#0f0}',
        'a[data-href*=object1]{border-color:red}a[data-href|=object2]{border-color:#0f0}'
      ],
      'should keep special characters inside attributes #1': [
        'a[data-css=\'color:white\']{display:block}',
        'a[data-css=\'color:white\']{display:block}'
      ],
      'should keep special characters inside attributes #2': [
        'a[href="/version-0.01.html"]{display:block}',
        'a[href="/version-0.01.html"]{display:block}'
      ],
      'should strip escaped new lines inside attributes': [
        '.test[title="my very long \\' + lineBreak + 'title"]{display:block}',
        '.test[title="my very long title"]{display:block}'
      ],
      'should strip escaped new lines inside attributes which can be unquoted': [
        '.test[title="my_very_long_\\' + lineBreak + 'title"]{display:block}',
        '.test[title=my_very_long_title]{display:block}'
      ],
      'should strip whitespace between square brackets': [
        'body[  data-title ]{color:red}',
        'body[data-title]{color:red}'
      ],
      'should strip whitespace inside square brackets': [
        'body[  data-title  = x ]{color:red}',
        'body[data-title=x]{color:red}'
      ]
    })
  )
  .addBatch(
    optimizerContext('ie filters', {
      'short alpha': [
        // 'a{ filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=80); -ms-filter:'progid:DXImageTransform.Microsoft.Alpha(Opacity=50)';}',
        'a{ filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=80)}',
        'a{filter:alpha(Opacity=80)}'
      ],
      'short chroma': [
        'a{filter:progid:DXImageTransform.Microsoft.Chroma(color=#919191)}',
        'a{filter:chroma(color=#919191)}'
      ],
      'matrix filter spaces': [
        'a{filter:progid:DXImageTransform.Microsoft.Matrix(M11=0.984, M22=0.984, M12=0.17, M21=-0.17, SizingMethod=\'auto expand\')}',
        'a{filter:progid:DXImageTransform.Microsoft.Matrix(M11=.984, M22=.984, M12=.17, M21=-.17, SizingMethod=\'auto expand\')}'
      ],
      'multiple filters (IE7 issue)': [
        'a{filter:progid:DXImageTransform.Microsoft.Chroma(color=#919191) progid:DXImageTransform.Microsoft.Matrix(M11=0.984, M22=0.984, M12=0.17, M21=-0.17, SizingMethod=\'auto expand\')}',
        'a{filter:progid:DXImageTransform.Microsoft.Chroma(color=#919191) progid:DXImageTransform.Microsoft.Matrix(M11=.984, M22=.984, M12=.17, M21=-.17, SizingMethod=\'auto expand\')}'
      ],
      'AlphaImageLoader': [
        'div{filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=images/skyline.jpg)}',
        'div{filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=images/skyline.jpg)}'
      ],
      'colors #1': [
        'a{filter:chroma(color=#ffffff)}',
        'a{filter:chroma(color=#ffffff)}'
      ],
      'colors #2': [
        'a{filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#cccccc\', endColorstr=\'#000000\')}',
        'a{filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#cccccc\', endColorstr=\'#000000\')}'
      ],
      'colors #3': [
        'a{filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#DDDDDD\', endColorstr=\'#333333\')}',
        'a{filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#DDDDDD\', endColorstr=\'#333333\')}'
      ],
      'whitespace': [
        'a{ filter: chroma(color = "#ff0000")}',
        'a{filter:chroma(color="#ff0000")}'
      ]
    }, { compatibility: 'ie9' })
  )
  .addBatch(
    optimizerContext('charsets', {
      'not at beginning': [
        'a{ color: #f10; }@charset \'utf-8\';b { font-weight: bolder}',
        '@charset \'utf-8\';a{color:#f10}b{font-weight:bolder}'
      ],
      'multiple charsets': [
        '@charset \'utf-8\';div :before { display: block }@charset \'utf-8\';a { color: #f10 }',
        '@charset \'utf-8\';div :before{display:block}a{color:#f10}'
      ],
      'charset and space after': [
        '@charset \'utf-8\';' + lineBreak + lineBreak + 'a{display:block}',
        '@charset \'utf-8\';a{display:block}'
      ]
    })
  )
  .addBatch(
    optimizerContext('important', {
      'space before': [
        'body{background-color:#fff  !important}',
        'body{background-color:#fff!important}'
      ],
      'space between ! and important': [
        'body{background-color:#fff  ! important}',
        'body{background-color:#fff!important}'
      ],
      'Capital letters': [
        'a{color: red !ImporTant }',
        'a{color:red!important}'
      ],
      'Match word': [
        'a{color: red !importante }',
        ''
      ]
    })
  )
  .addBatch(
    optimizerContext('empty elements', {
      'single': [
        ' div p {  \n}',
        ''
      ],
      'between non-empty': [
        'div {color:#fff}  a{  } p{  line-height:1.35em}',
        'div{color:#fff}p{line-height:1.35em}'
      ],
      'just a semicolon': [
        'div { ; }',
        ''
      ],
      'inside @media': [
        '@media screen { .test {} } .test1 { color: green; }',
        '.test1{color:green}'
      ],
      'inside nested @media': [
        '@media screen { @media (orientation:landscape) { @media (max-width:999px) { .test {} } } }',
        ''
      ],
      'inside not empty @media': [
        '@media screen { .test {} .some { display:none } }',
        '@media screen{.some{display:none}}'
      ],
      'inside nested not empty @media': [
        '@media screen { @media (orientation:landscape) { @media (max-width:999px) { .test {} } a {color:red} } }',
        '@media screen{@media (orientation:landscape){a{color:red}}}'
      ]
    })
  )
  .addBatch(
    optimizerContext('empty @media', {
      'simple': [
        '@media print{}',
        ''
      ],
      'simple with and': [
        '@media print and screen{}',
        ''
      ],
      'complex': [
        '@media print, (-o-min-device-pixel-ratio: 5/4), (-webkit-min-device-pixel-ratio: 1.25), (min-resolution: 120dpi) {\n}',
        ''
      ]
    })
  )
  .addBatch(
    optimizerContext('@import', {
      'empty': [
        '@import url();',
        ''
      ],
      'of an unknown file': [
        '@import url(\'fake.css\');',
        ''
      ],
      'of an unknown file with a missing trailing semicolon': [
        '@import url(fake.css)',
        ''
      ],
      'of a directory': [
        '@import url(test/fixtures/partials);',
        ''
      ],
      'of a real file': [
        '@import url(test/fixtures/partials/one.css);',
        '.one{color:red}'
      ],
      'of a real file twice': [
        '@import url(test/fixtures/partials/one.css);@import url(test/fixtures/partials/one.css);',
        '.one{color:red}'
      ],
      'of a real file with current path prefix': [
        '@import url(./test/fixtures/partials/one.css);',
        '.one{color:red}'
      ],
      'of a real file with quoted path': [
        '@import url(\'test/fixtures/partials/one.css\');',
        '.one{color:red}'
      ],
      'of a real file with double-quoted path': [
        '@import url("test/fixtures/partials/one.css");',
        '.one{color:red}'
      ],
      'of a real file with bare path': [
        '@import test/fixtures/partials/one.css;',
        '.one{color:red}'
      ],
      'of a real file with bare quoted path': [
        '@import "test/fixtures/partials/one.css";',
        '.one{color:red}'
      ],
      'of a real file with bare double-quoted path': [
        '@import "test/fixtures/partials/one.css";',
        '.one{color:red}'
      ],
      'of a real file with single simple media': [
        '@import url(test/fixtures/partials/one.css) screen;',
        '@media screen{.one{color:red}}'
      ],
      'of a real file with multiple simple media': [
        '@import "test/fixtures/partials/one.css" screen, tv, print;',
        '@media screen,tv,print{.one{color:red}}'
      ],
      'of a real file with complex media': [
        '@import \'test/fixtures/partials/one.css\' screen and (orientation:landscape);',
        '@media screen and (orientation:landscape){.one{color:red}}'
      ],
      'of a real file with a missing trailing semicolon': [
        '@import url(test/fixtures/partials/one.css)',
        ''
      ],
      'of a real files with a missing trailing semicolon': [
        '@import url(test/fixtures/partials/one.css)@import url(test/fixtures/partials/two.css)',
        ''
      ],
      'of more files': [
        '@import url(test/fixtures/partials/one.css);\n\n@import url(test/fixtures/partials/extra/three.css);\n\na{display:block}',
        '.one{color:red}.three{color:#0f0}a{display:block}'
      ],
      'of more files with media': [
        '@import url(test/fixtures/partials/one.css) screen;@import url(test/fixtures/partials/extra/three.css) tv;',
        '@media screen{.one{color:red}}@media tv{.three{color:#0f0}}'
      ],
      'of multi-level, circular dependency file': [
        '@import url(test/fixtures/partials/two.css);',
        '.one{color:red}.three{color:#0f0}.four{color:#00f}.two{color:#fff}'
      ],
      'of a file with a relative resource path': [
        '@import url(test/fixtures/partials/three.css);',
        '.three{background-image:url(test/fixtures/partials/extra/down.gif)}'
      ],
      'of a file with an absolute resource path': [
        '@import url(test/fixtures/partials/four.css);',
        '.four{background-image:url(/partials/extra/down.gif)}'
      ],
      'of a file with a resource URI': [
        '@import url(test/fixtures/partials/five.css);',
        '.five{background:url(data:image/jpeg;base64,/9j/)}'
      ],
      'cut off': [
        '@impo',
        ''
      ],
      'cut off inside a comment': [
        '/* @impo',
        ''
      ],
      'inside a comment': [
        '/* @import url(test/fixtures/partials/five.css); */a { color: red; }',
        'a{color:red}'
      ],
      'after a comment': [
        '/* @import url(test/fixtures/partials/one.css); */@import url(test/fixtures/partials/one.css);a { color: red; }',
        '.one{color:red}a{color:red}'
      ],
      'used arbitrarily in comment': [
        '/* @import foo */a { color: red; }',
        'a{color:red}'
      ],
      'used arbitrarily in comment multiple times': [
        '/* @import foo */a { color: red; }\n/* @import bar */p { color: #fff; }',
        'a{color:red}p{color:#fff}'
      ],
      'used arbitrarily in comment including unrelated comment': [
        '/* foo */a { color: red; }/* bar *//* @import */',
        'a{color:red}'
      ],
      'of a file with a comment': [
        '@import url(test/fixtures/partials/comment.css);',
        'a{display:block}'
      ],
      'of a file with media having a comment': [
        '@import url(test/fixtures/partials/comment.css) screen and (device-height: 600px);',
        '@media screen and (device-height:600px){a{display:block}}'
      ],
      'after standard content': [
        'a{display:block}@import url(test/fixtures/partials/one.css);body{margin:0}',
        'a{display:block}body{margin:0}'
      ],
      'with content between': [
        '@import url(test/fixtures/partials/one.css);@import url(test/fixtures/partials/extra/three.css);@import url(test/fixtures/partials/extra/four.css);.two { color:#fff; }@import url(test/fixtures/partials/extra/sub.css);.base { margin:0px }',
        '.one{color:red}.three{color:#0f0}.two{color:#fff}.four{color:#00f}.two{color:#fff}.base{margin:0}'
      ],
      'after quoted content': [
        '/*a{display:block}*/@import url(test/fixtures/partials/one.css);',
        '.one{color:red}'
      ],
      'with double underscore': [
        '@import url(test/fixtures/partials/with__double_underscore.css);',
        '.one{color:green}'
      ],
      'remote inside local': [
        '@import url(test/fixtures/partials/remote.css);',
        '@import url(http://jakubpawlowicz.com/styles.css);'
      ],
      'remote inside local after content': [
        'a{color:red}@import url(test/fixtures/partials/remote.css);',
        'a{color:red}'
      ],
      'remote inside local after imported content': [
        '@import url(test/fixtures/partials/one.css);@import url(test/fixtures/partials/remote.css);',
        '.one{color:red}'
      ],
      'scanning comments and stack too deep exception': [
        generateComments(30000) + '@import url(fonts.google.com/some.css);',
        ''
      ]
    })
  )
  .addBatch(
    optimizerContext('malformed but still valid @import', {
      'prefixed with whitespace': [
        '    @import \'test/fixtures/partials/one.css\';',
        '.one{color:red}'
      ],
      'no whitespace between @import and filename': [
        '@import\'test/fixtures/partials/one.css\';',
        '.one{color:red}'
      ],
      'extra whitespace between @import and filename': [
        '@import   \'test/fixtures/partials/one.css\';',
        '.one{color:red}'
      ],
      'line break between @import and filename': [
        '@import ' + lineBreak + '\'test/fixtures/partials/one.css\';',
        '.one{color:red}'
      ],
      'extra whitespace prefix in file name': [
        '@import \'  test/fixtures/partials/one.css\';',
        '.one{color:red}'
      ],
      'extra whitespace suffix in file name': [
        '@import \'test/fixtures/partials/one.css   \';',
        '.one{color:red}'
      ],
      'extra whitespace after': [
        '@import \'test/fixtures/partials/one.css\'   ;',
        '.one{color:red}'
      ],
      'uppercase @import': [
        '@IMPORT \'test/fixtures/partials/one.css\';',
        '.one{color:red}'
      ],
      'extra whitespace between url and filename': [
        '@import url(  test/fixtures/partials/one.css);',
        '.one{color:red}'
      ],
      'extra whitespace prefix in file name - url': [
        '@import url(\'   test/fixtures/partials/one.css\');',
        '.one{color:red}'
      ],
      'extra whitespace suffix in file name - url': [
        '@import url(\'test/fixtures/partials/one.css   \');',
        '.one{color:red}'
      ]
    })
  )
  .addBatch(
    optimizerContext('@import with absolute paths', {
      'of an unknown file': [
        '@import url(/fake.css);',
        ''
      ],
      'of a real file': [
        '@import url(/test/fixtures/partials/one.css);',
        '.one{color:red}'
      ],
      'of a real file with quoted paths': [
        '@import url("/test/fixtures/partials/one.css");',
        '.one{color:red}'
      ],
      'of two files with mixed paths': [
        '@import url(/test/fixtures/partials/one.css);@import url(/test/fixtures/partials/extra/three.css);a{display:block}',
        '.one{color:red}.three{color:#0f0}a{display:block}'
      ],
      'of a multi-level, circular dependency file': [
        '@import url(/test/fixtures/partials/two.css);',
        '.one{color:red}.three{color:#0f0}.four{color:#00f}.two{color:#fff}'
      ],
      'of a multi-level, circular dependency file with mixed paths': [
        '@import url(/test/fixtures/partials-absolute/base.css);',
        '.base2{border-width:0}.sub{padding:0}.base{margin:0}'
      ]
    })
  )
  .addBatch(
    optimizerContext('@import with inline option', {
      'of an unknown file': [
        '@import url(/fake.css);',
        '@import url(/fake.css);'
      ],
      'of an unknown file with extra whitespace': [
        '@import url(  /fake.css );',
        '@import url(/fake.css);'
      ],
      'of comment chars within import url': [
        '@import \'necolas/normalize.css@*/normalize.css\';',
        '@import url(necolas/normalize.css@*/normalize.css);'
      ]
    }, { inline: 'none' })
  )
  .addBatch(
    optimizerContext('@import with no import and no level 2', {
      'empty body': [
        '@import url(//fonts.googleapis.com/css?family=Domine:700);body{/* comment */}body h1{font-family:Domine}',
        '@import url(//fonts.googleapis.com/css?family=Domine:700);body h1{font-family:Domine}'
      ],
      'no empty body': [
        '@import url(//fonts.googleapis.com/css?family=Domine:700);body{color:red}body h1{font-family:Domine}',
        '@import url(//fonts.googleapis.com/css?family=Domine:700);body{color:red}body h1{font-family:Domine}'
      ]
    }, { inline: 'none', level: 1 })
  )
  .addBatch(
    optimizerContext('@import with no url', {
      'matching too much': [
        '@import url(test.css);@font-face{font-family:"icomoon"}',
        '@import url(test.css);@font-face{font-family:icomoon}'
      ]
    }, { inline: 'none' })
  )
  .addBatch(
    optimizerContext('@apply', {
      'single @apply': [
        'a{@apply(--rule);}',
        'a{@apply(--rule);}'
      ],
      'multiple @apply': [
        'a{@apply(--rule1);@apply(--rule2);}',
        'a{@apply(--rule1);@apply(--rule2);}'
      ],
      'multiple @apply with some styling': [
        'a{@apply(--rule1);@apply(--rule2);color:red;display:block}',
        'a{@apply(--rule1);@apply(--rule2);color:red;display:block}'
      ],
      'multiple @apply with whitespace': [
        'a{' + lineBreak + '@apply(--rule1);' + lineBreak + '  @apply(--rule2);' + lineBreak + 'color:red;display:block}',
        'a{@apply(--rule1);@apply(--rule2);color:red;display:block}'
      ],
      '@apply another rule within :root context': [
        ':root{--layout:{display:flex};--layout-horizontal:{@apply(--layout);};}',
        ':root{--layout:{display:flex};--layout-horizontal:{@apply(--layout);};}'
      ]
    })
  )
  .addBatch(
    optimizerContext('duplicate selectors with disabled level 2 processing', {
      'of a duplicate selector': [
        'a,a{color:red}',
        'a{color:red}'
      ]
    }, { level: 1 })
  )
  .addBatch(
    optimizerContext('line breaks with disabled level 2 processing', {
      'should be applied': [
        'a{color:red}p{display:block}',
        'a{color:red}' + lineBreak + 'p{display:block}'
      ]
    }, { format: 'keep-breaks', level: 1 })
  )
  .addBatch(
    optimizerContext('invalid data tokenization', {
      'extra top-level closing brace': [
        'a{color:red}}p{width:auto}',
        'a{color:red}'
      ],
      'extra top-level closing braces': [
        'a{color:red}}}}p{width:auto}',
        'a{color:red}'
      ],
      'SASS content': [
        '.one{color:red;&:hover{color:#000}}',
        '.one{color:red}'
      ]
    })
  )
  .addBatch(
    optimizerContext('duplicate selectors in a list', {
      'of a duplicate selector': [
        'a,a{color:red}',
        'a{color:red}'
      ],
      'of an unordered multiply repeated selector': [
        'a,b,p,a{color:red}',
        'a,b,p{color:red}'
      ],
      'of an unordered multiply repeated selector within a block': [
        '@media screen{a,b,p,a{color:red}}',
        '@media screen{a,b,p{color:red}}'
      ],
      'of an unordered multiply repeated complex selector within a block #1': [
        '@media screen{.link[data-path],a,p,.link[data-path]{color:red}}',
        '@media screen{.link[data-path],a,p{color:red}}'
      ],
      'of an unordered multiply repeated complex selector within a block #2': [
        '@media screen{#foo[data-path^="bar bar"],a,p,#foo[data-path^="bar bar"]{color:red}}',
        '@media screen{#foo[data-path^="bar bar"],a,p{color:red}}'
      ]
    })
  )
  .addBatch(
    optimizerContext('rerun optimizers', {
      'selectors reducible once': [
        '.one{color:red;margin:0}.two{color:red}.one{margin:0}',
        '.one,.two{color:red}.one{margin:0}'
      ]
    }, { level: { 2: { restructureRules: true } } })
  )
  .addBatch(
    optimizerContext('units - IE8 compatibility', {
      'rems': [
        'div{padding-top:15px;color:red;padding-top:1rem}',
        'div{padding-top:15px;color:red;padding-top:1rem}'
      ]
    }, { compatibility: 'ie8' })
  )
  .addBatch(
    optimizerContext('redefined more granular properties with property merging', {
      'should merge background with background-attachment': [
        'a{background:0;background-attachment:fixed}',
        'a{background:0 fixed}'
      ],
      'should NOT merge background with inherited background-attachment': [
        'a{background:0;background-attachment:inherit}',
        'a{background:0;background-attachment:inherit}'
      ],
      'should merge background with background-color': [
        'a{background:0;background-color:#9fce00}',
        'a{background:0 #9fce00}'
      ],
      'should NOT merge background with inherited background-color': [
        'a{background:0;background-color:inherit}',
        'a{background:0;background-color:inherit}'
      ],
      'should NOT merge background with background-color set to none': [
        'a{background:url(logo.png) center no-repeat;background-color:none}',
        'a{background:url(logo.png) center no-repeat;background-color:none}'
      ],
      'should merge background with background-image': [
        'a{background:0;background-image:url(hello_world)}',
        'a{background:url(hello_world) 0}'
      ],
      'should NOT merge background with inherited background-image': [
        'a{background:0;background-image:inherit}',
        'a{background:0;background-image:inherit}'
      ],
      'should merge background with background-position': [
        'a{background:0;background-position:3px 4px}',
        'a{background:3px 4px}'
      ],
      'should NOT merge background with inherited background-position': [
        'a{background:0;background-position:inherit}',
        'a{background:0;background-position:inherit}'
      ],
      'should merge background with background-repeat': [
        'a{background:0;background-repeat:repeat-y}',
        'a{background:0 repeat-y}'
      ],
      'should NOT merge background with inherited background-repeat': [
        'a{background:0;background-repeat:inherit}',
        'a{background:0;background-repeat:inherit}'
      ],
      'should merge outline with outline-color': [
        'a{outline:1px;outline-color:#9fce00}',
        'a{outline:#9fce00 1px}'
      ],
      'should NOT merge outline with inherited outline-color': [
        'a{outline:0;outline-color:inherit}',
        'a{outline:0;outline-color:inherit}'
      ],
      'should merge outline with outline-style': [
        'a{outline:0;outline-style:dashed}',
        'a{outline:dashed 0}'
      ],
      'should NOT merge outline with inherited outline-style': [
        'a{outline:0;outline-style:inherit}',
        'a{outline:0;outline-style:inherit}'
      ],
      'should merge outline with outline-width': [
        'a{outline:0;outline-width:5px}',
        'a{outline:5px}'
      ],
      'should NOT merge outline with inherited outline-width': [
        'a{outline:0;outline-width:inherit}',
        'a{outline:0;outline-width:inherit}'
      ],
      'should merge list-style with list-style-type': [
        'li{list-style-type:disc;list-style:inside}',
        'li{list-style:inside}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('merging of rules', {
      'rules without pseudo classes should be merged': [
        'a{color:red}b{color:red}',
        'a,b{color:red}'
      ],
      'rules with well-supported pseudo classes should be merged #1': [
        'a:focus{color:red}b{color:red}',
        'a:focus,b{color:red}'
      ],
      'rules with well-supported pseudo classes should be merged #2': [
        'a:nth-of-type(1){color:red}b{color:red}',
        'a:nth-of-type(1),b{color:red}'
      ],
      'rules with well-supported pseudo classes should be merged #3': [
        'a:first-of-type{color:red}b{color:red}',
        'a:first-of-type,b{color:red}'
      ],
      'rules with well-supported pseudo classes should be merged #4': [
        'a:first-child{color:red}b{color:red}',
        'a:first-child,b{color:red}'
      ],
      'rules with prefixed pseudo classes should not be merged #1': [
        'a:-moz-full-screen{color:red}b{color:red}',
        'a:-moz-full-screen{color:red}b{color:red}'
      ],
      'rules with prefixed pseudo classes should not be merged #2': [
        'a:-moz-dir(rtl){color:red}b{color:red}',
        'a:-moz-dir(rtl){color:red}b{color:red}'
      ],
      'rules with not-so-well-supported pseudo classes should not be merged #1': [
        'a:fullscreen{color:red}b{color:red}',
        'a:fullscreen{color:red}b{color:red}'
      ],
      'rules with not-so-well-supported pseudo classes should not be merged #2': [
        'a:dir(ltr){color:red}b{color:red}',
        'a:dir(ltr){color:red}b{color:red}'
      ],
      'rules with not-so-well-supported pseudo classes should not be merged #3': [
        'a:right{color:red}b{color:red}',
        'a:right{color:red}b{color:red}'
      ],
      'rules with not-so-well-supported pseudo classes should not be merged #4': [
        'a:first{color:red}b{color:red}',
        'a:first{color:red}b{color:red}'
      ],
      'rules with not-so-well-supported pseudo classes should not be merged #5': [
        ':placeholder{color:red}b{color:red}',
        ':placeholder{color:red}b{color:red}'
      ],
      'rules with not-so-well-supported pseudo classes should not be merged #6': [
        ':selection{color:red}b{color:red}',
        ':selection{color:red}b{color:red}'
      ],
      'rules with :host Polymer pseudo class should not be merged into': [
        ':host{color:red}b{color:red}',
        ':host{color:red}b{color:red}'
      ],
      'rules with ::content Polymer pseudo element should not be merged into': [
        '.wrapper ::content a{color:red}b{color:red}',
        '.wrapper ::content a{color:red}b{color:red}'
      ],
      'rules with /deep/ Polymer combinator not be merged into': [
        '.wrapper /deep/ a{color:red}b{color:red}',
        '.wrapper /deep/ a{color:red}b{color:red}'
      ],
      'rules with ::shadow Polymer combinator not be merged into': [
        '.wrapper ::shadow a{color:red}b{color:red}',
        '.wrapper ::shadow a{color:red}b{color:red}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('grouping with level 2 optimizations', {
      '@-moz-document': [
        '@-moz-document domain(mozilla.org){a{color:red}}',
        '@-moz-document domain(mozilla.org){a{color:red}}'
      ],
      '@media': [
        '@media{a{color:red}}',
        '@media{a{color:red}}'
      ],
      '@page': [
        '@page{margin:.5em}',
        '@page{margin:.5em}'
      ],
      '@page named': [
        '@page :first{margin:.5em}',
        '@page :first{margin:.5em}'
      ],
      '@page named with page-margin box': [
        '@page :first{margin:10px;@top-center{content:"Page One"}padding:5px}',
        '@page :first{margin:10px;@top-center{content:"Page One"}padding:5px}'
      ],
      '@supports': [
        '@supports (display:flexbox){.flex{display:flexbox}}',
        '@supports (display:flexbox){.flex{display:flexbox}}'
      ],
      '@-ms-viewport': [
        '@-ms-viewport{width:device-width}',
        '@-ms-viewport{width:device-width}'
      ],
      '@-o-viewport': [
        '@-o-viewport{width:device-width}',
        '@-o-viewport{width:device-width}'
      ],
      '@viewport': [
        '@viewport{width:device-width}',
        '@viewport{width:device-width}'
      ],
      '@counter-style': [
        '@counter-style triangle{system:cyclic;symbols:‣;suffix:" "}',
        '@counter-style triangle{system:cyclic;symbols:‣;suffix:" "}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('background size', {
      'with background-position': [
        'a{background:url(top.jpg) 50% 0/auto 25% no-repeat}',
        'a{background:url(top.jpg) 50% 0/auto 25% no-repeat}'
      ],
      'with background-position and spaces': [
        'a{background:url(top.jpg) 50% 0 / auto 25% no-repeat}',
        'a{background:url(top.jpg) 50% 0/auto 25% no-repeat}'
      ],
      'with background-position shorthands': [
        'a{background:url(top.jpg) 50px/25% no-repeat}',
        'a{background:url(top.jpg) 50px/25% no-repeat}'
      ],
      'with background-position shorthands and spaces': [
        'a{background:url(top.jpg) 0 / cover no-repeat}',
        'a{background:url(top.jpg) 0/cover no-repeat}'
      ],
      'with background-size property': [
        'a{background:none;background-image:url(1.png);background-size:28px 28px}',
        'a{background:url(1.png) 0 0/28px 28px}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('background position', {
      'calc as a value': [
        '*{background:white calc(100% - 10px) center no-repeat;background-image:url(test.png)}',
        '*{background:calc(100% - 10px) center no-repeat #fff;background-image:url(test.png)}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('background-clip', {
      'inside background shorthand': [
        'div{background:content-box #000}',
        'div{background:content-box #000}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('background size with +properties.backgroundSizeMerging', {
      'with background-size property': [
        'a{background:none;background-image:url(1.png);background-size:28px 28px}',
        'a{background:url(1.png) 0 0/28px 28px}'
      ],
      'important overriding': [
        'a{background:url(a.jpg) !important; background-color:#fff !important; background-size:10px 10px !important}',
        'a{background:url(a.jpg) 0 0/10px 10px #fff!important}'
      ]
    }, { level: 2, compatibility: '+properties.backgroundSizeMerging' })
  )
  .addBatch(
    optimizerContext('multiple backgrounds', {
      'should not produce longer values': [
        'p{background:no-repeat;background-position:100% 0,0 100%,100% 100%,50% 50%}',
        'p{background:no-repeat;background-position:100% 0,0 100%,100% 100%,50% 50%}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('misc level 2', {
      'outline auto': [
        'a{outline:5px auto -webkit-focus-ring-color}',
        'a{outline:-webkit-focus-ring-color auto 5px}'
      ],
      'border radius side H+V': [
        'a{border-top-left-radius:2em / 1em}',
        'a{border-top-left-radius:2em/1em}'
      ],
      'border radius expanded H+V': [
        'a{border-radius:1em 1em 1em 1em / 2em 2em 2em 2em}',
        'a{border-radius:1em/2em}'
      ],
      'border radius expanded H+V with mixed values #1': [
        'a{border-radius:1em 2em 1em 2em / 1em 2em 3em 2em}',
        'a{border-radius:1em 2em/1em 2em 3em}'
      ],
      'border radius expanded H+V with mixed values #2': [
        'a{border-radius:1em/1em 1em 1em 2em}',
        'a{border-radius:1em/1em 1em 1em 2em}'
      ],
      'border radius H+V': [
        'a{border-radius:50%/100%}',
        'a{border-radius:50%/100%}'
      ],
      'lost background position': [
        '.one{background:50% no-repeat}.one{background-image:url(/img.png)}',
        '.one{background:url(/img.png) 50% no-repeat}'
      ],
      'unknown @ rule': [
        '@unknown "test";h1{color:red}',
        '@unknown "test";h1{color:red}'
      ],
      'property without a value': [
        'a{color:}',
        ''
      ],
      'properties without values': [
        'a{padding:;border-radius: ;background:red}',
        'a{background:red}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('level 2 in ie8 mode', {
      'plain component to complex shorthand': [
        'a{background:linear-gradient(to bottom,#000,#fff 4em) #000;background-color:#fff}',
        'a{background:linear-gradient(to bottom,#000,#fff 4em) #000;background-color:#fff}'
      ],
      'plain component to shorthand': [
        'a{background:url(bg.png) #000;background-color:#fff}',
        'a{background:url(bg.png) #fff}'
      ],
      'merging rgba with standard colors': [
        'div{background-color:red;background:rgba(1,2,3,.5)}',
        'div{background-color:red;background:rgba(1,2,3,.5)}'
      ]
    }, { compatibility: 'ie8', level: 2 })
  )
  .addBatch(
    optimizerContext('viewport units', {
      'shorthand margin with viewport width not changed': [
        'div{margin:5vw}',
        'div{margin:5vw}'
      ]
    })
  )
  .addBatch(
    optimizerContext('variables', {
      'stripping': [
        'a{--border:#000}.one{border:1px solid var(--border)}',
        'a{--border:#000}.one{border:1px solid var(--border)}'
      ],
      'all values': [
        'a{--width:1px;--style:solid;--color:#000}.one{border:var(--width)var(--style)var(--color)}',
        'a{--width:1px;--style:solid;--color:#000}.one{border:var(--width) var(--style) var(--color)}'
      ],
      'Polymer mixins - simple optimizations': [
        'a{ display:block; --my-toolbar: { color:#f00; width:96px }; color:blue}',
        'a{display:block;--my-toolbar:{color:red;width:96px};color:#00f}'
      ],
      'Polymer mixins - override optimizations': [
        'a{--my-toolbar: { margin:15px!important; margin:10px};}',
        'a{--my-toolbar:{margin:15px!important};}'
      ],
      'Polymer mixins - shorthand optimizations': [
        'a{--my-toolbar: { margin:10px; margin-top:10px };}',
        'a{--my-toolbar:{margin:10px};}'
      ],
      'Polymer mixins - inlined variables': [
        '.spinner{-webkit-animation:container-rotate var(--paper-spinner-container-rotation-duration) linear infinite}',
        '.spinner{-webkit-animation:container-rotate var(--paper-spinner-container-rotation-duration) linear infinite}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('beautify formatting', {
      'rule': [
        'a{color:red}',
        'a {' + lineBreak + '  color: red' + lineBreak + '}'
      ],
      'rule with fancy selector': [
        '.block[data-col~="5th"]{color:red}',
        '.block[data-col~="5th"] {' + lineBreak + '  color: red' + lineBreak + '}'
      ],
      'rules': [
        'a{color:red}p{color:#000;width:100%}',
        'a {' + lineBreak + '  color: red' + lineBreak + '}' + lineBreak + 'p {' + lineBreak + '  color: #000;' + lineBreak + '  width: 100%' + lineBreak + '}'
      ],
      'multi-scope rule': [
        'a,div{color:red}',
        'a,' + lineBreak + 'div {' + lineBreak + '  color: red' + lineBreak + '}'
      ],
      'relation rule': [
        '.one>.two{color:red}',
        '.one > .two {' + lineBreak + '  color: red' + lineBreak + '}'
      ],
      'at rule block': [
        '@font-face{font-family:test;src:url(/fonts/test.woff)}',
        '@font-face {' + lineBreak + '  font-family: test;' + lineBreak + '  src: url(/fonts/test.woff)' + lineBreak + '}'
      ],
      'nested rule block': [
        '@media screen{a{color:red}}',
        '@media screen {' + lineBreak + '  a {' + lineBreak + '    color: red' + lineBreak + '  }' + lineBreak + '}'
      ],
      'nested rule block rules': [
        '@media screen{a{color:red}div{color:#000}}',
        '@media screen {' + lineBreak + '  a {' + lineBreak + '    color: red' + lineBreak + '  }' + lineBreak + '  div {' + lineBreak + '    color: #000' + lineBreak + '  }' + lineBreak + '}'
      ],
      'variable': [
        'a{--my-toolbar:{margin:10px;padding:10px};}',
        'a {' + lineBreak + '  --my-toolbar: {' + lineBreak + '    margin: 10px;' + lineBreak + '    padding: 10px' + lineBreak + '  };' + lineBreak + '}'
      ],
      'variable and rules': [
        'a{--my-toolbar:{margin:10px;padding:10px};color:red}',
        'a {' + lineBreak + '  --my-toolbar: {' + lineBreak + '    margin: 10px;' + lineBreak + '    padding: 10px' + lineBreak + '  };' + lineBreak + '  color: red' + lineBreak + '}'
      ],
      'at-rule and rules': [
        'a{display:block;@apply(--rule1);color:red}',
        'a {' + lineBreak + '  display: block;' + lineBreak + '  @apply(--rule1);' + lineBreak + '  color: red' + lineBreak + '}'
      ]
    }, { format: 'beautify' })
  )
  .addBatch(
    optimizerContext('custom formatting', {
      'rule': [
        'a{color:red}',
        'a{' + lineBreak + '\tcolor:red' + lineBreak + '}'
      ],
      'at rule block': [
        '@font-face{font-family:test;src:url(/fonts/test.woff)}',
        '@font-face{' + lineBreak + '\tfont-family:test;' + lineBreak + '\tsrc:url(/fonts/test.woff)' + lineBreak + '}'
      ],
      'nested rule block rules': [
        '@media screen{a{color:red}div{color:#000}}',
        '@media screen{' + lineBreak + '\ta{' + lineBreak + '\t\tcolor:red' + lineBreak + '\t}\tdiv{' + lineBreak + '\t\tcolor:#000' + lineBreak + '\t}' + lineBreak + '}'
      ]
    }, { format: { breaks: { afterBlockBegins: true, afterProperty: true, afterRuleBegins: true }, indentWith: 'tab', indentBy: 1 } })
  )
  .addBatch(
    optimizerContext('max line length', {
      'not too long': [
        'a{color:red}',
        'a{color:red}'
      ],
      'too long': [
        '.spinner{-webkit-animation:container-rotate var(--paper-spinner-container-rotation-duration) linear infinite}div{background:url(/very/long/path/to/image.png) repeat}',
        '.spinner{-webkit-animation:container-rotate ' + lineBreak + 'var(--paper-spinner-container-rotation-duration) linear infinite}div{background:' + lineBreak + 'url(/very/long/path/to/image.png) repeat}'
      ]
    }, { format: { wrapAt: 80 } })
  )
  .addBatch(
    optimizerContext('max line length with source maps', {
      'not too long': [
        'a{color:red}',
        'a{color:red}'
      ],
      'too long': [
        '.spinner{-webkit-animation:container-rotate var(--paper-spinner-container-rotation-duration) linear infinite}div{background:url(/very/long/path/to/image.png) repeat}',
        '.spinner{-webkit-animation:container-rotate ' + lineBreak + 'var(--paper-spinner-container-rotation-duration) linear infinite}div{background:' + lineBreak + 'url(/very/long/path/to/image.png) repeat}'
      ]
    }, { format: { wrapAt: 80 }, sourceMap: true })
  )
  .export(module);
