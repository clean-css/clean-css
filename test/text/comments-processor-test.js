var vows = require('vows');
var assert = require('assert');
var CommentsProcessor = require('../../lib/text/comments-processor');

var lineBreak = require('os').EOL;
var otherLineBreak = lineBreak == '\n' ? '\r\n' : '\n';

function processorContext(name, context, keepSpecialComments, keepBreaks) {
  var vowContext = {};

  function escaped (targetCSS) {
    return function (sourceCSS) {
      var result = new CommentsProcessor(keepSpecialComments, keepBreaks).escape(sourceCSS);
      assert.equal(result, targetCSS);
    };
  }

  function restored (targetCSS) {
    return function (sourceCSS) {
      var processor = new CommentsProcessor(keepSpecialComments, keepBreaks);
      var result = processor.restore(processor.escape(sourceCSS));
      assert.equal(result, targetCSS);
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
        '__ESCAPED_COMMENT_CLEAN_CSS0__',
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
        '__ESCAPED_COMMENT_CLEAN_CSS0____ESCAPED_COMMENT_CLEAN_CSS1__',
        '/*! one text *//*! another text */'
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
        '__ESCAPED_COMMENT_CLEAN_CSS0__',
        '/*! some text */'
      ],
      'two special comments': [
        '/*! one text *//*! another text */',
        '__ESCAPED_COMMENT_CLEAN_CSS0____ESCAPED_COMMENT_CLEAN_CSS1__',
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
        '__ESCAPED_COMMENT_CLEAN_CSS0__',
        ''
      ],
      'two special comments': [
        '/*! one text *//*! another text */',
        '__ESCAPED_COMMENT_CLEAN_CSS0____ESCAPED_COMMENT_CLEAN_CSS1__',
        ''
      ]
    }, '0')
  )
  .addBatch(
    processorContext('zero with breaks', {
      'content and special comments': [
        'a{}' + lineBreak + '/*! some text */' + lineBreak + 'p{}',
        'a{}' + lineBreak + '__ESCAPED_COMMENT_CLEAN_CSS0__' + lineBreak + 'p{}',
        'a{}' + lineBreak + 'p{}'
      ]
    }, '0', true)
  )
  .addBatch(
    processorContext('one with breaks', {
      'forces break after comments': [
        'a{}/*! some text */p{}',
        'a{}__ESCAPED_COMMENT_CLEAN_CSS0__p{}',
        'a{}/*! some text */' + lineBreak + 'p{}'
      ],
      'if not given already comments': [
        'a{}/*! some text */' + lineBreak + 'p{}',
        'a{}__ESCAPED_COMMENT_CLEAN_CSS0__' + lineBreak + 'p{}',
        'a{}/*! some text */' + lineBreak + 'p{}'
      ],
      'if given an other platform break already': [
        'a{}/*! some text */' + otherLineBreak + 'p{}',
        'a{}__ESCAPED_COMMENT_CLEAN_CSS0__' + otherLineBreak + 'p{}',
        'a{}/*! some text */' + otherLineBreak + 'p{}'
      ]
    }, '1', true)
  )
  .export(module);
