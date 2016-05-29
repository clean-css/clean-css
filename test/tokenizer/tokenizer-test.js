var vows = require('vows');
var assert = require('assert');
var tokenize = require('../../lib/tokenizer/tokenize');
var SourceTracker = require('../../lib/utils/source-tracker');

function tokenizerContext(name, specs) {
  var ctx = {};

  function tokenized(target) {
    return function (source) {
      var tokens = tokenize(source, {
        options: {},
        sourceTracker: new SourceTracker(),
        warnings: []
      });

      assert.deepEqual(tokens, target);
    };
  }

  for (var test in specs) {
    ctx[test] = {
      topic: specs[test][0],
      tokenized: tokenized(specs[test][1])
    };
  }

  return ctx;
}

vows.describe(tokenize)
  .addBatch(
    tokenizerContext('basic', {
      'no content': [
        '',
        []
      ],
      'an escaped content': [
        '__ESCAPED_COMMENT_CLEAN_CSS0__',
        []
      ],
      'an escaped content followed by a break': [
        '__ESCAPED_COMMENT_CLEAN_CSS0__\n',
        []
      ],
      'an empty selector': [
        'a{}',
        [
          ['selector', [['a']], []]
        ]
      ],
      'an empty selector with whitespace': [
        'a{ \n  }',
        [
          ['selector', [['a']], []]
        ]
      ],
      'a selector with a property': [
        'a{color:red}',
        [
          ['selector', [['a']], [[['color'], ['red']]]]
        ]
      ],
      'a selector with a multi value property': [
        'a{margin:0px 2px 1px}',
        [
          ['selector', [['a']], [[['margin'], ['0px'], ['2px'], ['1px']]]]
        ]
      ],
      'a selector with whitespace': [
        'a {color:red;\n\ndisplay :\r\n  block }',
        [
          ['selector', [['a']], [[['color'], ['red']], [['display'], ['block']]]]
        ]
      ],
      'a selector with suffix whitespace': [
        'div a{color:red\r\n}',
        [
          ['selector', [['div a']], [[['color'], ['red']]]]
        ]
      ],
      'a selector with whitespace in functions': [
        'a{color:rgba( 255, 255, 0, 0.5  )}',
        [
          ['selector', [['a']], [[['color'], ['rgba( 255, 255, 0, 0.5  )']]]]
        ]
      ],
      'a selector with functions and no whitespace breaks': [
        'a{background:rgba(255,255,0,0.5)url(test.png)repeat no-repeat}',
        [
          ['selector', [['a']], [[['background'], ['rgba(255,255,0,0.5)'], ['url(test.png)'], ['repeat'], ['no-repeat']]]]
        ]
      ],
      'a selector with escaped url and no whitespace breaks': [
        'a{background:__ESCAPED_URL_CLEAN_CSS0__50px/25%}',
        [
          ['selector', [['a']], [[['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], ['50px'], ['/'], ['25%']]]]
        ]
      ],
      'a selector with empty properties': [
        'a{color:red; ; ; ;}',
        [
          ['selector', [['a']], [[['color'], ['red']]]]
        ]
      ],
      'a selector with quoted attribute': [
        'a[data-kind=__ESCAPED_FREE_TEXT_CLEAN_CSS0__]{color:red}',
        [
          ['selector', [['a[data-kind=__ESCAPED_FREE_TEXT_CLEAN_CSS0__]']], [[['color'], ['red']]]]
        ]
      ],
      'a selector with escaped quote': [
        '.this-class\\\'s-got-an-apostrophe{}',
        [
          ['selector', [['.this-class\\\'s-got-an-apostrophe']], []]
        ]
      ],
      'a double selector': [
        'a,\n\ndiv.class > p {color:red}',
        [
          ['selector', [['a'], ['div.class > p']], [[['color'], ['red']]]]
        ]
      ],
      'two selectors': [
        'a{color:red}div{color:blue}',
        [
          ['selector', [['a']], [[['color'], ['red']]]],
          ['selector', [['div']], [[['color'], ['blue']]]],
        ]
      ],
      'two comments and a selector separated by newline': [
        '__ESCAPED_COMMENT_CLEAN_CSS0__\n__ESCAPED_COMMENT_CLEAN_CSS1__\ndiv{}',
        [
          ['selector', [['div']], []]
        ]
      ],
      'two properties wrapped between comments': [
        'div{__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0__color:red__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS1__}',
        [
          ['selector', [['div']], ['__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0__', '__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS1__', [['color'], ['red']]]]
        ]
      ],
      'multiple values wrapped between comments #1': [
        'div{background:__ESCAPED_URL_CLEAN_CSS0__,__ESCAPED_COMMENT_CLEAN_CSS0__red}',
        [
          ['selector', [['div']], ['__ESCAPED_COMMENT_CLEAN_CSS0__', [['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], [','], ['red']]]]
        ]
      ],
      'multiple values wrapped between comments #2': [
        'div{background:__ESCAPED_URL_CLEAN_CSS0__,red__ESCAPED_COMMENT_CLEAN_CSS0__}',
        [
          ['selector', [['div']], ['__ESCAPED_COMMENT_CLEAN_CSS0__', [['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], [','], ['red']]]]
        ]
      ],
      'multiple values wrapped between comments #3': [
        'div{background:__ESCAPED_URL_CLEAN_CSS0__,rgba(0,0,0,__ESCAPED_COMMENT_CLEAN_CSS0__0.1)}',
        [
          ['selector', [['div']], ['__ESCAPED_COMMENT_CLEAN_CSS0__', [['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], [','], ['rgba(0,0,0,0.1)']]]]
        ]
      ],
      'multiple values wrapped between comments #4': [
        'div{background:__ESCAPED_URL_CLEAN_CSS0__,rgba(0,0,0,__ESCAPED_COMMENT_CLEAN_CSS0__0.1)}',
        [
          ['selector', [['div']], ['__ESCAPED_COMMENT_CLEAN_CSS0__', [['background'], ['__ESCAPED_URL_CLEAN_CSS0__'], [','], ['rgba(0,0,0,0.1)']]]]
        ]
      ],
      'pseudoselector after an argument one': [
        'div:nth-child(2n):not(.test){}',
        [
          ['selector', [['div:nth-child(2n):not(.test)']], []]
        ]
      ],
      '@apply': [
        'a{@apply(--rule);}',
        [
          [
            'selector',
            [['a']],
            [['at-rule', '@apply(--rule)']]
          ]
        ]
      ],
      '@apply with whitespace': [
        'a{  @apply(--rule); }',
        [
          [
            'selector',
            [['a']],
            [['at-rule', '@apply(--rule)']]
          ]
        ]
      ],
      'media query': [
        '@media (min-width:980px){}',
        [
          ['block', ['@media (min-width:980px)'], []]
        ]
      ],
      'media query with selectors': [
        '@media (min-width:980px){a{color:red}}',
        [
          ['block', ['@media (min-width:980px)'], [
            ['selector', [['a']], [[['color'], ['red']]]]
          ]]
        ]
      ],
      'media query spanning more than one chunk': [
        '@media only screen and (max-width:1319px) and (min--moz-device-pixel-ratio:1.5),only screen and (max-width:1319px) and (-moz-min-device-pixel-ratio:1.5){a{color:#000}}',
        [
          ['block', ['@media only screen and (max-width:1319px) and (min--moz-device-pixel-ratio:1.5),only screen and (max-width:1319px) and (-moz-min-device-pixel-ratio:1.5)'], [
            ['selector', [['a']], [[['color'], ['#000']]]]
          ]]
        ]
      ],
      'font-face': [
        '@font-face{font-family: fontName;font-size:12px}',
        [
          ['flat-block', ['@font-face'], [[['font-family'], ['fontName']], [['font-size'], ['12px']]]]
        ]
      ],
      'charset': [
        '@charset \'utf-8\';a{color:red}',
        [
          ['at-rule', ['@charset \'utf-8\';']],
          ['selector', [['a']], [[['color'], ['red']]]]
        ]
      ],
      'charset after a line break': [
        '\n@charset \n\'utf-8\';',
        [
          ['at-rule', ['@charset \n\'utf-8\';']]
        ]
      ],
      'keyframes with quoted attribute': [
        '@keyframes __ESCAPED_FREE_TEXT_CLEAN_CSS0__{}',
        [
          ['block', ['@keyframes __ESCAPED_FREE_TEXT_CLEAN_CSS0__'], []]
        ]
      ],
      'variables': [
        'a{border:var(--width)var(--style)var(--color)}',
        [
          [
            'selector',
            [['a']],
            [[['border'], ['var(--width)'], ['var(--style)'], ['var(--color)']]]
          ]
        ]
      ],
      'variable declarations': [
        ':root{--color:var(--otherColor)}',
        [
          [
            'selector',
            [[':root']],
            [[['--color'], ['var(--otherColor)']]]
          ]
        ]
      ],
      '! important': [
        'a{color:red! important}',
        [
          [
            'selector',
            [['a']],
            [[['color'], ['red!important']]]
          ]
        ]
      ],
      ' !important': [
        'a{color:red !important}',
        [
          [
            'selector',
            [['a']],
            [[['color'], ['red!important']]]
          ]
        ]
      ],
      ' ! important': [
        'a{color:red ! important}',
        [
          [
            'selector',
            [['a']],
            [[['color'], ['red!important']]]
          ]
        ]
      ],
      '_:-ms-lang flat block': [
        '_:-ms-lang(x),@-ms-viewport{color:red}',
        [
          [
            'flat-block',
            ['_:-ms-lang(x),@-ms-viewport'],
            [[['color'], ['red']]]
          ]
        ]
      ]
    })
  )
  .addBatch(
    tokenizerContext('Polymer mixins', {
      'flat value': [
        'a{--my-toolbar-color:red}',
        [
          ['selector', [['a']], [[['--my-toolbar-color'], ['red']]]]
        ]
      ],
      'block value': [
        'a{--my-toolbar:{color:red;width:100%}}',
        [
          [
            'selector',
            [['a']],
            [[['--my-toolbar'], [
              [['color'], ['red']],
              [['width'], ['100%']]
            ]]]
          ]
        ]
      ],
      'mixed block value': [
        'a{display:block;--my-toolbar:{color:red;width:100%};color:blue}',
        [
          [
            'selector',
            [['a']],
            [
              [['display'], ['block']],
              [['--my-toolbar'], [[['color'], ['red']], [['width'], ['100%']]]],
              [['color'], ['blue']]
            ]
          ]
        ]
      ]
    })
  )
  .addBatch(
    tokenizerContext('multiple values', {
      'comma - no spaces': [
        'a{background:no-repeat,no-repeat}',
        [
          ['selector', [['a']], [[['background'], ['no-repeat'], [','], ['no-repeat']]]]
        ]
      ],
      'comma - one spaces': [
        'a{background:no-repeat, no-repeat}',
        [
          ['selector', [['a']], [[['background'], ['no-repeat'], [','], ['no-repeat']]]]
        ]
      ],
      'comma - two spaces': [
        'a{background:no-repeat , no-repeat}',
        [
          ['selector', [['a']], [[['background'], ['no-repeat'], [','], ['no-repeat']]]]
        ]
      ],
      'comma - inside function': [
        'a{background:rgba(0,0,0,0)}',
        [
          ['selector', [['a']], [[['background'], ['rgba(0,0,0,0)']]]]
        ]
      ],
      'forward slash - no spaces': [
        'a{border-radius:5px/4px}',
        [
          ['selector', [['a']], [[['border-radius'], ['5px'], ['/'], ['4px']]]]
        ]
      ],
      'forward slash - one spaces': [
        'a{border-radius:5px /4px}',
        [
          ['selector', [['a']], [[['border-radius'], ['5px'], ['/'], ['4px']]]]
        ]
      ],
      'forward slash - two spaces': [
        'a{border-radius:5px / 4px}',
        [
          ['selector', [['a']], [[['border-radius'], ['5px'], ['/'], ['4px']]]]
        ]
      ],
      'forward slash - inside function': [
        'a{width:calc(5px/4px)}',
        [
          ['selector', [['a']], [[['width'], ['calc(5px/4px)']]]]
        ]
      ],
    })
  )
  .addBatch(
    tokenizerContext('broken', {
      'missing end brace': [
        'a{display:block',
        [
          ['selector', [['a']], []]
        ]
      ],
      'missing end brace in the middle': [
        'body{color:red;a{color:blue;}',
        [
          ['selector', [['body']], [[['color'], ['red']]]]
        ]
      ]
    })
  )
  .export(module);
