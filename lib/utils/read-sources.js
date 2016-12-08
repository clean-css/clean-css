var fs = require('fs');
var http = require('http');
var https = require('https');
var path = require('path');
var url = require('url');

var tokenize = require('../tokenizer/tokenize');
var Token = require('../tokenizer/token');

var rewriteUrl = require('../urls/rewrite');

var override = require('../utils/override');
var split = require('../utils/split');

var IMPORT_PREFIX_PATTERN = /^@import/i;
var BRACE_PREFIX = /^\(/;
var BRACE_SUFFIX = /\)$/;
var QUOTE_PREFIX_PATTERN = /['"]\s*/;
var QUOTE_SUFFIX_PATTERN = /\s*['"]/;
var URL_PREFIX_PATTERN = /^url\(\s*/i;
var URL_SUFFIX_PATTERN = /\s*\)/i;

var HTTP_PROTOCOL = 'http:';
var HTTP_RESOURCE_PATTERN = /^http:\/\//;
var HTTPS_RESOURCE_PATTERN = /^https:\/\//;
var NO_PROTOCOL_RESOURCE_PATTERN = /^\/\//;
var REMOTE_RESOURCE_PATTERN = /^(https?:)?\/\//;

function readSources(input, context, callback) {
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

  inputAsHash[false] = {
    styles: input
  };

  return fromHash(inputAsHash, context, parentInlinerContext, callback);
}

function fromArray(input, context, parentInlinerContext, callback) {
  var inputAsHash = input.reduce(function (accumulator, uri) {
    var absolutePath = uri[0] == '/' ?
      uri :
      path.resolve(uri);

    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
      context.errors.push('Ignoring "' + uri + '" as resource is missing.');
    } else {
      accumulator[uri] = {
        styles: fs.readFileSync(absolutePath, 'utf-8')
      };
    }

    return accumulator;
  }, {});

  return fromHash(inputAsHash, context, parentInlinerContext, callback);
}

function fromHash(input, context, parentInlinerContext, callback) {
  var tokens = [];
  var sourcePath;
  var source;
  var rebaseFrom;
  var rebaseTo;
  var rebaseConfig;

  for (sourcePath in input) {
    source = input[sourcePath];

    if (isRemote(sourcePath)) {
      rebaseFrom = sourcePath;
      rebaseTo = sourcePath;
    } else if (isAbsolute(sourcePath)) {
      rebaseFrom = path.dirname(sourcePath);
      rebaseTo = context.options.rebaseTo;
    } else {
      rebaseFrom = sourcePath ?
        path.dirname(path.resolve(sourcePath)) :
        path.resolve(sourcePath);
      rebaseTo = context.options.rebaseTo;
    }

    rebaseConfig = {
      fromBase: rebaseFrom,
      toBase: rebaseTo
    };

    tokens = tokens.concat(
      rebase(
        tokenize(source.styles, context),
        context.options.rebase,
        context.validator,
        rebaseConfig
      )
    );

    context.stats.originalSize += source.styles.length;
  }

  return context.options.processImport ?
    inlineImports(tokens, context, parentInlinerContext, callback) :
    callback(tokens);
}

function isAbsolute(uri) {
  return uri && uri[0] == '/';
}

function rebase(tokens, rebaseAll, validator, rebaseConfig) {
  return rebaseAll ?
    rebaseEverything(tokens, validator, rebaseConfig) :
    rebaseAtRules(tokens, validator, rebaseConfig);
}

function rebaseEverything(tokens, validator, rebaseConfig) {
  var token;
  var i, l;

  for (i = 0, l = tokens.length; i < l; i++) {
    token = tokens[i];

    switch (token[0]) {
      case Token.AT_RULE:
        rebaseAtRule(token, validator, rebaseConfig);
        break;
      case Token.AT_RULE_BLOCK:
        //
        break;
      case Token.BLOCK:
        rebaseEverything(token[2], validator, rebaseConfig);
        break;
      case Token.PROPERTY:
        //
        break;
      case Token.RULE:
        rebaseProperties(token[2], validator, rebaseConfig);
        break;
    }
  }

  return tokens;
}

function rebaseAtRules(tokens, validator, rebaseConfig) {
  var token;
  var i, l;

  for (i = 0, l = tokens.length; i < l; i++) {
    token = tokens[i];

    switch (token[0]) {
      case Token.AT_RULE:
        rebaseAtRule(token, validator, rebaseConfig);
        break;
    }
  }

  return tokens;
}

function rebaseAtRule(token, validator, rebaseConfig) {
  if (!IMPORT_PREFIX_PATTERN.test(token[1])) {
    return;
  }

  var uriAndMediaQuery = extractUrlAndMedia(token[1]);
  var newUrl = rewriteUrl(uriAndMediaQuery[0], rebaseConfig);
  var mediaQuery = uriAndMediaQuery[1];

  token[1] = restoreImport(newUrl, mediaQuery);
}

function restoreImport(uri, mediaQuery) {
  return ('@import ' + uri + ' ' + mediaQuery).trim();
}

function rebaseProperties(properties, validator, rebaseConfig) {
  var property;
  var value;
  var i, l;
  var j, m;

  for (i = 0, l = properties.length; i < l; i++) {
    property = properties[i];

    for (j = 2 /* 0 is Token.PROPERTY, 1 is name */, m = property.length; j < m; j++) {
      value = property[j][1];

      if (validator.isValidUrl(value)) {
        property[j][1] = rewriteUrl(value, rebaseConfig);
      }
    }
  }
}

function inlineImports(tokens, externalContext, parentInlinerContext, callback) {
  var inlinerContext = {
    afterContent: false,
    callback: callback,
    externalContext: externalContext,
    imported: parentInlinerContext.imported || [],
    isRemote: parentInlinerContext.isRemote || false,
    outputTokens: [],
    sourceTokens: tokens
  };

  return doInlineImports(inlinerContext);
}

function doInlineImports(inlinerContext) {
  var token;
  var i, l;

  for (i = 0, l = inlinerContext.sourceTokens.length; i < l; i++) {
    token = inlinerContext.sourceTokens[i];

    if (token[0] == Token.AT_RULE && IMPORT_PREFIX_PATTERN.test(token[1])) {
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
  var uriAndMediaQuery = extractUrlAndMedia(token[1]);
  var uri = uriAndMediaQuery[0];
  var mediaQuery = uriAndMediaQuery[1];

  return isRemote(uri) ?
    inlineRemoteStylesheet(uri, mediaQuery, inlinerContext) :
    inlineLocalStylesheet(uri, mediaQuery, inlinerContext);
}

function extractUrlAndMedia(atRuleValue) {
  var uri;
  var mediaQuery;
  var stripped;
  var parts;

  stripped = atRuleValue
    .replace(IMPORT_PREFIX_PATTERN, '')
    .trim()
    .replace(URL_PREFIX_PATTERN, '(')
    .replace(URL_SUFFIX_PATTERN, ')')
    .replace(QUOTE_PREFIX_PATTERN, '')
    .replace(QUOTE_SUFFIX_PATTERN, '');

  parts = split(stripped, ' ');

  uri = parts[0]
    .replace(BRACE_PREFIX, '')
    .replace(BRACE_SUFFIX, '');
  mediaQuery = parts.slice(1).join(' ');

  return [uri, mediaQuery];
}

function isRemote(uri) {
  return uri && REMOTE_RESOURCE_PATTERN.test(uri);
}

function allowedResource(uri, isRemote, rules) {
  var match;
  var allowed = true;
  var rule;
  var i;

  if (rules.length === 0) {
    return false;
  }

  if (isRemote && NO_PROTOCOL_RESOURCE_PATTERN.test(uri)) {
    uri = 'http:' + uri;
  }

  match = isRemote ?
    url.parse(uri).host :
    uri;

  for (i = 0; i < rules.length; i++) {
    rule = rules[i];

    if (rule == 'all') {
      allowed = true;
    } else if (isRemote && rule == 'local') {
      allowed = false;
    } else if (isRemote && rule == 'remote') {
      allowed = true;
    } else if (!isRemote && rule == 'remote') {
      allowed = false;
    } else if (!isRemote && rule == 'local') {
      allowed = true;
    } else if (rule[0] == '!' && rule.substring(1) === match) {
      allowed = false;
    }
  }

  return allowed;
}

function inlineRemoteStylesheet(uri, mediaQuery, inlinerContext) {
  var inliner = inlinerContext.externalContext.options.inliner;
  var errorHandled = false;
  var fetch;
  var isAllowed = allowedResource(uri, true, inlinerContext.externalContext.options.processImportFrom);
  var onError;
  var options;
  var originalUri = uri;
  var proxyProtocol = inliner.request.protocol || inliner.request.hostname;

  if (inlinerContext.imported.indexOf(uri) > -1) {
    inlinerContext.externalContext.warnings.push('Ignoring remote @import of "' + uri + '" as it has already been imported.');
    inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);
    return doInlineImports(inlinerContext);
  } else if (inlinerContext.externalContext.localOnly && inlinerContext.afterContent) {
    inlinerContext.externalContext.warnings.push('Ignoring remote @import of "' + uri + '" as no callback given and after other content.');
    inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);
    return doInlineImports(inlinerContext);
  } else if (inlinerContext.externalContext.localOnly) {
    inlinerContext.externalContext.warnings.push('Skipping remote @import of "' + uri + '" as no callback given.');
    inlinerContext.outputTokens = inlinerContext.outputTokens.concat(inlinerContext.sourceTokens.slice(0, 1));
    inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);
    return doInlineImports(inlinerContext);
  } else if (!isAllowed && inlinerContext.afterContent) {
    inlinerContext.externalContext.warnings.push('Ignoring remote @import of "' + uri + '" as resource not allowed and after other content.');
    inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);
    return doInlineImports(inlinerContext);
  } else if (!isAllowed) {
    inlinerContext.externalContext.warnings.push('Skipping remote @import of "' + uri + '" as resource not allowed.');
    inlinerContext.outputTokens = inlinerContext.outputTokens.concat(inlinerContext.sourceTokens.slice(0, 1));
    inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);
    return doInlineImports(inlinerContext);
  }

  if (NO_PROTOCOL_RESOURCE_PATTERN.test(uri)) {
    uri = 'http:' + uri;
  }

  fetch = (proxyProtocol && !HTTPS_RESOURCE_PATTERN.test(proxyProtocol)) || HTTP_RESOURCE_PATTERN.test(uri) ?
    http.get :
    https.get;

  options = override(url.parse(uri), inliner.request);
  if (inliner.request.hostname !== undefined) {
    // overwrite as we always expect a http proxy currently
    options.protocol = inliner.request.protocol || HTTP_PROTOCOL;
    options.path = options.href;
  }

  onError = function(message) {
    if (errorHandled)
      return;

    errorHandled = true;
    inlinerContext.externalContext.errors.push('Broken @import declaration of "' + uri + '" - ' + message);

    process.nextTick(function () {
      inlinerContext.outputTokens = inlinerContext.outputTokens.concat(inlinerContext.sourceTokens.slice(0, 1));
      inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);
      doInlineImports(inlinerContext);
    });
  };

  inlinerContext.imported.push(uri);

  fetch(options, function (res) {
    var chunks = [];
    var movedUri;

    if (res.statusCode < 200 || res.statusCode > 399) {
      return onError('error ' + res.statusCode);
    } else if (res.statusCode > 299) {
      movedUri = url.resolve(uri, res.headers.location);
      return inlineRemoteStylesheet(movedUri, mediaQuery, inlinerContext);
    }

    res.on('data', function (chunk) {
      chunks.push(chunk.toString());
    });
    res.on('end', function () {
      var importedStyles;
      var sourceHash = {};

      importedStyles = chunks.join('');
      sourceHash[originalUri] = {
        styles: importedStyles
      };

      inlinerContext.isRemote = true;
      fromHash(sourceHash, inlinerContext.externalContext, inlinerContext, function (importedTokens) {
        importedTokens = wrapInMedia(importedTokens, mediaQuery);

        inlinerContext.outputTokens = inlinerContext.outputTokens.concat(importedTokens);
        inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);

        doInlineImports(inlinerContext);
      });
    });

  })
  .on('error', function (res) {
    onError(res.message);
  })
  .on('timeout', function () {
    onError('timeout');
  })
  .setTimeout(inliner.timeout);
}

