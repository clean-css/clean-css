function simplifyVariables(tokens) {
    var usedVariables = {};

    for (var i = tokens.length - 1; i >= 0; i--) {
        if (tokens[i][0] === 'rule') {
            var stringifiedRule = JSON.stringify(tokens[i][1]);

            for (var j = tokens[i][2].length - 1; j >= 0 ; j--) {
                var property = tokens[i][2][j];

                if (property[0] === 'property' && property[1][0] === 'property-name') {

                    var propertyName = property[1][1];

                    if (propertyName.substring(0,2) === '--') {
                        if (usedVariables[stringifiedRule] && usedVariables[stringifiedRule][propertyName]) {
                            tokens[i][2].splice(j, 1);
                        } else {

                            if (!usedVariables[stringifiedRule]) {
                                usedVariables[stringifiedRule] = {};
                            }

                            usedVariables[stringifiedRule][propertyName] = property;
                        }
                    }
                }
            }
        }
    }
}

module.exports = simplifyVariables;