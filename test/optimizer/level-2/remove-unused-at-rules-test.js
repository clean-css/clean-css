var vows = require('vows');
var optimizerContext = require('../../test-helper').optimizerContext;

vows.describe('remove unused at rules')
  .addBatch(
    optimizerContext('@counter-style', {
      'one unused declaration': [
        '@counter-style test{system:fixed;symbols:url(one.png) url(two.png);suffix:" "}',
        ''
      ],
      'one used declaration in list-style': [
        '@counter-style test{system:fixed;symbols:url(one.png) url(two.png);suffix:" "}.block{list-style:test}',
        '@counter-style test{system:fixed;symbols:url(one.png) url(two.png);suffix:" "}.block{list-style:test}'
      ],
      'one used declaration in list-style-type': [
        '@counter-style test{system:fixed;symbols:url(one.png) url(two.png);suffix:" "}.block{list-style-type:test}',
        '@counter-style test{system:fixed;symbols:url(one.png) url(two.png);suffix:" "}.block{list-style-type:test}'
      ],
      'one used declaration in nested list-style-type': [
        '@counter-style test{system:fixed;symbols:url(one.png) url(two.png);suffix:" "}@media screen{.block{list-style-type:test}}',
        '@counter-style test{system:fixed;symbols:url(one.png) url(two.png);suffix:" "}@media screen{.block{list-style-type:test}}'
      ],
      'one used declaration and one unused': [
        '@counter-style test{system:fixed;symbols:url(one.png) url(two.png);suffix:" "}@counter-style test2{system:fixed;symbols:url(one.png) url(two.png);suffix:" "}.block{list-style-type:test}',
        '@counter-style test{system:fixed;symbols:url(one.png) url(two.png);suffix:" "}.block{list-style-type:test}'
      ],
      'one used declaration with !important': [
        '@counter-style test{system:fixed;symbols:url(one.png) url(two.png);suffix:" "}.block{list-style:test!important}',
        '@counter-style test{system:fixed;symbols:url(one.png) url(two.png);suffix:" "}.block{list-style:test!important}'
      ]
    }, { level: { 2: { removeUnusedAtRules: true } } })
  )
  .addBatch(
    optimizerContext('@font-face', {
      'one unused declaration': [
        '@font-face{font-family:test}',
        ''
      ],
      'one used declaration in font-family': [
        '@font-face{font-family:test}.block{font-family:test}',
        '@font-face{font-family:test}.block{font-family:test}'
      ],
      'one used quoted declaration in font-family': [
        '@font-face{font-family:"test test"}.block{font-family:"test test"}',
        '@font-face{font-family:"test test"}.block{font-family:"test test"}'
      ],
      'one used declaration in font-family with different case': [
        '@font-face{font-family:test}.block{font-family:Test}',
        '@font-face{font-family:test}.block{font-family:Test}'
      ],
      'one used quoted declaration in font-family with different quotes': [
        '@font-face{font-family:"test test"}.block{font-family:\'test test\'}',
        '@font-face{font-family:"test test"}.block{font-family:\'test test\'}'
      ],
      'one used declaration in multi-valued font-family': [
        '@font-face{font-family:test}.block{font-family:Arial,test,sans-serif}',
        '@font-face{font-family:test}.block{font-family:Arial,test,sans-serif}'
      ],
      'one used declaration in font': [
        '@font-face{font-family:test}.block{font:16px test}',
        '@font-face{font-family:test}.block{font:16px test}'
      ],
      'one used declaration in multi-valued font': [
        '@font-face{font-family:test}.block{font:16px Arial,test,sans-serif}',
        '@font-face{font-family:test}.block{font:16px Arial,test,sans-serif}'
      ],
      'one used declaration in nested font': [
        '@font-face{font-family:test}@media screen{.block{font:16px test}}',
        '@font-face{font-family:test}@media screen{.block{font:16px test}}'
      ],
      'one used declaration in multi-valued font with different case': [
        '@font-face{font-family:test}.block{font:16px Arial,Test,sans-serif}',
        '@font-face{font-family:test}.block{font:16px Arial,Test,sans-serif}'
      ],
      'one used declaration and one unused': [
        '@font-face{font-family:test}@font-face{font-family:test2}.block{font:16px test}',
        '@font-face{font-family:test}.block{font:16px test}'
      ],
      'one used with !important': [
        '@font-face{font-family:test}.block{font:16px test!important}',
        '@font-face{font-family:test}.block{font:16px test!important}'
      ],
      'one used as font-family with !important': [
        '@font-face{font-family:test}.block{font-family:test!important}',
        '@font-face{font-family:test}.block{font-family:test!important}'
      ],
      'one used declaration in another @font-face': [
        '@font-face{font-family:test;font-weight:normal}@font-face{font-family:test;font-weight:bold}',
        ''
      ]
    }, { level: { 2: { removeUnusedAtRules: true } } })
  )
  .addBatch(
    optimizerContext('@keyframes', {
      'one unused declaration': [
        '@keyframes test{0%{opacity:0}100%{opacity:1}}',
        ''
      ],
      'one used declaration in animation-name': [
        '@keyframes test{0%{opacity:0}100%{opacity:1}}.block{animation-name:test}',
        '@keyframes test{0%{opacity:0}100%{opacity:1}}.block{animation-name:test}'
      ],
      'one used declaration in multi-value animation-name': [
        '@keyframes test{0%{opacity:0}100%{opacity:1}}.block{animation-name:custom,test}',
        '@keyframes test{0%{opacity:0}100%{opacity:1}}.block{animation-name:custom,test}'
      ],
      'one used declaration in animation': [
        '@keyframes test{0%{opacity:0}100%{opacity:1}}.block{animation:1s ease-in test}',
        '@keyframes test{0%{opacity:0}100%{opacity:1}}.block{animation:1s ease-in test}'
      ],
      'one used declaration in multi-value animation': [
        '@keyframes test{0%{opacity:0}100%{opacity:1}}.block{animation:1s ease-in custom,2s ease-out test}',
        '@keyframes test{0%{opacity:0}100%{opacity:1}}.block{animation:1s ease-in custom,2s ease-out test}'
      ],
      'one used declaration in vendor prefixed animation': [
        '@keyframes test{0%{opacity:0}100%{opacity:1}}.block{-moz-animation:1s ease-in test}',
        '@keyframes test{0%{opacity:0}100%{opacity:1}}.block{-moz-animation:1s ease-in test}'
      ],
      'one used vendor prefixed declaration in animation': [
        '@-webkit-keyframes test{0%{opacity:0}100%{opacity:1}}.block{animation:1s ease-in test}',
        '@-webkit-keyframes test{0%{opacity:0}100%{opacity:1}}.block{animation:1s ease-in test}'
      ],
      'one used in nested animation': [
        '@keyframes test{0%{opacity:0}100%{opacity:1}}@media screen{.block{animation:1s ease-in test}}',
        '@keyframes test{0%{opacity:0}100%{opacity:1}}@media screen{.block{animation:1s ease-in test}}'
      ],
      'one used declaration and one unused': [
        '@keyframes test{0%{opacity:0}100%{opacity:1}}@keyframes test2{0%{opacity:0}100%{opacity:1}}.block{animation-name:test}',
        '@keyframes test{0%{opacity:0}100%{opacity:1}}.block{animation-name:test}'
      ],
      'one used with !important': [
        '@keyframes test{0%{opacity:0}100%{opacity:1}}.block{animation:1s ease-in test!important}',
        '@keyframes test{0%{opacity:0}100%{opacity:1}}.block{animation:1s ease-in test!important}'
      ]
    }, { level: { 2: { removeUnusedAtRules: true } } })
  )
  .addBatch(
    optimizerContext('@namespace', {
      'one unused declaration': [
        '@namespace svg url(http://www.w3.org/2000/svg);',
        ''
      ],
      'one used declaration in scope': [
        '@namespace svg url(http://www.w3.org/2000/svg);svg|.block{color:red}',
        '@namespace svg url(http://www.w3.org/2000/svg);svg|.block{color:red}'
      ],
      'one used declaration in attribute': [
        '@namespace svg url(http://www.w3.org/2000/svg);.block[svg|title=test]{color:red}',
        '@namespace svg url(http://www.w3.org/2000/svg);.block[svg|title=test]{color:red}'
      ],
      'one used declaration in nested attribute': [
        '@namespace svg url(http://www.w3.org/2000/svg);@media screen{.block[svg|title=test]{color:red}}',
        '@namespace svg url(http://www.w3.org/2000/svg);@media screen{.block[svg|title=test]{color:red}}'
      ],
      'many declaration in one rule': [
        '@namespace svg url(http://www.w3.org/2000/svg);@namespace xlink url(http://www.w3.org/2000/xlink);.block[svg|title=test],xlink|.block{color:red}',
        '@namespace svg url(http://www.w3.org/2000/svg);@namespace xlink url(http://www.w3.org/2000/xlink);.block[svg|title=test],xlink|.block{color:red}'
      ],
      'one used declaration and one unused': [
        '@namespace svg url(http://www.w3.org/2000/svg);@namespace xlink url(http://www.w3.org/2000/xlink);svg|.block{color:red}',
        '@namespace svg url(http://www.w3.org/2000/svg);svg|.block{color:red}'
      ]
    }, { level: { 2: { removeUnusedAtRules: true } } })
  )
  .export(module);
