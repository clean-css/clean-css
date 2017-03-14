/* jshint unused: false */

var assert = require('assert');
var fs = require('fs');
var http = require('http');
var path = require('path');

var enableDestroy = require('server-destroy');
var nock = require('nock');
var vows = require('vows');
var port = 24682;

var CleanCSS = require('../index');

var inputMapPath = path.join('test', 'fixtures', 'source-maps', 'styles.css.map');
var inputMap = fs.readFileSync(inputMapPath, 'utf-8');
var lineBreak = require('os').EOL;
var escape = global.escape;

vows.describe('source-map')
  .addBatch({
    'vendor prefix with comments': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify('html{font-family:sans-serif;/* 1 */-ms-text-size-adjust:100%;/* 2 */-webkit-text-size-adjust:100%/* 3 */}');
      },
      'gets right output': function (minified) {
        assert.equal(minified.styles, 'html{font-family:sans-serif;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}');
      }
    },
    'background gradient': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify('a{background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0, rgba(0, 0, 0, 0.1))}');
      },
      'gets right output': function (minified) {
        assert.equal(minified.styles, 'a{background:linear-gradient(to bottom,rgba(0,0,0,.1) 0,rgba(0,0,0,.1))}');
      }
    },
    'background shorthand defaults': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify('a{background: #ffffff none repeat scroll 0 0}');
      },
      'gets right output': function (minified) {
        assert.equal(minified.styles, 'a{background:#fff}');
      }
    },
    'background position and size': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify('a{background:url(image.png) 0 0 / 100% no-repeat}');
      },
      'gets right output': function (minified) {
        assert.equal(minified.styles, 'a{background:url(image.png) 0 0/100% no-repeat}');
      }
    },
    'background position and size without image': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify('a{background: 50% 50% / 100% auto no-repeat currentColor}');
      },
      'gets right output': function (minified) {
        assert.equal(minified.styles, 'a{background:50% 50%/100% auto no-repeat currentColor}');
      }
    },
    'important': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify('@font-face{font-family:si}a{font-family:si!important}');
      },
      'gets right output': function (minified) {
        assert.equal(minified.styles, '@font-face{font-family:si}a{font-family:si!important}');
      }
    },
    'variables': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify(':root{--color:red}');
      },
      'gets right output': function (minified) {
        assert.equal(minified.styles, ':root{--color:red}');
      }
    },
    'variables reused': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify(':root{--color:var(--otherColor)}');
      },
      'gets right output': function (minified) {
        assert.equal(minified.styles, ':root{--color:var(--otherColor)}');
      }
    },
    'empty rules and comments': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify('p{/* comment */}');
      },
      'gets right output': function (minified) {
        assert.equal(minified.styles, '');
      }
    }
  })
  .addBatch({
    'module #1': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify('/*! a */div[data-id=" abc "] { color:red; }');
      },
      'has 3 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 4);
      },
      'has comment mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'has selector mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 8,
          originalLine: 1,
          originalColumn: 8,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'has name mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 29,
          originalLine: 1,
          originalColumn: 31,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      },
      'has value mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 35,
          originalLine: 1,
          originalColumn: 37,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[3], mapping);
      }
    },
    'module #2': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify('@media screen {\n@font-face \n{ \nfont-family: test; } }');
      },
      'has 4 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 4);
      },
      'has `@media` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'has `@font-face mapping`': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 14,
          originalLine: 2,
          originalColumn: 0,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'has `font-family` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 25,
          originalLine: 4,
          originalColumn: 0,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      },
      'has `test` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 25,
          originalLine: 4,
          originalColumn: 0,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      }
    },
    'with formatting': {
      'topic': function () {
        return new CleanCSS({ format: 'keep-breaks', level: 2, sourceMap: true }).minify('@media screen { a{color:red} p {color:blue} }div{color:pink}');
      },
      'has 10 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 10);
      },
      'has `@media` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'has `a` mapping': function (minified) {
        var mapping = {
          generatedLine: 2,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 16,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'has `color` mapping': function (minified) {
        var mapping = {
          generatedLine: 2,
          generatedColumn: 2,
          originalLine: 1,
          originalColumn: 18,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      },
      'has `red` mapping': function (minified) {
        var mapping = {
          generatedLine: 2,
          generatedColumn: 8,
          originalLine: 1,
          originalColumn: 24,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[3], mapping);
      },
      'has `p` mapping': function (minified) {
        var mapping = {
          generatedLine: 3,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 29,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[4], mapping);
      },
      'has second `color` mapping': function (minified) {
        var mapping = {
          generatedLine: 3,
          generatedColumn: 2,
          originalLine: 1,
          originalColumn: 32,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[5], mapping);
      },
      'has `blue` mapping': function (minified) {
        var mapping = {
          generatedLine: 3,
          generatedColumn: 8,
          originalLine: 1,
          originalColumn: 38,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[6], mapping);
      },
      'has `div` mapping': function (minified) {
        var mapping = {
          generatedLine: 5,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 45,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[7], mapping);
      },
      'has third `color` mapping': function (minified) {
        var mapping = {
          generatedLine: 5,
          generatedColumn: 4,
          originalLine: 1,
          originalColumn: 49,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[8], mapping);
      },
      'has `pink` mapping': function (minified) {
        var mapping = {
          generatedLine: 5,
          generatedColumn: 10,
          originalLine: 1,
          originalColumn: 55,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[9], mapping);
      }
    },
    'keyframes': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify('@-webkit-keyframes frames {\n  0% {\n    border: 1px;\n  }\n  100% {\n    border: 3px;\n  }\n}');
      },
      'has 7 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 7);
      },
      'has `@keframes` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'has `0%` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 26,
          originalLine: 2,
          originalColumn: 2,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'has `border` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 29,
          originalLine: 3,
          originalColumn: 4,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      },
      'has `1px` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 36,
          originalLine: 3,
          originalColumn: 12,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[3], mapping);
      },
      'has `100%` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 40,
          originalLine: 5,
          originalColumn: 2,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[4], mapping);
      },
      'has second `border` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 45,
          originalLine: 6,
          originalColumn: 4,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[5], mapping);
      },
      'has `3px` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 52,
          originalLine: 6,
          originalColumn: 12,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[6], mapping);
      }
    },
    'double comments': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify('/* COMMENT 1 */\n/* COMMENT 2 */\ndiv{color:red}');
      },
      'has 3 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 3);
      },
      'has `div`_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 3,
          originalColumn: 0,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'has `color` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 4,
          originalLine: 3,
          originalColumn: 4,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'has `red` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 10,
          originalLine: 3,
          originalColumn: 10,
          source: '$stdin',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      }
    }
  })
  .addBatch({
    'input map as string': {
      'topic': function () {
        return new CleanCSS({ sourceMap: true }).minify('div > a {\n  color: red;\n}', inputMap);
      },
      'has 3 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 3);
      },
      'has `div > a` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 4,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'has `color` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 6,
          originalLine: 2,
          originalColumn: 2,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'has `red` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 12,
          originalLine: 2,
          originalColumn: 2,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      }
    },
    'input map as source map object': {
      'topic': function () {
        return new CleanCSS({ sourceMap: true }).minify('div > a {\n  color: red;\n}', JSON.parse(inputMap));
      },
      'has 3 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 3);
      },
      'has `div > a` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 4,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'has `color` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 6,
          originalLine: 2,
          originalColumn: 2,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'has `red` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 12,
          originalLine: 2,
          originalColumn: 2,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      }
    },
    'input map and a callback': {
      'topic': function () {
        new CleanCSS({ sourceMap: true }).minify('div > a {\n  color: red;\n}', JSON.parse(inputMap), this.callback);
      },
      'has 3 mappings': function (error, minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 3);
      },
      'has `div > a` mapping': function (error, minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 4,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'has `color` mapping': function (error, minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 6,
          originalLine: 2,
          originalColumn: 2,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'has `red` mapping': function (error, minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 12,
          originalLine: 2,
          originalColumn: 2,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      }
    },
    'input map from source': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify('div > a {\n  color: red;\n}/*# sourceMappingURL=' + inputMapPath + ' */');
      },
      'has 3 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 3);
      },
      'has `div > a` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 4,
          source: path.join('test', 'fixtures', 'source-maps', 'styles.less'),
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'has `color` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 6,
          originalLine: 2,
          originalColumn: 2,
          source: path.join('test', 'fixtures', 'source-maps', 'styles.less'),
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'has second `color` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 12,
          originalLine: 2,
          originalColumn: 2,
          source: path.join('test', 'fixtures', 'source-maps', 'styles.less'),
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      }
    },
    'input map from source with rebaseTo': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true, rebaseTo: './test/fixtures' }).minify('div > a {\n  color: red;\n}/*# sourceMappingURL=' + inputMapPath + ' */');
      },
      'has 3 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 3);
      },
      'has `div > a` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 4,
          source: path.join('source-maps', 'styles.less'),
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'has `color` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 6,
          originalLine: 2,
          originalColumn: 2,
          source: path.join('source-maps', 'styles.less'),
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'has `red` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 12,
          originalLine: 2,
          originalColumn: 2,
          source: path.join('source-maps', 'styles.less'),
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      }
    },
    'input map as inlined data URI with implicit charset us-ascii, not base64, no content-type': inlineDataUriContext('data:,' + escape(inputMap)),
    'input map as inlined data URI with implicit charset us-ascii, base64': inlineDataUriContext('data:application/json;base64,' + new Buffer(inputMap, 'ascii').toString('base64')),
    'input map as inlined data URI with implicit charset us-ascii, not base64': inlineDataUriContext('data:application/json,' + escape(inputMap)),
    'input map as inlined data URI with charset utf-8, base64': inlineDataUriContext('data:application/json;charset=utf-8;base64,' + new Buffer(inputMap, 'utf8').toString('base64')),
    'input map as inlined data URI with charset utf-8, not base64': inlineDataUriContext('data:application/json;charset=utf-8,' + escape(String.fromCharCode.apply(String, new Buffer(inputMap, 'utf8')))),
    'input map as inlined data URI with explicit charset us-ascii, base64': inlineDataUriContext('data:application/json;charset=us-ascii;base64,' + new Buffer(inputMap, 'ascii').toString('base64')),
    'input map as inlined data URI with explicit charset us-ascii, not base64': inlineDataUriContext('data:application/json;charset=us-ascii,' + escape(inputMap)),
    'complex input map': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify('@import url(' + path.dirname(inputMapPath) + '/import.css);');
      },
      'has 6 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 6);
      },
      'has `div` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          source: path.join(path.dirname(inputMapPath), 'some.less'),
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'has `color` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 4,
          originalLine: 2,
          originalColumn: 2,
          source: path.join(path.dirname(inputMapPath), 'some.less'),
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'has `red` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 10,
          originalLine: 2,
          originalColumn: 2,
          source: path.join(path.dirname(inputMapPath), 'some.less'),
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      },
      'has `div > a` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 14,
          originalLine: 1,
          originalColumn: 4,
          source: path.join(path.dirname(inputMapPath), 'styles.less'),
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[3], mapping);
      },
      'has second `color` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 20,
          originalLine: 2,
          originalColumn: 2,
          source: path.join(path.dirname(inputMapPath), 'styles.less'),
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[4], mapping);
      },
      'has `blue` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 26,
          originalLine: 2,
          originalColumn: 2,
          source: path.join(path.dirname(inputMapPath), 'styles.less'),
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[5], mapping);
      }
    },
    'complex but partial input map referenced by path': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify('@import url(test/fixtures/source-maps/no-map-import.css);');
      },
      'has 6 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 6);
      },
      'has 3 mappings to .less file': function (minified) {
        var fromLess = minified.sourceMap._mappings._array.filter(function (mapping) {
          return mapping.source == path.join('test', 'fixtures', 'source-maps', 'styles.less');
        });
        assert.lengthOf(fromLess, 3);
      },
      'has 3 mappings to .css file': function (minified) {
        var fromCSS = minified.sourceMap._mappings._array.filter(function (mapping) {
          return mapping.source == path.join('test', 'fixtures', 'source-maps', 'no-map.css');
        });
        assert.lengthOf(fromCSS, 3);
      }
    },
    'complex input map with an existing file as rebaseTo': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true, rebaseTo: path.join('test', 'fixtures', 'source-maps') }).minify('@import url(test/fixtures/source-maps/styles.css);');
      },
      'has 3 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 3);
      },
      'has 3 mappings to styles.less file': function (minified) {
        var stylesSource = minified.sourceMap._mappings._array.filter(function (mapping) {
          return mapping.source == 'styles.less';
        });
        assert.lengthOf(stylesSource, 3);
      }
    },
    'nested once': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify('@import url(test/fixtures/source-maps/nested/once.css);');
      },
      'has 3 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 3);
      },
      'has `section > div a` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 2,
          originalColumn: 8,
          source: path.join('test', 'fixtures', 'source-maps', 'nested/once.less'),
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'has `color` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 14,
          originalLine: 3,
          originalColumn: 4,
          source: path.join('test', 'fixtures', 'source-maps', 'nested/once.less'),
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'has `red` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 20,
          originalLine: 3,
          originalColumn: 4,
          source: path.join('test', 'fixtures', 'source-maps', 'nested/once.less'),
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      }
    },
    'nested twice': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify('@import url(test/fixtures/source-maps/nested/twice.css);');
      },
      'has 3 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 3);
      },
      'has `body > nav a` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 3,
          originalColumn: 4,
          source: path.join('test', 'fixtures', 'source-maps', 'nested/twice.less'),
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'has `color` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 11,
          originalLine: 4,
          originalColumn: 6,
          source: path.join('test', 'fixtures', 'source-maps', 'nested/twice.less'),
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'has `red` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 17,
          originalLine: 4,
          originalColumn: 6,
          source: path.join('test', 'fixtures', 'source-maps', 'nested/twice.less'),
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      }
    },
    'input source map with missing mutliselector input': {
      'topic': function () {
        return new CleanCSS({ sourceMap: true })
          .minify(
            'a,\na:hover,\na:visited\n{\n    color: red;\n}',
            '{"version":3,"sources":["source.css"],"names":[],"mappings":"AAAA;;;;IAII,YAAW;EACd"}'
          );
      },
      'has 5 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 5);
      },
      'has `a` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          source: 'source.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'has `a:hover` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 2,
          originalLine: 1,
          originalColumn: 0,
          source: 'source.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'has `a:visited` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 10,
          originalLine: 1,
          originalColumn: 0,
          source: 'source.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      },
      'has `color` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 20,
          originalLine: 5,
          originalColumn: 4,
          source: 'source.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[3], mapping);
      },
      'has `red` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 26,
          originalLine: 5,
          originalColumn: 4,
          source: 'source.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[4], mapping);
      }
    },
    'input source map with missing mutliselector sortable input': {
      'topic': function () {
        return new CleanCSS({ sourceMap: true })
          .minify(
            'a.button:link,\na.button:visited,\na.button:hover\n{\n    color: red;\n}',
            '{"version":3,"sources":["source.css"],"names":[],"mappings":"AAAA;;;;IAII,YAAW;EACd"}'
          );
      },
      'has 5 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 5);
      },
      'has `a.button:hover` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          source: 'source.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'has `a.button:link` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 15,
          originalLine: 1,
          originalColumn: 0,
          source: 'source.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'has `a.button:visited` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 29,
          originalLine: 1,
          originalColumn: 0,
          source: 'source.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      },
      'has `color` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 46,
          originalLine: 5,
          originalColumn: 4,
          source: 'source.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[3], mapping);
      },
      'has `red` mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 52,
          originalLine: 5,
          originalColumn: 4,
          source: 'source.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[4], mapping);
      }
    }
  })
  .addBatch({
    'invalid response for external source map': {
      topic: function () {
        this.reqMocks = nock('http://127.0.0.1')
          .get('/remote.css')
          .reply(200, '/*# sourceMappingURL=http://127.0.0.1/remote.css.map */')
          .get('/remote.css.map')
          .reply(404);

        new CleanCSS({ inline: 'all', sourceMap: true }).minify('@import url(http://127.0.0.1/remote.css);', this.callback);
      },
      'has mapping': function (errors, minified) {
        assert.isDefined(minified.sourceMap);
      },
      'raises no errors': function (errors, _) {
        assert.isNull(errors);
      },
      'raises a warning': function (_, minified) {
        assert.lengthOf(minified.warnings, 1);
        assert.equal(minified.warnings[0], 'Missing source map at "http://127.0.0.1/remote.css.map" - 404');
      },
      teardown: function () {
        assert.isTrue(this.reqMocks.isDone());
        nock.cleanAll();
      }
    },
    'timed out response for external source map': {
      topic: function () {
        nock.enableNetConnect();

        var self = this;
        var timeout = 100;

        this.server = http.createServer(function (req, res) {
          switch (req.url) {
            case '/remote.css':
              res.writeHead(200);
              res.write('/*# sourceMappingURL=http://127.0.0.1:' + port + '/remote.css.map */');
              res.end();
              break;
            case '/remote.css.map':
              setTimeout(function () {}, timeout * 2);
          }
        });
        this.server.listen(port, '127.0.0.1', function () {
          new CleanCSS({ inline: 'all', inlineTimeout: timeout, sourceMap: true })
            .minify('@import url(http://127.0.0.1:' + port + '/remote.css);', self.callback);
        });
        enableDestroy(this.server);
      },
      'has mapping': function (errors, minified) {
        assert.isDefined(minified.sourceMap);
      },
      'raises no errors': function (errors, _) {
        assert.isNull(errors);
      },
      'raises a warning': function (_, minified) {
        assert.lengthOf(minified.warnings, 1);
        assert.equal(minified.warnings[0], 'Missing source map at "http://127.0.0.1:24682/remote.css.map" - timeout');
      },
      teardown: function () {
        this.server.destroy();
        nock.disableNetConnect();
      }
    },
    'absolute source map from external host via http': {
      topic: function () {
        this.reqMocks = nock('http://127.0.0.1')
          .get('/remote.css')
          .reply(200, 'div>a{color:blue}/*# sourceMappingURL=http://127.0.0.1/remote.css.map */')
          .get('/remote.css.map')
          .reply(200, inputMap);

        new CleanCSS({ inline: 'all', sourceMap: true }).minify('@import url(http://127.0.0.1/remote.css);', this.callback);
      },
      'has mapping': function (errors, minified) {
        assert.isDefined(minified.sourceMap);
      },
      'maps to external source file': function (errors, minified) {
        assert.equal(minified.sourceMap._mappings._array[0].source, 'http://127.0.0.1/styles.less');
      },
      teardown: function () {
        assert.isTrue(this.reqMocks.isDone());
        nock.cleanAll();
      }
    },
    'absolute source map from external host via https': {
      topic: function () {
        this.reqMocks = nock('https://127.0.0.1')
          .get('/remote.css')
          .reply(200, 'div>a{color:blue}/*# sourceMappingURL=https://127.0.0.1/remote.css.map */')
          .get('/remote.css.map')
          .reply(200, inputMap);

        new CleanCSS({ inline: 'all', sourceMap: true }).minify('@import url(https://127.0.0.1/remote.css);', this.callback);
      },
      'has mapping': function (errors, minified) {
        assert.isDefined(minified.sourceMap);
      },
      'maps to external source file': function (errors, minified) {
        assert.equal(minified.sourceMap._mappings._array[0].source, 'https://127.0.0.1/styles.less');
      },
      teardown: function () {
        assert.isTrue(this.reqMocks.isDone());
        nock.cleanAll();
      }
    },
    'relative source map from external host': {
      topic: function () {
        this.reqMocks = nock('http://127.0.0.1')
          .get('/remote.css')
          .reply(200, 'div>a{color:blue}/*# sourceMappingURL=remote.css.map */')
          .get('/remote.css.map')
          .reply(200, inputMap);

        new CleanCSS({ inline: 'all', sourceMap: true }).minify('@import url(http://127.0.0.1/remote.css);', this.callback);
      },
      'has mapping': function (errors, minified) {
        assert.isDefined(minified.sourceMap);
      },
      'maps to external source file': function (errors, minified) {
        assert.equal(minified.sourceMap._mappings._array[0].source, 'http://127.0.0.1/styles.less');
      },
      teardown: function () {
        assert.isTrue(this.reqMocks.isDone());
        nock.cleanAll();
      }
    },
    'missing source map from external host when source maps are disabled': {
      topic: function () {
        this.reqMocks = nock('http://127.0.0.1')
          .get('/remote.css')
          .reply(200, 'div>a{color:blue}/*# sourceMappingURL=missing.css.map */');

        new CleanCSS({ inline: 'all', sourceMap: false }).minify('@import url(http://127.0.0.1/remote.css);', this.callback);
      },
      'has no warnings': function (errors, minified) {
        assert.lengthOf(minified.warnings, 0);
      },
      teardown: function () {
        assert.isTrue(this.reqMocks.isDone());
        nock.cleanAll();
      }
    },
    'available via POST only': {
      topic: function () {
        this.reqMocks = nock('http://127.0.0.1')
          .post('/remote.css')
          .reply(200, 'div>a{color:blue}/*# sourceMappingURL=remote.css.map */')
          .post('/remote.css.map')
          .reply(200, inputMap);

        new CleanCSS({ inline: 'all', inlineRequest: { method: 'POST' }, sourceMap: true })
          .minify('@import url(http://127.0.0.1/remote.css);', this.callback);
      },
      'has mapping': function (errors, minified) {
        assert.isDefined(minified.sourceMap);
      },
      'maps to external source file': function (errors, minified) {
        assert.equal(minified.sourceMap._mappings._array[0].source, 'http://127.0.0.1/styles.less');
      },
      teardown: function () {
        assert.isTrue(this.reqMocks.isDone());
        nock.cleanAll();
      }
    }
  })
  .addBatch({
    'important comment after a property': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify('div { color: #f00 !important; /*!comment*/ }');
      },
      'has right output': function (errors, minified) {
        assert.equal(minified.styles, 'div{color:red!important/*!comment*/}');
      }
    },
    'important comment between properties': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify('div { color: #f00 !important; /*!comment*/; display: block }');
      },
      'has right output': function (errors, minified) {
        assert.equal(minified.styles, 'div{color:red!important;/*!comment*/display:block}');
      }
    },
    'important comments after a property': {
      'topic': function () {
        return new CleanCSS({ level: 2, sourceMap: true }).minify('div { color: #f00 !important; /*!1*//*!2*/ }');
      },
      'has right output': function (errors, minified) {
        assert.equal(minified.styles, 'div{color:red!important/*!1*//*!2*/}');
      }
    },
    'important comments after a property with remove comments': {
      'topic': function () {
        return new CleanCSS({ level: { 1: { specialComments: 1 } }, sourceMap: true }).minify('div { color: #f00 !important; /*!1*/} /*!2*/ a{/*!3*/}');
      },
      'has right output': function (errors, minified) {
        assert.equal(minified.styles, 'div{color:red!important/*!1*/}');
      }
    }
  })
  .addBatch({
    'multiple source maps': {
      'relative to local': {
        'topic': function () {
          return new CleanCSS({ level: 2, sourceMap: true }).minify({
            'test/fixtures/source-maps/some.css': {
              styles: 'div {\n  color: red;\n}',
              sourceMap: '{"version":3,"sources":["some.less"],"names":[],"mappings":"AAAA;EACE,UAAA","file":"some.css"}'
            },
            'test/fixtures/source-maps/styles.css': {
              styles: 'div > a {\n  color: blue;\n}',
              sourceMap: '{"version":3,"sources":["styles.less"],"names":[],"mappings":"AAAA,GAAI;EACF,WAAA","file":"styles.css"}'
            },
            'test/fixtures/source-maps/nested/once.css': {
              styles: 'section > div a {\n  color: red;\n}',
              sourceMap: '{"version":3,"sources":["once.less"],"names":[],"mappings":"AAAA,OACE,MAAM;EACJ,UAAA","file":"once.css"}'
            }
          });
        },
        'has right output': function (errors, minified) {
          assert.equal(minified.styles, 'div,section>div a{color:red}div>a{color:#00f}');
        },
        'has 7 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 7);
        },
        'has `div` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 0,
            originalLine: 1,
            originalColumn: 0,
            source: path.join('test', 'fixtures', 'source-maps', 'some.less'),
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
        },
        'has `section > div a` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 4,
            originalLine: 2,
            originalColumn: 8,
            source: path.join('test', 'fixtures', 'source-maps', 'nested/once.less'),
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
        },
        'has `color` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 18,
            originalLine: 2,
            originalColumn: 2,
            source: path.join('test', 'fixtures', 'source-maps', 'some.less'),
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
        },
        'has `red` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 24,
            originalLine: 2,
            originalColumn: 2,
            source: path.join('test', 'fixtures', 'source-maps', 'some.less'),
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[3], mapping);
        },
        'has `div > a` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 28,
            originalLine: 1,
            originalColumn: 4,
            source: path.join('test', 'fixtures', 'source-maps', 'styles.less'),
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[4], mapping);
        },
        'has second `color` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 34,
            originalLine: 2,
            originalColumn: 2,
            source: path.join('test', 'fixtures', 'source-maps', 'styles.less'),
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[5], mapping);
        },
        'has `#00f` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 40,
            originalLine: 2,
            originalColumn: 2,
            source: path.join('test', 'fixtures', 'source-maps', 'styles.less'),
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[6], mapping);
        }
      }
    },
    'relative to path': {
      'complex but partial input map referenced by path': {
        'topic': function () {
          return new CleanCSS({ level: 2, sourceMap: true, rebaseTo: './test' }).minify({
            'test/fixtures/source-maps/some.css': {
              styles: 'div {\n  color: red;\n}',
              sourceMap: '{"version":3,"sources":["some.less"],"names":[],"mappings":"AAAA;EACE,UAAA","file":"some.css"}'
            },
            'test/fixtures/source-maps/styles.css': {
              styles: 'div > a {\n  color: blue;\n}',
              sourceMap: '{"version":3,"sources":["styles.less"],"names":[],"mappings":"AAAA,GAAI;EACF,WAAA","file":"styles.css"}'
            },
            'test/fixtures/source-maps/nested/once.css': {
              styles: 'section > div a {\n  color: red;\n}',
              sourceMap: '{"version":3,"sources":["once.less"],"names":[],"mappings":"AAAA,OACE,MAAM;EACJ,UAAA","file":"once.css"}'
            }
          });
        },
        'has 7 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 7);
        },
        'has right sources': function (minified) {
          var sources = [];
          minified.sourceMap._mappings._array.forEach(function (m) {
            if (sources.indexOf(m.source) === -1)
              sources.push(m.source);
          });

          assert.deepEqual(sources, [
            path.join('fixtures', 'source-maps', 'some.less'),
            path.join('fixtures', 'source-maps', 'nested', 'once.less'),
            path.join('fixtures', 'source-maps', 'styles.less')
          ]);
        }
      }
    }
  })
  .addBatch({
    'inlined sources': {
      'from string - off': {
        'topic': function () {
          return new CleanCSS({ level: 2, sourceMap: true }).minify('div > a {\n  color: red;\n}');
        },
        'has 3 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 3);
        },
        'has embedded sources': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sources, ['$stdin']);
        },
        'has embedded sources content': function (minified) {
          assert.isUndefined(JSON.parse(minified.sourceMap.toString()).sourcesContent);
        },
        'has selector mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 0,
            originalLine: 1,
            originalColumn: 0,
            source: '$stdin',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
        },
        'has `color` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 6,
            originalLine: 2,
            originalColumn: 2,
            source: '$stdin',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
        },
        'has `red` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 12,
            originalLine: 2,
            originalColumn: 9,
            source: '$stdin',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
        }
      },
      'from string - on': {
        'topic': function () {
          return new CleanCSS({ level: 2, sourceMap: true, sourceMapInlineSources: true }).minify('div > a {\n  color: red;\n}');
        },
        'has 3 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 3);
        },
        'has embedded sources': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sources, ['$stdin']);
        },
        'has embedded sources content': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sourcesContent, ['div > a {\n  color: red;\n}']);
        }
      },
      'from array - off': {
        'topic': function () {
          return new CleanCSS({ level: 2, sourceMap: true }).minify([
            path.join('test', 'fixtures', 'partials', 'one.css'),
            path.join('test', 'fixtures', 'partials', 'three.css')
          ]);
        },
        'has 6 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 6);
        },
        'has embedded sources': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sources, [
            path.join('test', 'fixtures', 'partials', 'one.css'),
            path.join('test', 'fixtures', 'partials', 'three.css')
          ]);
        },
        'has embedded sources content': function (minified) {
          assert.isUndefined(JSON.parse(minified.sourceMap.toString()).sourcesContent);
        }
      },
      'from array - on': {
        'topic': function () {
          return new CleanCSS({ level: 2, sourceMap: true, sourceMapInlineSources: true }).minify([
            path.join('test', 'fixtures', 'partials', 'one.css'),
            path.join('test', 'fixtures', 'partials', 'three.css')
          ]);
        },
        'has 6 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 6);
        },
        'has embedded sources': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sources, [
            path.join('test', 'fixtures', 'partials', 'one.css'),
            path.join('test', 'fixtures', 'partials', 'three.css')
          ]);
        },
        'has embedded sources content': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sourcesContent, [
            '.one { color:#f00; }' + lineBreak,
            '.three {background-image: url(extra/down.gif);}' + lineBreak
          ]);
        }
      },
      'from array - on remote': {
        'topic': function () {
          this.reqMocks = nock('http://127.0.0.1')
            .get('/some.css')
            .reply(200, 'div{background:url(image.png)}');

          new CleanCSS({ inline: 'all', sourceMap: true, sourceMapInlineSources: true }).minify([
            'http://127.0.0.1/some.css'
          ], this.callback);
        },
        'has 3 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 3);
        },
        'has embedded sources': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sources, [
            'http://127.0.0.1/some.css'
          ]);
        },
        'has embedded sources content': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sourcesContent, [
            'div{background:url(image.png)}',
          ]);
        },
        'teardown': function () {
          assert.isTrue(this.reqMocks.isDone());
          nock.cleanAll();
        }
      },
      'from hash - off': {
        'topic': function () {
          return new CleanCSS({ level: 2, sourceMap: true }).minify({
            'test/fixtures/source-maps/some.css': {
              styles: 'div {\n  color: red;\n}'
            },
            'test/fixtures/source-maps/styles.css': {
              styles: 'div > a {\n  color: blue;\n}'
            },
            'test/fixtures/source-maps/nested/once.css': {
              styles: 'section > div a {\n  color: red;\n}'
            }
          });
        },
        'has 7 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 7);
        },
        'has embedded sources': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sources, [
            path.join('test', 'fixtures', 'source-maps', 'some.css'),
            path.join('test', 'fixtures', 'source-maps', 'nested', 'once.css'),
            path.join('test', 'fixtures', 'source-maps', 'styles.css')
          ]);
        },
        'has embedded sources content': function (minified) {
          assert.isUndefined(JSON.parse(minified.sourceMap.toString()).sourcesContent);
        }
      },
      'from hash - on': {
        'topic': function () {
          return new CleanCSS({ level: 2, sourceMap: true, sourceMapInlineSources: true }).minify({
            'test/fixtures/source-maps/some.css': {
              styles: 'div {\n  color: red;\n}'
            },
            'test/fixtures/source-maps/styles.css': {
              styles: 'div > a {\n  color: blue;\n}'
            },
            'test/fixtures/source-maps/nested/once.css': {
              styles: 'section > div a {\n  color: red;\n}'
            }
          });
        },
        'has 7 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 7);
        },
        'has embedded sources': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sources, [
            path.join('test', 'fixtures', 'source-maps', 'some.css'),
            path.join('test', 'fixtures', 'source-maps', 'nested', 'once.css'),
            path.join('test', 'fixtures', 'source-maps', 'styles.css')
          ]);
        },
        'has embedded sources content': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sourcesContent, [
            'div {\n  color: red;\n}',
            'section > div a {\n  color: red;\n}',
            'div > a {\n  color: blue;\n}'
          ]);
        }
      }
    }
  })
  .addBatch({
    'inlined sources from source map(s)': {
      'single': {
        'topic': function () {
          return new CleanCSS({
            sourceMap: true,
            sourceMapInlineSources: true
          }).minify(
            'div > a {\n  color: red;\n}',
            '{"version":3,"sources":["styles.less"],"names":[],"mappings":"AAAA,GAAI;EACF,WAAA","file":"styles.css","sourcesContent":["div > a {\\n  color: blue;\\n}\\n"]}'
          );
        },
        'has 3 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 3);
        },
        'has embedded sources': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sources, ['styles.less']);
        },
        'has embedded sources content': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sourcesContent, ['div > a {\n  color: blue;\n}\n']);
        },
        'has selector mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 0,
            originalLine: 1,
            originalColumn: 4,
            source: 'styles.less',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
        },
        'has `color` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 6,
            originalLine: 2,
            originalColumn: 2,
            source: 'styles.less',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
        },
        'has `red` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 12,
            originalLine: 2,
            originalColumn: 2,
            source: 'styles.less',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
        }
      },
      'multiple': {
        'topic': function () {
          return new CleanCSS({ level: 2, sourceMap: true, sourceMapInlineSources: true }).minify({
            'test/fixtures/source-maps/some.css': {
              styles: 'div {\n  color: red;\n}',
              sourceMap: '{"version":3,"sources":["some.less"],"names":[],"mappings":"AAAA;EACE,UAAA","file":"some.css","sourcesContent":["div {\\n  color: red;\\n}\\n"]}'
            },
            'test/fixtures/source-maps/styles.css': {
              styles: 'div > a {\n  color: blue;\n}',
              sourceMap: '{"version":3,"sources":["styles.less"],"names":[],"mappings":"AAAA,GAAI;EACF,WAAA","file":"styles.css","sourcesContent":["div > a {\\n  color: blue;\\n}\\n"]}'
            },
            'test/fixtures/source-maps/nested/once.css': {
              styles: 'section > div a {\n  color: red;\n}',
              sourceMap: '{"version":3,"sources":["once.less"],"names":[],"mappings":"AAAA,OACE,MAAM;EACJ,UAAA","file":"once.css","sourcesContent":["section {\\n  > div a {\\n    color:red;\\n  }\\n}\\n"]}'
            }
          });
        },
        'has 7 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 7);
        },
        'has embedded sources': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sources, [
            path.join('test', 'fixtures', 'source-maps', 'some.less'),
            path.join('test', 'fixtures', 'source-maps', 'nested', 'once.less'),
            path.join('test', 'fixtures', 'source-maps', 'styles.less')
          ]);
        },
        'has embedded sources content': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sourcesContent, [
            'div {\n  color: red;\n}\n',
            'section {\n  > div a {\n    color:red;\n  }\n}\n',
            'div > a {\n  color: blue;\n}\n'
          ]);
        }
      },
      'multiple with map passed as source map object': {
        'topic': function () {
          return new CleanCSS({ level: 2, sourceMap: true, sourceMapInlineSources: true }).minify({
            'test/fixtures/source-maps/some.css': {
              styles: 'div {\n  color: red;\n}',
              sourceMap: { version:3, sources: ['some.less'], names: [], mappings: 'AAAA;EACE,UAAA', file: 'some.css', sourcesContent: ['div {\n  color: red;\n}\n'] }
            },
            'test/fixtures/source-maps/styles.css': {
              styles: 'div > a {\n  color: blue;\n}',
              sourceMap: { version:3, sources: ['styles.less'], names: [], mappings: 'AAAA,GAAI;EACF,WAAA', file: 'styles.css', sourcesContent: ['div > a {\n  color: blue;\n}\n'] }
            },
            'test/fixtures/source-maps/nested/once.css': {
              styles: 'section > div a {\n  color: red;\n}',
              sourceMap: { version:3, sources: ['once.less'], names: [], mappings: 'AAAA,OACE,MAAM;EACJ,UAAA', file: 'once.css', sourcesContent: ['section {\n  > div a {\n    color:red;\n  }\n}\n'] }
            }
          });
        },
        'has 7 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 7);
        },
        'has embedded sources': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sources, [
            path.join('test', 'fixtures', 'source-maps', 'some.less'),
            path.join('test', 'fixtures', 'source-maps', 'nested', 'once.less'),
            path.join('test', 'fixtures', 'source-maps', 'styles.less')
          ]);
        },
        'has embedded sources content': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sourcesContent, [
            'div {\n  color: red;\n}\n',
            'section {\n  > div a {\n    color:red;\n  }\n}\n',
            'div > a {\n  color: blue;\n}\n'
          ]);
        }
      },
      'multiple relative to rebaseTo path': {
        'topic': function () {
          return new CleanCSS({ level: 2, sourceMap: true, sourceMapInlineSources: true, rebaseTo: './test' }).minify({
            'test/fixtures/source-maps/some.css': {
              styles: 'div {\n  color: red;\n}',
              sourceMap: '{"version":3,"sources":["some.less"],"names":[],"mappings":"AAAA;EACE,UAAA","file":"some.css","sourcesContent":["div {\\n  color: red;\\n}\\n"]}'
            },
            'test/fixtures/source-maps/styles.css': {
              styles: 'div > a {\n  color: blue;\n}',
              sourceMap: '{"version":3,"sources":["styles.less"],"names":[],"mappings":"AAAA,GAAI;EACF,WAAA","file":"styles.css","sourcesContent":["div > a {\\n  color: blue;\\n}\\n"]}'
            },
            'test/fixtures/source-maps/nested/once.css': {
              styles: 'section > div a {\n  color: red;\n}',
              sourceMap: '{"version":3,"sources":["once.less"],"names":[],"mappings":"AAAA,OACE,MAAM;EACJ,UAAA","file":"once.css","sourcesContent":["section {\\n  > div a {\\n    color:red;\\n  }\\n}\\n"]}'
            }
          });
        },
        'has 7 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 7);
        },
        'has embedded sources': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sources, [
            path.join('fixtures', 'source-maps', 'some.less'),
            path.join('fixtures', 'source-maps', 'nested', 'once.less'),
            path.join('fixtures', 'source-maps', 'styles.less')
          ]);
        },
        'has embedded sources content': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sourcesContent, [
            'div {\n  color: red;\n}\n',
            'section {\n  > div a {\n    color:red;\n  }\n}\n',
            'div > a {\n  color: blue;\n}\n'
          ]);
        }
      },
      'mixed': {
        'topic': function () {
          return new CleanCSS({ level: 2, sourceMap: true, sourceMapInlineSources: true }).minify({
            'test/fixtures/source-maps/some.css': {
              styles: 'div {\n  color: red;\n}',
              sourceMap: '{"version":3,"sources":["some.less"],"names":[],"mappings":"AAAA;EACE,UAAA","file":"some.css","sourcesContent":["div {\\n  color: red;\\n}\\n"]}'
            },
            'test/fixtures/source-maps/styles.css': {
              styles: 'div > a {\n  color: blue;\n}',
              sourceMap: '{"version":3,"sources":["styles.less"],"names":[],"mappings":"AAAA,GAAI;EACF,WAAA","file":"styles.css"}'
            },
            'test/fixtures/source-maps/nested/once.css': {
              styles: 'section > div a {\n  color: red;\n}',
              sourceMap: '{"version":3,"sources":["once.less"],"names":[],"mappings":"AAAA,OACE,MAAM;EACJ,UAAA","file":"once.css","sourcesContent":["section {\\n  > div a {\\n    color:red;\\n  }\\n}\\n"]}'
            }
          });
        },
        'has 7 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 7);
        },
        'has embedded sources': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sources, [
            path.join('test', 'fixtures', 'source-maps', 'some.less'),
            path.join('test', 'fixtures', 'source-maps', 'nested', 'once.less'),
            path.join('test', 'fixtures', 'source-maps', 'styles.less')
          ]);
        },
        'has embedded sources content': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sourcesContent, [
            'div {\n  color: red;\n}\n',
            'section {\n  > div a {\n    color:red;\n  }\n}\n',
            'div > a {' + lineBreak + '  color: blue;' + lineBreak + '}' + lineBreak
          ]);
        }
      },
      'mixed without inline sources switch': {
        'topic': function () {
          return new CleanCSS({ level: 2, sourceMap: true }).minify({
            'test/fixtures/source-maps/some.css': {
              styles: 'div {\n  color: red;\n}',
              sourceMap: '{"version":3,"sources":["some.less"],"names":[],"mappings":"AAAA;EACE,UAAA","file":"some.css","sourcesContent":["div {\\n  color: red;\\n}\\n"]}'
            },
            'test/fixtures/source-maps/styles.css': {
              styles: 'div > a {\n  color: blue;\n}',
              sourceMap: '{"version":3,"sources":["styles.less"],"names":[],"mappings":"AAAA,GAAI;EACF,WAAA","file":"styles.css"}'
            },
            'test/fixtures/source-maps/nested/once.css': {
              styles: 'section > div a {\n  color: red;\n}',
              sourceMap: '{"version":3,"sources":["once.less"],"names":[],"mappings":"AAAA,OACE,MAAM;EACJ,UAAA","file":"once.css","sourcesContent":["section {\\n  > div a {\\n    color:red;\\n  }\\n}\\n"]}'
            }
          });
        },
        'has 7 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 7);
        },
        'has embedded sources': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sources, [
            path.join('test', 'fixtures', 'source-maps', 'some.less'),
            path.join('test', 'fixtures', 'source-maps', 'nested', 'once.less'),
            path.join('test', 'fixtures', 'source-maps', 'styles.less')
          ]);
        },
        'has embedded sources content': function (minified) {
          assert.isUndefined(JSON.parse(minified.sourceMap.toString()).sourcesContent);
        }
      },
      'mixed remote': {
        'topic': function () {
          this.reqMocks = nock('http://127.0.0.1')
            .get('/some.less')
            .reply(200, 'div {\n  color: red;\n}\n')
            .get('/styles.less')
            .reply(200, 'div > a {\n  color: blue;\n}\n');

          new CleanCSS({ inline: 'all', level: 2, sourceMap: true, sourceMapInlineSources: true }).minify({
            'http://127.0.0.1/some.css': {
              styles: 'div {\n  color: red;\n}',
              sourceMap: '{"version":3,"sources":["some.less"],"names":[],"mappings":"AAAA;EACE,UAAA","file":"some.css"}'
            },
            'http://127.0.0.1/other/styles.css': {
              styles: 'div > a {\n  color: blue;\n}',
              sourceMap: '{"version":3,"sources":["../styles.less"],"names":[],"mappings":"AAAA,GAAI;EACF,WAAA","file":"styles.css"}'
            },
            'test/fixtures/source-maps/nested/once.css': {
              styles: 'section > div a {\n  color: red;\n}',
              sourceMap: '{"version":3,"sources":["once.less"],"names":[],"mappings":"AAAA,OACE,MAAM;EACJ,UAAA","file":"once.css"}'
            }
          }, this.callback);
        },
        'has 7 mappings': function (errors, minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 7);
        },
        'has embedded sources': function (errors, minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sources, [
            'http://127.0.0.1/some.less',
            path.join('test', 'fixtures', 'source-maps', 'nested', 'once.less'),
            'http://127.0.0.1/styles.less'
          ]);
        },
        'has embedded sources content': function (errors, minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sourcesContent, [
            'div {\n  color: red;\n}\n',
            'section {' + lineBreak + '  > div a {' + lineBreak + '    color:red;' + lineBreak + '  }' + lineBreak + '}' + lineBreak,
            'div > a {\n  color: blue;\n}\n'
          ]);
        },
        'teardown': function () {
          assert.isTrue(this.reqMocks.isDone());
          nock.cleanAll();
        }
      },
      'mixed remote and 404 resource': {
        'topic': function () {
          this.reqMocks = nock('http://127.0.0.1')
            .get('/some.less')
            .reply(404)
            .get('/styles.less')
            .reply(200, 'div > a {\n  color: blue;\n}\n');

          new CleanCSS({ inline: 'all', level: 2, sourceMap: true, sourceMapInlineSources: true }).minify({
            'http://127.0.0.1/some.css': {
              styles: 'div {\n  color: red;\n}',
              sourceMap: '{"version":3,"sources":["some.less"],"names":[],"mappings":"AAAA;EACE,UAAA","file":"some.css"}'
            },
            'http://127.0.0.1/other/styles.css': {
              styles: 'div > a {\n  color: blue;\n}',
              sourceMap: '{"version":3,"sources":["../styles.less"],"names":[],"mappings":"AAAA,GAAI;EACF,WAAA","file":"styles.css"}'
            },
            'test/fixtures/source-maps/nested/once.css': {
              styles: 'section > div a {\n  color: red;\n}',
              sourceMap: '{"version":3,"sources":["once.less"],"names":[],"mappings":"AAAA,OACE,MAAM;EACJ,UAAA","file":"once.css"}'
            }
          }, this.callback);
        },
        'has 7 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 7);
        },
        'should warn about some.less': function (minified) {
          assert.deepEqual(minified.warnings, ['Missing original source at "http://127.0.0.1/some.less" - 404']);
        },
        'has embedded sources': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sources, [
            'http://127.0.0.1/some.less',
            path.join('test', 'fixtures', 'source-maps', 'nested', 'once.less'),
            'http://127.0.0.1/styles.less'
          ]);
        },
        'has embedded sources content': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sourcesContent, [
            null,
            'section {' + lineBreak + '  > div a {' + lineBreak + '    color:red;' + lineBreak + '  }' + lineBreak + '}' + lineBreak,
            'div > a {\n  color: blue;\n}\n'
          ]);
        },
        'teardown': function () {
          assert.isTrue(this.reqMocks.isDone());
          nock.cleanAll();
        }
      },
      'mixed remote and no callback': {
        'topic': function () {
           return new CleanCSS({ inline: 'all', level: 2, sourceMap: true, sourceMapInlineSources: true }).minify({
            'http://127.0.0.1/some.css': {
              styles: 'div {\n  color: red;\n}',
              sourceMap: '{"version":3,"sources":["some.less"],"names":[],"mappings":"AAAA;EACE,UAAA","file":"some.css"}'
            },
            'http://127.0.0.1/other/styles.css': {
              styles: 'div > a {\n  color: blue;\n}',
              sourceMap: '{"version":3,"sources":["../styles.less"],"names":[],"mappings":"AAAA,GAAI;EACF,WAAA","file":"styles.css"}'
            },
            'test/fixtures/source-maps/nested/once.css': {
              styles: 'section > div a {\n  color: red;\n}',
              sourceMap: '{"version":3,"sources":["once.less"],"names":[],"mappings":"AAAA,OACE,MAAM;EACJ,UAAA","file":"once.css"}'
            }
          });
        },
        'has 7 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 7);
        },
        'should warn about some.less and styles.less': function (minified) {
          assert.deepEqual(minified.warnings, [
            'Cannot fetch remote resource from "http://127.0.0.1/some.less" as no callback given.',
            'Cannot fetch remote resource from "http://127.0.0.1/styles.less" as no callback given.'
          ]);
        },
        'has embedded sources': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sources, [
            'http://127.0.0.1/some.less',
            path.join('test', 'fixtures', 'source-maps', 'nested', 'once.less'),
            'http://127.0.0.1/styles.less'
          ]);
        },
        'has embedded sources content': function (minified) {
          assert.deepEqual(JSON.parse(minified.sourceMap.toString()).sourcesContent, [
            null,
            'section {' + lineBreak + '  > div a {' + lineBreak + '    color:red;' + lineBreak + '  }' + lineBreak + '}' + lineBreak,
            null
          ]);
        }
      }
    }
  })
  .addBatch({
    'level 2 optimizations': {
      'new property in restructuring': {
        'topic': function () {
          return new CleanCSS({ level: { 2: { restructureRules: true } }, sourceMap: true }).minify('a{color:#000}div{color:red}.one{display:block}.two{display:inline;color:red}');
        },
        'has right output': function (minified) {
          assert.equal(minified.styles, 'a{color:#000}.two,div{color:red}.one{display:block}.two{display:inline}');
        },
        'has 13 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 13);
        },
        'has a merged `.two` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 13,
            originalLine: 1,
            originalColumn: 46,
            source: '$stdin',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[3], mapping);
        },
        'has a merged `div` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 18,
            originalLine: 1,
            originalColumn: 13,
            source: '$stdin',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[4], mapping);
        },
        'has a merged `color` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 22,
            originalLine: 1,
            originalColumn: 66,
            source: '$stdin',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[5], mapping);
        },
        'has a merged `red` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 28,
            originalLine: 1,
            originalColumn: 72,
            source: '$stdin',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[6], mapping);
        }
      },
      'overriding': {
        'topic': function () {
          return new CleanCSS({ level: 2, sourceMap: true }).minify('a{background:url(image.png);background-color:#eee;background-repeat:repeat-x}');
        },
        'has right output': function (minified) {
          assert.equal(minified.styles, 'a{background:url(image.png) repeat-x #eee}');
        },
        'has 5 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 5);
        },
        'has a `background` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 2,
            originalLine: 1,
            originalColumn: 2,
            source: '$stdin',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
        },
        'has a `url(image.png)` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 13,
            originalLine: 1,
            originalColumn: 13,
            source: '$stdin',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
        },
        'has a `repeat-x` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 28,
            originalLine: 1,
            originalColumn: 68,
            source: '$stdin',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[3], mapping);
        },
        'has a `#eee` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 37,
            originalLine: 1,
            originalColumn: 45,
            source: '$stdin',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[4], mapping);
        }
      },
      'shorthand merging': {
        'topic': function () {
          return new CleanCSS({ level: 2, sourceMap: true }).minify('a{margin-top:10px;\nmargin-bottom:4px;\nmargin-left:5px;\nmargin-right:5px}');
        },
        'has right output': function (minified) {
          assert.equal(minified.styles, 'a{margin:10px 5px 4px}');
        },
        'has 8 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 8);
        },
        'has a `a` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 0,
            originalLine: 1,
            originalColumn: 0,
            source: '$stdin',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
        },
        'has a `margin` -> `margin-top mapping`': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 2,
            originalLine: 1,
            originalColumn: 2,
            source: '$stdin',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
        },
        'has a `margin` -> `margin-bottom mapping`': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 2,
            originalLine: 2,
            originalColumn: 0,
            source: '$stdin',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
        },
        'has a `margin` -> `margin-left mapping`': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 2,
            originalLine: 3,
            originalColumn: 0,
            source: '$stdin',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[3], mapping);
        },
        'has a `margin` -> `margin-right mapping`': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 2,
            originalLine: 4,
            originalColumn: 0,
            source: '$stdin',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[4], mapping);
        },
        'has a `10px` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 9,
            originalLine: 1,
            originalColumn: 13,
            source: '$stdin',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[5], mapping);
        },
        'has a `5px` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 14,
            originalLine: 4,
            originalColumn: 13,
            source: '$stdin',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[6], mapping);
        },
        'has a `4px` mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 18,
            originalLine: 2,
            originalColumn: 14,
            source: '$stdin',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[7], mapping);
        }
      }
    }
  })
  .export(module);

  function inlineDataUriContext(dataUri) {
    return {
      'topic': function() {
        return new CleanCSS({sourceMap: true}).minify('div > a {\n  color: red;\n}/*# sourceMappingURL=' + dataUri + ' */');
      },
      'has 3 mappings': function(minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 3);
      },
      'has `div > a` mapping': function(minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 4,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'has `color` mapping': function(minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 6,
          originalLine: 2,
          originalColumn: 2,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'has second `color` mapping': function(minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 12,
          originalLine: 2,
          originalColumn: 2,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      }
    };
  }
