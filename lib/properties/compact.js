
// This module will compact a CSS property list when feasible
module.exports = (function () {
    // Merge functions
    var canMerge = {
        always: function (t1, t2) {
            return true;
        },
        sameValue: function (t1, t2) {
            return t1.value === t2.value;
        }
        // TODO: add functions for checking color values and such
    };
    
    // Properties to process
    // Extend this object in order to add support for more
    var processable = {
        "margin": {
            alwaysMergeRedefined: true,
            components: [
                "margin-top",
                "margin-right",
                "margin-bottom",
                "margin-left"
            ],
            canMerge: canMerge.always
        },
        "padding": {
            alwaysMergeRedefined: true,
            components: [
                "padding-top",
                "padding-right",
                "padding-bottom",
                "padding-left"
            ],
            canMerge: canMerge.always
        },
        "background": {
            components: [
                "background-color",
                "background-image",
                "background-repeat",
                "background-position",
                "background-attachment"
            ]
        }
        // TODO: add more
    };
    var important = "!important";
    
    // Breaks up the CSS properties so that they can be handled more easily
    var tokenize = function (input) {
        // Split the input by semicolons and parse the parts
        var tokens = input.split(';').map(function(fullProp) {
            // Find first colon        
            var colonPos = fullProp.indexOf(':');
            
            if (colonPos < 0) {
                // This property doesn't have a colon, it's invalid. Let's keep it intact anyway.
                return {
                    value: fullProp
                };
            }
            
            // Parse parts of the property
            var prop = fullProp.substr(0, colonPos).trim();
            var value = fullProp.substr(colonPos + 1).trim();
            var isImportant = false;
            var importantPos = value.indexOf(important);
            
            // Check if the property is important
            if (importantPos === value.length - important.length) {
                value = value.substr(0, importantPos).trim();
                isImportant = true;
            }
            
            // Return result
            return {
                prop: prop,
                value: value,
                isImportant: isImportant
            };
        });
        
        return tokens;
    };
    
    // Transforms tokens back into CSS properties
    var detokenize = function(tokens) {
        var str = tokens.map(function(token) {
            var result = "";
            
            // NOTE: malformed tokens will not have a "prop" property
            if (token.prop) {
                result += token.prop + ":";
            }
            if (token.value) {
                result += token.value;
            }
            if (token.isImportant) {
                result += " " + important;
            }
            
            return result;
        }).join(';');
        
        return str;
    };
    
    // Merges same properties
    // https://github.com/GoalSmashers/clean-css/issues/173
    // https://github.com/GoalSmashers/clean-css/issues/168
    var mergeSame = function(tokens) {
        var result = [];
    
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            // Skip malformed tokens that have no property name, but keep them intact
            if (!token.prop) {
                result.push(token);
                continue;
            }
            
            // Get the function that determines if this token can be merged with others, default is same name and value
            var can = (processable[token.prop] && processable[token.prop].canMerge) || canMerge.sameValue;
            // Find the definition that's mergable with token and is already there
            var alreadyThere = result.filter(function(t) { return t.prop === token.prop && can(t, token); });
            
            // alreadyThere contains at most 1 item because we already merged those that came before it and might be mergeable with this one
            if (alreadyThere.length) {
                // foo{bar:baz;bar:baz !important} -> foo{bar:baz !important}
                token.isImportant = token.isImportant || alreadyThere[0].isImportant;
                result.splice(result.indexOf(alreadyThere[0]), 1);
            }
            
            result.push(token);
        }
        
        return result;
    };
    
    // Compacts the tokens by transforming properties into their shorthand notations when possible
    // https://github.com/GoalSmashers/clean-css/issues/134
    var compactToShorthands = function(tokens) {
        // Go through all possible shorthand notations
        for (var i in processable) {
            if (processable.hasOwnProperty(i) && processable[i].components && processable[i].components.length) {
                var sh = processable[i];
                var mains = tokens.filter(function(token) { return token.prop === sh.prop; });
                var components = [];
                
                // Go through all the components of the shorthand notation
                for (var j = 0; j < sh.components.length; j++) {
                    var comp = sh.components[i];
                    var found = tokens.filter(function(token) { return token.prop === comp; });
                    components = components.concat(found);
                }
                
                // TODO
            }
        }
        
        return tokens;
    };

    // Processes the input by calling the other functions
    // input is the content of a selector block (excluding the braces), NOT a full selector
    var process = function (input) {
        var tokens = tokenize(input);
        tokens = mergeSame(tokens);
        //tokens = compactToShorthands(tokens);
        return detokenize(tokens);
    };
    
    // Return the process function as module.exports
    return process;
})();

