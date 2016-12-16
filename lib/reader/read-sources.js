var fs = require('fs');
var path = require('path');

var applySourceMaps = require('./apply-source-maps');
var extractImportUrlAndMedia = require('./extract-import-url-and-media');
var isAllowedResource = require('./is-allowed-resource');
var loadOriginalSources = require('./load-original-sources');
var loadRemoteResource = require('./load-remote-resource');
var rebase = require('./rebase');
var rebaseLocalMap = require('./rebase-local-map');
var rebaseRemoteMap = require('./rebase-remote-map');
var restoreImport = require('./restore-import');

var tokenize = require('../tokenizer/tokenize');
var Token = require('../tokenizer/token');
var isAbsoluteResource = require('../utils/is-absolute-resource');
var isImport = require('../utils/is-import');
var isRemoteResource = require('../utils/is-remote-resource');

var UNKNOWN_URI = 'uri:unknown';

function readSources(input, context, callback) {
  return doReadSources(input, context, function (tokens) {
    return applySourceMaps(tokens, context, function () {
      return context.options.sourceMapInlineSources ?
        loadOriginalSources(context, function () { return callback(tokens); }) :
        callback(tokens);
    });
  });
}

function doReadSources(input, context, callback) {
  if (typeof input == 'string') {
    return fromString(input, context, {}, callback);
  } else if (Buffer.isBuffer(input)) {
    return fromString(input.toString(), context, {}, callback);
  } else if (Array.isArray(input)) {
    return fromArray(input, context, {}, callback);
  } else if (typeof input == 'object') {
    return fromHash(input, context, {}, callback);
  }
}

function fromString(input, context, parentInlinerContext, callback) {
  var inputAsHash = {};

  inputAsHash[UNKNOWN_URI] = {
    styles: input,
    sourceMap: (typeof context.options.sourceMap === 'string') ? context.options.sourceMap : null
  };

  return fromHash(inputAsHash, context, parentInlinerContext, callback);
}

function fromArray(input, context, parentInlinerContext, callback) {
  var currentPath = path.resolve('');
  var inputAsHash = input.reduce(function (accumulator, uri) {
    var absoluteUri = isAbsoluteResource(uri) || isRemoteResource(uri) ?
      uri :
      path.resolve(uri);
    var relativeToCurrentPath;

    if (isRemoteResource(uri)) {
      accumulator[uri] = {
        styles: restoreImport(uri, '') + ';'
      };
    } else if (!fs.existsSync(absoluteUri) || !fs.statSync(absoluteUri).isFile()) {
      context.errors.push('Ignoring "' + absoluteUri + '" as resource is missing.');
    } else {
      relativeToCurrentPath = path.relative(currentPath, absoluteUri);
      accumulator[relativeToCurrentPath] = {
        styles: fs.readFileSync(absoluteUri, 'utf-8')
      };
    }

    return accumulator;
  }, {});

  return fromHash(inputAsHash, context, parentInlinerContext, callback);
}

function fromHash(input, context, parentInlinerContext, callback) {
  var tokens = [];
  var newTokens = [];
  var uri;
  var source;
  var parsedMap;
  var rebasedMap;
  var rebaseConfig;

  for (uri in input) {
    source = input[uri];

    if (source.sourceMap) {
      parsedMap = JSON.parse(source.sourceMap);
      rebasedMap = isRemoteResource(uri) ?
        rebaseRemoteMap(parsedMap, uri) :
        rebaseLocalMap(parsedMap, uri, context.options.rebaseTo);
      context.inputSourceMapTracker.track(uri, rebasedMap);
    }

    context.source = uri !== UNKNOWN_URI ? uri : undefined;
    context.sourcesContent[context.source] = source.styles;

    rebaseConfig = {};

    if (uri == UNKNOWN_URI) {
      rebaseConfig.fromBase = path.resolve('');
      rebaseConfig.toBase = context.options.rebaseTo;
    } else if (isRemoteResource(uri)) {
      rebaseConfig.fromBase = uri;
      rebaseConfig.toBase = uri;
    } else if (isAbsoluteResource(uri)) {
      rebaseConfig.fromBase = path.dirname(uri);
      rebaseConfig.toBase = context.options.rebaseTo;
    } else {
      rebaseConfig.fromBase = path.dirname(path.resolve(uri));
      rebaseConfig.toBase = context.options.rebaseTo;
    }

    newTokens = tokenize(source.styles, context);
    newTokens = rebase(newTokens, context.options.rebase, context.validator, rebaseConfig);

    tokens = tokens.concat(newTokens);

    context.stats.originalSize += source.styles.length;
  }

  return context.options.processImport ?
    inlineImports(tokens, context, parentInlinerContext, callback) :
    callback(tokens);
}

