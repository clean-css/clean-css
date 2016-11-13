/**
 * Clean-css - https://github.com/jakubpawlowicz/clean-css
 * Released under the terms of MIT license
 *
 * Copyright (C) 2016 JakubPawlowicz.com
 */

var fs = require('fs');
var path = require('path');
var url = require('url');

var compatibility = require('./utils/compatibility');
var Validator = require('./properties/validator');
var override = require('./utils/override');
var DEFAULT_TIMEOUT = 5000;

var readSources = require('./utils/read-sources');
var basicOptimize = require('./optimizer/basic');
var advancedOptimize = require('./optimizer/advanced');
var simpleStringify = require('./stringifier/simple');
var sourceMapStringify = require('./stringifier/source-maps');

var CleanCSS = module.exports = function CleanCSS(options) {
  options = options || {};

  this.options = {
    advanced: undefined === options.advanced ? true : !!options.advanced,
    aggressiveMerging: undefined === options.aggressiveMerging ? true : !!options.aggressiveMerging,
    benchmark: options.benchmark,
    compatibility: compatibility(options.compatibility),
    debug: options.debug,
    explicitRoot: !!options.root,
    explicitTarget: !!options.target,
    inliner: options.inliner || {},
    keepBreaks: options.keepBreaks || false,
    keepSpecialComments: 'keepSpecialComments' in options ? options.keepSpecialComments : '*',
    mediaMerging: undefined === options.mediaMerging ? true : !!options.mediaMerging,
    processImport: undefined === options.processImport ? true : !!options.processImport,
    processImportFrom: importOptionsFrom(options.processImportFrom),
    rebase: undefined === options.rebase ? true : !!options.rebase,
    relativeTo: options.relativeTo,
    restructuring: undefined === options.restructuring ? true : !!options.restructuring,
    root: options.root || process.cwd(),
    roundingPrecision: options.roundingPrecision,
    semanticMerging: undefined === options.semanticMerging ? false : !!options.semanticMerging,
    shorthandCompacting: undefined === options.shorthandCompacting ? true : !!options.shorthandCompacting,
    sourceMap: options.sourceMap,
    sourceMapInlineSources: !!options.sourceMapInlineSources,
    target: !options.target || missingDirectory(options.target) || presentDirectory(options.target) ? options.target : path.dirname(options.target)
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

function missingDirectory(filepath) {
  return !fs.existsSync(filepath) && !/\.css$/.test(filepath);
}

function presentDirectory(filepath) {
  return fs.existsSync(filepath) && fs.statSync(filepath).isDirectory();
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
    stats: {},
    errors: [],
    warnings: [],
    options: this.options,
    localOnly: !callback,
    validator: new Validator(this.options.compatibility)
  };

  return runner(context.localOnly)(function () {
    return readSources(input, context, function (tokens) {
      var stringify = context.options.sourceMap ?
        sourceMapStringify :
        simpleStringify;

      var optimizedTokens = optimize(tokens, context);
      var optimizedStyles = stringify(optimizedTokens, context);
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
  output.stats = context.stats;
  output.errors = context.errors;
  output.warnings = context.warnings;
  return output;
}

// function minifyWithDebug(context, data) {
//   var startedAt = process.hrtime();
//   context.stats.originalSize = context.sourceTracker.removeAll(data).length;

//   data = minify(context, data);

//   var elapsed = process.hrtime(startedAt);
//   context.stats.timeSpent = ~~(elapsed[0] * 1e3 + elapsed[1] / 1e6);
//   context.stats.efficiency = 1 - data.styles.length / context.stats.originalSize;
//   context.stats.minifiedSize = data.styles.length;

//   return data;
// }

// function minify(context, data) {
  // var options = context.options;
  // var stringify = options.sourceMap ?
  //   sourceMapStringify :
  //   simpleStringify;

  // var tokens = tokenize(data, context);
  // var allTokens = inline()
  // var optimizedTokens = optimize(tokens, context);
  // var output = stringify(optimizedTokens, context);

  // return output;
// }
