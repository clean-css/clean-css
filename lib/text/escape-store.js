module.exports = function EscapeStore(placeholderRoot) {
  placeholderRoot = 'ESCAPED_' + placeholderRoot + '_CLEAN_CSS';

  var placeholderBrace = '__';
  var placeholderToData = {};
  var dataToPlaceholder = {};
  var count = 0;
  var nextPlaceholder = function(metadata) {
    return placeholderBrace + placeholderRoot + (count++) + metadata + placeholderBrace;
  };

  return {
    store: function(data, metadata) {
      var encodedMetadata = metadata ?
        '(' + metadata.join(',') + ')' :
        '';

      var placeholder = nextPlaceholder(encodedMetadata);
      placeholderToData[placeholder] = data;
      dataToPlaceholder[data] = placeholder;

      return placeholder;
    },

    nextMatch: function (data, cursor) {
      var next = {};

      next.start = data.indexOf(placeholderRoot, cursor) - placeholderBrace.length;
      next.end = data.indexOf(placeholderBrace, next.start + placeholderBrace.length) + placeholderBrace.length;
      if (next.start > -1 && next.end > -1)
        next.match = data.substring(next.start, next.end);

      return next;
    },

    restore: function(placeholder) {
      return placeholderToData[placeholder];
    }
  };
};
