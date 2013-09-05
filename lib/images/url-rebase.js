var path = require('path');

var UrlRewriter = require('./url-rewriter');

module.exports = {
  process: function(data, options) {
    var rebaseOpts = {
      absolute: !!options.root,
      relative: !options.root && !!options.target,
      fromBase: options.relativeTo
    };

    if (rebaseOpts.absolute)
      rebaseOpts.toBase = path.resolve(options.root);

    if (rebaseOpts.relative)
      rebaseOpts.toBase = path.resolve(path.dirname(options.target));

    return UrlRewriter.process(data, rebaseOpts);
  }
};
