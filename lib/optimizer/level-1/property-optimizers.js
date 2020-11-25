var OptimizationLevel = require('../../options/optimization-level').OptimizationLevel;

function isNegative(value) {
  return value && value[1][0] == '-' && parseFloat(value[1]) < 0;
}

function background(property, options) {
  var values = property.value;

  if (!options.level[OptimizationLevel.One].optimizeBackground) {
    return;
  }

  if (values.length == 1 && values[0][1] == 'none') {
    values[0][1] = '0 0';
  }

  if (values.length == 1 && values[0][1] == 'transparent') {
    values[0][1] = '0 0';
  }
}

function borderRadius(property, options) {
  var values = property.value;

  if (!options.level[OptimizationLevel.One].optimizeBorderRadius) {
    return;
  }

  if (values.length == 3 && values[1][1] == '/' && values[0][1] == values[2][1]) {
    property.value.splice(1);
    property.dirty = true;
  } else if (values.length == 5 && values[2][1] == '/' && values[0][1] == values[3][1] && values[1][1] == values[4][1]) {
    property.value.splice(2);
    property.dirty = true;
  } else if (values.length == 7 && values[3][1] == '/' && values[0][1] == values[4][1] && values[1][1] == values[5][1] && values[2][1] == values[6][1]) {
    property.value.splice(3);
    property.dirty = true;
  } else if (values.length == 9 && values[4][1] == '/' && values[0][1] == values[5][1] && values[1][1] == values[6][1] && values[2][1] == values[7][1] && values[3][1] == values[8][1]) {
    property.value.splice(4);
    property.dirty = true;
  }
}

function boxShadow(property) {
  var values = property.value;

  // remove multiple zeros
  if (values.length == 4 && values[0][1] === '0' && values[1][1] === '0' && values[2][1] === '0' && values[3][1] === '0') {
    property.value.splice(2);
    property.dirty = true;
  }
}

function filter(property, options) {
  if (!options.compatibility.properties.ieFilters) {
    return;
  }

  if (!options.level[OptimizationLevel.One].optimizeFilter) {
    return;
  }

  if (property.value.length == 1) {
    property.value[0][1] = property.value[0][1].replace(/progid:DXImageTransform\.Microsoft\.(Alpha|Chroma)(\W)/, function (match, filter, suffix) {
      return filter.toLowerCase() + suffix;
    });
  }

  property.value[0][1] = property.value[0][1]
    .replace(/,(\S)/g, ', $1')
    .replace(/ ?= ?/g, '=');
}

function fontWeight(property, options) {
  var value = property.value[0][1];

  if (!options.level[OptimizationLevel.One].optimizeFontWeight) {
    return;
  }

  if (value == 'normal') {
    value = '400';
  } else if (value == 'bold') {
    value = '700';
  }

  property.value[0][1] = value;
}

function margin(property, options) {
  var values = property.value;

  if (!options.level[OptimizationLevel.One].replaceMultipleZeros) {
    return;
  }

  // remove multiple zeros
  if (values.length == 4 && values[0][1] === '0' && values[1][1] === '0' && values[2][1] === '0' && values[3][1] === '0') {
    property.value.splice(1);
    property.dirty = true;
  }
}

function outline(property, options) {
  var values = property.value;

  if (!options.level[OptimizationLevel.One].optimizeOutline) {
    return;
  }

  if (values.length == 1 && values[0][1] == 'none') {
    values[0][1] = '0';
  }
}

function padding(property, options) {
  var values = property.value;

  // remove multiple zeros
  if (values.length == 4 && values[0][1] === '0' && values[1][1] === '0' && values[2][1] === '0' && values[3][1] === '0') {
    property.value.splice(1);
    property.dirty = true;
  }

  // remove negative paddings
  if (options.level[OptimizationLevel.One].removeNegativePaddings && (isNegative(property.value[0]) || isNegative(property.value[1]) || isNegative(property.value[2]) || isNegative(property.value[3]))) {
    property.unused = true;
  }
}

module.exports = {
  background: background,
  boxShadow: boxShadow,
  borderRadius: borderRadius,
  filter: filter,
  fontWeight: fontWeight,
  margin: margin,
  outline: outline,
  padding: padding
};
