module.exports = function EscapeStore(placeholderRoot) {
  placeholderRoot = 'ESCAPED_' + placeholderRoot + '_CLEAN_CSS';

  var placeholderToData = {};
  var dataToPlaceholder = {};
  var count = 0;
  var nextPlaceholder = function(metadata) {
    return '__' + placeholderRoot + (count++) + metadata + '__';
  };
  var pattern = '(__' + placeholderRoot + '\\d{1,}\\(?[^_\\)]*\\)?__)';

  return {
    placeholderPattern: pattern,

    placeholderRegExp: new RegExp(pattern, 'g'),

    store: function(data, metadata) {
      var encodedMetadata = metadata ?
        '(' + metadata.join(',') + ')' :
        '';

      var placeholder = nextPlaceholder(encodedMetadata);
      placeholderToData[placeholder] = data;
      dataToPlaceholder[data] = placeholder;

      return placeholder;
    },

    restore: function(placeholder) {
      return placeholderToData[placeholder];
    }
  };
};
