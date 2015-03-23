var wrapSingle = require('./wrap-for-optimizing').single;

function shallowClone(property) {
  var cloned = wrapSingle([[property.name, property.important, property.hack]]);
  cloned.unused = false;
  return cloned;
}

module.exports = shallowClone;
