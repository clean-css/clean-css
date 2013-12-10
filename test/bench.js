var CleanCSS = require('../index');
var path = require('path');

var benchDir = path.join(__dirname, 'data-bench');
var cssData = require('fs').readFileSync(path.join(benchDir, 'complex.css'), 'utf8');

var start = process.hrtime();
new CleanCSS({ benchmark: true, root: benchDir }).minify(cssData, function() {
  var itTook = process.hrtime(start);
  console.log('complete minification: %d ms', 1000 * itTook[0] + itTook[1] / 1000000);
});
