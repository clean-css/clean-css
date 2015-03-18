var vows = require('vows');
var assert = require('assert');
var Tokenizer = require('../../lib/selectors/tokenizer');
var SourceTracker = require('../../lib/utils/source-tracker');
var SourceReader = require('../../lib/utils/source-reader');
var InputSourceMapTracker = require('../../lib/utils/input-source-map-tracker');

var fs = require('fs');
var path = require('path');
var inputMapPath = path.join('test', 'fixtures', 'source-maps', 'styles.css.map');
var inputMap = fs.readFileSync(inputMapPath, 'utf-8');

function sourceMapContext(group, specs) {
  var ctx = {};

  function tokenizedContext(target) {
    return function (tokenized) {
      assert.deepEqual(tokenized, target);
    };
  }

  function toTokens(source) {
    return function () {
      return new Tokenizer({
        sourceTracker: sourceTracker,
        sourceReader: sourceReader,
        inputSourceMapTracker: inputSourceMapTracker,
        options: {}
      }, true).toTokens(source);
    };
  }

  for (var test in specs) {
    var target = specs[test][1];
    var sourceTracker = new SourceTracker();
    var sourceReader = new SourceReader();
    var inputSourceMapTracker = new InputSourceMapTracker({
      options: { inliner: {} },
      errors: {},
      sourceTracker: sourceTracker
    });

    ctx[group + ' ' + test] = {
      topic: typeof specs[test][0] == 'function' ?
        specs[test][0] :
        toTokens(specs[test][0]),
      tokenized: tokenizedContext(target)
    };
  }

  return ctx;
}

