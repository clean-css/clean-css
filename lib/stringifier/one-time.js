var helpers = require('./helpers');

function store(token, context) {
  context.output.push(typeof token == 'string' ? token : token[0]);
}

function context() {
  return {
    output: [],
    store: store
  };
}

function body(tokens) {
  var fakeContext = context();
  helpers.body(tokens, fakeContext);
  return fakeContext.output.join('');
}

function selectors(tokens) {
  var fakeContext = context();
  helpers.selectors(tokens, fakeContext);
  return fakeContext.output.join('');
}

function value(tokens, position) {
  var fakeContext = context();
  helpers.value(tokens, position, true, fakeContext);
  return fakeContext.output.join('');
}

module.exports = {
  body: body,
  selectors: selectors,
  value: value
};
