/**
 * Clean-css - https://github.com/jakubpawlowicz/clean-css
 * Released under the terms of MIT license
 *
 * Copyright (C) 2014 JakubPawlowicz.com
 */

var ImportInliner = require('./imports/inliner');
var UrlRebase = require('./images/url-rebase');
var SelectorsOptimizer = require('./selectors/optimizer');

var CommentsProcessor = require('./text/comments-processor');
var ExpressionsProcessor = require('./text/expressions-processor');
var FreeTextProcessor = require('./text/free-text-processor');
var UrlsProcessor = require('./text/urls-processor');

var Compatibility = require('./utils/compatibility');

var CleanCSS = module.exports = function CleanCSS(options) {
  options = options || {};

  this.options = {
    advanced: options.advanced === undefined ? true : false,
    aggressiveMerging: undefined === options.aggressiveMerging ? true : false,
    benchmark: options.benchmark,
    compatibility: new Compatibility(options.compatibility).toOptions(),
    debug: options.debug,
    inliner: options.inliner,
    keepBreaks: options.keepBreaks || false,
    keepSpecialComments: 'keepSpecialComments' in options ? options.keepSpecialComments : '*',
    processImport: undefined === options.processImport ? true : false,
    rebase: undefined === options.rebase ? true : false,
    relativeTo: options.relativeTo,
    root: options.root,
    roundingPrecision: options.roundingPrecision,
    target: options.target
  };

  this.stats = {};
  this.context = {
    errors: [],
    warnings: [],
    debug: options.debug
  };
  this.errors = this.context.errors;
  this.warnings = this.context.warnings;
};

CleanCSS.prototype.minify = function(data, callback) {
  var options = this.options;
  var self = this;

  if (Buffer.isBuffer(data))
    data = data.toString();

  if (options.processImport || data.indexOf('@shallow') > 0) {
    // inline all imports
    var runner = callback ?
      process.nextTick :
      function (callback) { return callback(); };

    return runner(function () {
      return new ImportInliner(self.context, options.inliner).process(data, {
        localOnly: !callback,
        root: options.root || process.cwd(),
        relativeTo: options.relativeTo,
        whenDone: runMinifier(callback, self)
      });
    });
  } else {
    return runMinifier(callback, self)(data);
  }
};

function runMinifier(callback, self) {
  return function (data) {
    data = self.options.debug ?
      minifyWithDebug(self, data) :
      minify.call(self, data);

    return callback ?
      callback.call(self, self.context.errors.length > 0 ? self.context.errors : null, data) :
      data;
  };
}

function minifyWithDebug(self, data) {
  var startedAt = process.hrtime();
  self.stats.originalSize = data.length;

  data = minify.call(self, data);

  var elapsed = process.hrtime(startedAt);
  self.stats.timeSpent = ~~(elapsed[0] * 1e3 + elapsed[1] / 1e6);
  self.stats.efficiency = 1 - data.length / self.stats.originalSize;
  self.stats.minifiedSize = data.length;

  return data;
}

function benchmark(runner) {
  return function (processor, action) {
    var name =  processor.constructor.name + '#' + action;
    var start = process.hrtime();
    runner(processor, action);
    var itTook = process.hrtime(start);
    console.log('%d ms: ' + name, 1000 * itTook[0] + itTook[1] / 1000000);
  };
}

function minify(data) {
  var options = this.options;
  var context = this.context;

  var commentsProcessor = new CommentsProcessor(options.keepSpecialComments, options.keepBreaks);
  var expressionsProcessor = new ExpressionsProcessor();
  var freeTextProcessor = new FreeTextProcessor();
  var urlsProcessor = new UrlsProcessor();

  var urlRebase = new UrlRebase(options, context);
  var selectorsOptimizer = new SelectorsOptimizer(options, context);

  var run = function (processor, action, enabled) {
    if (enabled === false)
      return;

    data = processor[action](data);
  };

  if (options.benchmark)
    run = benchmark(run);

  run(commentsProcessor, 'escape');
  run(expressionsProcessor, 'escape');
  run(urlsProcessor, 'escape');
  run(freeTextProcessor, 'escape');
  run(selectorsOptimizer, 'process');
  run(freeTextProcessor, 'restore');
  run(urlsProcessor, 'restore');
  run(urlRebase, 'process', options.rebase);
  run(expressionsProcessor, 'restore');
  run(commentsProcessor, 'restore');

  return data;
}
