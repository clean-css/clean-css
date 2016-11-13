function tidyAtRule(value) {
  return value
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = tidyAtRule;
