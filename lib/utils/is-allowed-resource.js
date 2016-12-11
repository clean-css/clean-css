var url = require('url');

var hasProtocol = require('./has-protocol');

var HTTP_PROTOCOL = 'http:';

function isAllowedResource(uri, isRemote, rules) {
  var match;
  var allowed = true;
  var rule;
  var i;

  if (rules.length === 0) {
    return false;
  }

  if (isRemote && !hasProtocol(uri)) {
    uri = HTTP_PROTOCOL + uri;
  }

  match = isRemote ?
    url.parse(uri).host :
    uri;

  for (i = 0; i < rules.length; i++) {
    rule = rules[i];

    if (rule == 'all') {
      allowed = true;
    } else if (isRemote && rule == 'local') {
      allowed = false;
    } else if (isRemote && rule == 'remote') {
      allowed = true;
    } else if (!isRemote && rule == 'remote') {
      allowed = false;
    } else if (!isRemote && rule == 'local') {
      allowed = true;
    } else if (rule[0] == '!' && rule.substring(1) === match) {
      allowed = false;
    }
  }

  return allowed;
}

module.exports = isAllowedResource;
