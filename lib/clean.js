/**
 * Clean-css - https://github.com/jakubpawlowicz/clean-css
 * Released under the terms of MIT license
 *
 * Copyright (C) 2014 JakubPawlowicz.com
 */

var ImportInliner = require('./imports/inliner');
var UrlRebase = require('./images/url-rebase');

var CommentsProcessor = require('./text/comments-processor');
var ExpressionsProcessor = require('./text/expressions-processor');
var FreeTextProcessor = require('./text/free-text-processor');
var UrlsProcessor = require('./text/urls-processor');

var SelectorsOptimizer = require('./selectors/optimizer');

var CleanCSS = module.exports = function CleanCSS(options) {
  options = options || {};

  options.keepBreaks = options.keepBreaks || false;

  //active by default
  if (undefined === options.processImport)
    options.processImport = true;

  this.options = options;
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

  if (Buffer.isBuffer(data))
    data = data.toString();

  if (options.processImport || data.indexOf('@shallow') > 0) {
    // inline all imports
    var self = this;
    var runner = callback ?
      process.nextTick :
      function(callback) { return callback(); };

    return runner(function() {
      return new ImportInliner(self.context, options.inliner).process(data, {
        localOnly: !callback,
        root: options.root || process.cwd(),
        relativeTo: options.relativeTo,
        whenDone: function(data) {
          return minify.call(self, data, callback);
        }
      });
    });
  } else {
    return minify.call(this, data, callback);
  }
};

function minify(data, callback) {
  var startedAt;
  var stats = this.stats;
  var options = this.options;
  var context = this.context;

  var commentsProcessor = new CommentsProcessor('keepSpecialComments' in options ? options.keepSpecialComments : '*', options.keepBreaks);
  var expressionsProcessor = new ExpressionsProcessor();
  var freeTextProcessor = new FreeTextProcessor();
  var urlsProcessor = new UrlsProcessor();

  var replace = function() {
    if (typeof arguments[0] == 'function')
      arguments[0]();
    else
      data = data.replace.apply(data, arguments);
  };

  // replace function
  if (options.benchmark) {
    var originalReplace = replace;
    replace = function(pattern, replacement) {
      var name = typeof pattern == 'function' ?
        /function (\w+)\(/.exec(pattern.toString())[1] :
        pattern;

      var start = process.hrtime();
      originalReplace(pattern, replacement);

      var itTook = process.hrtime(start);
      console.log('%d ms: ' + name, 1000 * itTook[0] + itTook[1] / 1000000);
    };
  }

  if (options.debug) {
    startedAt = process.hrtime();
    stats.originalSize = data.length;
  }

  replace(function escapeComments() {
    data = commentsProcessor.escape(data);
  });

  replace(function escapeExpressions() {
    data = expressionsProcessor.escape(data);
  });

  replace(function escapeFreeText() {
    data = freeTextProcessor.escape(data);
  });

  replace(function escapeUrls() {
    data = urlsProcessor.escape(data);
  });

  replace(function restoreUrls() {
    data = urlsProcessor.restore(data);
  });

  replace(function rebaseUrls() {
    data = options.noRebase ? data : new UrlRebase(options, context).process(data);
  });

  replace(function restoreFreeText() {
    data = freeTextProcessor.restore(data);
  });

  replace(function restoreComments() {
    data = commentsProcessor.restore(data);
  });

  replace(function restoreExpressions() {
    data = expressionsProcessor.restore(data);
  });

  if (options.debug) {
    var elapsed = process.hrtime(startedAt);
    stats.timeSpent = ~~(elapsed[0] * 1e3 + elapsed[1] / 1e6);
    stats.efficiency = 1 - data.length / stats.originalSize;
    stats.minifiedSize = data.length;
  }

  return callback ?
    callback.call(this, this.context.errors.length > 0 ? this.context.errors : null, data) :
    data;
};
