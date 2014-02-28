
// Validates various CSS property values

module.exports = (function () {
  // Regexes used for stuff
  var cssUnitRegexStr =             '(\\-?\\.?\\d+\\.?\\d*(px|%|em|rem|in|cm|mm|ex|pt|pc|)|auto|inherit)';
  var cssFunctionNoVendorRegexStr = '[A-Z]+(\\-|[A-Z]|[0-9])+\\(([A-Z]|[0-9]|\\ |\\,|\\#|\\+|\\-|\\%|\\.)*\\)';
  var cssFunctionVendorRegexStr =   '\\-(\\-|[A-Z]|[0-9])+\\(([A-Z]|[0-9]|\\ |\\,|\\#|\\+|\\-|\\%|\\.)*\\)';
  var cssFunctionAnyRegexStr =      '(' + cssFunctionNoVendorRegexStr + '|' + cssFunctionVendorRegexStr + ')';
  var cssUnitAnyRegexStr =          '(' + cssUnitRegexStr + '|' + cssFunctionNoVendorRegexStr + '|' + cssFunctionVendorRegexStr + ')';

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

  validator.cssUnitRegexStr = cssUnitRegexStr;
  validator.cssFunctionNoVendorRegexStr = cssFunctionNoVendorRegexStr;
  validator.cssFunctionVendorRegexStr = cssFunctionVendorRegexStr;
  validator.cssFunctionAnyRegexStr = cssFunctionAnyRegexStr;
  validator.cssUnitAnyRegexStr = cssUnitAnyRegexStr;

  return validator;
})();