function inlineLocalStylesheet(uri, mediaQuery, inlinerContext) {
  var resolvedPath = uri[0] == '/' ?
    path.resolve(path.resolve(''), uri.substring(1)) :
    path.resolve(inlinerContext.externalContext.options.rebaseTo, uri);
  var importedStyles;
  var importedTokens;
  var isAllowed = allowedResource(uri, false, inlinerContext.externalContext.options.processImportFrom);
  var sourceHash = {};

  if (inlinerContext.imported.indexOf(resolvedPath) > -1) {
    inlinerContext.externalContext.warnings.push('Ignoring local @import of "' + uri + '" as it has already beeb imported.');
  } else if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
    inlinerContext.externalContext.errors.push('Ignoring local @import of "' + uri + '" as resource is missing.');
  } else if (!isAllowed && inlinerContext.afterContent) {
    inlinerContext.externalContext.warnings.push('Ignoring local @import of "' + uri + '" as resource not allowed and after other content.');
  } else if (inlinerContext.afterContent) {
    inlinerContext.externalContext.warnings.push('Ignoring local @import of "' + uri + '" as after other content.');
  } else if (!isAllowed) {
    inlinerContext.externalContext.warnings.push('Skipping local @import of "' + uri + '" as resource not allowed.');
    inlinerContext.outputTokens = inlinerContext.outputTokens.concat(inlinerContext.sourceTokens.slice(0, 1));
  } else {
    importedStyles = fs.readFileSync(resolvedPath, 'utf-8');
    inlinerContext.imported.push(resolvedPath);

    sourceHash[resolvedPath] = {
      styles: importedStyles
    };
    importedTokens = fromHash(sourceHash, inlinerContext.externalContext, inlinerContext, function (tokens) { return tokens; });
    importedTokens = wrapInMedia(importedTokens, mediaQuery);

    inlinerContext.outputTokens = inlinerContext.outputTokens.concat(importedTokens);
  }

  inlinerContext.sourceTokens = inlinerContext.sourceTokens.slice(1);

  return doInlineImports(inlinerContext);
}

function wrapInMedia(tokens, mediaQuery) {
  if (mediaQuery) {
    return [[Token.BLOCK, [['@media ' + mediaQuery]], tokens]];
  } else {
    return tokens;
  }
}

module.exports = readSources;
