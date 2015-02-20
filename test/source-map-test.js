/* jshint unused: false */

var vows = require('vows');
var assert = require('assert');
var CleanCSS = require('../index');

var fs = require('fs');
var path = require('path');
var inputMapPath = path.join('test', 'fixtures', 'source-maps', 'styles.css.map');
var inputMap = fs.readFileSync(inputMapPath, 'utf-8');

var nock = require('nock');
var http = require('http');
var enableDestroy = require('server-destroy');

var port = 24682;

vows.describe('source-map')
  .addBatch({
    'vendor prefix with comments': {
      'topic': new CleanCSS({ sourceMap: true }).minify('html{font-family:sans-serif;/* 1 */-ms-text-size-adjust:100%;/* 2 */-webkit-text-size-adjust:100%/* 3 */}'),
      'gets right output': function (minified) {
        assert.equal(minified.styles, 'html{font-family:sans-serif;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}');
      }
    }
  })
  .addBatch({
    'module #1': {
      'topic': new CleanCSS({ sourceMap: true }).minify('/*! a */div[data-id=" abc "] { color:red; }'),
      'should have 2 mappings': function(minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 2);
      },
      'should have selector mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 8,
          originalLine: 1,
          originalColumn: 8,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'should have body mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 29,
          originalLine: 1,
          originalColumn: 31,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      }
    },
    'module #2': {
      'topic': new CleanCSS({ sourceMap: true }).minify('@media screen {\n@font-face \n{ \nfont-family: test; } }'),
      'should have 3 mappings': function(minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 3);
      },
      'should have @media mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'should have @font-face mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 14,
          originalLine: 2,
          originalColumn: 0,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'should have font-family mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 25,
          originalLine: 4,
          originalColumn: 0,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      }
    },
    'with keepBreaks': {
      'topic': new CleanCSS({ sourceMap: true, keepBreaks: true }).minify('@media screen { a{color:red} p {color:blue} }div{color:pink}'),
      'should have 7 mappings': function(minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 7);
      },
      'should have @media mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'should have _a_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 14,
          originalLine: 1,
          originalColumn: 16,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'should have _color:red_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 16,
          originalLine: 1,
          originalColumn: 18,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      },
      'should have _p_ mapping': function (minified) {
        var mapping = {
          generatedLine: 2,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 29,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[3], mapping);
      },
      'should have _color:blue_ mapping': function (minified) {
        var mapping = {
          generatedLine: 2,
          generatedColumn: 2,
          originalLine: 1,
          originalColumn: 32,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[4], mapping);
      },
      'should have _div_ mapping': function (minified) {
        var mapping = {
          generatedLine: 4,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 45,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[5], mapping);
      },
      'should have _color:pink_ mapping': function (minified) {
        var mapping = {
          generatedLine: 4,
          generatedColumn: 4,
          originalLine: 1,
          originalColumn: 49,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[6], mapping);
      }
    },
    'shorthands': {
      'topic': new CleanCSS({ sourceMap: true }).minify('a{background:url(image.png);background-color:red}'),
      'should have 3 mappings': function(minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 3);
      },
      'should have selector mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'should have _background_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 2,
          originalLine: 1,
          originalColumn: 2,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'should have _background-color_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 28,
          originalLine: 1,
          originalColumn: 28,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      }
    },
    'keyframes': {
      'topic': new CleanCSS({ sourceMap: true }).minify('@-webkit-keyframes frames {\n  0% {\n    border: 1px;\n  }\n  100% {\n    border: 3px;\n  }\n}'),
      'should have 5 mappings': function(minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 5);
      },
      'should have _@keframes_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'should have _0%_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 26,
          originalLine: 2,
          originalColumn: 2,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'should have _border:1px_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 29,
          originalLine: 3,
          originalColumn: 4,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      },
      'should have _100%_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 40,
          originalLine: 5,
          originalColumn: 2,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[3], mapping);
      },
      'should have _border:3px_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 45,
          originalLine: 6,
          originalColumn: 4,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[4], mapping);
      }
    },
    'double comments': {
      'topic': new CleanCSS({ sourceMap: true }).minify('/* COMMENT 1 */\n/* COMMENT 2 */\ndiv{color:red}'),
      'should have 2 mappings': function(minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 2);
      },
      'should have _div__ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 3,
          originalColumn: 0,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'should have _color:red_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 4,
          originalLine: 3,
          originalColumn: 4,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      }
    }
  })
  .addBatch({
    'input map as string': {
      'topic': new CleanCSS({ sourceMap: inputMap }).minify('div > a {\n  color: red;\n}'),
      'should have 2 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 2);
      },
      'should have selector mapping': function (minified) {
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
      'should have _color:red_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 6,
          originalLine: 2,
          originalColumn: 2,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      }
    },
    'input map from source': {
      'topic': new CleanCSS({ sourceMap: true }).minify('div > a {\n  color: red;\n}/*# sourceMappingURL=' + inputMapPath + ' */'),
      'should have 2 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 2);
      },
      'should have selector mapping': function (minified) {
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
      'should have _color:red_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 6,
          originalLine: 2,
          originalColumn: 2,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      }
    },
    'input map from source with root': {
      'topic': new CleanCSS({ sourceMap: true, relativeTo: path.dirname(inputMapPath) }).minify('div > a {\n  color: red;\n}/*# sourceMappingURL=styles.css.map */'),
      'should have 2 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 2);
      },
      'should have selector mapping': function (minified) {
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
      'should have _color:red_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 6,
          originalLine: 2,
          originalColumn: 2,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      }
    },
    'complex input map': {
      'topic': new CleanCSS({ sourceMap: true, root: path.dirname(inputMapPath) }).minify('@import url(import.css);'),
      'should have 4 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 4);
      },
      'should have first selector mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          source: 'some.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'should have _color:red_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 4,
          originalLine: 2,
          originalColumn: 2,
          source: 'some.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      },
      'should have second selector mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 14,
          originalLine: 1,
          originalColumn: 4,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
      },
      'should have _color:blue_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 20,
          originalLine: 2,
          originalColumn: 2,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[3], mapping);
      }
    },
    'complex input map referenced by path': {
      'topic': new CleanCSS({ sourceMap: true }).minify('@import url(test/fixtures/source-maps/import.css);'),
      'should have 4 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 4);
      }
    },
    'complex but partial input map referenced by path': {
      'topic': new CleanCSS({ sourceMap: true, target: process.cwd() }).minify('@import url(test/fixtures/source-maps/no-map-import.css);'),
      'should have 4 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 4);
      },
      'should have 2 mappings to .less file': function (minified) {
        var fromLess = minified.sourceMap._mappings._array.filter(function (mapping) {
          return mapping.source == path.join('test', 'fixtures', 'source-maps', 'styles.less');
        });
        assert.lengthOf(fromLess, 2);
      },
      'should have 2 mappings to .css file': function (minified) {
        var fromCSS = minified.sourceMap._mappings._array.filter(function (mapping) {
          return mapping.source == path.join('test', 'fixtures', 'source-maps', 'no-map.css');
        });
        assert.lengthOf(fromCSS, 2);
      }
    },
    'complex input map with an existing file as target': {
      'topic': new CleanCSS({ sourceMap: true, target: path.join(process.cwd(), 'test', 'fixtures', 'source-maps', 'styles.css') }).minify('@import url(test/fixtures/source-maps/styles.css);'),
      'should have 2 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 2);
      },
      'should have 2 mappings to styles.less file': function (minified) {
        var stylesSource = minified.sourceMap._mappings._array.filter(function (mapping) {
          return mapping.source == 'styles.less';
        });
        assert.lengthOf(stylesSource, 2);
      },
    },
    'nested once': {
      'topic': new CleanCSS({ sourceMap: true }).minify('@import url(test/fixtures/source-maps/nested/once.css);'),
      'should have 2 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 2);
      },
      'should have "section > div a" mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 2,
          originalColumn: 8,
          source: 'once.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'should have "color:red" mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 14,
          originalLine: 3,
          originalColumn: 4,
          source: 'once.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      }
    },
    'nested twice': {
      'topic': new CleanCSS({ sourceMap: true }).minify('@import url(test/fixtures/source-maps/nested/twice.css);'),
      'should have 2 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 2);
      },
      'should have "body > nav a" mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 3,
          originalColumn: 4,
          source: 'twice.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
      },
      'should have "color:red" mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 11,
          originalLine: 4,
          originalColumn: 6,
          source: 'twice.less',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
      }
    },
    'input source map with missing mutliselector input': {
      'topic': new CleanCSS({ sourceMap: '{"version":3,"sources":["source.css"],"names":[],"mappings":"AAAA;;;;IAII,YAAW;EACd"}' }).minify('a,\na:hover,\na:visited\n{\n    color: red;\n}'),
      'should have 4 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 4);
      },
      'should have "a" mapping': function (minified) {
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
      'should have "a:hover" mapping': function (minified) {
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
      'should have "a:visited" mapping': function (minified) {
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
      'should have "color:red" mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 20,
          originalLine: 5,
          originalColumn: 4,
          source: 'source.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[3], mapping);
      }
    },
    'input source map with missing mutliselector sortable input': {
      'topic': new CleanCSS({ sourceMap: '{"version":3,"sources":["source.css"],"names":[],"mappings":"AAAA;;;;IAII,YAAW;EACd"}' }).minify('a.button:link,\na.button:visited,\na.button:hover\n{\n    color: red;\n}'),
      'should have 4 mappings': function (minified) {
        assert.lengthOf(minified.sourceMap._mappings._array, 4);
      },
      'should have "a.button:hover" mapping': function (minified) {
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
      'should have "a.button:link" mapping': function (minified) {
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
      'should have "a.button:visited" mapping': function (minified) {
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
      'should have "color:red" mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 46,
          originalLine: 5,
          originalColumn: 4,
          source: 'source.css',
          name: null
        };
        assert.deepEqual(minified.sourceMap._mappings._array[3], mapping);
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

        new CleanCSS({ sourceMap: true }).minify('@import url(http://127.0.0.1/remote.css);', this.callback);
      },
      'has mapping': function (errors, minified) {
        assert.isDefined(minified.sourceMap);
      },
      'raises an error': function(errors, _) {
        assert.lengthOf(errors, 1);
        assert.equal(errors[0], 'Broken source map at "http://127.0.0.1/remote.css.map" - 404');
      },
      teardown: function () {
        assert.isTrue(this.reqMocks.isDone());
        nock.cleanAll();
      }
    },
    'timed out response for external source map': {
      topic: function() {
        var self = this;
        var timeout = 100;

        this.server = http.createServer(function(req, res) {
          switch (req.url) {
            case '/remote.css':
              res.writeHead(200);
              res.write('/*# sourceMappingURL=http://127.0.0.1:' + port + '/remote.css.map */');
              res.end();
              break;
            case '/remote.css.map':
              setTimeout(function() {}, timeout * 2);
          }
        });
        this.server.listen(port, '127.0.0.1', function() {
          new CleanCSS({ sourceMap: true, inliner: { timeout: timeout } })
            .minify('@import url(http://127.0.0.1:' + port + '/remote.css);', self.callback);
        });
        enableDestroy(this.server);
      },
      'has mapping': function (errors, minified) {
        assert.isDefined(minified.sourceMap);
      },
      'raises an error': function(errors, _) {
        assert.lengthOf(errors, 1);
        assert.equal(errors[0], 'Broken source map at "http://127.0.0.1:' + port + '/remote.css.map" - timeout');
      },
      teardown: function () {
        this.server.destroy();
      }
    },
    'absolute source map from external host via http': {
      topic: function () {
        this.reqMocks = nock('http://127.0.0.1')
          .get('/remote.css')
          .reply(200, 'div>a{color:blue}/*# sourceMappingURL=http://127.0.0.1/remote.css.map */')
          .get('/remote.css.map')
          .reply(200, inputMap);

        new CleanCSS({ sourceMap: true }).minify('@import url(http://127.0.0.1/remote.css);', this.callback);
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
          .reply(200, '/*# sourceMappingURL=https://127.0.0.1/remote.css.map */')
          .get('/remote.css.map')
          .reply(200, inputMap);

        new CleanCSS({ sourceMap: true }).minify('@import url(https://127.0.0.1/remote.css);', this.callback);
      },
      'has mapping': function (errors, minified) {
        assert.isDefined(minified.sourceMap);
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
          .reply(200, '/*# sourceMappingURL=remote.css.map */')
          .get('/remote.css.map')
          .reply(200, inputMap);

        new CleanCSS({ sourceMap: true }).minify('@import url(http://127.0.0.1/remote.css);', this.callback);
      },
      'has mapping': function (errors, minified) {
        assert.isDefined(minified.sourceMap);
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
          .reply(200, '/*# sourceMappingURL=remote.css.map */')
          .post('/remote.css.map')
          .reply(200, inputMap);

        new CleanCSS({ sourceMap: true, inliner: { request: { method: 'POST' } } })
          .minify('@import url(http://127.0.0.1/remote.css);', this.callback);
      },
      'has mapping': function (errors, minified) {
        assert.isDefined(minified.sourceMap);
      },
      teardown: function () {
        assert.isTrue(this.reqMocks.isDone());
        nock.cleanAll();
      }
    }
  })
  .addBatch({
    'important comment after a property': {
      'topic': new CleanCSS({ sourceMap: true }).minify('div { color: #f00 !important; /*!comment*/ }'),
      'has right output': function (errors, minified) {
        assert.equal(minified.styles, 'div{color:red!important/*!comment*/}');
      }
    },
    'important comment between properties': {
      'topic': new CleanCSS({ sourceMap: true }).minify('div { color: #f00 !important; /*!comment*/; display: block }'),
      'has right output': function (errors, minified) {
        assert.equal(minified.styles, 'div{color:red!important;/*!comment*/display:block}');
      }
    },
    'important comments after a property': {
      'topic': new CleanCSS({ sourceMap: true }).minify('div { color: #f00 !important; /*!1*//*!2*/ }'),
      'has right output': function (errors, minified) {
        assert.equal(minified.styles, 'div{color:red!important/*!1*//*!2*/}');
      }
    }
  })
  .addBatch({
    'multiple source maps': {
      'relative to local': {
        'topic': new CleanCSS({ sourceMap: true }).minify({
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
        }),
        'has right output': function (errors, minified) {
          assert.equal(minified.styles, 'div,section>div a{color:red}div>a{color:#00f}');
        },
        'should have 5 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 5);
        },
        'should have "div" mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 0,
            originalLine: 1,
            originalColumn: 0,
            source: 'some.less',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[0], mapping);
        },
        'should have "section > div a" mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 4,
            originalLine: 2,
            originalColumn: 8,
            source: 'once.less',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[1], mapping);
        },
        'should have "color: red" mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 18,
            originalLine: 2,
            originalColumn: 2,
            source: 'some.less',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[2], mapping);
        },
        'should have "div > a" mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 28,
            originalLine: 1,
            originalColumn: 4,
            source: 'styles.less',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[3], mapping);
        },
        'should have "color: blue" mapping': function (minified) {
          var mapping = {
            generatedLine: 1,
            generatedColumn: 34,
            originalLine: 2,
            originalColumn: 2,
            source: 'styles.less',
            name: null
          };
          assert.deepEqual(minified.sourceMap._mappings._array[4], mapping);
        }
      }
    },
    'relative to path': {
      'complex but partial input map referenced by path': {
        'topic': new CleanCSS({ sourceMap: true, target: process.cwd() }).minify({
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
        }),
        'should have 5 mappings': function (minified) {
          assert.lengthOf(minified.sourceMap._mappings._array, 5);
        },
        'should have right sources': function (minified) {
          var sources = [];
          minified.sourceMap._mappings._array.forEach(function (m) {
            if (sources.indexOf(m.source) === -1)
              sources.push(m.source);
          });

          assert.deepEqual(sources, [
            path.join('test', 'fixtures', 'source-maps', 'some.less'),
            path.join('test', 'fixtures', 'source-maps', 'nested', 'once.less'),
            path.join('test', 'fixtures', 'source-maps', 'styles.less')
          ]);
        }
      }
    }
  })
  .export(module);
