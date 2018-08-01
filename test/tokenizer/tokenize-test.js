var vows = require('vows');
var assert = require('assert');
var tokenize = require('../../lib/tokenizer/tokenize');
var inputSourceMapTracker = require('../../lib/reader/input-source-map-tracker');

var fs = require('fs');
var path = require('path');
var inputMapPath = path.join('test', 'fixtures', 'source-maps', 'styles.css.map');
var inputMap = fs.readFileSync(inputMapPath, 'utf-8');

function tokenizerContext(group, specs) {
  var ctx = {};

  function tokenizedContext(target) {
    return function (tokenized) {
      assert.deepEqual(tokenized, target);
    };
  }

  function toTokens(source) {
    return function () {
      return tokenize(source, {
        inputSourceMapTracker: inputSourceMapTracker(),
        options: {},
        warnings: []
      });
    };
  }

  for (var test in specs) {
    var target = specs[test][1];

    ctx[group + ' ' + test] = {
      topic: toTokens(specs[test][0]),
      tokenized: tokenizedContext(target)
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
      'a comment': [
        '/* comment */',
        [
          [
            'comment',
            '/* comment */',
            [
              [1, 0, undefined]
            ]
          ]
        ]
      ],
      'a comment followed by a break': [
        '/* comment */\n',
        [
          [
            'comment',
            '/* comment */',
            [
              [1, 0, undefined]
            ]
          ]
        ]
      ],
      'a comment with forward slash as first character': [
        '/*/ comment */',
        [
          [
            'comment',
            '/*/ comment */',
            [
              [1, 0, undefined]
            ]
          ]
        ]
      ],
      'a rule between two comments': [
        '/* comment 1 */*/* comment 2 */{}',
        [
          [
            'comment',
            '/* comment 1 */',
            [
              [1, 0, undefined]
            ]
          ],
          [
            'comment',
            '/* comment 2 */',
            [
              [1, 16, undefined]
            ]
          ],
          [
            'rule',
            [
              [
                'rule-scope',
                '*',
                [
                  [1, 15, undefined]
                ]
              ]
            ],
            []
          ]
        ]
      ],
      'an empty rule': [
        'a{}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            []
          ]
        ]
      ],
      'a comment with breaks followed by an empty rule': [
        '/* comment \n\n */a{}',
        [
          [
            'comment',
            '/* comment \n\n */',
            [
              [1, 0, undefined]
            ]
          ],
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [3, 3, undefined]
                ]
              ]
            ],
            []
          ]
        ]
      ],
      'an empty rule with whitespace': [
        'a{ \n  }',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            []
          ]
        ]
      ],
      'a rule with a property': [
        'a{color:red}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 8, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'a rule with a multi value property': [
        'a{margin:0px 2px 1px}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'margin',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  '0px',
                  [
                    [1, 9, undefined]
                  ]
                ],
                [
                  'property-value',
                  '2px',
                  [
                    [1, 13, undefined]
                  ]
                ],
                [
                  'property-value',
                  '1px',
                  [
                    [1, 17, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'a rule with a filter property': [
        'a{filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=80)}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'filter',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'progid:DXImageTransform.Microsoft.Alpha(Opacity=80)',
                  [
                    [1, 9, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'a rule with whitespace': [
        'a {color:red;\n\ndisplay :\r\n  block }',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 3, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 9, undefined]
                  ]
                ]
              ],
              [
                'property',
                [
                  'property-name',
                  'display',
                  [
                    [3, 0, undefined]
                  ]
                ],
                [
                  'property-value',
                  'block',
                  [
                    [4, 2, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'a rule with suffix whitespace': [
        'div a{color:red\r\n}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'div a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 6, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 12, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'a rule with whitespace in functions': [
        'a{color:rgba( 255, 255, 0, 0.5  )}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'rgba( 255, 255, 0, 0.5  )',
                  [
                    [1, 8, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'a rule with functions and no whitespace breaks': [
        'a{background:rgba(255,255,0,0.5)url(test.png)repeat no-repeat}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'background',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'rgba(255,255,0,0.5)',
                  [
                    [1, 13, undefined]
                  ]
                ],
                [
                  'property-value',
                  'url(test.png)',
                  [
                    [1, 32, undefined]
                  ]
                ],
                [
                  'property-value',
                  'repeat',
                  [
                    [1, 45, undefined]
                  ]
                ],
                [
                  'property-value',
                  'no-repeat',
                  [
                    [1, 52, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'a rule with url and no whitespace breaks': [
        'a{background:url(image.png)50px/25%}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'background',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'url(image.png)',
                  [
                    [1, 13, undefined]
                  ]
                ],
                [
                  'property-value',
                  '50px',
                  [
                    [1, 27, undefined]
                  ]
                ],
                [
                  'property-value',
                  '/',
                  [
                    [1, 31, undefined]
                  ]
                ],
                [
                  'property-value',
                  '25%',
                  [
                    [1, 32, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'a rule with grid repeat': [
        '.block{-ms-grid-columns:( 1fr )[5]}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                '.block',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  '-ms-grid-columns',
                  [
                    [1, 7, undefined]
                  ]
                ],
                [
                  'property-value',
                  '( 1fr )[5]',
                  [
                    [1, 24, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'a rule with two properties where first ends with a round close bracket': [
        'a{width:calc(100% - 25px);width:50rem}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'width',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'calc(100% - 25px)',
                  [
                    [1, 8, undefined]
                  ]
                ]
              ],
              [
                'property',
                [
                  'property-name',
                  'width',
                  [
                    [1, 26, undefined]
                  ]
                ],
                [
                  'property-value',
                  '50rem',
                  [
                    [1, 32, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'a rule with empty properties': [
        'a{color:red; ; ; ;}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 8, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'a rule with quoted attribute': [
        'a[data-kind="one two"]{color:red}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a[data-kind="one two"]',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 23, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 29, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'a rule with escaped quote': [
        '.this-class\\\'s-got-an-apostrophe{color:red}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                '.this-class\\\'s-got-an-apostrophe',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 33, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 39, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'a rule with escaped backslash in content 12345': [
        '.block{content:"\\\\";}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                '.block',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'content',
                  [
                    [1, 7, undefined]
                  ]
                ],
                [
                  'property-value',
                  '"\\\\"',
                  [
                    [1, 15, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'a rule with quoted comment': [
        'a{background:url(\'/* this is silly */\')}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'background',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'url(\'/* this is silly */\')',
                  [
                    [1, 13, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'a rule with quote and comments inside quote': [
        'a{content:\'"abc /* 1 */"\'}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'content',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  '\'"abc /* 1 */"\'',
                  [
                    [1, 10, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'a double rule': [
        'a,\n\ndiv.class > p {color:red}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ],
              [
                'rule-scope',
                'div.class > p',
                [
                  [3, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [3, 15, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [3, 21, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'a triple rule': [
        'b,a,div{}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'b',
                [
                  [1, 0, undefined]
                ]
              ],
              [
                'rule-scope',
                'a',
                [
                  [1, 2, undefined]
                ]
              ],
              [
                'rule-scope',
                'div',
                [
                  [1, 4, undefined]
                ]
              ]
            ],
            []
          ]
        ]
      ],
      'two rules': [
        'a{color:red}\n div{color:blue}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 8, undefined]
                  ]
                ]
              ]
            ]
          ],
          [
            'rule',
            [
              [
                'rule-scope',
                'div',
                [
                  [2, 1, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [2, 5, undefined]
                  ]
                ],
                [
                  'property-value',
                  'blue',
                  [
                    [2, 11, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'two comments and a rule separated by newline': [
        '/* comment 1 */\n/* comment 2 */\ndiv{}',
        [
          [
            'comment',
            '/* comment 1 */',
            [
              [1, 0, undefined]
            ]
          ],
          [
            'comment',
            '/* comment 2 */',
            [
              [2, 0, undefined]
            ]
          ],
          [
            'rule',
            [
              [
                'rule-scope',
                'div',
                [
                  [3, 0, undefined]
                ]
              ]
            ],
            []
          ]
        ]
      ],
      'two comments one inside another and two rules': [
        '.block-1{color:red;/* comment 1 /* comment 2 */ */}.block-2{color:blue}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                '.block-1',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 9, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 15, undefined]
                  ]
                ]
              ],
              [
                'comment',
                '/* comment 1 /* comment 2 */',
                [
                  [1, 19, undefined]
                ]
              ]
            ]
          ],
          [
            'rule',
            [
              [
                'rule-scope',
                '.block-2',
                [
                  [1, 51, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 60, undefined]
                  ]
                ],
                [
                  'property-value',
                  'blue',
                  [
                    [1, 66, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'rule wrapped between comments': [
        '/* comment 1 */div/* comment 2 */{color:red}',
        [
          [
            'comment',
            '/* comment 1 */',
            [
              [1, 0, undefined]
            ]
          ],
          [
            'comment',
            '/* comment 2 */',
            [
              [1, 18, undefined]
            ]
          ],
          [
            'rule',
            [
              [
                'rule-scope',
                'div',
                [
                  [1, 15, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 34, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 40, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'rule wrapped between ignore comments': [
        '.block-1 { color: red }\n/* clean-css ignore:start */\n .block-2 { color: transparent } \n/* clean-css ignore:end */\n.block-3 { color: red }',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                '.block-1',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 11, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 18, undefined]
                  ]
                ]
              ]
            ]
          ],
          [
            'comment',
            '/* clean-css ignore:start */',
            [
              [2, 0, undefined]
            ]
          ],
          [
            'raw',
            '\n .block-2 { color: transparent } \n',
            [
              [2, 28, undefined]
            ]
          ],
          [
            'comment',
            '/* clean-css ignore:end */',
            [
              [4, 0, undefined]
            ]
          ],
          [
            'rule',
            [
              [
                'rule-scope',
                '.block-3',
                [
                  [5, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [5, 11, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [5, 18, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'two properties wrapped between comments': [
        'div{/* comment 1 */color:red/* comment 2 */}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'div',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'comment',
                '/* comment 1 */',
                [
                  [1, 4, undefined]
                ]
              ],
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 19, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 25, undefined]
                  ]
                ]
              ],
              [
                'comment',
                '/* comment 2 */',
                [
                  [1, 28, undefined]
                ]
              ]
            ]
          ]
        ]
      ],
      'multiple values wrapped between comments #1': [
        'div{background:url(image.png),/* comment */red}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'div',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'background',
                  [
                    [1, 4, undefined]
                  ]
                ],
                [
                  'property-value',
                  'url(image.png)',
                  [
                    [1, 15, undefined]
                  ]
                ],
                [
                  'property-value',
                  ',',
                  [
                    [1, 29, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 43, undefined]
                  ]
                ]
              ],
              [
                'comment',
                '/* comment */',
                [
                  [1, 30, undefined]
                ]
              ]
            ]
          ]
        ]
      ],
      'multiple values wrapped between comments #2': [
        'div{background:url(image.png),red/* comment */}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'div',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'background',
                  [
                    [1, 4, undefined]
                  ]
                ],
                [
                  'property-value',
                  'url(image.png)',
                  [
                    [1, 15, undefined]
                  ]
                ],
                [
                  'property-value',
                  ',',
                  [
                    [1, 29, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 30, undefined]
                  ]
                ]
              ],
              [
                'comment',
                '/* comment */',
                [
                  [1, 33, undefined]
                ]
              ]
            ]
          ]
        ]
      ],
      'multiple values wrapped between comments #3': [
        'div{background:url(image.png),rgba(0,0,0,/* comment */0.1)}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'div',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'background',
                  [
                    [1, 4, undefined]
                  ]
                ],
                [
                  'property-value',
                  'url(image.png)',
                  [
                    [1, 15, undefined]
                  ]
                ],
                [
                  'property-value',
                  ',',
                  [
                    [1, 29, undefined]
                  ]
                ],
                [
                  'property-value',
                  'rgba(0,0,0,0.1)',
                  [
                    [1, 30, undefined]
                  ]
                ]
              ],
              [
                'comment',
                '/* comment */',
                [
                  [1, 41, undefined]
                ]
              ]
            ]
          ]
        ]
      ],
      'pseudorules': [
        'div:nth-child(2n):not(.test){color:red}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'div:nth-child(2n):not(.test)',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 29, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 35, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      '! important': [
        'a{color:red! important}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red!',
                  [
                    [1, 8, undefined]
                  ]
                ],
                [
                  'property-value',
                  'important',
                  [
                    [1, 13, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      ' !important': [
        'a{color:red !important}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 8, undefined]
                  ]
                ],
                [
                  'property-value',
                  '!important',
                  [
                    [1, 12, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      ' ! important': [
        'a{color:red ! important}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 8, undefined]
                  ]
                ],
                [
                  'property-value',
                  '!',
                  [
                    [1, 12, undefined]
                  ]
                ],
                [
                  'property-value',
                  'important',
                  [
                    [1, 14, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      '@apply': [
        'a{@apply(--rule);color:red}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'at-rule',
                '@apply(--rule)',
                [
                  [1, 2, undefined]
                ]
              ],
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 17, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 23, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      '@apply with whitespace and no semicolon': [
        'a{  @apply(--rule) }',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'at-rule',
                '@apply(--rule)',
                [
                  [1, 4, undefined]
                ]
              ]
            ]
          ]
        ]
      ],
      '@apply - between properties': [
        'a{display:block;@apply(--rule);color:red}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'display',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'block',
                  [
                    [1, 10, undefined]
                  ]
                ]
              ],
              [
                'at-rule',
                '@apply(--rule)',
                [
                  [1, 16, undefined]
                ]
              ],
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 31, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 37, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      '@apply within a variable': [
        ':root{--layout-horizontal:{@apply(--layout)};}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                ':root',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  '--layout-horizontal',
                  [
                    [1, 6, undefined]
                  ]
                ],
                [
                  'property-block',
                  [
                    [
                      'at-rule',
                      '@apply(--layout)',
                      [
                        [1, 27, undefined]
                      ]
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      '@apply within a variable before properties': [
        ':root{--layout-horizontal:{@apply(--layout);color:red;display:block};}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                ':root',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  '--layout-horizontal',
                  [
                    [1, 6, undefined]
                  ]
                ],
                [
                  'property-block',
                  [
                    [
                      'at-rule',
                      '@apply(--layout)',
                      [
                        [1, 27, undefined]
                      ]
                    ],
                    [
                      'property',
                      [
                        'property-name',
                        'color',
                        [
                          [1, 44, undefined]
                        ]
                      ],
                      [
                        'property-value',
                        'red',
                        [
                          [1, 50, undefined]
                        ]
                      ]
                    ],
                    [
                      'property',
                      [
                        'property-name',
                        'display',
                        [
                          [1, 54, undefined]
                        ]
                      ],
                      [
                        'property-value',
                        'block',
                        [
                          [1, 62, undefined]
                        ]
                      ]
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      '@apply in a new rule after variable is last in previous one 1234': [
        '.block-1{fill:var(--test1)}.block-2{@apply(--test2)}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                '.block-1',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'fill',
                  [
                    [1, 9, undefined]
                  ]
                ],
                [
                  'property-value',
                  'var(--test1)',
                  [
                    [1, 14, undefined]
                  ]
                ]
              ]
            ]
          ],
          [
            'rule',
            [
              [
                'rule-scope',
                '.block-2',
                [
                  [1, 27, undefined]
                ]
              ]
            ],
            [
              [
                'at-rule',
                '@apply(--test2)',
                [
                  [1, 36, undefined]
                ]
              ]
            ]
          ]
        ]
      ],
      '@apply after a function': [
        '.block{color:rgb(0,0,0);@apply(--test)}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                '.block',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 7, undefined]
                  ]
                ],
                [
                  'property-value',
                  'rgb(0,0,0)',
                  [
                    [1, 13, undefined]
                  ]
                ]
              ],
              [
                'at-rule',
                '@apply(--test)',
                [
                  [1, 24, undefined]
                ]
              ]
            ]
          ]
        ]
      ],
      '@page named rule': [
        '@page one{margin:10px}',
        [
          [
            'at-rule-block',
            [
              [
                'at-rule-block-scope',
                '@page one',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'margin',
                  [
                    [1, 10, undefined]
                  ]
                ],
                [
                  'property-value',
                  '10px',
                  [
                    [1, 17, undefined]
                  ]
                ]
              ]

            ]
          ]
        ]
      ],
      '@page named rule with page-margin box': [
        '@page :first{margin:10px;@top-center{content:"Page One"}padding:5px}',
        [
          [
            'at-rule-block',
            [
              [
                'at-rule-block-scope',
                '@page :first',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'margin',
                  [
                    [1, 13, undefined]
                  ]
                ],
                [
                  'property-value',
                  '10px',
                  [
                    [1, 20, undefined]
                  ]
                ]
              ],
              [
                'at-rule-block',
                [
                  [
                    'at-rule-block-scope',
                    '@top-center',
                    [
                      [1, 25, undefined]
                    ]
                  ]
                ],
                [
                  [
                    'property',
                    [
                      'property-name',
                      'content',
                      [
                        [1, 37, undefined]
                      ]
                    ],
                    [
                      'property-value',
                      '"Page One"',
                      [
                        [1, 45, undefined]
                      ]
                    ]
                  ]
                ]
              ],
              [
                'property',
                [
                  'property-name',
                  'padding',
                  [
                    [1, 56, undefined]
                  ]
                ],
                [
                  'property-value',
                  '5px',
                  [
                    [1, 64, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'media query': [
        '@media (min-width:980px){}',
        [
          [
            'nested-block',
            [
              [
                'nested-block-scope',
                '@media (min-width:980px)',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            []
          ]
        ]
      ],
      'media query without space abc': [
        '@media(min-width:980px){.block{color:red}}',
        [
          [
            'nested-block',
            [
              [
                'nested-block-scope',
                '@media(min-width:980px)',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'rule',
                [
                  [
                    'rule-scope',
                    '.block',
                    [
                      [1, 24, undefined]
                    ]
                  ]
                ],
                [
                  [
                    'property',
                    [
                      'property-name',
                      'color',
                      [
                        [1, 31, undefined]
                      ]
                    ],
                    [
                      'property-value',
                      'red',
                      [
                        [1, 37, undefined]
                      ]
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'multiple media query': [
        '@media print,(min-width:980px){a{color:red}}',
        [
          [
            'nested-block',
            [
              [
                'nested-block-scope',
                '@media print',
                [
                  [1, 0, undefined]
                ]
              ],
              [
                'nested-block-scope',
                '(min-width:980px)',
                [
                  [1, 13, undefined]
                ]
              ]
            ],
            [
              [
                'rule',
                [
                  [
                    'rule-scope',
                    'a',
                    [
                      [1, 31, undefined]
                    ]
                  ]
                ],
                [
                  [
                    'property',
                    [
                      'property-name',
                      'color',
                      [
                        [1, 33, undefined]
                      ]
                    ],
                    [
                      'property-value',
                      'red',
                      [
                        [1, 39, undefined]
                      ]
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'media query surrounded by rules': [
        'a{color:red}@media (min-width:980px){}p{color:blue}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 8, undefined]
                  ]
                ]
              ]
            ]
          ],
          [
            'nested-block',
            [
              [
                'nested-block-scope',
                '@media (min-width:980px)',
                [
                  [1, 12, undefined]
                ]
              ]
            ],
            []
          ],
          [
            'rule',
            [
              [
                'rule-scope',
                'p',
                [
                  [1, 38, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 40, undefined]
                  ]
                ],
                [
                  'property-value',
                  'blue',
                  [
                    [1, 46, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'media query with rules': [
        '@media (min-width:980px){a{color:red}}',
        [
          [
            'nested-block',
            [
              [
                'nested-block-scope',
                '@media (min-width:980px)',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'rule',
                [
                  [
                    'rule-scope',
                    'a',
                    [
                      [1, 25, undefined]
                    ]
                  ]
                ],
                [
                  [
                    'property',
                    [
                      'property-name',
                      'color',
                      [
                        [1, 27, undefined]
                      ]
                    ],
                    [
                      'property-value',
                      'red',
                      [
                        [1, 33, undefined]
                      ]
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'nested media query': [
        '@media only screen and (max-width:1319px){\n@media print {\na{color:#000}\n}\na{color:red}}',
        [
          [
            'nested-block',
            [
              [
                'nested-block-scope',
                '@media only screen and (max-width:1319px)',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'nested-block',
                [
                  [
                    'nested-block-scope',
                    '@media print',
                    [
                      [2, 0, undefined]
                    ]
                  ]
                ],
                [
                  [
                    'rule',
                    [
                      [
                        'rule-scope',
                        'a',
                        [
                          [3, 0, undefined]
                        ]
                      ]
                    ],
                    [
                      [
                        'property',
                        [
                          'property-name',
                          'color',
                          [
                            [3, 2, undefined]
                          ]
                        ],
                        [
                          'property-value',
                          '#000',
                          [
                            [3, 8, undefined]
                          ]
                        ]
                      ]
                    ]
                  ]
                ]
              ],
              [
                'rule',
                [
                  [
                    'rule-scope',
                    'a',
                    [
                      [5, 0, undefined]
                    ]
                  ]
                ],
                [
                  [
                    'property',
                    [
                      'property-name',
                      'color',
                      [
                        [5, 2, undefined]
                      ]
                    ],
                    [
                      'property-value',
                      'red',
                      [
                        [5, 8, undefined]
                      ]
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      '@media with whitespace': [
        '@media ( min-width:980px ){ }p{color:red}',
        [
          [
            'nested-block',
            [
              [
                'nested-block-scope',
                '@media ( min-width:980px )',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            []
          ],
          [
            'rule',
            [
              [
                'rule-scope',
                'p',
                [
                  [1, 29, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 31, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 37, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'between blocks': [
        '@media (min-width:980px){}/*! comment */@media screen{}',
        [
          [
            'nested-block',
            [
              [
                'nested-block-scope',
                '@media (min-width:980px)',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            []
          ],
          [
            'comment',
            '/*! comment */',
            [
              [1, 26, undefined]
            ]
          ],
          [
            'nested-block',
            [
              [
                'nested-block-scope',
                '@media screen',
                [
                  [1, 40, undefined]
                ]
              ]
            ],
            []
          ]
        ]
      ],
      'in blocks': [
        '@media (/* comment \n */min-width:980px){a{color:red}}',
        [
          [
            'comment',
            '/* comment \n */',
            [
              [1, 8, undefined]
            ]
          ],
          [
            'nested-block',
            [
              [
                'nested-block-scope',
                '@media (min-width:980px)',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'rule',
                [
                  [
                    'rule-scope',
                    'a',
                    [
                      [2, 20, undefined]
                    ]
                  ]
                ],
                [
                  [
                    'property',
                    [
                      'property-name',
                      'color',
                      [
                        [2, 22, undefined]
                      ]
                    ],
                    [
                      'property-value',
                      'red',
                      [
                        [2, 28, undefined]
                      ]
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'font-face': [
        '@font-face{font-family: "Helvetica Neue";font-size:12px}',
        [
          [
            'at-rule-block',
            [
              [
                'at-rule-block-scope',
                '@font-face',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'font-family',
                  [
                    [1, 11, undefined]
                  ]
                ],
                [
                  'property-value',
                  '"Helvetica Neue"',
                  [
                    [1, 24, undefined]
                  ]
                ]
              ],
              [
                'property',
                [
                  'property-name',
                  'font-size',
                  [
                    [1, 41, undefined]
                  ]
                ],
                [
                  'property-value',
                  '12px',
                  [
                    [1, 51, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'charset': [
        '@charset \'utf-8\';a{color:red}',
        [
          [
            'at-rule',
            '@charset \'utf-8\'',
            [
              [1, 0, undefined]
            ]
          ],
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 17, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 19, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 25, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'charset after a line break': [
        '\n@charset \n\'utf-8\';',
        [
          [
            'at-rule',
            '@charset \n\'utf-8\'',
            [
              [2, 0, undefined]
            ]
          ]
        ]
      ],
      'charset after a carriage return': [
        '\r@charset \n\'utf-8\';',
        [
          [
            'at-rule',
            '@charset \n\'utf-8\'',
            [
              [2, 0, undefined]
            ]
          ]
        ]
      ],
      '@import': [
        'a{}@import \n"test.css";\n\na{color:red}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            []
          ],
          [
            'at-rule',
            '@import \n"test.css"',
            [
              [1, 3, undefined]
            ]
          ],
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [4, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [4, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [4, 8, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      '@import with round braces': [
        '@import url(http://fonts.googleapis.com/css?family=Lora:400,700);',
        [
          [
            'at-rule',
            '@import url(http://fonts.googleapis.com/css?family=Lora:400,700)',
            [[1, 0, undefined]]
          ]
        ]
      ],
      '@import with media': [
        '@import "test.css" screen, tv, print;',
        [
          [
            'at-rule',
            '@import "test.css" screen, tv, print',
            [[1, 0, undefined]]
          ]
        ]
      ],
      'keyframes with quoted name': [
        '@keyframes "test"{0%{color:red}}',
        [
          [
            'nested-block',
            [
              [
                'nested-block-scope',
                '@keyframes "test"',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'rule',
                [
                  [
                    'rule-scope',
                    '0%',
                    [
                      [1, 18, undefined]
                    ]
                  ]
                ],
                [
                  [
                    'property',
                    [
                      'property-name',
                      'color',
                      [
                        [1, 21, undefined]
                      ]
                    ],
                    [
                      'property-value',
                      'red',
                      [
                        [1, 27, undefined]
                      ]
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'variables': [
        'a{border:var(--width)var(--style)var(--color)}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'border',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'var(--width)',
                  [
                    [1, 9, undefined]
                  ]
                ],
                [
                  'property-value',
                  'var(--style)',
                  [
                    [1, 21, undefined]
                  ]
                ],
                [
                  'property-value',
                  'var(--color)',
                  [
                    [1, 33, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'variable declarations': [
        ':root{--color:var(--otherColor)}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                ':root',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  '--color',
                  [
                    [1, 6, undefined]
                  ]
                ],
                [
                  'property-value',
                  'var(--otherColor)',
                  [
                    [1, 14, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'multiple variable blocks': [
        'div{--test1:{color:red};--test2:{color:blue};}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'div',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  '--test1',
                  [
                    [1, 4, undefined]
                  ]
                ],
                [
                  'property-block',
                  [
                    [
                      'property',
                      [
                        'property-name',
                        'color',
                        [
                          [1, 13, undefined]
                        ]
                      ],
                      [
                        'property-value',
                        'red',
                        [
                          [1, 19, undefined]
                        ]
                      ]
                    ]
                  ]
                ]
              ],
              [
                'property',
                [
                  'property-name',
                  '--test2',
                  [
                    [1, 24, undefined]
                  ]
                ],
                [
                  'property-block',
                  [
                    [
                      'property',
                      [
                        'property-name',
                        'color',
                        [
                          [1, 33, undefined]
                        ]
                      ],
                      [
                        'property-value',
                        'blue',
                        [
                          [1, 39, undefined]
                        ]
                      ]
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'variable block with trailing whitespace': [
        'a{--test:{color:#f00 };color:blue}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  '--test',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-block',
                  [
                    [
                      'property',
                      [
                        'property-name',
                        'color',
                        [
                          [1, 10, undefined]
                        ]
                      ],
                      [
                        'property-value',
                        '#f00',
                        [
                          [1, 16, undefined]
                        ]
                      ]
                    ]
                  ]
                ]
              ],
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 23, undefined]
                  ]
                ],
                [
                  'property-value',
                  'blue',
                  [
                    [1, 29, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      '_:-ms-lang flat block': [
        '_:-ms-lang(x),@-ms-viewport{color:red}',
        [
          [
            'at-rule-block',
            [
              [
                'at-rule-block-scope',
                '_:-ms-lang(x)',
                [
                  [1, 0, undefined]
                ]
              ],
              [
                'at-rule-block-scope',
                '@-ms-viewport',
                [
                  [1, 14, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 28, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 34, undefined]
                  ]
                ]
              ]
            ]
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
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  '--my-toolbar-color',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 21, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'block value': [
        'a{--my-toolbar:{color:red;width:100%}}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  '--my-toolbar',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-block',
                  [
                    [
                      'property',
                      [
                        'property-name',
                        'color',
                        [
                          [1, 16, undefined]
                        ]
                      ],
                      [
                        'property-value',
                        'red',
                        [
                          [1, 22, undefined]
                        ]
                      ]
                    ],
                    [
                      'property',
                      [
                        'property-name',
                        'width',
                        [
                          [1, 26, undefined]
                        ]
                      ],
                      [
                        'property-value',
                        '100%',
                        [
                          [1, 32, undefined]
                        ]
                      ]
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'mixed block value': [
        'a{display:block;--my-toolbar:{color:red;width:100%};color:blue}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'display',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'block',
                  [
                    [1, 10, undefined]
                  ]
                ]
              ],
              [
                'property',
                [
                  'property-name',
                  '--my-toolbar',
                  [
                    [1, 16, undefined]
                  ]
                ],
                [
                  'property-block',
                  [
                    [
                      'property',
                      [
                        'property-name',
                        'color',
                        [
                          [1, 30, undefined]
                        ]
                      ],
                      [
                        'property-value',
                        'red',
                        [
                          [1, 36, undefined]
                        ]
                      ]
                    ],
                    [
                      'property',
                      [
                        'property-name',
                        'width',
                        [
                          [1, 40, undefined]
                        ]
                      ],
                      [
                        'property-value',
                        '100%',
                        [
                          [1, 46, undefined]
                        ]
                      ]
                    ]
                  ]
                ]
              ],
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 52, undefined]
                  ]
                ],
                [
                  'property-value',
                  'blue',
                  [
                    [1, 58, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'mixed block value with trailing block semicolon 123': [
        'a{display:block;--my-toolbar:{color:red;width:100%;};color:blue}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'display',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'block',
                  [
                    [1, 10, undefined]
                  ]
                ]
              ],
              [
                'property',
                [
                  'property-name',
                  '--my-toolbar',
                  [
                    [1, 16, undefined]
                  ]
                ],
                [
                  'property-block',
                  [
                    [
                      'property',
                      [
                        'property-name',
                        'color',
                        [
                          [1, 30, undefined]
                        ]
                      ],
                      [
                        'property-value',
                        'red',
                        [
                          [1, 36, undefined]
                        ]
                      ]
                    ],
                    [
                      'property',
                      [
                        'property-name',
                        'width',
                        [
                          [1, 40, undefined]
                        ]
                      ],
                      [
                        'property-value',
                        '100%',
                        [
                          [1, 46, undefined]
                        ]
                      ]
                    ]
                  ]
                ]
              ],
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 53, undefined]
                  ]
                ],
                [
                  'property-value',
                  'blue',
                  [
                    [1, 59, undefined]
                  ]
                ]
              ]
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
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'background',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'no-repeat',
                  [
                    [1, 13, undefined]
                  ]
                ],
                [
                  'property-value',
                  ',',
                  [
                    [1, 22, undefined]
                  ]
                ],
                [
                  'property-value',
                  'no-repeat',
                  [
                    [1, 23, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'comma - one space': [
        'a{background:no-repeat, no-repeat}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'background',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'no-repeat',
                  [
                    [1, 13, undefined]
                  ]
                ],
                [
                  'property-value',
                  ',',
                  [
                    [1, 22, undefined]
                  ]
                ],
                [
                  'property-value',
                  'no-repeat',
                  [
                    [1, 24, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'comma - two spaces': [
        'a{background:no-repeat , no-repeat}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'background',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'no-repeat',
                  [
                    [1, 13, undefined]
                  ]
                ],
                [
                  'property-value',
                  ',',
                  [
                    [1, 23, undefined]
                  ]
                ],
                [
                  'property-value',
                  'no-repeat',
                  [
                    [1, 25, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'comma - inside function': [
        'a{background:rgba(0,0,0,0)}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'background',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'rgba(0,0,0,0)',
                  [
                    [1, 13, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'forward slash - no spaces': [
        'a{border-radius:5px/4px}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'border-radius',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  '5px',
                  [
                    [1, 16, undefined]
                  ]
                ],
                [
                  'property-value',
                  '/',
                  [
                    [1, 19, undefined]
                  ]
                ],
                [
                  'property-value',
                  '4px',
                  [
                    [1, 20, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'forward slash - one space': [
        'a{border-radius:5px /4px}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'border-radius',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  '5px',
                  [
                    [1, 16, undefined]
                  ]
                ],
                [
                  'property-value',
                  '/',
                  [
                    [1, 20, undefined]
                  ]
                ],
                [
                  'property-value',
                  '4px',
                  [
                    [1, 21, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'forward slash - two spaces': [
        'a{border-radius:5px / 4px}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'border-radius',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  '5px',
                  [
                    [1, 16, undefined]
                  ]
                ],
                [
                  'property-value',
                  '/',
                  [
                    [1, 20, undefined]
                  ]
                ],
                [
                  'property-value',
                  '4px',
                  [
                    [1, 22, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'forward slash - inside function': [
        'a{width:calc(5px/4px)}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'width',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'calc(5px/4px)',
                  [
                    [1, 8, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'forward slash and closing round brace inside function': [
        'a{width:calc((10rem - 2px) / 2 + 10em)}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'width',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'calc((10rem - 2px) / 2 + 10em)',
                  [
                    [1, 8, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'quotes inside function': [
        'a{width:expression(this.parentNode.innerText == ")" ? "5px" : "10px")}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'width',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'expression(this.parentNode.innerText == ")" ? "5px" : "10px")',
                  [
                    [1, 8, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'curly braces inside function': [
        'a{zoom:expression(function (el){el.style.zoom="1"}(this))}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'zoom',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'expression(function (el){el.style.zoom="1"}(this))',
                  [
                    [1, 7, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ]
    })
  )
  .addBatch(
    tokenizerContext('broken', {
      'missing end brace': [
        'a{display:block',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'display',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'block',
                  [
                    [1, 10, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'missing closing bracket': [
        'a{width:expression(this.parentNode.innerText == }',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'width',
                  [
                    [1, 2, undefined]
                  ]
                ],
                [
                  'property-value',
                  'expression(this.parentNode.innerText ==',
                  [
                    [1, 8, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'missing end brace in the middle': [
        'body{color:red;a{color:blue;}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'body',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 5, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 11, undefined]
                  ]
                ]
              ],
              [
                'property',
                [
                  'property-name',
                  'a{color',
                  [
                    [1, 15, undefined]
                  ]
                ],
                [
                  'property-value',
                  'blue',
                  [
                    [1, 23, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'missing end brace and semicolon in the middle': [
        'body{color:red a{color:blue;}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'body',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 5, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 11, undefined]
                  ]
                ],
                [
                  'property-block',
                  [
                    [
                      'property',
                      [
                        'property-name',
                        'acolor',
                        [
                          [1, 15, undefined]
                        ]
                      ],
                      [
                        'property-value',
                        'blue',
                        [
                          [1, 23, undefined]
                        ]

                      ]
                    ]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'extra end brace in the middle': [
        'body{color:red}}a{color:blue;}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'body',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 5, undefined]
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 11, undefined]
                  ]
                ]
              ]
            ]
          ],
          [
            'rule',
            [
              [
                'rule-scope',
                '}a',
                [
                  [1, 15, undefined]
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 18, undefined]
                  ]
                ],
                [
                  'property-value',
                  'blue',
                  [
                    [1, 24, undefined]
                  ]
                ]
              ]
            ]
          ]
        ]
      ],
      'unexpected semicolon at root level': [
        'body;{body}',
        [
          [
            'rule',
            [
              [
                'rule-scope',
                'body;',
                [
                  [1, 0, undefined]
                ]
              ]
            ],
            []
          ]
        ]
      ]
    })
  )
  .addBatch({
    'warnings': {
      'topic': function () {
        var warnings = [];

        tokenize('a{display:block', {
          inputSourceMapTracker: inputSourceMapTracker(),
          options: {},
          source: 'one.css',
          warnings: warnings
        });

        return warnings;
      },
      'logs them correctly': function (warnings) {
        assert.deepEqual(warnings, ['Missing \'}\' at one.css:1:15.']);
      }
    },
    'warnings - extra characters': {
      'topic': function () {
        var warnings = [];

        tokenize('<![CDATA[p.b{background:red}]]>', {
          inputSourceMapTracker: inputSourceMapTracker(),
          options: {},
          source: 'one.css',
          warnings: warnings
        });

        return warnings;
      },
      'logs them correctly': function (warnings) {
        assert.deepEqual(warnings, ['Invalid character(s) \']]>\' at one.css:1:28. Ignoring.']);
      }
    }
  })
  .addBatch({
    'sources - rule with properties': {
      'topic': function () {
        return tokenize('a{color:red}', {
          inputSourceMapTracker: inputSourceMapTracker(),
          options: {},
          source: 'one.css',
          warnings: []
        });
      },
      'sets source correctly': function (tokens) {
        assert.deepEqual(tokens, [
          [
            'rule',
            [
              [
                'rule-scope',
                'a',
                [
                  [1, 0, 'one.css']
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [1, 2, 'one.css']
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [1, 8, 'one.css']
                  ]
                ]
              ]
            ]
          ]
        ]);
      }
    }
  })
  .addBatch({
    'input source maps - simple': {
      'topic': function () {
        var sourceMapTracker = inputSourceMapTracker();
        sourceMapTracker.track('styles.css', inputMap);

        return tokenize('div > a {\n  color: red;\n}', {
          source: 'styles.css',
          inputSourceMapTracker: sourceMapTracker,
          options: {},
          warnings: []
        });
      },
      'sets positions correctly': function (tokens) {
        assert.deepEqual(tokens, [
          [
            'rule',
            [
              [
                'rule-scope',
                'div > a',
                [
                  [1, 4, 'styles.less']
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [2, 2, 'styles.less']
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [2, 2, 'styles.less']
                  ]
                ]
              ]
            ]
          ]
        ]);
      }
    },
    'with fallback for properties': {
      'topic': function () {
        var sourceMapTracker = inputSourceMapTracker();
        sourceMapTracker.track('styles.css', inputMap);

        return tokenize('div > a {\n  color: red red;\n}', {
          source: 'styles.css',
          inputSourceMapTracker: sourceMapTracker,
          options: {},
          warnings: []
        });
      },
      'sets positions correctly': function (tokens) {
        assert.deepEqual(tokens, [
          [
            'rule',
            [
              [
                'rule-scope',
                'div > a',
                [
                  [1, 4, 'styles.less']
                ]
              ]
            ],
            [
              [
                'property',
                [
                  'property-name',
                  'color',
                  [
                    [2, 2, 'styles.less']
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [2, 2, 'styles.less']
                  ]
                ],
                [
                  'property-value',
                  'red',
                  [
                    [2, 2, 'styles.less']
                  ]
                ]
              ]
            ]
          ]
        ]);
      }
    }
  })
  .export(module);