vows.describe('source-maps/analyzer')
  .addBatch(
    sourceMapContext('selectors', {
      'single': [
        'a{}',
        [
          [
            'selector',
            [['a', 1, 0, undefined]],
            []
          ]
        ]
      ],
      'double': [
        'a,div{}',
        [
          [
            'selector',
            [
              ['a', 1, 0, undefined],
              ['div', 1, 2, undefined]
            ],
            []
          ]
        ]
      ],
      'double with whitespace': [
        ' a,\n\ndiv{}',
        [
          [
            'selector',
            [['a', 1, 1, undefined], ['\n\ndiv', 3, 0, undefined]],
            []
          ]
        ]
      ],
      'triple': [
        'a,div,p{}',
        [
          [
            'selector',
            [['a', 1, 0, undefined], ['div', 1, 2, undefined], ['p', 1, 6, undefined]],
            []
          ]
        ]
      ],
      'triple with whitespace': [
        ' a,\n\ndiv\na,\n p{}',
        [
          [
            'selector',
            [['a', 1, 1, undefined], ['\n\ndiv\na', 3, 0, undefined], ['\n p', 5, 1, undefined]],
            []
          ]
        ]
      ],
      'two': [
        'a{}div{}',
        [
          [
            'selector',
            [['a', 1, 0, undefined]],
            []
          ],
          [
            'selector',
            [['div', 1, 3, undefined]],
            []
          ]
        ]
      ],
      'three with whitespace and breaks': [
        'a {}\n\ndiv{}\n \n  p{}',
        [
          [
            'selector',
            [['a ', 1, 0, undefined]],
            []
          ],
          [
            'selector',
            [['div', 3, 0, undefined]],
            []
          ],
          [
            'selector',
            [['p', 5, 2, undefined]],
            []
          ]
        ]
      ]
    })
  )
  .addBatch(
    sourceMapContext('properties', {
      'single': [
        'a{color:red}',
        [
          [
            'selector',
            [['a', 1, 0, undefined]],
            [['color:red', 1, 2, undefined]]
          ]
        ]
      ],
      'double': [
        'a{color:red;border:none}',
        [
          [
            'selector',
            [['a', 1, 0, undefined]],
            [
              ['color:red', 1, 2, undefined],
              ['border:none', 1, 12, undefined]
            ]
          ]
        ]
      ],
      'triple with whitespace': [
        'a{color:red;\nborder:\nnone;\n\n  display:block}',
        [
          [
            'selector',
            [['a', 1, 0, undefined]],
            [
              ['color:red', 1, 2, undefined],
              ['border:none', 2, 0, undefined],
              ['display:block', 5, 2, undefined]
            ]
          ]
        ]
      ],
      'two declarations': [
        'a{color:red}div{color:blue}',
        [
          [
            'selector',
            [['a', 1, 0, undefined]],
            [['color:red', 1, 2, undefined]]
          ],
          [
            'selector',
            [['div', 1, 12, undefined]],
            [['color:blue', 1, 16, undefined]]
          ]
        ]
      ],
      'two declarations with whitespace': [
        'a{color:red}\n div{color:blue}',
        [
          [
            'selector',
            [['a', 1, 0, undefined]],
            [['color:red', 1, 2, undefined]]
          ],
          [
            'selector',
            [['div', 2, 1, undefined]],
            [['color:blue', 2, 5, undefined]]
          ]
        ]
      ],
      'two declarations with whitespace and ending semicolon': [
        'a{color:red;\n}\n div{color:blue}',
        [
          [
            'selector',
            [['a', 1, 0, undefined]],
            [['color:red', 1, 2, undefined]]
          ],
          [
            'selector',
            [['div', 3, 1, undefined]],
            [['color:blue', 3, 5, undefined]]
          ]
        ]
      ]
    })
  )
  .addBatch(
    sourceMapContext('at rules', {
      '@import': [
        'a{}@import \n"test.css";\n\na{color:red}',
        [
          [
            'selector',
            [['a', 1, 0, undefined]],
            []
          ],
          [
            'at-rule',
            ['@import \n"test.css";', 1, 3, undefined]
          ],
          [
            'selector',
            [['a', 4, 0, undefined]],
            [['color:red', 4, 2, undefined]]
          ]
        ]
      ],
      '@charset': [
        '@charset "utf-8";a{color:red}',
        [
          [
            'at-rule',
            ['@charset "utf-8";', 1, 0, undefined]
          ],
          [
            'selector',
            [['a', 1, 18, undefined]],
            [['color:red', 1, 20, undefined]]
          ]
        ]
      ]
    })
  )
  .addBatch(
    sourceMapContext('blocks', {
      '@media - simple': [
        '@media (min-width:980px){a{color:red}}',
        [
          [
            'block',
            ['@media (min-width:980px)', 1, 0, undefined],
            [
              [
                'selector',
                [['a', 1, 25, undefined]],
                [['color:red', 1, 27, undefined]]
              ]
            ]
          ]
        ]
      ],
      '@media - with whitespace': [
        '@media (\nmin-width:980px)\n{\na{\ncolor:\nred}p{}}',
        [
          [
            'block',
            ['@media (\nmin-width:980px)', 1, 0, undefined],
            [
              [
                'selector',
                [['a', 4, 0, undefined]],
                [['color:red', 5, 0, undefined]]
              ],
              [
                'selector',
                [['p', 6, 4, undefined]],
                []
              ]
            ]
          ]
        ]
      ],
      '@media - stray whitespace at end': [
        '@media (min-width:980px){a{color:red} }p{color:red}',
        [
          [
            'block',
            ['@media (min-width:980px)', 1, 0, undefined],
            [
              [
                'selector',
                [['a', 1, 25, undefined]],
                [['color:red', 1, 27, undefined]]
              ]
            ]
          ],
          [
            'selector',
            [['p', 1, 39, undefined]],
            [['color:red', 1, 41, undefined]]
          ]
        ]
      ],
      '@font-face': [
        '@font-face{font-family: "Font";\nsrc: url("font.ttf");\nfont-weight: normal;font-style: normal}a{}',
        [
          [
            'flat-block',
            ['@font-face', 1, 0, undefined],
            [
              ['font-family:"Font"', 1, 11, undefined],
              ['src:url("font.ttf")', 2, 0, undefined],
              ['font-weight:normal', 3, 0, undefined],
              ['font-style:normal', 3, 20, undefined]
            ]
          ],
          [
            'selector',
            [['a', 3, 39, undefined]],
            []
          ]
        ]
      ],
      '@font-face with breaks': [
        '\n@font-face\n{font-family: "Font"}',
        [
          [
            'flat-block',
            ['@font-face', 2, 0, undefined],
            [
              ['font-family:"Font"', 3, 1, undefined]
            ]
          ]
        ]
      ]
    })
  )
  .addBatch(
    sourceMapContext('escaped content', {
      'top-level': [
        '__ESCAPED_COMMENT_CLEAN_CSS0(0, 5)__a{}',
        [
          [
            'selector',
            [['a', 1, 5, undefined]],
            []
          ]
        ]
      ],
      'top-level with line breaks': [
        '__ESCAPED_COMMENT_CLEAN_CSS0(2, 5)__a{}',
        [
          [
            'selector',
            [['a', 3, 5, undefined]],
            []
          ]
        ]
      ],
      'in selectors': [
        'div[data-type=__ESCAPED_FREE_TEXT_CLEAN_CSS0(1,3)__],div[data-id=__ESCAPED_FREE_TEXT_CLEAN_CSS1(0,7)__]{color:red}',
        [
          [
            'selector',
            [
              ['div[data-type=__ESCAPED_FREE_TEXT_CLEAN_CSS0(1,3)__]', 1, 0, undefined],
              ['div[data-id=__ESCAPED_FREE_TEXT_CLEAN_CSS1(0,7)__]', 2, 5, undefined]
            ],
            [['color:red', 2, 26, undefined]]
          ]
        ]
      ],
      'in properties': [
        'div{__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0(2,5)__background:url(__ESCAPED_URL_CLEAN_CSS0(0,20)__);color:blue}a{font-family:__ESCAPED_FREE_TEXT_CLEAN_CSS0(1,3)__;color:red}',
        [
          [
            'selector',
            [['div', 1, 0, undefined]],
            [
              ['__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0(2,5)__', 1, 4, undefined],
              ['background:url(__ESCAPED_URL_CLEAN_CSS0(0,20)__)', 3, 5, undefined],
              ['color:blue', 3, 42, undefined]
            ]
          ],
          [
            'selector',
            [['a', 3, 53, undefined]],
            [
              ['font-family:__ESCAPED_FREE_TEXT_CLEAN_CSS0(1,3)__', 3, 55, undefined],
              ['color:red', 4, 4, undefined]
            ]
          ]
        ]
      ],
      'in at-rules': [
        '@charset __ESCAPED_FREE_TEXT_CLEAN_CSS0(1, 5)__;div{}',
        [
          [
            'at-rule',
            ['@charset __ESCAPED_FREE_TEXT_CLEAN_CSS0(1, 5)__;', 1, 0, undefined]
          ],
          [
            'selector',
            [['div', 2, 7, undefined]],
            []
          ]
        ]
      ],
      'in blocks': [
        '@media (__ESCAPED_COMMENT_CLEAN_CSS0(2, 1)__min-width:980px){a{color:red}}',
        [
          [
            'block',
            ['@media (__ESCAPED_COMMENT_CLEAN_CSS0(2, 1)__min-width:980px)', 1, 0, undefined],
            [
              [
                'selector',
                [['a', 3, 18, undefined]],
                [['color:red', 3, 20, undefined]]
              ]
            ]
          ]
        ]
      ]
    })
  )
  .addBatch(
    sourceMapContext('sources', {
      'one': [
        function () {
          var tracker = new SourceTracker();
          var reader = new SourceReader();
          var inputTracker = new InputSourceMapTracker({ options: { inliner: {} }, errors: {}, sourceTracker: tracker });
          var tokenizer = new Tokenizer({ sourceTracker: tracker, sourceReader: reader, inputSourceMapTracker: inputTracker, options: {} }, true);

          var data = tracker.store('one.css', 'a{}');
          return tokenizer.toTokens(data);
        },
        [
          [
            'selector',
            [['a', 1, 0, 'one.css']],
            []
          ]
        ]
      ],
      'two': [
        function () {
          var tracker = new SourceTracker();
          var reader = new SourceReader();
          var inputTracker = new InputSourceMapTracker({ options: { inliner: {} }, errors: {}, sourceTracker: tracker });
          var tokenizer = new Tokenizer({ sourceTracker: tracker, sourceReader: reader, inputSourceMapTracker: inputTracker, options: {} }, true);

          var data1 = tracker.store('one.css', 'a{}');
          var data2 = tracker.store('two.css', '\na{color:red}');
          return tokenizer.toTokens(data1 + data2);
        },
        [
          [
            'selector',
            [['a', 1, 0, 'one.css']],
            []
          ],
          [
            'selector',
            [['a', 2, 0, 'two.css']],
            [['color:red', 2, 2, 'two.css']]
          ]
        ]
      ]
    })
  )
  .addBatch(
    sourceMapContext('input source maps', {
      'one': [
        function () {
          var tracker = new SourceTracker();
          var reader = new SourceReader();
          var inputTracker = new InputSourceMapTracker({ options: { inliner: {}, sourceMap: inputMap, options: {} }, errors: {}, sourceTracker: tracker });
          inputTracker.track('', function () {});

          var tokenizer = new Tokenizer({ sourceTracker: tracker, sourceReader: reader, inputSourceMapTracker: inputTracker, options: {} }, true);
          return tokenizer.toTokens('div > a {\n  color: red;\n}');
        },
        [
          [
            'selector',
            [['div > a ', 1, 4, 'styles.less']],
            [['color:red', 2, 2, 'styles.less']]
          ]
        ]
      ]
    })
  )
  .export(module);
