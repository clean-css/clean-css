function trimLeft(value, context) {
  var withoutContent;
  var total;
  var split = value.split('\n');
  var shift = 0;
  for (withoutContent = 0, total = split.length; withoutContent < total; withoutContent++) {
    var part = split[withoutContent];
    if (/\S/.test(part))
      break;

    shift += part.length + 1;
  }

  context.line += withoutContent;
  context.column = withoutContent > 0 ? 0 : context.column;
  context.column += /^(\s)*/.exec(split[withoutContent])[0].length;

  return value.substring(shift).trimLeft();
}

function sourceFor(originalMetadata, contextMetadata, context) {
  var source = originalMetadata.source || contextMetadata.source;

  if (source && context.resolvePath)
    return context.resolvePath(contextMetadata.source, source);

  return source;
}

var SourceMaps = {
  unknownSource: '$stdin',

  saveAndTrack: function (data, context, hasSuffix, allowNFallbacks) {
    var trimmedValue = trimLeft(data, context);

    var contextMetadata = {
      original: {
        line: context.line,
        column: context.column
      },
      source: context.source
    };
    var sourceMetadata = context.outer.inputSourceMapTracker.isTracking(contextMetadata.source) ?
      context.outer.inputSourceMapTracker.originalPositionFor(contextMetadata, trimmedValue, allowNFallbacks || 0) :
      {};

    contextMetadata.original.line = sourceMetadata.line || contextMetadata.original.line;
    contextMetadata.original.column = sourceMetadata.column || contextMetadata.original.column;
    contextMetadata.source = sourceMetadata.sourceResolved ?
      sourceMetadata.source :
      sourceFor(sourceMetadata, contextMetadata, context);

    this.track(trimmedValue, context);

    if (hasSuffix)
      context.column++;

    return contextMetadata;
  },

  suffix: function (context) {
    context.column++;
  },

  track: function (data, context) {
    var parts = data.split('\n');

    for (var i = 0, l = parts.length; i < l; i++) {
      var part = parts[i];
      var cursor = 0;

      if (i > 0) {
        context.line++;
        context.column = 0;
      }

      while (true) {
        var next = part.indexOf('__ESCAPED_', cursor);

        if (next == -1) {
          context.column += part.substring(cursor).length;
          break;
        }

        context.column += next - cursor;
        cursor += next - cursor;

        var escaped = part.substring(next, part.indexOf('__', next + 1) + 2);
        var encodedValues = escaped.substring(escaped.indexOf('(') + 1, escaped.indexOf(')')).split(',');
        context.line += ~~encodedValues[0];
        context.column = (~~encodedValues[0] === 0 ? context.column : 0) + ~~encodedValues[1];
        cursor += escaped.length;
      }
    }
  }
};

module.exports = SourceMaps;
