var http = require('http');
var https = require('https');
var url = require('url');

var hasProtocol = require('./has-protocol');
var isHttpResource = require('./is-http-resource');
var isHttpsResource = require('./is-https-resource');
var override = require('./override');

var HTTP_PROTOCOL = 'http:';

function loadRemoteResource(uri, inlinerOptions, callback) {
  var proxyProtocol = inlinerOptions.request.protocol || inlinerOptions.request.hostname;
  var errorHandled = false;
  var requestOptions;
  var fetch;

  if (!hasProtocol(uri)) {
    uri = 'http:' + uri;
  }

  requestOptions = override(
    url.parse(uri),
    inlinerOptions.request || {}
  );

  if (inlinerOptions.request.hostname !== undefined) {
    // overwrite as we always expect a http proxy currently
    requestOptions.protocol = inlinerOptions.request.protocol || HTTP_PROTOCOL;
    requestOptions.path = requestOptions.href;
  }

  fetch = (proxyProtocol && !isHttpsResource(proxyProtocol)) || isHttpResource(uri) ?
    http.get :
    https.get;

  fetch(requestOptions, function (res) {
    var chunks = [];
    var movedUri;

    if (res.statusCode < 200 || res.statusCode > 399) {
      return callback(res.statusCode, null);
    } else if (res.statusCode > 299) {
      movedUri = url.resolve(uri, res.headers.location);
      return loadRemoteResource(movedUri, inlinerOptions, callback);
    }

    res.on('data', function (chunk) {
      chunks.push(chunk.toString());
    });
    res.on('end', function () {
      var body = chunks.join('');
      callback(null, body);
    });
  })
  .on('error', function (res) {
    if (errorHandled) {
      return;
    }

    errorHandled = true;
    callback(res.message, null);
  })
  .on('timeout', function () {
    if (errorHandled) {
      return;
    }

    errorHandled = true;
    callback('timeout', null);
  })
  .setTimeout(inlinerOptions.timeout);
}

module.exports = loadRemoteResource;
