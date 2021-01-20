var SUPPORTED_COMPACT_BLOCK_MATCHER = /^@media\W/;
var SUPPORTED_QUOTE_REMOVAL_MATCHER = /^@(?:keyframes|-moz-keyframes|-o-keyframes|-webkit-keyframes)\W/;

function tidyBlock(values, spaceAfterClosingBrace) {
  var withoutSpaceAfterClosingBrace;
  var withoutQuotes;
  var i;

  for (i = values.length - 1; i >= 0; i--) {
    withoutSpaceAfterClosingBrace = !spaceAfterClosingBrace && SUPPORTED_COMPACT_BLOCK_MATCHER.test(values[i][1]);
    withoutQuotes = SUPPORTED_QUOTE_REMOVAL_MATCHER.test(values[i][1]);

    values[i][1] = values[i][1]
      .replace(/\n|\r\n/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/(,|:|\() /g, '$1')
      .replace(/ \)/g, ')')
      .replace(withoutQuotes ? /'([a-zA-Z][a-zA-Z\d\-_]+)'/ : null, '$1')
      .replace(withoutQuotes ? /"([a-zA-Z][a-zA-Z\d\-_]+)"/ : null, '$1')
      .replace(withoutSpaceAfterClosingBrace ? /\) /g : null, ')');
  }

  return values;
}

module.exports = tidyBlock;
