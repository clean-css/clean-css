// TODO: we should wrap it under `wrap for optimizing`

var BACKSLASH_HACK = '\\9';
var IMPORTANT = '!important';
var STAR_HACK = '*';
var UNDERSCORE_HACK = '_';

function addOptimizationMetadata(tokens) {
  for (var i = tokens.length - 1; i >= 0; i--) {
    var token = tokens[i];

    switch (token[0]) {
      case 'selector':
        addToProperties(token[2]);
        break;
      case 'block':
        addOptimizationMetadata(token[2]);
        break;
    }
  }
}

function addToProperties(properties) {
  for (var i = properties.length - 1; i >= 0; i--) {
    if (typeof properties[i] != 'string')
      addToProperty(properties[i]);
  }
}

function addToProperty(property) {
  var name = property[0][0];
  var lastValue = property[property.length - 1];
  var isImportant = lastValue[0].indexOf(IMPORTANT) > 0;
  var isHack = name[0] == UNDERSCORE_HACK ||
    name[0] == STAR_HACK ||
    lastValue[0].indexOf(BACKSLASH_HACK) > 0 && lastValue[0].indexOf(BACKSLASH_HACK) == lastValue[0].length - BACKSLASH_HACK.length;

  // TODO: this should be done at tokenization step
  // with adding importance info
  if (isImportant)
    lastValue[0] = lastValue[0].substring(0, lastValue[0].length - IMPORTANT.length);

  property[0].splice(1, 0, isImportant, isHack);
}

module.exports = addOptimizationMetadata;
