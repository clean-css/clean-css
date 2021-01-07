var startsAsUrl = require('./starts-as-url');

var WHITESPACE_PATTERN = /\\?\n|\\?\r\n/g;

var plugin = {
  level1: {
    value: function urlWhitespace(_name, value) {
      if (!startsAsUrl(value)) {
        return value;
      }

      return value.replace(WHITESPACE_PATTERN, '');
    }
  }
};

module.exports = plugin;
