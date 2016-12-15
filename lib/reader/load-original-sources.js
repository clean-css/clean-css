var fs = require('fs');
var path = require('path');

var isAllowedResource = require('./is-allowed-resource');
var loadRemoteResource = require('./load-remote-resource');

var isRemoteResource = require('../utils/is-remote-resource');

function loadOriginalSources(context, callback) {
  var loadContext = {
    callback: callback,
    index: 0,
    inliner: context.options.inliner,
    localOnly: context.localOnly,
    processImportFrom: context.options.processImportFrom,
    rebaseTo: context.options.rebaseTo,
    sourcesContent: context.sourcesContent,
    uriToSource: uriToSourceMapping(context.inputSourceMapTracker.all()),
    warnings: context.warnings
  };

  return doLoadOriginalSources(loadContext);
}

function uriToSourceMapping(allSourceMapConsumers) {
  var mapping = {};
  var consumer;
  var uri;
  var source;
  var i, l;

  for (source in allSourceMapConsumers) {
    consumer = allSourceMapConsumers[source];

    for (i = 0, l = consumer.sources.length; i < l; i++) {
      uri = consumer.sources[i];
      source = consumer.sourceContentFor(uri, true);

      mapping[uri] = source;
    }
  }

  return mapping;
}

function doLoadOriginalSources(loadContext) {
  var uris = Object.keys(loadContext.uriToSource);
  var uri;
  var source;
  var total;

  for (total = uris.length; loadContext.index < total; loadContext.index++) {
    uri = uris[loadContext.index];
    source = loadContext.uriToSource[uri];

    if (source) {
      loadContext.sourcesContent[uri] = source;
    } else {
      return loadOriginalSource(uri, loadContext);
    }
  }

  return loadContext.callback();
}

function loadOriginalSource(uri, loadContext) {
  var content;

  if (isRemoteResource(uri)) {
    return loadOriginalSourceFromRemoteUri(uri, loadContext, function (content) {
      loadContext.index++;
      loadContext.sourcesContent[uri] = content;
      return doLoadOriginalSources(loadContext);
    });
  } else {
    content = loadOriginalSourceFromLocalUri(uri, loadContext);
    loadContext.index++;
    loadContext.sourcesContent[uri] = content;
    return doLoadOriginalSources(loadContext);
  }
}

function loadOriginalSourceFromRemoteUri(uri, loadContext, whenLoaded) {
  var isAllowed = isAllowedResource(uri, true, loadContext.processImportFrom);

  if (loadContext.localOnly) {
    loadContext.warnings.push('Cannot fetch remote resource from "' + uri + '" as no callback given.');
    return whenLoaded(null);
  } else if (!isAllowed) {
    loadContext.warnings.push('Cannot fetch "' + uri + '" as resource is not allowed.');
    return whenLoaded(null);
  }

  loadRemoteResource(uri, loadContext.inliner, function (error, content) {
    if (error) {
      loadContext.warnings.push('Missing original source at "' + uri + '" - ' + error);
    }

    whenLoaded(content);
  });
}

function loadOriginalSourceFromLocalUri(uri, loadContext) {
  var isAllowed = isAllowedResource(uri, true, loadContext.processImportFrom);
  var resolvedUri = path.resolve(loadContext.rebaseTo, uri);

  if (!fs.existsSync(resolvedUri) || !fs.statSync(resolvedUri).isFile()) {
    loadContext.warnings.push('Ignoring local source map at "' + resolvedUri + '" as resource is missing.');
    return null;
  } else if (!isAllowed) {
    loadContext.warnings.push('Cannot fetch "' + resolvedUri + '" as resource is not allowed.');
    return null;
  }

  return fs.readFileSync(resolvedUri, 'utf8');
}

module.exports = loadOriginalSources;
