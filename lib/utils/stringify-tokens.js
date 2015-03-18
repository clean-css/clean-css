function stringify(values, separator) {
  var i = 0;
  var result = [];

  while (values[i]) {
    result.push(values[i][0]);
    i++;
  }

  return result.join(separator);
}

function stringifyBody(properties) {
  return stringify(properties, ';');
}

function stringifySelector(list) {
  return stringify(list, ',');
}

module.exports = {
  body: stringifyBody,
  selector: stringifySelector
};
