// Validates various CSS property values

var Splitter = require('../utils/splitter');

var widthKeywords = ['thin', 'thick', 'medium', 'inherit', 'initial'];
var allUnits = ['px', '%', 'em', 'rem', 'in', 'cm', 'mm', 'ex', 'pt', 'pc', 'vw', 'vh', 'vmin', 'vmax'];
var cssUnitRegexStr = '(\\-?\\.?\\d+\\.?\\d*(' + allUnits.join('|') + '|)|auto|inherit)';
var cssCalcRegexStr = '(\\-moz\\-|\\-webkit\\-)?calc\\([^\\)]+\\)';
var cssFunctionNoVendorRegexStr = '[A-Z]+(\\-|[A-Z]|[0-9])+\\(([A-Z]|[0-9]|\\ |\\,|\\#|\\+|\\-|\\%|\\.|\\(|\\))*\\)';
var cssFunctionVendorRegexStr = '\\-(\\-|[A-Z]|[0-9])+\\(([A-Z]|[0-9]|\\ |\\,|\\#|\\+|\\-|\\%|\\.|\\(|\\))*\\)';
var cssVariableRegexStr = 'var\\(\\-\\-[^\\)]+\\)';
var cssFunctionAnyRegexStr = '(' + cssVariableRegexStr + '|' + cssFunctionNoVendorRegexStr + '|' + cssFunctionVendorRegexStr + ')';
var cssUnitOrCalcRegexStr = '(' + cssUnitRegexStr + '|' + cssCalcRegexStr + ')';
var cssUnitAnyRegexStr = '(none|' + widthKeywords.join('|') + '|' + cssUnitRegexStr + '|' + cssVariableRegexStr + '|' + cssFunctionNoVendorRegexStr + '|' + cssFunctionVendorRegexStr + ')';

var cssFunctionNoVendorRegex = new RegExp('^' + cssFunctionNoVendorRegexStr + '$', 'i');
var cssFunctionVendorRegex = new RegExp('^' + cssFunctionVendorRegexStr + '$', 'i');
var cssVariableRegex = new RegExp('^' + cssVariableRegexStr + '$', 'i');
var cssFunctionAnyRegex = new RegExp('^' + cssFunctionAnyRegexStr + '$', 'i');
var cssUnitRegex = new RegExp('^' + cssUnitRegexStr + '$', 'i');
var cssUnitOrCalcRegex = new RegExp('^' + cssUnitOrCalcRegexStr + '$', 'i');
var cssUnitAnyRegex = new RegExp('^' + cssUnitAnyRegexStr + '$', 'i');

