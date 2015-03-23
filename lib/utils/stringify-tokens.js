function stringifyValue(property) {
  var result = '';
  for (var i = 1, l = property.length; i < l; i++) {
    result += property[i][0] + (i < l - 1 ? ' ' : '');
  }

  return result;
}

function stringifyBody(properties) {
  var result = '';
  for (var i = 0, l = properties.length; i < l; i++) {
    var property = properties[i];

    result += property[0][0] + ':';
    for (var j = 1, m = property.length; j < m; j++) {
      result += property[j][0] + (j < m - 1 ? ' ' : '');
    }

    result += (i < l - 1 ? ';' : '');
  }

  return result;
}

function stringifySelector(list) {
  var result = '';
  for (var i = 0, l = list.length; i < l; i++) {
    result += list[i][0] + (i < l - 1 ? ',' : '');
  }

  return result;
}

module.exports = {
  value: stringifyValue,
  body: stringifyBody,
  selector: stringifySelector
};
