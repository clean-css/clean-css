/**
 * Clean-css - https://github.com/jakubpawlowicz/clean-css
 * Released under the terms of MIT license
 *
 * Copyright (C) 2016 JakubPawlowicz.com
 */

var path = require('path');
var url = require('url');

var formatFrom = require('./options/format').formatFrom;
var OptimizationLevel = require('./options/optimization-level').OptimizationLevel;
var optimizationLevelFrom = require('./options/optimization-level').optimizationLevelFrom;

var level0Optimize = require('./optimizer/level-0/optimize');
var level1Optimize = require('./optimizer/level-1/optimize');
var level2Optimize = require('./optimizer/level-2/optimize');
var validator = require('./optimizer/validator');

var inputSourceMapTracker = require('./reader/input-source-map-tracker');
var readSources = require('./reader/read-sources');

var compatibility = require('./utils/compatibility');
var override = require('./utils/override');
var serializeStyles = require('./writer/simple');
var serializeStylesAndSourceMap = require('./writer/source-maps');

var DEFAULT_TIMEOUT = 5000;

var CleanCSS = module.exports = function CleanCSS(options) {
  options = options || {};

  this.options = {
    aggressiveMerging: undefined === options.aggressiveMerging ? true : !!options.aggressiveMerging,
    compatibility: compatibility(options.compatibility),
    format: formatFrom(options.format),
    inline: inlineOptionsFrom(options.inline),
    inlineRequest: options.inlineRequest || {},
    inlineTimeout: options.inlineTimeout || DEFAULT_TIMEOUT,
    level: optimizationLevelFrom(options.level),
    rebase: undefined === options.rebase ? true : !!options.rebase,
    rebaseTo: ('rebaseTo' in options) ? path.resolve(options.rebaseTo) : process.cwd(),
    sourceMap: options.sourceMap,
    sourceMapInlineSources: !!options.sourceMapInlineSources
  };

  this.options.inlineRequest = override(
    /* jshint camelcase: false */
    proxyOptionsFrom(process.env.HTTP_PROXY || process.env.http_proxy),
    this.options.inlineRequest
  );
};

function inlineOptionsFrom(rules) {
  if (Array.isArray(rules)) {
    return rules;
  }

  return undefined === rules ?
    ['local'] :
    rules.split(',');
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
      startedAt: Date.now(),
      timeSpent: 0
    },
    cache: {
      specificity: {}
    },
    errors: [],
    inlinedStylesheets: [],
    inputSourceMapTracker: inputSourceMapTracker(),
    localOnly: !callback,
    options: this.options,
    source: null,
    sourcesContent: {},
    validator: validator(this.options.compatibility),
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

  optimized = level0Optimize(tokens, context);
  optimized = OptimizationLevel.One in context.options.level ?
    level1Optimize(tokens, context) :
    tokens;
  optimized = OptimizationLevel.Two in context.options.level ?
    level2Optimize(tokens, context, true) :
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
  var finishedAt = Date.now();
  var timeSpent = finishedAt - context.stats.startedAt;

  delete context.stats.startedAt;
  context.stats.timeSpent = timeSpent;
  context.stats.efficiency = 1 - styles.length / context.stats.originalSize;
  context.stats.minifiedSize = styles.length;

  return context.stats;
}
