var vows = require('vows');
var assert = require('assert');
var CommentsProcessor = require('../../lib/text/comments-processor');

var lineBreak = require('os').EOL;
var otherLineBreak = lineBreak == '\n' ? '\r\n' : '\n';

function processorContext(name, context, keepSpecialComments, keepBreaks, saveWaypoints) {
  var vowContext = {};

  function escaped (expected) {
    return function (source) {
      var escaped = new CommentsProcessor(null, keepSpecialComments, keepBreaks, saveWaypoints).escape(source);
      assert.equal(escaped, expected);
    };
  }

  function restored (expected) {
    return function (source) {
      var processor = new CommentsProcessor(null, keepSpecialComments, keepBreaks, saveWaypoints);
      var restored = processor.restore(processor.escape(source));
      assert.equal(restored, expected);
    };
  }

  for (var key in context) {
    vowContext[name + ' - ' + key] = {
      topic: context[key][0],
      escaped: escaped(context[key][1]),
      restored: restored(context[key][2])
    };
  }

  return vowContext;
}

vows.describe(CommentsProcessor)
  .addBatch(
    processorContext('all', {
      'no comments': [
        'a{color:red}',
        'a{color:red}',
        'a{color:red}'
      ],
      'one comment': [
        '/* some text */',
        '',
        ''
      ],
      'one special comment': [
        '/*! some text */',
        '__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0__',
        '/*! some text */'
      ],
      'two comments': [
        '/* one text *//* another text */',
        '',
        ''
      ],
      'two same comments': [
        '/* one text *//* one text */',
        '',
        ''
      ],
      'two special comments': [
        '/*! one text *//*! another text */',
        '__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0____ESCAPED_COMMENT_SPECIAL_CLEAN_CSS1__',
        '/*! one text *//*! another text */'
      ],
      'two special comments when second with @ sign and preceded by quote sign': [
        '/*! comment 1 */*{box-sizing: border-box}div:before{content:" "}/*! comment 2 */div{display:inline-block}',
        '__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0__*{box-sizing: border-box}div:before{content:" "}__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS1__div{display:inline-block}',
        '/*! comment 1 */*{box-sizing: border-box}div:before{content:" "}/*! comment 2 */div{display:inline-block}'
      ],
      'commented selector': [
        '/* a{color:red} */',
        '',
        ''
      ],
      'quoted comment': [
        'a{content:"/* text */"}',
        'a{content:"/* text */"}',
        'a{content:"/* text */"}'
      ]
    }, '*')
  )
  .addBatch(
    processorContext('one', {
      'one comment': [
        '/* some text */',
        '',
        ''
      ],
      'one special comment': [
        '/*! some text */',
        '__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0__',
        '/*! some text */'
      ],
      'two special comments': [
        '/*! one text *//*! another text */',
        '__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0____ESCAPED_COMMENT_SPECIAL_CLEAN_CSS1__',
        '/*! one text */'
      ]
    }, '1')
  )
  .addBatch(
    processorContext('zero', {
      'one comment': [
        '/* some text */',
        '',
        ''
      ],
      'one special comment': [
        '/*! some text */',
        '__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0__',
        ''
      ],
      'two special comments': [
        '/*! one text *//*! another text */',
        '__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0____ESCAPED_COMMENT_SPECIAL_CLEAN_CSS1__',
        ''
      ]
    }, '0')
  )
  .addBatch(
    processorContext('zero with breaks', {
      'remove comment and a break': [
        'a{}' + lineBreak + '/*! some text */' + lineBreak + 'p{}',
        'a{}' + lineBreak + '__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0__' + lineBreak + 'p{}',
        'a{}' + lineBreak + 'p{}'
      ]
    }, '0', true)
  )
  .addBatch(
    processorContext('one with breaks', {
      'keeps content as is': [
        'a{}/*! some text */p{}',
        'a{}__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0__p{}',
        'a{}/*! some text */p{}'
      ],
      'keeps if not given already': [
        'a{}/*! some text */' + lineBreak + 'p{}',
        'a{}__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0__' + lineBreak + 'p{}',
        'a{}/*! some text */' + lineBreak + 'p{}'
      ],
      'if given an other platform break already': [
        'a{}/*! some text */' + otherLineBreak + 'p{}',
        'a{}__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0__' + otherLineBreak + 'p{}',
        'a{}/*! some text */' + otherLineBreak + 'p{}'
      ]
    }, '1', true)
  )
  .addBatch(
    processorContext('waypoints', {
      'one comment': [
        '/* some text */',
        '__ESCAPED_COMMENT_CLEAN_CSS0(0,15)__',
        ''
      ],
      'one special comment': [
        '/*! some text */',
        '__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0(0,16)__',
        '/*! some text */'
      ],
      'two comments': [
        '/* one text *//* another text */',
        '__ESCAPED_COMMENT_CLEAN_CSS0(0,14)____ESCAPED_COMMENT_CLEAN_CSS1(0,33)__',
        ''
      ],
      'two same comments': [
        '/* one text *//* one text */',
        '__ESCAPED_COMMENT_CLEAN_CSS0(0,14)____ESCAPED_COMMENT_CLEAN_CSS0(0,29)__',
        ''
      ],
      'two special comments': [
        '/*! one text *//*! another text */',
        '__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0(0,15)____ESCAPED_COMMENT_SPECIAL_CLEAN_CSS1(0,35)__',
        '/*! one text *//*! another text */'
      ],
      'two special comments with line breaks': [
        '/*! one text' + lineBreak + '*//*! another' + lineBreak + ' text' + lineBreak + ' */',
        '__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0(1,2)____ESCAPED_COMMENT_SPECIAL_CLEAN_CSS1(2,3)__',
        '/*! one text' + lineBreak + '*//*! another' + lineBreak + ' text' + lineBreak + ' */'
      ],
      'three special comments with line breaks and content in between': [
        '/*! one text' + lineBreak + '*/a{}/*! ' + lineBreak + 'test */p{color:red}/*! another' + lineBreak + ' text' + lineBreak + lineBreak + '  */',
        '__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS0(1,2)__a{}__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS1(1,7)__p{color:red}__ESCAPED_COMMENT_SPECIAL_CLEAN_CSS2(3,4)__',
        '/*! one text' + lineBreak + '*/a{}/*! ' + lineBreak + 'test */p{color:red}/*! another' + lineBreak + ' text' + lineBreak + lineBreak + '  */'
      ]
    }, '*', false, true)
  )
  .export(module);
