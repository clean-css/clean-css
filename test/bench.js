var CleanCSS = require('../index');
var path = require('path');

var benchDir = path.join(__dirname, 'data-bench');
var cssData = require('fs').readFileSync(path.join(benchDir, 'complex.css'), 'utf8');
var total = 0;

for (var i = 1; i <= 10; i++) {
  var start = process.hrtime();
  new CleanCSS({ benchmark: i == 10, root: benchDir }).minify(cssData)

  var itTook = process.hrtime(start);
  total += 1000 * itTook[0] + itTook[1] / 1000000;
}

console.log('Complete minification averaged over 10 runs: %d ms', total / 10);
