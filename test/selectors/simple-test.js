var vows = require('vows');

var selectorContext = require('../test-helper').selectorContext;
var propertyContext = require('../test-helper').propertyContext;

vows.describe('simple optimizations')
  .addBatch(
    selectorContext('default', {
      'optimized': [
        'a{}',
        null
      ],
      'whitespace': [
        ' div  > span{color:red}',
        [['div>span']]
      ],
      'line breaks': [
        ' div  >\n\r\n span{color:red}',
        [['div>span']]
      ],
      'more line breaks': [
        '\r\ndiv\n{color:red}',
        [['div']]
      ],
      '+html': [
        '*+html .foo{display:inline}',
        null
      ],
      'adjacent nav': [
        'div + nav{color:red}',
        [['div+nav']]
      ],
      'heading & trailing': [
        ' a {color:red}',
        [['a']]
      ],
      'descendant selector': [
        'div > a{color:red}',
        [['div>a']]
      ],
      'next selector': [
        'div + a{color:red}',
        [['div+a']]
      ],
      'sibling selector': [
        'div  ~ a{color:red}',
        [['div~a']]
      ],
      'pseudo classes': [
        'div  :first-child{color:red}',
        [['div :first-child']]
      ],
      'tabs': [
        'div\t\t{color:red}',
        [['div']]
      ],
      'universal selector - id, class, and property': [
        '* > *#id > *.class > *[property]{color:red}',
        [['*>#id>.class>[property]']]
      ],
      'universal selector - pseudo': [
        '*:first-child{color:red}',
        [[':first-child']]
      ],
      'universal selector - standalone': [
        'label ~ * + span{color:red}',
        [['label~*+span']]
      ],
      'order': [
        'b,div,a{color:red}',
        [['a'], ['b'], ['div']]
      ],
      'duplicates': [
        'a,div,.class,.class,a ,div > a{color:red}',
        [['.class'], ['a'], ['div'], ['div>a']]
      ],
      'mixed': [
        ' label   ~  \n*  +  span , div>*.class, section\n\n{color:red}',
        [['div>.class'], ['label~*+span'], ['section']]
      ],
      'escaped joining character #1': [
        '.class\\~ div{color: red}',
        [['.class\\~ div']]
      ],
      'escaped joining character #2': [
        '.class\\+\\+ div{color: red}',
        [['.class\\+\\+ div']]
      ],
      'escaped joining character #3': [
        '.class\\>  \\~div{color: red}',
        [['.class\\> \\~div']]
      ],
      'escaped characters': [
        '.a\\+\\+b{color: red}',
        [['.a\\+\\+b']]
      ]
    })
  )
  .addBatch(
    selectorContext('ie8', {
      '+html': [
        '*+html .foo{display:inline}',
        null
      ],
      '+first-child html': [
        '*:first-child+html .foo{display:inline}',
        null
      ],
      '+html - complex': [
        '*+html .foo,.bar{display:inline}',
        [['.bar']]
      ]
    }, { compatibility: 'ie8' })
  )
  .addBatch(
    selectorContext('ie7', {
      '+html': [
        '*+html .foo{display:inline}',
        [['*+html .foo']]
      ],
      '+html - complex': [
        '*+html .foo,.bar{display:inline}',
        [['*+html .foo'], ['.bar']]
      ]
    }, { compatibility: 'ie7' })
  )
  .addBatch(
    selectorContext('+adjacentSpace', {
      'with whitespace': [
        'div + nav{color:red}',
        [['div+ nav']]
      ],
      'without whitespace': [
        'div+nav{color:red}',
        [['div+ nav']]
      ]
    }, { compatibility: { selectors: { adjacentSpace: true } } })
  )
  .addBatch(
    propertyContext('@background', {
      'none to 0 0': [
        'a{background:none}',
        [['background', '0 0']]
      ],
      'transparent to 0 0': [
        'a{background:transparent}',
        [['background', '0 0']]
      ],
      'any other': [
        'a{background:red}',
        [['background', 'red']]
      ],
      'none to other': [
        'a{background:transparent no-repeat}',
        [['background', 'transparent', 'no-repeat']]
      ]
    })
  )
  .addBatch(
    propertyContext('@border-*-radius', {
      'spaces around /': [
        'a{border-radius:2em  /  1em}',
        [['border-radius', '2em', '/', '1em']]
      ],
      'symmetric expanded to shorthand': [
        'a{border-radius:1em 2em 3em 4em / 1em 2em 3em 4em}',
        [['border-radius', '1em', '2em', '3em', '4em']]
      ],
      'asymmetric kept as is': [
        'a{border-top-left-radius:1em 2em}',
        [['border-top-left-radius', '1em', '2em']]
      ]
    })
  )
  .addBatch(
    propertyContext('@box-shadow', {
      'four zeros': [
        'a{box-shadow:0 0 0 0}',
        [['box-shadow', '0', '0']]
      ],
      'four zeros in vendor prefixed': [
        'a{-webkit-box-shadow:0 0 0 0}',
        [['-webkit-box-shadow', '0', '0']]
      ]
    })
  )
  .addBatch(
    propertyContext('colors', {
      'rgb to hex': [
        'a{color:rgb(255,254,253)}',
        [['color', '#fffefd']]
      ],
      'rgba not to hex': [
        'a{color:rgba(255,254,253,.5)}',
        [['color', 'rgba(255,254,253,.5)']]
      ],
      'hsl to hex': [
        'a{color:hsl(240,100%,50%)}',
        [['color', '#00f']]
      ],
      'hsla not to hex': [
        'a{color:hsla(240,100%,50%,.5)}',
        [['color', 'hsla(240,100%,50%,.5)']]
      ],
      'long hex to short hex': [
        'a{color:#ff00ff}',
        [['color', '#f0f']]
      ],
      'hex to name': [
        'a{color:#f00}',
        [['color', 'red']]
      ],
      'name to hex': [
        'a{color:white}',
        [['color', '#fff']]
      ],
      'transparent black rgba to transparent': [
        'a{color:rgba(0,0,0,0)}',
        [['color', 'transparent']]
      ],
      'transparent non-black rgba': [
        'a{color:rgba(255,0,0,0)}',
        [['color', 'rgba(255,0,0,0)']]
      ],
      'transparent black hsla to transparent': [
        'a{color:hsla(0,0%,0%,0)}',
        [['color', 'transparent']]
      ],
      'transparent non-black hsla': [
        'a{color:rgba(240,0,0,0)}',
        [['color', 'rgba(240,0,0,0)']]
      ],
      'partial hex to name': [
        'a{color:#f00000}',
        [['color', '#f00000']]
      ],
      'partial hex further down to name': [
        'a{background:url(test.png) #f00000}',
        [['background', 'url(test.png)', '#f00000']]
      ],
      'partial name to hex': [
        'a{color:greyish}',
        [['color', 'greyish']]
      ],
      'partial name further down to hex': [
        'a{background:url(test.png) blueish}',
        [['background', 'url(test.png)', 'blueish']]
      ],
      'partial name as a suffix': [
        'a{font-family:alrightsanslp-black}',
        [['font-family', 'alrightsanslp-black']]
      ],
      'invalid rgba declaration - color': [
        'a{color:rgba(255 0 0)}',
        [['color', 'rgba(255 0 0)']]
      ],
      'invalid rgba declaration - background': [
        'a{background:rgba(255 0 0)}',
        [['background', 'rgba(255 0 0)']]
      ]
    })
  )
  .addBatch(
    propertyContext('colors - ie8 compatibility', {
      'transparent black rgba': [
        'a{color:rgba(0,0,0,0)}',
        [['color', 'rgba(0,0,0,0)']]
      ],
      'transparent non-black rgba': [
        'a{color:rgba(255,0,0,0)}',
        [['color', 'rgba(255,0,0,0)']]
      ],
      'transparent black hsla': [
        'a{color:hsla(0,0%,0%,0)}',
        [['color', 'hsla(0,0%,0%,0)']]
      ],
      'transparent non-black hsla': [
        'a{color:rgba(240,0,0,0)}',
        [['color', 'rgba(240,0,0,0)']]
      ]
    }, { compatibility: 'ie8' })
  )
  .addBatch(
    propertyContext('colors - no optimizations', {
      'long hex into short': [
        'a{color:#ff00ff}',
        [['color', '#ff00ff']]
      ],
      'short hex into name': [
        'a{color:#f00}',
        [['color', '#f00']]
      ],
      'name into hex': [
        'a{color:white}',
        [['color', 'white']]
      ]
    }, { compatibility: { properties: { colors: false } } })
  )
  .addBatch(
    propertyContext('@filter', {
      'spaces after comma': [
        'a{filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#cccccc\',endColorstr=\'#000000\', enabled=true)}',
        [['filter', 'progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#cccccc\', endColorstr=\'#000000\', enabled=true)']]
      ],
      'single Alpha filter': [
        'a{filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=80)}',
        [['filter', 'alpha(Opacity=80)']]
      ],
      'single Chroma filter': [
        'a{filter:progid:DXImageTransform.Microsoft.Chroma(color=#919191)}',
        [['filter', 'chroma(color=#919191)']]
      ],
      'multiple filters': [
        'a{filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=80) progid:DXImageTransform.Microsoft.Chroma(color=#919191)}',
        [['filter', 'progid:DXImageTransform.Microsoft.Alpha(Opacity=80)', 'progid:DXImageTransform.Microsoft.Chroma(color=#919191)']]
      ]
    })
  )
  .addBatch(
    propertyContext('@font', {
      'in shorthand': [
        'a{font:normal 13px/20px sans-serif}',
        [['font', '400', '13px', '/', '20px', 'sans-serif']]
      ],
      'in shorthand with fractions': [
        'a{font:bold .9em sans-serif}',
        [['font', '700', '.9em', 'sans-serif']]
      ],
      'with font wariant and style': [
        'a{font:normal normal normal 13px/20px sans-serif}',
        [['font', 'normal', 'normal', 'normal', '13px', '/', '20px', 'sans-serif']]
      ],
      'with mixed order of variant and style': [
        'a{font:normal 300 normal 13px/20px sans-serif}',
        [['font', 'normal', '300', 'normal', '13px', '/', '20px', 'sans-serif']]
      ],
      'with mixed normal and weight': [
        'a{font: normal small-caps 400 medium Georgia, sans-serif;}',
        [['font', 'normal', 'small-caps', '400', 'medium', 'Georgia', ',', 'sans-serif']]
      ],
      'with line height': [
        'a{font: 11px/normal sans-serif}',
        [['font', '11px', '/', 'normal', 'sans-serif']]
      ],
      'with mixed bold weight and variant #1': [
        'a{font:normal bold 17px sans-serif}',
        [['font', 'normal', '700', '17px', 'sans-serif']]
      ],
      'with mixed bold weight and variant #2': [
        'a{font:bold normal 17px sans-serif}',
        [['font', '700', 'normal', '17px', 'sans-serif']]
      ],
      'with mixed bold weight and variant #3': [
        'a{font:bold normal normal 17px sans-serif}',
        [['font', 'bold', 'normal', 'normal', '17px', 'sans-serif']] // pending #254
      ]
    })
  )
  .addBatch(
    propertyContext('@font-weight', {
      'normal to 400': [
        'a{font-weight:normal}',
        [['font-weight', '400']]
      ],
      'bold to 700': [
        'a{font-weight:bold}',
        [['font-weight', '700']]
      ],
      'any other': [
        'a{font-weight:bolder}',
        [['font-weight', 'bolder']]
      ]
    })
  )
  .addBatch(
    propertyContext('ie hacks', {
      'underscore': [
        'a{_width:101px}',
        null
      ],
      'star': [
        'a{*width:101px}',
        null
      ],
      'backslash': [
        'a{width:101px\\9}',
        [['width', '101px\\9']]
      ],
      'bang': [
        'a{color:red !ie}',
        null
      ],
      'before content': [
        'a{*width:101px;color:red!important}',
        [['color', 'red!important']]
      ]
    })
  )
  .addBatch(
    propertyContext('ie hacks in IE8 mode', {
      'underscore': [
        'a{_width:101px}',
        [['_width', '101px']]
      ],
      'star': [
        'a{*width:101px}',
        [['*width', '101px']]
      ],
      'backslash': [
        'a{width:101px\\9}',
        [['width', '101px\\9']]
      ],
      'bang': [
        'a{color:red !ie}',
        null
      ]
    }, { compatibility: 'ie8' })
  )
  .addBatch(
    propertyContext('ie hacks in IE7 mode', {
      'underscore': [
        'a{_width:101px}',
        [['_width', '101px']]
      ],
      'star': [
        'a{*width:101px}',
        [['*width', '101px']]
      ],
      'backslash': [
        'a{width:101px\\9}',
        [['width', '101px\\9']]
      ],
      'bang': [
        'a{color:red !ie}',
        [['color', 'red !ie']]
      ]
    }, { compatibility: 'ie7' })
  )
  .addBatch(
    propertyContext('important', {
      'minified': [
        'a{color:red!important}',
        [['color', 'red!important']]
      ],
      'space before !': [
        'a{color:red !important}',
        [['color', 'red!important']]
      ],
      'space after !': [
        'a{color:red! important}',
        [['color', 'red!important']]
      ]
    }, { compatibility: 'ie8' })
  )
  .addBatch(
    propertyContext('@outline', {
      'none to 0': [
        'a{outline:none}',
        [['outline', '0']]
      ],
      'any other': [
        'a{outline:10px}',
        [['outline', '10px']]
      ],
      'none and any other': [
        'a{outline:none solid 1px}',
        [['outline', 'none', 'solid', '1px']]
      ]
    })
  )
  .addBatch(
    propertyContext('rounding', {
      'pixels': [
        'a{transform:translateY(123.31135px)}',
        [['transform', 'translateY(123.311px)']]
      ],
      'percents': [
        'a{left:20.1231%}',
        [['left', '20.1231%']]
      ],
      'ems': [
        'a{left:1.1231em}',
        [['left', '1.1231em']]
      ]
    }, { roundingPrecision: 3 })
  )
  .addBatch(
    propertyContext('rounding disabled', {
      'pixels': [
        'a{transform:translateY(123.31135px)}',
        [['transform', 'translateY(123.31135px)']]
      ],
      'percents': [
        'a{left:20.1231%}',
        [['left', '20.1231%']]
      ],
      'ems': [
        'a{left:1.1231em}',
        [['left', '1.1231em']]
      ]
    }, { roundingPrecision: -1 })
  )
  .addBatch(
    propertyContext('units', {
      'pixels': [
        'a{width:0px}',
        [['width', '0']]
      ],
      'degrees': [
        'div{background:linear-gradient(0deg,red,#fff)}',
        [['background', 'linear-gradient(0deg,red,#fff)']]
      ],
      'degrees when not mixed': [
        'div{transform:rotate(0deg) skew(0deg)}',
        [['transform', 'rotate(0)', 'skew(0)']]
      ],
      'non-zero degrees when not mixed': [
        'div{transform:rotate(10deg) skew(.5deg)}',
        [['transform', 'rotate(10deg)', 'skew(.5deg)']]
      ],
      'ch': [
        'div{width:0ch;height:0ch}',
        [['width', '0'], ['height', '0']]
      ],
      'rem': [
        'div{width:0rem;height:0rem}',
        [['width', '0'], ['height', '0']]
      ],
      'vh': [
        'div{width:0vh;height:0vh}',
        [['width', '0'], ['height', '0']]
      ],
      'vm': [
        'div{width:0vm;height:0vm}',
        [['width', '0'], ['height', '0']]
      ],
      'vmax': [
        'div{width:0vmax;height:0vmax}',
        [['width', '0'], ['height', '0']]
      ],
      'vmin': [
        'div{width:0vmin;height:0vmin}',
        [['width', '0'], ['height', '0']]
      ],
      'vw': [
        'div{width:0vw;height:0vw}',
        [['width', '0'], ['height', '0']]
      ],
      'mixed units': [
        'a{margin:0em 0rem 0px 0pt}',
        [['margin', '0']]
      ],
      'mixed values #1': [
        'a{padding:10px 0em 30% 0rem}',
        [['padding', '10px', '0', '30%', '0']]
      ],
      'mixed values #2': [
        'a{padding:10ch 0vm 30vmin 0vw}',
        [['padding', '10ch', '0', '30vmin', '0']]
      ],
      'inside calc': [
        'a{font-size:calc(100% + 0px)}',
        [['font-size', 'calc(100% + 0px)']]
      ],
      'flex': [
        'a{flex: 1 0 0%}',
        [['flex', '1', '0', '0%']]
      ],
      'flex–basis': [
        'a{flex-basis:0%}',
        [['flex-basis', '0%']]
      ],
      'prefixed flex': [
        'a{-ms-flex:1 0 0px;-webkit-flex:1 0 0px;}',
        [['-ms-flex', '1', '0', '0px'], ['-webkit-flex', '1', '0', '0px']]
      ],
      'prefixed flex–basis': [
        'a{-webkit-flex-basis:0px}',
        [['-webkit-flex-basis', '0px']]
      ]
    })
  )
  .addBatch(
    propertyContext('units in compatibility mode', {
      'pixels': [
        'a{width:0px}',
        [['width', '0']]
      ],
      'mixed units': [
        'a{margin:0em 0rem 0px 0pt}',
        [['margin', '0', '0rem', '0', '0']]
      ],
      'mixed values #1': [
        'a{padding:10px 0em 30% 0rem}',
        [['padding', '10px', '0', '30%', '0rem']]
      ],
      'mixed values #2': [
        'a{padding:10ch 0vm 30vmin 0vw}',
        [['padding', '10ch', '0vm', '30vmin', '0vw']]
      ]
    }, { compatibility: 'ie8' })
  )
  .addBatch(
    propertyContext('zeros', {
      '-0 to 0': [
        'a{margin:-0}',
        [['margin', '0']]
      ],
      '-0px to 0': [
        'a{margin:-0px}',
        [['margin', '0']]
      ],
      '-0% to 0': [
        'a{width:-0%}',
        [['width', '0']]
      ],
      'missing': [
        'a{opacity:1.}',
        [['opacity', '1']]
      ],
      'multiple': [
        'a{margin:-0 -0 -0 -0}',
        [['margin', '0']]
      ],
      'keeps negative non-zero': [
        'a{margin:-0.5em}',
        [['margin', '-.5em']]
      ],
      'inside names #1': [
        'div{animation-name:test-0-bounce}',
        [['animation-name', 'test-0-bounce']]
      ],
      'inside names #2': [
        'div{animation-name:test-0bounce}',
        [['animation-name', 'test-0bounce']]
      ],
      'inside names #3': [
        'div{animation-name:test-0px}',
        [['animation-name', 'test-0px']]
      ],
      'strips leading from value': [
        'a{padding:010px 0015px}',
        [['padding', '10px', '15px']]
      ],
      'strips leading from fractions': [
        'a{margin:-0.5em}',
        [['margin', '-.5em']]
      ],
      'strips trailing from opacity': [
        'a{opacity:1.0}',
        [['opacity', '1']]
      ],
      '.0 to 0': [
        'a{margin:.0 .0 .0 .0}',
        [['margin', '0']]
      ],
      'fraction zeros': [
        'a{margin:10.0em 15.50em 10.01em 0.0em}',
        [['margin', '10em', '15.5em', '10.01em', '0']]
      ],
      'fraction zeros after rounding': [
        'a{margin:10.0010px}',
        [['margin', '10px']]
      ],
      'four zeros into one': [
        'a{margin:0 0 0 0}',
        [['margin', '0']]
      ],
      'rect zeros': [
        'a{clip:rect(0px 0px 0px 0px)}',
        [['clip', 'rect(0 0 0 0)']]
      ],
      'rect zeros with non-zero value': [
        'a{clip:rect(0.5% 0px  0px 0px)}',
        [['clip', 'rect(.5% 0 0 0)']]
      ],
      'rect zeros with commas': [
        'a{clip:rect(0px, 0px, 0px, 0px)}',
        [['clip', 'rect(0,0,0,0)']]
      ],
      'height': [
        'a{height:0%}',
        [['height', '0%']]
      ],
      'min-height': [
        'a{min-height:0%}',
        [['min-height', '0']]
      ],
      'max-height': [
        'a{max-height:0%}',
        [['max-height', '0%']]
      ]
    })
  )
  .addBatch(
    propertyContext('zeros with disabled zeroUnits', {
      '10.0em': [
        'a{margin:10.0em}',
        [['margin', '10em']]
      ],
      '0px': [
        'a{margin:0px}',
        [['margin', '0px']]
      ],
      '0px 0px': [
        'a{margin:0px 0px}',
        [['margin', '0px', '0px']]
      ],
      '0deg': [
        'div{transform:rotate(0deg) skew(0deg)}',
        [['transform', 'rotate(0deg)', 'skew(0deg)']]
      ],
      '0%': [
        'a{height:0%}',
        [['height', '0%']]
      ],
      '10%': [
        'a{width:10%}',
        [['width', '10%']]
      ]
    }, { compatibility: { properties: { zeroUnits: false } } })
  )
  .addBatch(
    propertyContext('comments', {
      'comment': [
        'a{__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0__color:red__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS1__}',
        ['__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0__', '__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS1__', ['color', 'red']]
      ]
    })
  )
  .addBatch(
    propertyContext('whitespace', {
      'stripped spaces': [
        'div{text-shadow:rgba(255,1,1,.5) 1px}',
        [['text-shadow', 'rgba(255,1,1,.5)', '1px']]
      ],
      'calc': [
        'a{width:-moz-calc(100% - 1em);width:calc(100% - 1em)}',
        [['width', '-moz-calc(100% - 1em)'], ['width', 'calc(100% - 1em)']]
      ],
      'empty body': [
        'a{}',
        null
      ],
      'in a body': [
        'a{   \n }',
        null
      ],
      'after calc()': [
        'div{margin:calc(100% - 21px) 1px}',
        [['margin', 'calc(100% - 21px)', '1px']]
      ]
    })
  )
  .addBatch(
    propertyContext('time units', {
      'positive miliseconds to seconds': [
        'div{transition-duration:500ms}',
        [['transition-duration', '.5s']]
      ],
      'negative miliseconds to seconds': [
        'div{transition-duration:-500ms}',
        [['transition-duration', '-.5s']]
      ],
      'miliseconds to seconds when results in a too long value': [
        'div{transition-duration:1515ms}',
        [['transition-duration', '1515ms']]
      ],
      'zero miliseconds to seconds': [
        'div{transition-duration:0ms}',
        [['transition-duration', '0s']]
      ],
      'positive seconds to miliseconds': [
        'div{transition-duration:0.005s}',
        [['transition-duration', '5ms']]
      ],
      'negative seconds to miliseconds': [
        'div{transition-duration:-0.005s}',
        [['transition-duration', '-5ms']]
      ],
      'seconds to miliseconds when results in a too long value': [
        'div{transition-duration:1.2s}',
        [['transition-duration', '1.2s']]
      ]
    })
  )
  .addBatch(
    propertyContext('length units', {
      'px to in': [
        'div{left:480px}',
        [['left', '480px']]
      ],
      'px to pc': [
        'div{left:32px}',
        [['left', '32px']]
      ],
      'px to pt': [
        'div{left:120px}',
        [['left', '120px']]
      ]
    })
  )
  .addBatch(
    propertyContext('length units in compatibility mode', {
      'px to in': [
        'div{left:480px}',
        [['left', '480px']]
      ],
      'px to pc': [
        'div{left:32px}',
        [['left', '32px']]
      ],
      'px to pt': [
        'div{left:120px}',
        [['left', '120px']]
      ]
    }, { compatibility: 'ie8' })
  )
  .addBatch(
    propertyContext('length units when turned on', {
      'positive px to in': [
        'div{left:480px}',
        [['left', '5in']]
      ],
      'negative px to in': [
        'div{left:-96px}',
        [['left', '-1in']]
      ],
      'positive px to pc': [
        'div{left:32px}',
        [['left', '2pc']]
      ],
      'negative px to pc': [
        'div{left:-160px}',
        [['left', '-10pc']]
      ],
      'positive px to pt': [
        'div{left:120px}',
        [['left', '90pt']]
      ],
      'negative px to pt': [
        'div{left:-120px}',
        [['left', '-90pt']]
      ],
      'in calc': [
        'div{left:calc(100% - 480px)}',
        [['left', 'calc(100% - 5in)']]
      ],
      'in transform': [
        'div{transform:translateY(32px)}',
        [['transform', 'translateY(2pc)']]
      ]
    }, { compatibility: { properties: { shorterLengthUnits: true } } })
  )
  .addBatch(
    propertyContext('length units when turned on selectively', {
      'px to in': [
        'div{left:480px}',
        [['left', '30pc']]
      ],
      'px to pc': [
        'div{left:32px}',
        [['left', '2pc']]
      ],
      'px to pt': [
        'div{left:120px}',
        [['left', '120px']]
      ]
    }, { compatibility: { properties: { shorterLengthUnits: true }, units: { in: false, pt: false } } })
  )
  .export(module);
