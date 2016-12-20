/**
 * Clean-css - https://github.com/jakubpawlowicz/clean-css
 * Released under the terms of MIT license
 *
 * Copyright (C) 2016 JakubPawlowicz.com
 */

var path = require('path');
var url = require('url');

var compatibility = require('./utils/compatibility');
var Validator = require('./properties/validator');
var override = require('./utils/override');
var roundingPrecisionFrom = require('./utils/rounding-precision').roundingPrecisionFrom;
var DEFAULT_TIMEOUT = 5000;

var inputSourceMapTracker = require('./reader/input-source-map-tracker');
var readSources = require('./reader/read-sources');
var basicOptimize = require('./optimizer/basic');
var advancedOptimize = require('./optimizer/advanced');
var serializeStyles = require('./writer/simple');
var serializeStylesAndSourceMap = require('./writer/source-maps');

var CleanCSS = module.exports = function CleanCSS(options) {
  options = options || {};

  this.options = {
    advanced: undefined === options.advanced ? true : !!options.advanced,
    aggressiveMerging: undefined === options.aggressiveMerging ? true : !!options.aggressiveMerging,
    benchmark: options.benchmark,
    compatibility: compatibility(options.compatibility),
    inliner: options.inliner || {},
    keepBreaks: options.keepBreaks || false,
    keepSpecialComments: 'keepSpecialComments' in options ? options.keepSpecialComments : '*',
    mediaMerging: undefined === options.mediaMerging ? true : !!options.mediaMerging,
    processImport: undefined === options.processImport ? true : !!options.processImport,
    processImportFrom: importOptionsFrom(options.processImportFrom),
    rebase: undefined === options.rebase ? true : !!options.rebase,
    rebaseTo: ('rebaseTo' in options) ? path.resolve(options.rebaseTo) : process.cwd(),
    restructuring: undefined === options.restructuring ? true : !!options.restructuring,
    roundingPrecision: roundingPrecisionFrom(options.roundingPrecision),
    semanticMerging: undefined === options.semanticMerging ? false : !!options.semanticMerging,
    shorthandCompacting: undefined === options.shorthandCompacting ? true : !!options.shorthandCompacting,
    sourceMap: options.sourceMap,
    sourceMapInlineSources: !!options.sourceMapInlineSources
  };

  this.options.inliner.timeout = this.options.inliner.timeout || DEFAULT_TIMEOUT;
  this.options.inliner.request = override(
    /* jshint camelcase: false */
    proxyOptionsFrom(process.env.HTTP_PROXY || process.env.http_proxy),
    this.options.inliner.request || {}
  );
};

function importOptionsFrom(rules) {
  return undefined === rules ? ['all'] : rules;
}

function proxyOptionsFrom(httpProxy) {
  return httpProxy ?
    {
      hostname: url.parse(httpProxy).hostname,
      port: parseInt(url.parse(httpProxy).port)
    } :
    {};
}

CleanCSS.prototype.minify = function (input, callback) {
  var context = {
    stats: {
      efficiency: 0,
      minifiedSize: 0,
      originalSize: 0,
      startedAt: process.hrtime(),
      timeSpent: 0
    },
    errors: [],
    inlinedStylesheets: [],
    inputSourceMapTracker: inputSourceMapTracker(),
    localOnly: !callback,
    options: this.options,
    source: null,
    sourcesContent: {},
    validator: new Validator(this.options.compatibility),
    warnings: []
  };

  if (typeof this.options.sourceMap == 'string') {
    context.inputSourceMapTracker.track(undefined, this.options.sourceMap);
  }

  return runner(context.localOnly)(function () {
    return readSources(input, context, function (tokens) {
      var serialize = context.options.sourceMap ?
        serializeStylesAndSourceMap :
        serializeStyles;

      var optimizedTokens = optimize(tokens, context);
      var optimizedStyles = serialize(optimizedTokens, context);
      var output = withMetadata(optimizedStyles, context);

      return callback ?
        callback(context.errors.length > 0 ? context.errors : null, output) :
        output;
    });
  });
};

function runner(localOnly) {
  // to always execute code asynchronously when a callback is given
  // more at blog.izs.me/post/59142742143/designing-apis-for-asynchrony
  return localOnly ?
    function (callback) { return callback(); } :
    process.nextTick;
}

function optimize(tokens, context) {
  var optimized;

  optimized = basicOptimize(tokens, context);
  optimized = context.options.advanced ?
    advancedOptimize(tokens, context, true) :
    optimized;

  return optimized;
}

function withMetadata(output, context) {
  output.stats = calculateStatsFrom(output.styles, context);
  output.errors = context.errors;
  output.inlinedStylesheets = context.inlinedStylesheets;
  output.warnings = context.warnings;

  return output;
}

function calculateStatsFrom(styles, context) {
  var elapsed = process.hrtime(context.stats.startedAt);

  delete context.stats.startedAt;
  context.stats.timeSpent = ~~(elapsed[0] * 1e3 + elapsed[1] / 1e6);
  context.stats.efficiency = 1 - styles.length / context.stats.originalSize;
  context.stats.minifiedSize = styles.length;

  return context.stats;
}
