var Tokenizer = require('./tokenizer');
var SimpleOptimizer = require('./optimizers/simple');
var AdvancedOptimizer = require('./optimizers/advanced');
var addOptimizationMetadata = require('./optimization-metadata');

function SelectorsOptimizer(options, context) {
  this.options = options || {};
  this.context = context || {};
}

SelectorsOptimizer.prototype.process = function (data, stringify, restoreCallback, sourceMapTracker) {
  var tokens = new Tokenizer(this.context, this.options.sourceMap).toTokens(data);

  addOptimizationMetadata(tokens);

  new SimpleOptimizer(this.options).optimize(tokens);
  if (this.options.advanced)
    new AdvancedOptimizer(this.options, this.context).optimize(tokens);

  return stringify(tokens, this.options, restoreCallback, sourceMapTracker);
};

module.exports = SelectorsOptimizer;
