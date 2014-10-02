var vows = require('vows');
var assert = require('assert');
var Tokenizer = require('../../lib/selectors/tokenizer');

function tokenizerContext(config) {
  var ctx = {};

  function tokenized(target) {
    return function (source) {
      var tokenized = new Tokenizer({}).toTokens(source);
      assert.deepEqual(target, tokenized);
    };
  }

  for (var test in config) {
    ctx[test] = {
      topic: config[test][0],
      tokenized: tokenized(config[test][1])
    };
  }

  return ctx;
}

vows.describe(Tokenizer)
  .addBatch(
    tokenizerContext({
      'no content': [
        '',
        []
      ],
      'an escaped content': [
        '__ESCAPED_COMMENT_CLEAN_CSS0__',
        ['__ESCAPED_COMMENT_CLEAN_CSS0__']
      ],
      'an empty selector': [
        'a{}',
        [{ selector: ['a'], body: [] }]
      ],
      'an empty selector with whitespace': [
        'a{ \n  }',
        [{ selector: ['a'], body: [] }]
      ],
      'a selector': [
        'a{color:red}',
        [{ selector: ['a'], body: ['color:red'] }]
      ],
      'a selector with whitespace': [
        'a {color:red;\n\ndisplay :  block }',
        [{ selector: ['a'], body: ['color:red', 'display:block'] }]
      ],
      'a selector with whitespace in functions': [
        'a{color:rgba( 255, 255, 0, 0.5  )}',
        [{ selector: ['a'], body: ['color:rgba(255,255,0,0.5)'] }]
      ],
      'a selector with empty properties': [
        'a{color:red; ; ; ;}',
        [{ selector: ['a'], body: ['color:red'] }]
      ],
      'a double selector': [
        'a,\n\ndiv.class > p {color:red}',
        [{ selector: ['a', 'div.class > p'], body: ['color:red'] }]
      ],
      'two selectors': [
        'a{color:red}div{color:blue}',
        [
          { selector: ['a'], body: ['color:red'] },
          { selector: ['div'], body: ['color:blue'] }
        ]
      ],
      'media query': [
        '@media (min-width:980px){}',
        [{ block: '@media (min-width:980px)', body: [], isFlatBlock: false }]
      ],
      'media query with selectors': [
        '@media (min-width:980px){a{color:red}}',
        [{ block: '@media (min-width:980px)', body: [{ selector: ['a'], body: ['color:red'] }], isFlatBlock: false }]
      ],
      'media query spanning more than one chunk': [
        '@media only screen and (max-width:1319px) and (min--moz-device-pixel-ratio:1.5),only screen and (max-width:1319px) and (-moz-min-device-pixel-ratio:1.5){a{color:#000}}',
        [{ block: '@media only screen and (max-width:1319px) and (min--moz-device-pixel-ratio:1.5),only screen and (max-width:1319px) and (-moz-min-device-pixel-ratio:1.5)', body: [{ selector: ['a'], body: ['color:#000'] }], isFlatBlock: false }]
      ],
      'font-face': [
        '@font-face{font-family: fontName;font-size:12px}',
        [{ block: '@font-face', body: ['font-family:fontName', 'font-size:12px'], isFlatBlock: true }]
      ],
      'charset': [
        '@charset \'utf-8\';a{color:red}',
        ['@charset \'utf-8\';', { selector: ['a'], body: ['color:red'] }]
      ],
      'charset after a line break': [
        '\n@charset \n\'utf-8\';',
        ['@charset \'utf-8\';']
      ]
    })
  )
  .export(module);