var backgroundRepeatKeywords = ['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'inherit'];
var backgroundAttachmentKeywords = ['inherit', 'scroll', 'fixed', 'local'];
var backgroundPositionKeywords = ['center', 'top', 'bottom', 'left', 'right'];
var backgroundSizeKeywords = ['contain', 'cover'];
var backgroundBoxKeywords = ['border-box', 'content-box', 'padding-box'];
var styleKeywords = ['auto', 'inherit', 'hidden', 'none', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset'];
var listStyleTypeKeywords = ['armenian', 'circle', 'cjk-ideographic', 'decimal', 'decimal-leading-zero', 'disc', 'georgian', 'hebrew', 'hiragana', 'hiragana-iroha', 'inherit', 'katakana', 'katakana-iroha', 'lower-alpha', 'lower-greek', 'lower-latin', 'lower-roman', 'none', 'square', 'upper-alpha', 'upper-latin', 'upper-roman'];
var listStylePositionKeywords = ['inside', 'outside', 'inherit'];

// var compatibleCssUnitRegex;
// var compatibleCssUnitAnyRegex;

//   var validator = {
//     // FIXME: we need a proper OO here
//     setCompatibility: function (compatibility) {
//       if (compatibility.units.rem) {
//         compatibleCssUnitRegex = cssUnitRegex;
//         compatibleCssUnitAnyRegex = cssUnitAnyRegex;
//         return;
//       }

//       var validUnits = allUnits.slice(0).filter(function (value) {
//         return value != 'rem';
//       });

//       var compatibleCssUnitRegexStr = '(\\-?\\.?\\d+\\.?\\d*(' + validUnits.join('|') + ')|auto|inherit)';
//       compatibleCssUnitRegex = new RegExp('^' + compatibleCssUnitRegexStr + '$', 'i');
//       compatibleCssUnitAnyRegex = new RegExp('^(none|' + widthKeywords.join('|') + '|' + compatibleCssUnitRegexStr + '|' + cssVariableRegexStr + '|' + cssFunctionNoVendorRegexStr + '|' + cssFunctionVendorRegexStr + ')$', 'i');
//     }

function isValidHexColor(s) {
  return (s.length === 4 || s.length === 7) && s[0] === '#';
}
function isValidRgbaColor(s) {
  s = s.split(' ').join('');
  return s.length > 0 && s.indexOf('rgba(') === 0 && s.indexOf(')') === s.length - 1;
}
function isValidHslaColor(s) {
  s = s.split(' ').join('');
  return s.length > 0 && s.indexOf('hsla(') === 0 && s.indexOf(')') === s.length - 1;
}
function isValidNamedColor(s) {
  // We don't really check if it's a valid color value, but allow any letters in it
  return s !== 'auto' && (s === 'transparent' || s === 'inherit' || /^[a-zA-Z]+$/.test(s));
}
function isValidVariable(s) {
  return cssVariableRegex.test(s);
}
function isValidColor(s) {
  return isValidNamedColor(s) || isValidHexColor(s) || isValidRgbaColor(s) || isValidHslaColor(s) || isValidVariable(s) || isValidVendorPrefixedValue(s);
}
function isValidUrl(s) {
  // NOTE: at this point all URLs are replaced with placeholders by clean-css, so we check for those placeholders
  return s.indexOf('__ESCAPED_URL_CLEAN_CSS') === 0;
}
function isValidUnit(s) {
  return cssUnitAnyRegex.test(s);
}
function isValidUnitWithoutFunction(s) {
  return cssUnitRegex.test(s);
}
function isValidAndCompatibleUnit(s) {
  return cssUnitAnyRegex.test(s);
}
function isValidAndCompatibleUnitWithoutFunction(s) {
  return cssUnitRegex.test(s);
}
function isValidFunctionWithoutVendorPrefix(s) {
  return cssFunctionNoVendorRegex.test(s);
}
function isValidFunctionWithVendorPrefix(s) {
  return cssFunctionVendorRegex.test(s);
}
function isValidFunction(s) {
  return cssFunctionAnyRegex.test(s);
}
function isValidBackgroundRepeat(s) {
  return backgroundRepeatKeywords.indexOf(s) >= 0 || isValidVariable(s);
}
function isValidBackgroundAttachment(s) {
  return backgroundAttachmentKeywords.indexOf(s) >= 0 || isValidVariable(s);
}
function isValidBackgroundBox(s) {
  return backgroundBoxKeywords.indexOf(s) >= 0 || isValidVariable(s);
}
function isValidBackgroundPositionPart(s) {
  return backgroundPositionKeywords.indexOf(s) >= 0 || cssUnitOrCalcRegex.test(s) || isValidVariable(s);
}
function isValidBackgroundPosition(s) {
  if (s === 'inherit')
    return true;

  var parts = s.split(' ');
  for (var i = 0, l = parts.length; i < l; i++) {
    if (parts[i] === '')
      continue;
    if (isValidBackgroundPositionPart(parts[i]) || isValidVariable(parts[i]))
      continue;

    return false;
  }

  return true;
}
function isValidBackgroundSizePart(s) {
  return backgroundSizeKeywords.indexOf(s) >= 0 || cssUnitRegex.test(s) || isValidVariable(s);
}
function isValidBackgroundPositionAndSize(s) {
  if (s.indexOf('/') < 0)
    return false;

  var twoParts = new Splitter('/').split(s);
  return isValidBackgroundSizePart(twoParts.pop()) && isValidBackgroundPositionPart(twoParts.pop());
}
function isValidListStyleType(s) {
  return listStyleTypeKeywords.indexOf(s) >= 0 || isValidVariable(s);
}
function isValidListStylePosition(s) {
  return listStylePositionKeywords.indexOf(s) >= 0 || isValidVariable(s);
}
function isValidStyle(s) {
  return styleKeywords.indexOf(s) >= 0 || isValidVariable(s);
}
function isValidWidth(s) {
  return isValidUnit(s) || widthKeywords.indexOf(s) >= 0 || isValidVariable(s);
}
function isValidVendorPrefixedValue(s) {
  return /^-([A-Za-z0-9]|-)*$/gi.test(s);
}
function areSameFunction(a, b) {
  if (!isValidFunction(a) || !isValidFunction(b))
    return false;

  var f1name = a.substring(0, a.indexOf('('));
  var f2name = b.substring(0, b.indexOf('('));

  return f1name === f2name;
}

module.exports = {
  isValidHexColor: isValidHexColor,
  isValidRgbaColor: isValidRgbaColor,
  isValidHslaColor: isValidHslaColor,
  isValidNamedColor: isValidNamedColor,
  isValidVariable: isValidVariable,
  isValidColor: isValidColor,
  isValidUrl: isValidUrl,
  isValidUnit: isValidUnit,
  isValidUnitWithoutFunction: isValidUnitWithoutFunction,
  isValidAndCompatibleUnit: isValidAndCompatibleUnit,
  isValidAndCompatibleUnitWithoutFunction: isValidAndCompatibleUnitWithoutFunction,
  isValidFunctionWithoutVendorPrefix: isValidFunctionWithoutVendorPrefix,
  isValidFunctionWithVendorPrefix: isValidFunctionWithVendorPrefix,
  isValidFunction: isValidFunction,
  isValidBackgroundRepeat: isValidBackgroundRepeat,
  isValidBackgroundAttachment: isValidBackgroundAttachment,
  isValidBackgroundBox: isValidBackgroundBox,
  isValidBackgroundPositionPart: isValidBackgroundPositionPart,
  isValidBackgroundPosition: isValidBackgroundPosition,
  isValidBackgroundSizePart: isValidBackgroundSizePart,
  isValidBackgroundPositionAndSize: isValidBackgroundPositionAndSize,
  isValidListStyleType: isValidListStyleType,
  isValidListStylePosition: isValidListStylePosition,
  isValidStyle: isValidStyle,
  isValidWidth: isValidWidth,
  isValidVendorPrefixedValue: isValidVendorPrefixedValue,
  areSameFunction: areSameFunction
};
