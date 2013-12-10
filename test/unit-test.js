/* jshint indent: false, multistr: true, quotmark: false */

var vows = require('vows');
var assert = require('assert');
var path = require('path');
var CleanCSS = require('../index');
var ColorShortener = require('../lib/colors/shortener');

var lineBreak = process.platform == 'win32' ? '\r\n' : '\n';
var cssContext = function(groups, options) {
  var context = {};
  var clean = function(expectedCss) {
    return function(css) {
      var minifiedCss = new CleanCSS(options).minify(css);
      assert.equal(minifiedCss, expectedCss);
    };
  };

  for (var g in groups) {
    var transformation = groups[g];
    if (typeof transformation == 'string')
      transformation = [transformation, transformation];

    context[g] = {
      topic: transformation[0],
      clean: clean(transformation[1])
    };
  }

  return context;
};

var colorShorteningContext = function() {
  var shortenerContext = {};
  var shortener = new ColorShortener();

  ['toName', 'toHex'].forEach(function(type) {
    for (var from in shortener[type]) {
      var to = shortener[type][from];
      shortenerContext['should turn ' + from + ' into ' + to] = [
        'a{color:' + from + '}',
        'a{color:' + to + '}'
      ];
    }
  });

  return cssContext(shortenerContext);
};

var redefineContext = function(redefinitions, options) {
  var context = {};
  var vendorPrefixes = ['', '-moz-', '-o-', '-webkit-']; // there is no -ms-animation nor -ms-transition.

  for (var property in redefinitions) {
    for (var i = 0; i < redefinitions[property].length; i++) {
      var by = redefinitions[property][i];
      var prefixes = options.vendorPrefixes.indexOf(by) > -1 ? vendorPrefixes : [''];

      for (var j = 0, m = prefixes.length; j < m; j++) {
        var prefixedProperty = prefixes[j] + property;
        var prefixedBy = prefixes[j] + by;

        context['should override ' + prefixedProperty + ' by ' + prefixedBy] = [
          'a{' + prefixedProperty + ':inherit;' + prefixedBy + ':0}',
          'a{' + prefixedBy + ':0}'
        ];
        context['should not override ' + prefixedBy + ' by ' + prefixedProperty] =
          'a{' + prefixedBy + ':0;' + prefixedProperty + ':inherit}';
      }
    }
  }

  return cssContext(context);
};

