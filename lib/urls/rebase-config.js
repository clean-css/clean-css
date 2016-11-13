var path = require('path');

function rebaseConfig(context) {
  var config = {
    absolute: context.options.explicitRoot,
    relative: !context.options.explicitRoot && context.options.explicitTarget,
    fromBase: context.options.relativeTo
  };

  if (!config.absolute && !config.relative) {
    return null;
  }

  if (config.absolute && context.options.explicitTarget) {
    context.warnings.push('Both \'root\' and output file given so rebasing URLs as absolute paths');
  }

  if (config.absolute) {
    config.toBase = path.resolve(context.options.root);
  }

  if (config.relative) {
    config.toBase = path.resolve(context.options.target);
  }

  return config.fromBase && config.toBase ?
    config :
    null;
}

module.exports = rebaseConfig;
