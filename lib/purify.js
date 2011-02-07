var Purify = {
  process: function(data) {
    // strip comments one by one
    for (var end = 0; end < data.length; ) {
      var start = data.indexOf('/*', end);
      if (data[start + 2] == '!') { // skip special comments: /*!...*/
        end = start + 1;
        continue;
      }
      
      end = data.indexOf('*/', start);
      if (start == -1 || end == -1) break;
      
      data = data.substring(0, start) + data.substring(end + 2);
      end = start;
    }
    
    return data
      .replace(/;\s*;/g, ';;') // whitespace between semicolons
      .replace(/;+/g, ';') // multiple semicolons
      .replace(/,[ ]+/g, ',') // comma
      .replace(/\s+/g, ' ') // whitespace
      .replace(/\{([^}]+)\}/g, function(match, contents) { // whitespace inside content
        return '{' + contents.trim().replace(/(\s*)([;:=\s])(\s*)/g, '$2') + '}';
      })
      .replace(/;}/g, '}') // trailing semicolons
      .replace(/rgb\s*\(([^\)]+)\)/g, function(match, color) { // rgb to hex colors
        var parts = color.split(',');
        var encoded = '#';
        for (var i = 0; i < 3; i++) {
          var asHex = parseInt(parts[i], 10).toString(16);
          encoded += asHex.length == 1 ? '0' + asHex : asHex;
        }
        return encoded;
      })
      .replace(/([^"'=\s])\s*#([0-9a-f]{6})/gi, function(match, prefix, color) { // long hex to short hex
        if (color[0] == color[1] && color[2] == color[3] && color[4] == color[5])
          return prefix + '#' + color[0] + color[2] + color[4];
        else
          return prefix + '#' + color;
      })
      .replace(/progid:DXImageTransform\.Microsoft\.Alpha/g, 'alpha') // IE alpha filter
      .replace(/(\s|:)0(px|em|ex|cm|mm|in|pt|pc|%)/g, '$1' + '0') // zero + unit to zero
      .replace(/none/g, '0') // none to 0
      .replace(/( 0){1,4}/g, '') // multiple zeros into one
      .replace(/([: ,])0\.(\d)+/g, '$1.$2')
      .replace(/[^\}]+{(;)*}/g, '') // empty elements
      .replace(/(.+)(@charset [^;]+;)/, '$2$1')
      .replace(/(.+)(@charset [^;]+;)/g, '$1')
      .replace(/ {/g, '{') // whitespace before definition
      .replace(/\} /g, '}') // whitespace after definition
  }
};

exports.Purify = Purify;