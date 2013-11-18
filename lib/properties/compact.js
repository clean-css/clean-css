
// This module will compact a CSS property list when feasible
module.exports = (function () {
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
            ]
        },
        "padding": {
            alwaysMergeRedefined: true,
            components: [
                "padding-top",
                "padding-right",
                "padding-bottom",
                "padding-left"
            ]
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
    var mergeSame = function(tokens) {
        var result = [];
    
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            // Skip malformed tokens that have no property name, but keep them intact
            if (!token.prop) {
                result.push(token);
                continue;
            }
            
            if (processable[token.prop] && processable[token.prop].alwaysMergeRedefined) {
                // These properties can always be merged together no matter what they contain
                
                // Find the previously defined ones
                var previouslyDefined = result.filter(function(t) { return t.prop === token.prop; });
                if (previouslyDefined.length) {
                    // NOTE: it's safe to say that previouslyDefined.length is maximum 1 here
                    result.splice(result.indexOf(previouslyDefined[0]), 1);
                }
                
                result.push(token);
            }
            else {
                // These properties must be examined to determine if they can be merged
                
                // NOTE: At the moment, we only merge those whose value is equal
                var alreadyMerged = result.some(function(t) { return t.prop === token.prop && t.value === token.value && t.isImportant === token.isImportant; });
                if (!alreadyMerged) {
                    result.push(token);
                }
                
                // TODO: foo{bar:123px;bar:456px;}   ->   foo{bar:456px;}
                // TODO: foo{color:#fff;color:#eee;color:rgba(123,123,123,0.3)}   ->   foo{color:#eee;color:rgba(123,123,123,0.3)}
                // TODO: foo{bar:baz;bar:baz !important}   ->   foo{bar:baz !important}
            }
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
        console.log("tokenized", tokens);
        tokens = mergeSame(tokens);
        console.log("merged", tokens);
        //tokens = compactToShorthands(tokens);
        return detokenize(tokens);
    };
    
    // Return the process function as module.exports
    return process;
})();

