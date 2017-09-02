/* jshint unused: false, camelcase: false */

var vows = require('vows');
var assert = require('assert');
var http = require('http');
var httpProxy = require('http-proxy');
var enableDestroy = require('server-destroy');
var nock = require('nock');
var url = require('url');
var CleanCSS = require('../index');

var port = 24682;

vows.describe('protocol imports').addBatch({
  'of a missing file': {
    topic: function () {
      this.reqMocks = nock('http://127.0.0.1')
        .get('/missing.css')
        .reply(404);

      new CleanCSS({ inline: 'all' }).minify('@import url(http://127.0.0.1/missing.css);a{color:red}', this.callback);
    },
    'should raise error': function (errors, minified) {
      assert.lengthOf(errors, 1);
    },
    'should ignore @import': function (errors, minified) {
      assert.equal(minified.styles, '@import url(http://127.0.0.1/missing.css);a{color:red}');
    },
    'hits the endpoint': function (_errors, _minified) {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of an existing file': {
    topic: function () {
      this.reqMocks = nock('http://127.0.0.1')
        .get('/present.css')
        .reply(200, 'p{font-size:13px}');

      new CleanCSS({ inline: 'all' }).minify('@import url(http://127.0.0.1/present.css);a{color:red}', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, 'p{font-size:13px}a{color:red}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of an existing file with spaces in path': {
    topic: function () {
      this.reqMocks = nock('http://fonts.googleapis.com')
        .get('/css?family=Oleo%20Script%20Swash%20Caps')
        .reply(200, 'p{font-size:13px}');

      new CleanCSS({ inline: 'all' }).minify('@import url(\'http://fonts.googleapis.com/css?family=Oleo Script Swash Caps\');', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, 'p{font-size:13px}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of an existing file via HTTPS': {
    topic: function () {
      this.reqMocks = nock('https://127.0.0.1')
        .get('/present.css')
        .reply(200, 'p{font-size:13px}');

      new CleanCSS({ inline: 'all' }).minify('@import url(https://127.0.0.1/present.css);a{color:red}', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, 'p{font-size:13px}a{color:red}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of an existing file with media': {
    topic: function () {
      this.reqMocks = nock('http://127.0.0.1')
        .get('/present.css')
        .reply(200, 'p{font-size:13px}');

      new CleanCSS({ inline: 'all' }).minify('@import url(http://127.0.0.1/present.css) screen;a{color:red}', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, '@media screen{p{font-size:13px}}a{color:red}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of an existing file with dependencies': {
    topic: function () {
      this.reqMocks1 = nock('http://127.0.0.1')
        .get('/present.css')
        .reply(200, '@import url(/vendor/reset.css);@import url(https://assets.127.0.0.1/base.css);p{font-size:13px}')
        .get('/vendor/reset.css')
        .reply(200, 'body{margin:0}');
      this.reqMocks2 = nock('https://assets.127.0.0.1')
        .get('/base.css')
        .reply(200, 'div{padding:0}');

      new CleanCSS({ inline: 'all' }).minify('@import url(http://127.0.0.1/present.css);a{color:red}', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, 'body{margin:0}div{padding:0}p{font-size:13px}a{color:red}');
    },
    'hits endpoints': function () {
      assert.isTrue(this.reqMocks1.isDone());
      assert.isTrue(this.reqMocks2.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of an existing file with relative dependencies': {
    topic: function () {
      this.reqMocks = nock('http://127.0.0.1')
        .get('/nested/present.css')
        .reply(200, '@import url(../vendor/reset.css);p{font-size:13px}')
        .get('/vendor/reset.css')
        .reply(200, 'body{margin:0}');

      new CleanCSS({ inline: 'all' }).minify('@import url(http://127.0.0.1/nested/present.css);a{color:red}', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, 'body{margin:0}p{font-size:13px}a{color:red}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of an existing file missing relative dependency': {
    topic: function () {
      this.reqMocks = nock('http://127.0.0.1')
        .get('/nested/present.css')
        .reply(200, '@import url(../missing.css);p{font-size:13px}')
        .get('/missing.css')
        .reply(404);

      new CleanCSS({ inline: 'all' }).minify('@import url(http://127.0.0.1/nested/present.css);a{color:red}', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.lengthOf(errors, 1);
      assert.equal(errors[0], 'Broken @import declaration of "http://127.0.0.1/missing.css" - 404');
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, '@import url(http://127.0.0.1/missing.css);p{font-size:13px}a{color:red}');
    },
    'hits the endpoint': function (_errors, _minified) {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of an existing file with URLs to rebase': {
    topic: function () {
      this.reqMocks = nock('http://127.0.0.1')
        .get('/urls.css')
        .reply(200, 'a{background:url(test.png)}');

      new CleanCSS({ inline: 'all' }).minify('@import url(http://127.0.0.1/urls.css);', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, 'a{background:url(http://127.0.0.1/test.png)}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of an existing file with relative URLs to rebase': {
    topic: function () {
      this.reqMocks = nock('http://127.0.0.1')
        .get('/base.css')
        .reply(200, '@import url(deeply/nested/urls.css);')
        .get('/deeply/nested/urls.css')
        .reply(200, 'a{background:url(../images/test.png)}');

      new CleanCSS({ inline: 'all' }).minify('@import url(http://127.0.0.1/base.css);', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, 'a{background:url(http://127.0.0.1/deeply/images/test.png)}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of an existing file with relative URLs and rebase turned off': {
    topic: function () {
      this.reqMocks = nock('http://127.0.0.1')
        .get('/base.css')
        .reply(200, '@import url(deeply/nested/urls.css);')
        .get('/deeply/nested/urls.css')
        .reply(200, 'a{background:url(../images/test.png)}');

      new CleanCSS({ inline: 'all', rebase: false }).minify('@import url(http://127.0.0.1/base.css);', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, 'a{background:url(../images/test.png)}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of an existing file with absolute URLs in different domain': {
    topic: function () {
      this.reqMocks = nock('http://127.0.0.1')
        .get('/base.css')
        .reply(200, 'a{background:url(http://example.com/deeply/images/test.png)}');

      new CleanCSS({ inline: 'all' }).minify('@import url(http://127.0.0.1/base.css);', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, 'a{background:url(http://example.com/deeply/images/test.png)}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of an unreachable domain': {
    topic: function () {
      new CleanCSS({ inline: 'all' }).minify('@import url(http://0.0.0.0/custom.css);a{color:red}', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.lengthOf(errors, 1);
      assert.include(errors[0], 'Broken @import declaration of "http://0.0.0.0/custom.css"');
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, '@import url(http://0.0.0.0/custom.css);a{color:red}');
    }
  },
  'of a 30x response with absolute URL': {
    topic: function () {
      this.reqMocks = nock('http://127.0.0.1')
        .get('/moved.css')
        .reply(301, '', { 'Location': 'http://127.0.0.1/present.css' })
        .get('/present.css')
        .reply(200, 'body{margin:0}');

      new CleanCSS({ inline: 'all' }).minify('@import url(http://127.0.0.1/moved.css);a{color:red}', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, 'body{margin:0}a{color:red}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of a 30x response with relative URL': {
    topic: function () {
      this.reqMocks = nock('http://127.0.0.1')
        .get('/moved.css')
        .reply(301, '', { 'Location': '/present.css' })
        .get('/present.css')
        .reply(200, 'body{margin:0}');

      new CleanCSS({ inline: 'all' }).minify('@import url(http://127.0.0.1/moved.css);a{color:red}', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, 'body{margin:0}a{color:red}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of a cyclical reference response': {
    topic: function () {
      this.reqMocks = nock('http://127.0.0.1')
        .get('/one.css')
        .reply(200, '@import url(/two.css);div{padding:0}')
        .get('/two.css')
        .reply(200, '@import url(http://127.0.0.1/two.css);body{margin:0}');

      new CleanCSS({ inline: 'all' }).minify('@import url(http://127.0.0.1/one.css);a{color:red}', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, 'body{margin:0}div{padding:0}a{color:red}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of a resource without protocol': {
    topic: function () {
      new CleanCSS({ inline: 'all' }).minify('@import url(//127.0.0.1/no-protocol.css);a{color:red}', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should be kept intact': function (errors, minified) {
      assert.equal(minified.styles, '@import url(//127.0.0.1/no-protocol.css);a{color:red}');
    }
  },
  'of a resource without protocol with rebase': {
    topic: function () {
      new CleanCSS({ inline: 'all' }).minify('@import url(//127.0.0.1/no-protocol.css);', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, '@import url(//127.0.0.1/no-protocol.css);');
    }
  },
  'of a resource with a protocol and absolute URL without a protocol': {
    topic: function () {
      this.reqMocks = nock('http://127.0.0.1')
        .get('/no-protocol.css')
        .reply(200, 'a{background:url(//127.0.0.1/image.png)}');

      new CleanCSS({ inline: 'all' }).minify('@import url(http://127.0.0.1/no-protocol.css);', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, 'a{background:url(//127.0.0.1/image.png)}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of a resource with protocol with rebase to another domain': {
    topic: function () {
      this.reqMocks = nock('http://127.0.0.1')
        .get('/no-protocol.css')
        .reply(200, 'a{background:url(//127.0.0.2/image.png)}');

      new CleanCSS({ inline: 'all' }).minify('@import url(http://127.0.0.1/no-protocol.css);', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, 'a{background:url(//127.0.0.2/image.png)}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of a resource available via POST only': {
    topic: function () {
      this.reqMocks = nock('http://127.0.0.1')
        .post('/computed.css')
        .reply(200, 'div{padding:0}');

      new CleanCSS({
        inline: 'all',
        inlineRequest: {
          method: 'POST'
        }
      }).minify('@import url(http://127.0.0.1/computed.css);a{color:red}', this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, 'div{padding:0}a{color:red}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of a remote resource mixed with local ones': {
    topic: function () {
      var source = '@import url(http://127.0.0.1/remote.css);@import url(test/fixtures/partials/one.css);';
      this.reqMocks = nock('http://127.0.0.1')
        .get('/remote.css')
        .reply(200, 'div{padding:0}');

      new CleanCSS({ inline: 'all' }).minify(source, this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, 'div{padding:0}.one{color:red}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of a remote resource referenced from local one given via hash': {
    topic: function () {
      this.reqMocks = nock('http://127.0.0.1')
        .get('/remote.css')
        .reply(200, 'div{padding:0}');

      new CleanCSS({ inline: 'all' }).minify({ 'local.css': { styles: '@import url(http://127.0.0.1/remote.css);' } }, this.callback);
    },
    'should not raise errors': function (errors, minified) {
      assert.isNull(errors);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, 'div{padding:0}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of a remote resource after content and no callback': {
    topic: function () {
      var source = '.one{color:red}@import url(http://127.0.0.1/remote.css);';
      this.reqMocks = nock('http://127.0.0.1')
        .get('/remote.css')
        .reply(200, 'div{padding:0}');

      return new CleanCSS({ inline: 'all' }).minify(source);
    },
    'should not raise errors': function (error, minified) {
      assert.isEmpty(minified.errors);
    },
    'should raise warnings': function (error, minified) {
      assert.lengthOf(minified.warnings, 1);
      assert.match(minified.warnings[0], /no callback given/);
    },
    'should process @import': function (error, minified) {
      assert.equal(minified.styles, '.one{color:red}');
    },
    'does not hit the endpoint': function () {
      assert.isFalse(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of a remote resource mixed with local ones but no callback': {
    topic: function () {
      var source = '@import url(test/fixtures/partials/one.css);@import url(http://127.0.0.1/remote.css);';
      this.reqMocks = nock('http://127.0.0.1')
        .get('/remote.css')
        .reply(200, 'div{padding:0}');

      return new CleanCSS({ inline: 'all' }).minify(source);
    },
    'should not raise errors': function (error, minified) {
      assert.isEmpty(minified.errors);
    },
    'should raise warnings': function (error, minified) {
      assert.lengthOf(minified.warnings, 1);
      assert.match(minified.warnings[0], /no callback given/);
    },
    'should process @import': function (error, minified) {
      assert.equal(minified.styles, '.one{color:red}');
    },
    'does not hit the endpoint': function () {
      assert.isFalse(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'of a remote resource mixed with local ones and disabled remote imports': {
    topic: function () {
      var source = '@import url(http://127.0.0.1/skipped.css);@import url(test/fixtures/partials/one.css);';
      new CleanCSS({ inline: ['local'] }).minify(source, this.callback);
    },
    'should not raise errors': function (error, minified) {
      assert.isEmpty(minified.errors);
    },
    'should raise warnings': function (error, minified) {
      assert.lengthOf(minified.warnings, 1);
      assert.equal(minified.warnings[0], 'Skipping remote @import of "http://127.0.0.1/skipped.css" as resource is not allowed.');
    },
    'should keep imports': function (error, minified) {
      assert.equal(minified.styles, '@import url(http://127.0.0.1/skipped.css);.one{color:red}');
    }
  },
  'of a remote file that imports relative stylesheets': {
    topic: function () {
      var source = '@import url(http://127.0.0.1/test/folder/remote.css);';
      this.reqMocks = nock('http://127.0.0.1')
        .get('/test/folder/remote.css')
        .reply(200, '@import url(../otherfolder/remote.css);@import url(deepersubfolder/fonts.css);')
        .get('/test/otherfolder/remote.css')
        .reply(200, 'div{padding:0}')
        .get('/test/folder/deepersubfolder/fonts.css')
        .reply(200, 'a{color:red}');

      new CleanCSS({ inline: 'all' }).minify(source, this.callback);
    },
    'should not raise errors': function (error, minified) {
      assert.isEmpty(minified.errors);
    },
    'should process @import': function (error, minified) {
      assert.equal(minified.styles, 'div{padding:0}a{color:red}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  }
}).addBatch({
  'of a timed out response': {
    topic: function () {
      nock.enableNetConnect();

      var self = this;
      var timeout = 100;
      this.server = http.createServer(function (req, res) {
        setTimeout(function () {}, timeout * 2);
      });
      this.server.listen(port, function () {
        new CleanCSS({
          inline: 'all',
          inlineTimeout: timeout
        }).minify('@import url(http://localhost:' + port + '/timeout.css);a{color:red}', self.callback);
      });
      enableDestroy(self.server);
    },
    'should raise errors': function (errors, minified) {
      assert.lengthOf(errors, 1);
      assert.equal(errors[0], 'Broken @import declaration of "http://localhost:' + port + '/timeout.css" - timeout');
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, '@import url(http://localhost:' + port + '/timeout.css);a{color:red}');
    },
    teardown: function () {
      this.server.destroy();
      nock.disableNetConnect();
    }
  }
}).addBatch({
  'of a proxied resource': {
    topic: function () {
      var self = this;
      nock.enableNetConnect();

      this.proxied = false;

      this.reqMocks = nock('http://assets.127.0.0.1')
        .get('/styles.css')
        .reply(200, 'a{color:red}');

      var proxy = httpProxy.createProxyServer();
      this.proxyServer = http.createServer(function (req, res) {
        self.proxied = true;
        proxy.web(req, res, { target: 'http://' + url.parse(req.url).host }, function () {});
      });
      this.proxyServer.listen(8080, function () {
        var options = {
          inline: 'all',
          inlineRequest: {
            hostname: '127.0.0.1',
            port: 8080
          }
        };

        new CleanCSS(options).minify('@import url(http://assets.127.0.0.1/styles.css);', self.callback);
      });
      enableDestroy(this.proxyServer);
    },
    'proxies the connection': function () {
      assert.isTrue(this.proxied);
    },
    'gets right output': function (errors, minified) {
      assert.equal(minified.styles, 'a{color:red}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
      this.proxyServer.destroy();
    }
  }
}).addBatch({
  'of a proxied resource with https url': {
    topic: function () {
      var self = this;
      nock.enableNetConnect();

      this.proxied = false;

      this.reqMocks = nock('http://assets.127.0.0.1')
        .get('/sslstyles.css')
        .reply(200, 'a{color:red}');

      var proxy = httpProxy.createProxyServer();
      this.proxyServer = http.createServer(function (req, res) {
        self.proxied = true;
        self.isSSL = req.url.indexOf('https://') === 0;
        proxy.web(req, res, { target: 'http://' + url.parse(req.url).host }, function () {});
      });
      this.proxyServer.listen(8080, function () {
        var options = {
          inline: 'all',
          inlineRequest: {
            hostname: '127.0.0.1',
            port: 8080
          }
        };

        new CleanCSS(options).minify('@import url(https://assets.127.0.0.1/sslstyles.css);', self.callback);
      });
      enableDestroy(this.proxyServer);
    },
    'proxies the connection': function () {
      assert.isTrue(this.proxied);
    },
    'ssl was used': function () {
      assert.isTrue(this.isSSL);
    },
    'gets right output': function (errors, minified) {
      assert.equal(minified.styles, 'a{color:red}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
      this.proxyServer.destroy();
    }
  }
}).addBatch({
  'of a proxied resource via env variables': {
    topic: function () {
      var self = this;
      nock.enableNetConnect();

      this.reqMocks = nock('http://assets.127.0.0.1')
        .get('/styles.css')
        .reply(200, 'a{color:red}');

      var proxy = httpProxy.createProxyServer();
      this.proxied = false;
      this.proxyServer = http.createServer(function (req, res) {
        self.proxied = true;
        proxy.web(req, res, { target: 'http://' + url.parse(req.url).host }, function (e) { console.log(e); });
      });
      this.proxyServer.listen(8081, function () {
        process.env.http_proxy = 'http://127.0.0.1:8081';
        new CleanCSS({ inline: 'all' }).minify('@import url(http://assets.127.0.0.1/styles.css);', self.callback);
      });
      enableDestroy(this.proxyServer);
    },
    'proxies the connection': function () {
      assert.isTrue(this.proxied);
    },
    'gets right output': function (errors, minified) {
      assert.equal(minified.styles, 'a{color:red}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
      this.proxyServer.destroy();
      delete process.env.http_proxy;
    }
  }
}).addBatch({
  'of a proxied resource via env variables overridden by options': {
    topic: function () {
      var self = this;
      nock.enableNetConnect();

      this.reqMocks = nock('http://assets.127.0.0.1')
        .get('/styles.css')
        .reply(200, 'a{color:red}');

      var proxy = httpProxy.createProxyServer();
      this.proxied = false;
      this.proxyServer = http.createServer(function (req, res) {
        self.proxied = true;
        proxy.web(req, res, { target: 'http://' + url.parse(req.url).host }, function () {});
      });
      this.proxyServer.listen(8082, function () {
        var options = {
          inline: 'all',
          inlineRequest: {
            hostname: '127.0.0.1',
            port: 8082
          }
        };

        process.env.http_proxy = 'http://some-fake-proxy:8082';
        new CleanCSS(options).minify('@import url(http://assets.127.0.0.1/styles.css);', self.callback);
      });
      enableDestroy(this.proxyServer);
    },
    'proxies the connection': function () {
      assert.isTrue(this.proxied);
    },
    'gets right output': function (errors, minified) {
      assert.equal(minified.styles, 'a{color:red}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
      this.proxyServer.destroy();
      delete process.env.http_proxy;
    }
  }
}).addBatch({
  'allowed imports - not set': {
    topic: function () {
      var source = '@import url(http://127.0.0.1/remote.css);@import url(http://assets.127.0.0.1/remote.css);@import url(test/fixtures/partials/one.css);';
      new CleanCSS().minify(source, this.callback);
    },
    'should not raise errors': function (error, minified) {
      assert.isEmpty(minified.errors);
    },
    'should raise warnings': function (error, minified) {
      assert.lengthOf(minified.warnings, 2);
      assert.equal(minified.warnings[0], 'Skipping remote @import of "http://127.0.0.1/remote.css" as resource is not allowed.');
      assert.equal(minified.warnings[1], 'Skipping remote @import of "http://assets.127.0.0.1/remote.css" as resource is not allowed.');
    },
    'should process imports': function (error, minified) {
      assert.equal(minified.styles, '@import url(http://127.0.0.1/remote.css);@import url(http://assets.127.0.0.1/remote.css);.one{color:red}');
    }
  },
  'allowed imports - not set and disabled by `inline`': {
    topic: function () {
      var source = '@import url(http://127.0.0.1/remote.css);@import url(http://assets.127.0.0.1/remote.css);@import url(test/fixtures/partials/one.css);';
      new CleanCSS({ inline: ['none'] }).minify(source, this.callback);
    },
    'should not raise errors': function (error, minified) {
      assert.isEmpty(minified.errors);
    },
    'should not raise warnings': function (error, minified) {
      assert.isEmpty(minified.warnings);
    },
    'should process imports': function (error, minified) {
      assert.equal(minified.styles, '@import url(http://127.0.0.1/remote.css);@import url(http://assets.127.0.0.1/remote.css);@import url(test/fixtures/partials/one.css);');
    }
  },
  'allowed imports - local': {
    topic: function () {
      var source = '@import url(http://127.0.0.1/remote.css);@import url(http://assets.127.0.0.1/remote.css);@import url(test/fixtures/partials/one.css);';
      new CleanCSS({ inline: ['local'] }).minify(source, this.callback);
    },
    'should not raise errors': function (error, minified) {
      assert.isEmpty(minified.errors);
    },
    'should raise warnings': function (error, minified) {
      assert.lengthOf(minified.warnings, 2);
      assert.equal(minified.warnings[0], 'Skipping remote @import of "http://127.0.0.1/remote.css" as resource is not allowed.');
      assert.equal(minified.warnings[1], 'Skipping remote @import of "http://assets.127.0.0.1/remote.css" as resource is not allowed.');
    },
    'should keeps imports': function (error, minified) {
      assert.equal(minified.styles, '@import url(http://127.0.0.1/remote.css);@import url(http://assets.127.0.0.1/remote.css);.one{color:red}');
    }
  },
  'allowed imports - remote': {
    topic: function () {
      var source = '@import url(http://127.0.0.1/remote.css);@import url(http://assets.127.0.0.1/remote.css);@import url(test/fixtures/partials/one.css);';
      this.reqMocks1 = nock('http://127.0.0.1')
        .get('/remote.css')
        .reply(200, 'div{border:0}');
      this.reqMocks2 = nock('http://assets.127.0.0.1')
        .get('/remote.css')
        .reply(200, 'p{width:100%}');
      new CleanCSS({ inline: ['remote'] }).minify(source, this.callback);
    },
    'should not raise errors': function (error, minified) {
      assert.isEmpty(minified.errors);
    },
    'should raise a warning': function (error, minified) {
      assert.lengthOf(minified.warnings, 1);
    },
    'should process imports': function (error, minified) {
      assert.equal(minified.styles, 'div{border:0}p{width:100%}');
    },
    'hits endpoints': function () {
      assert.isTrue(this.reqMocks1.isDone());
      assert.isTrue(this.reqMocks2.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'allowed imports - all': {
    topic: function () {
      var source = '@import url(http://127.0.0.1/remote.css);@import url(http://assets.127.0.0.1/remote.css);@import url(test/fixtures/partials/one.css);';
      this.reqMocks1 = nock('http://127.0.0.1')
        .get('/remote.css')
        .reply(200, 'div{border:0}');
      this.reqMocks2 = nock('http://assets.127.0.0.1')
        .get('/remote.css')
        .reply(200, 'p{width:100%}');
      new CleanCSS({ inline: ['all'] }).minify(source, this.callback);
    },
    'should not raise errors': function (error, minified) {
      assert.isEmpty(minified.errors);
    },
    'should not raise warnings': function (error, minified) {
      assert.isEmpty(minified.warnings);
    },
    'should process imports': function (error, minified) {
      assert.equal(minified.styles, 'div{border:0}p{width:100%}.one{color:red}');
    },
    'hits endpoints': function () {
      assert.isTrue(this.reqMocks1.isDone());
      assert.isTrue(this.reqMocks2.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'allowed imports - blacklisted': {
    topic: function () {
      var source = '@import url(http://127.0.0.1/remote.css);@import url(http://assets.127.0.0.1/remote.css);@import url(test/fixtures/partials/one.css);';
      new CleanCSS({ inline: ['remote', 'local', '!assets.127.0.0.1', '!127.0.0.1', '!test/fixtures/partials/one.css'] }).minify(source, this.callback);
    },
    'should not raise errors': function (error, minified) {
      assert.isEmpty(minified.errors);
    },
    'should raise a warning': function (error, minified) {
      assert.lengthOf(minified.warnings, 3);
      assert.equal(minified.warnings[0], 'Skipping remote @import of "http://127.0.0.1/remote.css" as resource is not allowed.');
      assert.equal(minified.warnings[1], 'Skipping remote @import of "http://assets.127.0.0.1/remote.css" as resource is not allowed.');
      assert.equal(minified.warnings[2], 'Skipping local @import of "test/fixtures/partials/one.css" as resource is not allowed.');
    },
    'should process first imports': function (error, minified) {
      assert.equal(minified.styles, '@import url(http://127.0.0.1/remote.css);@import url(http://assets.127.0.0.1/remote.css);@import url(test/fixtures/partials/one.css);');
    }
  },
  'allowed imports - no-protocol': {
    topic: function () {
      var source = '@import url(//127.0.0.1/remote.css);@import url(test/fixtures/partials/one.css);';
      new CleanCSS({ inline: ['//127.0.0.1', 'local'] }).minify(source, this.callback);
    },
    'should not raise errors': function (error, minified) {
      assert.isEmpty(minified.errors);
    },
    'should raise a warning': function (error, minified) {
      assert.lengthOf(minified.warnings, 1);
      assert.equal(minified.warnings[0], 'Skipping remote @import of "//127.0.0.1/remote.css" as no protocol given.');
    },
    'should process first imports': function (error, minified) {
      assert.equal(minified.styles, '@import url(//127.0.0.1/remote.css);.one{color:red}');
    }
  },
  'allowed imports - from specific URI': {
    topic: function () {
      var source = '@import url(http://127.0.0.1/remote.css);@import url(http://assets.127.0.0.1/remote.css);@import url(test/fixtures/partials/one.css);';
      this.reqMocks = nock('http://assets.127.0.0.1')
        .get('/remote.css')
        .reply(200, 'p{width:100%}');
      new CleanCSS({ inline: ['http://assets.127.0.0.1/remote.css', 'test/fixtures/partials/one.css'] }).minify(source, this.callback);
    },
    'should not raise errors': function (error, minified) {
      assert.isEmpty(minified.errors);
    },
    'should raise warnings': function (error, minified) {
      assert.lengthOf(minified.warnings, 1);
    },
    'should process imports': function (error, minified) {
      assert.equal(minified.styles, '@import url(http://127.0.0.1/remote.css);p{width:100%}.one{color:red}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  },
  'allowed imports - from URI prefix': {
    topic: function () {
      var source = '@import url(http://127.0.0.1/remote.css);@import url(http://assets.127.0.0.1/remote.css);@import url(test/fixtures/partials/one.css);';
      this.reqMocks = nock('http://assets.127.0.0.1')
        .get('/remote.css')
        .reply(200, 'p{width:100%}');
      new CleanCSS({ inline: ['remote', '!http://127.0.0.1/', 'test/fixtures/partials'] }).minify(source, this.callback);
    },
    'should not raise errors': function (error, minified) {
      assert.isEmpty(minified.errors);
    },
    'should raise warnings': function (error, minified) {
      assert.lengthOf(minified.warnings, 1);
    },
    'should process imports': function (error, minified) {
      assert.equal(minified.styles, '@import url(http://127.0.0.1/remote.css);p{width:100%}.one{color:red}');
    },
    'hits the endpoint': function () {
      assert.isTrue(this.reqMocks.isDone());
    },
    teardown: function () {
      nock.cleanAll();
    }
  }
}).addBatch({
  'custom fetch callback with no request': {
    topic: function () {
      new CleanCSS({
        fetch: function (uri, inlineRequest, inlineTimeout, callback) {
          if (uri == 'http://localhost:12345/custom.css') {
            callback(null, 'a{color:red}');
          }
        },
        inline: 'all'
      }).minify('@import url(http://localhost:12345/custom.css);', this.callback);
    },
    'should process @import': function (errors, minified) {
      assert.equal(minified.styles, 'a{color:red}');
    }
  },
  'custom fetch callback with real request': {
    topic: function () {
      var self = this;
      nock.enableNetConnect();

      this.server = http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.end('a{color:red}');
      });
      this.server.listen(port, function () {
        new CleanCSS({
          fetch: function (uri, inlineRequest, inlineTimeout, callback) {
            if (uri == 'http://localhost:' + port + '/custom.css') {
              http.get(uri, function (res) {
                var rawData = [];

                res.on('data', function (chunk) { rawData.push(chunk); });
                res.on('end', function () {
                  callback(null, rawData.join(''));
                });
              });
            }
          },
          inline: 'all'
        }).minify('@import url(http://localhost:' + port + '/custom.css);', self.callback);
      });

      enableDestroy(this.server);
    },
    'gets right output': function (errors, minified) {
      assert.equal(minified.styles, 'a{color:red}');
    },
    teardown: function () {
      this.server.destroy();
    }
  },
  'custom fetch callback with error': {
    topic: function () {
      new CleanCSS({
        fetch: function (uri, inlineRequest, inlineTimeout, callback) {
          callback('some error', null);
        },
        inline: 'all'
      }).minify('@import url(http://localhost:12345/custom.css);', this.callback);
    },
    'should raise error': function (errors, minified) {
      assert.deepEqual(errors, ['Broken @import declaration of "http://localhost:12345/custom.css" - some error']);
    }
  }
}).export(module);
