var vows = require('vows');
var assert = require('assert');
var Tokenizer = require('../../lib/selectors/tokenizer');

function sourceMapContext(group, specs) {
  var ctx = {};

  function tokenizedContext(target, index) {
    return function (tokenized) {
      assert.deepEqual(tokenized[index], target);
    };
  }

  for (var test in specs) {
    for (var i = 0; i < specs[test][1].length; i++) {
      var target = specs[test][1][i];

      ctx[group + ' ' + test + ' - #' + (i + 1)] = {
        topic: new Tokenizer({}, false, true).toTokens(specs[test][0]),
        tokenized: tokenizedContext(target, i)
      };
    }
  }

  return ctx;
}

vows.describe('source-maps/analyzer')
  .addBatch(
    sourceMapContext('selectors', {
      'single': [
        'a{}',
        [{
          kind: 'selector',
          value: [{ value: 'a', metadata: { line: 1, column: 1 } }],
          body: []
        }]
      ],
      'double': [
        'a,div{}',
        [{
          kind: 'selector',
          value: [
            { value: 'a', metadata: { line: 1, column: 1 } },
            { value: 'div', metadata: { line: 1, column: 3 } }
          ],
          body: []
        }]
      ],
      'double with whitespace': [
        ' a,\n\ndiv{}',
        [{
          kind: 'selector',
          value: [
            { value: ' a', metadata: { line: 1, column: 2 } },
            { value: '\n\ndiv', metadata: { line: 3, column: 1 } }
          ],
          body: []
        }]
      ],
      'triple': [
        'a,div,p{}',
        [{
          kind: 'selector',
          value: [
            { value: 'a', metadata: { line: 1, column: 1 } },
            { value: 'div', metadata: { line: 1, column: 3 } },
            { value: 'p', metadata: { line: 1, column: 7 } }
          ],
          body: []
        }]
      ],
      'triple with whitespace': [
        ' a,\n\ndiv\na,\n p{}',
        [{
          kind: 'selector',
          value: [
            { value: ' a', metadata: { line: 1, column: 2 } },
            { value: '\n\ndiv\na', metadata: { line: 3, column: 1 } },
            { value: '\n p', metadata: { line: 5, column: 2 } }
          ],
          body: []
        }]
      ],
      'two': [
        'a{}div{}',
        [
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 1, column: 1 } }],
            body: []
          },
          {
            kind: 'selector',
            value: [{ value: 'div', metadata: { line: 1, column: 4 } }],
            body: []
          }
        ]
      ],
      'three with whitespace and breaks': [
        'a {}\n\ndiv{}\n \n  p{}',
        [
          {
            kind: 'selector',
            value: [{ value: 'a ', metadata: { line: 1, column: 1 } }],
            body: []
          },
          {
            kind: 'selector',
            value: [{ value: '\n\ndiv', metadata: { line: 3, column: 1 } }],
            body: []
          },
          {
            kind: 'selector',
            value: [{ value: '\n \n  p', metadata: { line: 5, column: 3 } }],
            body: []
          }
        ]
      ]
    })
  )
  .addBatch(
    sourceMapContext('properties', {
      'single': [
        'a{color:red}',
        [{
          kind: 'selector',
          value: [{ value: 'a', metadata: { line: 1, column: 1 } }],
          body: [{ value: 'color:red', metadata: { line: 1, column: 3 } }]
        }]
      ],
      'double': [
        'a{color:red;border:none}',
        [{
          kind: 'selector',
          value: [{ value: 'a', metadata: { line: 1, column: 1 } }],
          body: [
            { value: 'color:red', metadata: { line: 1, column: 3 } },
            { value: 'border:none', metadata: { line: 1, column: 13 } }
          ]
        }]
      ],
      'triple with whitespace': [
        'a{color:red;\nborder:\nnone;\n\n  display:block}',
        [{
          kind: 'selector',
          value: [{ value: 'a', metadata: { line: 1, column: 1 } }],
          body: [
            { value: 'color:red', metadata: { line: 1, column: 3 } },
            { value: 'border:none', metadata: { line: 2, column: 1 } },
            { value: 'display:block', metadata: { line: 5, column: 3 } }
          ]
        }]
      ],
      'two declarations': [
        'a{color:red}div{color:blue}',
        [
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 1, column: 1 } }],
            body: [{ value: 'color:red', metadata: { line: 1, column: 3 } }]
          },
          {
            kind: 'selector',
            value: [{ value: 'div', metadata: { line: 1, column: 13 } }],
            body: [{ value: 'color:blue', metadata: { line: 1, column: 17 } }]
          }
        ]
      ],
      'two declarations with whitespace': [
        'a{color:red}\n div{color:blue}',
        [
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 1, column: 1 } }],
            body: [{ value: 'color:red', metadata: { line: 1, column: 3 } }]
          },
          {
            kind: 'selector',
            value: [{ value: '\n div', metadata: { line: 2, column: 2 } }],
            body: [{ value: 'color:blue', metadata: { line: 2, column: 6 } }]
          }
        ]
      ],
      'two declarations with whitespace and ending semicolon': [
        'a{color:red;\n}\n div{color:blue}',
        [
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 1, column: 1 } }],
            body: [{ value: 'color:red', metadata: { line: 1, column: 3 } }]
          },
          {
            kind: 'selector',
            value: [{ value: '\n div', metadata: { line: 3, column: 2 } }],
            body: [{ value: 'color:blue', metadata: { line: 3, column: 6 } }]
          }
        ]
      ]
    })
  )
  .addBatch(
    sourceMapContext('at rules', {
      '@import': [
        'a{}@import \n"test.css";\n\na{color:red}',
        [
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 1, column: 1 } }],
            body: []
          },
          {
            kind: 'at-rule',
            value: '@import \n"test.css";',
            metadata: { line: 1, column: 4 }
          },
          {
            kind: 'selector',
            value: [{ value: '\n\na', metadata: { line: 4, column: 1 } }],
            body: [{ value: 'color:red', metadata: { line: 4, column: 3 } }]
          }
        ]
      ],
      '@charset': [
        '@charset "utf-8";a{color:red}',
        [
          {
            kind: 'at-rule',
            value: '@charset "utf-8";',
            metadata: { line: 1, column: 1 }
          },
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 1, column: 19 } }],
            body: [{ value: 'color:red', metadata: { line: 1, column: 21 } }]
          }
        ]
      ]
    })
  )
  .addBatch(
    sourceMapContext('blocks', {
      '@media - simple': [
        '@media (min-width:980px){a{color:red}}',
        [
          {
            kind: 'block',
            value: '@media (min-width:980px)',
            metadata: { line: 1, column: 1 },
            isFlatBlock: false,
            body: [{
              kind: 'selector',
              value: [{ value: 'a', metadata: { line: 1, column: 26 } }],
              body: [{ value: 'color:red', metadata: { line: 1, column: 28 } }]
            }]
          }
        ]
      ],
      '@media - with whitespace': [
        '@media (\nmin-width:980px)\n{\na{\ncolor:\nred}p{}}',
        [
          {
            kind: 'block',
            value: '@media (\nmin-width:980px)',
            metadata: { line: 1, column: 1 },
            isFlatBlock: false,
            body: [
              {
                kind: 'selector',
                value: [{ value: '\na', metadata: { line: 3, column: 1 } }],
                body: [{ value: 'color:red', metadata: { line: 4, column: 1 } }]
              },
              {
                kind: 'selector',
                value: [{ value: 'p', metadata: { line: 5, column: 5 } }],
                body: []
              }
            ]
          }
        ]
      ],
      '@font-face': [
        '@font-face{font-family: "Font";\nsrc: url("font.ttf");\nfont-weight: normal;font-style: normal}a{}',
        [
          {
            kind: 'block',
            value: '@font-face',
            metadata: { line: 1, column: 1 },
            isFlatBlock: true,
            body: [
              { value: 'font-family:"Font"', metadata: { line: 1, column: 12 } },
              { value: 'src:url("font.ttf")', metadata: { line: 2, column: 1 } },
              { value: 'font-weight:normal', metadata: { line: 3, column: 1 } },
              { value: 'font-style:normal', metadata: { line: 3, column: 21 } }
            ]
          },
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 3, column: 40 } }],
            body: []
          }
        ]
      ]
    })
  )
  .addBatch(
    sourceMapContext('escaped content', {
      'top-level': [
        '__ESCAPED_COMMENT_CLEAN_CSS0(0, 5)__a{}',
        [
          {
            kind: 'text',
            value: '__ESCAPED_COMMENT_CLEAN_CSS0(0, 5)__'
          },
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 1, column: 6 } }],
            body: []
          }
        ]
      ],
      'top-level with line breaks': [
        '__ESCAPED_COMMENT_CLEAN_CSS0(2, 5)__a{}',
        [
          {
            kind: 'text',
            value: '__ESCAPED_COMMENT_CLEAN_CSS0(2, 5)__'
          },
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 3, column: 6 } }],
            body: []
          }
        ]
      ],
      'in selectors': [
        'div[data-type=__ESCAPED_FREE_TEXT_CLEAN_CSS0(1,3)__],div[data-id=__ESCAPED_FREE_TEXT_CLEAN_CSS1(0,7)__]{color:red}',
        [{
          kind: 'selector',
          value: [
            { value: 'div[data-type=__ESCAPED_FREE_TEXT_CLEAN_CSS0(1,3)__]', metadata: { line: 1, column: 1 } },
            { value: 'div[data-id=__ESCAPED_FREE_TEXT_CLEAN_CSS1(0,7)__]', metadata: { line: 2, column: 6 } }
          ],
          body: [{ value: 'color:red', metadata: { line: 2, column: 27 } }]
        }]
      ],
      'in properties': [
        'div{__ESCAPED_COMMENT_CLEAN_CSS0(2,5)__background:url(__ESCAPED_URL_CLEAN_CSS0(0,20)__);color:blue}a{font-family:__ESCAPED_FREE_TEXT_CLEAN_CSS0(1,3)__;color:red}',
        [
          {
            kind: 'selector',
            value: [{ value: 'div', metadata: { line: 1, column: 1 } }],
            body: [
              { value: '__ESCAPED_COMMENT_CLEAN_CSS0(2,5)__', metadata: { line: 1, column: 5 }},
              { value: 'background:url(__ESCAPED_URL_CLEAN_CSS0(0,20)__)', metadata: { line: 3, column: 6 } },
              { value: 'color:blue', metadata: { line: 3, column: 43 } }
            ]
          },
          {
            kind: 'selector',
            value: [{ value: 'a', metadata: { line: 3, column: 54 } }],
            body: [
              { value: 'font-family:__ESCAPED_FREE_TEXT_CLEAN_CSS0(1,3)__', metadata: { line: 3, column: 56 } },
              { value: 'color:red', metadata: { line: 4, column: 5 } }
            ]
          }
        ]
      ],
      'in at-rules': [
        '@charset __ESCAPED_FREE_TEXT_CLEAN_CSS0(1, 5)__;div{}',
        [
          {
            kind: 'at-rule',
            value: '@charset __ESCAPED_FREE_TEXT_CLEAN_CSS0(1, 5)__;',
            metadata: { line: 1, column: 1 }
          },
          {
            kind: 'selector',
            value: [{ value: 'div', metadata: { line: 2, column: 8 } }],
            body: []
          }
        ]
      ],
      'in blocks': [
        '@media (__ESCAPED_COMMENT_CLEAN_CSS0(2, 1)__min-width:980px){a{color:red}}',
        [
          {
            kind: 'block',
            value: '@media (__ESCAPED_COMMENT_CLEAN_CSS0(2, 1)__min-width:980px)',
            metadata: { line: 1, column: 1 },
            isFlatBlock: false,
            body: [{
              kind: 'selector',
              value: [{ value: 'a', metadata: { line: 3, column: 19 } }],
              body: [{ value: 'color:red', metadata: { line: 3, column: 21 } }]
            }]
          }
        ]
      ]
    })
  )
  .export(module);