function inlineImports(tokens, externalContext, parentInlinerContext, callback) {
  var inlinerContext = {
    afterContent: false,
    callback: callback,
    errors: externalContext.errors,
    externalContext: externalContext,
    inlinedStylesheets: parentInlinerContext.inlinedStylesheets || externalContext.inlinedStylesheets,
    inlinerOptions: externalContext.options.inliner,
    isRemote: parentInlinerContext.isRemote || false,
    localOnly: externalContext.localOnly,
    outputTokens: [],
    processImportFrom: externalContext.options.processImportFrom,
    rebaseTo: externalContext.options.rebaseTo,
    sourceTokens: tokens,
    warnings: externalContext.warnings
  };

  return doInlineImports(inlinerContext);
}

function doInlineImports(inlinerContext) {
  var token;
  var i, l;

  for (i = 0, l = inlinerContext.sourceTokens.length; i < l; i++) {
    token = inlinerContext.sourceTokens[i];

    if (token[0] == Token.AT_RULE && isImport(token[1])) {
      inlinerContext.sourceTokens.splice(0, i);
      return inlineStylesheet(token, inlinerContext);
    } else if (token[0] == Token.AT_RULE || token[0] == Token.COMMENT) {
      inlinerContext.outputTokens.push(token);
    } else {
      inlinerContext.outputTokens.push(token);
      inlinerContext.afterContent = true;
    }
  }

  inlinerContext.sourceTokens = [];
  return inlinerContext.callback(inlinerContext.outputTokens);
}

function inlineStylesheet(token, inlinerContext) {
  var uriAndMediaQuery = extractImportUrlAndMedia(token[1]);
  var uri = uriAndMediaQuery[0];
  var mediaQuery = uriAndMediaQuery[1];
  var metadata = token[2];

  return isRemoteResource(uri) ?
    inlineRemoteStylesheet(uri, mediaQuery, metadata, inlinerContext) :
    inlineLocalStylesheet(uri, mediaQuery, metadata, inlinerContext);
}

