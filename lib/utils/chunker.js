module.exports = function Chunker(data, breakString, chunkSize) {
// Divides `data` into chunks of `chunkSize` for faster processing
  var chunks = [];
  for (var cursor = 0, dataSize = data.length; cursor < dataSize;) {
    var nextCursor = cursor + chunkSize > dataSize ?
      dataSize - 1 :
      cursor + chunkSize;

    if (data[nextCursor] != breakString)
      nextCursor = data.indexOf(breakString, nextCursor);
    if (nextCursor == -1)
      nextCursor = data.length - 1;

    chunks.push(data.substring(cursor, nextCursor + breakString.length));
    cursor = nextCursor + breakString.length;
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
