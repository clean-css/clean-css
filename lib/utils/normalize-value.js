var FALSE_KEYWORD_1 = 'false';
var FALSE_KEYWORD_2 = 'off';
var TRUE_KEYWORD_1 = 'true';
var TRUE_KEYWORD_2 = 'on';

function normalizeValue(value) {
  switch (value) {
  case FALSE_KEYWORD_1:
  case FALSE_KEYWORD_2:
    return false;
  case TRUE_KEYWORD_1:
  case TRUE_KEYWORD_2:
    return true;
  default:
    return value;
  }
}

module.exports = normalizeValue;
