var CleanCSS = require('../index');

var input = '@import url(test/fixtures/bench/complex.css);';
var total;
var level;
var i;
var start;
var itTook;

for (level = 0; level < 3; level ++) {
  total = 0;

  for (i = 1; i <= 10; i++) {
    start = process.hrtime();
    new CleanCSS({ level: level }).minify(input);

    itTook = process.hrtime(start);
    total += 1000 * itTook[0] + itTook[1] / 1000000;
  }

  console.log('Average over 10 runs on level %d: %d ms', level, total / 10);
}
