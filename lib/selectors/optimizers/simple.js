var PropertyOptimizer = require('../../properties/optimizer');
var CleanUp = require('./clean-up');

function SimpleOptimizer(options, context) {
  this.options = options;
  this.propertyOptimizer = new PropertyOptimizer(this.options.compatibility, this.options.aggressiveMerging, context);
}

function minify(tokens) {
  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];

    if (token.selector) {
      token.selector = CleanUp.selectors(token.selector);
    } else if (token.block) {
      token.block = CleanUp.block(token.block);
      minify(token.body);
    }
  }
}

SimpleOptimizer.prototype.optimize = function(tokens) {
  minify(tokens);
};

module.exports = SimpleOptimizer;
