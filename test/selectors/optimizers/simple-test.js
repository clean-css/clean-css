var vows = require('vows');
var assert = require('assert');

var Tokenizer = require('../../../lib/selectors/tokenizer');
var SimpleOptimizer = require('../../../lib/selectors/optimizers/simple');
var Compatibility = require('../../../lib/utils/compatibility');

function selectorContext(group, specs, options) {
  var context = {};
  options = options || {};
  options.compatibility = new Compatibility(options.compatibility).toOptions();

  function optimized(selectors) {
    return function (source) {
      var tokens = new Tokenizer().toTokens(source);
      new SimpleOptimizer(options).optimize(tokens);

      assert.deepEqual(tokens[0] ? tokens[0].selector : null, selectors);
    };
  }

  for (var name in specs) {
    context['selector - ' + group + ' - ' + name] = {
      topic: specs[name][0],
      optimized: optimized(specs[name][1])
    };
  }

  return context;
}

function propertyContext(group, specs, options) {
  var context = {};
  options = options || {};
  options.compatibility = new Compatibility(options.compatibility).toOptions();

  function optimized(selectors) {
    return function (source) {
      var tokens = new Tokenizer().toTokens(source);
      new SimpleOptimizer(options).optimize(tokens);

      assert.deepEqual(tokens[0].body, selectors);
    };
  }

  for (var name in specs) {
    context['property - ' + group + ' - ' + name] = {
      topic: specs[name][0],
      optimized: optimized(specs[name][1])
    };
  }

  return context;
}

