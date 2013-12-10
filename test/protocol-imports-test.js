/* jshint unused: false */

var vows = require('vows');
var assert = require('assert');
var http = require('http');
var nock = require('nock');
var CleanCSS = require('../index');

var port = 24682;

if (process.platform == 'win32')
  return;

vows.describe('protocol imports').addBatch({
  'of a missing file': {
    topic: function() {
      this.reqMocks = nock('http://goalsmashers.com')
        .get('/missing.css')
        .reply(404);

      new CleanCSS().minify('@import url(http://goalsmashers.com/missing.css);a{color:red}', this.callback);
    },
    'should raise error': function(errors, minified) {
      assert.equal(errors.length, 1);
    },
    'should ignore @import': function(errors, minified) {
      assert.equal(minified, '@import url(http://goalsmashers.com/missing.css);a{color:red}');
    },
    teardown: function() {
      assert.equal(this.reqMocks.isDone(), true);
      nock.restore();
    }
  },
  'of an existing file': {
    topic: function() {
      this.reqMocks = nock('http://goalsmashers.com')
        .get('/present.css')
        .reply(200, 'p{font-size:13px}');

      new CleanCSS().minify('@import url(http://goalsmashers.com/present.css);a{color:red}', this.callback);
    },
    'should not raise errors': function(errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function(errors, minified) {
      assert.equal(minified, 'p{font-size:13px}a{color:red}');
    },
    teardown: function() {
      assert.equal(this.reqMocks.isDone(), true);
      nock.restore();
    }
  },
  'of an existing file via HTTPS': {
    topic: function() {
      this.reqMocks = nock('https://goalsmashers.com')
        .get('/present.css')
        .reply(200, 'p{font-size:13px}');

      new CleanCSS().minify('@import url(https://goalsmashers.com/present.css);a{color:red}', this.callback);
    },
    'should not raise errors': function(errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function(errors, minified) {
      assert.equal(minified, 'p{font-size:13px}a{color:red}');
    },
    teardown: function() {
      assert.equal(this.reqMocks.isDone(), true);
      nock.restore();
    }
  },
  'of an existing file with media': {
    topic: function() {
      this.reqMocks = nock('http://goalsmashers.com')
        .get('/present.css')
        .reply(200, 'p{font-size:13px}');

      new CleanCSS().minify('@import url(http://goalsmashers.com/present.css) screen;a{color:red}', this.callback);
    },
    'should not raise errors': function(errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function(errors, minified) {
      assert.equal(minified, '@media screen{p{font-size:13px}}a{color:red}');
    },
    teardown: function() {
      assert.equal(this.reqMocks.isDone(), true);
      nock.restore();
    }
  },
  'of an existing file with dependencies': {
    topic: function() {
      this.reqMocks1 = nock('http://goalsmashers.com')
        .get('/present.css')
        .reply(200, '@import url(/vendor/reset.css);@import url(https://assets.goalsmashers.com/base.css);p{font-size:13px}')
        .get('/vendor/reset.css')
        .reply(200, 'body{margin:0}');
      this.reqMocks2 = nock('https://assets.goalsmashers.com')
        .get('/base.css')
        .reply(200, 'div{padding:0}');

      new CleanCSS().minify('@import url(http://goalsmashers.com/present.css);a{color:red}', this.callback);
    },
    'should not raise errors': function(errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function(errors, minified) {
      assert.equal(minified, 'body{margin:0}div{padding:0}p{font-size:13px}a{color:red}');
    },
    teardown: function() {
      assert.equal(this.reqMocks1.isDone(), true);
      assert.equal(this.reqMocks2.isDone(), true);
      nock.restore();
    }
  },
  'of an existing file with relative dependencies': {
    topic: function() {
      this.reqMocks = nock('http://goalsmashers.com')
        .get('/nested/present.css')
        .reply(200, '@import url(../vendor/reset.css);p{font-size:13px}')
        .get('/vendor/reset.css')
        .reply(200, 'body{margin:0}');

      new CleanCSS().minify('@import url(http://goalsmashers.com/nested/present.css);a{color:red}', this.callback);
    },
    'should not raise errors': function(errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function(errors, minified) {
      assert.equal(minified, 'body{margin:0}p{font-size:13px}a{color:red}');
    },
    teardown: function() {
      assert.equal(this.reqMocks.isDone(), true);
      nock.restore();
    }
  },
  'of an existing file missing relative dependency': {
    topic: function() {
      this.reqMocks = nock('http://goalsmashers.com')
        .get('/nested/present.css')
        .reply(200, '@import url(../missing.css);p{font-size:13px}')
        .get('/missing.css')
        .reply(404);

      new CleanCSS().minify('@import url(http://goalsmashers.com/nested/present.css);a{color:red}', this.callback);
    },
    'should not raise errors': function(errors, minified) {
      assert.equal(errors.length, 1);
      assert.equal(errors[0], 'Broken @import declaration of "http://goalsmashers.com/missing.css" - error 404');
    },
    'should process @import': function(errors, minified) {
      assert.equal(minified, '@import url(http://goalsmashers.com/missing.css);p{font-size:13px}a{color:red}');
    },
    teardown: function() {
      assert.equal(this.reqMocks.isDone(), true);
      nock.restore();
    }
  },
  'of an existing file with URLs to rebase': {
    topic: function() {
      this.reqMocks = nock('http://goalsmashers.com')
        .get('/urls.css')
        .reply(200, 'a{background:url(test.png)}');

      new CleanCSS().minify('@import url(http://goalsmashers.com/urls.css);', this.callback);
    },
    'should not raise errors': function(errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function(errors, minified) {
      assert.equal(minified, 'a{background:url(http://goalsmashers.com/test.png)}');
    },
    teardown: function() {
      assert.equal(this.reqMocks.isDone(), true);
      nock.restore();
    }
  },
  'of an existing file with relative URLs to rebase': {
    topic: function() {
      this.reqMocks = nock('http://goalsmashers.com')
        .get('/base.css')
        .reply(200, '@import url(deeply/nested/urls.css);')
        .get('/deeply/nested/urls.css')
        .reply(200, 'a{background:url(../images/test.png)}');

      new CleanCSS().minify('@import url(http://goalsmashers.com/base.css);', this.callback);
    },
    'should not raise errors': function(errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function(errors, minified) {
      assert.equal(minified, 'a{background:url(http://goalsmashers.com/deeply/images/test.png)}');
    },
    teardown: function() {
      assert.equal(this.reqMocks.isDone(), true);
      nock.restore();
    }
  },
  'of a non-resolvable domain': {
    topic: function() {
      new CleanCSS().minify('@import url(http://notdefined.goalsmashers.com/custom.css);a{color:red}', this.callback);
    },
    'should not raise errors': function(errors, minified) {
      assert.equal(errors.length, 1);
      assert.equal(errors[0], 'Broken @import declaration of "http://notdefined.goalsmashers.com/custom.css" - getaddrinfo ENOTFOUND');
    },
    'should process @import': function(errors, minified) {
      assert.equal(minified, '@import url(http://notdefined.goalsmashers.com/custom.css);a{color:red}');
    }
  },
  'of a 30x response with absolute URL': {
    topic: function() {
      this.reqMocks = nock('http://goalsmashers.com')
        .get('/moved.css')
        .reply(301, '', { 'Location': 'http://goalsmashers.com/present.css' })
        .get('/present.css')
        .reply(200, 'body{margin:0}');

      new CleanCSS().minify('@import url(http://goalsmashers.com/moved.css);a{color:red}', this.callback);
    },
    'should not raise errors': function(errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function(errors, minified) {
      assert.equal(minified, 'body{margin:0}a{color:red}');
    },
    teardown: function() {
      assert.equal(this.reqMocks.isDone(), true);
      nock.restore();
    }
  },
  'of a 30x response with relative URL': {
    topic: function() {
      this.reqMocks = nock('http://goalsmashers.com')
        .get('/moved.css')
        .reply(301, '', { 'Location': '/present.css' })
        .get('/present.css')
        .reply(200, 'body{margin:0}');

      new CleanCSS().minify('@import url(http://goalsmashers.com/moved.css);a{color:red}', this.callback);
    },
    'should not raise errors': function(errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function(errors, minified) {
      assert.equal(minified, 'body{margin:0}a{color:red}');
    },
    teardown: function() {
      assert.equal(this.reqMocks.isDone(), true);
      nock.restore();
    }
  },
  'of a timed out response': {
    topic: function() {
      var self = this;
      var timeout = 100;
      this.server = http.createServer(function(req, res) {
        setTimeout(function() {}, timeout * 2);
      });
      this.server.listen(port, function() {
        new CleanCSS({
          inliner: {
            timeout: timeout
          }
        }).minify('@import url(http://localhost:' + port + '/timeout.css);a{color:red}', self.callback);
      });
    },
    'should not raise errors': function(errors, minified) {
      assert.equal(errors.length, 1);
      assert.equal(errors[0], 'Broken @import declaration of "http://localhost:' + port + '/timeout.css" - timeout');
    },
    'should process @import': function(errors, minified) {
      assert.equal(minified, '@import url(http://localhost:' + port + '/timeout.css);a{color:red}');
    },
    teardown: function() {
      this.server.close();
    }
  },
  'of a cyclical reference response': {
    topic: function() {
      this.reqMocks = nock('http://goalsmashers.com')
        .get('/one.css')
        .reply(200, '@import url(/two.css);div{padding:0}')
        .get('/two.css')
        .reply(200, '@import url(http://goalsmashers.com/two.css);body{margin:0}');

      new CleanCSS().minify('@import url(http://goalsmashers.com/one.css);a{color:red}', this.callback);
    },
    'should not raise errors': function(errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function(errors, minified) {
      assert.equal(minified, 'body{margin:0}div{padding:0}a{color:red}');
    },
    teardown: function() {
      assert.equal(this.reqMocks.isDone(), true);
      nock.restore();
    }
  },
  'of a resource without protocol': {
    topic: function() {
      this.reqMocks = nock('http://goalsmashers.com')
        .get('/no-protocol.css')
        .reply(200, 'div{padding:0}');

      new CleanCSS().minify('@import url(//goalsmashers.com/no-protocol.css);a{color:red}', this.callback);
    },
    'should not raise errors': function(errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function(errors, minified) {
      assert.equal(minified, 'div{padding:0}a{color:red}');
    },
    teardown: function() {
      assert.equal(this.reqMocks.isDone(), true);
      nock.restore();
    }
  },
  'of a resource available via POST only': {
    topic: function() {
      this.reqMocks = nock('http://goalsmashers.com')
        .post('/computed.css')
        .reply(200, 'div{padding:0}');

      new CleanCSS({
        inliner: {
          request: {
            method: 'POST'
          }
        }
      }).minify('@import url(http://goalsmashers.com/computed.css);a{color:red}', this.callback);
    },
    'should not raise errors': function(errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function(errors, minified) {
      assert.equal(minified, 'div{padding:0}a{color:red}');
    },
    teardown: function() {
      assert.equal(this.reqMocks.isDone(), true);
      nock.restore();
    }
  },
  'of a remote resource mixed with local ones': {
    topic: function() {
      var source = '@import url(http://goalsmashers.com/remote.css);@import url(test/data/partials/one.css);';
      this.reqMocks = nock('http://goalsmashers.com')
        .get('/remote.css')
        .reply(200, 'div{padding:0}');

      new CleanCSS().minify(source, this.callback);
    },
    'should not raise errors': function(errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function(errors, minified) {
      assert.equal(minified, 'div{padding:0}.one{color:red}');
    },
    teardown: function() {
      assert.equal(this.reqMocks.isDone(), true);
      nock.restore();
    }
  },
  'of a remote resource mixed with local ones but no callback': {
    topic: function() {
      var source = '@import url(http://goalsmashers.com/remote.css);@import url(test/data/partials/one.css);';
      this.reqMocks = nock('http://goalsmashers.com')
        .get('/remote.css')
        .reply(200, 'div{padding:0}');

      var minifier = new CleanCSS();
      var minified = minifier.minify(source);
      this.callback(null, minifier, minified);
    },
    'should not raise errors': function(error, minifier) {
      assert.isEmpty(minifier.errors);
    },
    'should raise warnings': function(error, minifier) {
      assert.equal(minifier.warnings.length, 1);
      assert.match(minifier.warnings[0], /no callback given/);
    },
    'should process @import': function(error, minifier, minified) {
      assert.equal(minified, '@import url(http://goalsmashers.com/remote.css);.one{color:red}');
    },
    teardown: function() {
      assert.equal(this.reqMocks.isDone(), false);
      nock.restore();
    }
  }
}).export(module);
