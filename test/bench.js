var CleanCSS = require('../index');

var input = '@import url(test/fixtures/bench/complex.css);';
var total = 0;

for (var i = 1; i <= 10; i++) {
  var start = process.hrtime();
  new CleanCSS({ benchmark: i == 10 }).minify(input);

  var itTook = process.hrtime(start);
  total += 1000 * itTook[0] + itTook[1] / 1000000;
}

console.log('Complete minification averaged over 10 runs: %d ms', total / 10);
