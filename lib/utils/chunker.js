module.exports = function Chunker(data, chunkSize) {
// Divides `data` into chunks of `chunkSize` for faster processing
  var chunks = [];
  for (var cursor = 0, dataSize = data.length; cursor < dataSize;) {
    var nextCursor = cursor + chunkSize > dataSize ?
      dataSize - 1 :
      cursor + chunkSize;

    if (data[nextCursor] != '}')
      nextCursor = data.indexOf('}', nextCursor);
    if (nextCursor == -1)
      nextCursor = data.length - 1;

    chunks.push(data.substring(cursor, nextCursor + 1));
    cursor = nextCursor + 1;
  }

  return {
    isEmpty: function() {
      return chunks.length === 0;
    },

    next: function() {
      return chunks.shift();
    }
  };
};
