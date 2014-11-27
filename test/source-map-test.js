/* jshint unused: false */

var vows = require('vows');
var assert = require('assert');
var CleanCSS = require('../index');

var fs = require('fs');
var path = require('path');
var inputMapPath = path.join('test', 'data', 'source-maps', 'styles.css.map');
var inputMap = fs.readFileSync(inputMapPath, 'utf-8');

var nock = require('nock');
var http = require('http');

var port = 24682;

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
          generatedColumn: 8,
          originalLine: 1,
          originalColumn: 8,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[0]);
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
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[0]);
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
        assert.deepEqual(mapping, minified.sourceMap._mappings[1]);
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
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[0]);
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
        assert.deepEqual(mapping, minified.sourceMap._mappings[1]);
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
        assert.deepEqual(mapping, minified.sourceMap._mappings[2]);
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
        assert.deepEqual(mapping, minified.sourceMap._mappings[3]);
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
        assert.deepEqual(mapping, minified.sourceMap._mappings[4]);
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
        assert.deepEqual(mapping, minified.sourceMap._mappings[5]);
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
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          source: '__stdin__.css',
          name: null
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[0]);
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
        assert.deepEqual(mapping, minified.sourceMap._mappings[1]);
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
        assert.deepEqual(mapping, minified.sourceMap._mappings[2]);
      }
    },
    'keyframes': {
      'topic': new CleanCSS({ sourceMap: true }).minify('@-webkit-keyframes frames {\n  0% {\n    border: 1px;\n  }\n  100% {\n    border: 3px;\n  }\n}'),
      'should have 5 mappings': function(minified) {
        assert.equal(5, minified.sourceMap._mappings.length);
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
        assert.deepEqual(mapping, minified.sourceMap._mappings[0]);
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
        assert.deepEqual(mapping, minified.sourceMap._mappings[1]);
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
        assert.deepEqual(mapping, minified.sourceMap._mappings[2]);
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
        assert.deepEqual(mapping, minified.sourceMap._mappings[3]);
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
        assert.deepEqual(mapping, minified.sourceMap._mappings[4]);
      }
    }
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
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[0]);
      },
      'should have _color:red_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 6,
          originalLine: 3,
          originalColumn: 4,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[1]);
      }
    },
    'input map from source': {
      'topic': new CleanCSS({ sourceMap: true }).minify('div > a {\n  color: red;\n}/*# sourceMappingURL=' + inputMapPath + ' */'),
      'should have 2 mappings': function (minified) {
        assert.equal(2, minified.sourceMap._mappings.length);
      },
      'should have selector mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[0]);
      },
      'should have _color:red_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 6,
          originalLine: 3,
          originalColumn: 4,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[1]);
      }
    },
    'input map from source with root': {
      'topic': new CleanCSS({ sourceMap: true, relativeTo: path.dirname(inputMapPath) }).minify('div > a {\n  color: red;\n}/*# sourceMappingURL=styles.css.map */'),
      'should have 2 mappings': function (minified) {
        assert.equal(2, minified.sourceMap._mappings.length);
      },
      'should have selector mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[0]);
      },
      'should have _color:red_ mapping': function (minified) {
        var mapping = {
          generatedLine: 1,
          generatedColumn: 6,
          originalLine: 3,
          originalColumn: 4,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[1]);
      }
    },
    'complex input map': {
      'topic': new CleanCSS({ sourceMap: true, root: path.dirname(inputMapPath) }).minify('@import url(import.css);'),
      'should have 4 mappings': function (minified) {
        assert.equal(4, minified.sourceMap._mappings.length);
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
        assert.deepEqual(mapping, minified.sourceMap._mappings[0]);
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
        assert.deepEqual(mapping, minified.sourceMap._mappings[1]);
      },
      'should have second selector mapping': function (minified) {
        var mapping = {
          generatedLine: 2,
          generatedColumn: 0,
          originalLine: 1,
          originalColumn: 0,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[2]);
      },
      'should have _color:blue_ mapping': function (minified) {
        var mapping = {
          generatedLine: 2,
          generatedColumn: 6,
          originalLine: 3,
          originalColumn: 4,
          source: 'styles.less',
          name: null
        };
        assert.deepEqual(mapping, minified.sourceMap._mappings[3]);
      }
    },
    'complex input map referenced by path': {
      'topic': new CleanCSS({ sourceMap: true }).minify('@import url(test/data/source-maps/import.css);'),
      'should have 4 mappings': function (minified) {
        assert.equal(4, minified.sourceMap._mappings.length);
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
        assert.equal(errors.length, 1);
        assert.equal(errors[0], 'Broken source map at "http://127.0.0.1/remote.css.map" - 404');
      },
      teardown: function () {
        assert.equal(this.reqMocks.isDone(), true);
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
      },
      'has mapping': function (errors, minified) {
        assert.isDefined(minified.sourceMap);
      },
      'raises an error': function(errors, _) {
        assert.equal(errors.length, 1);
        assert.equal(errors[0], 'Broken source map at "http://127.0.0.1:' + port + '/remote.css.map" - timeout');
      },
      teardown: function () {
        this.server.close();
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
        assert.equal(minified.sourceMap._mappings[0].source, 'http://127.0.0.1/styles.less');
      },
      teardown: function () {
        assert.equal(this.reqMocks.isDone(), true);
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
        assert.equal(this.reqMocks.isDone(), true);
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
        assert.equal(this.reqMocks.isDone(), true);
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
        assert.equal(this.reqMocks.isDone(), true);
        nock.cleanAll();
      }
    }
  })
  .export(module);
