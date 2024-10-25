function rebaseToFrom(option) {
  // Note: Keep this as a dynamic, on-demand require for edge compatibility
  var path = require('path');
  return option ? path.resolve(option) : process.cwd();
}

module.exports = rebaseToFrom;
