
// This module will compact a CSS property list when feasible
module.exports = (function () {

  // Creates a property token with its default value
  var makeDefaultProperty = function (prop, important) {
    return {
      prop: prop,
      value: processable[prop].defaultValue,
      isImportant: important
    };
  };

  // Creates an array of property tokens with their default values
  var makeDefaultProperties = function (props, important) {
    return props.map(function(prop) { return makeDefaultProperty(prop, important); });
  };

  // Validator
  // NOTE: The point here is not semantical but syntactical validity
  var validator = {
    isValidHexColor: function (s) {
      return (s.length === 4 || s.length === 7) && s[0] === '#';
    },
    isValidRgbaColor: function (s) {
      s = s.split(' ').join('');
      return s.length > 0 && s.indexOf('rgba(') === 0 && s.indexOf(')') === s.length - 1;
    },
    isValidHslaColor: function (s) {
      s = s.split(' ').join('');
      return s.length > 0 && s.indexOf('hsla(') === 0 && s.indexOf(')') === s.length - 1;
    },
    isValidNamedColor: function (s) {
      // TODO: we don't really check if it's a valid color value, but allow any letters in it
      return s === 'transparent' || s === 'inherit' || /^[a-zA-Z]+$/.test(s);
    },
    isValidColor: function (s) {
      // http://www.w3schools.com/cssref/css_colors_legal.asp
      return validator.isValidNamedColor(s) || validator.isValidHexColor(s) || validator.isValidRgbaColor(s) || validator.isValidHslaColor(s);
    },
    isValidUrl: function (s) {
      // NOTE: at this point all URLs are replaced with placeholders by clean-css, so we check for those placeholders
      return s.indexOf('__ESCAPED_URL_CLEAN_CSS') === 0;
    },
    isValidUnit: function (s) {
      return (/^\d+(px|%|em|rem|in|cm|mm|ex|pt|pc|)$/).test(s);
    },
    isValidBackgroundRepeat: function (s) {
      return s === 'repeat' || s === 'no-repeat' || s === 'repeat-x' || s === 'repeat-y' || s === 'inherit';
    },
    isValidBackgroundAttachment: function (s) {
      return s === 'inherit' || s === 'scroll' || s === 'fixed' || s === 'local';
    },
    isValidBackgroundPositionPart: function (s) {
      if (s === 'center' || s === 'top' || s === 'bottom' || s === 'left' || s === 'right')
        return true;
      return validator.isValidUnit(s);
    },
    isValidBackgroundPosition: function (s) {
      if (s === 'inherit')
        return true;
      return s.split(' ').every(function(p) { return validator.isValidBackgroundPositionPart(p); });
    },
    isValidListStyleType: function (s) {
      return s === 'armenian' || s === 'circle' || s === 'cjk-ideographic' || s === 'decimal' || s === 'decimal-leading-zero' || s === 'disc' || s === 'georgian' || s === 'hebrew' || s === 'hiragana' || s === 'hiragana-iroha' || s === 'inherit' || s === 'katakana' || s === 'katakana-iroha' || s === 'lower-alpha' || s === 'lower-greek' || s === 'lower-latin' || s === 'lower-roman' || s === 'none' || s === 'square' || s === 'upper-alpha' || s === 'upper-latin' || s === 'upper-roman';
    },
    isValidListStylePosition: function (s) {
      return s === 'inside' || s === 'outside' || s === 'inherit';
    },
    isValidOutlineColor: function (s) {
      return s === 'invert' || validator.isValidColor(s);
    },
    isValidOutlineStyle: function (s) {
      return s === 'inherit' || s === 'hidden' || s === 'none' || s === 'dotted' || s === 'dashed' || s === 'solid' || s === 'double' || s === 'groove' || s === 'ridge' || s === 'inset' || s === 'outset';
    },
    isValidOutlineWidth: function (s) {
      return validator.isValidUnit(s) || s === 'thin' || s === 'thick' || s === 'medium' || s === 'inherit';
    }
  };
  validator = Object.freeze(validator);
  
  // Merge functions
  var canMerge = {
    // Use when two tokens of the same property can always be merged
    always: function () {
      // NOTE: We could have (t1, t2) parameters here but jshint complains because we don't use them
      return true;
    },
    // Use when two tokens of the same property can only be merged if they have the same value
    sameValue: function (t1, t2) {
      return t1.value === t2.value;
    },
    // Use for color properties (color, background-color, border-color, etc.)
    color: function (t1, t2) {
      // The idea here is that 'more understandable' values override 'less understandable' values, but not vice versa
      // Understandability: (hex | named) > (rgba | hsla) > anything else
      // NOTE: at this point rgb and hsl are replaced by hex values by clean-css
    
      // (hex | named)
      if (validator.isValidNamedColor(t2.value) || validator.isValidHexColor(t2.value))
        return true;
      if (validator.isValidNamedColor(t1.value) || validator.isValidHexColor(t1.value))
        return false;
      
      // (rgba|hsla)
      if (validator.isValidRgbaColor(t2.value) || validator.isValidHslColor(t2.value) || validator.isValidHslaColor(t2.value))
        return true;
      if (validator.isValidRgbaColor(t1.value) || validator.isValidHslColor(t1.value) || validator.isValidHslaColor(t1.value))
        return false;
        
      // anything else
      return false;
      
    },
    // Use for background-image
    backgroundImage: function (t1, t2) {
      // The idea here is that 'more understandable' values override 'less understandable' values, but not vice versa
      // Understandability: (none | url) > anything else > none --- yes, none both overrides anything and is overridden by anyting
      
      // none
      if (t1.value === 'none')
        return true;
      
      // (none | url)
      if (t2.value === 'none' || validator.isValidUrl(t2.value))
        return true;
      if (t1.value === 'none' || validator.isValidUrl(t1.value))
        return false;
      
      // anything else
      return false;
    }
    // TODO: add more
  };
  canMerge = Object.freeze(canMerge);
  
  // Functions for breaking up shorthands to components
  var breakUp = {
    // Use this for properties with 4 unit values (like margin or padding)
    // NOTE: it handles shorter forms of these properties too (like, only 1, 2, or 3 units)
    fourUnits: function (token) {
      var descriptor = processable[token.prop];
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
      var result = makeDefaultProperties(['background-color', 'background-image', 'background-repeat', 'background-position', 'background-attachment'], token.isImportant);
      var color = result[0], image = result[1], repeat = result[2], position = result[3], attachment = result[4];
      
      // Take care of inherit
      if (token.value === 'inherit') {
        // NOTE: 'inherit' is not a valid value for background-attachment so there we'll leave the default value
        color.value = image.value =  repeat.value = position.value = 'inherit';
        return result;
      }
      
      // Break the background up into parts
      var parts = token.value.split(' ');
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
      var pos = parts[currentIndex - 1] + ' ' + parts[currentIndex];
      if (currentIndex >= 1 && validator.isValidBackgroundPosition(pos)) {
        // Found position (containing two parts)
        position.value = pos;
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
      var fromBeginning = 0;
      if (validator.isValidColor(parts[0])) {
        // Found color
        color.value = parts[0];
        fromBeginning = 1;
      }
      // Image
      image.value = (parts.splice(fromBeginning, currentIndex - fromBeginning + 1).join(' ')) || 'none';
      return result;
    },
    // Breaks up a list-style property value
    listStyle: function (token) {
      // Default values
      var result = makeDefaultProperties(['list-style-type', 'list-style-position', 'list-style-image'], token.isImportant);
      var type = result[0], position = result[1], image = result[2];
      
      if (token.value === 'inherit') {
        type.value = position.value = image.value = 'inherit';
        return result;
      }
      
      var parts = token.value.split(' ');
      var ci = 0;
      
      // Type
      if (ci < parts.length && validator.isValidListStyleType(parts[ci])) {
        type.value = parts[ci];
        ci++;
      }
      // Position
      if (ci < parts.length && validator.isValidListStylePosition(parts[ci])) {
        position.value = parts[ci];
        ci++;
      }
      // Image
      if (ci < parts.length) {
        image.value = parts.splice(ci, parts.length - ci + 1).join(' ');
      }
      
      return result;
    },
    // Breaks up outline
    outline: function (token) {
      // Default values
      var result = makeDefaultProperties(['outline-color', 'outline-style', 'outline-width'], token.isImportant);
      var color = result[0], style = result[1], width = result[2];
      
      // Take care of inherit
      if (token.value === 'inherit' || token.value === 'inherit inherit inherit') {
        color.value = style.value = width.value = 'inherit';
        return result;
      }
      
      // NOTE: usually users don't follow the required order of parts in this shorthand,
      // so we'll try to parse it caring as little about order as possible
      
      var parts = token.value.split(' '), w;
      
      if (parts.length === 0) {
        return result;
      }
      
      if (parts.length >= 1) {
        // Try to find outline-width, excluding inherit because that can be anything
        w = parts.filter(function(p) { return p !== 'inherit' && validator.isValidOutlineWidth(p); });
        if (w.length) {
          width.value = w[0];
          parts.splice(parts.indexOf(w[0]), 1);
        }
      }
      if (parts.length >= 1) {
        // Try to find outline-style, excluding inherit because that can be anything
        w = parts.filter(function(p) { return p !== 'inherit' && validator.isValidOutlineStyle(p); });
        if (w.length) {
          style.value = w[0];
          parts.splice(parts.indexOf(w[0]), 1);
        }
      }
      if (parts.length >= 1) {
        // Find outline-color but this time can catch inherit
        w = parts.filter(function(p) { return validator.isValidOutlineColor(p); });
        if (w.length) {
          color.value = w[0];
          parts.splice(parts.indexOf(w[0]), 1);
        }
      }
      if (parts.length >= 1) {
        // Right here, we already know that:
        // * value of outline is NOT 'inherit' and NOT 'inherit inherit inherit'
        // * if there was any value (including 'inherit') that could be the color, we already got it
        // * we already found any suitable value for outline-style and outline-width, excluding 'inherit'
        // Conclusion: if there are parts left, that could only mean that outline-style and possibly outline-width is 'inherit'
        
        style.value = 'inherit';
        if (parts.length >= 2) {
          width.value = 'inherit';
        }
      }
      
      return result;
    }
  };
  breakUp = Object.freeze(breakUp);
  
  // Contains functions that can put together shorthands from their components
  var putTogether = {
    // Use this for properties which have four unit values (margin, padding, etc.)
    // NOTE: optimizes to shorter forms too (that only specify 1, 2, or 3 values)
    fourUnits: function (prop, tokens, isImportant) {
      var result = {
        prop: prop,
        value: tokens[0].value,
        isImportant: isImportant
      };
      // 1-value short form: all four components are equal
      if (tokens[0].value === tokens[1].value && tokens[0].value === tokens[2].value && tokens[0].value === tokens[3].value) {
        return result;
      }
      result.value += ' ' + tokens[1].value;
      // 2-value short form: first and third; second and fourth values are equal
      if (tokens[0].value === tokens[2].value && tokens[1].value === tokens[3].value) {
        return result;
      }
      result.value += ' ' + tokens[2].value;
      // 3-value short form: second and fourth values are equal
      if (tokens[1].value === tokens[3].value) {
        return result;
      }
      // 4-value form (none of the above optimalizations could be accomplished)
      result.value += ' ' + tokens[3].value;
      return result;
    },
    // Puts together the components by spaces and omits default values (this is the case for most shorthands)
    bySpacesOmitDefaults: function (prop, tokens, isImportant) {
      var value = '';
      
      // Go through all tokens and concatenate their values as necessary
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        // Omit default value
        if (processable[token.prop] && processable[token.prop].defaultValue === token.value)
          continue;
        
        value += ' ' + token.value;
      }
      
      return {
        prop: prop,
        value: value.trim(),
        isImportant: isImportant
      };
    }
  };
  putTogether = Object.freeze(putTogether);
  
  // Properties to process
  // Extend this object in order to add support for more properties in the optimizer.
  // 
  // Each key in this object represents a CSS property and should be an object.
  // Such an object contains properties that describe how the represented CSS property should be handled.
  // Possible options:
  //
  // * components: array (Only specify for shorthand properties.)
  //   Contains the names of the granular properties this shorthand compacts.
  //
  // * canMerge: function (Default is canMerge.sameValue - meaning that they'll only be merged if they have the same value.)
  //   Returns whether two tokens of this property can be merged with each other.
  //   This property has no meaning for shorthands.
  //
  // * defaultValue: string
  //   Specifies the default value of the property according to the CSS standard.
  //   For shorthand, this is used when every component is set to its default value, therefore it should be the shortest possible default value of all the components.
  //
  // * breakUp: function (Only specify for shorthand properties.)
  //   Breaks the shorthand up to its components.
  //
  // * putTogether: function (Only specify for shorthand properties.)
  //   Puts the shorthand together from its components.
  //
  var processable = {
    'margin': {
      components: [
        'margin-top',
        'margin-right',
        'margin-bottom',
        'margin-left'
      ],
      breakUp: breakUp.fourUnits,
      putTogether: putTogether.fourUnits,
      defaultValue: '0'
    },
    'margin-top': {
      defaultValue: '0',
      canMerge: canMerge.always
    },
    'margin-right': {
      defaultValue: '0',
      canMerge: canMerge.always
    },
    'margin-bottom': {
      defaultValue: '0',
      canMerge: canMerge.always
    },
    'margin-left': {
      defaultValue: '0',
      canMerge: canMerge.always
    },
    'padding': {
      components: [
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left'
      ],
      breakUp: breakUp.fourUnits,
      putTogether: putTogether.fourUnits,
      defaultValue: '0'
    },
    'padding-top': {
      defaultValue: '0',
      canMerge: canMerge.always
    },
    'padding-right': {
      defaultValue: '0',
      canMerge: canMerge.always
    },
    'padding-bottom': {
      defaultValue: '0',
      canMerge: canMerge.always
    },
    'padding-left': {
      defaultValue: '0',
      canMerge: canMerge.always
    },
    'background': {
      components: [
        'background-color',
        'background-image',
        'background-repeat',
        'background-position',
        'background-attachment'
      ],
      breakUp: breakUp.background,
      putTogether: putTogether.bySpacesOmitDefaults,
      defaultValue: 'none'
    },
    'color': {
      canMerge: canMerge.color,
      defaultValue: 'transparent'
    },
    'background-color': {
      // http://www.w3schools.com/cssref/pr_background-color.asp
      canMerge: canMerge.color,
      defaultValue: 'transparent'
    },
    'background-image': {
      // http://www.w3schools.com/cssref/pr_background-image.asp
      canMerge: canMerge.backgroundImage,
      defaultValue: 'none'
    },
    'background-repeat': {
      // http://www.w3schools.com/cssref/pr_background-repeat.asp
      canMerge: canMerge.always,
      defaultValue: 'repeat'
    },
    'background-position': {
      // http://www.w3schools.com/cssref/pr_background-position.asp
      canMerge: canMerge.always,
      defaultValue: '0 0'
    },
    'background-attachment': {
      // http://www.w3schools.com/cssref/pr_background-attachment.asp
      canMerge: canMerge.always,
      defaultValue: 'scroll'
    },
    'list-style': {
      // http://www.w3schools.com/cssref/pr_list-style.asp
      components: [
        'list-style-type',
        'list-style-position',
        'list-style-image'
      ],
      canMerge: canMerge.always,
      breakUp: breakUp.listStyle,
      putTogether: putTogether.bySpacesOmitDefaults,
      defaultValue: 'outside' // can't use 'disc' because that'd override default 'decimal' for <ol>
    },
    'list-style-type' : {
      // http://www.w3schools.com/cssref/pr_list-style-type.asp
      canMerge: canMerge.always,
      defaultValue: '__hack'
      // NOTE: we can't tell the real default value here, it's 'disc' for <ul> and 'decimal' for <ol>
      //       -- this is a hack, but it doesn't matter because this value will be either overridden or it will disappear at the final step anyway
    },
    'list-style-position' : {
      // http://www.w3schools.com/cssref/pr_list-style-position.asp
      canMerge: canMerge.always,
      defaultValue: 'outside'
    },
    'list-style-image' : {
      // http://www.w3schools.com/cssref/pr_list-style-image.asp
      canMerge: canMerge.always,
      defaultValue: 'none'
    },
    'outline': {
      components: [
        'outline-color',
        'outline-style',
        'outline-width'
      ],
      breakUp: breakUp.outline,
      putTogether: putTogether.bySpacesOmitDefaults,
      defaultValue: 'none'
    },
    'outline-color': {
      // http://www.w3schools.com/cssref/pr_outline-color.asp
      canMerge: canMerge.color,
      defaultValue: 'invert'
    },
    'outline-style': {
      // http://www.w3schools.com/cssref/pr_outline-style.asp
      canMerge: canMerge.always,
      defaultValue: 'none'
    },
    'outline-width': {
      // http://www.w3schools.com/cssref/pr_outline-width.asp
      canMerge: canMerge.always,
      defaultValue: 'medium'
    }
    // TODO: add more
  };
  processable = Object.freeze(processable);
  
  var isHackValue = function(t) { return t.value === '__hack'; };
  var important = '!important';
  
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
      var result = '';
      
      // NOTE: malformed tokens will not have a 'prop' property
      if (token.prop) {
        result += token.prop + ':';
      }
      if (token.value) {
        result += token.value;
      }
      if (token.isImportant) {
        result += ' ' + important;
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
        // Shorthand token; check if we can break it up
        if (!processable[token.prop].breakUp) {
          // We don't know how to break this shorthand up to its compontents. Just leave it as it is.
          result.push(token);
          continue;
        }
        
        // We know how to break it up, so let's do it
        var components = processable[token.prop].breakUp(token);
        
        for (var j = 0; j < components.length; j++) {
          result.push(components[j]);
        }
      }
      else {
        // Not a shorthand, keep it as it is
        result.push(token);
      }
    }
    
    return result;
  };
  
  // Merges same properties
  // https://github.com/GoalSmashers/clean-css/issues/173
  // https://github.com/GoalSmashers/clean-css/issues/168
  var mergeSame = function(tokens) {
    var result = [];
    
    // Variables used inside the array
    var can, token;
    // Function used for finding the alreadyThere list
    var alreadyThereFilter = function(t) { return t.prop === token.prop && can(t, token); };
    
    for (var i = 0; i < tokens.length; i++) {
      token = tokens[i];
      // Skip malformed tokens that have no property name, but keep them intact
      if (!token.prop) {
        result.push(token);
        continue;
      }
      
      // Get the function that determines if this token can be merged with others, default is same name and value
      can = (processable[token.prop] && processable[token.prop].canMerge) || canMerge.sameValue;
      // Find the definition that's mergable with token and is already there
      var alreadyThere = result.filter(alreadyThereFilter);
      
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
    // Variables used inside the loop (needed by the filter functions)
    var cc;
    // Filter functions used inside the loop
    var foundFilterFunc = function(t) { return t.isImportant === important && cc === t.prop; };
    var importantTrickFunc = function(t) { return t.isImportant === true && cc === t.prop; };
    
    // Go through all possible shorthand notations
    shorthandsLoop:
    for (var i in processable) {
      // Omit current token if it's unknown or isn't a shorthand or if it's a shorthand but we don't know how to put it together
      if (!processable.hasOwnProperty(i) || !processable[i].components || !processable[i].components.length || !processable[i].putTogether)
        continue;
      
      // The shorthand we currently work with
      var sh = processable[i];
      // Components found among the tokens
      var comps = [];
      // Array for the "missing" components than can be still tricked
      var trickComps = [];
      
      // Find the first definition of every component
      for (var j = 0; j < sh.components.length; j++) {
        cc = sh.components[j];
        var found = tokens.filter(foundFilterFunc);

        if (found.length > 0) {
          // Component found (this is the best case here)
          comps.push(found[0]);
        }
        else if (!important && tokens.some(importantTrickFunc)) {
          // This is a neat trick: if some properties are missing from compacting non-important tokens,
          // we can still compact them if they are covered by important components.
          // In this case, it doesn't even matter what we put inside the compacted version in their place,
          // because they'll get overridden by the important versions anyway.
          // https://github.com/GoalSmashers/clean-css/issues/184
          var comp = makeDefaultProperty(cc);
          comps.push(comp);
          trickComps.push(comp);
        }
        else {
          // If this component is not found and can't be tricked, we can't put together this shorthand
          continue shorthandsLoop;
        }
      }
      
      var compacted = processable[i].putTogether(i, comps, important);
      
      // If no components are tricked, the shorthand is always shorter; otherwise we should check if it's truly shorter
      // NOTE: this is the place where we also forcibly get rid of the hacked-in default for list-style-type
      if (trickComps.length === 0 || detokenize([compacted]).length <= detokenize(comps).length || comps.some(isHackValue)) {
        // Put the compacted token in the place of the first component
        tokens[tokens.indexOf(comps[0])] = compacted;
        
        // Remove other tokens
        for (var k = 1; k < comps.length; k++) {
          tokens.splice(tokens.indexOf(comps[k]), 1);
        }
      }
    }
    
    return tokens;
  };

  // Processes the input by calling the other functions
  // input is the content of a selector block (excluding the braces), NOT a full selector
  var process = function (input) {
    
    // The algorithm here is designed to optimize properties in a CSS selector block
    // and output the smallest possible equivalent code. Here are the steps:
    //
    // 1. Break up shorthands into their components
    // 2. Merge same properties
    // 3. Compact properties into their shorthand equivalents
    //
    // Details are determined by `processable` - look at its comments to see how.
    // This approach has many benefits:
    //
    // * Deals with cases when a shorthand overrides more granular properties
    // * Leaves fallbacks intact but merges equally understandable values
    // * Removes default values from shorthand declarations
    // * Opens up opportunities for further optimalizations because granular components of shorthands are much easier to compare/process individually
    //
    
    var tokens = tokenize(input);
    
    tokens = breakUpShorthands(tokens);
    tokens = mergeSame(tokens);
    tokens = compactToShorthands(tokens, false);
    tokens = compactToShorthands(tokens, true);
    
    return detokenize(tokens);
  };
  
  // Return the process function as module.exports
  return process;

})();

