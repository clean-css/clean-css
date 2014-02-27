
// The algorithm here is designed to optimize properties in a CSS selector block
// and output the smallest possible equivalent code. It is capable of
//
// 1. Merging properties that can override each other
// 2. Shorthanding properties when it makes sense
//
// Details are determined by `processable` - look at its comments to see how.
// This design has many benefits:
//
// * Can break up shorthands to their granular values
// * Deals with cases when a shorthand overrides more granular properties
// * Leaves fallbacks intact but merges equally understandable values
// * Removes default values from shorthand declarations
// * Opens up opportunities for further optimalizations because granular components of shorthands are much easier to compare/process individually
//

module.exports = (function () {

  // Creates a property token with its default value
  var makeDefaultProperty = function (prop, important, newValue) {
    return {
      prop: prop,
      value: newValue || processable[prop].defaultValue,
      isImportant: important
    };
  };

  // Creates an array of property tokens with their default values
  var makeDefaultProperties = function (props, important) {
    return props.map(function(prop) { return makeDefaultProperty(prop, important); });
  };

  // Regexes used for stuff
  var cssUnitRegexStr =             '(\\-?\\.?\\d+\\.?\\d*(px|%|em|rem|in|cm|mm|ex|pt|pc|)|auto|inherit)';
  var cssFunctionNoVendorRegexStr = '[A-Z]+(\\-|[A-Z]|[0-9])+\\(([A-Z]|[0-9]|\\ |\\,|\\#|\\+|\\-|\\%|\\.)*\\)';
  var cssFunctionVendorRegexStr =   '\\-(\\-|[A-Z]|[0-9])+\\(([A-Z]|[0-9]|\\ |\\,|\\#|\\+|\\-|\\%|\\.)*\\)';
  var cssFunctionAnyRegexStr =      '(' + cssFunctionNoVendorRegexStr + '|' + cssFunctionVendorRegexStr + ')';
  var cssUnitAnyRegexStr =          '(' + cssUnitRegexStr + '|' + cssFunctionNoVendorRegexStr + '|' + cssFunctionVendorRegexStr + ')';

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
      return s !== 'auto' && (s === 'transparent' || s === 'inherit' || /^[a-zA-Z]+$/.test(s));
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
      return new RegExp('^' + cssUnitAnyRegexStr + '$', 'gi').test(s);
    },
    isValidUnitWithoutFunction: function (s) {
      return new RegExp('^' + cssUnitRegexStr + '$', 'gi').test(s);
    },
    isValidFunctionWithoutVendorPrefix: function (s) {
      return new RegExp('^' + cssFunctionNoVendorRegexStr + '$', 'gi').test(s);
    },
    isValidFunctionWithVendorPrefix: function (s) {
      return new RegExp('^' + cssFunctionVendorRegexStr + '$', 'gi').test(s);
    },
    isValidFunction: function (s) {
      return new RegExp('^' + cssFunctionAnyRegexStr + '$', 'gi').test(s);
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
      // LIMITATION: currently we don't support functions in here because otherwise we'd confuse things like linear-gradient()
      //             we need to figure out the complete list of functions that are allowed for units and then we can use isValidUnit here.
      return new RegExp('^' + cssUnitRegexStr + '$', 'gi').test(s);
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
      return s === 'invert' || validator.isValidColor(s) || validator.isValidVendorPrefixedValue(s);
    },
    isValidOutlineStyle: function (s) {
      return s === 'inherit' || s === 'hidden' || s === 'none' || s === 'dotted' || s === 'dashed' || s === 'solid' || s === 'double' || s === 'groove' || s === 'ridge' || s === 'inset' || s === 'outset';
    },
    isValidOutlineWidth: function (s) {
      return validator.isValidUnit(s) || s === 'thin' || s === 'thick' || s === 'medium' || s === 'inherit';
    },
    isValidVendorPrefixedValue: function (s) {
      return /^-([A-Za-z0-9]|-)*$/gi.test(s);
    },
    areSameFunction: function (a, b) {
      if (!validator.isValidFunction(a) || !validator.isValidFunction(b)) {
        return false;
      }
      var f1name = a.substring(0, a.indexOf('('));
      var f2name = b.substring(0, b.indexOf('('));

      return f1name === f2name;
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
    sameFunctionOrValue: function (t1, t2) {
      // Functions with the same name can override each other
      if (validator.areSameFunction(t1.value, t2.value)) {
        return true;
      }

      return t1.value === t2.value;
    },
    // Use for properties containing CSS units (margin-top, padding-left, etc.)
    unit: function (t1, t2) {
      // The idea here is that 'more understandable' values override 'less understandable' values, but not vice versa
      // Understandability: (unit without functions) > (same functions | standard functions) > anything else
      // NOTE: there is no point in having different vendor-specific functions override each other or standard functions,
      //       or having standard functions override vendor-specific functions, but standard functions can override each other
      // NOTE: vendor-specific property values are not taken into consideration here at the moment

      if (validator.isValidUnitWithoutFunction(t2.value))
        return true;
      if (validator.isValidUnitWithoutFunction(t1.value))
        return false;

      // Standard non-vendor-prefixed functions can override each other
      if (validator.isValidFunctionWithoutVendorPrefix(t2.value) && validator.isValidFunctionWithoutVendorPrefix(t1.value)) {
        return true;
      }

      // Functions with the same name can override each other; same values can override each other
      return canMerge.sameFunctionOrValue(t1, t2);
    },
    // Use for color properties (color, background-color, border-color, etc.)
    color: function (t1, t2) {
      // The idea here is that 'more understandable' values override 'less understandable' values, but not vice versa
      // Understandability: (hex | named) > (rgba | hsla) > (same function name) > anything else
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

      // Functions with the same name can override each other; same values can override each other
      return canMerge.sameFunctionOrValue(t1, t2);
    },
    // Use for background-image
    backgroundImage: function (t1, t2) {
      // The idea here is that 'more understandable' values override 'less understandable' values, but not vice versa
      // Understandability: (none | url | inherit) > (same function) > (same value)

      // (none | url)
      if (t2.value === 'none' || t2.value === 'inherit' || validator.isValidUrl(t2.value))
        return true;
      if (t1.value === 'none' || t1.value === 'inherit' || validator.isValidUrl(t1.value))
        return false;

      // Functions with the same name can override each other; same values can override each other
      return canMerge.sameFunctionOrValue(t1, t2);
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
      var splitval = token.value.match(new RegExp(cssUnitAnyRegexStr, 'gi'));

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
        color.value = image.value =  repeat.value = position.value = attachment.value = 'inherit';
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

      return result;
    }
  };
  breakUp = Object.freeze(breakUp);

  // Contains functions that can put together shorthands from their components
  // NOTE: correct order of tokens is assumed inside these functions!
  var putTogether = {
    // Use this for properties which have four unit values (margin, padding, etc.)
    // NOTE: optimizes to shorter forms too (that only specify 1, 2, or 3 values)
    fourUnits: function (prop, tokens, isImportant) {
      // See about irrelevant tokens
      // NOTE: This will enable some crazy optimalizations for us.
      if (tokens[0].isIrrelevant) {
        tokens[0].value = tokens[2].value;
      }
      if (tokens[2].isIrrelevant) {
        tokens[2].value = tokens[0].value;
      }
      if (tokens[1].isIrrelevant) {
        tokens[1].value = tokens[3].value;
      }
      if (tokens[3].isIrrelevant) {
        tokens[3].value = tokens[1].value;
      }
      if (tokens[0].isIrrelevant && tokens[2].isIrrelevant) {
        if (tokens[1].value === tokens[3].value) {
          tokens[0].value = tokens[2].value = tokens[1].value;
        }
        else {
          tokens[0].value = tokens[2].value = '0';
        }
      }
      if (tokens[1].isIrrelevant && tokens[3].isIrrelevant) {
        if (tokens[0].value === tokens[2].value) {
          tokens[1].value = tokens[3].value = tokens[0].value;
        }
        else {
          tokens[1].value = tokens[3].value = '0';
        }
      }

      var result = {
        prop: prop,
        value: tokens[0].value,
        isImportant: isImportant,
        granularValues: { }
      };
      result.granularValues[tokens[0].prop] = tokens[0].value;
      result.granularValues[tokens[1].prop] = tokens[1].value;
      result.granularValues[tokens[2].prop] = tokens[2].value;
      result.granularValues[tokens[3].prop] = tokens[3].value;

      // If all of them are irrelevant
      if (tokens[0].isIrrelevant && tokens[1].isIrrelevant && tokens[2].isIrrelevant && tokens[3].isIrrelevant) {
        result.value = processable[prop].shortestValue || processable[prop].defaultValue;
        return result;
      }

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
      var result = {
        prop: prop,
        value: '',
        isImportant: isImportant
      };
      // Get irrelevant tokens
      var irrelevantTokens = tokens.filter(function (t) { return t.isIrrelevant; });

      // If every token is irrelevant, return shortest possible value, fallback to default value
      if (irrelevantTokens.length === tokens.length) {
        result.isIrrelevant = true;
        result.value = processable[prop].shortestValue || processable[prop].defaultValue;
        return result;
      }

      // This will be the value of the shorthand if all the components are default
      var valueIfAllDefault = processable[prop].defaultValue;

      // Go through all tokens and concatenate their values as necessary
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        // Set granular value so that other parts of the code can use this for optimalization opportunities
        result.granularValues = result.granularValues || { };
        result.granularValues[token.prop] = token.value;

        // Use irrelevant tokens for optimalization opportunity
        if (token.isIrrelevant) {
          // Get shortest possible value, fallback to default value
          var tokenShortest = processable[token.prop].shortestValue || processable[token.prop].defaultValue;
          // If the shortest possible value of this token is shorter than the default value of the shorthand, use it instead
          if (tokenShortest.length < valueIfAllDefault.length) {
            valueIfAllDefault = tokenShortest;
          }
        }

        // Omit default / irrelevant value
        if (token.isIrrelevant || (processable[token.prop] && processable[token.prop].defaultValue === token.value)) {
          continue;
        }

        result.value += ' ' + token.value;
      }

      result.value = result.value.trim();
      if (!result.value) {
        result.value = valueIfAllDefault;
      }

      return result;
    },
    // Handles the cases when some or all the fine-grained properties are set to inherit
    takeCareOfInherit: function (innerFunc) {
      return function (prop, tokens, isImportant) {
        // Filter out the inheriting and non-inheriting tokens in one iteration
        var inheritingTokens = [];
        var nonInheritingTokens = [];
        var result2Shorthandable = [];
        var i;
        for (i = 0; i < tokens.length; i++) {
          if (tokens[i].value === 'inherit') {
            inheritingTokens.push(tokens[i]);
            result2Shorthandable.push({
              prop: tokens[i].prop,
              value: processable[tokens[i].prop].defaultValue,
              isImportant: tokens[i].isImportant,
              // Indicate that this property is irrelevant and its value can safely be set to anything else
              isIrrelevant: true
            });
          }
          else {
            nonInheritingTokens.push(tokens[i]);
            result2Shorthandable.push(tokens[i]);
          }
        }

        // When all the tokens are 'inherit'
        if (nonInheritingTokens.length === 0) {
          return {
            prop: prop,
            value: 'inherit',
            isImportant: isImportant
          };
        }
        // When some (but not all) of the tokens are 'inherit'
        else if (inheritingTokens.length > 0) {
          // Result 1. Shorthand just the inherit values and have it overridden with the non-inheriting ones
          var result1 = [{
            prop: prop,
            value: 'inherit',
            isImportant: isImportant
          }].concat(nonInheritingTokens);

          // Result 2. Shorthand every non-inherit value and then have it overridden with the inheriting ones
          var result2 = [innerFunc(prop, result2Shorthandable, isImportant)].concat(inheritingTokens);

          // Return whichever is shorter
          var dl1 = getDetokenizedLength(result1);
          var dl2 = getDetokenizedLength(result2);

          return dl1 < dl2 ? result1 : result2;
        }
        // When none of tokens are 'inherit'
        else {
          return innerFunc(prop, tokens, isImportant);
        }
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
  // * shortestValue: string
  //   Specifies the shortest possible value the property can possibly have.
  //   (Falls back to defaultValue if unspecified.)
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
      putTogether: putTogether.takeCareOfInherit(putTogether.fourUnits),
      defaultValue: '0'
    },
    'margin-top': {
      defaultValue: '0',
      canMerge: canMerge.unit
    },
    'margin-right': {
      defaultValue: '0',
      canMerge: canMerge.unit
    },
    'margin-bottom': {
      defaultValue: '0',
      canMerge: canMerge.unit
    },
    'margin-left': {
      defaultValue: '0',
      canMerge: canMerge.unit
    },
    'padding': {
      components: [
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left'
      ],
      breakUp: breakUp.fourUnits,
      putTogether: putTogether.takeCareOfInherit(putTogether.fourUnits),
      defaultValue: '0'
    },
    'padding-top': {
      defaultValue: '0',
      canMerge: canMerge.unit
    },
    'padding-right': {
      defaultValue: '0',
      canMerge: canMerge.unit
    },
    'padding-bottom': {
      defaultValue: '0',
      canMerge: canMerge.unit
    },
    'padding-left': {
      defaultValue: '0',
      canMerge: canMerge.unit
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
      putTogether: putTogether.takeCareOfInherit(putTogether.bySpacesOmitDefaults),
      defaultValue: '0 0',
      shortestValue: '0'
    },
    'color': {
      canMerge: canMerge.color,
      defaultValue: 'transparent',
      shortestValue: 'red'
    },
    'background-color': {
      // http://www.w3schools.com/cssref/pr_background-color.asp
      canMerge: canMerge.color,
      defaultValue: 'transparent',
      shortestValue: 'red'
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
      defaultValue: '0 0',
      shortestValue: '0'
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
      putTogether: putTogether.takeCareOfInherit(putTogether.bySpacesOmitDefaults),
      defaultValue: 'outside', // can't use 'disc' because that'd override default 'decimal' for <ol>
      shortestValue: 'none'
    },
    'list-style-type' : {
      // http://www.w3schools.com/cssref/pr_list-style-type.asp
      canMerge: canMerge.always,
      shortestValue: 'none',
      defaultValue: '__hack'
      // NOTE: we can't tell the real default value here, it's 'disc' for <ul> and 'decimal' for <ol>
      //       -- this is a hack, but it doesn't matter because this value will be either overridden or it will disappear at the final step anyway
    },
    'list-style-position' : {
      // http://www.w3schools.com/cssref/pr_list-style-position.asp
      canMerge: canMerge.always,
      defaultValue: 'outside',
      shortestValue: 'inside'
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
      putTogether: putTogether.takeCareOfInherit(putTogether.bySpacesOmitDefaults),
      defaultValue: '0'
    },
    'outline-color': {
      // http://www.w3schools.com/cssref/pr_outline-color.asp
      canMerge: canMerge.color,
      defaultValue: 'invert',
      shortestValue: 'red'
    },
    'outline-style': {
      // http://www.w3schools.com/cssref/pr_outline-style.asp
      canMerge: canMerge.always,
      defaultValue: 'none'
    },
    'outline-width': {
      // http://www.w3schools.com/cssref/pr_outline-width.asp
      canMerge: canMerge.unit,
      defaultValue: 'medium',
      shortestValue: '0'
    }
    // TODO: add more
  };
  for (var proc in processable) {
    if (processable.hasOwnProperty(proc)) {
      var currDesc = processable[proc];

      if (currDesc.components instanceof Array && currDesc.components.length) {
        currDesc.isShorthand = true;

        for (var cI = 0; cI < currDesc.components.length; cI++) {
          if (!processable[currDesc.components[cI]]) {
            throw new Error('"' + currDesc.components[cI] + '" is defined as a component of "' + proc + '" but isn\'t defined in processable.');
          }
          processable[currDesc.components[cI]].componentOf = proc;
        }
      }

      currDesc.defaultToken = makeDefaultProperty(proc);
    }
  }
  processable = Object.freeze(processable);

  var isHackValue = function (t) { return t.value === '__hack'; };
  var important = '!important';

  // Tells if the first parameter is a component of the second one
  var isComponentOf = function (t1, t2) {
    if (!processable[t1.prop] || !processable[t2.prop])
      return false;
    if (!(processable[t2.prop].components instanceof Array) || !processable[t2.prop].components.length)
      return false;

    return processable[t2.prop].components.indexOf(t1.prop) >= 0;
  };

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
      var result = {
        prop: prop,
        value: value,
        isImportant: isImportant
      };

      // If this is a shorthand, break up its values
      // NOTE: we need to do this for all shorthands because otherwise we couldn't remove default values from them
      if (processable[prop] && processable[prop].isShorthand) {
        result.isShorthand = true;
        result.components = processable[prop].breakUp(result);
        result.isDirty = true;
      }

      return result;
    });

    return tokens;
  };

  // Transforms tokens back into CSS properties
  var detokenize = function (tokens) {
    // If by mistake the input is not an array, make it an array
    if (!(tokens instanceof Array)) {
      tokens = [tokens];
    }

    // This step takes care of putting together the components of shorthands
    // NOTE: this is necessary to do for every shorthand, otherwise we couldn't remove their default values
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (t.isShorthand && t.isDirty) {
        var news = processable[t.prop].putTogether(t.prop, t.components, t.isImportant);
        Array.prototype.splice.apply(tokens, [i, 1].concat(news));
        t.isDirty = false;
        i--;
      }
    }

    // And now, simply map every token into its string representation and concat them with a semicolon
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
        result += important;
      }

      return result;
    }).join(';');

    return str;
  };

  // Gets the final (detokenized) length of the given tokens
  var getDetokenizedLength = function (tokens) {
    // If by mistake the input is not an array, make it an array
    if (!(tokens instanceof Array)) {
      tokens = [tokens];
    }

    var result = 0;

    // This step takes care of putting together the components of shorthands
    // NOTE: this is necessary to do for every shorthand, otherwise we couldn't remove their default values
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (t.isShorthand && t.isDirty) {
        var news = processable[t.prop].putTogether(t.prop, t.components, t.isImportant);
        Array.prototype.splice.apply(tokens, [i, 1].concat(news));
        t.isDirty = false;
        i--;
        continue;
      }

      if (t.prop) {
        result += t.prop.length;
      }
      if (t.value) {
        result += t.value.length;
      }
      if (t.isImportant) {
        result += important.length;
      }
    }

    return result;
  };

  // Merges same properties
  // https://github.com/GoalSmashers/clean-css/issues/173
  // https://github.com/GoalSmashers/clean-css/issues/168
  var mergeOverrides = function (tokens) {
    var result, can, token, t, i, ii, oldResult, matchingComponent;

    // Filter function used for finding out if `token` can't override another token
    var cantOverrideFilter = function (t) {
      return !(t.prop === token.prop && can(t, token));
    };
    // Used when searching for a component that matches token
    var nameMatchFilter1 = function (x) {
      return x.prop === token.prop;
    };
    // Used when searching for a component that matches t
    var nameMatchFilter2 = function (x) {
      return x.prop === t.prop;
    };

    // Go from the end and always take what the current token can't override as the new result set
    for (result = tokens, i = 0; (ii = result.length - 1 - i) >= 0; i++) {
      token = result[ii];
      //console.log(i, ii, token.prop);
      can = (processable[token.prop] && processable[token.prop].canMerge) || canMerge.sameValue;
      oldResult = result;
      result = [];

      // Special flag which indicates that the current token should be removed
      var removeSelf = false;

      for (var iii = 0; iii < oldResult.length; iii++) {
        t = oldResult[iii];

        // A token can't override itself (checked by reference, not by value)
        // NOTE: except when we explicitly tell it to remove itself
        if (t === token && !removeSelf) {
          result.push(t);
          continue;
        }

        // Only an important token can even try to override tokens that come after it
        if (iii > ii && !token.isImportant) {
          result.push(t);
          continue;
        }

        // A nonimportant token can never override an important one
        if (t.isImportant && !token.isImportant) {
          result.push(t);
          continue;
        }

        if (token.isShorthand && !t.isShorthand && isComponentOf(t, token)) {
          // token (a shorthand) is trying to override t (a component)

          // Find the matching component in the shorthand
          matchingComponent = token.components.filter(nameMatchFilter2)[0];
          can = (processable[t.prop] && processable[t.prop].canMerge) || canMerge.sameValue;
          if (!can(t, matchingComponent)) {
            // The shorthand can't override the component
            result.push(t);
          }
        }
        else if (t.isShorthand && !token.isShorthand && isComponentOf(token, t)) {
          // token (a component) is trying to override a component of t (a shorthand)

          // Find the matching component in the shorthand
          matchingComponent = t.components.filter(nameMatchFilter1)[0];
          if (can(matchingComponent, token)) {
            // The component can override the matching component in the shorthand

            if (!token.isImportant) {
              // The overriding component is non-important which means we can simply include it into the shorthand
              // NOTE: stuff that can't really be included, like inherit, is taken care of at the final step, not here
              matchingComponent.value = token.value;
              // We use the special flag to get rid of the component
              removeSelf = true;
            }
            else {
              // The overriding component is important; sadly we can't get rid of it,
              // but we can still mark the matching component in the shorthand as irrelevant
              matchingComponent.isIrrelevant = true;
            }
            t.isDirty = true;
          }
          result.push(t);
        }
        else if (token.isShorthand && t.isShorthand && token.prop === t.prop) {
          // token is a shorthand and is trying to override another instance of the same shorthand

          // Can only override other shorthand when each of its components can override each of the other's components
          for (var iiii = 0; iiii < t.components.length; iiii++) {
            can = (processable[t.components[iiii].prop] && processable[t.components[iiii].prop].canMerge) || canMerge.sameValue;
            if (!can(t.components[iiii], token.components[iiii])) {
              result.push(t);
              break;
            }
          }
        }
        else if (cantOverrideFilter(t, iii)) {
          // in every other case, use the override mechanism
          result.push(t);
        }
      }
      if (removeSelf) {
        i--;
      }
    }

    return result;
  };

  // Compacts the tokens by transforming properties into their shorthand notations when possible
  // https://github.com/GoalSmashers/clean-css/issues/134
  var compactToShorthands = function(tokens, isImportant) {
    // Contains the components found so far, grouped by shorthand name
    var componentsSoFar = { };

    // Initializes a prop in componentsSoFar
    var initSoFar = function (shprop, last, clearAll) {
      var found = {};
      var shorthandPosition;

      if (!clearAll && componentsSoFar[shprop]) {
        for (var i = 0; i < processable[shprop].components.length; i++) {
          var prop = processable[shprop].components[i];
          found[prop] = [];

          if (componentsSoFar[shprop].found[prop]) {
            for (var ii = 0; ii < componentsSoFar[shprop].found[prop].length; ii++) {
              var comp = componentsSoFar[shprop].found[prop][ii];

              if (!comp.isMarkedForDeletion) {
                found[prop].push(comp);
                if (comp.position && (!shorthandPosition || comp.position < shorthandPosition)) {
                  shorthandPosition = comp.position;
                }
              }
            }
          }
        }
      }
      componentsSoFar[shprop] = {
        lastShorthand: last,
        found: found,
        shorthandPosition: shorthandPosition
      };
    };

    // Adds a component to componentsSoFar
    var addComponentSoFar = function (token, index) {
      var shprop = processable[token.prop].componentOf;
      if (!componentsSoFar[shprop])
        initSoFar(shprop);
      if (!componentsSoFar[shprop].found[token.prop])
        componentsSoFar[shprop].found[token.prop] = [];

      // Add the newfound component to componentsSoFar
      componentsSoFar[shprop].found[token.prop].push(token);

      if (!componentsSoFar[shprop].shorthandPosition && index) {
        // If the haven't decided on where the shorthand should go, put it in the place of this component
        componentsSoFar[shprop].shorthandPosition = index;
      }
    };

    // Tries to compact a prop in componentsSoFar
    var compactSoFar = function (prop) {
      var i;

      // Check basics
      if (!componentsSoFar[prop] || !componentsSoFar[prop].found)
        return false;

      // Find components for the shorthand
      var components = [];
      var realComponents = [];
      for (i = 0; i < processable[prop].components.length; i++) {
        // Get property name
        var pp = processable[prop].components[i];

        if (componentsSoFar[prop].found[pp] && componentsSoFar[prop].found[pp].length) {
          // We really found it
          var foundRealComp = componentsSoFar[prop].found[pp][0];
          components.push(foundRealComp);
          if (foundRealComp.isReal !== false) {
            realComponents.push(foundRealComp);
          }
        }
        else if (componentsSoFar[prop].lastShorthand) {
          // It's defined in the previous shorthand
          var c = makeDefaultProperty(pp, isImportant, componentsSoFar[prop].lastShorthand.components[i].value);
          components.push(c);
        }
        else {
          // Couldn't find this component at all
          return false;
        }
      }

      if (realComponents.length === 0) {
        // Couldn't find enough components, sorry
        return false;
      }

      if (realComponents.length === processable[prop].components.length) {
        // When all the components are from real values, only allow shorthanding if their understandability allows it
        // This is the case when every component can override their default values, or when all of them use the same function

        var canOverrideDefault = true;
        var functionNameMatches = true;
        var functionName;

        for (var ci = 0; ci < realComponents.length; ci++) {
          var rc = realComponents[ci];

          if (!processable[rc.prop].canMerge(processable[rc.prop].defaultToken, rc)) {
            canOverrideDefault = false;
          }
          var iop = rc.value.indexOf('(');
          if (iop >= 0) {
            var otherFunctionName = rc.value.substring(0, iop);
            if (functionName)
              functionNameMatches = functionNameMatches && otherFunctionName === functionName;
            else
              functionName = otherFunctionName;
          }
        }

        if (!canOverrideDefault || !functionNameMatches)
          return false;
      }

      // Compact the components into a shorthand
      var compacted = processable[prop].putTogether(prop, components, isImportant);
      if (!(compacted instanceof Array)) {
        compacted = [compacted];
      }

      var compactedLength = getDetokenizedLength(compacted);
      var authenticLength = getDetokenizedLength(realComponents);

      // TODO: unit test for hacked value
      if (realComponents.length === processable[prop].components.length || compactedLength < authenticLength || components.some(isHackValue)) {
        compacted[0].isShorthand = true;
        compacted[0].components = processable[prop].breakUp(compacted[0]);

        // Mark the granular components for deletion
        for (i = 0; i < realComponents.length; i++) {
          realComponents[i].isMarkedForDeletion = true;
        }

        // Mark the position of the new shorthand
        tokens[componentsSoFar[prop].shorthandPosition].replaceWith = compacted;

        // Reinitialize the thing for further compacting
        initSoFar(prop, compacted[0]);
        for (i = 1; i < compacted.length; i++) {
          addComponentSoFar(compacted[i]);
        }

        // Yes, we can keep the new shorthand!
        return true;
      }

      return false;
    };

    // Tries to compact all properties currently in componentsSoFar
    var compactAllSoFar = function () {
      for (var i in componentsSoFar) {
        if (componentsSoFar.hasOwnProperty(i)) {
          while (compactSoFar(i)) { }
        }
      }
    };

    var i, token;

    // Go through each token and collect components for each shorthand as we go on
    for (i = 0; i < tokens.length; i++) {
      token = tokens[i];
      if (token.isMarkedForDeletion) {
        continue;
      }
      if (!processable[token.prop]) {
        // We don't know what it is, move on
        continue;
      }
      if (processable[token.prop].isShorthand) {
        // Found an instance of a full shorthand
        // NOTE: we should NOT mix together tokens that come before and after the shorthands

        if (token.isImportant === isImportant) {
          // Try to compact what we've found so far
          while (compactSoFar(token.prop)) { }
          // Reset
          initSoFar(token.prop, token, true);
        }

        // TODO: test case for shorthanding boundaries
        // TODO: what happens if the importantness of the shorthand isn't the same as isImportant parameter?
      }
      else if (processable[token.prop].componentOf) {
        // Found a component of a shorthand
        if (token.isImportant === isImportant) {
          // Same importantness
          token.position = i;
          addComponentSoFar(token, i);
        }
        else if (!isImportant && token.isImportant) {
          // Use importants for optimalization opportunities
          // https://github.com/GoalSmashers/clean-css/issues/184
          var importantTrickComp = makeDefaultProperty(token.prop, isImportant, token.value);
          importantTrickComp.isIrrelevant = true;
          importantTrickComp.isReal = false;
          addComponentSoFar(importantTrickComp);
        }
      }
      else {
        // This is not a shorthand and not a component, don't care about it
        continue;
      }
    }

    // Perform all possible compactions
    compactAllSoFar();

    // Process the results - throw away stuff marked for deletion, insert compacted things, etc.
    var result = [];
    for (i = 0; i < tokens.length; i++) {
      token = tokens[i];

      if (token.replaceWith) {
        for (var ii = 0; ii < token.replaceWith.length; ii++) {
          result.push(token.replaceWith[ii]);
        }
      }
      if (!token.isMarkedForDeletion) {
        result.push(token);
      }

      token.isMarkedForDeletion = false;
      token.replaceWith = null;
    }

    return result;
  };

  // Processes the input by calling the other functions
  // input is the content of a selector block (excluding the braces), NOT a full selector
  var process = function (input) {
    var tokens = tokenize(input);

    tokens = mergeOverrides(tokens);
    tokens = compactToShorthands(tokens, false);
    tokens = compactToShorthands(tokens, true);

    return detokenize(tokens);
  };

  // Return the process function as module.exports
  return process;

})();

