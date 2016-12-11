var isRemoteResource = require('./is-remote-resource');

function isAbsoluteResource(uri) {
  return !isRemoteResource(uri) && uri[0] == '/';
}

module.exports = isAbsoluteResource;
