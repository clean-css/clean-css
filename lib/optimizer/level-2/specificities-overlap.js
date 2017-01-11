var specificity = require('./specificity');

function specificitiesOverlap(selector1, selector2) {
  var specificity1;
  var specificity2;
  var i, l;
  var j, m;

  for (i = 0, l = selector1.length; i < l; i++) {
    specificity1 = specificity(selector1[i][1]);

    for (j = 0, m = selector2.length; j < m; j++) {
      specificity2 = specificity(selector2[j][1]);

      if (specificity1[0] === specificity2[0] && specificity1[1] === specificity2[1] && specificity1[2] === specificity2[2]) {
        return true;
      }
    }
  }

  return false;
}

module.exports = specificitiesOverlap;