vows.describe(SimpleOptimizer)
  .addBatch(
    selectorContext('default', {
      'optimized': [
        'a{}',
        ['a']
      ],
      'whitespace': [
        ' div  > span{}',
        ['div>span']
      ],
      'line breaks': [
        ' div  >\n\r\n span{}',
        ['div>span']
      ],
      '+html': [
        '*+html .foo{display:inline}',
        null
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
        ['.bar']
      ]
    }, { compatibility: 'ie8' })
  )
  .addBatch(
    selectorContext('ie7', {
      '+html': [
        '*+html .foo{display:inline}',
        ['*+html .foo']
      ],
      '+html - complex': [
        '*+html .foo,.bar{display:inline}',
        ['*+html .foo', '.bar']
      ]
    }, { compatibility: 'ie7' })
  )
  .addBatch(
    propertyContext('@background', {
      'none to 0 0': [
        'a{background:none}',
        ['background:0 0']
      ],
      'transparent to 0 0': [
        'a{background:transparent}',
        ['background:0 0']
      ],
      'any other': [
        'a{background:red}',
        ['background:red']
      ]
    })
  )
  .addBatch(
    propertyContext('@border-*-radius', {
      'spaces around /': [
        'a{border-top-left-radius:2em  /  1em}',
        ['border-top-left-radius:2em/1em']
      ],
      'symmetric expanded to shorthand': [
        'a{border-top-left-radius:1em 2em 3em 4em / 1em 2em 3em 4em}',
        ['border-top-left-radius:1em 2em 3em 4em']
      ]
    })
  )
  .addBatch(
    propertyContext('@box-shadow', {
      'four zeros': [
        'a{box-shadow:0 0 0 0}',
        ['box-shadow:0 0']
      ],
      'four zeros in vendor prefixed': [
        'a{-webkit-box-shadow:0 0 0 0}',
        ['-webkit-box-shadow:0 0']
      ]
    })
  )
  .addBatch(
    propertyContext('colors', {
      'rgb to hex': [
        'a{color:rgb(255,254,253)}',
        ['color:#fffefd']
      ],
      'rgba not to hex': [
        'a{color:rgba(255,254,253,.5)}',
        ['color:rgba(255,254,253,.5)']
      ],
      'hsl to hex': [
        'a{color:hsl(240,100%,50%)}',
        ['color:#00f']
      ],
      'hsla not to hex': [
        'a{color:hsla(240,100%,50%,.5)}',
        ['color:hsla(240,100%,50%,.5)']
      ],
      'long hex to short hex': [
        'a{color:#ff00ff}',
        ['color:#f0f']
      ],
      'hex to name': [
        'a{color:#f00}',
        ['color:red']
      ],
      'name to hex': [
        'a{color:white}',
        ['color:#fff']
      ],
      'transparent black rgba to transparent': [
        'a{color:rgba(0,0,0,0)}',
        ['color:transparent']
      ],
      'transparent non-black rgba': [
        'a{color:rgba(255,0,0,0)}',
        ['color:rgba(255,0,0,0)']
      ],
      'transparent black hsla to transparent': [
        'a{color:hsla(0,0%,0%,0)}',
        ['color:transparent']
      ],
      'transparent non-black hsla': [
        'a{color:rgba(240,0,0,0)}',
        ['color:rgba(240,0,0,0)']
      ]
    })
  )
  .addBatch(
    propertyContext('colors - ie8 compatibility', {
      'transparent black rgba': [
        'a{color:rgba(0,0,0,0)}',
        ['color:rgba(0,0,0,0)']
      ],
      'transparent non-black rgba': [
        'a{color:rgba(255,0,0,0)}',
        ['color:rgba(255,0,0,0)']
      ],
      'transparent black hsla': [
        'a{color:hsla(0,0%,0%,0)}',
        ['color:hsla(0,0%,0%,0)']
      ],
      'transparent non-black hsla': [
        'a{color:rgba(240,0,0,0)}',
        ['color:rgba(240,0,0,0)']
      ]
    }, { compatibility: 'ie8' })
  )
  .addBatch(
    propertyContext('@filter', {
      'spaces after comma': [
        'a{filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#cccccc\',endColorstr=\'#000000\', enabled=true)}',
        ['filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#cccccc\', endColorstr=\'#000000\', enabled=true)']
      ],
      'single Alpha filter': [
        'a{filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=80)}',
        ['filter:alpha(Opacity=80)']
      ],
      'single Chroma filter': [
        'a{filter:progid:DXImageTransform.Microsoft.Chroma(color=#919191)}',
        ['filter:chroma(color=#919191)']
      ],
      'multiple filters': [
        'a{filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=80) progid:DXImageTransform.Microsoft.Chroma(color=#919191)}',
        ['filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=80) progid:DXImageTransform.Microsoft.Chroma(color=#919191)']
      ]
    })
  )
  .addBatch(
    propertyContext('@font', {
      'in shorthand': [
        'a{font:normal 13px/20px sans-serif}',
        ['font:400 13px/20px sans-serif']
      ],
      'in shorthand with fractions': [
        'a{font:bold .9em sans-serif}',
        ['font:700 .9em sans-serif']
      ],
      'with font wariant and style': [
        'a{font:normal normal normal 13px/20px sans-serif}',
        ['font:normal normal normal 13px/20px sans-serif']
      ],
      'with mixed order of variant and style': [
        'a{font:normal 300 normal 13px/20px sans-serif}',
        ['font:normal 300 normal 13px/20px sans-serif']
      ]
    })
  )
  .addBatch(
    propertyContext('@font-weight', {
      'normal to 400': [
        'a{font-weight:normal}',
        ['font-weight:400']
      ],
      'bold to 700': [
        'a{font-weight:bold}',
        ['font-weight:700']
      ],
      'any other': [
        'a{font-weight:bolder}',
        ['font-weight:bolder']
      ]
    })
  )
  .addBatch(
    propertyContext('ie hacks', {
      'underscore': [
        'a{_width:100px}',
        []
      ],
      'star': [
        'a{*width:100px}',
        []
      ]
    })
  )
  .addBatch(
    propertyContext('ie hacks in compatibility mode', {
      'underscore': [
        'a{_width:100px}',
        ['_width:100px']
      ],
      'star': [
        'a{*width:100px}',
        ['*width:100px']
      ]
    }, { compatibility: 'ie8' })
  )
  .addBatch(
    propertyContext('important', {
      'minified': [
        'a{color:red!important}',
        ['color:red!important']
      ],
      'space before !': [
        'a{color:red !important}',
        ['color:red!important']
      ],
      'space after !': [
        'a{color:red! important}',
        ['color:red!important']
      ]
    }, { compatibility: 'ie8' })
  )
  .addBatch(
    propertyContext('@outline', {
      'none to 0': [
        'a{outline:none}',
        ['outline:0']
      ],
      'any other': [
        'a{outline:10px}',
        ['outline:10px']
      ]
    })
  )
  .addBatch(
    propertyContext('rounding', {
      'pixels': [
        'a{transform:translateY(123.31135px)}',
        ['transform:translateY(123.311px)']
      ],
      'percents': [
        'a{left:20.1231%}',
        ['left:20.1231%']
      ],
      'ems': [
        'a{left:1.1231em}',
        ['left:1.1231em']
      ]
    }, { roundingPrecision: 3 })
  )
  .addBatch(
    propertyContext('units', {
      'pixels': [
        'a{width:0px}',
        ['width:0']
      ],
      'mixed units': [
        'a{margin:0em 0rem 0px 0pt}',
        ['margin:0']
      ],
      'mixed vales': [
        'a{padding:10px 0em 30% 0rem}',
        ['padding:10px 0 30% 0']
      ]
    })
  )
  .addBatch(
    propertyContext('units in compatibility mode', {
      'pixels': [
        'a{width:0px}',
        ['width:0']
      ],
      'mixed units': [
        'a{margin:0em 0rem 0px 0pt}',
        ['margin:0 0rem 0 0']
      ],
      'mixed vales': [
        'a{padding:10px 0em 30% 0rem}',
        ['padding:10px 0 30% 0rem']
      ]
    }, { compatibility: 'ie8' })
  )
  .addBatch(
    propertyContext('zeros', {
      '-0 to 0': [
        'a{margin:-0}',
        ['margin:0']
      ],
      '-0px to 0': [
        'a{margin:-0px}',
        ['margin:0']
      ],
      'missing': [
        'a{opacity:1.}',
        ['opacity:1']
      ],
      'multiple': [
        'a{margin:-0 -0 -0 -0}',
        ['margin:0']
      ],
      'keeps negative non-zero': [
        'a{margin:-0.5em}',
        ['margin:-.5em']
      ],
      'strips leading from value': [
        'a{padding:010px 0015px}',
        ['padding:10px 15px']
      ],
      'strips leading from fractions': [
        'a{margin:-0.5em}',
        ['margin:-.5em']
      ],
      'strips trailing from opacity': [
        'a{opacity:1.0}',
        ['opacity:1']
      ],
      '.0 to 0': [
        'a{margin:.0 .0 .0 .0}',
        ['margin:0']
      ],
      'fraction zeros': [
        'a{margin:10.0em 15.50em 10.01em 0.0em}',
        ['margin:10em 15.5em 10.01em 0']
      ],
      'fraction zeros after rounding': [
        'a{margin:10.0010px}',
        ['margin:10px']
      ],
      'four zeros into one': [
        'a{margin:0 0 0 0}',
        ['margin:0']
      ],
      'rect zeros': [
        'a{clip:rect(0px 0px 0px 0px)}',
        ['clip:rect(0 0 0 0)']
      ],
      'rect zeros with non-zero value': [
        'a{clip:rect(0.5% 0px  0px 0px)}',
        ['clip:rect(.5% 0 0 0)']
      ],
      'rect zeros with commas': [
        'a{clip:rect(0px, 0px, 0px, 0px)}',
        ['clip:rect(0,0,0,0)']
      ],
    })
  )
  .export(module);
