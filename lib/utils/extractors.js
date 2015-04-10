var Splitter = require('./splitter');

var COMMA = ',';
var FORWARD_SLASH = '/';

function selectorName(value) {
  return value[0];
}

var Extractors = {
  properties: function (string, selectors, context) {
    var list = [];
    var splitter = new Splitter(/[ ,\/]/);

    if (typeof string != 'string')
      return [];

    if (string.indexOf('__ESCAPED_COMMENT_') > -1)
      string = string.replace(/(__ESCAPED_COMMENT_(SPECIAL_)?CLEAN_CSS[^_]+?__)/g, ';$1;');

    if (string.indexOf(')') > -1)
      string = string.replace(/\)([^\s_;:,\)])/g, context.sourceMaps ? ') __ESCAPED_COMMENT_CLEAN_CSS(0,-1)__ $1' : ') $1');

    if (string.indexOf('ESCAPED_URL_CLEAN_CSS') > -1)
      string = string.replace(/(ESCAPED_URL_CLEAN_CSS[^_]+?__)/g, context.sourceMaps ? '$1 __ESCAPED_COMMENT_CLEAN_CSS(0,-1)__ ' : '$1 ');

    var candidates = string.split(';');

    for (var i = 0, l = candidates.length; i < l; i++) {
      var candidate = candidates[i];
      var firstColonAt = candidate.indexOf(':');

      if (firstColonAt == -1) {
        context.track(candidate);
        if (candidate.indexOf('__ESCAPED_COMMENT_SPECIAL') > -1)
          list.push(candidate);
        continue;
      }

      if (candidate.indexOf('{') > 0) {
        context.track(candidate);
        continue;
      }

      var body = [];
      var name = candidate.substring(0, firstColonAt);
      body.push([name.trim()].concat(context.track(name, true)));
      context.track(':');

      var values = splitter.split(candidate.substring(firstColonAt + 1), true);

      if (values.length == 1 && values[0] === '') {
        context.outer.warnings.push('Empty property \'' + name + '\' inside \'' + selectors.filter(selectorName).join(',') + '\' selector. Ignoring.');
        continue;
      }

      for (var j = 0, m = values.length; j < m; j++) {
        var value = values[j];
        var trimmed = value.trim();

        if (trimmed.length === 0)
          continue;

        var lastCharacter = trimmed[trimmed.length - 1];
        var endsWithNonSpaceSeparator = trimmed.length > 1 && (lastCharacter == COMMA || lastCharacter == FORWARD_SLASH);

        if (endsWithNonSpaceSeparator)
          trimmed = trimmed.substring(0, trimmed.length - 1);

        if (trimmed.indexOf('__ESCAPED_COMMENT_CLEAN_CSS(0,-') > -1) {
          context.track(trimmed);
          continue;
        }

        var pos = body.length - 1;
        if (trimmed == 'important' && body[pos][0] == '!') {
          context.track(trimmed);
          body[pos - 1][0] += '!important';
          body.pop();
          continue;
        }

        if (trimmed == '!important' || (trimmed == 'important' && body[pos][0][body[pos][0].length - 1] == '!')) {
          context.track(trimmed);
          body[pos][0] += trimmed;
          continue;
        }

        body.push([trimmed].concat(context.track(value, true)));

        if (endsWithNonSpaceSeparator) {
          body.push([lastCharacter]);
          context.track(lastCharacter);
        }
      }

      if (i < l - 1)
        context.track(';');

      list.push(body);
    }

    return list;
  },

  selectors: function (string, context) {
    var list = [];
    var metadata;
    var selectors = new Splitter(',').split(string);

    for (var i = 0, l = selectors.length; i < l; i++) {
      metadata = context.track(selectors[i], true, i);
      context.track(',');
      list.push([selectors[i].trim()].concat(metadata));
    }

    return list;
  }
};

module.exports = Extractors;