function inlineRemoteStylesheet(uri, mediaQuery, metadata, inlinerContext) {
  var isAllowed = isAllowedResource(uri, true, inlinerContext.processImportFrom);
  var originalUri = uri;

  if (inlinerContext.inlinedStylesheets.indexOf(uri) > -1) {
    inlinerContext.warnings.push('Ignoring remote @import of "' + uri + '" as it has already been imported.');
    inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);
    return doInlineImports(inlinerContext);
  } else if (inlinerContext.localOnly && inlinerContext.afterContent) {
    inlinerContext.warnings.push('Ignoring remote @import of "' + uri + '" as no callback given and after other content.');
    inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);
    return doInlineImports(inlinerContext);
  } else if (inlinerContext.localOnly) {
    inlinerContext.warnings.push('Skipping remote @import of "' + uri + '" as no callback given.');
    inlinerContext.outputTokens = inlinerContext.outputTokens.concat(inlinerContext.sourceTokens.slice(0, 1));
    inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);
    return doInlineImports(inlinerContext);
  } else if (!isAllowed && inlinerContext.afterContent) {
    inlinerContext.warnings.push('Ignoring remote @import of "' + uri + '" as resource is not allowed and after other content.');
    inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);
    return doInlineImports(inlinerContext);
  } else if (!isAllowed) {
    inlinerContext.warnings.push('Skipping remote @import of "' + uri + '" as resource is not allowed.');
    inlinerContext.outputTokens = inlinerContext.outputTokens.concat(inlinerContext.sourceTokens.slice(0, 1));
    inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);
    return doInlineImports(inlinerContext);
  }

  inlinerContext.inlinedStylesheets.push(uri);

  loadRemoteResource(uri, inlinerContext.inlinerOptions, function (error, importedStyles) {
    var sourceHash = {};

    if (error) {
      inlinerContext.errors.push('Broken @import declaration of "' + uri + '" - ' + error);

      return process.nextTick(function () {
        inlinerContext.outputTokens = inlinerContext.outputTokens.concat(inlinerContext.sourceTokens.slice(0, 1));
        inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);
        doInlineImports(inlinerContext);
      });
    }

    sourceHash[originalUri] = {
      styles: importedStyles
    };

    inlinerContext.isRemote = true;
    fromHash(sourceHash, inlinerContext.externalContext, inlinerContext, function (importedTokens) {
      importedTokens = wrapInMedia(importedTokens, mediaQuery, metadata);

      inlinerContext.outputTokens = inlinerContext.outputTokens.concat(importedTokens);
      inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);

      doInlineImports(inlinerContext);
    });
  });
}

function inlineLocalStylesheet(uri, mediaQuery, metadata, inlinerContext) {
  var currentPath = path.resolve('');
  var absoluteUri = isAbsoluteResource(uri) ?
    path.resolve(currentPath, uri.substring(1)) :
    path.resolve(inlinerContext.rebaseTo, uri);
  var relativeToCurrentPath = path.relative(currentPath, absoluteUri);
  var importedStyles;
  var importedTokens;
  var isAllowed = isAllowedResource(uri, false, inlinerContext.processImportFrom);
  var sourceHash = {};

  if (inlinerContext.inlinedStylesheets.indexOf(absoluteUri) > -1) {
    inlinerContext.warnings.push('Ignoring local @import of "' + uri + '" as it has already been imported.');
  } else if (!fs.existsSync(absoluteUri) || !fs.statSync(absoluteUri).isFile()) {
    inlinerContext.errors.push('Ignoring local @import of "' + uri + '" as resource is missing.');
  } else if (!isAllowed && inlinerContext.afterContent) {
    inlinerContext.warnings.push('Ignoring local @import of "' + uri + '" as resource is not allowed and after other content.');
  } else if (inlinerContext.afterContent) {
    inlinerContext.warnings.push('Ignoring local @import of "' + uri + '" as after other content.');
  } else if (!isAllowed) {
    inlinerContext.warnings.push('Skipping local @import of "' + uri + '" as resource is not allowed.');
    inlinerContext.outputTokens = inlinerContext.outputTokens.concat(inlinerContext.sourceTokens.slice(0, 1));
  } else {
    importedStyles = fs.readFileSync(absoluteUri, 'utf-8');
    inlinerContext.inlinedStylesheets.push(absoluteUri);

    sourceHash[relativeToCurrentPath] = {
      styles: importedStyles
    };
    importedTokens = fromHash(sourceHash, inlinerContext.externalContext, inlinerContext, function (tokens) { return tokens; });
    importedTokens = wrapInMedia(importedTokens, mediaQuery, metadata);

    inlinerContext.outputTokens = inlinerContext.outputTokens.concat(importedTokens);
  }

  inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);

  return doInlineImports(inlinerContext);
}

function wrapInMedia(tokens, mediaQuery, metadata) {
  if (mediaQuery) {
    return [[Token.BLOCK, [[Token.BLOCK_SCOPE, '@media ' + mediaQuery, metadata]], tokens]];
  } else {
    return tokens;
  }
}

module.exports = readSources;
