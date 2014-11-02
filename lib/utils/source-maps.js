var SourceMaps = {
  saveAndTrack: function (data, context, hasSuffix) {
    var metadata = {
      line: context.line,
      column: context.column,
      source: context.source
    };

    this.track(data, context);

    if (hasSuffix)
      context.column++;

    return metadata;
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
        context.column = 1;
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
        context.column = (~~encodedValues[0] === 0 ? context.column : 1) + ~~encodedValues[1];
        cursor += escaped.length;
      }
    }
  }
};

module.exports = SourceMaps;
