function split(value, separator, includeSeparator) {
  var withRegex = typeof separator != 'string';
  var hasSeparator = withRegex ?
    separator.test(value) :
    value.indexOf(separator);

  if (!hasSeparator)
    return [value];

  if (value.indexOf('(') === -1 && !includeSeparator)
    return value.split(separator);

  var level = 0;
  var cursor = 0;
  var lastStart = 0;
  var len = value.length;
  var tokens = [];

  while (cursor++ < len) {
    if (value[cursor] == '(') {
      level++;
    } else if (value[cursor] == ')') {
      level--;
    } else if ((withRegex ? separator.test(value[cursor]) : value[cursor] == separator) && level === 0) {
      tokens.push(value.substring(lastStart, cursor + (includeSeparator ? 1 : 0)));
      lastStart = cursor + 1;
    }
  }

  if (lastStart < cursor + 1)
    tokens.push(value.substring(lastStart));

  return tokens;
}

module.exports = split;
