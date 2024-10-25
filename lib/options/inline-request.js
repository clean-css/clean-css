var override = require('../utils/override');

function inlineRequestFrom(option) {
  return override(
    /* jshint camelcase: false */
    proxyOptionsFrom(process.env.HTTP_PROXY || process.env.http_proxy),
    option || {}
  );
}

function proxyOptionsFrom(httpProxy) {
  // Note: Keep this as a dynamic, on-demand requires for edge compatibility
  var url = require('url');

  return httpProxy
    ? {
      hostname: url.parse(httpProxy).hostname,
      port: parseInt(url.parse(httpProxy).port)
    }
    : {};
}

module.exports = inlineRequestFrom;
