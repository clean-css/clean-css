var vows = require('vows');
var optimizerContext = require('../../test-helper').optimizerContext;

vows.describe('level 2 optimizer')
  .addBatch(
    optimizerContext('all optimizations', {
      'adjacent': [
        'a{display:none}a{display:none;visibility:hidden}',
        'a{display:none;visibility:hidden}'
      ],
      'overriding by !important': [
        'a{margin:0}a{margin:0!important}',
        'a{margin:0!important}'
      ],
      'shorthands and no space after closing brace': [
        '.a{background:rgba(0,0,0,0)url(//example.com/a.jpg)}',
        '.a{background:url(//example.com/a.jpg) rgba(0,0,0,0)}'
      ],
      'repeated': [
        'a{color:red;color:red}',
        'a{color:red}'
      ],
      'units': [
        '.one{width:1px;width:1rem;display:block}.two{color:red}.one{width:2px;width:1.1rem}',
        '.one{display:block;width:1.1rem}.two{color:red}'
      ],
      'backslash hacks': [
        '.block{color:red\\9;color:#0f0\\0}',
        ''
      ],
      'quoted font family only': [
        '.block{font:60px/64px "Garamond WF"}',
        '.block{font:60px/64px "Garamond WF"}'
      ],
      'overrides hex color only': [
        '.block{color:#696969;color:rgba(68,68,68,0.8);color:#444c}',
        '.block{color:rgba(68,68,68,.8);color:#444c}'
      ],
      'skips merging when function withing function is used for compatibility reasons': [
        '.block{transform:translateX(-107%);transform:translateX(calc(-100% - 20px))}',
        '.block{transform:translateX(-107%);transform:translateX(calc(-100% - 20px))}'
      ],
      'keeps right order after merging into a shorthand': [
        '.block{border-color:red;background-color:#000;color:#fff;border-width:5px;border-style:solid;font-style:italic;border-top:0;border-right:0;border-left:0}',
        '.block{background-color:#000;color:#fff;border:5px solid red;font-style:italic;border-top:0;border-right:0;border-left:0}'
      ],
      'treats calc as valid length value': [
        '.block{border:calc(1px) solid #000;outline:#000 solid calc(1px)}',
        '.block{border:calc(1px) solid #000;outline:#000 solid calc(1px)}'
      ],
      'calc() function as animation delay': [
        '.block{animation:0.3s linear calc(0.04s * 2) backwards name}',
        '.block{animation:.3s linear calc(.04s * 2) backwards name}'
      ],
      'calc() function as animation duration': [
        '.block{animation:calc(0.3s * 2) linear 500ms backwards name}',
        '.block{animation:calc(.3s * 2) linear .5s backwards name}'
      ],
      'default value of transition-delay is default': [
        '.block-1{transition:opacity .3s linear,height 0s ease .3s}.block-2{transition:opacity .3s linear,height 1s ease .3s}',
        '.block-1{transition:opacity .3s linear,height 0s .3s}.block-2{transition:opacity .3s linear,height 1s .3s}'
      ],
      'rolling multiplex component into shorthand #1': [
        '.block{transition-property:transform,margin-left;transition-delay:0ms;transition-duration:375ms;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1)}',
        '.block{transition:transform 375ms cubic-bezier(0.4,0,0.2,1),margin-left 375ms cubic-bezier(0.4,0,0.2,1)}'
      ],
      'rolling multiplex component into shorthand #2': [
        '.block{animation-name:show,showAgain;animation-duration:1s,1.7s;animation-timing-function:linear,linear;animation-fill-mode:forwards,forwards;animation-delay:0s,2.5s;animation-iteration-count:1,1;animation-direction:normal,normal;animation-play-state:running,running}',
        '.block{animation:1s linear forwards show,1.7s linear 2.5s forwards showAgain}'
      ],
      'takes dynamic properties (with variables) into account when reordering properties': [
        ':root{--border-opacity:1}.block{border-color:#3182ce;border-color:rgba(49,130,206,var(--border-opacity));border-top-color:transparent}',
        ':root{--border-opacity:1}.block{border-color:#3182ce;border-color:rgba(49,130,206,var(--border-opacity));border-top-color:transparent}'
      ],
      'requires shorthand with all components of same type to have all same values for merging into longhand #1': [
        '.block{border-color:currentcolor currentcolor red;border-image:none 100%/1/0 stretch;border-width:0 0 1px;border-style:none none solid}',
        '.block{border-color:currentcolor currentcolor red;border-image:none 100%/1/0 stretch;border-width:0 0 1px;border-style:none none solid}'
      ],
      'requires shorthand with all components of same type to have all same values for merging into longhand #2': [
        '.block{border-color:red red red red;border-image:none 100%/1/0 stretch;border-width:1px 1px;border-style:solid solid solid}',
        '.block{border:1px solid red;border-image:none 100%/1/0 stretch}'
      ],
      'requires shorthand with all components of same type to have all same values for merging into longhand #3': [
        '.block{border-color:red red red red;border-width:1px 1px;border-style:solid solid solid;border-image:none 100%/1/0 stretch}',
        '.block{border:1px solid red;border-image:none 100%/1/0 stretch}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('with all optimizations', {
      'handles clip correctly which has no `canOverride` set': [
        '.block-1{clip:auto}.block-1{clip:auto;width:auto}',
        '.block-1{clip:auto;width:auto}'
      ]
    }, { level: { 2: { all: true } } })
  )
  .addBatch(
    optimizerContext('colors with hex alpha support', {
      'overrides all colors': [
        '.block{color:#696969;color:rgba(68,68,68,0.8);color:#444c}',
        '.block{color:#444c}'
      ]
    }, { compatibility: '+colors.hexAlpha', level: 2 })
  )
  .addBatch(
    optimizerContext('space separated colors', {
      'keeps hsl colors': [
        '.block{border:1px solid hsl(0deg 0% 85%)}',
        '.block{border:1px solid hsl(0deg 0% 85%)}'
      ],
      'keeps hsla colors - with fraction opacity': [
        '.block{border:1px solid hsla(0deg 0% 85% / .5)}',
        '.block{border:1px solid hsla(0deg 0% 85% / .5)}'
      ],
      'keeps hsla colors - with percentage opacity': [
        '.block{border:1px solid hsla(0deg 0% 85% / 50%)}',
        '.block{border:1px solid hsla(0deg 0% 85% / 50%)}'
      ],
      'keeps rgb colors': [
        '.block{border:1px solid rgb(20 20 20)}',
        '.block{border:1px solid rgb(20 20 20)}'
      ],
      'keeps rgba colors - with fraction opacity': [
        '.block{border:1px solid rgba(20 20 20 / .5)}',
        '.block{border:1px solid rgba(20 20 20 / .5)}'
      ],
      'keeps rgba colors - with percentage opacity': [
        '.block{border:1px solid rgba(20 20 20 / 50%)}',
        '.block{border:1px solid rgba(20 20 20 / 50%)}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('limit rule merging', {
      'adjacent with as many rules as limit': [
        '.block--1{color:red}.block--2{color:red}.block--3{color:red}',
        '.block--1,.block--2,.block--3{color:red}'
      ],
      'adjacent with extra rule': [
        '.block--1{color:red}.block--2{color:red}.block--3{color:red}.block--4{color:red}',
        '.block--1,.block--2,.block--3{color:red}.block--4{color:red}'
      ],
      'adjacent with extra two rules': [
        '.block--1{color:red}.block--2{color:red}.block--3{color:red}.block--4{color:red}.block--5{color:red}',
        '.block--1,.block--2,.block--3{color:red}.block--4,.block--5{color:red}'
      ],
      'adjacent with extra three rules': [
        '.block--1{color:red}.block--2{color:red}.block--3{color:red}.block--4{color:red}.block--5{color:red}.block--6{color:red}',
        '.block--1,.block--2,.block--3{color:red}.block--4,.block--5,.block--6{color:red}'
      ],
      'non-adjacent': [
        '.block--1{color:red}.other-block--1{width:0}.block--2{color:red}.other-block--2{height:0}.block--3{color:red}.other-block--3{opacity:0}.block--4{color:red}',
        '.block--1{color:red}.other-block--1{width:0}.block--2,.block--3,.block--4{color:red}.other-block--2{height:0}.other-block--3{opacity:0}'
      ]
    }, { compatibility: { selectors: { mergeLimit: 3 } }, level: { 2: { all: true } } })
  )
  .addBatch(
    optimizerContext('in ie9 compatibility mode', {
      'overrides hex color only': [
        '.block{color:#696969;color:rgba(68,68,68,.8);color:#444c}',
        '.block{color:rgba(68,68,68,.8);color:#444c}'
      ]
    }, { compatibility: 'ie9', level: 2 })
  )
  .addBatch(
    optimizerContext('in ie8 compatibility mode', {
      'backslash hacks': [
        '.block{color:red\\9;color:#0f0\\0}',
        '.block{color:red\\9;color:#0f0\\0}'
      ],
      'overrides hex color only': [
        '.block{color:#696969;color:rgba(68,68,68,.8);color:#444c}',
        '.block{color:#696969;color:rgba(68,68,68,.8);color:#444c}'
      ]
    }, { compatibility: 'ie8', level: 2 })
  )
  .addBatch(
    optimizerContext('level 2 off', {
      'repeated' : [
        'a{color:red;color:red}',
        'a{color:red;color:red}'
      ]
    }, { level: 1 })
  )
  .addBatch(
    optimizerContext('@media', {
      'empty': [
        '@media (min-width:980px){}',
        ''
      ],
      'whitespace': [
        ' @media   ( min-width:  980px ){}',
        ''
      ],
      'body': [
        '@media (min-width:980px){\na\n{color:red}}',
        '@media (min-width:980px){a{color:red}}'
      ],
      'multiple': [
        '@media screen, print, (min-width:980px){a{color:red}}',
        '@media screen,print,(min-width:980px){a{color:red}}'
      ],
      'nested once': [
        '@media screen { @media print { a{color:red} } }',
        '@media screen{@media print{a{color:red}}}'
      ],
      'nested twice': [
        '@media screen { @media print { @media (min-width:980px) { a{color:red} } } }',
        '@media screen{@media print{@media (min-width:980px){a{color:red}}}}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('@font-face', {
      'rebuilding': [
        '@font-face{font-family:PublicVintage;src:url(/PublicVintage.otf) format(\'opentype\')}',
        '@font-face{font-family:PublicVintage;src:url(/PublicVintage.otf) format(\'opentype\')}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('colors', {
      'four value colors': [
        '.block{border:1px solid #0001}',
        '.block{border:1px solid #0001}'
      ],
      'eight value colors': [
        '.block{border:1px solid #00000001}',
        '.block{border:1px solid #00000001}'
      ],
      'hsl color with fractions': [
        '.block{border:1px solid hsl(0, 0%, 65.5%)}',
        '.block{border:1px solid hsl(0,0%,65.5%)}'
      ],
      'hsla color with fractions': [
        '.block{border:1px solid hsla(0, 0%, 65.5%, 0.2)}',
        '.block{border:1px solid hsla(0,0%,65.5%,.2)}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('unit merging', {
      'font-size': [
        'div{font-size:1rem;font-size:16px}',
        'div{font-size:16px}'
      ],
      'height': [
        'div{height:1rem;height:16px}',
        'div{height:16px}'
      ],
      'width': [
        'div{width:1rem;width:16px}',
        'div{width:16px}'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('variables', {
      'skip processing properties with variable values - border - 1st value': [
        '.one{border:var(--color) solid 1px}',
        '.one{border:var(--color) solid 1px}'
      ],
      'skip processing properties with variable values - border - 2nd value': [
        '.one{border:red var(--style) 1px}',
        '.one{border:red var(--style) 1px}'
      ],
      'skip processing properties with variable values - border - 3rd value': [
        '.one{border:red solid var(--width)}',
        '.one{border:red solid var(--width)}'
      ],
      'keeps variable as border-left only value': [
        ':root{--border-test:1px solid red}.u-test{border-left:var(--border-test)!important}',
        ':root{--border-test:1px solid red}.u-test{border-left:var(--border-test)!important}'
      ],
      'keeps variable as border-left two of three values': [
        ':root{--a:1px;--b:red}.u-test{border-left:var(--a) solid var(--b)!important}',
        ':root{--a:1px;--b:red}.u-test{border-left:var(--a) solid var(--b)!important}'
      ],
      'variables with whitespace as value': [
        'a{--test: }',
        'a{--test: }'
      ],
      'multiple variables with whitespace as value': [
        'a{--test1: ;--test2: }',
        'a{--test1: ;--test2: }'
      ]
    }, { level: 2 })
  )
  .addBatch(
    optimizerContext('disabled removal of empty elements', {
      'no body': [
        'a{}',
        'a{}'
      ],
      'body with whitespace': [
        'a{\n}',
        'a{}'
      ],
      'body with comment': [
        'a{/* a comment */}',
        'a{}'
      ],
      '@media query': [
        '@media screen{}',
        '@media screen{}'
      ],
      'optimization result': [
        'a{color:red}div{color:red}',
        'a,div{color:red}div{}'
      ]
    }, { level: { 1: { removeEmpty: false }, 2: { removeEmpty: false } } })
  )
  .addBatch(
    optimizerContext('skipping properties', {
      'merging': [
        '.block{background:url(test.png);background-repeat:repeat-y;font:16px serif;font-weight:700;margin:10px;margin-top:12px}',
        '.block{background:url(test.png);background-repeat:repeat-y;font:16px serif;font-weight:700;margin:12px 10px 10px}'
      ],
      'overriding': [
        '.block{background-repeat:repeat-y;background:url(test.png);font-weight:700;font:16px serif;margin-top:12px;margin:10px}',
        '.block{background-repeat:repeat-y;background:url(test.png);font-weight:700;font:16px serif;margin:10px}'
      ],
      'rule restructuring': [
        '.block-1{background:url(test.png)}.block-2{background-repeat:repeat-y;background:url(test.png)}',
        '.block-1{background:url(test.png)}.block-2{background-repeat:repeat-y;background:url(test.png)}'
      ],
      'rule merging': [
        '.block-1{background:url(test.png)}.block-2{background:url(test.png)}',
        '.block-1,.block-2{background:url(test.png)}'
      ]
    }, { level: { 2: { restructureRules: true, skipProperties: ['background', 'font'] } } })
  )
  .export(module);
