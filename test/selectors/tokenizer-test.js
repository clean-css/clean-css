var vows = require('vows');
var assert = require('assert');
var Tokenizer = require('../../lib/selectors/tokenizer');

function tokenizerContext(name, specs, addMetadata) {
  var ctx = {};

  function tokenized(target) {
    return function (source) {
      var tokenized = new Tokenizer({}, addMetadata).toTokens(source);
      assert.deepEqual(target, tokenized);
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

vows.describe(Tokenizer)
  .addBatch(
    tokenizerContext('basic', {
      'no content': [
        '',
        []
      ],
      'an escaped content': [
        '__ESCAPED_COMMENT_CLEAN_CSS0__',
        [{
          kind: 'text',
          value: '__ESCAPED_COMMENT_CLEAN_CSS0__'
        }]
      ],
      'an empty selector': [
        'a{}',
        [{
          kind: 'selector',
          value: [{ value: 'a' }],
          body: []
        }]
      ],
      'an empty selector with whitespace': [
        'a{ \n  }',
        [{
          kind: 'selector',
          value: [{ value: 'a' }],
          body: []
        }]
      ],
      'a selector': [
        'a{color:red}',
        [{
          kind: 'selector',
          value: [{ value: 'a' }],
          body: [{ value: 'color:red' }]
        }]
      ],
      'a selector with whitespace': [
        'a {color:red;\n\ndisplay :\r\n  block }',
        [{
          kind: 'selector',
          value: [{ value: 'a ' }],
          body: [
            { value: 'color:red' },
            { value: 'display:block'
          }]
        }]
      ],
      'a selector with suffix whitespace': [
        'div a{color:red\r\n}',
        [{ kind: 'selector', value: [{ value: 'div a' }], body: [{ value: 'color:red' }] }]
      ],
      'a selector with whitespace in functions': [
        'a{color:rgba( 255, 255, 0, 0.5  )}',
        [{
          kind: 'selector',
          value: [{ value: 'a' }],
          body: [{ value: 'color:rgba(255,255,0,0.5)' }]
        }]
      ],
      'a selector with empty properties': [
        'a{color:red; ; ; ;}',
        [{
          kind: 'selector',
          value: [{ value: 'a' }],
          body: [{ value: 'color:red' }]
        }]
      ],
      'a selector with quoted attribute': [
        'a[data-kind=__ESCAPED_FREE_TEXT_CLEAN_CSS0__]{color:red}',
        [{
          kind: 'selector',
          value: [{ value: 'a[data-kind=__ESCAPED_FREE_TEXT_CLEAN_CSS0__]' }],
          body: [{ value: 'color:red' }]
        }]
      ],
      'a double selector': [
        'a,\n\ndiv.class > p {color:red}',
        [{
          kind: 'selector',
          value: [
            { value: 'a' },
            { value: '\n\ndiv.class > p ' }
          ],
          body: [{ value: 'color:red' }]
        }]
      ],
      'two selectors': [
        'a{color:red}div{color:blue}',
        [
          {
            kind: 'selector',
            value: [{ value: 'a' }],
            body: [{ value: 'color:red' }]
          },
          {
            kind: 'selector',
            value: [{ value: 'div' }],
            body: [{ value: 'color:blue' }]
          }
        ]
      ],
      'media query': [
        '@media (min-width:980px){}',
        [{
          kind: 'block',
          value: '@media (min-width:980px)',
          body: [],
          isFlatBlock: false
        }]
      ],
      'media query with selectors': [
        '@media (min-width:980px){a{color:red}}',
        [{
          kind: 'block',
          value: '@media (min-width:980px)',
          body: [{
            kind: 'selector',
            value: [{ value: 'a' }],
            body: [{ value: 'color:red' }]
          }],
          isFlatBlock: false
        }]
      ],
      'media query spanning more than one chunk': [
        '@media only screen and (max-width:1319px) and (min--moz-device-pixel-ratio:1.5),only screen and (max-width:1319px) and (-moz-min-device-pixel-ratio:1.5){a{color:#000}}',
        [{
          kind: 'block',
          value: '@media only screen and (max-width:1319px) and (min--moz-device-pixel-ratio:1.5),only screen and (max-width:1319px) and (-moz-min-device-pixel-ratio:1.5)',
          body: [{
            kind: 'selector',
            value: [{ value: 'a' }],
            body: [{ value: 'color:#000' }]
          }],
          isFlatBlock: false
        }]
      ],
      'font-face': [
        '@font-face{font-family: fontName;font-size:12px}',
        [{
          kind: 'block',
          value: '@font-face',
          body: [
            { value: 'font-family:fontName' },
            { value: 'font-size:12px' }
          ],
          isFlatBlock: true
        }]
      ],
      'charset': [
        '@charset \'utf-8\';a{color:red}',
        [
          {
            kind: 'at-rule',
            value: '@charset \'utf-8\';'
          },
          {
            kind: 'selector',
            value: [{ value: 'a' }],
            body: [{ value: 'color:red' }]
          }
        ]
      ],
      'charset after a line break': [
        '\n@charset \n\'utf-8\';',
        [{
          kind: 'at-rule',
          value: '\n@charset \n\'utf-8\';'
        }]
      ],
      'keyframes with quoted attribute': [
        '@keyframes __ESCAPED_FREE_TEXT_CLEAN_CSS0__{}',
        [{
          kind: 'block',
          value: '@keyframes __ESCAPED_FREE_TEXT_CLEAN_CSS0__',
          body: [],
          isFlatBlock: false
        }]
      ]
    })
  )
  .addBatch(
    tokenizerContext('metadata', {
      'no content': [
        '',
        []
      ],
      'an escaped content': [
        '__ESCAPED_COMMENT_CLEAN_CSS0__',
        [{ kind: 'text', value: '__ESCAPED_COMMENT_CLEAN_CSS0__' }]
      ],
      'an empty selector': [
        'a{}',
        [{
          kind: 'selector',
          value: [{ value: 'a' }],
          body: [],
          metadata: {
            body: '',
            bodiesList: [],
            selector: 'a',
            selectorsList: ['a']
          }
        }]
      ],
      'a double selector': [
        'a,\n\ndiv.class > p {color:red}',
        [{
          kind: 'selector',
          value: [{ value: 'a' }, { value: '\n\ndiv.class > p ' }],
          body: [{ value: 'color:red' }],
          metadata: {
            body: 'color:red',
            bodiesList: ['color:red'],
            selector: 'a,\n\ndiv.class > p ',
            selectorsList: ['a', '\n\ndiv.class > p ']
          }
        }],
      ],
      'two selectors': [
        'a{color:red}div{color:blue}',
        [
          {
            kind: 'selector',
            value: [{ value: 'a' }],
            body: [{ value: 'color:red' }],
            metadata: {
              body: 'color:red',
              bodiesList: ['color:red'],
              selector: 'a',
              selectorsList: ['a']
            }
          },
          {
            kind: 'selector',
            value: [{ value: 'div' }],
            body: [{ value: 'color:blue' }],
            metadata: {
              body: 'color:blue',
              bodiesList: ['color:blue'],
              selector: 'div',
              selectorsList: ['div']
            }
          }
        ]
      ]
    }, true)
  )
  .export(module);
