module.exports = function RGBToHex(data) {
  return {
    process: function() {
      return data.replace(/rgb\((\d+),(\d+),(\d+)\)/g, function(match, red, green, blue) {
        return '#' + ("00000" + (red << 16 | green << 8 | blue).toString(16)).slice(-6);
      });
    }
  };
};
