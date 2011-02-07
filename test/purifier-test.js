var vows = require('vows'),
  assert = require('assert');

var Purify = require('../lib/purify').Purify;

var cssContext = function(groups) {
  var context = {};
  var clean = function(cleanCss) {
    return function(css) { assert.equal(Purify.process(css), cleanCss); }
  };
  
  for (var g in groups) {
    var transformation = groups[g];
    if (typeof transformation == 'string') transformation = [transformation, transformation];
    
    context[g] = {
      topic: transformation[0],
      clean: clean(transformation[1])
    };
  }
  
  return context;
};

vows.describe('purify').addBatch({
  'identity': cssContext({
    'preserve minified content': 'a{color:#f00}'
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
    'line breaks': [
      'div \na\r\n { width:500px }',
      'div a{width:500px}'
    ],
    'multiple arguments': [
      'a{color:#fff ;  font-weight:  bold }',
      'a{color:#fff;font-weight:bold}'
    ],
    'space delimited arguments': [
      'a {border: 1px solid #f00; margin: 0 auto }',
      'a{border:1px solid #f00;margin:0 auto}'
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
      '/*! special comment */a{color:#f00} /* normal comment */',
      '/*! special comment */a{color:#f00}'
    ]
  }),
  'zero values': cssContext({
    'with units': [
      'a{margin:0px 0pt 0em 0%;padding: 0in 0cm 0mm 0pc;border-top-width:0ex}',
      'a{margin:0;padding:0;border-top-width:0}'
    ],
    'multiple into one': [
      'a{margin:0 0 0 0;padding:0 0 0;border-width:0 0}',
      'a{margin:0;padding:0;border-width:0}'
    ],
    'none to zeros': [
      'a{border:none;background:none}',
      'a{border:0;background:0}'
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
    ]
  }),
  'colors': cssContext({
    'shorten rgb to standard hexadecimal format': [
      'a{ color:rgb (5, 10, 15) }',
      'a{color:#050a0f}'
    ],
    'skip rgba shortening': [
      'a{ color:rgba(5, 10, 15, 0.5)}',
      'a{color:rgba(5,10,15,.5)}'
    ],
    'shorten colors to 3 digit hex instead of 6 digit': [
      'a{ background-color: #ff0000; color:rgb(0, 17, 255)}',
      'a{background-color:#f00;color:#01f}'
    ],
    'skip shortening IE filter colors': [
      'a{ filter: chroma(color = "#ff0000")}',
      'a{filter:chroma(color="#ff0000")}'
    ]
  }),
  'ie filters': cssContext({
    'alpha': [
      "a{ filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=80); -ms-filter:'progid:DXImageTransform.Microsoft.Alpha(Opacity=50)';}",
      "a{filter:alpha(Opacity=80);-ms-filter:'alpha(Opacity=50)'}"
    ]
  }),
  'charsets': cssContext({
    'not at beginning': [
      "a{ color: #f00; }@charset 'utf-8';b { font-weight: bold}",
      "@charset 'utf-8';a{color:#f00}b{font-weight:bold}"
    ],
    'multiple charsets': [
      "@charset 'utf-8';div :before { display: block }@charset 'utf-8';a { color: #f00 }",
      "@charset 'utf-8';div :before{display:block}a{color:#f00}"
    ]
  })
}).export(module);