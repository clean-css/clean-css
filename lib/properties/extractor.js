// This extractor is used in advanced optimizations
// IMPORTANT: Mind Token class and this code is not related!
// Properties will be tokenized in one step, see #429

function extract(token) {
  var properties = [];

  if (token[0] == 'selector') {
    // TODO: stringifySelector
    var inSimpleSelector = !/[\.\+#>~\s]/.test(token[1].join(','));
    for (var i = 0, l = token[2].length; i < l; i++) {
      var property = token[2][i][0];
      if (property.indexOf('__ESCAPED') === 0)
        continue;

      var splitAt = property.indexOf(':');
      var name = property.substring(0, splitAt);
      if (!name)
        continue;

      var nameRoot = findNameRoot(name);

      properties.push([
        name,
        property.substring(splitAt + 1),
        nameRoot,
        token[2][i],
        token[1],
        inSimpleSelector
      ]);
    }
  } else if (token[0] == 'block') {
    for (var j = 0, k = token[2].length; j < k; j++) {
      properties = properties.concat(extract(token[2][j]));
    }
  }

  return properties;
}

function findNameRoot(name) {
  if (name == 'list-style')
    return name;
  if (name.indexOf('-radius') > 0)
    return 'border-radius';
  if (name.indexOf('border-') === 0)
    return name.match(/border\-\w+/)[0];
  if (name.indexOf('text-') === 0)
    return name;

  return name.replace(/^\-\w+\-/, '').match(/([a-zA-Z]+)/)[0].toLowerCase();
}

module.exports = extract;
