var SourceMapGenerator = require('source-map').SourceMapGenerator;
var SourceMap = require('../utils/source-maps');

var lineBreak = require('os').EOL;

function Rebuilder(options, restoreCallback, inputMapTracker) {
  this.column = 0;
  this.line = 1;
  this.output = [];
  this.keepBreaks = options.keepBreaks;
  this.restore = restoreCallback;
  this.inputMapTracker = inputMapTracker;
  this.outputMap = new SourceMapGenerator();
}

Rebuilder.prototype.rebuildValue = function (list, separator) {
  var escaped = 0;

  for (var i = 0, l = list.length; i < l; i++) {
    var el = list[i];

    if (el.value.indexOf('__ESCAPED_') === 0) {
      this.store(el);
      escaped++;

      if (i === l - 1 && escaped > 0)
        this.output.splice(this.output.length - escaped - 1, 1);
    } else {
      this.store(el);
      this.store(i < l - 1 ? separator : '');
      escaped = 0;
    }
  }
};

Rebuilder.prototype.store = function (token) {
  var value = typeof token == 'string' ?
    token :
    token.value.indexOf('_') > -1 ? this.restore(token.value) : token.value;

  this.track(value, token.metadata);
  this.output.push(value);
};

Rebuilder.prototype.rebuildList = function (tokens, isFlatBlock) {
  var joinCharacter = isFlatBlock ? ';' : (this.keepBreaks ? lineBreak : '');

  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];

    if (token.kind === 'text' || token.kind == 'at-rule') {
      this.store(token);
      continue;
    }

    // FIXME: broken due to joining/splitting
    if (token.body && (token.body.length === 0 || (token.body.length == 1 && token.body[0].value === '')))
      continue;

    if (token.kind == 'block') {
      if (token.body.length > 0) {
        this.rebuildValue([{ value: token.value, metadata: token.metadata }], '');
        this.store('{');
        if (token.isFlatBlock)
          this.rebuildValue(token.body, ';');
        else
          this.rebuildList(token.body, false);
        this.store('}');
      }
    } else {
      this.rebuildValue(token.value, ',');
      this.store('{');
      this.rebuildValue(token.body, ';');
      this.store('}');
    }

    this.store(joinCharacter);
  }
};

Rebuilder.prototype.track = function (value, metadata) {
  if (metadata)
    this.trackMetadata(metadata);

  var parts = value.split('\n');
  this.line += parts.length - 1;
  this.column = parts.length > 1 ? 0 : (this.column + parts.pop().length);
};

Rebuilder.prototype.trackMetadata = function (metadata) {
  this.outputMap.addMapping({
    generated: {
      line: this.line,
      column: this.column
    },
    source: metadata.source || SourceMap.unknownSource,
    original: metadata.original
  });
};

function SourceMapStringifier(options, restoreCallback, inputMapTracker) {
  this.rebuilder = new Rebuilder(options, restoreCallback, inputMapTracker);
}

SourceMapStringifier.prototype.toString = function (tokens) {
  this.rebuilder.rebuildList(tokens);

  return {
    sourceMap: this.rebuilder.outputMap,
    styles: this.rebuilder.output.join('').trim()
  };
};

module.exports = SourceMapStringifier;
