var path = require('path');
var UrlRewriter = require('../images/url-rewriter');

var REMOTE_RESOURCE = /^(https?:)?\/\//;

function SourceReader(context, data) {
  this.outerContext = context;
  this.data = data;
}

SourceReader.prototype.toString = function () {
  if (typeof this.data == 'string')
    return this.data;
  if (Buffer.isBuffer(this.data))
    return this.data.toString();
  if (Array.isArray(this.data))
    return fromArray(this.outerContext, this.data);

  return fromHash(this.outerContext, this.data);
};

function fromArray(outerContext, sources) {
  return sources
    .map(function (source) {
      return outerContext.options.processImport === false ?
        source + '@shallow' :
        source;
    })
    .map(function (source) {
      return !outerContext.options.relativeTo || /^https?:\/\//.test(source) ?
        source :
        path.relative(outerContext.options.relativeTo, source);
    })
    .map(function (source) { return '@import url(' + source + ');'; })
    .join('');
}

function fromHash(outerContext, sources) {
  var data = [];
  var toBase = path.resolve(outerContext.options.target || outerContext.options.root);

  for (var source in sources) {
    var styles = sources[source].styles;
    var inputSourceMap = sources[source].sourceMap;
    var isRemote = REMOTE_RESOURCE.test(source);
    var absoluteSource = isRemote ? source : path.resolve(source);
    var absolutePath = path.dirname(absoluteSource);

    var rewriter = new UrlRewriter({
      absolute: outerContext.options.explicitRoot,
      relative: !outerContext.options.explicitRoot,
      imports: true,
      urls: outerContext.options.rebase,
      fromBase: absolutePath,
      toBase: isRemote ? absolutePath : toBase
    }, this.outerContext);
    styles = rewriter.process(styles);

    if (outerContext.options.sourceMap && inputSourceMap) {
      styles = outerContext.sourceTracker.store(source, styles);
      // here we assume source map lies in the same directory as `source` does
      outerContext.inputSourceMapTracker.trackLoaded(source, source, inputSourceMap);
    }

    data.push(styles);
  }

  return data.join('');
}

module.exports = SourceReader;
