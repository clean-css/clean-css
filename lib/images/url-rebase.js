var path = require('path');

var UrlRewriter = require('./url-rewriter');

function UrlRebase(outerContext) {
  this.outerContext = outerContext;
}

UrlRebase.prototype.process = function (data) {
  var options = this.outerContext.options;

  var rebaseOpts = {
    absolute: options.explicitRoot,
    relative: !options.explicitRoot && options.explicitTarget,
    fromBase: options.relativeTo
  };

  if (!rebaseOpts.absolute && !rebaseOpts.relative)
    return data;

  if (rebaseOpts.absolute && options.explicitTarget)
    this.outerContext.warnings.push('Both \'root\' and output file given so rebasing URLs as absolute paths');

  if (rebaseOpts.absolute)
    rebaseOpts.toBase = path.resolve(options.root);

  if (rebaseOpts.relative)
    rebaseOpts.toBase = path.resolve(options.target);

  if (!rebaseOpts.fromBase || !rebaseOpts.toBase)
    return data;

  return new UrlRewriter(rebaseOpts).process(data);
};

module.exports = UrlRebase;
