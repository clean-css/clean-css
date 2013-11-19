
// This module will compact a CSS property list when feasible
module.exports = (function () {
  // Validator
  // NOTE: The point here is not semantical but syntactical validity
  var validator = {
    isValidHexColor: function (s) {
      return (s.length === 4 || s.length === 7) && s[0] === '#';
    },
    isValidRgbColor: function (s) {
      s = s.split(' ').join("");
      return s.length > 0 && s.indexOf("rgb(") === 0 && s.indexOf(')') === s.length - 1;
    },
    isValidRgbaColor: function (s) {
      s = s.split(' ').join("");
      return s.length > 0 && s.indexOf("rgba(") === 0 && s.indexOf(')') === s.length - 1;
    },
    isValidHslColor: function (s) {
      s = s.split(' ').join("");
      return s.length > 0 && s.indexOf("hsl(") === 0 && s.indexOf(')') === s.length - 1;
    },
    isValidHslaColor: function (s) {
      s = s.split(' ').join("");
      return s.length > 0 && s.indexOf("hsla(") === 0 && s.indexOf(')') === s.length - 1;
    },
    isValidNamedColor: function (s) {
      // TODO: we don't really check if it's a valid color value, but allow any letters in it
      return s === "transparent" || s === "inherit" || /^[a-zA-Z]+$/.test(s);
    },
    isValidColor: function (s) {
      // http://www.w3schools.com/cssref/css_colors_legal.asp
      return validator.isValidNamedColor(s) || validator.isValidHexColor(s) || validator.isValidRgbColor(s) || validator.isValidRgbaColor(s) || validator.isValidHslColor(s) || validator.isValidHslaColor(s);
    },
    isValidUrl: function (s) {
      // TODO: this doesn't work correctly if there is a ')' inside the URL
      s = s.replace("url (", "url(");
      return s.length >= 5 && s.indexOf("url(") === 0 && s[s.length - 1] === ')';
    },
    isValidUnit: function (s) {
      return /^\d+(px|%|em|rem|in|cm|mm|ex|pt|pc)$/.test(s);
    },
    isValidBackgroundRepeat: function (s) {
      return s === "repeat" || s === "no-repeat" || s === "repeat-x" || s === "repeat-y" || s === "inherit";
    },
    isValidBackgroundAttachment: function (s) {
      return s === "inherit" || s === "scroll" || s === "fixed" || s === "local";
    },
    isValidBackgroundPositionPart: function (s) {
      if (s === "center" || s === "top" || s === "bottom" || s === "left" || s === "right")
        return true;
      return validator.isValidUnit(s);
    },
    isValidBackgroundPosition: function (s) {
      if (s === "inherit")
        return true;
      return s.split(" ").every(function(p) { return validator.isValidBackgroundPositionPart(p); });
    }
  };
  validator = Object.freeze(validator);
  
  // Merge functions
  var canMerge = {
    always: function (t1, t2) {
      return true;
    },
    sameValue: function (t1, t2) {
      return t1.value === t2.value;
    },
    color: function (t1, t2) {
      // The idea here is that "more understandable" values override "less understandable" values, but not vice versa
      // Understandability: (hex | named) > rgb > (rgba | hsl | hsla) > anything else
    
      // (hex | named)
      if (validator.isValidNamedColor(t2.value) || validator.isValidHexColor(t2.value))
        return true;
      if (validator.isValidNamedColor(t1.value) || validator.isValidHexColor(t1.value))
        return false;
      
      // rgb
      if (validator.isValidRgbColor(t2.value))
        return true;
      if (validator.isValidRgbColor(t1.value))
        return false;
      
      // (rgba|hsl|hsla)
      if (validator.isValidRgbaColor(t2.value) || validator.isValidHslColor(t2.value) || validator.isValidHslaColor(t2.value))
        return true;
      if (validator.isValidRgbaColor(t1.value) || validator.isValidHslColor(t1.value) || validator.isValidHslaColor(t1.value))
        return false;
        
      // anything else
      return false;
      
    },
    backgroundImage: function (t1, t2) {
      // The idea here is that "more understandable" values override "less understandable" values, but not vice versa
      // Understandability: (none | url) > anything else > none --- yes, none both overrides anything and is overridden by anyting
      
      // none
      if (t1.value === "none")
        return true
      
      // (none | url)
      if (t2.value === "none" || validator.isValidUrl(t2.value))
        return true;
      if (t1.value === "none" || validator.isValidUrl(t1.value))
        return false;
      
      // anything else
      return false;
    }
    // TODO: add more
  };
  canMerge = Object.freeze(canMerge);
  
  // Functions for breaking up shorthands to components
  var breakUp = {
    // Breaks up by spaces
    bySpaces: function (token) {
      var descriptor = processable[token.prop];
      
      // If we don't know the components of this property, just return it as-is
      if (!descriptor || !(descriptor.components instanceof Array) || !descriptor.components.length)
        return [token];
      
      var result = [];
      var splitval = token.value.split(' ');
      
      if (splitval.length === 0 || (splitval.length < descriptor.components.length && descriptor.components.length > 4)) {
        // This token is malformed and we have no idea how to fix it. So let's just keep it intact
        return [token];
      }

      // Fix those that we do know how to fix
      if (splitval.length < descriptor.components.length && splitval.length < 2) {
        // foo{margin:1px} -> foo{margin:1px 1px}
        splitval[1] = splitval[0];
      }
      if (splitval.length < descriptor.components.length && splitval.length < 3) {
        // foo{margin:1px 2px} -> foo{margin:1px 2px 1px}
        splitval[2] = splitval[0];
      }
      if (splitval.length < descriptor.components.length && splitval.length < 4) {
        // foo{margin:1px 2px 3px} -> foo{margin:1px 2px 3px 2px}
        splitval[3] = splitval[1];
      }
      
      // Now break it up to its components
      for (var i = 0; i < descriptor.components.length; i++) {
        var t = {
          prop: descriptor.components[i],
          value: splitval[i],
          isImportant: token.isImportant
        };
        result.push(t);
      }
      
      return result;
    },
    // Breaks up a background property value
    background: function (token) {
      // Default values
      var color = {
        prop: "background-color",
        value: "transparent", // http://www.w3schools.com/cssref/pr_background-color.asp
        isImportant: token.isImportant
      };
      var image = {
        prop: "background-image",
        value: "none", // http://www.w3schools.com/cssref/pr_background-image.asp
        isImportant: token.isImportant
      };
      var repeat = {
        prop: "background-repeat",
        value: "repeat", // http://www.w3schools.com/cssref/pr_background-repeat.asp
        isImportant: token.isImportant
      };
      var position = {
        prop: "background-position",
        value: "0 0", // http://www.w3schools.com/cssref/pr_background-position.asp
        isImportant: token.isImportant
      };
      var attachment = {
        prop: "background-attachment",
        value: "scroll", // http://www.w3schools.com/cssref/pr_background-attachment.asp
        isImportant: token.isImportant
      };
      var result = [color, image, repeat, position, attachment];
      
      // Take care of inherit
      if (token.value === "inherit") {
        // NOTE: "inherit" is not a valid value for background-attachment so there we'll leave the default value
        color.value = image.value =  repeat.value = position.value = "inherit";
        return result;
      }
      
      // Break the background up into parts
      var parts = token.value.split(" ");
      if (parts.length === 0) {
        return result;
      }
      
      // The trick here is that we start going through the parts from the end, then stop after background repeat,
      // then start from the from the beginning until we find a valid color value. What remains will be treated as background-image.
      
      var currentIndex = parts.length - 1;
      var current = parts[currentIndex];
      // Attachment
      if (validator.isValidBackgroundAttachment(current)) {
        // Found attachment
        attachment.value = current;
        currentIndex--;
        current = parts[currentIndex];
      }
      // Position
      if (currentIndex >= 1 && validator.isValidBackgroundPosition(parts[currentIndex] + " " + parts[currentIndex - 1])) {
        // Found position (containing two parts)
        position.value = parts[currentIndex] + " " + parts[currentIndex - 1];
        currentIndex -= 2;
        current = parts[currentIndex];
      }
      else if (currentIndex >= 0 && validator.isValidBackgroundPosition(current)) {
        // Found position (containing just one part)
        position.value = current;
        currentIndex--;
        current = parts[currentIndex];
      }
      // Repeat
      if (currentIndex >= 0 && validator.isValidBackgroundRepeat(current)) {
        // Found repeat
        repeat.value = current;
        currentIndex--;
        current = parts[currentIndex];
      }
      // Color
      current = "";
      var fromBeginning = 0;
      var foundColor = false;
      for ( ; fromBeginning <= currentIndex; fromBeginning++) {
        current += " " + parts[fromBeginning];
        current = current.trim();
        if (validator.isValidColor(current)) {
          // Found color
          color.value = current;
          fromBeginning++;
          foundColor = true;
          break;
        }
      }
      if (!foundColor) {
        // Did not find color
        fromBeginning = 0;
      }
      // Image
      image.value = (parts.splice(fromBeginning, currentIndex - fromBeginning + 1).join(" ")) || "none";
      console.log(fromBeginning, currentIndex, result);
      return result;
    }
  };
  var breakUp = Object.freeze(breakUp);
  
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
      ],
      breakUp: breakUp.background
    },
    "color": {
      canMerge: canMerge.color
    },
    "background-color": {
      canMerge: canMerge.color
    },
    "background-image": {
      canMerge: canMerge.backgroundImage
    },
    "background-repeat": {
      canMerge: canMerge.always
    },
    "background-position": {
      canMerge: canMerge.always
    },
    "background-attachment": {
      canMerge: canMerge.always
    }
    // TODO: add more
  };
  // Add each granular property that is not explicitly stated, to the processable
  for (var prop in processable) {
    if (processable.hasOwnProperty(prop)) {
      var proc = processable[prop];
      if (proc.components instanceof Array && proc.components.length) {
        for (var i = 0; i < proc.components.length; i++) {
          if (!processable[proc.components[i]]) {
            processable[proc.components[i]] = {
              canMerge: proc.canMerge
            };
          }
        }
      }
    }
  }
  processable = Object.freeze(processable);
  
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
      if (importantPos >= 1 && importantPos === value.length - important.length) {
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
  
  // Breaks up shorthand properties into their components
  var breakUpShorthands = function(tokens) {
    var result = [];
    
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      
      if (!token.prop) {
        // Malformed token, but keep it intact
        result.push(token);
      }
      else if (processable[token.prop] && processable[token.prop].components instanceof Array && processable[token.prop].components.length) {
        // Shorthand token, break it up
        var b = processable[token.prop].breakUp || breakUp.bySpaces;
        var components = b(token);
        
        for (var j = 0; j < components.length; j++) {
          result.push(components[j]);
        }
      }
      else {
        // Not a shorthand, keep it as it is
        result.push(token);
      }
      
    }
    //console.log(result);
    
    return result;
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
        if (!alreadyThere[0].isImportant || token.isImportant) {
          // foo{bar:baz;bar:baz !important} -> foo{bar:baz !important}
          result.splice(result.indexOf(alreadyThere[0]), 1);
          result.push(token);
        }
      }
      else {
        result.push(token);
      }
    }
    
    return result;
  };
  
  // Compacts the tokens by transforming properties into their shorthand notations when possible
  // https://github.com/GoalSmashers/clean-css/issues/134
  var compactToShorthands = function(tokens, important) {
    // Go through all possible shorthand notations
    shorthandsLoop:
    for (var i in processable) {
      if (processable.hasOwnProperty(i) && processable[i].components && processable[i].components.length) {
        // The shorthand we currently work with
        var sh = processable[i];
        // Components found among the tokens
        var comps = [];
        // Resulting value for the compacted token
        var value = "";
        
        // Find the first definition of every component
        for (var j = 0; j < sh.components.length; j++) {
          var found = tokens.filter(function(t) { return t.isImportant === important && sh.components[j] === t.prop; });

          if (found.length > 0) {
            comps.push(found[0]);
            value += " " + found[0].value;
          }
          else {
            continue shorthandsLoop;
          }
        }
        
        // Put the compacted token in the place of the first component
        tokens[tokens.indexOf(comps[0])] = {
          prop: i,
          value: value.trim(),
          isImportant: important
        };
        
        // Remove other tokens
        for (var j = 1; j < comps.length; j++) {
          tokens.splice(tokens.indexOf(comps[j]), 1);
        }
      }
    }
    
    return tokens;
  };

  // Processes the input by calling the other functions
  // input is the content of a selector block (excluding the braces), NOT a full selector
  var process = function (input) {
    //console.log(input);
    var tokens = tokenize(input);
    //console.log(tokens);
    tokens = breakUpShorthands(tokens);
    //console.log(tokens);
    tokens = mergeSame(tokens);
    tokens = compactToShorthands(tokens, true);
    tokens = compactToShorthands(tokens, false);
    return detokenize(tokens);
  };
  
  // Return the process function as module.exports
  return process;
})();

