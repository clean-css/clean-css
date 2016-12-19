var vows = require('vows');

var optimizerContext = require('../test-helper').optimizerContext;

vows.describe('simple optimizations')
  .addBatch(
    optimizerContext('selectors', {
      'optimized': [
        'a{}',
        ''
      ],
      'whitespace': [
        ' div  > span{color:red}',
        'div>span{color:red}'
      ],
      'line breaks': [
        ' div  >\n\r\n span{color:red}',
        'div>span{color:red}'
      ],
      'more line breaks': [
        '\r\ndiv\n{color:red}',
        'div{color:red}'
      ],
      '+html': [
        '*+html .foo{color:red}',
        ''
      ],
      'adjacent nav': [
        'div + nav{color:red}',
        'div+nav{color:red}'
      ],
      'heading & trailing': [
        ' a {color:red}',
        'a{color:red}'
      ],
      'descendant selector': [
        'div > a{color:red}',
        'div>a{color:red}'
      ],
      'next selector': [
        'div + a{color:red}',
        'div+a{color:red}'
      ],
      'sibling selector': [
        'div  ~ a{color:red}',
        'div~a{color:red}'
      ],
      'pseudo classes': [
        'div  :first-child{color:red}',
        'div :first-child{color:red}'
      ],
      'tabs': [
        'div\t\t{color:red}',
        'div{color:red}'
      ],
      'universal selector - id, class, and property': [
        '* > *#id > *.class > *[property]{color:red}',
        '*>#id>.class>[property]{color:red}'
      ],
      'universal selector - pseudo': [
        '*:first-child{color:red}',
        ':first-child{color:red}'
      ],
      'universal selector - standalone': [
        'label ~ * + span{color:red}',
        'label~*+span{color:red}'
      ],
      'order': [
        'b,div,a{color:red}',
        'a,b,div{color:red}'
      ],
      'duplicates': [
        'a,div,.class,.class,a ,div > a{color:red}',
        '.class,a,div,div>a{color:red}',
      ],
      'mixed': [
        ' label   ~  \n*  +  span , div>*.class, section\n\n{color:red}',
        'div>.class,label~*+span,section{color:red}'
      ],
      'escaped joining character #1': [
        '.class\\~ div{color:red}',
        '.class\\~ div{color:red}'
      ],
      'escaped joining character #2': [
        '.class\\+\\+ div{color:red}',
        '.class\\+\\+ div{color:red}'
      ],
      'escaped joining character #3': [
        '.class\\>  \\~div{color:red}',
        '.class\\> \\~div{color:red}'
      ],
      'escaped characters': [
        '.a\\+\\+b{color:red}',
        '.a\\+\\+b{color:red}'
      ],
      'quotes #1': [
        '.a[title="a b c\'s d e f"]{color:red}',
        '.a[title="a b c\'s d e f"]{color:red}'
      ],
      'quotes #2': [
        '.b[data-json=\'"aaaa":"bbbb"\']{color:red}',
        '.b[data-json=\'"aaaa":"bbbb"\']{color:red}'
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('selectors - ie8', {
      '+html': [
        '*+html .foo{color:red}',
        ''
      ],
      '+first-child html': [
        '*:first-child+html .foo{color:red}',
        ''
      ],
      '+html - complex': [
        '*+html .foo,.bar{color:red}',
        '.bar{color:red}'
      ]
    }, { advanced: false, compatibility: 'ie8' })
  )
  .addBatch(
    optimizerContext('selectors - ie7', {
      '+html': [
        '*+html .foo{color:red}',
        '*+html .foo{color:red}'
      ],
      '+html - complex': [
        '*+html .foo,.bar{color:red}',
        '*+html .foo,.bar{color:red}'
      ]
    }, { advanced: false, compatibility: 'ie7' })
  )
  .addBatch(
    optimizerContext('selectors - adjacent space', {
      'with whitespace': [
        'div + nav{color:red}',
        'div+ nav{color:red}'
      ],
      'without whitespace': [
        'div+nav{color:red}',
        'div+ nav{color:red}'
      ]
    }, { advanced: false, compatibility: { selectors: { adjacentSpace: true } } })
  )
  .addBatch(
    optimizerContext('background', {
      'none to 0 0': [
        'a{background:none}',
        'a{background:0 0}'
      ],
      'transparent to 0 0': [
        'a{background:transparent}',
        'a{background:0 0}'
      ],
      'any other': [
        'a{background:red}',
        'a{background:red}'
      ],
      'none to other': [
        'a{background:transparent no-repeat}',
        'a{background:transparent no-repeat}'
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('border-*-radius', {
      'spaces around /': [
        'a{border-radius:2em  /  1em}',
        'a{border-radius:2em/1em}'
      ],
      'symmetric expanded to shorthand': [
        'a{border-radius:1em 2em 3em 4em / 1em 2em 3em 4em}',
        'a{border-radius:1em 2em 3em 4em}'
      ],
      'asymmetric kept as is': [
        'a{border-top-left-radius:1em 2em}',
        'a{border-top-left-radius:1em 2em}'
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('box-shadow', {
      'four zeros': [
        'a{box-shadow:0 0 0 0}',
        'a{box-shadow:0 0}'
      ],
      'four zeros in vendor prefixed': [
        'a{-webkit-box-shadow:0 0 0 0}',
        'a{-webkit-box-shadow:0 0}'
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('colors', {
      'rgb to hex': [
        'a{color:rgb(255,254,253)}',
        'a{color:#fffefd}'
      ],
      'rgba not to hex': [
        'a{color:rgba(255,254,253,.5)}',
        'a{color:rgba(255,254,253,.5)}'
      ],
      'hsl to hex': [
        'a{color:hsl(240,100%,50%)}',
        'a{color:#00f}'
      ],
      'hsla not to hex': [
        'a{color:hsla(240,100%,50%,.5)}',
        'a{color:hsla(240,100%,50%,.5)}'
      ],
      'long hex to short hex': [
        'a{color:#ff00ff}',
        'a{color:#f0f}'
      ],
      'hex to name': [
        'a{color:#f00}',
        'a{color:red}'
      ],
      'name to hex': [
        'a{color:white}',
        'a{color:#fff}'
      ],
      'transparent black rgba to transparent': [
        'a{color:rgba(0,0,0,0)}',
        'a{color:transparent}'
      ],
      'transparent non-black rgba': [
        'a{color:rgba(255,0,0,0)}',
        'a{color:rgba(255,0,0,0)}'
      ],
      'transparent black hsla to transparent': [
        'a{color:hsla(0,0%,0%,0)}',
        'a{color:transparent}'
      ],
      'transparent non-black hsla': [
        'a{color:rgba(240,0,0,0)}',
        'a{color:rgba(240,0,0,0)}'
      ],
      'partial hex to name': [
        'a{color:#f00000}',
        'a{color:#f00000}'
      ],
      'partial hex further down to name': [
        'a{background:url(test.png) #f00000}',
        'a{background:url(test.png) #f00000}'
      ],
      'partial name to hex': [
        'a{color:greyish}',
        'a{color:greyish}'
      ],
      'partial name further down to hex': [
        'a{background:url(test.png) blueish}',
        'a{background:url(test.png) blueish}'
      ],
      'partial name as a suffix': [
        'a{font-family:alrightsanslp-black}',
        'a{font-family:alrightsanslp-black}'
      ],
      'invalid rgba declaration - color': [
        'a{color:rgba(255 0 0)}',
        'a{color:rgba(255 0 0)}'
      ],
      'invalid rgba declaration - background': [
        'a{background:rgba(255 0 0)}',
        'a{background:rgba(255 0 0)}'
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('colors - ie8 compatibility', {
      'transparent black rgba': [
        'a{color:rgba(0,0,0,0)}',
        'a{color:rgba(0,0,0,0)}'
      ],
      'transparent non-black rgba': [
        'a{color:rgba(255,0,0,0)}',
        'a{color:rgba(255,0,0,0)}'
      ],
      'transparent black hsla': [
        'a{color:hsla(0,0%,0%,0)}',
        'a{color:hsla(0,0%,0%,0)}'
      ],
      'transparent non-black hsla': [
        'a{color:rgba(240,0,0,0)}',
        'a{color:rgba(240,0,0,0)}'
      ]
    }, { advanced: false, compatibility: 'ie8' })
  )
  .addBatch(
    optimizerContext('colors - no optimizations', {
      'long hex into short': [
        'a{color:#ff00ff}',
        'a{color:#ff00ff}'
      ],
      'short hex into name': [
        'a{color:#f00}',
        'a{color:#f00}'
      ],
      'name into hex': [
        'a{color:white}',
        'a{color:white}'
      ]
    }, { advanced: false, compatibility: { properties: { colors: false } } })
  )
  .addBatch(
    optimizerContext('filter', {
      'spaces after comma': [
        'a{filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#cccccc\',endColorstr=\'#000000\', enabled=true)}',
        'a{filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#cccccc\', endColorstr=\'#000000\', enabled=true)}'
      ],
      'single Alpha filter': [
        'a{filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=80)}',
        'a{filter:alpha(Opacity=80)}'
      ],
      'single Chroma filter': [
        'a{filter:progid:DXImageTransform.Microsoft.Chroma(color=#919191)}',
        'a{filter:chroma(color=#919191)}'
      ],
      'multiple filters': [
        'a{filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=80) progid:DXImageTransform.Microsoft.Chroma(color=#919191)}',
        'a{filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=80) progid:DXImageTransform.Microsoft.Chroma(color=#919191)}'
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('font', {
      'in shorthand': [
        'a{font:normal 13px/20px sans-serif}',
        'a{font:400 13px/20px sans-serif}'
      ],
      'in shorthand with fractions': [
        'a{font:bold .9em sans-serif}',
        'a{font:700 .9em sans-serif}'
      ],
      'with font wariant and style': [
        'a{font:normal normal normal 13px/20px sans-serif}',
        'a{font:normal normal normal 13px/20px sans-serif}'
      ],
      'with mixed order of variant and style': [
        'a{font:normal 300 normal 13px/20px sans-serif}',
        'a{font:normal 300 normal 13px/20px sans-serif}'
      ],
      'with mixed normal and weight': [
        'a{font:normal small-caps 400 medium Georgia,sans-serif}',
        'a{font:normal small-caps 400 medium Georgia,sans-serif}'
      ],
      'with line height': [
        'a{font:11px/normal sans-serif}',
        'a{font:11px/normal sans-serif}'
      ],
      'with mixed bold weight and variant #1': [
        'a{font:normal bold 17px sans-serif}',
        'a{font:normal 700 17px sans-serif}'
      ],
      'with mixed bold weight and variant #2': [
        'a{font:bold normal 17px sans-serif}',
        'a{font:700 normal 17px sans-serif}'
      ],
      'with mixed bold weight and variant #3': [
        'a{font:bold normal normal 17px sans-serif}',
        'a{font:bold normal normal 17px sans-serif}' // pending #254
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('font-weight', {
      'normal to 400': [
        'a{font-weight:normal}',
        'a{font-weight:400}'
      ],
      'bold to 700': [
        'a{font-weight:bold}',
        'a{font-weight:700}'
      ],
      'any other': [
        'a{font-weight:bolder}',
        'a{font-weight:bolder}'
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('ie hacks', {
      'underscore': [
        'a{_width:101px}',
        ''
      ],
      'star': [
        'a{*width:101px}',
        ''
      ],
      'backslash': [
        'a{width:101px\\9}',
        'a{width:101px\\9}'
      ],
      'bang': [
        'a{color:red !ie}',
        ''
      ],
      'before content': [
        'a{*width:101px;color:red!important}',
        'a{color:red!important}'
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('ie hacks in IE8 mode', {
      'underscore': [
        'a{_width:101px}',
        'a{_width:101px}'
      ],
      'star': [
        'a{*width:101px}',
        'a{*width:101px}'
      ],
      'backslash': [
        'a{width:101px\\9}',
        'a{width:101px\\9}'
      ],
      'bang': [
        'a{color:red !ie}',
        ''
      ]
    }, { advanced: false, compatibility: 'ie8' })
  )
  .addBatch(
    optimizerContext('ie hacks in IE7 mode', {
      'underscore': [
        'a{_width:101px}',
        'a{_width:101px}'
      ],
      'star': [
        'a{*width:101px}',
        'a{*width:101px}'
      ],
      'backslash': [
        'a{width:101px\\9}',
        'a{width:101px\\9}'
      ],
      'bang': [
        'a{color:red !ie}',
        'a{color:red !ie}'
      ]
    }, { advanced: false, compatibility: 'ie7' })
  )
  .addBatch(
    optimizerContext('important', {
      'minified': [
        'a{color:red!important}',
        'a{color:red!important}'
      ],
      'space before !': [
        'a{color:red !important}',
        'a{color:red!important}',
      ],
      'space after !': [
        'a{color:red! important}',
        'a{color:red!important}'
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('outline', {
      'none to 0': [
        'a{outline:none}',
        'a{outline:0}'
      ],
      'any other': [
        'a{outline:10px}',
        'a{outline:10px}'
      ],
      'none and any other': [
        'a{outline:none solid 1px}',
        'a{outline:none solid 1px}'
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('rounding', {
      'pixels': [
        'a{transform:translateY(123.31135px)}',
        'a{transform:translateY(123.311px)}'
      ],
      'percents': [
        'a{left:20.1231%}',
        'a{left:20.1231%}'
      ],
      'ems': [
        'a{left:1.1231em}',
        'a{left:1.1231em}'
      ]
    }, { advanced: false, roundingPrecision: 3 })
  )
  .addBatch(
    optimizerContext('rounding disabled', {
      'pixels': [
        'a{transform:translateY(123.31135px)}',
        'a{transform:translateY(123.31135px)}'
      ],
      'percents': [
        'a{left:20.1231%}',
        'a{left:20.1231%}'
      ],
      'ems': [
        'a{left:1.1231em}',
        'a{left:1.1231em}'
      ]
    }, { advanced: false, roundingPrecision: -1 })
  )
  .addBatch(
    optimizerContext('rounding disabled when option value not castable to int', {
      'pixels': [
        'a{transform:translateY(123.31135px)}',
        'a{transform:translateY(123.31135px)}'
      ],
      'percents': [
        'a{left:20.1231%}',
        'a{left:20.1231%}'
      ],
      'ems': [
        'a{left:1.1231em}',
        'a{left:1.1231em}'
      ]
    }, { advanced: false, roundingPrecision: '\'-1\'' })
  )
  .addBatch(
    optimizerContext('units', {
      'pixels': [
        'a{width:0px}',
        'a{width:0}'
      ],
      'degrees': [
        'div{background:linear-gradient(0deg,red,#fff)}',
        'div{background:linear-gradient(0deg,red,#fff)}'
      ],
      'degrees when not mixed': [
        'div{transform:rotate(0deg) skew(0deg)}',
        'div{transform:rotate(0) skew(0)}'
      ],
      'non-zero degrees when not mixed': [
        'div{transform:rotate(10deg) skew(.5deg)}',
        'div{transform:rotate(10deg) skew(.5deg)}'
      ],
      'ch': [
        'div{width:0ch;height:0ch}',
        'div{width:0;height:0}'
      ],
      'rem': [
        'div{width:0rem;height:0rem}',
        'div{width:0;height:0}'
      ],
      'vh': [
        'div{width:0vh;height:0vh}',
        'div{width:0;height:0}'
      ],
      'vm': [
        'div{width:0vm;height:0vm}',
        'div{width:0;height:0}'
      ],
      'vmax': [
        'div{width:0vmax;height:0vmax}',
        'div{width:0;height:0}'
      ],
      'vmin': [
        'div{width:0vmin;height:0vmin}',
        'div{width:0;height:0}'
      ],
      'vw': [
        'div{width:0vw;height:0vw}',
        'div{width:0;height:0}'
      ],
      'mixed units': [
        'a{margin:0em 0rem 0px 0pt}',
        'a{margin:0}'
      ],
      'mixed values #1': [
        'a{padding:10px 0em 30% 0rem}',
        'a{padding:10px 0 30% 0}'
      ],
      'mixed values #2': [
        'a{padding:10ch 0vm 30vmin 0vw}',
        'a{padding:10ch 0 30vmin 0}'
      ],
      'inside calc': [
        'a{font-size:calc(100% + 0px)}',
        'a{font-size:calc(100% + 0px)}'
      ],
      'flex': [
        'a{flex:1 0 0%}',
        'a{flex:1 0 0%}'
      ],
      'flex–basis': [
        'a{flex-basis:0%}',
        'a{flex-basis:0%}'
      ],
      'prefixed flex': [
        'a{-ms-flex:1 0 0px;-webkit-flex:1 0 0px}',
        'a{-ms-flex:1 0 0px;-webkit-flex:1 0 0px}'
      ],
      'prefixed flex–basis': [
        'a{-webkit-flex-basis:0px}',
        'a{-webkit-flex-basis:0px}'
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('units in compatibility mode', {
      'pixels': [
        'a{width:0px}',
        'a{width:0}'
      ],
      'mixed units': [
        'a{margin:0em 0rem 0px 0pt}',
        'a{margin:0 0rem 0 0}'
      ],
      'mixed values #1': [
        'a{padding:10px 0em 30% 0rem}',
        'a{padding:10px 0 30% 0rem}'
      ],
      'mixed values #2': [
        'a{padding:10ch 0vm 30vmin 0vw}',
        'a{padding:10ch 0vm 30vmin 0vw}'
      ]
    }, { advanced: false, compatibility: 'ie8' })
  )
  .addBatch(
    optimizerContext('zeros', {
      '-0 to 0': [
        'a{margin:-0}',
        'a{margin:0}'
      ],
      '-0px to 0': [
        'a{margin:-0px}',
        'a{margin:0}'
      ],
      '-0% to 0': [
        'a{width:-0%}',
        'a{width:0}'
      ],
      'missing': [
        'a{opacity:1.}',
        'a{opacity:1}'
      ],
      'multiple': [
        'a{margin:-0 -0 -0 -0}',
        'a{margin:0}'
      ],
      'keeps negative non-zero': [
        'a{margin:-0.5em}',
        'a{margin:-.5em}'
      ],
      'inside names #1': [
        'div{animation-name:test-0-bounce}',
        'div{animation-name:test-0-bounce}'
      ],
      'inside names #2': [
        'div{animation-name:test-0bounce}',
        'div{animation-name:test-0bounce}'
      ],
      'inside names #3': [
        'div{animation-name:test-0px}',
        'div{animation-name:test-0px}'
      ],
      'strips leading from value': [
        'a{padding:010px 0015px}',
        'a{padding:10px 15px}'
      ],
      'strips leading from fractions': [
        'a{margin:-0.5em}',
        'a{margin:-.5em}'
      ],
      'strips trailing from opacity': [
        'a{opacity:1.0}',
        'a{opacity:1}'
      ],
      '.0 to 0': [
        'a{margin:.0 .0 .0 .0}',
        'a{margin:0}'
      ],
      'fraction zeros': [
        'a{margin:10.0em 15.50em 10.01em 0.0em}',
        'a{margin:10em 15.5em 10.01em 0}'
      ],
      'four zeros into one': [
        'a{margin:0 0 0 0}',
        'a{margin:0}'
      ],
      'rect zeros': [
        'a{clip:rect(0px 0px 0px 0px)}',
        'a{clip:rect(0 0 0 0)}'
      ],
      'rect zeros with non-zero value': [
        'a{clip:rect(0.5% 0px  0px 0px)}',
        'a{clip:rect(.5% 0 0 0)}'
      ],
      'rect zeros with commas': [
        'a{clip:rect(0px, 0px, 0px, 0px)}',
        'a{clip:rect(0,0,0,0)}'
      ],
      'height': [
        'a{height:0%}',
        'a{height:0%}'
      ],
      'min-height': [
        'a{min-height:0%}',
        'a{min-height:0}'
      ],
      'max-height': [
        'a{max-height:0%}',
        'a{max-height:0%}'
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('zeros - rounding', {
      'fractions are removed': [
        'a{margin:10.0010px}',
        'a{margin:10px}'
      ]
    }, { advanced: false, roundingPrecision: 2 })
  )
  .addBatch(
    optimizerContext('zeros with disabled zeroUnits', {
      '10.0em': [
        'a{margin:10.0em}',
        'a{margin:10em}'
      ],
      '0px': [
        'a{margin:0px}',
        'a{margin:0px}'
      ],
      '0px 0px': [
        'a{margin:0px 0px}',
        'a{margin:0px 0px}'
      ],
      '0deg': [
        'div{transform:rotate(0deg) skew(0deg)}',
        'div{transform:rotate(0deg) skew(0deg)}'
      ],
      '0%': [
        'a{height:0%}',
        'a{height:0%}'
      ],
      '10%': [
        'a{width:10%}',
        'a{width:10%}'
      ]
    }, { advanced: false, compatibility: { properties: { zeroUnits: false } } })
  )
  .addBatch(
    optimizerContext('comments', {
      'comment': [
        'a{/*! comment 1 */color:red/*! comment 2 */}',
        'a{/*! comment 1 */color:red/*! comment 2 */}'
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('whitespace', {
      'stripped spaces': [
        'div{text-shadow:rgba(255,1,1,.5) 1px}',
        'div{text-shadow:rgba(255,1,1,.5) 1px}'
      ],
      'calc': [
        'a{width:-moz-calc(100% - 1em);width:calc(100% - 1em)}',
        'a{width:-moz-calc(100% - 1em);width:calc(100% - 1em)}'
      ],
      'empty body': [
        'a{}',
        ''
      ],
      'in a body': [
        'a{   \n }',
        ''
      ],
      'after calc()': [
        'div{margin:calc(100% - 21px) 1px}',
        'div{margin:calc(100% - 21px) 1px}'
      ],
      '*nix line break inside property': [
        'a{border:2px\nsolid}',
        'a{border:2px solid}'
      ],
      'windows line break inside property': [
        'a{border:2px\r\nsolid}',
        'a{border:2px solid}'
      ],
      'tab inside property': [
        'a{border:2px\tsolid}',
        'a{border:2px solid}'
      ],
      'line breaks and special comments inside a rule': [
        'a{\ncolor:red;\n/*!*/\n\n\n\n\n\n\n/*!*/\n}',
        'a{color:red/*!*//*!*/}'
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('time units', {
      'positive miliseconds to seconds': [
        'div{transition-duration:500ms}',
        'div{transition-duration:.5s}'
      ],
      'negative miliseconds to seconds': [
        'div{transition-duration:-500ms}',
        'div{transition-duration:-.5s}'
      ],
      'miliseconds to seconds when results in a too long value': [
        'div{transition-duration:1515ms}',
        'div{transition-duration:1515ms}'
      ],
      'zero miliseconds to seconds': [
        'div{transition-duration:0ms}',
        'div{transition-duration:0s}'
      ],
      'positive seconds to miliseconds': [
        'div{transition-duration:0.005s}',
        'div{transition-duration:5ms}'
      ],
      'negative seconds to miliseconds': [
        'div{transition-duration:-0.005s}',
        'div{transition-duration:-5ms}'
      ],
      'seconds to miliseconds when results in a too long value': [
        'div{transition-duration:1.2s}',
        'div{transition-duration:1.2s}'
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('length units', {
      'px to in': [
        'div{left:480px}',
        'div{left:480px}'
      ],
      'px to pc': [
        'div{left:32px}',
        'div{left:32px}'
      ],
      'px to pt': [
        'div{left:120px}',
        'div{left:120px}'
      ]
    }, { advanced: false })
  )
  .addBatch(
    optimizerContext('length units in compatibility mode', {
      'px to in': [
        'div{left:480px}',
        'div{left:480px}'
      ],
      'px to pc': [
        'div{left:32px}',
        'div{left:32px}'
      ],
      'px to pt': [
        'div{left:120px}',
        'div{left:120px}'
      ]
    }, { advanced: false, compatibility: 'ie8' })
  )
  .addBatch(
    optimizerContext('length units when turned on', {
      'positive px to in': [
        'div{left:480px}',
        'div{left:5in}'
      ],
      'negative px to in': [
        'div{left:-96px}',
        'div{left:-1in}'
      ],
      'positive px to pc': [
        'div{left:32px}',
        'div{left:2pc}'
      ],
      'negative px to pc': [
        'div{left:-160px}',
        'div{left:-10pc}'
      ],
      'positive px to pt': [
        'div{left:120px}',
        'div{left:90pt}'
      ],
      'negative px to pt': [
        'div{left:-120px}',
        'div{left:-90pt}'
      ],
      'in calc': [
        'div{left:calc(100% - 480px)}',
        'div{left:calc(100% - 5in)}'
      ],
      'in transform': [
        'div{transform:translateY(32px)}',
        'div{transform:translateY(2pc)}'
      ]
    }, { advanced: false, compatibility: { properties: { shorterLengthUnits: true } } })
  )
  .addBatch(
    optimizerContext('length units when turned on selectively', {
      'px to in': [
        'div{left:480px}',
        'div{left:30pc}'
      ],
      'px to pc': [
        'div{left:32px}',
        'div{left:2pc}'
      ],
      'px to pt': [
        'div{left:120px}',
        'div{left:120px}'
      ]
    }, { advanced: false, compatibility: { properties: { shorterLengthUnits: true }, units: { in: false, pt: false } } })
  )
  .export(module);
