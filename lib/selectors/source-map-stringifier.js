var SourceMapGenerator = require('source-map').SourceMapGenerator;

var lineBreak = require('os').EOL;
var unknownSource = '$stdin';

function Rebuilder(options, restoreCallback, inputMapTracker) {
  this.column = 0;
  this.line = 1;
  this.output = [];
  this.keepBreaks = options.keepBreaks;
  this.sourceMapInlineSources = options.sourceMapInlineSources;
  this.restore = restoreCallback;
  this.inputMapTracker = inputMapTracker;
  this.outputMap = new SourceMapGenerator();
}

Rebuilder.prototype.rebuildValue = function (elements, separator) {
  var escaped = 0;

  for (var i = 0, l = elements.length; i < l; i++) {
    var element = elements[i];

    if (element[0].indexOf('__ESCAPED_') === 0) {
      this.store(element[0]);
      escaped++;

      if (i === l - 1 && escaped > 0)
        this.output.splice(this.output.length - escaped - 1, 1);
    } else {
      this.store(element);
      this.store(i < l - 1 ? separator : '');
      escaped = 0;
    }
  }
};

Rebuilder.prototype.store = function (element) {
  var fromString = typeof element == 'string';
  var value = fromString ? element : element[0];

  if (value.indexOf('_') > -1)
    value = this.restore(value);

  this.track(value, fromString ? null : element);
  this.output.push(value);
};

Rebuilder.prototype.rebuildList = function (tokens, isFlatBlock) {
  var joinCharacter = isFlatBlock ? ';' : (this.keepBreaks ? lineBreak : '');

  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];

    switch (token[0]) {
      case 'at-rule':
      case 'text':
        this.store(token[1][0]);
        break;
      case 'block':
        this.rebuildValue([token[1]], '');
        this.store('{');
        this.rebuildList(token[2], false);
        this.store('}');
        this.store(joinCharacter);
        break;
      case 'flat-block':
        this.rebuildValue([token[1]], '');
        this.store('{');
        this.rebuildValue(token[2], ';');
        this.store('}');
        this.store(joinCharacter);
        break;
      default:
        this.rebuildValue(token[1], ',');
        this.store('{');
        this.rebuildValue(token[2], ';');
        this.store('}');
        this.store(joinCharacter);
    }
  }
};

Rebuilder.prototype.track = function (value, element) {
  if (element)
    this.trackMetadata(element);

  var parts = value.split('\n');
  this.line += parts.length - 1;
  this.column = parts.length > 1 ? 0 : (this.column + parts.pop().length);
};

Rebuilder.prototype.trackMetadata = function (element) {
  var source = element[3] || unknownSource;

  this.outputMap.addMapping({
    generated: {
      line: this.line,
      column: this.column
    },
    source: source,
    original: {
      line: element[1],
      column: element[2]
    }
  });

  if (element[4])
    this.outputMap.setSourceContent(source, element[4][element[3]]);
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