vows.describe('clean-units').addBatch({
  'identity': cssContext({
    'preserve minified content': 'a{color:#f10}'
  }),
  'semicolons': cssContext({
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
  }),
  'whitespace': cssContext({
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
    'line breaks #3': [
      'div a{width:500px\r\n}',
      'div a{width:500px}'
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
      'div{margin:-moz-calc(50% + 15px) -moz-calc(50% + 15px);margin:calc(50% + .5rem) calc(50% + .5rem)}'
    ],
    'not inside calc method with more parentheses': [
      'div{height:-moz-calc((10% + 12px)/2 + 10em)}',
      'div{height:-moz-calc((10% + 12px)/2 + 10em)}'
    ],
    'not inside calc method with multiplication': [
      'div{height:-moz-calc(3 * 2em + 10px)}',
      'div{height:-moz-calc(3 * 2em + 10px)}'
    ],
    'before colon': [
      '#test{padding-left :0}',
      '#test{padding-left:0}'
    ],
    'before colon but not selectors #1': 'div :before{display:block}',
    'before colon but not selectors #2': 'div ::-webkit-search-decoration{display:block}',
    'before colon but not selectors #3': 'div :after{color:red}',
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
    'in content preceded by #content': '#content{display:block}#foo{content:"\0BB  "}',
    'in content preceded by .content': '.content{display:block}#foo{content:"\0BB  "}',
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
      'a{text-shadow:rgba(255,0,0,1)0 1px}'
    ],
    'after hsl': [
      'a{text-shadow:hsl(240,100%,40%) -1px 1px}',
      'a{text-shadow:#00c -1px 1px}'
    ],
    'after hsla': [
      'a{text-shadow:hsla(240,100%,40%,.5) -1px 1px}',
      'a{text-shadow:hsla(240,100%,40%,.5)-1px 1px}'
    ]
  }),
  'line breaks': cssContext({
    'line breaks': [
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
      "a{ color: #f10; }\n@charset 'utf-8';\nb { font-weight: bolder}",
      "@charset 'utf-8';" + lineBreak + "a{color:#f10}" + lineBreak + "b{font-weight:bolder}"
    ],
    'charset multiple charsets': [
      "@charset 'utf-8';\ndiv :before { display: block }\n@charset 'utf-8';\na { color: #f10 }",
      "@charset 'utf-8';" + lineBreak + "div :before{display:block}" + lineBreak + "a{color:#f10}"
    ],
    'charset with double line break': [
      "@charset 'utf-8';" + lineBreak + lineBreak + "a{display:block}",
      "@charset 'utf-8';" + lineBreak + "a{display:block}"
    ]
  }, { keepBreaks: true }),
  'line breaks and important comments': cssContext({
    'charset to beginning with comment removal': [
      "/*! some comment */" + lineBreak + lineBreak + "@charset 'utf-8';" + lineBreak + lineBreak + "a{display:block}",
      "@charset 'utf-8';" + lineBreak + "a{display:block}"
    ]
  }, { keepBreaks: true, keepSpecialComments: 0 }),
  'selectors': cssContext({
    'remove spaces around selectors': [
      'div + span >   em{display:block}',
      'div+span>em{display:block}'
    ],
    'not remove spaces for pseudo-classes': [
      'div :first-child{display:block}',
      'div :first-child{display:block}'
    ],
    'strip universal selector from id and class selectors': [
      '* > *#id > *.class{display:block}',
      '*>#id>.class{display:block}'
    ],
    'strip universal selector from attribute selectors': [
      '*:first-child > *[data-id]{display:block}',
      ':first-child>[data-id]{display:block}'
    ],
    'not strip standalone universal selector': [
      'label ~ * + span{display:block}',
      'label~*+span{display:block}'
    ],
    'not expand + in selectors mixed with calc methods': [
      'div{width:calc(50% + 3em)}div + div{width:100%}div:hover{width:calc(50% + 4em)}* > div {border:1px solid #f0f}',
      'div{width:calc(50% + 3em)}div+div{width:100%}div:hover{width:calc(50% + 4em)}*>div{border:1px solid #f0f}'
    ]
  }),
  'comments': cssContext({
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
    ]
  }),
  'important comments - one': cssContext({
    'strip all but first': [
      '/*! important comment */a{color:red}/* some comment *//*! important comment */',
      '/*! important comment */a{color:red}'
    ]
  }, { keepSpecialComments: 1 }),
  'important comments - none': cssContext({
    'strip all': [
      '/*! important comment */a{color:red}/* some comment *//*! important comment */',
      'a{color:red}'
    ],
    'move charset before': [
      "/*! some comment */" + lineBreak + lineBreak + "@charset 'utf-8';" + lineBreak + lineBreak + "a{display:block}",
      "@charset 'utf-8';a{display:block}"
    ]
  }, { keepSpecialComments: 0 }),
  'important comments - keepSpecialComments when a string': cssContext({
    'strip all': [
      '/*! important comment */a{color:red}/* some comment *//*! important comment */',
      'a{color:red}'
    ]
  }, { keepSpecialComments: '0' }),
  'expressions': cssContext({
    'empty': 'a{color:expression()}',
    'method call': 'a{color:expression(this.parentNode.currentStyle.color)}',
    'multiple call': 'a{color:expression(x = 0 , this.parentNode.currentStyle.color)}',
    'mixed content': "a{*zoom:expression(this.runtimeStyle[\"zoom\"] = '1', this.innerHTML = '&#xf187;')}",
    'in comment': "/*! expression(this.runtimeStyle['zoom']) */",
    'complex': 'a{width:expression((this.parentNode.innerWidth + this.parentNode.innerHeight) / 2 )}',
    'with parentheses': "a{width:expression(this.parentNode.innerText == ')' ? '5px' : '10px' )}",
    'open ended (broken)': "a{width:expression(this.parentNode.innerText == }"
  }),
  'text content': cssContext({
    'normal #1': 'a{content:"."}',
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
    'with JSON': 'body::before{content:\'{ "current" : "small", "all" : ["small"], "position" : 0 }\'}'
  }),
  'zero values': cssContext({
    'with units': [
      'a{margin:0px 0pt 0em 0%;padding: 0in 0cm 0mm 0pc;border-top-width:0ex}',
      'a{margin:0;padding:0;border-top-width:0}'
    ],
    'multiple into one': [
      'a{margin:0 0 0 0;padding:0 0 0 0;border-width:0 0 0 0}',
      'a{margin:0;padding:0;border-width:0}'
    ],
    'none to zeros': [
      'a{border:none;background:none}',
      'a{border:0;background:0 0}'
    ],
    'background:transparent to zero': [
      'a{background:transparent}p{background transparent url(logo.png)}',
      'a{background:0 0}p{background transparent url(logo.png)}'
    ],
    'outline:none to outline:0': [
      'a{outline:none}',
      'a{outline:0}'
    ],
    'display:none not changed': 'a{display:none}',
    'longer background declaration not changed': 'html{background:none repeat scroll 0 0 #fff}',
    'mixed zeros not changed': 'div{margin:0 0 1px 2px}',
    'mixed zeros not changed #2': 'div{padding:0 1px 0 3px}',
    'mixed zeros not changed #3': 'div{padding:10px 0 0 1px}',
    'multiple zeros with fractions #1': [
      'div{padding:0 0 0 0.5em}',
      'div{padding:0 0 0 .5em}'
    ],
    'multiple zeros with fractions #2': [
      'div{padding:0 0 0 .5em}',
      'div{padding:0 0 0 .5em}'
    ],
    'rect zeros #1': 'div{clip:rect(0 0 0 0)}',
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
      'div{clip:rect(0.5% 0 0 0)}'
    ],
    'rect zeros #6': [
      'div{clip:rect(0px 0px 0px 10px)}',
      'div{clip:rect(0 0 0 10px)}'
    ],
    'box shadow zeros': [
      'a{box-shadow:0 0 0 0}',
      'a{box-shadow:0 0}'
    ],
    'rems': [
      'div{width:0rem;height:0rem}',
      'div{width:0;height:0}'
    ],
    'prefixed box shadow zeros': [
      'a{-webkit-box-shadow:0 0 0 0; -moz-box-shadow:0 0 0 0}',
      'a{-webkit-box-shadow:0 0;-moz-box-shadow:0 0}'
    ]
  }),
  'zero values in ie8 compatibility mode': cssContext({
    'rems': 'div{width:0rem;height:0rem}'
  }, { compatibility: 'ie8' }),
  'zero values in any other compatibility mode': cssContext({
    'rems': [
      'div{width:0rem;height:0rem}',
      'div{width:0;height:0}'
    ]
  }, { compatibility: '*' }),
  'shorthands': cssContext({
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
      'div{-moz-border-radius:3px;-o-border-radius:3px;-webkit-border-radius:3px;border-radius:3px}'
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
    'padding - different 3 values': 'div{padding:1px 1em 1%}',
    'margin - 3 callapsible values': [
      'div{margin:1ex 2ex 1ex}',
      'div{margin:1ex 2ex}'
    ],
    'border-radius - same 3 values with one vendor prefixe': [
      'div{-webkit-border-radius:3px 3px 3px;border-radius:3px 3px 3px}',
      'div{-webkit-border-radius:3px;border-radius:3px}'
    ],
    'border-color - same 2nd and 4th value as rgb': [
      'div{border-color:rgb(0,0,0) rgb(34,0,0) rgb(255,0,0) rgb(34,0,0)}',
      'div{border-color:#000 #200 red}'
    ],
    'margin - 3 different values': 'div{margin:1px 1px 3px}',
    'border width - 3 different values': 'div{border-width:1px 2px 3px}',
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
    'different units': 'div{padding:1px 1em 1% 1rem}',
    'fractions': [
      'div{margin:.1em .1em .1em .1em}',
      'div{margin:.1em}'
    ]
  }),
  'floats': cssContext({
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
    'strip fraction zero #4': 'a{padding:15.101em}',
    'strip fraction zero #5': [
      'a{border-width:0.20em 20.30em}',
      'a{border-width:.2em 20.3em}'
    ],
    'strip fraction zeros': [
      'div{margin:1.000em 2.00em 3.100em 4.01em}',
      'div{margin:1em 2em 3.1em 4.01em}'
    ],
    'round pixels up to 2nd decimal place': [
      'div{transform:translateY(-418.505123px)}',
      'div{transform:translateY(-418.51px)}'
    ],
    'round pixels down to 2nd decimal place': [
      'div{transform:translateY(0.504123px)}',
      'div{transform:translateY(0.5px)}'
    ],
    'do not round 2nd decimal place pixels': 'div{transform:translateY(20.55px)}',
    'do not round percentages': 'div{left:20.505%}',
    'do not round ems': 'div{font-size:1.505em}'
  }),
  'colors': cssContext({
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
    'skip shortening IE filter colors': [
      'a{ filter: chroma(color = "#ff0000")}',
      'a{filter:chroma(color="#ff0000")}'
    ],
    'color names to hex values': [
      'a{color:white;border-color:black;background-color:fuchsia}p{background:yellow}',
      'a{color:#fff;border-color:#000;background-color:#f0f}p{background:#ff0}'
    ],
    'keep selectors with color name #1': ".black-and-white .foo{color:#fff;background-color:#000}",
    'keep selectors with color name #2': ".go-blues{background:#000}",
    'keep selectors with color name #3': "#top_white{background:#000}",
    'keep selectors with color name #4': "a[data-sth=white]{background:#000}",
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
    'border color - keep unchanged': 'p{border:1px solid #f94311}',
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
    'colors and colons': 'a{background-image:linear-gradient(top,red,#e6e6e6)}',
    'colors and parentheses': 'a{background-image:-webkit-gradient(linear,0 0,0 100%,from(#fff),to(#e6e6e6))}',
    'colors in ie filters': 'a{filter:chroma(color=#ffffff)}',
    'colors in ie filters 2': "a{progid:DXImageTransform.Microsoft.gradient(startColorstr='#cccccc', endColorstr='#000000')}",
    'colors in ie filters 3': "a{progid:DXImageTransform.Microsoft.gradient(startColorstr='#DDDDDD', endColorstr='#333333')}",
    'hsla percents': 'a{color:hsla(1,0%,0%,.5)}',
    'hsla custom ': 'a{color:hsl(80,30%,50%,.5)}',
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
    'hsla not to hex': 'a{color:hsl(99,66%,33%,.5)}',
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
    ]
  }),
  'shortening colors': colorShorteningContext(),
  'font weights': cssContext({
    'font-weight:normal to 400': [
      'p{font-weight:normal}',
      'p{font-weight:400}'
    ],
    'font-weight:bold to 700': [
      'p{font-weight:bold}',
      'p{font-weight:700}'
    ],
    'font weight in font declarations': [
      'body{font:normal 13px/20px "Helvetica Neue",Helvetica,Arial,sans-serif}',
      'body{font:400 13px/20px "Helvetica Neue",Helvetica,Arial,sans-serif}'
    ],
    'font weight in font declarations with fraction units': [
      'font:bold .9rem Helvetica',
      'font:700 .9rem Helvetica'
    ],
    'multiple changes': [
      'p{font-weight:bold!important;width:100%;font:normal 12px Helvetica}',
      'p{font-weight:700!important;width:100%;font:400 12px Helvetica}'
    ],
    'font weight in extended font declarations': 'font:normal normal normal 13px/20px Helvetica'
  }),
  'urls': cssContext({
    'keep urls without parentheses unchanged': 'a{background:url(/images/blank.png) 0 0 no-repeat}',
    'keep non-encoded data URI unchanged': ".icon-logo{background-image:url('data:image/svg+xml;charset=US-ASCII')}",
    'strip quotes from base64 encoded PNG data URI': [
      ".icon-logo{background-image:url('data:image/png;base64,iVBORw0')}",
      ".icon-logo{background-image:url(data:image/png;base64,iVBORw0)}"
    ],
    'strip quotes from base64 encoded ICO data URI': [
      '.icon-logo{background-image:url("data:image/x-icon;base64,AAABAAEAEBA")}',
      '.icon-logo{background-image:url(data:image/x-icon;base64,AAABAAEAEBA)}'
    ],
    'strip single parentheses': [
      "a{background:url('/images/blank.png') 0 0 no-repeat}",
      "a{background:url(/images/blank.png) 0 0 no-repeat}"
    ],
    'strip double parentheses': [
      'a{background:url("/images/blank.png") 0 0 no-repeat}',
      'a{background:url(/images/blank.png) 0 0 no-repeat}'
    ],
    'strip more': [
      'p{background:url("/images/blank.png") 0 0 no-repeat}b{display:block}a{background:url("/images/blank2.png") 0 0 no-repeat}',
      'p{background:url(/images/blank.png) 0 0 no-repeat}b{display:block}a{background:url(/images/blank2.png) 0 0 no-repeat}'
    ],
    'not strip comments if spaces inside': [
      'p{background:url("/images/long image name.png") 0 0 no-repeat}b{display:block}a{background:url("/images/no-spaces.png") 0 0 no-repeat}',
      'p{background:url("/images/long image name.png") 0 0 no-repeat}b{display:block}a{background:url(/images/no-spaces.png) 0 0 no-repeat}'
    ],
    'not add a space before url\'s hash': "a{background:url(/fonts/d90b3358-e1e2-4abb-ba96-356983a54c22.svg#d90b3358-e1e2-4abb-ba96-356983a54c22)}",
    'keep urls from being stripped down #1': 'a{background:url(/image-1.0.png)}',
    'keep urls from being stripped down #2': "a{background:url(/image-white.png)}",
    'keep urls from being stripped down #3': "a{background:#eee url(/libraries/jquery-ui-1.10.1.custom/images/ui-bg_highlight-soft_100_eeeeee_1x100.png) 50% top repeat-x}",
    'keep special markers in comments (so order is important)': '/*! __ESCAPED_URL_CLEAN_CSS0__ */a{display:block}',
    'strip new line in urls': [
      'a{background:url(/very/long/\
path)}',
      'a{background:url(/very/long/path)}'
    ],
    'strip new line in urls which could be unquoted': [
      'a{background:url("/very/long/\
path")}',
      'a{background:url(/very/long/path)}'
    ]
  }),
  'urls rewriting - no root or target': cssContext({
    'no @import': 'a{background:url(test/data/partials/extra/down.gif) 0 0 no-repeat}',
    'relative @import': [
      '@import url(test/data/partials-relative/base.css);',
      'a{background:url(test/data/partials/extra/down.gif) 0 0 no-repeat}'
    ],
    'absolute @import': [
      '@import url(/test/data/partials-relative/base.css);',
      'a{background:url(test/data/partials/extra/down.gif) 0 0 no-repeat}'
    ]
  }),
  'urls rewriting - root but no target': cssContext({
    'no @import': [
      'a{background:url(../partials/extra/down.gif) 0 0 no-repeat}',
      'a{background:url(/test/data/partials/extra/down.gif) 0 0 no-repeat}'
    ],
    'relative @import': [
      '@import url(base.css);',
      'a{background:url(/test/data/partials/extra/down.gif) 0 0 no-repeat}'
    ],
    'absolute @import': [
      '@import url(/test/data/partials-relative/base.css);',
      'a{background:url(/test/data/partials/extra/down.gif) 0 0 no-repeat}'
    ]
  }, {
    root: process.cwd(),
    relativeTo: path.join('test', 'data', 'partials-relative')
  }),
  'urls rewriting - no root but target': cssContext({
    'no @import': [
      'a{background:url(../partials/extra/down.gif) 0 0 no-repeat}',
      'a{background:url(test/data/partials/extra/down.gif) 0 0 no-repeat}'
    ],
    'relative @import': [
      '@import url(base.css);',
      'a{background:url(test/data/partials/extra/down.gif) 0 0 no-repeat}'
    ],
    'absolute @import': [
      '@import url(/test/data/partials-relative/base.css);',
      'a{background:url(test/data/partials/extra/down.gif) 0 0 no-repeat}'
    ]
  }, {
    target: path.join(process.cwd(), 'test.css'),
    relativeTo: path.join('test', 'data', 'partials-relative')
  }),
  'urls rewriting - root and target': cssContext({
    'no @import': [
      'a{background:url(../partials/extra/down.gif) 0 0 no-repeat}',
      'a{background:url(/test/data/partials/extra/down.gif) 0 0 no-repeat}'
    ],
    'relative @import': [
      '@import url(base.css);',
      'a{background:url(/test/data/partials/extra/down.gif) 0 0 no-repeat}'
    ],
    'absolute @import': [
      '@import url(/test/data/partials-relative/base.css);',
      'a{background:url(/test/data/partials/extra/down.gif) 0 0 no-repeat}'
    ]
  }, {
    root: process.cwd(),
    target: path.join(process.cwd(), 'test.css'),
    relativeTo: path.join('test', 'data', 'partials-relative')
  }),
  'fonts': cssContext({
    'keep format quotation': "@font-face{font-family:PublicVintage;src:url(/PublicVintage.otf) format('opentype')}",
    'remove font family quotation': [
      "a{font-family:\"Helvetica\",'Arial'}",
      "a{font-family:Helvetica,Arial}"
    ],
    'do not remove font family double quotation if space inside': 'a{font-family:"Courier New"}',
    'do not remove font quotation if starts with a number': 'a{font:\'123font\'}',
    'do not remove font family quotation if starts with a number': 'a{font-family:\'123font\'}',
    'remove font quotation': [
      "a{font:12px/16px \"Helvetica\",'Arial'}",
      "a{font:12px/16px Helvetica,Arial}"
    ],
    'remove font quotation #2': [
      "a{font:12px/16px \"Helvetica1_12\",'Arial_1451'}",
      "a{font:12px/16px Helvetica1_12,Arial_1451}"
    ],
    'remove font quotation #3': [
      "a{font:12px/16px \"Helvetica-Regular\",'Arial-Bold'}",
      "a{font:12px/16px Helvetica-Regular,Arial-Bold}"
    ]
  }),
  'animations': cssContext({
    'shorten': [
      '@keyframes test\n{ from\n { width:100px; }\n to { width:200px; }\n}',
      '@keyframes test{from{width:100px}to{width:200px}}'
    ],
    'remove name quotes': [
      "@keyframes \"test1\"{a{display:block}}@keyframes 'test2'{a{display:block}}",
      "@keyframes test1{a{display:block}}@keyframes test2{a{display:block}}"
    ],
    'not remove name quotes if whitespace inside': "@keyframes \"test 1\"{a{display:block}}@keyframes 'test 2'{a{display:block}}",
    'remove name quotes for vendor prefixes': [
      "@-moz-keyframes 'test'{a{display:block}}@-o-keyframes 'test'{a{display:block}}@-webkit-keyframes 'test'{a{display:block}}",
      "@-moz-keyframes test{a{display:block}}@-o-keyframes test{a{display:block}}@-webkit-keyframes test{a{display:block}}"
    ],
    'remove quotes in animation': [
      "div{animation:'test' 2s ease-in .5s 3}",
      "div{animation:test 2s ease-in .5s 3}"
    ],
    'not remove quotes in animation when name with space inside': "div{animation:'test 1' 2s ease-in .5s 3}",
    'remove quotes in vendor prefixed animation': [
      "div{-moz-animation:'test' 2s ease-in;-o-animation:'test' 2s ease-in;-webkit-animation:'test' 2s ease-in}",
      "div{-moz-animation:test 2s ease-in;-o-animation:test 2s ease-in;-webkit-animation:test 2s ease-in}"
    ],
    'remove quotes in animation-name': [
      "div{animation-name:'test'}",
      "div{animation-name:test}"
    ],
    'not remove quotes in animation-name when name with space inside': "div{animation-name:'test 1'}",
    'remove quotes in vendor prefixed animation-name': [
      "div{-moz-animation-name:'test';-o-animation-name:'test';-webkit-animation-name:'test'}",
      "div{-moz-animation-name:test;-o-animation-name:test;-webkit-animation-name:test}"
    ]
  }),
  'attributes': cssContext({
    'should keep selector if no value': 'div[data-type]{border-color:red}',
    'should keep selector if no quotation': 'div[data-type=something]{border-color:red}',
    'should keep selector if equals in value': 'div[data-type="stupid=value"]{border-color:red}',
    'should keep quotation if whitespace inside': 'div[data-type^=\'object 1\']{border-color:red}',
    'should keep quotations if special characters inside': 'a[data-type="object+1"]{color:red}p[data-target="#some-place"]{color:#0f0}',
    'should keep quotation if is a number': 'div[data-number=\'1\']{border-color:red}',
    'should keep quotation if starts with a number': 'div[data-type^=\'1something\']{border-color:red}',
    'should keep quotation if starts with a hyphen': 'div[data-type$=\'-something\']{border-color:red}',
    'should keep quotation if key only (which is invalid)': 'div["data-type"]',
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
    'should keep special characters inside attributes #1': "a[data-css='color:white']{display:block}",
    'should keep special characters inside attributes #2': 'a[href="/version-0.01.html"]{display:block}',
    'should strip new lines inside attributes': [
      ".test[title='my very long \
title']{display:block}",
      ".test[title='my very long title']{display:block}"
    ],
    'should strip new lines inside attributes which can be unquoted': [
      ".test[title='my_very_long_\
title']{display:block}",
      ".test[title=my_very_long_title]{display:block}"
    ]
  }),
  'ie filters': cssContext({
    'short alpha': [
      "a{ filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=80); -ms-filter:'progid:DXImageTransform.Microsoft.Alpha(Opacity=50)';}",
      "a{filter:alpha(Opacity=80);-ms-filter:'alpha(Opacity=50)'}"
    ],
    'short chroma': [
      'a{filter:progid:DXImageTransform.Microsoft.Chroma(color=#919191)}',
      'a{filter:chroma(color=#919191)}'
    ],
    'matrix filter spaces': [
      "a{filter:progid:DXImageTransform.Microsoft.Matrix(M11=0.984, M22=0.984, M12=0.17, M21=-0.17, SizingMethod='auto expand')}",
      "a{filter:progid:DXImageTransform.Microsoft.Matrix(M11=.984, M22=.984, M12=.17, M21=-.17, SizingMethod='auto expand')}"
    ],
    'multiple filters (IE7 issue)': [
      "a{filter:progid:DXImageTransform.Microsoft.Chroma(color=#919191) progid:DXImageTransform.Microsoft.Matrix(M11=0.984, M22=0.984, M12=0.17, M21=-0.17, SizingMethod='auto expand')}",
      "a{filter:progid:DXImageTransform.Microsoft.Chroma(color=#919191) progid:DXImageTransform.Microsoft.Matrix(M11=.984, M22=.984, M12=.17, M21=-.17, SizingMethod='auto expand')}"
    ]
  }),
  'charsets': cssContext({
    'not at beginning': [
      "a{ color: #f10; }@charset 'utf-8';b { font-weight: bolder}",
      "@charset 'utf-8';a{color:#f10}b{font-weight:bolder}"
    ],
    'multiple charsets': [
      "@charset 'utf-8';div :before { display: block }@charset 'utf-8';a { color: #f10 }",
      "@charset 'utf-8';div :before{display:block}a{color:#f10}"
    ],
    'charset and space after': [
      "@charset 'utf-8';" + lineBreak + lineBreak + "a{display:block}",
      "@charset 'utf-8';a{display:block}"
    ]
  }),
  'important': cssContext({
    'space before': [
      "body{background-color:#fff  !important}",
      "body{background-color:#fff!important}"
    ],
    'space between ! and important': [
      "body{background-color:#fff  ! important}",
      "body{background-color:#fff!important}"
    ]
  }),
  'empty elements': cssContext({
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
      "@media screen { .test {} } .test1 { color: green; }",
      ".test1{color:green}"
    ],
    'inside nested @media': [
      '@media screen { @media (orientation:landscape) { @media (max-width:999px) { .test {} } } }',
      ''
    ],
    'inside not empty @media': [
      "@media screen { .test {} .some { display:none } }",
      "@media screen{.some{display:none}}"
    ],
    'inside nested not empty @media': [
      '@media screen { @media (orientation:landscape) { @media (max-width:999px) { .test {} } a {color:red} } }',
      '@media screen{@media (orientation:landscape){a{color:red}}}'
    ]
  }),
  'empty @media': cssContext({
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
  }),
  'empty with disabled advanced optimizations': cssContext({
    'selector': [
      'a{}p{}',
      ''
    ],
    'media': [
      '@media screen{}',
      ''
    ]
  }, { noAdvanced: true }),
  '@import': cssContext({
    'empty': [
      "@import url();",
      ''
    ],
    'of an unknown file': [
      "@import url('fake.css');",
      ''
    ],
    'of an unknown file with a missing trailing semicolon': [
      "@import url(fake.css)",
      ''
    ],
    'of a directory': [
      "@import url(test/data/partials);",
      ''
    ],
    'of a real file': [
      "@import url(test/data/partials/one.css);",
      ".one{color:red}"
    ],
    'of a real file twice': [
      "@import url(test/data/partials/one.css);@import url(test/data/partials/one.css);",
      ".one{color:red}"
    ],
    'of a real file with current path prefix': [
      "@import url(./test/data/partials/one.css);",
      ".one{color:red}"
    ],
    'of a real file with quoted path': [
      "@import url('test/data/partials/one.css');",
      ".one{color:red}"
    ],
    'of a real file with double-quoted path': [
      '@import url("test/data/partials/one.css");',
      ".one{color:red}"
    ],
    'of a real file with bare path': [
      "@import test/data/partials/one.css;",
      ".one{color:red}"
    ],
    'of a real file with bare quoted path': [
      "@import 'test/data/partials/one.css';",
      ".one{color:red}"
    ],
    'of a real file with bare double-quoted path': [
      '@import "test/data/partials/one.css";',
      ".one{color:red}"
    ],
    'of a real file with single simple media': [
      '@import url(test/data/partials/one.css) screen;',
      "@media screen{.one{color:red}}"
    ],
    'of a real file with multiple simple media': [
      '@import "test/data/partials/one.css" screen, tv, print;',
      "@media screen,tv,print{.one{color:red}}"
    ],
    'of a real file with complex media': [
      '@import \'test/data/partials/one.css\' screen and (orientation:landscape);',
      "@media screen and (orientation:landscape){.one{color:red}}"
    ],
    'of a real file with a missing trailing semicolon': [
      "@import url(test/data/partials/one.css)",
      ''
    ],
    'of a real files with a missing trailing semicolon': [
      "@import url(test/data/partials/one.css)@import url(test/data/partials/two.css)",
      ''
    ],
    'of more files': [
      "@import url(test/data/partials/one.css);\n\na{display:block}\n\n@import url(test/data/partials/extra/three.css);",
      ".one{color:red}a{display:block}.three{color:#0f0}"
    ],
    'of more files with media': [
      "@import url(test/data/partials/one.css) screen;@import url(test/data/partials/extra/three.css) tv;",
      "@media screen{.one{color:red}}@media tv{.three{color:#0f0}}"
    ],
    'of multi-level, circular dependency file': [
      "@import url(test/data/partials/two.css);",
      ".one{color:red}.three{color:#0f0}.four{color:#00f}.two{color:#fff}"
    ],
    'of a file with a relative resource path': [
      "@import url(test/data/partials/three.css);",
      ".three{background-image:url(test/data/partials/extra/down.gif)}"
    ],
    'of a file with an absolute resource path': [
      "@import url(test/data/partials/four.css);",
      ".four{background-image:url(/partials/extra/down.gif)}"
    ],
    'of a file with a resource URI': [
      "@import url(test/data/partials/five.css);",
      ".five{background:url(data:image/jpeg;base64,/9j/)}"
    ],
    'inside a comment': [
      '/* @import url(test/data/partials/five.css); */a { color: red; }',
      'a{color:red}'
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
      '@import url(test/data/partials/comment.css);',
      'a{display:block}'
    ],
    'of a file (with media) with a comment': [
      '@import url(test/data/partials/comment.css) screen and (device-height: 600px);',
      '@media screen and (device-height:600px){a{display:block}}'
    ]
  }, { root: process.cwd() }),
  '@import with absolute paths': cssContext({
    'of an unknown file': [
      "@import url(/fake.css);",
      ''
    ],
    'of a real file': [
      "@import url(/partials/one.css);",
      ".one{color:red}"
    ],
    'of a real file with quoted paths': [
      "@import url(\"/partials/one.css\");",
      ".one{color:red}"
    ],
    'of two files with mixed paths': [
      "@import url(/partials/one.css);a{display:block}@import url(partials/extra/three.css);",
      ".one{color:red}a{display:block}.three{color:#0f0}"
    ],
    'of a multi-level, circular dependency file': [
      "@import url(/partials/two.css);",
      ".one{color:red}.three{color:#0f0}.four{color:#00f}.two{color:#fff}"
    ],
    'of a multi-level, circular dependency file with mixed paths': [
      "@import url(/partials-absolute/base.css);",
      ".base2{border-width:0}.sub{padding:0}.base{margin:0}"
    ]
  }, { root: path.join(process.cwd(), 'test', 'data') }),
  '@import with option processImport': cssContext({
    'of an unknown file': [
      "@import url(/fake.css);",
      "@import url(/fake.css);"
    ]
  }, { processImport: false }),
  'duplicate selectors with disabled advanced processing': cssContext({
    'of a duplicate selector': 'a,a{color:red}'
  }, { noAdvanced: true }),
  'line breaks with disabled advanced processing': cssContext({
    'should be applied': [
      'a{color:red}p{display:block}',
      'a{color:red}' + lineBreak + 'p{display:block}',
    ]
  }, { noAdvanced: true, keepBreaks: true }),
  'invalid data tokenization': cssContext({
    'extra top-level closing brace': [
      'a{color:red}}p{width:auto}',
      'a{color:red}p{width:auto}'
    ],
    'extra top-level closing braces': [
      'a{color:red}}}}p{width:auto}',
      'a{color:red}p{width:auto}'
    ]
  }),
  'duplicate selectors in a list': cssContext({
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
  }),
  'duplicate selectors in a scope': cssContext({
    'of two successive selectors': [
      'a{color:red}a{color:red}',
      'a{color:red}'
    ],
    'of two successive selectors with different body': [
      'a{color:red}a{display:block}',
      'a{color:red;display:block}'
    ],
    'of many successive selectors': [
      'a{color:red}a{color:red}a{color:red}a{color:red}',
      'a{color:red}'
    ],
    'of two non-successive selectors': [
      'a{color:red}p{color:#fff}a{color:red}',
      'p{color:#fff}a{color:red}'
    ],
    'of many non-successive selectors': [
      'div{width:100%}a{color:red}a{color:red}p{color:#fff}div{width:100%}ol{margin:0}p{color:#fff}',
      'a{color:red}div{width:100%}ol{margin:0}p{color:#fff}'
    ],
    'with global and media scope': [
      'a{color:red}@media screen{a{color:red}p{width:100px}a{color:red}}',
      'a{color:red}@media screen{p{width:100px}a{color:red}}'
    ],
    'with two media scopes': [
      '@media (min-width:100px){a{color:red}}@media screen{a{color:red}p{width:100px}a{color:red}}',
      '@media (min-width:100px){a{color:red}}@media screen{p{width:100px}a{color:red}}'
    ]
  }),
  'duplicate properties': cssContext({
    'of two properties one after another': 'a{display:-moz-inline-box;display:inline-block}',
    'of two properties in one declaration': [
      'a{display:inline-block;color:red;display:block}',
      'a{color:red;display:block}'
    ],
    'of two properties in one declaration with former as !important': [
      'a{display:inline-block!important;color:red;display:block}',
      'a{display:inline-block!important;color:red}'
    ],
    'of two properties in one declaration with latter as !important': [
      'a{display:inline-block;color:red;display:block!important}',
      'a{color:red;display:block!important}'
    ],
    'of two properties in one declaration with both as !important': [
      'a{display:inline-block!important;color:red;display:block!important}',
      'a{color:red;display:block!important}'
    ],
    'of many properties in one declaration': [
      'a{display:inline-block;color:red;font-weight:bolder;font-weight:700;display:block!important;color:#fff}',
      'a{font-weight:bolder;font-weight:700;display:block!important;color:#fff}'
    ],
    'both redefined and overridden': [
      'p{display:block;display:-moz-inline-box;color:red;display:table-cell}',
      'p{color:red;display:table-cell}'
    ],
    'background redefined with merging': [
      '.one{display:block}.one{background:#fff;background:-webkit-gradient();background:-moz-linear-gradient();filter:progid:DXImageTransform}',
      '.one{display:block;background:#fff;background:-webkit-gradient();background:-moz-linear-gradient();filter:progid:DXImageTransform}'
    ],
    'filter treated as background': 'p{background:-moz-linear-gradient();background:-webkit-linear-gradient();filter:"progid:DXImageTransform";background:linear-gradient()}',
    'filter treated as background-image': 'p{background-image:-moz-linear-gradient();background-image:-webkit-linear-gradient();filter:"progid:DXImageTransform";background-image:linear-gradient()}',
    '-ms-filter treated as background': 'p{background:-moz-linear-gradient();background:-webkit-linear-gradient();-ms-filter:"progid:DXImageTransform";background:linear-gradient()}',
    '-ms-filter treated as background-image': 'p{background-image:-moz-linear-gradient();background-image:-webkit-linear-gradient();-ms-filter:"progid:DXImageTransform";background-image:linear-gradient()}'
  }),
  'same selectors': cssContext({
    'of two non-adjacent selectors': '.one{color:red}.two{color:#00f}.one{font-weight:700}',
    'of two adjacent single selectors': [
      '.one{color:red}.one{font-weight:700}',
      '.one{color:red;font-weight:700}'
    ],
    'of three adjacent single selectors': [
      '.one{color:red}.one{font-weight:700}.one{font-size:12px}',
      '.one{color:red;font-weight:700;font-size:12px}'
    ],
    'of two adjacent single, complex selectors': [
      '#box>.one{color:red}#box>.one{font-weight:700}',
      '#box>.one{color:red;font-weight:700}'
    ],
    'of two adjacent multiple, complex selectors': [
      '#box>.one,.zero{color:red}#box>.one,.zero{font-weight:700}',
      '#box>.one,.zero{color:red;font-weight:700}'
    ],
    'of two adjacent selectors with duplicate properties #1': [
      '.one{color:red}.one{color:#fff}',
      '.one{color:#fff}'
    ],
    'of two adjacent selectors with duplicate properties #2': [
      '.one{color:red;font-weight:bold}.one{color:#fff;font-weight:400}',
      '.one{color:#fff;font-weight:400}'
    ],
    'of two adjacent complex selectors with different selector order': [
      '.one,.two{color:red}.two,.one{line-height:1em}',
      '.one,.two{color:red;line-height:1em}'
    ],
    'two adjacent with hex color definitions': [
      'a:link,a:visited{color:#fff}.one{display:block}a:link,a:visited{color:red}',
      '.one{display:block}a:link,a:visited{color:red}'
    ]
  }),
  'same non-adjacent selectors': cssContext({
    'with different properties': 'a{color:red;display:block}.one{font-size:12px}a{margin:2px}',
    'with one redefined property': [
      'a{color:red;display:block}.one{font-size:12px}a{color:#fff;margin:2px}',
      'a{display:block}.one{font-size:12px}a{color:#fff;margin:2px}'
    ],
    'with intentionally redefined properties on joins': [
      'a{display:inline-block;display:-moz-inline-box;color:red}.one{font-size:12px}a{color:#fff;margin:2px}',
      'a{display:inline-block;display:-moz-inline-box}.one{font-size:12px}a{color:#fff;margin:2px}'
    ],
    'with intentionally redefined properties on nultiple joins': [
      'a{color:red}.one{font-size:12px}a{color:#fff;margin:2px}.two{font-weight:400}a{margin:0}',
      '.one{font-size:12px}a{color:#fff}.two{font-weight:400}a{margin:0}'
    ],
    'with all redefined properties': [
      'a{color:red;display:block}.one{font-size:12px}a{color:#fff;display:inline-block;margin:2px}',
      '.one{font-size:12px}a{color:#fff;display:inline-block;margin:2px}'
    ],
    'many with all redefined properties': [
      'a{padding:10px}.zero{color:transparent}a{color:red;display:block}.one{font-size:12px}a{color:#fff;display:inline-block;margin:2px}',
      'a{padding:10px}.zero{color:transparent}.one{font-size:12px}a{color:#fff;display:inline-block;margin:2px}'
    ],
    'when overriden by an empty selector': [
      'a{padding:10px}.one{color:red}a{}',
      'a{padding:10px}.one{color:red}'
    ],
    'when overriden by a complex selector': [
      'a{padding:10px;margin:0;color:red}.one{color:red}a,p{color:red;padding:0}',
      'a{margin:0}.one{color:red}a,p{color:red;padding:0}'
    ],
    'when overriden by complex selectors': [
      'a{padding:10px;margin:0;color:red}.one{color:red}a,p{color:red;padding:0}.one,a{color:#fff}',
      'a{margin:0}a,p{color:red;padding:0}.one,a{color:#fff}'
    ],
    'when complex selector overriden by simple selectors': 'a,p{margin:0;color:red}a{color:#fff}',
    // Pending re-run selectors merge - see #160
    'when complex selector overriden by complex and simple selectors': [
      'a,p{margin:0;color:red}a{color:#fff}a,p{color:#00f}p{color:#0f0}',
      'a,p{margin:0}a,p{color:#00f}p{color:#0f0}'
    ],
    'when complex selector overriden by complex selectors': [
      '.one>.two,.three{color:red;line-height:1rem}#zero,.one>.two,.three,.www{color:#fff;margin:0}a{color:red}.one>.two,.three{line-height:2rem;font-size:1.5rem}',
      '#zero,.one>.two,.three,.www{color:#fff;margin:0}a{color:red}.one>.two,.three{line-height:2rem;font-size:1.5rem}'
    ],
    'when undefined is used as a value': '.one{text-shadow:undefined}p{color:red}.one{font-size:12px}',
    'when undefined is used as a value with reduction': [
      '.one{text-shadow:undefined}p{color:red}.one{font-size:12px;text-shadow:none}',
      'p{color:red}.one{font-size:12px;text-shadow:none}'
    ]
  }),
  'rerun optimizers': cssContext({
    'selectors reducible once': [
      '.one{color:red;margin:0}.two{color:red}.one{margin:0}',
      '.one,.two{color:red}.one{margin:0}'
    ]
  }),
  'same bodies': cssContext({
    'of two non-adjacent selectors': '.one{color:red}.two{color:#00f}.three{color:red}',
    'of two adjacent single selectors': [
      '.one{color:red}.two{color:red}',
      '.one,.two{color:red}'
    ],
    'of three adjacent complex, multiple selectors': [
      '.one{color:red}#two.three{color:red}.four>.five{color:red}',
      '#two.three,.four>.five,.one{color:red}'
    ],
    'with repeated selectors': [
      '#zero>p,.one,.two{color:red}.two,#zero>p,.three{color:red}',
      '#zero>p,.one,.three,.two{color:red}'
    ]
  }),
  'same bodies - IE8 compat': cssContext({
    'of two supported selectors': [
      '.one:first-child{color:red}.two>.three{color:red}',
      '.one:first-child,.two>.three{color:red}'
    ],
    'of supported and unsupported selector': '.one:first-child{color:red}.two:last-child{color:red}',
    'of two unsupported selectors': '.one:nth-child(5){color:red}.two:last-child{color:red}'
  }, { compatibility: 'ie8' }),
  'redefined more granular properties': redefineContext({
    'animation-delay': ['animation'],
    'animation-direction': ['animation'],
    'animation-duration': ['animation'],
    'animation-fill-mode': ['animation'],
    'animation-iteration-count': ['animation'],
    'animation-name': ['animation'],
    'animation-play-state': ['animation'],
    'animation-timing-function': ['animation'],
    'background-attachment': ['background'],
    'background-clip': ['background'],
    'background-color': ['background'],
    'background-image': ['background'],
    'background-origin': ['background'],
    'background-position': ['background'],
    'background-repeat': ['background'],
    'background-size': ['background'],
    'border-color': ['border'],
    'border-style': ['border'],
    'border-width': ['border'],
    'border-bottom': ['border'],
    'border-bottom-color': ['border-bottom', 'border-color', 'border'],
    'border-bottom-style': ['border-bottom', 'border-style', 'border'],
    'border-bottom-width': ['border-bottom', 'border-width', 'border'],
    'border-left': ['border'],
    'border-left-color': ['border-left', 'border-color', 'border'],
    'border-left-style': ['border-left', 'border-style', 'border'],
    'border-left-width': ['border-left', 'border-width', 'border'],
    'border-right': ['border'],
    'border-right-color': ['border-right', 'border-color', 'border'],
    'border-right-style': ['border-right', 'border-style', 'border'],
    'border-right-width': ['border-right', 'border-width', 'border'],
    'border-top': ['border'],
    'border-top-color': ['border-top', 'border-color', 'border'],
    'border-top-style': ['border-top', 'border-style', 'border'],
    'border-top-width': ['border-top', 'border-width', 'border'],
    'font-family': ['font'],
    'font-size': ['font'],
    'font-style': ['font'],
    'font-variant': ['font'],
    'font-weight': ['font'],
    'list-style-image': ['list'],
    'list-style-position': ['list'],
    'list-style-type': ['list'],
    'margin-bottom': ['margin'],
    'margin-left': ['margin'],
    'margin-right': ['margin'],
    'margin-top': ['margin'],
    'outline-color': ['outline'],
    'outline-style': ['outline'],
    'outline-width': ['outline'],
    'padding-bottom': ['padding'],
    'padding-left': ['padding'],
    'padding-right': ['padding'],
    'padding-top': ['padding'],
    'transition-delay': ['transition'],
    'transition-duration': ['transition'],
    'transition-property': ['transition'],
    'transition-timing-function': ['transition']
  }, { vendorPrefixes: ['animation', 'transition'] }),
  'complex granular properties': cssContext({
    'two granular properties': 'a{border-bottom:1px solid red;border-color:red}',
    'two same granular properties': 'a{border-color:rgba(0,0,0,.5);border-color:red}',
    'two same granular properties redefined': [
      'a{border-color:rgba(0,0,0,.5);border-color:red;border:0}',
      'a{border:0}'
    ],
    'important granular property redefined': 'a{border-color:red!important;border:0}',
    'important granular property redefined with important': [
      'a{border-color:red!important;border:0!important}',
      'a{border:0!important}'
    ],
    'mix of border properties': [
      'a{border-top:1px solid red;border-top-color:#0f0;color:red;border-top-width:2px;border-bottom-width:1px;border:0;border-left:1px solid red}',
      'a{color:red;border:0;border-left:1px solid red}'
    ]
  })
}).export(module);
