
var CleanCSS = require('../../lib/clean');
var css = new CleanCSS().minify(['./test/utf8-bom/utf8-bom.css']);
console.log(css);
