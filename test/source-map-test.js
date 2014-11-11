var vows = require('vows');
var assert = require('assert');
var CleanCSS = require('../index');

var fs = require('fs');
var path = require('path');
var inputMapPath = path.join('test', 'data', 'source-maps', 'sample.map');
var inputMap = fs.readFileSync(inputMapPath, 'utf-8');

vows.describe('source-map')
  .addBatch({
    'module #1': {
      'topic': new CleanCSS({ sourceMap: true }).minify('/*! a */div[data-id=" abc "] { color:red; }'),
      'should have 2 mappings': function(minified) {
        assert.equal(2, minified.sourceMap._mappings.length);
      },
      'should have selector mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 9,
          originalLine: 1,
          originalColumn: 9,
          source: '__stdin__.css',
          name: 'div[data-id=" abc "]'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[0]);
      },
      'should have body mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 30,
          originalLine: 1,
          originalColumn: 32,
          source: '__stdin__.css',
          name: 'color:red'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[1]);
      }
    },
    'module #2': {
      'topic': new CleanCSS({ sourceMap: true }).minify('@media screen {\n@font-face \n{ \nfont-family: test; } }'),
      'should have 3 mappings': function(minified) {
        assert.equal(3, minified.sourceMap._mappings.length);
      },
      'should have @media mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 1,
          originalLine: 1,
          originalColumn: 1,
          source: '__stdin__.css',
          name: '@media screen'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[0]);
      },
      'should have @font-face mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 15,
          originalLine: 2,
          originalColumn: 1,
          source: '__stdin__.css',
          name: '@font-face'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[1]);
      },
      'should have font-family mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 26,
          originalLine: 4,
          originalColumn: 1,
          source: '__stdin__.css',
          name: 'font-family:test'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[2]);
      }
    },
    'with keepBreaks': {
      'topic': new CleanCSS({ sourceMap: true, keepBreaks: true }).minify('@media screen { a{color:red} p {color:blue} }div{color:pink}'),
      'should have 7 mappings': function(minified) {
        assert.equal(7, minified.sourceMap._mappings.length);
      },
      'should have @media mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 1,
          originalLine: 1,
          originalColumn: 1,
          source: '__stdin__.css',
          name: '@media screen'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[0]);
      },
      'should have _a_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 15,
          originalLine: 1,
          originalColumn: 17,
          source: '__stdin__.css',
          name: 'a'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[1]);
      },
      'should have _color:red_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 17,
          originalLine: 1,
          originalColumn: 19,
          source: '__stdin__.css',
          name: 'color:red'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[2]);
      },
      'should have _p_ mapping': function (minified) {
        var mapping = {
          generatedLine: 2,
          generatedColumn: 1,
          originalLine: 1,
          originalColumn: 30,
          source: '__stdin__.css',
          name: 'p'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[3]);
      },
      'should have _color:blue_ mapping': function (minified) {
        var mapping = {
          generatedLine: 2,
          generatedColumn: 3,
          originalLine: 1,
          originalColumn: 33,
          source: '__stdin__.css',
          name: 'color:#00f'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[4]);
      },
      'should have _div_ mapping': function (minified) {
        var mapping = {
          generatedLine: 4,
          generatedColumn: 1,
          originalLine: 1,
          originalColumn: 46,
          source: '__stdin__.css',
          name: 'div'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[5]);
      },
      'should have _color:pink_ mapping': function (minified) {
        var mapping = {
          generatedLine: 4,
          generatedColumn: 5,
          originalLine: 1,
          originalColumn: 50,
          source: '__stdin__.css',
          name: 'color:pink'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[6]);
      }
    },
    'shorthands': {
      'topic': new CleanCSS({ sourceMap: true }).minify('a{background:url(image.png);background-color:red}'),
      'should have 3 mappings': function(minified) {
        assert.equal(3, minified.sourceMap._mappings.length);
      },
      'should have selector mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 1,
          originalLine: 1,
          originalColumn: 1,
          source: '__stdin__.css',
          name: 'a'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[0]);
      },
      'should have _background_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 3,
          originalLine: 1,
          originalColumn: 3,
          source: '__stdin__.css',
          name: 'background:url(image.png)'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[1]);
      },
      'should have _background-color_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 29,
          originalLine: 1,
          originalColumn: 29,
          source: '__stdin__.css',
          name: 'background-color:red'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[2]);
      }
    },
  })
  .addBatch({
    'input map as string': {
      'topic': new CleanCSS({ sourceMap: inputMap }).minify('div > a {\n  color: red;\n}'),
      'should have 2 mappings': function (minified) {
        assert.equal(2, minified.sourceMap._mappings.length);
      },
      'should have selector mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 1,
          originalLine: 1,
          originalColumn: 1,
          source: 'styles.less',
          name: 'div>a'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[0]);
      },
      'should have _color:red_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 7,
          originalLine: 3,
          originalColumn: 4,
          source: 'styles.less',
          name: 'color:red'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[1]);
      }
    },
    'input map from source': {
      'topic': new CleanCSS().minify('div > a {\n  color: red;\n}/*# sourceMappingURL=' + inputMapPath + ' */'),
      'should have 2 mappings': function (minified) {
        assert.equal(2, minified.sourceMap._mappings.length);
      },
      'should have selector mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 1,
          originalLine: 1,
          originalColumn: 1,
          source: 'styles.less',
          name: 'div>a'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[0]);
      },
      'should have _color:red_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 7,
          originalLine: 3,
          originalColumn: 4,
          source: 'styles.less',
          name: 'color:red'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[1]);
      }
    },
    'input map from source with root': {
      'topic': new CleanCSS({ root: path.dirname(inputMapPath) }).minify('div > a {\n  color: red;\n}/*# sourceMappingURL=sample.map */'),
      'should have 2 mappings': function (minified) {
        assert.equal(2, minified.sourceMap._mappings.length);
      },
      'should have selector mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 1,
          originalLine: 1,
          originalColumn: 1,
          source: 'styles.less',
          name: 'div>a'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[0]);
      },
      'should have _color:red_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 7,
          originalLine: 3,
          originalColumn: 4,
          source: 'styles.less',
          name: 'color:red'
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[1]);
      }
    }
  })
  .export(module);
